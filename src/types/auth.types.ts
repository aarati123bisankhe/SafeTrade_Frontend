export type UserRole = "BUYER" | "SELLER" | "ADMIN";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
  firstName?: string;
  lastName?: string;
  isEmailVerified?: boolean;
  isTotpEnabled?: boolean;
  avatarUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthSuccessResponse {
  accessToken: string;
  user: User;
}

export interface TotpChallenge {
  requiresTotp: true;
  mfaToken: string;
  message?: string;
}

export type LoginResponse = AuthSuccessResponse | TotpChallenge;

export interface TotpVerificationRequest {
  mfaToken: string;
  code: string;
}

export interface OAuthExchangeResponse {
  accessToken: string;
  user: User;
  isNewUser?: boolean;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginRequest) => Promise<LoginResponse>;
  register: (payload: RegisterRequest) => Promise<User>;
  logout: () => void;
  refreshCurrentUser: () => Promise<User | null>;
  verifyTotp: (
    payload: TotpVerificationRequest
  ) => Promise<AuthSuccessResponse>;
  exchangeGoogleCode: (code: string) => Promise<OAuthExchangeResponse>;
}
