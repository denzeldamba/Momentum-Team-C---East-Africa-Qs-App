import { useQuery } from "@tanstack/react-query";
import { getProjects } from "../db/repositories/projectsrepo.tsx";
import { useAuth } from "../lib/AuthContext";

export function useProjects() {
  const { session } = useAuth();
  const userId = session?.user?.id;

  return useQuery({
    // Adding userId to the key ensures the list resets when users switch
    queryKey: ["projects", userId], 
    queryFn: () => getProjects(userId),
    // This tells React Query the data is "stale" and needs checking often
    staleTime: 1000, 
  });
}