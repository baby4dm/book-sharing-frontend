import { AUTH_TOKEN_KEY } from "@/lib/constants";
import axios, { isAxiosError } from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:8080",
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (token) {
    config.headers.Authorization = "Bearer " + token;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (isAxiosError(error) && error.response?.status === 401) {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      window.location.href = "/login";
    }

    return Promise.reject(error);
  },
);

export default apiClient;
