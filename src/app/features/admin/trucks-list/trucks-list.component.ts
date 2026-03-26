import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TruckService } from '../../../core/services/truck.service';
import { TruckResponse } from '../../../core/models/truck.model';

@Component({
    selector: 'app-trucks-list',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './trucks-list.component.html'
})
export class TrucksListComponent implements OnInit {
    private truckService = inject(TruckService);
    private fb = inject(FormBuilder);

    trucks: TruckResponse[] = [];
    isLoading = true;
    isModalOpen = false;
    isDetailModalOpen = false;
    isSubmitting = false;
    selectedTruck: TruckResponse | null = null;
    editingId: string | null = null;

    // Pagination
    currentPage = 0;
    pageSize = 10;
    totalElements = 0;
    totalPages = 0;
    isLastPage = false;

    truckForm: FormGroup = this.fb.group({
        registrationNumber: ['', Validators.required],
        brand: ['', Validators.required],
        totalMileage: [0, [Validators.required, Validators.min(0)]],
        status: ['AVAILABLE', Validators.required]
    });

    ngOnInit(): void {
        this.loadTrucks();
    }

    loadTrucks() {
        this.isLoading = true;
        this.truckService.getTrucksPaginated(this.currentPage, this.pageSize).subscribe({
            next: (response) => {
                this.trucks = response.content;
                this.totalElements = response.totalElements;
                this.totalPages = response.totalPages;
                this.isLastPage = response.last;
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error fetching trucks', err);
                this.isLoading = false;
            }
        });
    }

    onPageChange(page: number) {
        if (page >= 0 && page < this.totalPages) {
            this.currentPage = page;
            this.loadTrucks();
        }
    }

    openModal() {
        this.editingId = null;
        this.isModalOpen = true;
        this.truckForm.reset({ status: 'AVAILABLE', totalMileage: 0 });
    }

    openEditModal(truck: TruckResponse) {
        this.editingId = truck.id;
        this.truckForm.patchValue({
            registrationNumber: truck.registrationNumber,
            brand: truck.brand,
            totalMileage: truck.totalMileage,
            status: truck.status
        });
        this.isModalOpen = true;
    }

    closeModal() {
        this.isModalOpen = false;
    }

    openDetailModal(truck: TruckResponse) {
        this.selectedTruck = truck;
        this.isDetailModalOpen = true;
    }

    closeDetailModal() {
        this.isDetailModalOpen = false;
        this.selectedTruck = null;
    }

    onSubmit() {
        if (this.truckForm.invalid) {
            this.truckForm.markAllAsTouched();
            return;
        }

        this.isSubmitting = true;
        
        const submitObs = this.editingId 
            ? this.truckService.updateTruck(this.editingId, this.truckForm.value)
            : this.truckService.createTruck(this.truckForm.value);

        submitObs.subscribe({
            next: () => {
                this.isSubmitting = false;
                this.closeModal();
                this.loadTrucks();
            },
            error: (err) => {
                console.error('Error saving truck', err);
                this.isSubmitting = false;
            }
        });
    }

    deleteTruck(id: string) {
        if (confirm('Supprimer ce camion de la flotte de manière permanente?')) {
            this.truckService.deleteTruck(id).subscribe({
                next: () => this.loadTrucks(),
                error: (err) => console.error('Error deleting truck', err)
            });
        }
    }

    getStatusColor(status: string): string {
        switch (status) {
            case 'AVAILABLE': return 'badge-available';
            case 'IN_TRIP': return 'badge-intuse';
            case 'IN_MAINTENANCE': return 'badge-maintenance';
            case 'BROKEN': return 'badge-broken';
            default: return 'badge-maintenance';
        }
    }
}
