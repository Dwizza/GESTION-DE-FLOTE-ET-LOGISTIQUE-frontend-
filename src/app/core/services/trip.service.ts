import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TripResponse } from '../models/trip.model';
import { PaginatedResponse } from '../models/pagination.model';

@Injectable({
    providedIn: 'root'
})
export class TripService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/manager/trips`;

    getTrips(): Observable<TripResponse[]> {
        return this.http.get<TripResponse[]>(this.apiUrl);
    }

    getTripsPaginated(page: number = 0, size: number = 10): Observable<PaginatedResponse<TripResponse>> {
        return this.http.get<PaginatedResponse<TripResponse>>(`${this.apiUrl}/page?page=${page}&size=${size}`);
    }

    createTrip(trip: any): Observable<TripResponse> {
        return this.http.post<TripResponse>(this.apiUrl, trip);
    }

    updateTrip(id: string, trip: any): Observable<TripResponse> {
        return this.http.put<TripResponse>(`${this.apiUrl}/${id}`, trip);
    }

    deleteTrip(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
