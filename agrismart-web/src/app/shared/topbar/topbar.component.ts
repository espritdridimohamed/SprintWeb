import { Component, Input, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AlertService, AlertItem } from '../../services/alert.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss'
})
export class TopbarComponent implements OnInit {
  @Input() roleLabel = '';
  @Input() orgLabel = '';
  @Input() showELearning = false;

  showLogoutModal = false;
  showNotifDropdown = false;
  activeAlerts: AlertItem[] = [];

  constructor(
    private authService: AuthService,
    private router: Router,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.loadAlerts();
  }

  loadAlerts(): void {
    this.alertService.getActive().subscribe({
      next: (alerts) => this.activeAlerts = alerts.slice(0, 5),
      error: () => this.activeAlerts = []
    });
  }

  toggleNotifDropdown(): void {
    this.showNotifDropdown = !this.showNotifDropdown;
    if (this.showNotifDropdown) {
      this.loadAlerts();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.notif-wrapper')) {
      this.showNotifDropdown = false;
    }
  }

  goToAlerts(): void {
    this.showNotifDropdown = false;
    this.router.navigate(['/app/alerts']);
  }

  getSeverityIcon(severity: string): string {
    const map: Record<string, string> = { urgent: 'error', warning: 'warning', info: 'info' };
    return map[severity] || 'info';
  }

  formatTimeAgo(date?: string): string {
    if (!date) return '';
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'À l\'instant';
    if (mins < 60) return `Il y a ${mins} min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `Il y a ${hours}h`;
    return `Il y a ${Math.floor(hours / 24)}j`;
  }

  openLogoutModal(): void {
    this.showLogoutModal = true;
  }

  closeLogoutModal(): void {
    this.showLogoutModal = false;
  }

  confirmLogout(): void {
    this.showLogoutModal = false;
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  goToELearning(): void {
    this.router.navigate(['/app/training']);
  }

  get profileName(): string {
    const user = this.authService.getCurrentUser();
    if (!user) {
      return 'Utilisateur';
    }

    return `${user.firstName} ${user.lastName}`.trim();
  }

  get profileInitials(): string {
    const user = this.authService.getCurrentUser();
    if (!user) {
      return 'U';
    }

    const first = user.firstName?.charAt(0) ?? '';
    const last = user.lastName?.charAt(0) ?? '';
    const initials = `${first}${last}`.toUpperCase();
    return initials || 'U';
  }

  get profilePictureUrl(): string {
    const user = this.authService.getCurrentUser();
    return user?.profilePictureUrl?.trim() ?? '';
  }

  openProfile(): void {
    this.router.navigate(['/app/profile']);
  }
}
