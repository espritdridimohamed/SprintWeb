import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { RoleKey } from '../models/role.model';

@Injectable({ providedIn: 'root' })
export class RoleService {
  private readonly roleStorageKey = 'agrismart_role';
  private readonly roleSubject = new BehaviorSubject<RoleKey>(this.getStoredRole());
  role$ = this.roleSubject.asObservable();

  private get canUseStorage(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  get role(): RoleKey {
    return this.roleSubject.value;
  }

  setRole(role: RoleKey): void {
    this.roleSubject.next(role);
    if (this.canUseStorage) {
      localStorage.setItem(this.roleStorageKey, role);
    }
  }

  clearRole(): void {
    this.roleSubject.next('viewer');
    if (this.canUseStorage) {
      localStorage.removeItem(this.roleStorageKey);
    }
  }

  setRoleFromBackendRole(backendRole: string): void {
    const mappedRole = this.mapBackendRoleToRoleKey(backendRole);
    this.setRole(mappedRole);
  }

  private getStoredRole(): RoleKey {
    if (!this.canUseStorage) {
      return 'technicien';
    }

    const raw = localStorage.getItem(this.roleStorageKey);
    if (!raw) {
      return 'technicien';
    }
    if (raw === 'buyer') return 'viewer';

    const storedRole = raw as RoleKey;
    const validRoles: RoleKey[] = ['viewer', 'producteur', 'technicien', 'cooperative', 'ong', 'etat', 'admin'];
    return validRoles.includes(storedRole) ? storedRole : 'technicien';
  }

  private mapBackendRoleToRoleKey(backendRole: string): RoleKey {
    const normalized = backendRole.trim().toUpperCase();

    switch (normalized) {
      case 'VIEWER':
      case 'BUYER':
        return 'viewer';
      case 'PRODUCTEUR':
        return 'producteur';
      case 'TECHNICIEN':
        return 'technicien';
      case 'COOPERATIVE':
        return 'cooperative';
      case 'ONG':
        return 'ong';
      case 'ETAT':
        return 'etat';
      case 'ADMIN':
        return 'admin';
      default:
        return 'viewer';
    }
  }
}
