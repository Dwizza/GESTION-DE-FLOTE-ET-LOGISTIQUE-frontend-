import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TrailerResponse } from '../models/trailer.model';

@Injectable({
    providedIn: 'root'
})
export class TrailerService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/admin/trailers`;

    getTrailers(): Observable<TrailerResponse[]> {
        return this.http.get<TrailerResponse[]>(this.apiUrl);
    }

    getTrailerById(id: string): Observable<TrailerResponse> {
        return this.http.get<TrailerResponse>(`${this.apiUrl}/${id}`);
    }

    createTrailer(trailer: any): Observable<TrailerResponse> {
        return this.http.post<TrailerResponse>(this.apiUrl, trailer);
    }

    updateTrailer(id: string, trailer: any): Observable<TrailerResponse> {
        return this.http.put<TrailerResponse>(`${this.apiUrl}/${id}`, trailer);
    }

    deleteTrailer(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
