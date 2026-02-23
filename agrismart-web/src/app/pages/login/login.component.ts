import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  email = '';
  password = '';
  isLoading = false;
  errorMessage = '';
  socialMessage = '';

  constructor(private router: Router, private authService: AuthService) {}

  onLogin(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (response) => {
        this.isLoading = false;
        const normalizedRole = response.role.trim().toLowerCase();
        const targetRoute = normalizedRole === 'buyer'
          ? '/app/market'
          : normalizedRole === 'admin'
            ? '/app/admin'
            : '/app/dashboard';
        this.router.navigate([targetRoute]);
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Identifiants invalides ou serveur indisponible.';
      }
    });
  }

  onSocialSignup(provider: 'facebook' | 'google'): void {
    const label = provider === 'google' ? 'Google' : 'Facebook';
    this.socialMessage = `Inscription ${label} sera activée bientôt.`;
  }
}
