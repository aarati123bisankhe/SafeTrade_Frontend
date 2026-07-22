export type UserRole = "BUYER" | "SELLER" | "ADMIN";

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  isEmailVerified?: boolean;
  totpEnabled?: boolean;
  avatarUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  email: string;
  verificationEmailSent: boolean;
  expiresInMinutes: number;
  previewUrl?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  emailDeliveryRequested: true;
  expiresInMinutes: number;
  previewUrl?: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface ResetPasswordResponse {
  email: string;
  message: string;
}

export interface ActiveSession {
  id: string;
  device: string;
  ipAddress: string;
  createdAt: string;
  lastUsedAt: string;
  expiresAt: string;
  isCurrent: boolean;
}

export interface AuthSuccessResponse {
  accessToken: string;
  user: User;
}

export interface TotpChallenge {
  requiresTotp: true;
  mfaToken: string;
  user: User;
  message?: string;
}

export type LoginResponse = AuthSuccessResponse | TotpChallenge;

export interface TotpVerificationRequest {
  mfaToken: string;
  code: string;
}

export interface TotpRecoveryVerificationRequest {
  mfaToken: string;
  recoveryCode: string;
}

export interface TotpSetupResponse {
  qrCodeDataUrl: string;
  manualKey: string;
}

export interface TotpEnableRequest {
  code: string;
}

export interface TotpEnableResponse {
  recoveryCodes: string[];
}

export interface TotpDisableRequest {
  password: string;
  code?: string;
  recoveryCode?: string;
}

export interface OAuthExchangeResponse {
  accessToken: string;
  user: User;
  isNewUser?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  success?: boolean;
  message?: string;
  errors?: {
    fieldErrors?: Record<string, string[] | undefined>;
    formErrors?: string[];
  };
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginRequest) => Promise<LoginResponse>;
  register: (payload: RegisterRequest) => Promise<RegisterResponse>;
  requestPasswordReset: (
    payload: ForgotPasswordRequest
  ) => Promise<ForgotPasswordResponse>;
  resetPassword: (
    payload: ResetPasswordRequest
  ) => Promise<ResetPasswordResponse>;
  logout: () => Promise<void>;
  refreshCurrentUser: () => Promise<User | null>;
  verifyTotp: (
    payload: TotpVerificationRequest
  ) => Promise<AuthSuccessResponse>;
  exchangeGoogleCode: (code: string) => Promise<OAuthExchangeResponse>;
  verifyEmail: (token: string) => Promise<{ email: string; message: string }>;
}
