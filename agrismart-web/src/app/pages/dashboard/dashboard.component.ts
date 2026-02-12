import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoleService } from '../../services/role.service';
import { ROLE_CONFIGS } from '../../data/role-config';
import { KpiCardComponent } from '../../shared/kpi-card/kpi-card.component';
import { SectionCardComponent } from '../../shared/section-card/section-card.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, KpiCardComponent, SectionCardComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  constructor(public roleService: RoleService) {}

  get roleConfig() {
    return ROLE_CONFIGS[this.roleService.role];
  }
}
