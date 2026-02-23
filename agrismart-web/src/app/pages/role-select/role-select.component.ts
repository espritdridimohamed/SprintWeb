import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RoleService } from '../../services/role.service';
import { ROLE_CONFIGS } from '../../data/role-config';
import { RoleKey } from '../../models/role.model';

@Component({
  selector: 'app-role-select',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './role-select.component.html',
  styleUrl: './role-select.component.scss'
})
export class RoleSelectComponent {
  roles = Object.values(ROLE_CONFIGS);

  readonly roleIcons: Record<string, string> = {
    producteur: 'eco',
    technicien: 'engineering',
    cooperative: 'groups',
    ong: 'volunteer_activism',
    etat: 'account_balance',
    admin: 'admin_panel_settings'
  };

  constructor(private router: Router, private roleService: RoleService) {}

  selectRole(role: RoleKey): void {
    this.roleService.setRole(role);
    this.router.navigate(['/app/dashboard']);
  }
}
