import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
} from "../features/auth/types";
import apiClient from "./client";

export async function register(data: RegisterRequest): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>(
    "api/auth/register",
    data,
  );
  return response.data;
}

export async function login(data: LoginRequest): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>("api/auth/login", data);
  return response.data;
}
