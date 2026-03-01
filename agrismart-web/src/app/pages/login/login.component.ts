import { Component, NgZone, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

declare const google: any;
declare const FB: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  email = '';
  password = '';
  rememberMe = false;
  isLoading = false;
  errorMessage = '';
  socialMessage = '';
  forgotPasswordMode = false;
  resetStep: 'request' | 'confirm' = 'request';
  resetEmail = '';
  resetCode = '';
  newPassword = '';
  confirmNewPassword = '';
  resetHint = '';

  private readonly rememberKey = 'agrismart_remember';

  private get canUseStorage(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  constructor(
    private router: Router,
    private authService: AuthService,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    // Auto-redirect if already logged in (session persistence)
    if (this.authService.isAuthenticated()) {
      const user = this.authService.getCurrentUser();
      if (user) {
        if (user.requiresPasswordChange) {
          this.router.navigate(['/set-new-password']);
          return;
        }

        const normalizedRole = user.role.trim().toLowerCase();
        const targetRoute = (normalizedRole === 'viewer' || normalizedRole === 'buyer')
          ? '/app/market'
          : normalizedRole === 'admin'
            ? '/app/admin'
            : '/app/dashboard';
        this.router.navigate([targetRoute]);
        return;
      }
    }

    // Restore remembered email
    if (this.canUseStorage) {
      const saved = localStorage.getItem(this.rememberKey);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          this.email = parsed.email ?? '';
          this.rememberMe = true;
        } catch { /* ignore */ }
      }
    }
  }

  onLogin(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (response) => {
        this.isLoading = false;

        // Save or clear remembered email
        if (this.canUseStorage) {
          if (this.rememberMe) {
            localStorage.setItem(this.rememberKey, JSON.stringify({ email: this.email }));
          } else {
            localStorage.removeItem(this.rememberKey);
          }
        }

        if (response.requiresPasswordChange) {
          this.router.navigate(['/set-new-password']);
          return;
        }

        const normalizedRole = response.role.trim().toLowerCase();
        const targetRoute = (normalizedRole === 'viewer' || normalizedRole === 'buyer')
          ? '/app/market'
          : normalizedRole === 'admin'
            ? '/app/admin'
            : '/app/dashboard';
        this.router.navigate([targetRoute]);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.message || 'Identifiants invalides ou serveur indisponible.';
      }
    });
  }

  onSocialSignup(provider: 'facebook' | 'google'): void {
    if (provider === 'facebook') {
      this.startFacebookLogin();
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
          // Fallback: use popup if One Tap not available
          this.ngZone.run(() => {
            this.useGooglePopup();
          });
        }
      });
    } catch {
      this.isLoading = false;
      this.errorMessage = 'Google Sign-In non disponible. Veuillez réessayer.';
    }
  }

  private startFacebookLogin(): void {
    this.errorMessage = '';
    this.socialMessage = '';
    this.isLoading = true;

    if (!environment.facebookAppId) {
      this.isLoading = false;
      this.errorMessage = 'Facebook Sign-In non configuré. Ajoutez facebookAppId.';
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
            this.errorMessage = 'Connexion Facebook annulée.';
            return;
          }

          this.handleFacebookAccessToken(accessToken);
        });
      }, { scope: 'public_profile,email' });
    } catch {
      this.isLoading = false;
      this.errorMessage = 'Facebook Sign-In non disponible. Veuillez réessayer.';
    }
  }

  openForgotPassword(event: Event): void {
    event.preventDefault();
    this.forgotPasswordMode = true;
    this.resetStep = 'request';
    this.resetEmail = this.email || '';
    this.resetCode = '';
    this.newPassword = '';
    this.confirmNewPassword = '';
    this.errorMessage = '';
    this.socialMessage = '';
    this.resetHint = '';
  }

  cancelForgotPassword(): void {
    this.forgotPasswordMode = false;
    this.resetStep = 'request';
    this.resetCode = '';
    this.newPassword = '';
    this.confirmNewPassword = '';
    this.resetHint = '';
  }

  requestResetCode(): void {
    if (!this.resetEmail) {
      this.errorMessage = 'Please enter your email.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.resetHint = '';

    this.authService.requestPasswordResetCode(this.resetEmail).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.resetStep = 'confirm';
        this.resetHint = response.message || 'Reset code sent to your email.';
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.message || 'Could not send reset code.';
      }
    });
  }

  confirmResetPassword(): void {
    if (!this.resetCode || !this.newPassword || !this.confirmNewPassword) {
      this.errorMessage = 'Please fill all reset password fields.';
      return;
    }

    if (this.newPassword !== this.confirmNewPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.confirmPasswordReset({
      email: this.resetEmail,
      code: this.resetCode,
      newPassword: this.newPassword
    }).subscribe({
      next: () => {
        this.isLoading = false;
        this.forgotPasswordMode = false;
        this.resetStep = 'request';
        this.socialMessage = 'Password reset successful. You can login now.';
        this.password = '';
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.message || 'Could not reset password.';
      }
    });
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

      // Create a temporary hidden button for popup
      const btnDiv = document.createElement('div');
      btnDiv.style.position = 'fixed';
      btnDiv.style.top = '-9999px';
      document.body.appendChild(btnDiv);

      google.accounts.id.renderButton(btnDiv, {
        type: 'standard',
        size: 'large'
      });

      // Click it programmatically
      const btn = btnDiv.querySelector('div[role="button"]') as HTMLElement;
      if (btn) {
        btn.click();
      }

      setTimeout(() => document.body.removeChild(btnDiv), 5000);
    } catch {
      this.isLoading = false;
      this.errorMessage = 'Impossible d\'ouvrir la fenêtre Google. Veuillez réessayer.';
    }
  }

  private handleGoogleCredential(credential: string): void {
    this.authService.googleAuth(credential, 'login').subscribe({
      next: (response) => {
        this.isLoading = false;

        if (response.requiresPasswordChange) {
          this.router.navigate(['/set-new-password']);
          return;
        }

        const normalizedRole = response.role.trim().toLowerCase();
        const targetRoute = (normalizedRole === 'viewer' || normalizedRole === 'buyer')
          ? '/app/market'
          : normalizedRole === 'admin'
            ? '/app/admin'
            : '/app/dashboard';
        this.router.navigate([targetRoute]);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.message
          || (err.status === 404
            ? 'Aucun compte trouvé avec cet e-mail Google. Veuillez d\'abord créer un compte.'
            : 'Erreur de connexion Google. Veuillez réessayer.');
      }
    });
  }

  private handleFacebookAccessToken(accessToken: string): void {
    this.authService.facebookAuth(accessToken, 'login').subscribe({
      next: (response) => {
        this.isLoading = false;

        if (response.requiresPasswordChange) {
          this.router.navigate(['/set-new-password']);
          return;
        }

        const normalizedRole = response.role.trim().toLowerCase();
        const targetRoute = (normalizedRole === 'viewer' || normalizedRole === 'buyer')
          ? '/app/market'
          : normalizedRole === 'admin'
            ? '/app/admin'
            : '/app/dashboard';
        this.router.navigate([targetRoute]);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.message
          || (err.status === 404
            ? 'Aucun compte trouvé pour ce profil Facebook. Veuillez d\'abord créer un compte.'
            : 'Erreur de connexion Facebook. Veuillez réessayer.');
      }
    });
  }
}
