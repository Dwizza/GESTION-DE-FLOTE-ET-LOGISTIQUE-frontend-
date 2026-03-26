import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ManagerResponse } from '../models/manager.model';
import { PaginatedResponse } from '../models/pagination.model';

@Injectable({
    providedIn: 'root'
})
export class ManagerManagementService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/admin`;

    getManagers(): Observable<ManagerResponse[]> {
        return this.http.get<ManagerResponse[]>(`${this.apiUrl}/managers`);
    }

    getManagersPaginated(page: number = 0, size: number = 10): Observable<PaginatedResponse<ManagerResponse>> {
        return this.http.get<PaginatedResponse<ManagerResponse>>(`${this.apiUrl}/managers/page?page=${page}&size=${size}`);
    }

    createManager(manager: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/create/manager`, manager);
    }

    deleteManager(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/delete/manager/${id}`);
    }
}
