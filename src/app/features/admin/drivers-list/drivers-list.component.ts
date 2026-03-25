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
    editingId: string | null = null;
    editingDriver: DriverResponse | null = null;

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
        this.editingId = null;
        this.editingDriver = null;
        this.isModalOpen = true;
        
        this.driverForm.get('email')?.setValidators([Validators.required, Validators.email]);
        this.driverForm.get('email')?.updateValueAndValidity();
        this.driverForm.get('password')?.setValidators([Validators.required, Validators.minLength(8)]);
        this.driverForm.get('password')?.updateValueAndValidity();

        this.driverForm.reset();
    }

    openEditModal(driver: DriverResponse) {
        this.editingId = driver.id;
        this.editingDriver = driver;
        
        this.driverForm.get('email')?.clearValidators();
        this.driverForm.get('email')?.updateValueAndValidity();
        this.driverForm.get('password')?.clearValidators();
        this.driverForm.get('password')?.updateValueAndValidity();

        this.driverForm.patchValue({
            firstName: driver.firstName,
            lastName: driver.lastName,
            email: driver.email,
            password: '',
            licenseNumber: driver.licenseNumber,
            phoneNumber: driver.phoneNumber
        });
        
        this.isModalOpen = true;
    }

    closeModal() {
        this.isModalOpen = false;
        this.editingId = null;
        this.editingDriver = null;
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
        
        if (this.editingId && this.editingDriver) {
            const formValue = this.driverForm.value;
            const updatePayload = {
                firstName: formValue.firstName,
                lastName: formValue.lastName,
                licenseNumber: formValue.licenseNumber,
                phoneNumber: formValue.phoneNumber,
                active: this.editingDriver.active,
                available: this.editingDriver.available
            };

            this.driverService.updateDriver(this.editingId, updatePayload).subscribe({
                next: () => {
                    this.isSubmitting = false;
                    this.closeModal();
                    this.loadDrivers();
                },
                error: (err) => {
                    console.error('Error updating driver', err);
                    this.isSubmitting = false;
                }
            });
        } else {
            const createPayload = this.driverForm.value;
            this.driverService.createDriver(createPayload).subscribe({
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
