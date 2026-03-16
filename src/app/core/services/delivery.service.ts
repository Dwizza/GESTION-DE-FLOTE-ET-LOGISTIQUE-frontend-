import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DeliveryResponse } from '../models/delivery.model';

@Injectable({
    providedIn: 'root'
})
export class DeliveryService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/manager/deliveries`;

    getDeliveries(): Observable<DeliveryResponse[]> {
        return this.http.get<DeliveryResponse[]>(this.apiUrl);
    }

    createDelivery(delivery: any): Observable<DeliveryResponse> {
        return this.http.post<DeliveryResponse>(this.apiUrl, delivery);
    }

    updateDelivery(id: string, delivery: any): Observable<DeliveryResponse> {
        return this.http.put<DeliveryResponse>(`${this.apiUrl}/${id}`, delivery);
    }

    deleteDelivery(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
