import type { ExchangeResponse } from "@/features/exchanges/types";
import apiClient from "./client";

export async function getCurrentUserExchanges(): Promise<ExchangeResponse[]> {
  const response = await apiClient.get<ExchangeResponse[]>("/api/exchanges/my");
  return response.data;
}
