export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  organization: string;
}

export interface GoogleAuthRequest {
  credential: string;
  mode: 'signup' | 'login';
}

export interface FacebookAuthRequest {
  accessToken: string;
  mode: 'signup' | 'login';
}

export interface EmailRequest {
  email: string;
}

export interface VerifyCodeRequest {
  email: string;
  code: string;
}

export interface ResetPasswordConfirmRequest {
  email: string;
  code: string;
  newPassword: string;
}

export interface CodeResponse {
  message: string;
}

export interface GoogleErrorResponse {
  error: string;
  message: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  profilePictureUrl?: string;
  requiresPasswordChange?: boolean;
}
