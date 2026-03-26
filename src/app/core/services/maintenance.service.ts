import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MaintenanceResponse } from '../models/maintenance.model';
import { PaginatedResponse } from '../models/pagination.model';

@Injectable({
    providedIn: 'root'
})
export class MaintenanceService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/maintenances`;

    getMaintenances(): Observable<MaintenanceResponse[]> {
        return this.http.get<MaintenanceResponse[]>(this.apiUrl);
    }

    getMaintenancesPaginated(page: number = 0, size: number = 10): Observable<PaginatedResponse<MaintenanceResponse>> {
        return this.http.get<PaginatedResponse<MaintenanceResponse>>(`${this.apiUrl}/page?page=${page}&size=${size}`);
    }

    createMaintenance(maintenance: any): Observable<MaintenanceResponse> {
        return this.http.post<MaintenanceResponse>(this.apiUrl, maintenance);
    }

    updateMaintenance(id: string, maintenance: any): Observable<MaintenanceResponse> {
        return this.http.put<MaintenanceResponse>(`${this.apiUrl}/${id}`, maintenance);
    }

    deleteMaintenance(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
