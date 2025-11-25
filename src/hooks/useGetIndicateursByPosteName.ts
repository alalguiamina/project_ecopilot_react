import { useMemo } from "react";
import { useGetPostesEmission } from "./useGetPostesEmission";
import { useGetPosteIndicateurs } from "./useGetPosteIndicateurs";
import type { PosteIndicateur } from "../types/postesIndicateurs";

interface UseGetIndicateursByPosteNameOptions {
  posteName: string;
}

export const useGetIndicateursByPosteName = ({
  posteName,
}: UseGetIndicateursByPosteNameOptions) => {
  // Get all postes to find the poste by name
  const {
    data: postes,
    isLoading: postesLoading,
    error: postesError,
  } = useGetPostesEmission();

  // Find the poste by name
  const selectedPoste = useMemo(() => {
    return postes?.find(
      (poste) => poste.name.toLowerCase() === posteName.toLowerCase(),
    );
  }, [postes, posteName]);

  // Get indicateurs for the selected poste
  const {
    data: indicateurs,
    isLoading: indicateursLoading,
    error: indicateursError,
    refetch,
  } = useGetPosteIndicateurs({
    posteId: selectedPoste?.id || 0,
    enabled: !!selectedPoste?.id,
  });

  return {
    poste: selectedPoste,
    indicateurs: indicateurs || [],
    isLoading: postesLoading || indicateursLoading,
    error: postesError || indicateursError,
    refetch,
  };
};
