import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

import { TrackingPoint } from '../models/tracking.model';

@Injectable({
  providedIn: 'root'
})
export class TrackingService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/tracking`;

  getLivePositions(): Observable<TrackingPoint[]> {
    return this.http.get<TrackingPoint[]>(`${this.apiUrl}/live`);
  }

  getTripPath(tripId: string): Observable<TrackingPoint[]> {
    return this.http.get<TrackingPoint[]>(`${this.apiUrl}/trip/${tripId}`);
  }
}
