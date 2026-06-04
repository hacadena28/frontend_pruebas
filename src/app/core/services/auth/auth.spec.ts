import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth';
import { environment } from '../../../../environments/environment';
import { Router } from '@angular/router';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let routerSpy = { navigate: vi.fn() };

  beforeEach(() => {
    const localStorageMock = (() => {
      let store: { [key: string]: string } = {};
      return {
        getItem: vi.fn((key: string) => store[key] || null),
        setItem: vi.fn((key: string, value: string) => { store[key] = value.toString(); }),
        removeItem: vi.fn((key: string) => { delete store[key]; }),
        clear: vi.fn(() => { store = {}; })
      };
    })();
    vi.stubGlobal('localStorage', localStorageMock);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: Router, useValue: routerSpy }
      ]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    try { localStorage.clear(); } catch(e) {}
    vi.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should login and store token', () => {
    const mockResponse = { token: 'fake-jwt-token' };
    const credentials = { email: 'test@test.com', password: 'password123' };

    service.login(credentials).subscribe(response => {
      expect(response.token).toBe('fake-jwt-token');
      expect(localStorage.getItem('token')).toBe('fake-jwt-token');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/Auth/login`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should logout and remove token', () => {
    localStorage.setItem('token', 'fake-token');
    service.logout();
    expect(localStorage.getItem('token')).toBeNull();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should return token from localStorage', () => {
    localStorage.setItem('token', 'test-token');
    expect(service.getToken()).toBe('test-token');
  });

  it('should return true if user is logged in', () => {
    localStorage.setItem('token', 'test-token');
    expect(service.isLoggedIn()).toBe(true);
  });

  it('should return false if user is not logged in', () => {
    localStorage.removeItem('token');
    expect(service.isLoggedIn()).toBe(false);
  });
});
