import { getCurrentUser } from "@/api/user";
import { useQuery } from "@tanstack/react-query";

export function useCurrentUserProfile() {
    return useQuery({
        queryKey: ['currentProfile'],
        queryFn: getCurrentUser
    })
}