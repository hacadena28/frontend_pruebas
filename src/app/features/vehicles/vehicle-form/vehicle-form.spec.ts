import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VehicleFormComponent } from './vehicle-form';
import { ReactiveFormsModule } from '@angular/forms';
import { VehicleService } from '../../../core/services/vehicle/vehicle';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { CommonModule } from '@angular/common';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('VehicleFormComponent', () => {
  let component: VehicleFormComponent;
  let fixture: ComponentFixture<VehicleFormComponent>;
  let vehicleServiceSpy: any;
  let routerSpy = { navigate: vi.fn() };
  let activatedRouteMock: any;

  beforeEach(async () => {
    vehicleServiceSpy = {
      getById: vi.fn(),
      create: vi.fn(),
      update: vi.fn()
    };

    activatedRouteMock = {
      snapshot: {
        paramMap: {
          get: vi.fn().mockReturnValue(null)
        }
      }
    };

    await TestBed.configureTestingModule({
      imports: [VehicleFormComponent, ReactiveFormsModule, CommonModule],
      providers: [
        { provide: VehicleService, useValue: vehicleServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(VehicleFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize in create mode when no id is present', () => {
    expect(component.isEditMode).toBe(false);
  });

  it('should initialize in edit mode when id is present', async () => {
    activatedRouteMock.snapshot.paramMap.get.mockReturnValue('123');
    vehicleServiceSpy.getById.mockReturnValue(of({ data: { placa: 'ABC-123', marca: 'Toyota' } }));
    
    component.ngOnInit();
    
    expect(component.isEditMode).toBe(true);
    expect(vehicleServiceSpy.getById).toHaveBeenCalledWith('123');
  });

  it('should call create when form is valid and not in edit mode', () => {
    component.vehicleForm.patchValue({
      placa: 'ABC-123',
      marca: 'Toyota',
      modelo: 'Corolla',
      anio: 2022,
      color: 'Red'
    });
    vehicleServiceSpy.create.mockReturnValue(of({ success: true }));

    component.onSubmit();

    expect(vehicleServiceSpy.create).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/vehicles']);
  });

  it('should call update when form is valid and in edit mode', () => {
    component.isEditMode = true;
    component.vehicleId = '123';
    component.vehicleForm.patchValue({
      placa: 'ABC-123',
      marca: 'Toyota',
      modelo: 'Corolla',
      anio: 2022,
      color: 'Red'
    });
    vehicleServiceSpy.update.mockReturnValue(of({ success: true }));

    component.onSubmit();

    expect(vehicleServiceSpy.update).toHaveBeenCalledWith('123', expect.any(Object));
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/vehicles']);
  });

  it('should show error message on submit failure', () => {
    component.vehicleForm.patchValue({
      placa: 'ABC-123',
      marca: 'Toyota',
      modelo: 'Corolla',
      anio: 2022,
      color: 'Red'
    });
    vehicleServiceSpy.create.mockReturnValue(throwError(() => ({ error: { message: 'Creation failed' } })));

    component.onSubmit();

    expect(component.errorMessage).toBe('Creation failed');
  });
});
