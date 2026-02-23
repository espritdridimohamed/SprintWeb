import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';

interface DbUser {
  id?: string;
  email: string;
  firstName: string;
  lastName: string;
  roleId?: string;
  status?: string;
  createdAt?: string;
}

interface DbRole {
  id: string;
  name: string;
  description?: string;
}

@Component({
  selector: 'app-logs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './logs.component.html',
  styleUrls: ['./logs.component.scss']
})
export class LogsComponent implements OnInit {
  private readonly apiBaseUrl = 'http://localhost:8080/api';

  users: DbUser[] = [];
  roles: DbRole[] = [];
  isLoading = false;

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
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  get todayConnections(): number {
    return this.users.length;
  }

  get dataChanges(): number {
    return this.users.filter((user) => !!user.createdAt).length;
  }

  get systemErrors(): number {
    return this.users.filter((user) => (user.status ?? 'ACTIVE').toUpperCase() !== 'ACTIVE').length;
  }

  get logsPerDay(): number {
    return this.users.length * 12;
  }

  get storageLabel(): string {
    const estimateMb = Math.max(1, this.users.length * 0.25);
    return `${estimateMb.toFixed(2)} MB`;
  }

  get retentionDays(): number {
    return 180;
  }

  get recentActivities(): string[] {
    return this.sortedUsers.slice(0, 8).map((user) => {
      const roleName = this.getRoleNameById(user.roleId);
      const timestamp = user.createdAt ? new Date(user.createdAt).toLocaleString() : 'Date inconnue';
      return `${user.firstName} ${user.lastName} · ${roleName} · ${timestamp}`;
    });
  }

  get securityAlerts(): string[] {
    const activeUsers = this.users.filter((user) => (user.status ?? 'ACTIVE').toUpperCase() === 'ACTIVE').length;
    const inactiveUsers = this.users.length - activeUsers;

    return [
      `Authentifications actives · ${activeUsers}`,
      `Comptes non actifs · ${inactiveUsers}`,
      `Rôles configurés · ${this.roles.length}`
    ];
  }

  private get sortedUsers(): DbUser[] {
    return [...this.users].sort((left, right) => {
      const leftDate = left.createdAt ? new Date(left.createdAt).getTime() : 0;
      const rightDate = right.createdAt ? new Date(right.createdAt).getTime() : 0;
      return rightDate - leftDate;
    });
  }

  private getRoleNameById(roleId?: string): string {
    if (!roleId) {
      return 'Rôle non défini';
    }

    const role = this.roles.find((item) => item.id === roleId);
    return role?.name ?? 'Rôle non défini';
  }
}
