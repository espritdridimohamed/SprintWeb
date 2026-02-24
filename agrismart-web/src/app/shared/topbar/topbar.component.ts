import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss'
})
export class TopbarComponent {
  @Input() roleLabel = '';
  @Input() orgLabel = '';
  @Input() showELearning = false;

  constructor(private authService: AuthService, private router: Router) {}

  logout(): void {
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
