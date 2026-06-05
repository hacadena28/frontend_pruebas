import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login';
import { VehicleListComponent } from './features/vehicles/vehicle-list/vehicle-list';
import { VehicleFormComponent } from './features/vehicles/vehicle-form/vehicle-form';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { 
    path: 'vehicles', 
    component: VehicleListComponent, 
    canActivate: [authGuard] 
  },
  { 
    path: 'vehicles/new', 
    component: VehicleFormComponent, 
    canActivate: [authGuard] 
  },
  { 
    path: 'vehicles/edit/:id', 
    component: VehicleFormComponent, 
    canActivate: [authGuard] 
  },
  { path: '', redirectTo: '/vehicles', pathMatch: 'full' },
  { path: '**', redirectTo: '/vehicles' }
];
