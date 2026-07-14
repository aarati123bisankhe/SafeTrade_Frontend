import api from "./api";
import type {
  AuthSuccessResponse,
  LoginRequest,
  LoginResponse,
  OAuthExchangeResponse,
  RegisterRequest,
  TotpVerificationRequest,
  User,
} from "../types/auth.types";

const ACCESS_TOKEN_KEY = "accessToken";
const CURRENT_USER_KEY = "currentUser";
const MFA_TOKEN_KEY = "mfaToken";

const persistAuthenticatedSession = ( //persist the access token and user information in session storage
  accessToken: string,
  user: User
): void => {
  sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
};

const clearAuthenticatedSession = (): void => {
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(CURRENT_USER_KEY);
};

const isAuthSuccessResponse = (
  response: LoginResponse
): response is AuthSuccessResponse => {
  return "accessToken" in response;
};

export const authService = {
  async register(payload: RegisterRequest): Promise<User> {
    const { data } = await api.post<User>("/auth/register", payload);

    return data;
  },

  async login(payload: LoginRequest): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>("/auth/login", payload);

    if (isAuthSuccessResponse(data)) {
      persistAuthenticatedSession(data.accessToken, data.user);
      sessionStorage.removeItem(MFA_TOKEN_KEY);
    } else {
      sessionStorage.setItem(MFA_TOKEN_KEY, data.mfaToken);
    }

    return data;
  },

  async verifyTotp(
    payload: TotpVerificationRequest
  ): Promise<AuthSuccessResponse> {
    const { data } = await api.post<AuthSuccessResponse>(
      "/auth/totp/verify-login",
      payload
    );

    persistAuthenticatedSession(data.accessToken, data.user);
    sessionStorage.removeItem(MFA_TOKEN_KEY);

    return data;
  },

  async exchangeGoogleCode(code: string): Promise<OAuthExchangeResponse> {
    const { data } = await api.post<OAuthExchangeResponse>(
      "/auth/oauth/exchange",
      { code }
    );

    persistAuthenticatedSession(data.accessToken, data.user);
    sessionStorage.removeItem(MFA_TOKEN_KEY);

    return data;
  },

  async getCurrentUser(): Promise<User> {
    const { data } = await api.get<User>("/auth/me");

    sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(data));

    return data;
  },

  getStoredUser(): User | null {
    const storedUser = sessionStorage.getItem(CURRENT_USER_KEY);

    if (!storedUser) {
      return null;
    }

    try {
      return JSON.parse(storedUser) as User;
    } catch {
      sessionStorage.removeItem(CURRENT_USER_KEY);
      return null;
    }
  },

  getStoredAccessToken(): string | null {
    return sessionStorage.getItem(ACCESS_TOKEN_KEY);
  },

  getAccessToken(): string | null {
    return sessionStorage.getItem(ACCESS_TOKEN_KEY);
  },

  getStoredMfaToken(): string | null {
    return sessionStorage.getItem(MFA_TOKEN_KEY);
  },

  saveAccessToken(accessToken: string): void {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  },

  saveCurrentUser(user: User): void {
    sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  },

  logout(): void {
    clearAuthenticatedSession();
    sessionStorage.removeItem(MFA_TOKEN_KEY);
  },
};

export default authService;
