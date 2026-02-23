import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';

interface DbUser {
  id?: string;
  email: string;
  firstName: string;
  lastName: string;
  roleId?: string;
  status?: string;
  organization?: string;
  createdAt?: string;
}

interface DbRole {
  id: string;
  name: string;
  description?: string;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent implements OnInit {
  private readonly apiBaseUrl = 'http://localhost:8080/api';

  users: DbUser[] = [];
  roles: DbRole[] = [];
  pendingRoleByUserId: Record<string, string> = {};

  isLoading = false;
  isCreateModalOpen = false;
  isSubmitting = false;

  submitError = '';
  submitSuccess = '';

  firstName = '';
  lastName = '';
  email = '';
  password = '';
  selectedRole = 'BUYER';
  organization = 'AgriSmart';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadAdminData();
  }

  loadAdminData(): void {
    this.isLoading = true;

    forkJoin({
      users: this.http.get<DbUser[]>(`${this.apiBaseUrl}/users`),
      roles: this.http.get<DbRole[]>(`${this.apiBaseUrl}/roles`)
    }).subscribe({
      next: ({ users, roles }) => {
        this.users = users ?? [];
        this.roles = roles ?? [];

        this.pendingRoleByUserId = {};
        this.users.forEach((user) => {
          if (user.id && user.roleId) {
            this.pendingRoleByUserId[user.id] = user.roleId;
          }
        });

        if (this.roles.length > 0 && !this.roles.some((role) => role.name === this.selectedRole)) {
          this.selectedRole = this.roles[0].name;
        }

        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  openCreateUser(): void {
    this.isCreateModalOpen = true;
    this.submitError = '';
    this.submitSuccess = '';
  }

  closeCreateUser(): void {
    this.isCreateModalOpen = false;
    this.submitError = '';
    this.submitSuccess = '';
  }

  createUser(): void {
    this.submitError = '';
    this.submitSuccess = '';

    if (!this.firstName || !this.lastName || !this.email || !this.password || !this.selectedRole) {
      this.submitError = 'Veuillez remplir tous les champs obligatoires.';
      return;
    }

    this.isSubmitting = true;

    const payload = {
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      password: this.password,
      role: this.selectedRole,
      organization: this.organization || 'AgriSmart'
    };

    this.http.post(`${this.apiBaseUrl}/auth/register`, payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.submitSuccess = 'Utilisateur créé avec succès.';
        this.resetForm();
        this.loadAdminData();
      },
      error: () => {
        this.isSubmitting = false;
        this.submitError = 'Création impossible. Email déjà utilisé ou serveur indisponible.';
      }
    });
  }

  get totalUsers(): number {
    return this.users.length;
  }

  get activeUsers(): number {
    return this.users.filter((user) => {
      if (!user.status) {
        return true;
      }

      return user.status.toUpperCase() === 'ACTIVE';
    }).length;
  }

  get totalRoles(): number {
    return this.roles.length;
  }

  get inactiveUsers(): number {
    return this.users.filter((user) => (user.status ?? 'ACTIVE').toUpperCase() !== 'ACTIVE').length;
  }

  get newUsersThisWeek(): number {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return this.users.filter((user) => {
      if (!user.createdAt) {
        return false;
      }
      return new Date(user.createdAt).getTime() >= weekAgo;
    }).length;
  }

  get roleStats(): Array<{ name: string; description: string; count: number }> {
    return this.roles.map((role) => {
      const count = this.users.filter((user) => user.roleId === role.id).length;
      return {
        name: role.name,
        description: role.description ?? 'Sans description',
        count
      };
    });
  }

  getRoleChartWidth(roleCount: number): number {
    if (this.totalUsers === 0) {
      return 0;
    }

    return (roleCount * 100) / this.totalUsers;
  }

  getRoleNameById(roleId?: string): string {
    if (!roleId) {
      return 'Rôle non défini';
    }

    const role = this.roles.find((item) => item.id === roleId);
    return role?.name ?? 'Rôle non défini';
  }

  saveUserRole(user: DbUser): void {
    if (!user.id) {
      return;
    }

    const roleId = this.pendingRoleByUserId[user.id];
    if (!roleId || roleId === user.roleId) {
      return;
    }

    const payload = {
      firstName: user.firstName,
      lastName: user.lastName,
      organization: user.organization ?? 'AgriSmart',
      roleId,
      status: user.status ?? 'ACTIVE'
    };

    this.http.put(`${this.apiBaseUrl}/users/${user.id}`, payload).subscribe({
      next: () => {
        this.submitSuccess = `Rôle de ${user.firstName} ${user.lastName} mis à jour.`;
        this.submitError = '';
        this.loadAdminData();
      },
      error: () => {
        this.submitError = 'Impossible de mettre à jour le rôle utilisateur.';
        this.submitSuccess = '';
      }
    });
  }

  getPendingRole(user: DbUser): string {
    if (!user.id) {
      return user.roleId ?? '';
    }

    return this.pendingRoleByUserId[user.id] ?? user.roleId ?? '';
  }

  setPendingRole(user: DbUser, roleId: string): void {
    if (!user.id) {
      return;
    }

    this.pendingRoleByUserId[user.id] = roleId;
  }

  deleteUser(user: DbUser): void {
    if (!user.id) {
      return;
    }

    const confirmed = confirm(`Supprimer ${user.firstName} ${user.lastName} ?`);
    if (!confirmed) {
      return;
    }

    this.http.delete(`${this.apiBaseUrl}/users/${user.id}`).subscribe({
      next: () => {
        this.submitSuccess = `Utilisateur ${user.firstName} ${user.lastName} supprimé.`;
        this.submitError = '';
        this.loadAdminData();
      },
      error: () => {
        this.submitError = 'Suppression impossible.';
        this.submitSuccess = '';
      }
    });
  }

  private resetForm(): void {
    this.firstName = '';
    this.lastName = '';
    this.email = '';
    this.password = '';
    this.organization = 'AgriSmart';
  }
}
