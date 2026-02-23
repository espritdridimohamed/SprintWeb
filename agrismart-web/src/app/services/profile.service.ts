import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserProfileResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roleId: string;
  organization?: string;
  accountType?: string;
  profilePictureUrl?: string;
  status?: string;
  isClientApproved?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  organization: string;
  accountType: string;
  profilePictureUrl: string;
  roleId: string;
  status: string;
}

export interface DbRole {
  id: string;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly apiBaseUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  getProfileByEmail(email: string): Observable<UserProfileResponse> {
    const encodedEmail = encodeURIComponent(email);
    return this.http.get<UserProfileResponse>(`${this.apiBaseUrl}/users/email/${encodedEmail}`);
  }

  updateProfile(userId: string, payload: UpdateProfileRequest): Observable<UserProfileResponse> {
    return this.http.put<UserProfileResponse>(`${this.apiBaseUrl}/users/${userId}`, payload);
  }

  updatePassword(userId: string, currentPassword: string, newPassword: string): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiBaseUrl}/users/${userId}/password`, {
      currentPassword,
      newPassword
    });
  }

  getRoles(): Observable<DbRole[]> {
    return this.http.get<DbRole[]>(`${this.apiBaseUrl}/roles`);
  }
}
