import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthResponse, LoginRequest, RegisterRequest } from '../models/auth.model';
import { RoleService } from './role.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiBaseUrl = 'http://localhost:8080/api/auth';
  private readonly tokenKey = 'agrismart_token';
  private readonly userKey = 'agrismart_user';

  private get canUseStorage(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  constructor(private http: HttpClient, private roleService: RoleService) {
    this.restoreSession();
  }

  login(payload: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiBaseUrl}/login`, payload).pipe(
      tap((response) => this.storeSession(response))
    );
  }

  register(payload: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiBaseUrl}/register`, payload).pipe(
      tap((response) => this.storeSession(response))
    );
  }

  storeSession(response: AuthResponse): void {
    if (this.canUseStorage) {
      localStorage.setItem(this.tokenKey, response.token);
      localStorage.setItem(this.userKey, JSON.stringify(response));
    }
    this.roleService.setRoleFromBackendRole(response.role);
  }

  restoreSession(): void {
    if (!this.canUseStorage) {
      return;
    }

    const token = this.getToken();
    const rawUser = localStorage.getItem(this.userKey);
    if (!token || !rawUser) {
      return;
    }

    try {
      const user = JSON.parse(rawUser) as AuthResponse;
      this.roleService.setRoleFromBackendRole(user.role);
    } catch {
      this.logout();
    }
  }

  logout(): void {
    if (this.canUseStorage) {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.userKey);
    }
    this.roleService.clearRole();
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    if (!this.canUseStorage) {
      return null;
    }

    return localStorage.getItem(this.tokenKey);
  }

  getCurrentUser(): AuthResponse | null {
    if (!this.canUseStorage) {
      return null;
    }

    const rawUser = localStorage.getItem(this.userKey);
    if (!rawUser) {
      return null;
    }

    try {
      return JSON.parse(rawUser) as AuthResponse;
    } catch {
      return null;
    }
  }

  updateStoredUser(patch: Partial<AuthResponse>): void {
    if (!this.canUseStorage) {
      return;
    }

    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      return;
    }

    const updatedUser = { ...currentUser, ...patch };
    localStorage.setItem(this.userKey, JSON.stringify(updatedUser));
  }
}
