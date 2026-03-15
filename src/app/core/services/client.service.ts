import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ClientResponse } from '../models/client.model';

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
