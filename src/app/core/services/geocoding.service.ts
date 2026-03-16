import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GeocodingService {
  private http = inject(HttpClient);
  private readonly NOMINATIM_URL = 'https://nominatim.openstreetmap.org';
  private readonly OSRM_URL = 'https://router.project-osrm.org/route/v1';

  /**
   * Forward Geocoding: Address -> Coordinates
   */
  search(query: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.NOMINATIM_URL}/search`, {
      params: {
        q: query,
        format: 'json',
        limit: '5',
        addressdetails: '1'
      }
    });
  }

  /**
   * Reverse Geocoding: Coordinates -> Address
   */
  reverse(lat: number, lon: number): Observable<any> {
    return this.http.get<any>(`${this.NOMINATIM_URL}/reverse`, {
      params: {
        lat: lat.toString(),
        lon: lon.toString(),
        format: 'json'
      }
    });
  }

  /**
   * Get Route: Coordinates A -> Coordinates B
   */
  getRoute(startLat: number, startLon: number, endLat: number, endLon: number): Observable<any> {
    const coords = `${startLon},${startLat};${endLon},${endLat}`;
    return this.http.get<any>(`${this.OSRM_URL}/driving/${coords}`, {
      params: {
        overview: 'full',
        geometries: 'geojson'
      }
    });
  }
}
