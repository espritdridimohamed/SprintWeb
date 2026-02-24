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
  private readonly millisecondsPerDay = 24 * 60 * 60 * 1000;

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
    const now = Date.now();
    return this.users.filter((user) => {
      if (!user.createdAt) {
        return false;
      }
      return new Date(user.createdAt).getTime() >= now - this.millisecondsPerDay;
    }).length;
  }

  get dataChanges(): number {
    return this.users.filter((user) => !!user.createdAt).length;
  }

  get systemErrors(): number {
    return this.users.filter((user) => (user.status ?? 'ACTIVE').toUpperCase() !== 'ACTIVE').length;
  }

  get activeUsers(): number {
    return this.users.filter((user) => (user.status ?? 'ACTIVE').toUpperCase() === 'ACTIVE').length;
  }

  get securityScore(): number {
    if (this.users.length === 0) {
      return 100;
    }

    return Math.max(0, Math.round((this.activeUsers * 100) / this.users.length));
  }

  get logsPerDay(): number {
    return Math.max(10, this.users.length * 12);
  }

  get storageLabel(): string {
    const estimateMb = Math.max(1, this.users.length * 0.25);
    return `${estimateMb.toFixed(2)} MB`;
  }

  get retentionDays(): number {
    return 180;
  }

  get roleActivityChart(): Array<{ role: string; count: number; width: number }> {
    const rows = this.roles.map((role) => {
      const count = this.users.filter((user) => user.roleId === role.id).length;
      return {
        role: role.name,
        count,
        width: 0
      };
    });

    const maxCount = Math.max(...rows.map((row) => row.count), 1);
    return rows.map((row) => ({ ...row, width: (row.count * 100) / maxCount }));
  }

  get signupTrendLast7Days(): Array<{ label: string; count: number; height: number }> {
    const today = new Date();
    const points: Array<{ label: string; count: number; height: number }> = [];

    for (let offset = 6; offset >= 0; offset--) {
      const dayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - offset);
      const dayEnd = new Date(dayStart.getTime() + this.millisecondsPerDay);

      const count = this.users.filter((user) => {
        if (!user.createdAt) {
          return false;
        }

        const timestamp = new Date(user.createdAt).getTime();
        return timestamp >= dayStart.getTime() && timestamp < dayEnd.getTime();
      }).length;

      points.push({
        label: dayStart.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
        count,
        height: 0
      });
    }

    const maxCount = Math.max(...points.map((item) => item.count), 1);
    return points.map((item) => ({
      ...item,
      height: Math.max(8, Math.round((item.count * 100) / maxCount))
    }));
  }

  get recentActivities(): Array<{ actor: string; role: string; action: string; timestamp: string }> {
    return this.sortedUsers.slice(0, 8).map((user) => ({
      actor: `${user.firstName} ${user.lastName}`,
      role: this.getRoleNameById(user.roleId),
      action: 'Mise à jour profil/compte',
      timestamp: user.createdAt ? new Date(user.createdAt).toLocaleString() : 'Date inconnue'
    }));
  }

  get securityAlerts(): string[] {
    const inactiveUsers = this.users.length - this.activeUsers;

    return [
      `Authentifications actives · ${this.activeUsers}`,
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
