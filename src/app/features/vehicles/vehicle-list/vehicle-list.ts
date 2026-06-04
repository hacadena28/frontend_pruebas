import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { VehicleService } from '../../../core/services/vehicle/vehicle';
import { Vehiculo } from '../../../core/models/vehiculo.model';
import { AuthService } from '../../../core/services/auth/auth';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-vehicle-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
<div class="min-h-screen bg-gray-50">
  <nav class="bg-white shadow">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex">
          <div class="flex-shrink-0 flex items-center">
            <h1 class="text-xl font-bold text-blue-600">Vehicle Manager</h1>
          </div>
        </div>
        <div class="flex items-center">
          <button (click)="logout()" class="ml-4 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700">
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  </nav>

  <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
    <div class="px-4 py-6 sm:px-0">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-semibold text-gray-900">Listado de Vehículos</h2>
        <a routerLink="/vehicles/new" class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
          Nuevo Vehículo
        </a>
      </div>

      <div *ngIf="loading" class="flex justify-center py-10">
        <svg class="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>

      <div *ngIf="errorMessage" class="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
        <p class="text-sm text-red-700">{{ errorMessage }}</p>
      </div>

      <div *ngIf="!loading && (!vehicles || vehicles.length === 0)" class="text-center py-10 bg-white rounded-lg shadow">
        <p class="text-gray-500">No hay vehículos registrados.</p>
      </div>

      <div *ngIf="!loading && vehicles && vehicles.length > 0" class="bg-white shadow overflow-hidden sm:rounded-md">
        <ul class="divide-y divide-gray-200">
          <li *ngFor="let vehicle of vehicles">
            <div class="px-4 py-4 sm:px-6 flex items-center justify-between">
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-blue-600 truncate">
                  {{ vehicle.marca }} {{ vehicle.modelo }} ({{ vehicle.anio }})
                </p>
                <div class="mt-2 flex">
                  <div class="flex items-center text-sm text-gray-500">
                    <span class="mr-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Placa: {{ vehicle.placa }}
                    </span>
                    <span class="mr-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                      Color: {{ vehicle.color }}
                    </span>
                  </div>
                </div>
              </div>
              <div class="ml-5 flex-shrink-0 space-x-2">
                <a [routerLink]="['/vehicles/edit', vehicle.id]" class="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  Editar
                </a>
                <button (click)="deleteVehicle(vehicle.id)" class="inline-flex items-center px-3 py-1 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700">
                  Eliminar
                </button>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </main>
</div>
`,
  styles: []
})
export class VehicleListComponent implements OnInit {
  private vehicleService = inject(VehicleService);
  private authService = inject(AuthService);

  vehicles: Vehiculo[] = [];
  loading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.loadVehicles();
  }

  loadVehicles(): void {
    this.loading = true;
    this.errorMessage = '';
    this.vehicleService.getAll()
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (res: any) => {
          console.log('API Response:', res);
          const data = res?.data || res?.Data || [];
          this.vehicles = data.map((v: any) => ({
            id: v.id || v.Id,
            placa: v.placa || v.Placa,
            marca: v.marca || v.Marca,
            modelo: v.modelo || v.Modelo,
            anio: v.anio || v.Anio,
            color: v.color || v.Color,
            fechaRegistro: v.fechaRegistro || v.FechaRegistro
          }));
        },
        error: (err) => {
          console.error('API Error:', err);
          this.errorMessage = 'No se pudieron cargar los vehículos. Verifique la conexión con el servidor.';
        }
      });
  }

  deleteVehicle(id: string): void {
    if (confirm('¿Está seguro de que desea eliminar este vehículo?')) {
      this.vehicleService.delete(id).subscribe({
        next: () => {
          this.vehicles = this.vehicles.filter(v => v.id !== id);
        },
        error: () => {
          alert('Error al eliminar el vehículo.');
        }
      });
    }
  }

  logout(): void {
    this.authService.logout();
  }
}
