import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ManagerResponse } from '../models/manager.model';

@Injectable({
    providedIn: 'root'
})
export class ManagerManagementService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/admin`;

    getManagers(): Observable<ManagerResponse[]> {
        return this.http.get<ManagerResponse[]>(`${this.apiUrl}/managers`);
    }

    createManager(manager: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/create/manager`, manager);
    }

    deleteManager(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/delete/manager/${id}`);
    }
}
