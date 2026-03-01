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
  organization?: string;
  createdAt?: string;
  lastLoginAt?: string;
}

interface DbRole {
  id: string;
  name: string;
  description?: string;
}

interface DashboardCard {
  icon: string;
  label: string;
  value: string;
  tone: 'info' | 'success' | 'brand' | 'warning' | 'neutral';
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent implements OnInit {
  private readonly apiBaseUrl = 'http://localhost:8080/api';
  private readonly millisecondsPerDay = 24 * 60 * 60 * 1000;
  private readonly onlineWindowMs = 5 * 60 * 1000;

  users: DbUser[] = [];
  roles: DbRole[] = [];
  isLoading = false;

  constructor(private http: HttpClient) { }

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
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  get totalUsers(): number {
    return this.users.length;
  }

  get activeUsers(): number {
    return this.users.filter((user) => {
      if (!user.status) return true;
      return user.status.toUpperCase() === 'ACTIVE';
    }).length;
  }

  get totalRoles(): number {
    return this.roles.length;
  }

  get onlineUsers(): number {
    const threshold = Date.now() - this.onlineWindowMs;

    return this.users.filter((user) => {
      const isActive = (user.status ?? 'ACTIVE').toUpperCase() === 'ACTIVE';
      if (!isActive || !user.lastLoginAt) {
        return false;
      }

      const lastLoginTime = new Date(user.lastLoginAt).getTime();
      return !Number.isNaN(lastLoginTime) && lastLoginTime >= threshold;
    }).length;
  }

  get activeRate(): number {
    if (this.totalUsers === 0) return 0;
    return Math.round((this.activeUsers * 100) / this.totalUsers);
  }

  get usersThisMonth(): number {
    const monthAgo = Date.now() - 30 * this.millisecondsPerDay;
    return this.users.filter((user) => {
      if (!user.createdAt) return false;
      return new Date(user.createdAt).getTime() >= monthAgo;
    }).length;
  }

  get topRoleStat(): { name: string; count: number } {
    const stats = this.roleStats;
    if (stats.length === 0) return { name: '-', count: 0 };
    return stats.reduce((top, current) => (current.count > top.count ? current : top), stats[0]);
  }

  get roleStats(): Array<{ name: string; description: string; count: number }> {
    return this.roles.map((role) => {
      const count = this.users.filter((user) => user.roleId === role.id).length;
      return { name: role.name, description: role.description ?? 'Sans description', count };
    });
  }

  get roleBarChartStats(): Array<{ name: string; count: number }> {
    return this.roleStats
      .map((item) => ({ name: item.name, count: item.count }))
      .sort((left, right) => right.count - left.count);
  }

  get maxRoleBarCount(): number {
    return Math.max(...this.roleBarChartStats.map((item) => item.count), 1);
  }

  get signupTrendLast7Days(): Array<{ label: string; count: number; height: number }> {
    const today = new Date();
    const result: Array<{ label: string; count: number; height: number }> = [];

    for (let offset = 6; offset >= 0; offset--) {
      const dayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - offset);
      const dayEnd = new Date(dayStart.getTime() + this.millisecondsPerDay);

      const count = this.users.filter((user) => {
        if (!user.createdAt) return false;
        const timestamp = new Date(user.createdAt).getTime();
        return timestamp >= dayStart.getTime() && timestamp < dayEnd.getTime();
      }).length;

      result.push({
        label: dayStart.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
        count,
        height: 0
      });
    }

    const maxCount = Math.max(...result.map((item) => item.count), 1);
    return result.map((item) => ({ ...item, height: (item.count * 100) / maxCount }));
  }

  getRoleBarHeight(roleCount: number): number {
    return (roleCount * 100) / this.maxRoleBarCount;
  }

  get mainCards(): DashboardCard[] {
    return [
      {
        icon: 'groups',
        label: 'Utilisateurs total',
        value: `${this.totalUsers}`,
        tone: 'info'
      },
      {
        icon: 'verified_user',
        label: 'Utilisateurs actifs',
        value: `${this.activeUsers}`,
        tone: 'success'
      },
      {
        icon: 'person_check',
        label: 'En ligne (5 min)',
        value: `${this.onlineUsers}`,
        tone: 'brand'
      }
    ];
  }

  get secondaryCards(): DashboardCard[] {
    return [
      {
        icon: 'percent',
        label: 'Taux utilisateurs actifs',
        value: `${this.activeRate}%`,
        tone: 'warning'
      },
      {
        icon: 'person_add',
        label: 'Nouveaux comptes (30 jours)',
        value: `${this.usersThisMonth}`,
        tone: 'success'
      },
      {
        icon: 'leaderboard',
        label: 'Rôle majoritaire',
        value: `${this.topRoleStat.name} · ${this.topRoleStat.count}`,
        tone: 'neutral'
      }
    ];
  }
}
