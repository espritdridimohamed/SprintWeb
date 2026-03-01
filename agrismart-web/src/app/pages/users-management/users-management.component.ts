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
  selector: 'app-users-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users-management.component.html',
  styleUrl: './users-management.component.scss'
})
export class UsersManagementComponent implements OnInit {
  private readonly apiBaseUrl = 'http://localhost:8080/api';

  users: DbUser[] = [];
  roles: DbRole[] = [];
  pendingRoleByUserId: Record<string, string> = {};

  isLoading = false;
  isCreateModalOpen = false;
  isSubmitting = false;

  searchTerm = '';
  selectedRoleFilter = 'all';
  selectedStatusFilter = 'all';
  selectedDateFilter: 'all' | 'today' | '7d' | '30d' = 'all';
  pageSize = 10;
  currentPage = 1;

  submitError = '';
  submitSuccess = '';

  firstName = '';
  lastName = '';
  email = '';
  password = '';
  selectedRole = 'VIEWER';
  organization = 'AgriSmart';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
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

        this.currentPage = 1;
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
        this.loadData();
      },
      error: () => {
        this.isSubmitting = false;
        this.submitError = 'Création impossible. Email déjà utilisé ou serveur indisponible.';
      }
    });
  }

  get filteredUsers(): DbUser[] {
    const normalizedSearch = this.searchTerm.trim().toLowerCase();
    const now = Date.now();
    const msPerDay = 24 * 60 * 60 * 1000;

    return this.users.filter((user) => {
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
      const roleName = this.getRoleNameById(user.roleId).toLowerCase();
      const email = user.email.toLowerCase();

      const matchesSearch = !normalizedSearch
        || fullName.includes(normalizedSearch)
        || email.includes(normalizedSearch)
        || roleName.includes(normalizedSearch);

      const matchesRole = this.selectedRoleFilter === 'all' || user.roleId === this.selectedRoleFilter;

      const userStatus = (user.status ?? 'ACTIVE').toUpperCase();
      const matchesStatus = this.selectedStatusFilter === 'all'
        || (this.selectedStatusFilter === 'active' && userStatus === 'ACTIVE')
        || (this.selectedStatusFilter === 'inactive' && userStatus !== 'ACTIVE');

      const createdAtTime = user.createdAt ? new Date(user.createdAt).getTime() : 0;
      const matchesDate = this.selectedDateFilter === 'all'
        || (this.selectedDateFilter === 'today' && createdAtTime >= now - msPerDay)
        || (this.selectedDateFilter === '7d' && createdAtTime >= now - 7 * msPerDay)
        || (this.selectedDateFilter === '30d' && createdAtTime >= now - 30 * msPerDay);

      return matchesSearch && matchesRole && matchesStatus && matchesDate;
    });
  }

  get totalFilteredUsers(): number {
    return this.filteredUsers.length;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalFilteredUsers / this.pageSize));
  }

  get paginatedUsers(): DbUser[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredUsers.slice(start, start + this.pageSize);
  }

  get pageStartItem(): number {
    if (this.totalFilteredUsers === 0) return 0;
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get pageEndItem(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalFilteredUsers);
  }

  get visiblePageNumbers(): number[] {
    const pages: number[] = [];
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.totalPages, start + 4);
    for (let v = start; v <= end; v++) pages.push(v);
    return pages;
  }

  getRoleNameById(roleId?: string): string {
    if (!roleId) return 'Rôle non défini';
    const role = this.roles.find((item) => item.id === roleId);
    return role?.name ?? 'Rôle non défini';
  }

  getUserCreatedAtLabel(user: DbUser): string {
    if (!user.createdAt) return '-';
    return new Date(user.createdAt).toLocaleDateString('fr-FR');
  }

  onFiltersChanged(): void {
    this.currentPage = 1;
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedRoleFilter = 'all';
    this.selectedStatusFilter = 'all';
    this.selectedDateFilter = 'all';
    this.currentPage = 1;
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
  }

  saveUserRole(user: DbUser): void {
    if (!user.id) return;

    const roleId = this.pendingRoleByUserId[user.id];
    if (!roleId || roleId === user.roleId) return;

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
        this.loadData();
      },
      error: () => {
        this.submitError = 'Impossible de mettre à jour le rôle utilisateur.';
        this.submitSuccess = '';
      }
    });
  }

  getPendingRole(user: DbUser): string {
    if (!user.id) return user.roleId ?? '';
    return this.pendingRoleByUserId[user.id] ?? user.roleId ?? '';
  }

  setPendingRole(user: DbUser, roleId: string): void {
    if (!user.id) return;
    this.pendingRoleByUserId[user.id] = roleId;
  }

  deleteUser(user: DbUser): void {
    if (!user.id) return;

    const confirmed = confirm(`Supprimer ${user.firstName} ${user.lastName} ?`);
    if (!confirmed) return;

    this.http.delete(`${this.apiBaseUrl}/users/${user.id}`).subscribe({
      next: () => {
        this.submitSuccess = `Utilisateur ${user.firstName} ${user.lastName} supprimé.`;
        this.submitError = '';
        this.loadData();
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
