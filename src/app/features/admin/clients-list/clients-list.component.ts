import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ClientService } from '../../../core/services/client.service';
import { ClientResponse } from '../../../core/models/client.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-clients-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './clients-list.component.html'
})
export class ClientsListComponent implements OnInit {
  private clientService = inject(ClientService);
  private fb = inject(FormBuilder);

  clients: ClientResponse[] = [];
  isLoading = true;
  isModalOpen = false;
  isDetailsModalOpen = false;
  isSubmitting = false;
  editMode = false;
  selectedClientId: string | null = null;
  selectedClientDetails: ClientResponse | null = null;

  // Pagination
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;
  isLastPage = false;

  clientForm: FormGroup = this.fb.group({
    companyName: ['', Validators.required],
    phone: ['', Validators.required],
    address: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  ngOnInit(): void {
    this.loadClients();
  }

  loadClients() {
    this.isLoading = true;
    this.clientService.getClientsPaginated(this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        this.clients = response.content;
        this.totalElements = response.totalElements;
        this.totalPages = response.totalPages;
        this.isLastPage = response.last;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching clients', err);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Impossible de charger la liste des clients.',
          background: '#1a1c23', color: '#f4f5f7'
        });
        this.isLoading = false;
      }
    });
  }

  onPageChange(page: number) {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadClients();
    }
  }

  openModal(client?: ClientResponse) {
    this.editMode = !!client;
    this.isModalOpen = true;
    this.isSubmitting = false;

    if (client) {
      this.selectedClientId = client.id;
      this.clientForm.patchValue({
        companyName: client.companyName,
        phone: client.phone,
        address: client.address
      });
      // Disable email/password in edit mode since they are not in UpdateClientRequest
      this.clientForm.get('email')?.disable();
      this.clientForm.get('password')?.disable();
    } else {
      this.selectedClientId = null;
      this.clientForm.reset();
      this.clientForm.get('email')?.enable();
      this.clientForm.get('password')?.enable();
    }
  }

  closeModal() {
    this.isModalOpen = false;
    this.clientForm.reset();
  }
  
  openDetailsModal(client: ClientResponse) {
    this.selectedClientDetails = client;
    this.isDetailsModalOpen = true;
  }

  closeDetailsModal() {
    this.isDetailsModalOpen = false;
    this.selectedClientDetails = null;
  }

  onSubmit() {
    if (this.clientForm.invalid) {
      this.clientForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const payload = this.clientForm.getRawValue();

    if (this.editMode && this.selectedClientId) {
      this.clientService.updateClient(this.selectedClientId, payload).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.closeModal();
          this.loadClients();
          Swal.fire({
            icon: 'success',
            title: 'Client modifié',
            text: 'Les informations du client ont été mises à jour avec succès.',
            background: '#1a1c23', color: '#f4f5f7',
            timer: 2000, showConfirmButton: false
          });
        },
        error: (err) => {
          this.isSubmitting = false;
          Swal.fire({
            icon: 'error',
            title: 'Erreur de mise à jour',
            text: err.error?.message || 'Une erreur est survenue lors de la modification.',
            background: '#1a1c23', color: '#f4f5f7'
          });
        }
      });
    } else {
      this.clientService.createClient(payload).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.closeModal();
          this.loadClients();
          Swal.fire({
            icon: 'success',
            title: 'Client ajouté',
            text: 'Le nouveau client a été créé avec succès.',
            background: '#1a1c23', color: '#f4f5f7',
            timer: 2000, showConfirmButton: false
          });
        },
        error: (err) => {
          this.isSubmitting = false;
          Swal.fire({
            icon: 'error',
            title: 'Erreur de création',
            text: err.error?.message || 'Une erreur est survenue lors de la création du client.',
            background: '#1a1c23', color: '#f4f5f7'
          });
        }
      });
    }
  }

  deleteClient(id: string) {
    Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: "Attention, si le client est rattaché à des trajets existants, la suppression échouera.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#3b82f6',
      confirmButtonText: 'Oui, supprimer !',
      cancelButtonText: 'Annuler',
      background: '#1a1c23',
      color: '#f4f5f7'
    }).then((result) => {
      if (result.isConfirmed) {
        this.clientService.deleteClient(id).subscribe({
          next: () => {
            this.loadClients();
            Swal.fire({
              icon: 'success',
              title: 'Supprimé !',
              text: 'Le client a été supprimé.',
              background: '#1a1c23', color: '#f4f5f7',
              timer: 2000, showConfirmButton: false
            });
          },
          error: (err) => {
            console.error('Error deleting client', err);
            Swal.fire({
              icon: 'error',
              title: 'Erreur',
              text: err.error?.message || 'Impossible de supprimer ce client (il a probablement des trajets assignés).',
              background: '#1a1c23', color: '#f4f5f7'
            });
          }
        });
      }
    });
  }
}
