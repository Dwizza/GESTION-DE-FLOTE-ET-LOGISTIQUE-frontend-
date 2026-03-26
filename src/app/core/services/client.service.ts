import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ClientResponse } from '../models/client.model';
import { PaginatedResponse } from '../models/pagination.model';

@Injectable({
    providedIn: 'root'
})
export class ClientService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/admin/clients`;
    private createUrl = `${environment.apiUrl}/admin/create/client`;

    getClients(): Observable<ClientResponse[]> {
        return this.http.get<ClientResponse[]>(this.apiUrl);
    }

    getClientsPaginated(page: number = 0, size: number = 10): Observable<PaginatedResponse<ClientResponse>> {
        return this.http.get<PaginatedResponse<ClientResponse>>(`${this.apiUrl}/page?page=${page}&size=${size}`);
    }

    createClient(client: any): Observable<ClientResponse> {
        return this.http.post<ClientResponse>(this.createUrl, client);
    }

    updateClient(id: string, client: any): Observable<ClientResponse> {
        return this.http.put<ClientResponse>(`${this.apiUrl}/${id}`, client);
    }

    deleteClient(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
