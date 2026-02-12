import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { RoleKey } from '../models/role.model';

@Injectable({ providedIn: 'root' })
export class RoleService {
  private readonly roleSubject = new BehaviorSubject<RoleKey>('technicien');
  role$ = this.roleSubject.asObservable();

  get role(): RoleKey {
    return this.roleSubject.value;
  }

  setRole(role: RoleKey): void {
    this.roleSubject.next(role);
  }
}
