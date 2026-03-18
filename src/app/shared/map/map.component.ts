import { Component, Input, OnInit, OnDestroy, OnChanges, SimpleChanges, ElementRef, ViewChild, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

declare var L: any;

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div #mapContainer class="w-full h-full rounded-xl overflow-hidden shadow-inner border border-[#2a2d35]" 
         [class.cursor-crosshair]="selectionMode"
         style="min-height: 400px; background: #1a1c23;">
    </div>
  `,
  styles: [`
    :host { display: block; width: 100%; height: 100%; }
    .leaflet-container { background: #1a1c23 !important; }
    .cursor-crosshair { cursor: crosshair !important; }
  `]
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges {
  @ViewChild('mapContainer') mapContainer!: ElementRef;

  @Input() center: [number, number] = [33.5731, -7.5898]; // Default Casablanca
  @Input() zoom: number = 6;
  @Input() markers: any[] = []; // [{lat, lng, label, color}]
  @Input() polylines: any[] = []; 
  @Input() selectionMode: boolean = false;
  
  @Output() mapClick = new EventEmitter<{lat: number, lng: number}>();

  private map: any;
  private leafletMarkers: any[] = [];
  private leafletPolyline: any;

  ngOnInit() {}

  ngAfterViewInit() {
    this.initMap();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.map) {
      if (changes['markers']) this.updateMarkers();
      if (changes['polylines']) this.updatePolylines();
      if (changes['center'] && !changes['center'].firstChange) {
        this.map.panTo(this.center);
      }
    }
  }

  private initMap() {
    if (!this.mapContainer) return;

    this.map = L.map(this.mapContainer.nativeElement, {
        zoomControl: true,
        attributionControl: false
    }).setView(this.center, this.zoom);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 20
    }).addTo(this.map);

    this.map.on('click', (e: any) => {
        if (this.selectionMode) {
            this.mapClick.emit({ lat: e.latlng.lat, lng: e.latlng.lng });
        }
    });

    this.updateMarkers();
    this.updatePolylines();
  }

  private createColoredIcon(color: string) {
    return L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5);"></div>`,
      iconSize: [12, 12],
      iconAnchor: [6, 6]
    });
  }

  private updateMarkers() {
    if (!this.map) return;
    
    // Clear existing
    this.leafletMarkers.forEach(m => this.map.removeLayer(m));
    this.leafletMarkers = [];

    this.markers.forEach(m => {
      if (m.lat === null || m.lat === undefined || m.lng === null || m.lng === undefined) {
        return; // Skip invalid markers
      }
      
      const options: any = {};
      if (m.color) {
        options.icon = this.createColoredIcon(m.color);
      }
      
      try {
        const marker = L.marker([m.lat, m.lng], options).addTo(this.map);
        if (m.label) {
          marker.bindPopup(`
            <div style="color: #1a1c23; font-weight: 600;">
              ${m.label}
            </div>
          `);
        }
        this.leafletMarkers.push(marker);
      } catch (e) {
        console.error('Error creating marker', e, m);
      }
    });
  }

  private leafletPolylines: any[] = [];

  private updatePolylines() {
    if (!this.map) return;

    // Clear existing
    this.leafletPolylines.forEach(p => this.map.removeLayer(p));
    this.leafletPolylines = [];

    if (this.polylines && this.polylines.length > 0) {
      // Check if it's an array of coordinate arrays or an array of path objects
      const isMulti = this.polylines[0] && this.polylines[0].path;

      if (isMulti) {
        this.polylines.forEach(pData => {
            if (pData.path && pData.path.length > 0) {
                const poly = L.polyline(pData.path, {
                    color: pData.color || '#10b981',
                    weight: pData.weight || 4,
                    opacity: pData.opacity || 0.8,
                    smoothFactor: 1
                }).addTo(this.map);
                this.leafletPolylines.push(poly);
            }
        });
      } else {
        const poly = L.polyline(this.polylines, {
            color: '#10b981',
            weight: 4,
            opacity: 0.8,
            smoothFactor: 1
        }).addTo(this.map);
        this.leafletPolylines.push(poly);
      }
      
      if (this.leafletPolylines.length > 0) {
        const bounds = L.featureGroup(this.leafletPolylines).getBounds();
        this.map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
  }
}
