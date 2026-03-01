import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import {
  AuthResponse,
  CodeResponse,
  FacebookAuthRequest,
  GoogleAuthRequest,
  LoginRequest,
  RegisterRequest,
  ResetPasswordConfirmRequest,
  VerifyCodeRequest
} from '../models/auth.model';
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

  requestSignupCode(payload: RegisterRequest): Observable<CodeResponse> {
    return this.http.post<CodeResponse>(`${this.apiBaseUrl}/signup/request-code`, payload);
  }

  verifySignupCode(payload: VerifyCodeRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiBaseUrl}/signup/verify-code`, payload).pipe(
      tap((response) => this.storeSession(response))
    );
  }

  requestPasswordResetCode(email: string): Observable<CodeResponse> {
    return this.http.post<CodeResponse>(`${this.apiBaseUrl}/password-reset/request-code`, { email });
  }

  confirmPasswordReset(payload: ResetPasswordConfirmRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiBaseUrl}/password-reset/confirm`, payload);
  }

  setFirstLoginPassword(newPassword: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiBaseUrl}/first-login/set-password`, { newPassword });
  }

  googleAuth(credential: string, mode: 'signup' | 'login'): Observable<AuthResponse> {
    const body: GoogleAuthRequest = { credential, mode };
    return this.http.post<AuthResponse>(`${this.apiBaseUrl}/google`, body).pipe(
      tap((response) => this.storeSession(response))
    );
  }

  facebookAuth(accessToken: string, mode: 'signup' | 'login'): Observable<AuthResponse> {
    const body: FacebookAuthRequest = { accessToken, mode };
    return this.http.post<AuthResponse>(`${this.apiBaseUrl}/facebook`, body).pipe(
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
