import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TripResponse } from '../models/trip.model';
import { DriverResponse } from '../models/driver.model';
import { PaginatedResponse } from '../models/pagination.model';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class DriverService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/driver`;

    getAssignedTrips() {
        return this.http.get<TripResponse[]>(`${this.apiUrl}/trips`);
    }

    getAssignedTripsPaginated(page: number = 0, size: number = 10): Observable<PaginatedResponse<TripResponse>> {
        return this.http.get<PaginatedResponse<TripResponse>>(`${this.apiUrl}/trips/page?page=${page}&size=${size}`);
    }

    acceptTrip(tripId: string) {
        return this.http.post<TripResponse>(`${this.apiUrl}/trips/${tripId}/accept`, {});
    }

    refuseTrip(tripId: string) {
        return this.http.post<TripResponse>(`${this.apiUrl}/trips/${tripId}/refuse`, {});
    }

    completeTrip(tripId: string, distance?: number) {
        return this.http.post<TripResponse>(`${this.apiUrl}/trips/${tripId}/complete`, { distance });
    }

    // Management Methods
    getDrivers(): Observable<DriverResponse[]> {
        return this.http.get<DriverResponse[]>(`${environment.apiUrl}/admin/drivers`);
    }

    getDriversPaginated(page: number = 0, size: number = 10): Observable<PaginatedResponse<DriverResponse>> {
        return this.http.get<PaginatedResponse<DriverResponse>>(`${environment.apiUrl}/admin/drivers/page?page=${page}&size=${size}`);
    }

    getDriverById(id: string): Observable<DriverResponse> {
        return this.http.get<DriverResponse>(`${environment.apiUrl}/admin/driver/${id}`);
    }

    createDriver(driver: any): Observable<any> {
        return this.http.post<any>(`${environment.apiUrl}/admin/create/driver`, driver);
    }

    updateDriver(id: string, driver: any): Observable<DriverResponse> {
        return this.http.put<DriverResponse>(`${environment.apiUrl}/admin/update/driver/${id}`, driver);
    }

    deleteDriver(id: string): Observable<void> {
        return this.http.delete<void>(`${environment.apiUrl}/admin/delete/driver/${id}`);
    }

    getDriverTrips(id: string): Observable<TripResponse[]> {
        return this.http.get<TripResponse[]>(`${environment.apiUrl}/admin/driver/${id}/trips`);
    }

    getDriverTripsPaginated(id: string, page: number = 0, size: number = 10): Observable<PaginatedResponse<TripResponse>> {
        return this.http.get<PaginatedResponse<TripResponse>>(`${environment.apiUrl}/admin/driver/${id}/trips/page?page=${page}&size=${size}`);
    }
}
