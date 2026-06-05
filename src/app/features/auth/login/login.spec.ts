import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth/auth';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { CommonModule } from '@angular/common';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy = { login: vi.fn() };
  let routerSpy = { navigate: vi.fn() };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule, CommonModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have invalid form when empty', () => {
    expect(component.loginForm.valid).toBe(false);
  });

  it('should call login on submit when valid', () => {
    component.loginForm.patchValue({
      email: 'test@test.com',
      password: 'password123'
    });
    authServiceSpy.login.mockReturnValue(of({ token: 'test-token' }));

    component.onSubmit();

    expect(authServiceSpy.login).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/vehicles']);
  });

  it('should handle login error', () => {
    component.loginForm.patchValue({
      email: 'test@test.com',
      password: 'password123'
    });
    const errorResponse = { error: { Message: 'Invalid credentials' } };
    authServiceSpy.login.mockReturnValue(throwError(() => errorResponse));

    component.onSubmit();

    expect(component.errorMessage).toBe('Invalid credentials');
    expect(component.loading).toBe(false);
  });

  it('should handle login error without message', () => {
    component.loginForm.patchValue({
      email: 'test@test.com',
      password: 'password123'
    });
    authServiceSpy.login.mockReturnValue(throwError(() => ({ error: {} })));

    component.onSubmit();

    expect(component.errorMessage).toBe('Error al iniciar sesión. Verifique sus credenciales.');
  });

  it('should show validation messages when fields are touched and invalid', () => {
    const emailControl = component.loginForm.get('email');
    emailControl?.setValue('invalid-email');
    emailControl?.markAsTouched();
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.text-red-600').textContent).toContain('Ingrese un correo válido');
  });
});
