import { createContext, useContext, useState, type ReactNode } from "react";
import { AUTH_TOKEN_KEY } from "../lib/constants";
import * as authApi from "../api/auth";

interface AuthContextValue {
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(AUTH_TOKEN_KEY),
  );

  async function login(email: string, password: string) {
    const response = await authApi.login({ email, password });
    localStorage.setItem(AUTH_TOKEN_KEY, response.token);
    setToken(response.token);
  }

  async function register(email: string, password: string, name: string) {
    const response = await authApi.register({ email, password, name });
    localStorage.setItem(AUTH_TOKEN_KEY, response.token);
    setToken(response.token);
  }

  function logout() {
    setToken(null);
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        isAuthenticated: token !== null,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth should be used inside AuthProvider");
  }
  return context;
}
