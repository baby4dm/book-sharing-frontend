import { getUser } from "@/api/user";
import { useQuery } from "@tanstack/react-query";

export function useUser(id: string | undefined) {
  return useQuery({ queryKey: ["user", id], queryFn: () => getUser(id) });
}
