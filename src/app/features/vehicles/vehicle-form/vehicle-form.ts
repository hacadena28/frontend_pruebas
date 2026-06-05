import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { VehicleService } from '../../../core/services/vehicle/vehicle';
import { Vehiculo } from '../../../core/models/vehiculo.model';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-vehicle-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './vehicle-form.html',
  styleUrls: ['./vehicle-form.scss']
})
export class VehicleFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private vehicleService = inject(VehicleService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  vehicleForm = this.fb.group({
    placa: ['', [Validators.required, Validators.pattern(/^[A-Z]{3}-?\d{3,4}$/i)]],
    marca: ['', Validators.required],
    modelo: ['', Validators.required],
    anio: [new Date().getFullYear(), [Validators.required, Validators.min(1900), Validators.max(new Date().getFullYear() + 1)]],
    color: ['', Validators.required]
  });

  isEditMode = false;
  vehicleId: string | null = null;
  loading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.vehicleId = this.route.snapshot.paramMap.get('id');
    if (this.vehicleId) {
      this.isEditMode = true;
      this.loadVehicle();
    }
  }

  loadVehicle(): void {
    if (!this.vehicleId) return;
    this.loading = true;
    this.errorMessage = '';
    this.vehicleService.getById(this.vehicleId)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (res: any) => {
          console.log('Vehicle data loaded:', res);
          const data = res?.data || res?.Data;
          if (data) {
            const normalizedData = {
              placa: data.placa || data.Placa,
              marca: data.marca || data.Marca,
              modelo: data.modelo || data.Modelo,
              anio: data.anio || data.Anio,
              color: data.color || data.Color
            };
            this.vehicleForm.patchValue(normalizedData);
          }

        },
        error: (err) => {
          console.error('Error loading vehicle:', err);
          this.errorMessage = 'No se pudo cargar la información del vehículo.';
        }
      });
  }

  onSubmit(): void {
    if (this.vehicleForm.valid) {
      this.loading = true;
      const vehicleData = this.vehicleForm.value as Partial<Vehiculo>;

      const request = (this.isEditMode && this.vehicleId)
        ? this.vehicleService.update(this.vehicleId, vehicleData)
        : this.vehicleService.create(vehicleData);

      request
        .pipe(finalize(() => this.loading = false))
        .subscribe({
          next: () => this.router.navigate(['/vehicles']),
          error: (err) => {
            this.errorMessage = err.error?.Message || err.error?.message || 'Error al procesar la solicitud.';
          }
        });
    }
  }
}
