import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DeliveryService } from '../../../core/services/delivery.service';
import { TripService } from '../../../core/services/trip.service';
import { ClientService } from '../../../core/services/client.service';

import Swal from 'sweetalert2';
import { DeliveryResponse } from '../../../core/models/delivery.model';
import { TripResponse } from '../../../core/models/trip.model';
import { ClientResponse } from '../../../core/models/client.model';

import { MapComponent } from '../../../shared/map/map.component';
import { TrackingService } from '../../../core/services/tracking.service';
import { GeocodingService } from '../../../core/services/geocoding.service';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
    selector: 'app-manager-deliveries-list',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, MapComponent],
    templateUrl: './deliveries-list.component.html'
})
export class ManagerDeliveriesListComponent implements OnInit {
    private deliveryService = inject(DeliveryService);
    private tripService = inject(TripService);
    private clientService = inject(ClientService);
    private trackingService = inject(TrackingService);
    private geocodingService = inject(GeocodingService);

    private fb = inject(FormBuilder);

    // Map Data
    deliveryPath: any[] = [];
    mapCenter: [number, number] = [33.5731, -7.5898];
    selectionType: 'pickup' | 'delivery' | null = null;
    tempMarkers: any[] = [];

    deliveries: DeliveryResponse[] = [];
    trips: TripResponse[] = [];
    clients: ClientResponse[] = [];

    isLoading = true;
    isModalOpen = false;
    isDetailsModalOpen = false;
    isUpdateMode = false;
    currentDeliveryId: string | null = null;
    selectedDeliveryDetails: DeliveryResponse | null = null;
    isSubmitting = false;

    // Pagination
    currentPage = 0;
    pageSize = 6;
    totalElements = 0;
    totalPages = 0;
    isLastPage = false;

    deliveryForm: FormGroup = this.fb.group({
        description: [''],
        weight: [null, [Validators.required, Validators.min(0.1)]],
        volume: [null, [Validators.required, Validators.min(0.1)]],
        prix: [null, [Validators.required, Validators.min(0)]],
        pickupAddress: ['', Validators.required],
        deliveryAddress: ['', Validators.required],
        pickupLatitude: [null],
        pickupLongitude: [null],
        deliveryLatitude: [null],
        deliveryLongitude: [null],
        status: ['CREATED', Validators.required],
        tripId: ['', Validators.required]
    });

    ngOnInit(): void {
        this.loadData();
        this.setupGeocodingSync();
    }

    private setupGeocodingSync() {
        // Pickup Address Sync
        this.deliveryForm.get('pickupAddress')?.valueChanges.pipe(
            debounceTime(800),
            distinctUntilChanged()
        ).subscribe(val => {
            if (val && !this.selectionType) this.geocodeAddress('pickup', val);
        });

        // Delivery Address Sync
        this.deliveryForm.get('deliveryAddress')?.valueChanges.pipe(
            debounceTime(800),
            distinctUntilChanged()
        ).subscribe(val => {
            if (val && !this.selectionType) this.geocodeAddress('delivery', val);
        });
    }

    private geocodeAddress(type: 'pickup' | 'delivery', address: string) {
        this.geocodingService.search(address).subscribe(results => {
            if (results && results.length > 0) {
                const best = results[0];
                const lat = parseFloat(best.lat);
                const lng = parseFloat(best.lon);

                if (type === 'pickup') {
                    this.deliveryForm.patchValue({ pickupLatitude: lat, pickupLongitude: lng }, { emitEvent: false });
                } else {
                    this.deliveryForm.patchValue({ deliveryLatitude: lat, deliveryLongitude: lng }, { emitEvent: false });
                }
                this.updateTempMarkers();
                this.mapCenter = [lat, lng];
            }
        });
    }

    loadData() {
        this.isLoading = true;
        this.deliveryService.getDeliveriesPaginated(this.currentPage, this.pageSize).subscribe({
            next: (response) => {
                this.deliveries = response.content;
                this.totalElements = response.totalElements;
                this.totalPages = response.totalPages;
                this.isLastPage = response.last;
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error fetching deliveries', err);
                this.isLoading = false;
            }
        });

        // Preload trips to link deliveries to trips
        this.tripService.getTrips().subscribe(t => this.trips = t);
        this.clientService.getClients().subscribe(c => this.clients = c);
    }

    onPageChange(page: number) {
        if (page >= 0 && page < this.totalPages) {
            this.currentPage = page;
            this.loadData();
        }
    }



    openModal() {
        this.isUpdateMode = false;
        this.currentDeliveryId = null;
        this.isModalOpen = true;
        this.selectionType = null;
        this.tempMarkers = [];
        this.deliveryPath = []; // This will hold all layers: [{path, color}]
        this.deliveryForm.reset({ status: 'CREATED', tripId: '' });

    }

    openUpdateModal(delivery: DeliveryResponse) {
        this.isUpdateMode = true;
        this.currentDeliveryId = delivery.id;
        this.isModalOpen = true;
        this.selectionType = null;
        this.updateTempMarkers(delivery);

        this.deliveryForm.patchValue({
            description: delivery.description,
            weight: delivery.weight,
            volume: delivery.volume,
            prix: delivery.prix,
            pickupAddress: delivery.pickupAddress,
            deliveryAddress: delivery.deliveryAddress,
            pickupLatitude: delivery.pickupLatitude,
            pickupLongitude: delivery.pickupLongitude,
            deliveryLatitude: delivery.deliveryLatitude,
            deliveryLongitude: delivery.deliveryLongitude,
            status: delivery.status || 'CREATED',
            tripId: delivery.trip?.id || ''
        });
    }

    private updateTempMarkers(delivery?: DeliveryResponse) {
        this.tempMarkers = [];
        const pickupLat = delivery?.pickupLatitude || this.deliveryForm.get('pickupLatitude')?.value;
        const pickupLng = delivery?.pickupLongitude || this.deliveryForm.get('pickupLongitude')?.value;
        const deliveryLat = delivery?.deliveryLatitude || this.deliveryForm.get('deliveryLatitude')?.value;
        const deliveryLng = delivery?.deliveryLongitude || this.deliveryForm.get('deliveryLongitude')?.value;

        if (pickupLat && pickupLng) {
            this.tempMarkers.push({ lat: pickupLat, lng: pickupLng, label: 'Départ', color: '#10b981' });
        }
        if (deliveryLat && deliveryLng) {
            this.tempMarkers.push({ lat: deliveryLat, lng: deliveryLng, label: 'Arrivée', color: '#ef4444' });
        }
    }

    openDetailsModal(delivery: DeliveryResponse) {
        this.selectedDeliveryDetails = delivery;
        this.isDetailsModalOpen = true;
        this.deliveryPath = [];
        this.tempMarkers = [];

        // Function to process route once we have coordinates
        const processRoute = (pLat: number, pLng: number, dLat: number, dLng: number) => {
            this.tempMarkers = [
                { lat: pLat, lng: pLng, label: 'Pickup', color: '#10b981' },
                { lat: dLat, lng: dLng, label: 'Destination', color: '#ef4444' }
            ];

            this.geocodingService.getRoute(pLat, pLng, dLat, dLng).subscribe({
                next: (route) => {
                    if (route.routes && route.routes.length > 0) {
                        const path = route.routes[0].geometry.coordinates.map((c: any) => [c[1], c[0]]);
                        this.deliveryPath.push({ path, color: '#3b82f6', weight: 4, opacity: 0.6 });
                        this.deliveryPath = [...this.deliveryPath];
                        if (this.deliveryPath.length === 1) this.mapCenter = path[0] as [number, number];
                    }
                }
            });
        };

        // If coordinates already exist, use them
        if (delivery.pickupLatitude && delivery.deliveryLatitude) {
            processRoute(delivery.pickupLatitude, delivery.pickupLongitude!, delivery.deliveryLatitude, delivery.deliveryLongitude!);
        } else if (delivery.pickupAddress && delivery.deliveryAddress) {
            // Fallback: Geocode on the fly if coordinates missing
            this.geocodingService.search(delivery.pickupAddress).subscribe(pResults => {
                if (pResults?.[0]) {
                    const pLat = parseFloat(pResults[0].lat);
                    const pLng = parseFloat(pResults[0].lon);
                    this.geocodingService.search(delivery.deliveryAddress).subscribe(dResults => {
                        if (dResults?.[0]) {
                            const dLat = parseFloat(dResults[0].lat);
                            const dLng = parseFloat(dResults[0].lon);
                            processRoute(pLat, pLng, dLat, dLng);
                        }
                    });
                }
            });
        }

        // 2. Fetch Actual Tracking Path (if exists) - EMERALD
        if (delivery.trip?.id) {
            this.trackingService.getTripPath(delivery.trip.id).subscribe({
                next: (points) => {
                    const path = points.map(p => [p.latitude, p.longitude]);
                    if (path.length > 0) {
                        this.deliveryPath.push({ path, color: '#10b981', weight: 5, opacity: 1 });
                        this.deliveryPath = [...this.deliveryPath];
                        this.mapCenter = path[0] as [number, number];
                    }
                }
            });
        }
    }

    closeModal() {
        this.isModalOpen = false;
        this.isDetailsModalOpen = false;
        this.selectedDeliveryDetails = null;
        this.selectionType = null;
        this.tempMarkers = [];
    }

    setSelectionMode(type: 'pickup' | 'delivery' | null) {
        this.selectionType = type;
        if (type) {
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'info',
                title: `Cliquez sur la carte pour définir le point de ${type === 'pickup' ? 'départ' : 'destination'}`,
                showConfirmButton: false,
                timer: 3000,
                background: '#1a1c23', color: '#f4f5f7'
            });
        }
    }

    onMapClick(coords: { lat: number, lng: number }) {
        if (!this.selectionType) return;

        if (this.selectionType === 'pickup') {
            this.deliveryForm.patchValue({
                pickupLatitude: coords.lat,
                pickupLongitude: coords.lng
            });
            this.reverseGeocode('pickup', coords.lat, coords.lng);
        } else {
            this.deliveryForm.patchValue({
                deliveryLatitude: coords.lat,
                deliveryLongitude: coords.lng
            });
            this.reverseGeocode('delivery', coords.lat, coords.lng);
        }

        this.updateTempMarkers();
        this.selectionType = null;
    }

    private reverseGeocode(type: 'pickup' | 'delivery', lat: number, lng: number) {
        this.geocodingService.reverse(lat, lng).subscribe(result => {
            if (result && result.display_name) {
                if (type === 'pickup') {
                    this.deliveryForm.patchValue({ pickupAddress: result.display_name }, { emitEvent: false });
                } else {
                    this.deliveryForm.patchValue({ deliveryAddress: result.display_name }, { emitEvent: false });
                }
            }
        });
    }

    onSubmit() {
        if (this.deliveryForm.invalid) {
            this.deliveryForm.markAllAsTouched();
            return;
        }

        this.isSubmitting = true;
        const payload = this.deliveryForm.value;



        const request$ = this.isUpdateMode && this.currentDeliveryId
            ? this.deliveryService.updateDelivery(this.currentDeliveryId, payload)
            : this.deliveryService.createDelivery(payload);

        request$.subscribe({
            next: () => {
                this.isSubmitting = false;
                this.closeModal();
                this.loadData();
                Swal.fire({
                    icon: 'success',
                    title: 'Enregistré',
                    text: this.isUpdateMode ? 'La livraison a été modifiée.' : 'La livraison a été créée avec succès.',
                    timer: 1500,
                    showConfirmButton: false,
                    background: '#1a1c23', color: '#f4f5f7'
                });
            },
            error: (err) => {
                console.error('Error saving delivery', err);
                this.isSubmitting = false;
                Swal.fire({
                    icon: 'error',
                    title: 'Erreur',
                    text: err.error?.message || 'Une erreur est survenue.',
                    confirmButtonColor: '#10b981',
                    background: '#1a1c23', color: '#f4f5f7'
                });
            }
        });
    }

    deleteDelivery(id: string) {
        Swal.fire({
            title: 'Supprimer la livraison ?',
            text: "Cette action est irréversible.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#374151',
            confirmButtonText: 'Oui, supprimer',
            cancelButtonText: 'Annuler',
            background: '#1a1c23', color: '#f4f5f7'
        }).then((result) => {
            if (result.isConfirmed) {
                this.deliveryService.deleteDelivery(id).subscribe({
                    next: () => {
                        this.loadData();
                        Swal.fire({ icon: 'success', title: 'Supprimée', text: 'La livraison a été effacée.', timer: 1500, showConfirmButton: false, background: '#1a1c23', color: '#f4f5f7' });
                    },
                    error: (err) => {
                        Swal.fire({ icon: 'error', title: 'Erreur', text: 'Impossible de supprimer cette livraison.', background: '#1a1c23', color: '#f4f5f7' });
                    }
                });
            }
        });
    }
}
