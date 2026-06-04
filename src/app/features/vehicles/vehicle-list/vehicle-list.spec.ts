import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VehicleListComponent } from './vehicle-list';
import { VehicleService } from '../../../core/services/vehicle/vehicle';
import { AuthService } from '../../../core/services/auth/auth';
import { of, throwError } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('VehicleListComponent', () => {
  let component: VehicleListComponent;
  let fixture: ComponentFixture<VehicleListComponent>;
  let vehicleServiceSpy = { getAll: vi.fn(), delete: vi.fn() };
  let authServiceSpy = { logout: vi.fn() };

  beforeEach(async () => {
    vehicleServiceSpy.getAll.mockReset();
    vehicleServiceSpy.delete.mockReset();
    authServiceSpy.logout.mockReset();

    vehicleServiceSpy.getAll.mockReturnValue(of({ data: [], success: true, message: '', errors: [] }));

    await TestBed.configureTestingModule({
      imports: [VehicleListComponent, RouterTestingModule],
      providers: [
        { provide: VehicleService, useValue: vehicleServiceSpy },
        { provide: AuthService, useValue: authServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(VehicleListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call delete and reload vehicles', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    vehicleServiceSpy.delete.mockReturnValue(of({ success: true }));
    component.vehicles = [{ id: '1', placa: 'ABC-123' } as any];

    component.deleteVehicle('1');

    expect(vehicleServiceSpy.delete).toHaveBeenCalledWith('1');
    expect(component.vehicles.length).toBe(0);
  });

  it('should handle delete error', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    vehicleServiceSpy.delete.mockReturnValue(throwError(() => new Error('Error')));
    
    component.deleteVehicle('1');

    expect(window.alert).toHaveBeenCalledWith('Error al eliminar el vehículo.');
  });

  it('should not call delete if confirm is cancelled', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    
    component.deleteVehicle('1');

    expect(vehicleServiceSpy.delete).not.toHaveBeenCalled();
  });

  it('should call logout', () => {
    component.logout();
    expect(authServiceSpy.logout).toHaveBeenCalled();
  });

  it('should handle error when loading vehicles', () => {
    vehicleServiceSpy.getAll.mockReturnValue(throwError(() => new Error('Error')));
    
    component.loadVehicles();

    expect(component.errorMessage).toContain('No se pudieron cargar los vehículos');
    expect(component.loading).toBe(false);
  });

  it('should map vehicles correctly when response has Data property', () => {
    const mockResponse = {
      Data: [{
        Id: '1',
        Placa: 'ABC-123',
        Marca: 'Toyota',
        Modelo: 'Corolla',
        Anio: 2020,
        Color: 'Blue'
      }]
    };
    vehicleServiceSpy.getAll.mockReturnValue(of(mockResponse));
    
    component.loadVehicles();

    expect(component.vehicles.length).toBe(1);
    expect(component.vehicles[0].placa).toBe('ABC-123');
  });

  it('should show empty list message when no vehicles are found', () => {
    component.vehicles = [];
    component.loading = false;
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('p').textContent).toContain('No hay vehículos registrados');
  });
});
