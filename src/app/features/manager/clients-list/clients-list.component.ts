import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientService } from '../../../core/services/client.service';
import { ClientResponse } from '../../../core/models/client.model';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-manager-clients-list',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './clients-list.component.html'
})
export class ManagerClientsListComponent implements OnInit {
    private clientService = inject(ClientService);

    clients: ClientResponse[] = [];
    isLoading = true;

    // Pagination
    currentPage = 0;
    pageSize = 10;
    totalElements = 0;
    totalPages = 0;
    isLastPage = false;

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
            error: (err: any) => {
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
}
