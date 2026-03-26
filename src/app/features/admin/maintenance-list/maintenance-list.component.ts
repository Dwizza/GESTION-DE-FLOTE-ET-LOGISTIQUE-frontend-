import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import { MaintenanceService } from '../../../core/services/maintenance.service';
import { TruckService } from '../../../core/services/truck.service';
import { TrailerService } from '../../../core/services/trailer.service';
import { MaintenanceResponse } from '../../../core/models/maintenance.model';
import { TruckResponse } from '../../../core/models/truck.model';
import { TrailerResponse } from '../../../core/models/trailer.model';

@Component({
  selector: 'app-maintenance-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './maintenance-list.component.html'
})
export class MaintenanceListComponent implements OnInit {
  private maintenanceService = inject(MaintenanceService);
  private truckService = inject(TruckService);
  private trailerService = inject(TrailerService);
  private fb = inject(FormBuilder);
  // Temporary use for missing delete endpoint on MaintenanceService
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

  // We use a radio button to toggle whether we are servicing a truck or a trailer
  serviceType: 'TRUCK' | 'TRAILER' = 'TRUCK';

  maintenanceForm: FormGroup = this.fb.group({
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
          title: 'Erreur de chargement',
          text: err.error?.message || 'Impossible de charger l\'historique des interventions.',
          confirmButtonColor: '#e11d48'
        });
      }
    });

    // Preload trucks and trailers for the dropdowns
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

  openModal() {
    this.isModalOpen = true;
    this.editingId = null;
    this.serviceType = 'TRUCK';
    this.maintenanceForm.reset({ cout: 0, dateMaintenance: new Date().toISOString().split('T')[0], type: 'PREVENTIVE', status: 'PLANNED' });
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

    // Ensure only one of truckId or trailerId is sent based on the selection type
    if (this.serviceType === 'TRUCK') {
      payload.trailerId = null;
      if (!payload.truckId) {
        alert('Veuillez sélectionner un camion.');
        return;
      }
    } else {
      payload.truckId = null;
      if (!payload.trailerId) {
        alert('Veuillez sélectionner une remorque.');
        return;
      }
    }

    this.isSubmitting = true;

    if (this.editingId) {
      this.maintenanceService.updateMaintenance(this.editingId, payload).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.closeModal();
          this.loadData();
        },
        error: (err) => {
          console.error('Error updating maintenance', err);
          this.isSubmitting = false;
          Swal.fire({
            icon: 'error',
            title: 'Action Refusée',
            text: err.error?.message || err.error?.error || 'Une erreur est survenue lors de la modification.',
            confirmButtonColor: '#e11d48'
          });
        }
      });
    } else {
      this.maintenanceService.createMaintenance(payload).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.closeModal();
          this.loadData();
          Swal.fire({
            icon: 'success',
            title: 'Intervention Enregistrée',
            text: 'La maintenance a été planifiée avec succès.',
            timer: 2000,
            showConfirmButton: false
          });
        },
        error: (err) => {
          console.error('Error creating maintenance', err);
          this.isSubmitting = false;
          Swal.fire({
            icon: 'error',
            title: 'Action Refusée',
            text: err.error?.message || err.error?.error || 'Une erreur est survenue lors de la création.',
            confirmButtonColor: '#e11d48'
          });
        }
      });
    }
  }

  deleteMaintenance(id: string) {
    Swal.fire({
      title: 'Supprimer cette intervention ?',
      text: "Cette action est irréversible et libérera le véhicule associé.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#374151',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.maintenanceService.deleteMaintenance(id).subscribe({
          next: () => {
            this.loadData();
            Swal.fire({ icon: 'success', title: 'Supprimée', text: 'L\'intervention a été effacée.', timer: 1500, showConfirmButton: false });
          },
          error: (err) => {
            console.error('Error deleting maintenance', err);
            Swal.fire({
              icon: 'error',
              title: 'Erreur de suppression',
              text: err.error?.message || 'Le serveur a rencontré un problème.',
              confirmButtonColor: '#e11d48'
            });
          }
        });
      }
    });
  }
}
