export type UserRole = "BUYER" | "SELLER" | "ADMIN";

export interface User {
  id: string;
  username: string;
  email: string;
  displayName?: string | null;
  role: UserRole;
  isEmailVerified?: boolean;
  totpEnabled?: boolean;
  passwordAuthEnabled?: boolean;
  googleLinked?: boolean;
  avatarUrl?: string;
  bio?: string | null;
  city?: string | null;
  favoriteCategory?: string | null;
  emailDigestEnabled?: boolean;
  passwordChangedAt?: string;
  passwordExpiresAt?: string;
  passwordChangeRequired?: boolean;
  passwordExpiresSoon?: boolean;
  passwordExpiresInDays?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  captchaToken: string;
  captchaAnswer: string;
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
  captchaToken: string;
  captchaAnswer: string;
}

export interface ForgotPasswordRequest {
  email: string;
  captchaToken: string;
  captchaAnswer: string;
}

export interface ForgotPasswordResponse {  //forgot password response interface that defines the structure of the response returned by the API when a user requests a password reset. It includes the email address of the user, a boolean indicating whether the email delivery was requested successfully, the expiration time of the reset token in minutes, and an optional preview URL for testing purposes.
  emailDeliveryRequested: true;
  expiresInMinutes: number;
  previewUrl?: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  captchaToken: string;
  captchaAnswer: string;
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
  reauthToken: string;
}

export type ReauthenticationAction =
  | "CHANGE_PASSWORD"
  | "DISABLE_TOTP"
  | "REVOKE_OTHER_SESSIONS"
  | "UNLINK_GOOGLE"
  | "REGENERATE_RECOVERY_CODES";

export type ReauthenticationMethod = "PASSWORD" | "TOTP" | "RECOVERY_CODE";

export interface ReauthenticateRequest {
  action: ReauthenticationAction;
  method: ReauthenticationMethod;
  password?: string;
  code?: string;
}

export interface ReauthenticateResponse {
  reauthToken: string;
  expiresIn: number;
}

export interface ChangePasswordRequest {
  newPassword: string;
  reauthToken: string;
}

export interface RegenerateRecoveryCodesRequest {
  reauthToken: string;
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

export type CaptchaIntent = "LOGIN" | "REGISTER" | "PASSWORD_RESET";

export interface CaptchaChallenge {
  prompt: string;
  captchaToken: string;
  expiresInSeconds: number;
}

export interface ProfileUpdateRequest {
  displayName?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  city?: string | null;
  favoriteCategory?: string | null;
  emailDigestEnabled?: boolean;
}

export interface ProfileExportResponse {
  exportedAt: string;
  profile: {
    username: string;
    email: string;
    displayName: string | null;
    avatarUrl: string | null;
    bio: string | null;
    city: string | null;
    favoriteCategory: string | null;
    emailDigestEnabled: boolean;
    role: UserRole;
    createdAt: string;
    updatedAt: string;
  };
  securityPreferences: {
    totpEnabled: boolean;
    passwordChangeRequired: boolean;
    emailDigestEnabled: boolean;
  };
  linkedAccounts: {
    googleLinked: boolean;
  };
  privacyNotice: string;
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
