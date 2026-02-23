import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent {
  firstName = '';
  lastName = '';
  email = '';
  password = '';
  organization = '';
  isLoading = false;
  errorMessage = '';
  socialMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSignup(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.socialMessage = '';

    this.authService
      .register({
        firstName: this.firstName,
        lastName: this.lastName,
        email: this.email,
        password: this.password,
        role: 'BUYER',
        organization: this.organization || 'Client AgriSmart'
      })
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/app/market']);
        },
        error: () => {
          this.isLoading = false;
          this.errorMessage = 'Inscription impossible. Vérifiez vos informations ou réessayez.';
        }
      });
  }

  onSocialSignup(provider: 'google' | 'facebook'): void {
    const label = provider === 'google' ? 'Google' : 'Facebook';
    this.socialMessage = `Inscription ${label} sera activée bientôt.`;
  }
}
