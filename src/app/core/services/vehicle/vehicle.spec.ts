import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { VehicleService } from './vehicle';
import { environment } from '../../../../environments/environment';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('VehicleService', () => {
  let service: VehicleService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [VehicleService]
    });
    service = TestBed.inject(VehicleService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get all vehicles', () => {
    const mockResponse = { data: [], success: true, message: '', errors: [] };

    service.getAll().subscribe(response => {
      expect(response.data).toEqual([]);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/Vehiculos/`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should get vehicle by id', () => {
    const mockVehicle = { id: '1', placa: 'ABC-123' };
    const mockResponse = { data: mockVehicle, success: true, message: '', errors: [] };

    service.getById('1').subscribe(response => {
      expect(response.data.placa).toBe('ABC-123');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/Vehiculos/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should update a vehicle', () => {
    const mockVehicle = { placa: 'ABC-123-UPDATED' };
    const mockResponse = { data: { ...mockVehicle, id: '1' }, success: true, message: '', errors: [] };

    service.update('1', mockVehicle).subscribe(response => {
      expect(response.data.placa).toBe('ABC-123-UPDATED');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/Vehiculos/1`);
    expect(req.request.method).toBe('PUT');
    req.flush(mockResponse);
  });

  it('should delete a vehicle', () => {
    const mockResponse = { data: true, success: true, message: '', errors: [] };

    service.delete('1').subscribe(response => {
      expect(response.data).toBe(true);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/Vehiculos/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(mockResponse);
  });
});
