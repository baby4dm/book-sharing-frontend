import { uploadFile } from "@/api/createListing";
import { useMutation } from "@tanstack/react-query";

export function useUploadFile() {
  return useMutation({ mutationFn: uploadFile });
}
