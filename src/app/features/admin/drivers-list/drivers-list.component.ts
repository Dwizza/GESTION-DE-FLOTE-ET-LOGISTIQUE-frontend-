import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DriverService } from '../../../core/services/driver.service';
import { DriverResponse } from '../../../core/models/driver.model';
import { TripResponse } from '../../../core/models/trip.model';

@Component({
    selector: 'app-drivers-list',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './drivers-list.component.html'
})
export class DriversListComponent implements OnInit {
    private driverService = inject(DriverService);
    private fb = inject(FormBuilder);

    drivers: DriverResponse[] = [];
    isLoading = true;
    isModalOpen = false;
    isDetailModalOpen = false;
    isSubmitting = false;
    selectedDriver: DriverResponse | null = null;

    driverTrips: TripResponse[] = [];
    isLoadingTrips = false;

    driverForm: FormGroup = this.fb.group({
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        licenseNumber: ['', Validators.required],
        phoneNumber: ['', Validators.required]
    });

    ngOnInit(): void {
        this.loadDrivers();
    }

    loadDrivers() {
        this.isLoading = true;
        this.driverService.getDrivers().subscribe({
            next: (data) => {
                this.drivers = data;
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error fetching drivers', err);
                this.isLoading = false;
            }
        });
    }

    openModal() {
        this.isModalOpen = true;
        this.driverForm.reset();
    }

    closeModal() {
        this.isModalOpen = false;
    }

    openDetailModal(driver: DriverResponse) {
        this.selectedDriver = driver;
        this.isDetailModalOpen = true;
        this.loadDriverTrips(driver.id);
    }

    loadDriverTrips(driverId: string) {
        this.isLoadingTrips = true;
        this.driverTrips = [];
        this.driverService.getDriverTrips(driverId).subscribe({
            next: (data) => {
                this.driverTrips = data;
                this.isLoadingTrips = false;
            },
            error: (err) => {
                console.error('Error fetching driver trips', err);
                this.isLoadingTrips = false;
            }
        });
    }

    closeDetailModal() {
        this.isDetailModalOpen = false;
        this.selectedDriver = null;
    }

    onSubmit() {
        if (this.driverForm.invalid) {
            this.driverForm.markAllAsTouched();
            return;
        }

        this.isSubmitting = true;
        const payload = this.driverForm.value;

        // Convert date string if needed, depending on exact backend requirements
        // For now we send it as is from the input[type=date]

        this.driverService.createDriver(payload).subscribe({
            next: () => {
                this.isSubmitting = false;
                this.closeModal();
                this.loadDrivers();
            },
            error: (err) => {
                console.error('Error creating driver', err);
                this.isSubmitting = false;
            }
        });
    }

    deleteDriver(id: string) {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce chauffeur? Cette action est irréversible.')) {
            this.driverService.deleteDriver(id).subscribe({
                next: () => this.loadDrivers(),
                error: (err) => console.error('Error deleting driver', err)
            });
        }
    }
}
