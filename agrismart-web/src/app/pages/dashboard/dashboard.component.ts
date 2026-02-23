import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { RoleService } from '../../services/role.service';
import { ROLE_CONFIGS } from '../../data/role-config';
import { KpiCardComponent } from '../../shared/kpi-card/kpi-card.component';
import { SectionCardComponent } from '../../shared/section-card/section-card.component';

interface DashboardUser {
  id?: string;
  roleId?: string;
  status?: string;
  createdAt?: string;
}

interface DashboardRole {
  id: string;
  name: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, KpiCardComponent, SectionCardComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private readonly apiBaseUrl = 'http://localhost:8080/api';

  isLoading = false;
  users: DashboardUser[] = [];
  roles: DashboardRole[] = [];

  constructor(public roleService: RoleService, private http: HttpClient) {}

  ngOnInit(): void {
    if (this.isAdminView) {
      this.loadAdminSummary();
    }
  }

  get roleConfig() {
    return ROLE_CONFIGS[this.roleService.role];
  }

  get isAdminView(): boolean {
    return this.roleService.role === 'admin';
  }

  get totalUsers(): number {
    return this.users.length;
  }

  get activeUsers(): number {
    return this.users.filter((user) => (user.status ?? 'ACTIVE').toUpperCase() === 'ACTIVE').length;
  }

  get rolesCount(): number {
    return this.roles.length;
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

  get roleDistribution(): Array<{ label: string; value: number }> {
    return this.roles.map((role) => ({
      label: role.name,
      value: this.users.filter((user) => user.roleId === role.id).length
    }));
  }

  private loadAdminSummary(): void {
    this.isLoading = true;

    forkJoin({
      users: this.http.get<DashboardUser[]>(`${this.apiBaseUrl}/users`),
      roles: this.http.get<DashboardRole[]>(`${this.apiBaseUrl}/roles`)
    }).subscribe({
      next: ({ users, roles }) => {
        this.users = users ?? [];
        this.roles = roles ?? [];
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }
}
