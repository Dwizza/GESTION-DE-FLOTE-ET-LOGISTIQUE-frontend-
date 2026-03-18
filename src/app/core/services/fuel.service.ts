import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CarburantTransactionResponse } from '../models/fuel.model';

@Injectable({
    providedIn: 'root'
})
export class FuelService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/carburants`;

    getFuelTransactions(): Observable<CarburantTransactionResponse[]> {
        return this.http.get<CarburantTransactionResponse[]>(this.apiUrl);
    }

    createFuelTransaction(transaction: any): Observable<CarburantTransactionResponse> {
        return this.http.post<CarburantTransactionResponse>(this.apiUrl, transaction);
    }

    updateFuelTransaction(id: string, transaction: any): Observable<CarburantTransactionResponse> {
        return this.http.put<CarburantTransactionResponse>(`${this.apiUrl}/${id}`, transaction);
    }

    deleteFuelTransaction(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
