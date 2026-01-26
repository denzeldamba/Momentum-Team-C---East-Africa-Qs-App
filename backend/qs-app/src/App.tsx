import { useEffect } from "react";
import { createProject } from "./db/repositories/projectsrepo";
import { useProjects } from "./hooks/UseProjects";
import { useNetworkStatus } from "./hooks/useNetworkStatus";
import { syncPending } from "./sync/SyncEngine";
import { supabase } from "./lib/Supabase";

export default function App() {
  const { data: projects } = useProjects();
  const online = useNetworkStatus();

  useEffect(() => {
    if (!online) return;

    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        syncPending(data.user.id);
      }
    });
  }, [online]); // 🔑 sync whenever network comes back

  return (
    <div style={{ padding: 20 }}>
      <h2>Offline Test</h2>
      <p>Status: {online ? "🟢 Online" : "🔴 Offline"}</p>

      <button
        onClick={async () => {
          await createProject({
            id: crypto.randomUUID(),
            name: "Test Project",
            client: "Test Client",
            updated_at: Date.now(),
          });
          alert("Project saved OFFLINE");
        }}
      >
        Create Project
      </button>

      <h3>Saved Projects</h3>
      <ul>
        {projects?.map((p) => (
          <li key={p.id}>
            {p.name} — {p.client}
          </li>
        ))}
      </ul>
    </div>
  );
}
