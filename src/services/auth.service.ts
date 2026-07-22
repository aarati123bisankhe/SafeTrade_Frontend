import api from "./api";
import type {
  ApiResponse,
  AuthSuccessResponse,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LoginRequest,
  LoginResponse,
  OAuthExchangeResponse,
  ReauthenticateRequest,
  ReauthenticateResponse,
  RegisterRequest,
  RegisterResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  TotpDisableRequest,
  TotpEnableRequest,
  TotpEnableResponse,
  TotpRecoveryVerificationRequest,
  TotpSetupResponse,
  TotpVerificationRequest,
  User,
} from "../types/auth.types";

const ACCESS_TOKEN_KEY = "accessToken";
const CURRENT_USER_KEY = "currentUser";
const MFA_TOKEN_KEY = "mfaToken";

const persistAuthenticatedSession = (
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

const mapUser = (user: User): User => {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    isEmailVerified: user.isEmailVerified,
    totpEnabled: user.totpEnabled,
    passwordAuthEnabled: user.passwordAuthEnabled,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

const normalizeAuthSuccess = (payload: {
  token: string;
  user: User;
}): AuthSuccessResponse => {
  return {
    accessToken: payload.token,
    user: mapUser(payload.user),
  };
};

export const authService = {
  async register(payload: RegisterRequest): Promise<RegisterResponse> {
    const { data } = await api.post<
      ApiResponse<RegisterResponse>
    >("/auth/register", payload);

    return data.data;
  },

  async verifyEmail(token: string): Promise<{ email: string; message: string }> {
    const { data } = await api.post<
      ApiResponse<{ email: string; message: string }>
    >("/auth/verify-email", { token });

    return data.data;
  },

  async requestPasswordReset(
    payload: ForgotPasswordRequest
  ): Promise<ForgotPasswordResponse> {
    const { data } = await api.post<ApiResponse<ForgotPasswordResponse>>(
      "/auth/forgot-password",
      payload
    );

    return data.data;
  },

  async resetPassword(
    payload: ResetPasswordRequest
  ): Promise<ResetPasswordResponse> {
    const { data } = await api.post<ApiResponse<ResetPasswordResponse>>(
      "/auth/reset-password",
      payload
    );

    return data.data;
  },

  async login(payload: LoginRequest): Promise<LoginResponse> {
    const { data } = await api.post<
      ApiResponse<
        | { user: User; token: string }
        | { user: User; requiresTotp: true; mfaToken: string }
      >
    >("/auth/login", payload);

    const responseData = data.data;

    if ("token" in responseData) {
      const normalizedResponse = normalizeAuthSuccess(responseData);

      persistAuthenticatedSession(
        normalizedResponse.accessToken,
        normalizedResponse.user
      );
      sessionStorage.removeItem(MFA_TOKEN_KEY);

      return normalizedResponse;
    }

    const totpChallenge = {
      requiresTotp: true as const,
      mfaToken: responseData.mfaToken,
      user: mapUser(responseData.user),
    };

    sessionStorage.setItem(MFA_TOKEN_KEY, totpChallenge.mfaToken);

    return totpChallenge;
  },

  async verifyTotp(
    payload: TotpVerificationRequest
  ): Promise<AuthSuccessResponse> {
    const { data } = await api.post<ApiResponse<{ user: User; token: string }>>(
      "/auth/totp/verify-login",
      payload
    );

    const normalizedResponse = normalizeAuthSuccess(data.data);

    persistAuthenticatedSession(
      normalizedResponse.accessToken,
      normalizedResponse.user
    );
    sessionStorage.removeItem(MFA_TOKEN_KEY);

    return normalizedResponse;
  },

  async verifyRecoveryCode(
    payload: TotpRecoveryVerificationRequest
  ): Promise<AuthSuccessResponse> {
    const { data } = await api.post<ApiResponse<{ user: User; token: string }>>(
      "/auth/totp/recovery",
      payload
    );

    const normalizedResponse = normalizeAuthSuccess(data.data);

    persistAuthenticatedSession(
      normalizedResponse.accessToken,
      normalizedResponse.user
    );
    sessionStorage.removeItem(MFA_TOKEN_KEY);

    return normalizedResponse;
  },

  async startTotpSetup(): Promise<TotpSetupResponse> {
    const { data } = await api.post<ApiResponse<TotpSetupResponse>>(
      "/auth/totp/setup"
    );

    return data.data;
  },

  async enableTotp(
    payload: TotpEnableRequest
  ): Promise<TotpEnableResponse> {
    const { data } = await api.post<ApiResponse<TotpEnableResponse>>(
      "/auth/totp/enable",
      payload
    );

    return data.data;
  },

  async disableTotp(payload: TotpDisableRequest): Promise<void> {
    await api.post<ApiResponse<null>>(
      "/auth/totp/disable",
      {},
      {
        headers: {
          "x-reauth-token": payload.reauthToken,
        },
      }
    );
  },

  async reauthenticate(
    payload: ReauthenticateRequest
  ): Promise<ReauthenticateResponse> {
    const { data } = await api.post<{
      success: boolean;
      message: string;
      reauthToken: string;
      expiresIn: number;
    }>("/auth/reauthenticate", payload);

    return {
      reauthToken: data.reauthToken,
      expiresIn: data.expiresIn,
    };
  },

  async changePassword(payload: ChangePasswordRequest): Promise<{ message: string }> {
    const { data } = await api.post<ApiResponse<{ message: string }>>(
      "/auth/change-password",
      { newPassword: payload.newPassword },
      {
        headers: {
          "x-reauth-token": payload.reauthToken,
        },
      }
    );

    return data.data;
  },

  async exchangeGoogleCode(code: string): Promise<OAuthExchangeResponse> {
    const { data } = await api.post<ApiResponse<{ user: User; token: string }>>(
      "/auth/oauth/exchange",
      { code }
    );

    const normalizedResponse = normalizeAuthSuccess(data.data);

    persistAuthenticatedSession(
      normalizedResponse.accessToken,
      normalizedResponse.user
    );
    sessionStorage.removeItem(MFA_TOKEN_KEY);

    return normalizedResponse;
  },

  async getCurrentUser(): Promise<User> {
    const { data } = await api.get<ApiResponse<User>>("/auth/me");

    const currentUser = mapUser(data.data);

    sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));

    return currentUser;
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
