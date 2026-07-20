import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getMyProfile, updateMyProfile, uploadMyProfilePicture } from "../api/user.api";

export const useProfile = () => useQuery({ queryKey: ["profile", "me"], queryFn: getMyProfile });

export function useProfileActions() {
  const client = useQueryClient();
  const refresh = () => client.invalidateQueries({ queryKey: ["profile", "me"] });
  return {
    update: useMutation({ mutationFn: (payload) => updateMyProfile(payload), onSuccess: refresh }),
    uploadPicture: useMutation({ mutationFn: (file) => uploadMyProfilePicture(file), onSuccess: refresh }),
  };
}
