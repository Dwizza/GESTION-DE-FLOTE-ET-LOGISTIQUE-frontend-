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

    ngOnInit(): void {
        this.loadClients();
    }

    loadClients() {
        this.isLoading = true;
        this.clientService.getClients().subscribe({
            next: (data: ClientResponse[]) => {
                this.clients = data;
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
}
