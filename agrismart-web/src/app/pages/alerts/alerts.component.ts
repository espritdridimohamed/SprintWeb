import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertService, AlertItem } from '../../services/alert.service';
import { RoleService } from '../../services/role.service';

@Component({
  selector: 'app-alerts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './alerts.component.html',
  styleUrls: ['./alerts.component.scss']
})
export class AlertsComponent implements OnInit {
  alerts: AlertItem[] = [];
  isLoading = false;
  showForm = false;
  successMessage = '';

  newAlert: Partial<AlertItem> = {
    title: '',
    message: '',
    severity: 'info',
    target: ''
  };

  constructor(
    private alertService: AlertService,
    private roleService: RoleService
  ) {}

  get role() { return this.roleService.role; }
  get isAdmin() { return this.role === 'admin'; }

  get activeAlerts(): AlertItem[] {
    return this.alerts.filter(a => !a.resolved);
  }

  get resolvedAlerts(): AlertItem[] {
    return this.alerts.filter(a => a.resolved);
  }

  ngOnInit() {
    this.loadAlerts();
  }

  loadAlerts() {
    this.isLoading = true;
    this.alertService.getAll().subscribe({
      next: (data) => { this.alerts = data; this.isLoading = false; },
      error: () => this.isLoading = false
    });
  }

  openForm() { this.showForm = true; this.successMessage = ''; }
  closeForm() { this.showForm = false; this.resetForm(); }

  submitAlert() {
    if (!this.newAlert.title?.trim() || !this.newAlert.message?.trim()) return;
    this.alertService.create(this.newAlert).subscribe({
      next: () => {
        this.successMessage = 'Alerte envoyée avec succès !';
        this.loadAlerts();
        this.resetForm();
        this.showForm = false;
        setTimeout(() => this.successMessage = '', 4000);
      },
      error: () => this.successMessage = ''
    });
  }

  resolveAlert(alert: AlertItem) {
    if (!alert.id) return;
    this.alertService.resolve(alert.id).subscribe(() => this.loadAlerts());
  }

  deleteAlert(alert: AlertItem) {
    if (!alert.id) return;
    this.alertService.delete(alert.id).subscribe(() => this.loadAlerts());
  }

  resetForm() {
    this.newAlert = { title: '', message: '', severity: 'info', target: '' };
  }

  getSeverityIcon(severity: string): string {
    const map: Record<string, string> = { urgent: 'error', warning: 'warning', info: 'info' };
    return map[severity] || 'info';
  }

  getSeverityLabel(severity: string): string {
    const map: Record<string, string> = { urgent: 'Urgent', warning: 'Moyen', info: 'Info' };
    return map[severity] || severity;
  }

  formatDate(date?: string): string {
    if (!date) return '';
    return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(date));
  }
}
