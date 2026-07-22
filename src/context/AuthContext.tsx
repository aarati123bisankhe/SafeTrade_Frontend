import {
  createContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import authService from "../services/auth.service"; 
import sessionService from "../services/session.service";
import type {
  AuthContextType,
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
  TotpVerificationRequest,
  User,
} from "../types/auth.types";

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(() => authService.getStoredUser());
  const [isLoading, setIsLoading] = useState(() =>
    Boolean(authService.getAccessToken()) && !authService.getStoredUser()
  );

  useEffect(() => {
    const restoreSession = async () => {
      const token = authService.getAccessToken();

      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch {
        authService.logout();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    void restoreSession();
  }, []);

  const register = async (data: RegisterRequest) => { 
    return authService.register(data);
  };

  const verifyEmail = async (token: string) => {
    return authService.verifyEmail(token);
  };

  const requestPasswordReset = async (data: ForgotPasswordRequest) => {
    return authService.requestPasswordReset(data);
  };

  const resetPassword = async (data: ResetPasswordRequest) => {
    return authService.resetPassword(data);
  };

  const login = async (data: LoginRequest) => {
    const response = await authService.login(data);

    if ("requiresTotp" in response && response.requiresTotp) {
      return response;
    }

    if (!("accessToken" in response)) {
      return response;
    }

    authService.saveAccessToken(response.accessToken);

    const currentUser = await authService.getCurrentUser();
    setUser(currentUser);

    return response;
  };

  const verifyTotp = async (data: TotpVerificationRequest) => {
    const response = await authService.verifyTotp(data);

    authService.saveAccessToken(response.accessToken);

    const currentUser = await authService.getCurrentUser();
    setUser(currentUser);

    return response;
  };

  const exchangeGoogleCode = async (code: string) => { 
    const response = await authService.exchangeGoogleCode(code);

    authService.saveAccessToken(response.accessToken);

    const currentUser = await authService.getCurrentUser();
    setUser(currentUser);

    return {
      ...response,
      user: currentUser,
    };
  };

  const refreshCurrentUser = async () => { 
    const currentUser = await authService.getCurrentUser();
    setUser(currentUser);

    return currentUser;
  };

  const logout = async () => {
    try {
      await sessionService.revokeCurrentSession();
    } catch {
      // Clear local state even if server-side logout fails.
    } finally {
      authService.logout();
      setUser(null);
    }
  };

  const effectiveUser = user ?? authService.getStoredUser();

  const value: AuthContextType = {
    user: effectiveUser,
    isAuthenticated: Boolean(effectiveUser),
    isLoading,
    register,
    login,
    requestPasswordReset,
    resetPassword,
    logout,
    refreshCurrentUser,
    verifyTotp,
    exchangeGoogleCode,
    verifyEmail,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
