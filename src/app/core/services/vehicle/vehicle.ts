import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../models/api-response.model';
import { Vehiculo } from '../../models/vehiculo.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VehicleService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/Vehiculos/`;

  getAll(): Observable<ApiResponse<Vehiculo[]>> {
    return this.http.get<ApiResponse<Vehiculo[]>>(this.apiUrl);
  }

  getById(id: string): Observable<ApiResponse<Vehiculo>> {
    return this.http.get<ApiResponse<Vehiculo>>(`${this.apiUrl}${id}`);
  }

  create(vehicle: Partial<Vehiculo>): Observable<ApiResponse<Vehiculo>> {
    return this.http.post<ApiResponse<Vehiculo>>(this.apiUrl, vehicle);
  }

  update(id: string, vehicle: Partial<Vehiculo>): Observable<ApiResponse<Vehiculo>> {
    return this.http.put<ApiResponse<Vehiculo>>(`${this.apiUrl}${id}`, vehicle);
  }

  delete(id: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.apiUrl}${id}`);
  }
}
