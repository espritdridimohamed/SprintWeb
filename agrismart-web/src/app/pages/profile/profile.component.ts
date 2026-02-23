import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { DbRole, ProfileService } from '../../services/profile.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  isLoading = false;
  isSavingProfile = false;
  isSavingPassword = false;

  profileId = '';
  roleId = '';
  status = 'ACTIVE';
  roleLabel = 'Rôle non défini';

  firstName = '';
  lastName = '';
  email = '';
  organization = '';
  accountType = '';
  profilePictureUrl = '';

  currentPassword = '';
  newPassword = '';
  confirmPassword = '';

  profileError = '';
  profileSuccess = '';
  passwordError = '';
  passwordSuccess = '';

  createdAtLabel = '-';
  updatedAtLabel = '-';

  constructor(private authService: AuthService, private profileService: ProfileService) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser?.email) {
      this.profileError = 'Session introuvable. Veuillez vous reconnecter.';
      return;
    }

    this.isLoading = true;
    this.profileError = '';
    this.profileSuccess = '';

    forkJoin({
      profile: this.profileService.getProfileByEmail(currentUser.email),
      roles: this.profileService.getRoles()
    }).subscribe({
      next: ({ profile, roles }) => {
        this.profileId = profile.id;
        this.roleId = profile.roleId;
        this.status = profile.status ?? 'ACTIVE';
        this.firstName = profile.firstName ?? '';
        this.lastName = profile.lastName ?? '';
        this.email = profile.email ?? currentUser.email;
        this.organization = profile.organization ?? '';
        this.accountType = profile.accountType ?? '';
        this.profilePictureUrl = profile.profilePictureUrl ?? '';
        this.createdAtLabel = profile.createdAt ? new Date(profile.createdAt).toLocaleString() : '-';
        this.updatedAtLabel = profile.updatedAt ? new Date(profile.updatedAt).toLocaleString() : '-';
        this.roleLabel = this.resolveRoleLabel(roles ?? []);
        this.isLoading = false;
      },
      error: () => {
        this.profileError = 'Impossible de charger le profil.';
        this.isLoading = false;
      }
    });
  }

  saveProfile(): void {
    this.profileError = '';
    this.profileSuccess = '';

    if (!this.profileId) {
      this.profileError = 'Profil introuvable.';
      return;
    }

    if (!this.firstName.trim() || !this.lastName.trim()) {
      this.profileError = 'Le prénom et le nom sont obligatoires.';
      return;
    }

    this.isSavingProfile = true;

    this.profileService.updateProfile(this.profileId, {
      firstName: this.firstName.trim(),
      lastName: this.lastName.trim(),
      organization: this.organization.trim(),
      accountType: this.accountType.trim(),
      profilePictureUrl: this.profilePictureUrl.trim(),
      roleId: this.roleId,
      status: this.status
    }).subscribe({
      next: () => {
        this.authService.updateStoredUser({
          firstName: this.firstName.trim(),
          lastName: this.lastName.trim()
        });
        this.profileSuccess = 'Profil mis à jour avec succès.';
        this.updatedAtLabel = new Date().toLocaleString();
        this.isSavingProfile = false;
      },
      error: () => {
        this.profileError = 'Mise à jour impossible pour le moment.';
        this.isSavingProfile = false;
      }
    });
  }

  changePassword(): void {
    this.passwordError = '';
    this.passwordSuccess = '';

    if (!this.profileId) {
      this.passwordError = 'Profil introuvable.';
      return;
    }

    if (!this.currentPassword || !this.newPassword || !this.confirmPassword) {
      this.passwordError = 'Veuillez remplir tous les champs de sécurité.';
      return;
    }

    if (this.newPassword.length < 8) {
      this.passwordError = 'Le nouveau mot de passe doit contenir au moins 8 caractères.';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.passwordError = 'La confirmation du mot de passe ne correspond pas.';
      return;
    }

    this.isSavingPassword = true;

    this.profileService.updatePassword(this.profileId, this.currentPassword, this.newPassword).subscribe({
      next: () => {
        this.passwordSuccess = 'Mot de passe mis à jour avec succès.';
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
        this.isSavingPassword = false;
      },
      error: () => {
        this.passwordError = 'Échec de mise à jour. Vérifiez votre mot de passe actuel.';
        this.isSavingPassword = false;
      }
    });
  }

  get avatarInitials(): string {
    const first = this.firstName?.charAt(0) ?? '';
    const last = this.lastName?.charAt(0) ?? '';
    const initials = `${first}${last}`.toUpperCase();
    return initials || 'U';
  }

  private resolveRoleLabel(roles: DbRole[]): string {
    const role = roles.find((item) => item.id === this.roleId);
    return role?.name ?? 'Rôle non défini';
  }
}
