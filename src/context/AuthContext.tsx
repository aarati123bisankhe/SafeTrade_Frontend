import {
  createContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import authService from "../services/auth.service"; 
import type {
  AuthContextType,
  LoginRequest,
  RegisterRequest,
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
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      const token = authService.getAccessToken();

      if (!token) {
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

  const refreshCurrentUser = async () => { // Refresh the current user data from the server
    const currentUser = await authService.getCurrentUser();
    setUser(currentUser);

    return currentUser;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: Boolean(user),
    isLoading,
    register,
    login,
    logout,
    refreshCurrentUser,
    verifyTotp,
    exchangeGoogleCode,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
