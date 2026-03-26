import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TruckResponse } from '../models/truck.model';
import { PaginatedResponse } from '../models/pagination.model';

@Injectable({
    providedIn: 'root'
})
export class TruckService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/admin/trucks`;

    getTrucks(): Observable<TruckResponse[]> {
        return this.http.get<TruckResponse[]>(this.apiUrl);
    }

    getTrucksPaginated(page: number = 0, size: number = 10): Observable<PaginatedResponse<TruckResponse>> {
        return this.http.get<PaginatedResponse<TruckResponse>>(`${this.apiUrl}/page?page=${page}&size=${size}`);
    }

    getTruckById(id: string): Observable<TruckResponse> {
        return this.http.get<TruckResponse>(`${this.apiUrl}/${id}`);
    }

    createTruck(truck: any): Observable<TruckResponse> {
        return this.http.post<TruckResponse>(this.apiUrl, truck);
    }

    updateTruck(id: string, truck: any): Observable<TruckResponse> {
        return this.http.put<TruckResponse>(`${this.apiUrl}/${id}`, truck);
    }

    deleteTruck(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
