import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import { TripService } from '../../../core/services/trip.service';
import { DriverService } from '../../../core/services/driver.service';
import { TruckService } from '../../../core/services/truck.service';
import { TrailerService } from '../../../core/services/trailer.service';
import { ClientService } from '../../../core/services/client.service';
import { TripResponse } from '../../../core/models/trip.model';
import { DriverResponse } from '../../../core/models/driver.model';
import { TruckResponse } from '../../../core/models/truck.model';
import { TrailerResponse } from '../../../core/models/trailer.model';
import { ClientResponse } from '../../../core/models/client.model';

import { MapComponent } from '../../../shared/map/map.component';
import { TrackingService } from '../../../core/services/tracking.service';

@Component({
    selector: 'app-manager-trips-list',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, MapComponent],
    templateUrl: './trips-list.component.html'
})
export class ManagerTripsListComponent implements OnInit {
    private tripService = inject(TripService);
    private driverService = inject(DriverService);
    private truckService = inject(TruckService);
    private trailerService = inject(TrailerService);
    private clientService = inject(ClientService);
    private trackingService = inject(TrackingService);
    private fb = inject(FormBuilder);
    private http = inject(HttpClient);

    // Map Path
    tripPath: any[] = [];
    mapCenter: [number, number] = [33.5731, -7.5898];

    trips: TripResponse[] = [];
    drivers: DriverResponse[] = [];
    trucks: TruckResponse[] = [];
    trailers: TrailerResponse[] = [];
    clients: ClientResponse[] = [];

    isLoading = true;
    isModalOpen = false;
    isDetailsModalOpen = false;
    isUpdateMode = false;
    currentTripId: string | null = null;
    selectedTripDetails: TripResponse | null = null;
    isSubmitting = false;

    tripForm: FormGroup = this.fb.group({
        reference: ['', Validators.required],
        startDate: ['', Validators.required],
        status: ['PLANNED', Validators.required],
        driverId: ['', Validators.required],
        clientId: ['', Validators.required],
        truckIds: [[]],
        trailerIds: [[]]
    });

    ngOnInit(): void {
        this.loadData();
    }

    loadData() {
        this.isLoading = true;
        this.tripService.getTrips().subscribe({
            next: (data) => {
                this.trips = data;
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error fetching trips', err);
                this.isLoading = false;
            }
        });

        // Preload resources for creation form
        this.driverService.getDrivers().subscribe((d: DriverResponse[]) => this.drivers = d.filter(driver => driver.available));
        this.truckService.getTrucks().subscribe((t: TruckResponse[]) => this.trucks = t.filter(truck => truck.status === 'AVAILABLE'));
        this.trailerService.getTrailers().subscribe((tr: TrailerResponse[]) => this.trailers = tr.filter(trailer => trailer.status === 'AVAILABLE'));
        this.clientService.getClients().subscribe((c: ClientResponse[]) => this.clients = c);
    }

    openModal() {
        this.isUpdateMode = false;
        this.currentTripId = null;
        this.isModalOpen = true;
        this.tripForm.reset({ status: 'PLANNED', truckIds: [], trailerIds: [] });
        // Hide currently in-trip trucks by reloading only available ones
        this.driverService.getDrivers().subscribe((d: DriverResponse[]) => this.drivers = d.filter(driver => driver.available));
        this.truckService.getTrucks().subscribe((t: TruckResponse[]) => this.trucks = t.filter(truck => truck.status === 'AVAILABLE'));
        this.trailerService.getTrailers().subscribe((tr: TrailerResponse[]) => this.trailers = tr.filter(trailer => trailer.status === 'AVAILABLE'));
    }

    openUpdateModal(trip: TripResponse) {
        this.isUpdateMode = true;
        this.currentTripId = trip.id;
        this.isModalOpen = true;

        // Ensure currently assigned resources are present in the dropdown options
        if (trip.driver && !this.drivers.find(d => d.id === trip.driver!.id)) {
            this.drivers.push(trip.driver as DriverResponse);
        }
        trip.trucks?.forEach(t => {
            if (!this.trucks.find(truck => truck.id === t.id)) this.trucks.push(t as TruckResponse);
        });
        trip.trailers?.forEach(t => {
            if (!this.trailers.find(trailer => trailer.id === t.id)) this.trailers.push(t as TrailerResponse);
        });

        this.tripForm.patchValue({
            reference: trip.reference,
            startDate: trip.startDate,
            status: trip.status || 'PLANNED',
            driverId: trip.driver?.id,
            clientId: trip.client?.id,
            truckIds: trip.trucks?.map(t => t.id) || [],
            trailerIds: trip.trailers?.map(t => t.id) || []
        });
    }

    openDetailsModal(trip: TripResponse) {
        this.selectedTripDetails = trip;
        this.isDetailsModalOpen = true;
        this.tripPath = [];
        
        this.trackingService.getTripPath(trip.id).subscribe({
            next: (points) => {
                this.tripPath = points.map(p => [p.latitude, p.longitude]);
                if (this.tripPath.length > 0) {
                    this.mapCenter = this.tripPath[0];
                }
            },
            error: (err) => console.error('Error loading trip path', err)
        });
    }

    closeModal() {
        this.isModalOpen = false;
        this.isDetailsModalOpen = false;
        this.selectedTripDetails = null;
    }

    onSubmit() {
        if (this.tripForm.invalid) {
            this.tripForm.markAllAsTouched();
            return;
        }

        this.isSubmitting = true;
        const payload = this.tripForm.value;

        if (!Array.isArray(payload.truckIds) && payload.truckIds) {
            payload.truckIds = [payload.truckIds];
        } else if (!payload.truckIds) {
            payload.truckIds = [];
        }

        if (!Array.isArray(payload.trailerIds) && payload.trailerIds) {
            payload.trailerIds = [payload.trailerIds];
        } else if (!payload.trailerIds) {
            payload.trailerIds = [];
        }

        const request$ = this.isUpdateMode && this.currentTripId
            ? this.tripService.updateTrip(this.currentTripId, payload)
            : this.tripService.createTrip(payload);

        request$.subscribe({
            next: () => {
                this.isSubmitting = false;
                this.closeModal();
                this.loadData();
                Swal.fire({
                    icon: 'success',
                    title: this.isUpdateMode ? 'Trajet Mis à Jour' : 'Trajet Créé',
                    text: this.isUpdateMode ? 'Le trajet a été modifié avec succès.' : 'Le trajet a été planifié avec succès.',
                    timer: 2000,
                    showConfirmButton: false,
                    background: '#1a1c23', color: '#f4f5f7'
                });
            },
            error: (err) => {
                console.error('Error saving trip', err);
                this.isSubmitting = false;
                Swal.fire({
                    icon: 'error',
                    title: 'Action Refusée',
                    text: err.error?.message || 'Une erreur est survenue.',
                    confirmButtonColor: '#10b981',
                    background: '#1a1c23', color: '#f4f5f7'
                });
            }
        });
    }

    deleteTrip(id: string) {
        Swal.fire({
            title: 'Supprimer ce trajet ?',
            text: "Cette action libérera les ressources associées.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#374151',
            confirmButtonText: 'Oui, supprimer',
            cancelButtonText: 'Annuler',
            background: '#1a1c23', color: '#f4f5f7'
        }).then((result) => {
            if (result.isConfirmed) {
                this.tripService.deleteTrip(id).subscribe({
                    next: () => {
                        this.loadData();
                        Swal.fire({ icon: 'success', title: 'Supprimé', text: 'Le trajet a été effacé.', timer: 1500, showConfirmButton: false, background: '#1a1c23', color: '#f4f5f7' });
                    },
                    error: (err) => {
                        Swal.fire({ icon: 'error', title: 'Erreur', text: 'Impossible de supprimer ce trajet.', background: '#1a1c23', color: '#f4f5f7' });
                    }
                });
            }
        });
    }

    toggleSelection(controlName: string, id: string) {
        const control = this.tripForm.get(controlName);
        if (!control) return;
        const currentValues: string[] = control.value || [];
        if (currentValues.includes(id)) {
            control.setValue(currentValues.filter(v => v !== id));
        } else {
            control.setValue([...currentValues, id]);
        }
    }

    isSelected(controlName: string, id: string): boolean {
        const control = this.tripForm.get(controlName);
        return control ? (control.value || []).includes(id) : false;
    }
}
