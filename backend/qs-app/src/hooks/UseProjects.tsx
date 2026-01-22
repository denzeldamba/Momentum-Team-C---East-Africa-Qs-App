import { useQuery } from "@tanstack/react-query";
import { getProjects } from "../db/repositories/projectsrepo.tsx";

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: getProjects,
  });
}
