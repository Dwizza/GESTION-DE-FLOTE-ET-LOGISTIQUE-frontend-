import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DriverService } from '../../../core/services/driver.service';
import { TripResponse } from '../../../core/models/trip.model';
import { MapComponent } from '../../../shared/map/map.component';
import { TrackingService } from '../../../core/services/tracking.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-driver-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MapComponent],
  template: `
    <div class="space-y-8 pb-12">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
            <div class="flex items-center gap-3 mb-1">
                <span class="live-dot" [class.active]="watchId !== null"></span>
                <span class="text-xs font-mono uppercase tracking-widest" [style.color]="watchId !== null ? '#10b981' : '#4b5563'">
                    {{ watchId !== null ? 'SUIVI GPS ACTIF' : 'VOTRE CENTRE DE CONTRÔLE' }}
                </span>
            </div>
            <h1 class="section-title">Tableau de Bord</h1>
            <p class="section-subtitle">Gérez vos missions et suivez vos livraisons en temps réel</p>
        </div>
        <div class="flex items-center gap-3">
             <button (click)="loadData()" class="btn-fleet-ghost">
                <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Actualiser
            </button>
        </div>
      </div>

      <!-- Active Mission Highlight -->
      <div *ngIf="activeTrip" class="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-in-up">
        <div class="lg:col-span-2 fleet-card p-0 overflow-hidden relative">
            <div class="absolute top-0 left-0 right-0 h-1.5 bg-blue-500"></div>
            
            <div class="p-6 border-b border-[#1e2025] flex items-center justify-between bg-[#1a1c23]">
                <div class="flex items-center gap-4">
                    <div class="h-12 w-12 rounded-xl flex items-center justify-center shadow-lg"
                        style="background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.2);">
                        <svg class="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <div>
                        <h2 class="text-lg font-bold text-white uppercase tracking-tight">Mission Active: {{ activeTrip.reference }}</h2>
                        <p class="text-xs font-mono text-blue-400/80">EN COURS D'EXÉCUTION</p>
                    </div>
                </div>
                <button (click)="completeTrip(activeTrip)" class="btn-fleet px-6"
                    style="background: linear-gradient(135deg, #10b981, #059669); box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);">
                    Terminer la Mission
                </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2">
                <div class="p-6 space-y-6">
                    <div class="space-y-4">
                        <div class="flex items-center gap-3">
                            <div class="h-8 w-8 rounded-lg bg-[#141518] border border-[#2a2d35] flex items-center justify-center text-gray-400">
                                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <div>
                                <p class="text-[10px] font-mono text-gray-500 uppercase">Client</p>
                                <p class="text-sm font-semibold text-gray-200">{{ activeTrip.client.companyName }}</p>
                            </div>
                        </div>

                        <div class="flex items-center gap-3">
                            <div class="h-8 w-8 rounded-lg bg-[#141518] border border-[#2a2d35] flex items-center justify-center text-gray-400">
                                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                                </svg>
                            </div>
                            <div>
                                <p class="text-[10px] font-mono text-gray-500 uppercase">Véhicule</p>
                                <p class="text-sm font-semibold text-gray-200" *ngIf="activeTrip.trucks && activeTrip.trucks.length > 0">
                                    {{ activeTrip.trucks[0].brand }} {{ activeTrip.trucks[0].registrationNumber }}
                                </p>
                            </div>
                        </div>

                        <div class="flex items-center gap-3">
                            <div class="h-8 w-8 rounded-lg bg-[#141518] border border-[#2a2d35] flex items-center justify-center text-gray-400">
                                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <p class="text-[10px] font-mono text-gray-500 uppercase">Départ</p>
                                <p class="text-sm font-semibold text-gray-200">{{ activeTrip.startDate | date:'dd MMM, HH:mm' }}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="h-[300px] border-l border-[#1e2025] relative">
                    <app-map [markers]="activeMarkers" [polylines]="activePolylines" class="block h-full w-full"></app-map>
                </div>
            </div>
        </div>

        <!-- Next Mission or Empty -->
        <div class="fleet-card p-6 flex flex-col">
            <h3 class="text-sm font-display font-bold text-gray-300 mb-6 uppercase tracking-wider">Prochaine Mission</h3>
            <div *ngIf="nextTrip; else noNextTrip" class="space-y-6 flex-1 flex flex-col">
                <div class="p-4 rounded-xl bg-[#1a1c23] border border-[#2a2d35] relative">
                    <span class="absolute -top-2 left-4 px-2 bg-[#1a1c23] text-[9px] font-bold text-amber-500 border border-amber-500/30 rounded shadow-sm">À VENIR</span>
                    <h4 class="text-base font-bold text-white mb-1">{{ nextTrip.reference }}</h4>
                    <p class="text-xs text-gray-500">{{ nextTrip.client.companyName }}</p>
                </div>
                
                <div class="flex-1 space-y-4">
                    <div class="flex justify-between items-center text-xs">
                        <span class="text-gray-500 uppercase font-mono">Distance Est.</span>
                        <span class="text-gray-300 font-bold">-- km</span>
                    </div>
                    <div class="flex justify-between items-center text-xs">
                        <span class="text-gray-500 uppercase font-mono">Date Prévue</span>
                        <span class="text-gray-300 font-bold">{{ nextTrip.startDate | date:'shortTime' }}</span>
                    </div>
                </div>

                <button (click)="acceptTrip(nextTrip)" class="btn-fleet w-full mt-auto"
                    style="background: linear-gradient(135deg, #f59e0b, #d97706); box-shadow: 0 4px 12px rgba(245, 158, 11, 0.2);">
                    Démarrer la Mission
                </button>
            </div>
            <ng-template #noNextTrip>
                <div class="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4">
                    <div class="h-16 w-16 rounded-full bg-[#141518] border border-[#2a2d35] flex items-center justify-center text-gray-600">
                        <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4a2 2 0 012-2m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                    </div>
                    <p class="text-sm text-gray-500">Aucune mission planifiée pour le moment.</p>
                </div>
            </ng-template>
        </div>
      </div>

      <!-- Metrics -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="metric-card group overflow-hidden">
          <div class="flex items-start justify-between mb-3 relative z-10">
            <div class="h-10 w-10 rounded-lg flex items-center justify-center transition-all group-hover:scale-110"
                 style="background: rgba(59,130,246,0.1); border: 1px solid rgba(59,130,246,0.2);">
                <svg class="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
            </div>
            <div class="text-[10px] font-mono text-blue-400/50 uppercase tracking-widest">Temps Réel</div>
          </div>
          <div class="metric-value relative z-10">{{ ongoingTripsCount }}</div>
          <p class="metric-label relative z-10">Trajets en Cours</p>
          <div class="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div class="absolute bottom-0 left-0 h-0.5 bg-blue-500 transition-all duration-500" [style.width]="ongoingTripsCount > 0 ? '100%' : '20%'"></div>
        </div>

        <div class="metric-card group overflow-hidden">
          <div class="flex items-start justify-between mb-3 relative z-10">
            <div class="h-10 w-10 rounded-lg flex items-center justify-center transition-all group-hover:scale-110"
                 style="background: rgba(245,158,11,0.1); border: 1px solid rgba(245,158,11,0.2);">
                <svg class="h-5 w-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <div class="text-[10px] font-mono text-amber-400/50 uppercase tracking-widest">File d'attente</div>
          </div>
          <div class="metric-value relative z-10">{{ pendingTripsCount }}</div>
          <p class="metric-label relative z-10">En Attente</p>
          <div class="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div class="absolute bottom-0 left-0 h-0.5 bg-amber-500 transition-all duration-500" [style.width]="pendingTripsCount > 5 ? '100%' : (pendingTripsCount * 20) + '%'"></div>
        </div>

        <div class="metric-card group overflow-hidden">
          <div class="flex items-start justify-between mb-3 relative z-10">
            <div class="h-10 w-10 rounded-lg flex items-center justify-center transition-all group-hover:scale-110"
                 style="background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.2);">
                <svg class="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <div class="text-[10px] font-mono text-emerald-400/50 uppercase tracking-widest">Bilan Mensuel</div>
          </div>
          <div class="metric-value relative z-10">{{ completedTripsCount }}</div>
          <p class="metric-label relative z-10">Terminés</p>
          <div class="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div class="absolute bottom-0 left-0 h-0.5 bg-emerald-500 transition-all duration-500" [style.width]="completedTripsCount > 10 ? '100%' : (completedTripsCount * 10) + '%'"></div>
        </div>
      </div>

      <!-- Recent Trips Table -->
      <div class="fleet-card p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-base font-display font-semibold" style="color: #f4f5f7;">Journal d'Activités Récents</h2>
          <button routerLink="/driver/trips" class="text-xs font-semibold uppercase tracking-widest hover:text-blue-400 transition-colors flex items-center gap-2" style="color: #4b5563;">
            VOIR TOUT LE REGISTRE
            <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        
        <div class="overflow-x-auto">
          <table class="fleet-table">
            <thead>
              <tr>
                <th>Référence</th>
                <th>Client</th>
                <th>Date / Heure</th>
                <th>Status Final</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let trip of recentTrips">
                <td>
                  <div class="flex items-center gap-3">
                    <div class="h-8 w-8 rounded-lg bg-[#141518] flex items-center justify-center font-mono font-bold text-[10px] text-blue-400 border border-[#2a2d35]">
                        TR
                    </div>
                    <span class="font-mono font-bold text-gray-200">{{ trip.reference }}</span>
                  </div>
                </td>
                <td>
                    <div class="flex flex-col">
                        <span class="text-sm text-gray-200">{{ trip.client.companyName }}</span>
                        <span class="text-[10px] text-gray-500">#{{ trip.id.substring(0,8) }}</span>
                    </div>
                </td>
                <td>
                  <div class="flex flex-col">
                    <span style="color: #f4f5f7;" class="text-sm font-semibold">{{ trip.startDate | date:'dd MMM yyyy' }}</span>
                    <span class="text-[10px] font-mono" style="color: #4b5563;">{{ trip.startDate | date:'HH:mm' }}</span>
                  </div>
                </td>
                <td>
                  <span [ngClass]="{
                    'badge-maintenance': trip.status === 'PLANNED',
                    'badge-intuse': trip.status === 'ONGOING',
                    'badge-available': trip.status === 'COMPLETED',
                    'badge-broken': trip.status === 'CANCELLED' || trip.status === 'REFUSED_BY_DRIVER'
                  }">
                    {{ trip.status }}
                  </span>
                </td>
              </tr>
              <tr *ngIf="recentTrips.length === 0">
                <td colspan="4" class="py-12 text-center text-xs font-mono" style="color: #4b5563;">AUCUNE ACTIVITÉ RÉGISTRÉE</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class DriverDashboardComponent implements OnInit, OnDestroy {
  private driverService = inject(DriverService);
  private trackingService = inject(TrackingService);

  allTrips: TripResponse[] = [];
  recentTrips: TripResponse[] = [];
  activeTrip: TripResponse | null = null;
  nextTrip: TripResponse | null = null;

  activeMarkers: any[] = [];
  activePolylines: any[] = [];

  ongoingTripsCount = 0;
  pendingTripsCount = 0;
  completedTripsCount = 0;

  public watchId: number | null = null;

  ngOnInit() {
    this.loadData();
  }

  ngOnDestroy() {
    this.stopTracking();
  }

  loadData() {
    this.driverService.getAssignedTrips().subscribe({
      next: (trips) => {
        this.allTrips = trips;
        this.recentTrips = trips.filter(t => t.status !== 'ONGOING').slice(0, 5);
        this.activeTrip = trips.find(t => t.status === 'ONGOING') || null;
        this.nextTrip = trips.find(t => t.status === 'PLANNED') || null;

        this.ongoingTripsCount = trips.filter(t => t.status === 'ONGOING').length;
        this.pendingTripsCount = trips.filter(t => t.status === 'PLANNED').length;
        this.completedTripsCount = trips.filter(t => t.status === 'COMPLETED').length;

        if (this.activeTrip) {
          this.loadTripPath(this.activeTrip.id);
          this.startTracking();
        } else {
            this.activeMarkers = [];
            this.activePolylines = [];
            this.stopTracking();
        }
      }
    });
  }

  loadTripPath(tripId: string) {
    this.trackingService.getTripPath(tripId).subscribe({
      next: (path) => {
        if (path && path.length > 0) {
          const coords = path.map(p => [p.latitude, p.longitude]);
          this.activePolylines = [{
            path: coords,
            color: '#3b82f6',
            weight: 5
          }];
          
          const latest = path[path.length - 1];
          this.activeMarkers = [{
            lat: latest.latitude,
            lng: latest.longitude,
            label: 'Votre Position',
            color: '#3b82f6'
          }];
        }
      }
    });
  }

  startTracking() {
    if (this.watchId !== null) return;
    if (!this.activeTrip || !this.activeTrip.trucks || this.activeTrip.trucks.length === 0) return;

    const truckId = this.activeTrip.trucks[0].id;

    if ('geolocation' in navigator) {
      this.watchId = navigator.geolocation.watchPosition(
        (pos) => {
          this.trackingService.recordPoint(truckId, pos.coords.latitude, pos.coords.longitude).subscribe({
             next: () => {
                // Refresh path to show new point on map
                if (this.activeTrip) this.loadTripPath(this.activeTrip.id);
             }
          });
        },
        (err) => console.error('Geolocation error', err),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
  }

  stopTracking() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  async calculateTripDistance(trip: TripResponse): Promise<number> {
    if (!trip.deliveries || trip.deliveries.length === 0) return 0;
    
    let totalDistance = 0;
    for (const delivery of trip.deliveries) {
      if (delivery.pickupLatitude && delivery.deliveryLatitude) {
        try {
          const url = `https://router.project-osrm.org/route/v1/driving/${delivery.pickupLongitude},${delivery.pickupLatitude};${delivery.deliveryLongitude},${delivery.deliveryLatitude}?overview=false`;
          const response = await fetch(url);
          const data = await response.json();
          if (data.routes && data.routes[0]) {
            totalDistance += data.routes[0].distance; // distance in meters
          }
        } catch (e) {
          console.error('Error calculating distance for delivery', delivery.reference, e);
        }
      }
    }
    return totalDistance / 1000; // convert to km
  }

  acceptTrip(trip: TripResponse) {
    Swal.fire({
      title: 'Démarrer la Mission?',
      text: "Voulez-vous activer ce trajet maintenant ?",
      icon: 'question',
      showCancelButton: true,
      background: '#1a1c23',
      color: '#f4f5f7',
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#2a2d35',
      confirmButtonText: 'Oui, Démarrer',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.driverService.acceptTrip(trip.id).subscribe({
          next: () => {
            Swal.fire({
                title: 'Mission Activée!',
                text: 'Trajet en cours.',
                icon: 'success',
                background: '#1a1c23',
                color: '#f4f5f7',
                confirmButtonColor: '#3b82f6'
            });
            this.loadData();
          },
          error: (err) => Swal.fire('Erreur', err.error?.message || 'Action impossible', 'error')
        });
      }
    });
  }

  completeTrip(trip: TripResponse) {
    Swal.fire({
      title: 'Terminer la Mission?',
      text: "Confirmez-vous que la livraison est terminée ?",
      icon: 'warning',
      showCancelButton: true,
      background: '#1a1c23',
      color: '#f4f5f7',
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#2a2d35',
      confirmButtonText: 'Oui, Terminer',
      cancelButtonText: 'Annuler',
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        const distance = await this.calculateTripDistance(trip);
        return distance;
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.isConfirmed) {
        const distance = result.value;
        this.driverService.completeTrip(trip.id, distance).subscribe({
          next: () => {
            Swal.fire({
                title: 'Mission Terminée!',
                text: `Le trajet a été archivé. Distance calculée: ${distance.toFixed(2)} km`,
                icon: 'success',
                background: '#1a1c23',
                color: '#f4f5f7',
                confirmButtonColor: '#10b981'
            });
            this.loadData();
          },
          error: (err) => Swal.fire('Erreur', err.error?.message || 'Action impossible', 'error')
        });
      }
    });
  }
}
