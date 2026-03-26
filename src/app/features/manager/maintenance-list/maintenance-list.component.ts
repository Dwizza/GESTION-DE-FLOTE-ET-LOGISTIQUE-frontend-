import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MaintenanceService } from '../../../core/services/maintenance.service';
import { TruckService } from '../../../core/services/truck.service';
import { TrailerService } from '../../../core/services/trailer.service';
import Swal from 'sweetalert2';
import { MaintenanceResponse } from '../../../core/models/maintenance.model';
import { TruckResponse } from '../../../core/models/truck.model';
import { TrailerResponse } from '../../../core/models/trailer.model';

@Component({
    selector: 'app-manager-maintenance-list',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './maintenance-list.component.html'
})
export class ManagerMaintenanceListComponent implements OnInit {
    private maintenanceService = inject(MaintenanceService);
    private truckService = inject(TruckService);
    private trailerService = inject(TrailerService);
    private fb = inject(FormBuilder);
    private http = inject(HttpClient);

    maintenances: MaintenanceResponse[] = [];
    trucks: TruckResponse[] = [];
    trailers: TrailerResponse[] = [];

    isLoading = true;
    isModalOpen = false;
    isDetailsModalOpen = false;
    isSubmitting = false;

    editingId: string | null = null;
    selectedMaintenance: MaintenanceResponse | null = null;

    // Pagination
    currentPage = 0;
    pageSize = 10;
    totalElements = 0;
    totalPages = 0;
    isLastPage = false;

    serviceType: 'TRUCK' | 'TRAILER' = 'TRUCK';

    maintenanceForm: FormGroup = this.fb.group({
        reference: ['', Validators.required],
        description: ['', Validators.required],
        type: ['PREVENTIVE', Validators.required],
        status: ['PLANNED', Validators.required],
        dateMaintenance: ['', Validators.required],
        cout: [0, [Validators.required, Validators.min(0)]],
        performedBy: ['', Validators.required],
        truckId: [''],
        trailerId: ['']
    });

    ngOnInit(): void {
        this.loadData();
    }

    loadData() {
        this.isLoading = true;
        this.maintenanceService.getMaintenancesPaginated(this.currentPage, this.pageSize).subscribe({
            next: (response) => {
                this.maintenances = response.content;
                this.totalElements = response.totalElements;
                this.totalPages = response.totalPages;
                this.isLastPage = response.last;
                this.isLoading = false;
            },
            error: (err: any) => {
                console.error('Error fetching maintenances', err);
                this.isLoading = false;
                Swal.fire({
                    icon: 'error',
                    title: 'Erreur',
                    text: 'Impossible de charger les interventions.',
                    confirmButtonColor: '#10b981',
                    background: '#1a1c23', color: '#f4f5f7'
                });
            }
        });

        this.truckService.getTrucks().subscribe((t: TruckResponse[]) => this.trucks = t);
        this.trailerService.getTrailers().subscribe((tr: TrailerResponse[]) => this.trailers = tr);
    }

    onPageChange(page: number) {
        if (page >= 0 && page < this.totalPages) {
            this.currentPage = page;
            this.loadData();
        }
    }

    setServiceType(type: 'TRUCK' | 'TRAILER') {
        this.serviceType = type;
        if (type === 'TRUCK') {
            this.maintenanceForm.patchValue({ trailerId: null });
        } else {
            this.maintenanceForm.patchValue({ truckId: null });
        }
    }

    generateReference(prefix: string): string {
        const date = new Date();
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `${prefix}-${yyyy}${mm}${dd}-${randomStr}`;
    }

    openModal() {
        this.isModalOpen = true;
        this.editingId = null;
        this.serviceType = 'TRUCK';
        this.maintenanceForm.reset({ cout: 0, dateMaintenance: new Date().toISOString().split('T')[0], type: 'PREVENTIVE', status: 'PLANNED' });
        this.maintenanceForm.patchValue({ reference: this.generateReference('MNT') });
    }

    openEditModal(maintenance: MaintenanceResponse) {
        this.isModalOpen = true;
        this.editingId = maintenance.id;

        if (maintenance.truckId) {
            this.serviceType = 'TRUCK';
        } else {
            this.serviceType = 'TRAILER';
        }

        this.maintenanceForm.patchValue({
            reference: maintenance.reference,
            description: maintenance.description,
            type: maintenance.type,
            status: maintenance.status,
            dateMaintenance: new Date(maintenance.dateMaintenance).toISOString().split('T')[0],
            cout: maintenance.cout,
            performedBy: maintenance.performedBy,
            truckId: maintenance.truckId || '',
            trailerId: maintenance.trailerId || ''
        });
    }

    openDetailsModal(maintenance: MaintenanceResponse) {
        this.selectedMaintenance = maintenance;
        this.isDetailsModalOpen = true;
    }

    closeDetailsModal() {
        this.isDetailsModalOpen = false;
        this.selectedMaintenance = null;
    }

    closeModal() {
        this.isModalOpen = false;
        this.editingId = null;
    }

    onSubmit() {
        if (this.maintenanceForm.invalid) {
            this.maintenanceForm.markAllAsTouched();
            return;
        }

        const payload = this.maintenanceForm.value;

        if (this.serviceType === 'TRUCK') {
            payload.trailerId = null;
            if (!payload.truckId) {
                return;
            }
        } else {
            payload.truckId = null;
            if (!payload.trailerId) {
                return;
            }
        }

        this.isSubmitting = true;

        const request$ = this.editingId
            ? this.maintenanceService.updateMaintenance(this.editingId, payload)
            : this.maintenanceService.createMaintenance(payload);

        request$.subscribe({
            next: () => {
                this.isSubmitting = false;
                this.closeModal();
                this.loadData();
                Swal.fire({
                    icon: 'success',
                    title: 'Enregistré',
                    text: 'La maintenance a été mise à jour.',
                    timer: 1500,
                    showConfirmButton: false,
                    background: '#1a1c23', color: '#f4f5f7'
                });
            },
            error: (err) => {
                this.isSubmitting = false;
                Swal.fire({
                    icon: 'error',
                    title: 'Erreur',
                    text: 'Action impossible.',
                    confirmButtonColor: '#10b981',
                    background: '#1a1c23', color: '#f4f5f7'
                });
            }
        });
    }

    deleteMaintenance(id: string) {
        Swal.fire({
            title: 'Supprimer ?',
            text: "Cette action est définitive.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#374151',
            confirmButtonText: 'Supprimer',
            cancelButtonText: 'Annuler',
            background: '#1a1c23', color: '#f4f5f7'
        }).then((result) => {
            if (result.isConfirmed) {
                this.maintenanceService.deleteMaintenance(id).subscribe({
                    next: () => {
                        this.loadData();
                        Swal.fire({ icon: 'success', title: 'Supprimée', timer: 1500, showConfirmButton: false, background: '#1a1c23', color: '#f4f5f7' });
                    },
                    error: (err) => {
                        Swal.fire({ icon: 'error', title: 'Erreur', background: '#1a1c23', color: '#f4f5f7' });
                    }
                });
            }
        });
    }
}
