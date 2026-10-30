import type { InternalAxiosRequestConfig } from "axios";
import { createElement, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import apiClient from "@/api/client";
import { AuthProvider } from "@/context/AuthContext";

export interface Call { method: string; url: string; params: Record<string, unknown>; data: unknown }
type Handler = (call: Call) => unknown;

/** Підміна сервера: відповідь за методом і шляхом, кожен запит записується */
export function mockServer(routes: Record<string, unknown | Handler> = {}) {
  const calls: Call[] = [];
  apiClient.defaults.adapter = async (config: InternalAxiosRequestConfig) => {
    const call: Call = {
      method: config.method!.toUpperCase(),
      url: "/" + config.url!.replace(/^\//, ""),
      params: config.params ?? {},
      data: typeof config.data === "string" ? JSON.parse(config.data) : config.data,
    };
    calls.push(call);
    const key = `${call.method} ${call.url}`;
    const route = key in routes ? routes[key] : routes[call.url];
    if (route instanceof Error) {
      throw Object.assign(route, { isAxiosError: true, config, response: { status: 500, data: {}, headers: {}, config, statusText: "" } });
    }
    const data = typeof route === "function" ? (route as Handler)(call) : route ?? {};
    return { data, status: 200, statusText: "OK", headers: {}, config };
  };
  return {
    calls,
    last: () => calls[calls.length - 1],
    find: (method: string, url: string) => calls.find((c) => c.method === method && c.url === url),
  };
}

export function createQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity }, mutations: { retry: false } } });
}

export function wrapper(qc: QueryClient) {
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: qc }, createElement(AuthProvider, null, children));
}
