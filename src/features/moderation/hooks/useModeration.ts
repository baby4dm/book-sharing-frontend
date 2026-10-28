import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  getHiddenListings,
  getModerationActions,
  getModerationDispute,
  getModerationDisputes,
  getModerationSummary,
  getModerationUser,
  getModerationUsers,
  hideListing,
  changeUserRole,
  liftRestriction,
  moderateDeleteComment,
  moderateDeletePost,
  resolveDispute,
  restoreListing,
  restrictUser,
} from "@/api/moderation";
import { postCommentsKey } from "@/features/feed/utils/feedCache";
import { useCurrentUserProfile } from "@/features/userProfile/hooks/useCurrentUserProfile";
import {
  isModeratorRole,
  type DisputeDecision,
  type RestrictUserPayload,
  type UserStatus,
} from "../types";

/** Чи поточний користувач — модератор або адміністратор */
export function useIsModerator() {
  const { data: me, isPending } = useCurrentUserProfile();
  return { isModerator: isModeratorRole(me?.role), isPending, me };
}

export function useModerationSummary() {
  const { isModerator } = useIsModerator();
  return useQuery({
    queryKey: ["moderation", "summary"],
    queryFn: getModerationSummary,
    enabled: isModerator,
    refetchInterval: 60_000,
  });
}

export function useModerationDisputes(status: "OPEN" | "RESOLVED") {
  return useQuery({
    queryKey: ["moderation", "disputes", status],
    queryFn: () => getModerationDisputes(status),
  });
}

export function useModerationDispute(id: string | undefined) {
  return useQuery({
    queryKey: ["moderation", "dispute", id],
    queryFn: () => getModerationDispute(id!),
    enabled: !!id,
  });
}

/** Після будь-якої дії модератора лічильники й списки мають оновитися */
function useInvalidateModeration() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["moderation"] });
}

export function useResolveDispute(id: string) {
  const invalidate = useInvalidateModeration();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      status: DisputeDecision;
      resolutionComment: string;
    }) => resolveDispute(id, payload),
    onSuccess: () => {
      invalidate();
      queryClient.invalidateQueries({ queryKey: ["exchange"] });
    },
  });
}

export function useModerationUsers(params: {
  q: string;
  status: UserStatus | null;
  page: number;
}) {
  return useQuery({
    queryKey: ["moderation", "users", params],
    queryFn: () => getModerationUsers(params),
    placeholderData: keepPreviousData,
  });
}

export function useModerationUser(id: string | undefined) {
  return useQuery({
    queryKey: ["moderation", "user", id],
    queryFn: () => getModerationUser(id!),
    enabled: !!id,
  });
}

export function useRestrictUser(
  id: string,
  options: { onSettled?: () => void } = {},
) {
  const invalidate = useInvalidateModeration();
  return useMutation({
    mutationFn: (payload: RestrictUserPayload) => restrictUser(id, payload),
    onSuccess: invalidate,
    onSettled: options.onSettled,
  });
}

export function useLiftRestriction(id: string) {
  const invalidate = useInvalidateModeration();
  return useMutation({
    mutationFn: (reason?: string) => liftRestriction(id, reason),
    onSuccess: invalidate,
  });
}

export function useChangeUserRole(id: string) {
  const invalidate = useInvalidateModeration();
  return useMutation({
    mutationFn: (role: "USER" | "MODERATOR") => changeUserRole(id, role),
    onSuccess: invalidate,
  });
}

export function useHiddenListings(page: number) {
  return useQuery({
    queryKey: ["moderation", "hiddenListings", page],
    queryFn: () => getHiddenListings(page),
    placeholderData: keepPreviousData,
  });
}

export function useHideListing() {
  const invalidate = useInvalidateModeration();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      hideListing(id, reason),
    onSuccess: (listing) => {
      invalidate();
      queryClient.setQueryData(["listing", listing.id], listing);
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      queryClient.invalidateQueries({ queryKey: ["myListings"] });
    },
  });
}

export function useRestoreListing() {
  const invalidate = useInvalidateModeration();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => restoreListing(id),
    onSuccess: (listing) => {
      invalidate();
      queryClient.setQueryData(["listing", listing.id], listing);
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      queryClient.invalidateQueries({ queryKey: ["myListings"] });
    },
  });
}

export function useModerateDeletePost() {
  const invalidate = useInvalidateModeration();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      moderateDeletePost(id, reason),
    onSuccess: () => {
      invalidate();
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });
}

export function useModerateDeleteComment(postId: string) {
  const invalidate = useInvalidateModeration();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      moderateDeleteComment(id, reason),
    onSuccess: () => {
      invalidate();
      queryClient.invalidateQueries({ queryKey: postCommentsKey(postId) });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
  });
}

export function useModerationActions(scope: "all" | "content", page: number) {
  return useQuery({
    queryKey: ["moderation", "actions", scope, page],
    queryFn: () => getModerationActions(scope, page),
    placeholderData: keepPreviousData,
  });
}
