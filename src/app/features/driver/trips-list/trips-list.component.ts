import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DriverService } from '../../../core/services/driver.service';
import { TripResponse } from '../../../core/models/trip.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-driver-trips-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-8">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div class="flex items-center gap-3 mb-1">
            <span class="live-dot"></span>
            <span class="text-xs font-mono uppercase tracking-widest" style="color: #4b5563;">VOS ASSIGNATIONS</span>
          </div>
          <h1 class="section-title">Mes Trajets</h1>
          <p class="section-subtitle">Gérez vos missions et mettez à jour vos statuts de livraison</p>
        </div>
        <button (click)="loadTrips()" class="btn-fleet-ghost">
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Actualiser
        </button>
      </div>
    
      <!-- Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        @for (trip of trips; track trip) {
          <div class="fleet-card p-0 overflow-hidden">
            <!-- Card Header Decoration -->
            <div class="h-1.5 w-full" [ngStyle]="{'background': trip.status === 'ONGOING' ? '#3b82f6' : (trip.status === 'PLANNED' ? '#f59e0b' : '#10b981')}"></div>
            <div class="p-6">
              <div class="flex items-center justify-between mb-6">
                <div class="flex items-center gap-3">
                  <div class="h-10 w-10 rounded-lg flex items-center justify-center font-mono font-bold text-sm"
                    style="background: #1e2025; border: 1px solid #2a2d35; color: #3b82f6;">
                    TR
                  </div>
                  <div>
                    <h3 class="text-base font-bold text-white tracking-tight uppercase">{{ trip.reference }}</h3>
                    <p class="text-[10px] font-mono" style="color: #4b5563;">#{{ trip.id.substring(0,8) }}</p>
                  </div>
                </div>
                <span [ngClass]="{
                  'badge-maintenance': trip.status === 'PLANNED',
                  'badge-intuse': trip.status === 'ONGOING',
                  'badge-available': trip.status === 'COMPLETED',
                  'badge-broken': trip.status === 'CANCELLED' || trip.status === 'REFUSED_BY_DRIVER'
                }">
                  {{ trip.status }}
                </span>
              </div>
              <div class="grid grid-cols-2 gap-6 mb-6">
                <div class="space-y-1">
                  <span class="fleet-label">Client</span>
                  <p class="text-sm font-semibold text-white truncate">{{ trip.client.companyName }}</p>
                </div>
                <div class="space-y-1">
                  <span class="fleet-label">Date de Départ</span>
                  <p class="text-sm font-semibold text-white">{{ trip.startDate | date:'dd MMM, HH:mm' }}</p>
                </div>
                <div class="space-y-1">
                  <span class="fleet-label">Camion</span>
                  <p class="text-sm font-semibold" style="color: #9ca3af;">{{ trip.trucks && trip.trucks.length > 0 ? trip.trucks[0].registrationNumber : 'N/A' }}</p>
                </div>
                <div class="space-y-1">
                  <span class="fleet-label">Remorque</span>
                  <p class="text-sm font-semibold" style="color: #9ca3af;">{{ trip.trailers && trip.trailers.length > 0 ? trip.trailers[0].type : 'N/A' }}</p>
                </div>
              </div>
              <!-- Action Area -->
              @if (trip.status === 'PLANNED') {
                <div class="flex items-center gap-3 pt-4" style="border-top: 1px solid #1e2025;">
                  <button (click)="acceptTrip(trip)" class="btn-fleet flex-1">
                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Accepter le Trajet
                  </button>
                  <button (click)="refuseTrip(trip)" class="btn-fleet-ghost flex-1 justify-center border-red-500/20 hover:bg-red-500/10 hover:text-red-400">
                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Refuser
                  </button>
                </div>
              }
              @if (trip.status === 'ONGOING') {
                <div class="flex items-center gap-3 pt-4" style="border-top: 1px solid #1e2025;">
                  <button (click)="completeTrip(trip)" class="btn-fleet flex-1"
                    style="background: linear-gradient(135deg, #10b981, #059669); border: none;">
                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Terminer la Mission
                  </button>
                </div>
              }
            </div>
          </div>
        }
      </div>
    
      <!-- Empty State -->
      @if (trips.length === 0 && !isLoading) {
        <div class="py-20 text-center fleet-card bg-transparent border-dashed">
          <div class="h-16 w-16 mx-auto rounded-full flex items-center justify-center mb-4" style="background: #141518; border: 1px solid #2a2d35;">
            <svg class="h-8 w-8" style="color: #4b5563;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 class="text-base font-bold text-white mb-1">Aucun trajet assigné</h3>
          <p class="text-sm" style="color: #4b5563;">Les nouvelles missions apparaîtront ici dès leur allocation.</p>
        </div>
      }
    
      <!-- Pagination -->
      @if (!isLoading && totalElements > 0) {
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 mt-4 border-t border-gray-800/50">
          <div class="text-xs font-mono text-gray-500">
            Affichage de <span class="text-gray-300">{{ currentPage * pageSize + 1 }}</span> à
            <span class="text-gray-300">{{ (currentPage + 1) * pageSize > totalElements ? totalElements : (currentPage + 1) * pageSize }}</span> sur
            <span class="text-gray-300">{{ totalElements }}</span> trajets
          </div>
          <div class="flex items-center gap-2">
            <button (click)="onPageChange(currentPage - 1)" [disabled]="currentPage === 0"
              class="p-2 rounded-lg bg-gray-900 border border-gray-800 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span class="text-xs font-mono px-3 py-2 rounded-lg bg-gray-900 border border-gray-800 text-gray-300">
              Page {{ currentPage + 1 }} / {{ totalPages }}
            </span>
            <button (click)="onPageChange(currentPage + 1)" [disabled]="isLastPage"
              class="p-2 rounded-lg bg-gray-900 border border-gray-800 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      }
    </div>
    `
})
export class DriverTripsListComponent implements OnInit {
  private driverService = inject(DriverService);
  trips: TripResponse[] = [];
  isLoading = false;

  // Pagination
  currentPage = 0;
  pageSize = 6;
  totalElements = 0;
  totalPages = 0;
  isLastPage = false;

  ngOnInit() {
    this.loadTrips();
  }

  loadTrips() {
    this.isLoading = true;
    this.driverService.getAssignedTripsPaginated(this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        this.trips = response.content;
        this.totalElements = response.totalElements;
        this.totalPages = response.totalPages;
        this.isLastPage = response.last;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading driver trips', err);
        this.isLoading = false;
      }
    });
  }

  onPageChange(page: number) {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadTrips();
    }
  }

  acceptTrip(trip: TripResponse) {
    Swal.fire({
      title: 'Confirm Assignment',
      text: "You are about to start this trip. All resources will be locked.",
      icon: 'info',
      showCancelButton: true,
      background: '#0f172a',
      color: '#cbd5e1',
      confirmButtonColor: '#059669',
      cancelButtonColor: '#334155',
      confirmButtonText: 'Yes, start now!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.driverService.acceptTrip(trip.id).subscribe({
          next: () => {
            Swal.fire({
              title: 'Success!',
              text: 'Trip is now ongoing.',
              icon: 'success',
              background: '#0f172a',
              color: '#cbd5e1',
              confirmButtonColor: '#3b82f6'
            });
            this.loadTrips();
          },
          error: (err) => {
            Swal.fire({
              title: 'Error',
              text: err.error?.message || 'Failed to accept trip',
              icon: 'error',
              background: '#0f172a',
              color: '#cbd5e1'
            });
          }
        });
      }
    });
  }

  refuseTrip(trip: TripResponse) {
    Swal.fire({
      title: 'Refuse Assignment?',
      text: "Please note that refusing a trip may require a valid justification to the manager.",
      icon: 'warning',
      showCancelButton: true,
      background: '#0f172a',
      color: '#cbd5e1',
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#334155',
      confirmButtonText: 'Yes, refuse it'
    }).then((result) => {
      if (result.isConfirmed) {
        this.driverService.refuseTrip(trip.id).subscribe({
          next: () => {
            Swal.fire({
              title: 'Refused',
              text: 'The trip assignment has been refused.',
              icon: 'warning',
              background: '#0f172a',
              color: '#cbd5e1'
            });
            this.loadTrips();
          },
          error: (err) => {
            Swal.fire({
              title: 'Error',
              text: err.error?.message || 'Failed to refuse trip',
              icon: 'error',
              background: '#0f172a',
              color: '#cbd5e1'
            });
          }
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
      background: '#0f172a',
      color: '#cbd5e1',
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#334155',
      confirmButtonText: 'Oui, Terminer',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.driverService.completeTrip(trip.id).subscribe({
          next: () => {
            Swal.fire({
              title: 'Success!',
              text: 'Trip completed successfully.',
              icon: 'success',
              background: '#0f172a',
              color: '#cbd5e1',
              confirmButtonColor: '#10b981'
            });
            this.loadTrips();
          },
          error: (err) => {
            Swal.fire({
              title: 'Error',
              text: err.error?.message || 'Failed to complete trip',
              icon: 'error',
              background: '#0f172a',
              color: '#cbd5e1'
            });
          }
        });
      }
    });
  }
}
