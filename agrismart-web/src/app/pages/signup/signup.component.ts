import { Component, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

declare const google: any;
declare const FB: any;

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
  confirmPassword = '';
  organization = '';
  isLoading = false;
  errorMessage = '';
  socialMessage = '';
  verificationCode = '';
  showVerificationInput = false;
  verificationHint = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private ngZone: NgZone
  ) {}

  // Standard signup
  onSignup(): void {
    this.errorMessage = '';
    this.socialMessage = '';
    this.verificationHint = '';

    if (!this.firstName || !this.lastName || !this.email || !this.password || !this.confirmPassword) {
      this.errorMessage = 'Please fill all required fields.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    this.isLoading = true;

    this.authService
      .requestSignupCode({
        firstName: this.firstName,
        lastName: this.lastName,
        email: this.email,
        password: this.password,
        role: 'VIEWER',
        organization: this.organization || 'AgriSmart Client'
      })
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.showVerificationInput = true;
          this.verificationHint = response.message || 'Verification code sent to your email.';
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err?.error?.message || 'Registration failed. Check your information or try again.';
        }
      });
  }

  onVerifySignupCode(): void {
    if (!this.verificationCode) {
      this.errorMessage = 'Please enter verification code.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.verifySignupCode({
      email: this.email,
      code: this.verificationCode
    }).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/app/market']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.message || 'Invalid or expired verification code.';
      }
    });
  }

  // Social signup (Google/Facebook)
  onSocialSignup(provider: 'google' | 'facebook'): void {
    if (provider === 'facebook') {
      this.startFacebookSignup();
      return;
    }

    this.errorMessage = '';
    this.socialMessage = '';
    this.isLoading = true;

    try {
      google.accounts.id.initialize({
        client_id: environment.googleClientId,
        callback: (response: any) => {
          this.ngZone.run(() => {
            this.handleGoogleCredential(response.credential);
          });
        }
      });

      google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          this.ngZone.run(() => {
            this.useGooglePopup();
          });
        }
      });
    } catch {
      this.isLoading = false;
      this.errorMessage = 'Google Sign-In not available. Please try again.';
    }
  }

  private startFacebookSignup(): void {
    this.errorMessage = '';
    this.socialMessage = '';
    this.isLoading = true;

    if (!environment.facebookAppId) {
      this.isLoading = false;
      this.errorMessage = 'Facebook Sign-Up non configuré. Ajoutez facebookAppId.';
      return;
    }

    try {
      FB.init({
        appId: environment.facebookAppId,
        cookie: true,
        xfbml: false,
        version: 'v20.0'
      });

      FB.login((response: any) => {
        this.ngZone.run(() => {
          const accessToken = response?.authResponse?.accessToken;
          if (!accessToken) {
            this.isLoading = false;
            this.errorMessage = 'Inscription Facebook annulée.';
            return;
          }

          this.handleFacebookAccessToken(accessToken);
        });
      }, { scope: 'public_profile,email' });
    } catch {
      this.isLoading = false;
      this.errorMessage = 'Facebook Sign-Up non disponible. Veuillez réessayer.';
    }
  }

  private useGooglePopup(): void {
    try {
      google.accounts.id.initialize({
        client_id: environment.googleClientId,
        callback: (response: any) => {
          this.ngZone.run(() => {
            this.handleGoogleCredential(response.credential);
          });
        },
        auto_select: false,
        cancel_on_tap_outside: true
      });

      const btnDiv = document.createElement('div');
      btnDiv.style.position = 'fixed';
      btnDiv.style.top = '-9999px';
      document.body.appendChild(btnDiv);

      google.accounts.id.renderButton(btnDiv, {
        type: 'standard',
        size: 'large'
      });

      const btn = btnDiv.querySelector('div[role="button"]') as HTMLElement;
      if (btn) {
        btn.click();
      }

      setTimeout(() => document.body.removeChild(btnDiv), 5000);
    } catch {
      this.isLoading = false;
      this.errorMessage = 'Cannot open Google window. Please try again.';
    }
  }

  private handleGoogleCredential(credential: string): void {
    this.authService.googleAuth(credential, 'signup').subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/app/market']);
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 409) {
          this.errorMessage = 'You already have an account with this email. Please login.';
        } else {
          this.errorMessage = 'Google signup error. Please try again.';
        }
      }
    });
  }

  private handleFacebookAccessToken(accessToken: string): void {
    this.authService.facebookAuth(accessToken, 'signup').subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/app/market']);
      },
      error: (err) => {
        this.isLoading = false;
        if (err?.error?.error === 'FACEBOOK_EMAIL_REQUIRED') {
          this.errorMessage = 'Facebook ne fournit pas votre e-mail. Utilisez l\'inscription classique pour vérifier votre adresse e-mail.';
          return;
        }

        if (err.status === 409) {
          this.errorMessage = 'You already have an account with this email. Please login.';
        } else {
          this.errorMessage = err?.error?.message || 'Facebook signup error. Please try again.';
        }
      }
    });
  }
}