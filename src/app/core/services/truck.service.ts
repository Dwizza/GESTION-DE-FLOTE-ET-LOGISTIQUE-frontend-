import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TruckResponse } from '../models/truck.model';

@Injectable({
    providedIn: 'root'
})
export class TruckService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/admin/trucks`;

    getTrucks(): Observable<TruckResponse[]> {
        return this.http.get<TruckResponse[]>(this.apiUrl);
    }

    getTruckById(id: string): Observable<TruckResponse> {
        return this.http.get<TruckResponse>(`${this.apiUrl}/${id}`);
    }

    createTruck(truck: any): Observable<TruckResponse> {
        return this.http.post<TruckResponse>(this.apiUrl, truck);
    }

    deleteTruck(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
