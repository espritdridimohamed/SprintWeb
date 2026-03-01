import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-set-new-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './set-new-password.component.html',
  styleUrl: './set-new-password.component.scss'
})
export class SetNewPasswordComponent implements OnInit {
  newPassword = '';
  confirmPassword = '';
  isLoading = false;
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser?.requiresPasswordChange) {
      const normalizedRole = (currentUser?.role ?? '').trim().toLowerCase();
      const targetRoute = (normalizedRole === 'viewer' || normalizedRole === 'buyer')
        ? '/app/market'
        : normalizedRole === 'admin'
          ? '/app/admin'
          : '/app/dashboard';

      this.router.navigate([targetRoute]);
    }
  }

  submit(): void {
    this.errorMessage = '';

    if (!this.newPassword || !this.confirmPassword) {
      this.errorMessage = 'Please fill both password fields.';
      return;
    }

    if (this.newPassword.length < 8) {
      this.errorMessage = 'Password must be at least 8 characters.';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    this.isLoading = true;

    this.authService.setFirstLoginPassword(this.newPassword).subscribe({
      next: () => {
        this.isLoading = false;
        this.authService.updateStoredUser({ requiresPasswordChange: false });

        const currentUser = this.authService.getCurrentUser();
        const normalizedRole = (currentUser?.role ?? '').trim().toLowerCase();
        const targetRoute = (normalizedRole === 'viewer' || normalizedRole === 'buyer')
          ? '/app/market'
          : normalizedRole === 'admin'
            ? '/app/admin'
            : '/app/dashboard';

        this.router.navigate([targetRoute]);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.message || 'Unable to update password. Please try again.';
      }
    });
  }
}