import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavItem } from '../../models/role.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  @Input() roleLabel = '';
  @Input() orgLabel = '';
  @Input() navItems: NavItem[] = [];

  private readonly iconMap: Record<string, string> = {
    dashboard: 'dashboard',
    agri: 'eco',
    ai: 'psychology',
    support: 'support_agent',
    alerts: 'notifications',
    calendar: 'calendar_month',
    market: 'storefront',
    training: 'school',
    reports: 'summarize',
    impact: 'analytics',
    exports: 'download',
    admin: 'admin_panel_settings',
    iot: 'sensors',
    logs: 'receipt_long',
    users_mgmt: 'manage_accounts'
  };

  getIcon(key: string): string {
    return this.iconMap[key] || key;
  }
}
