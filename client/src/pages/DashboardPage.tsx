import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus, Wifi, WifiOff, Trash2, ExternalLink,
  MapPin, Loader2, Check,  Calendar
} from "lucide-react";
import { Button } from "../Components/ui/button";
import { useProjects } from "../hooks/UseProjects";
import { useNetworkStatus } from "../hooks/useNetworkStatus";
import { createProject, deleteProject } from "../db/repositories/projectsrepo";
import { useAuth } from "../lib/AuthContext";
import type { Project } from "../db/OfflineDb";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: projects, isLoading } = useProjects();
  const isOnline = useNetworkStatus();

  const [isCreating, setIsCreating] = useState(false);
  const [openingId, setOpeningId] = useState<string | null>(null);
  
  const [newProject, setNewProject] = useState({ 
    name: "", 
    client_name: "", 
    location: "" 
  });

  const placeholders: Record<string, string> = {
    name: "e.g., Two Rivers Mall",
    client_name: "e.g., Centum Real Estate",
    location: "e.g., Limuru Road, Nairobi"
  };

  // ✅ IMPROVED: Added delay and spinner for "Open"
  const handleViewProject = (id: string) => {
    setOpeningId(id);
    setTimeout(() => {
      navigate(`/projects/${id}`);
    }, 600);
  };

  const handleCreateNewProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !newProject.name || !newProject.client_name) {
      toast.error("Name and Client are required");
      return;
    }

    const toastId = toast.loading("Initializing project...");
    try {
      const projectData: Project = {
        id: crypto.randomUUID(),
        user_id: user.id,
        name: newProject.name,
        client_name: newProject.client_name,
        location: newProject.location,
        status: 'active',
        updated_at: Date.now(),
        created_at: Date.now(),
      };

      await createProject(projectData, user.id);
      await queryClient.invalidateQueries({ queryKey: ["projects", user.id] });
      toast.success("Project saved", { id: toastId });
      setNewProject({ name: "", client_name: "", location: "" });
      setIsCreating(false);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Failed to save");
    }
  };

  // ✅ FIXED: Delete functionality now invalidates cache immediately
  const handleDelete = async (id: string, name: string) => {
    if (!user?.id) return;
    if (window.confirm(`Permanently delete "${name}"?`)) {
      try {
        await deleteProject(id, user.id);
        // This force-refreshes the list from IndexedDB
        await queryClient.invalidateQueries({ queryKey: ["projects", user.id] });
        toast.success("Project purged from vault");
      } catch {
        toast.error("Delete failed");
      }
    }
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
      <div className="text-center font-black text-amber-500 uppercase tracking-widest text-xs">
        Synchronizing...
      </div>
    </div>
  );

  return (
    <div className="space-y-8 min-h-full pb-20 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div className="space-y-1">
          <h2 className="text-5xl font-black tracking-tighter text-amber-400 dark:text-zinc-100 uppercase italic">Dashboard</h2>
          <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest w-fit flex items-center gap-2 border ${isOnline ? "bg-green-500/10 text-green-600 border-green-500/20" : "bg-red-500/10 text-red-600 border-red-500/20"}`}>
            {isOnline ? <Wifi size={10} /> : <WifiOff size={10} />}
            {isOnline ? "Cloud Sync Active" : "Local Mode"}
          </div>
        </div>

        {!isCreating && (
          <Button onClick={() => setIsCreating(true)} className="bg-amber-500 hover:bg-amber-400 text-black font-black uppercase text-xs px-8 py-6 rounded-2xl active:scale-95 transition-all shadow-lg">
            <Plus size={18} className="mr-2 stroke-[3px]" /> New Project
          </Button>
        )}
      </div>

      {isCreating && (
        <form onSubmit={handleCreateNewProject} className="bg-zinc-50 dark:bg-zinc-900/50 p-8 rounded-3xl border-2 border-dashed border-amber-500/30 animate-in slide-in-from-top-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(['name', 'client_name', 'location'] as const).map((f) => (
              <div key={f} className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 ml-1">{f.replace('_', ' ')}</label>
                <input
                  autoFocus={f === 'name'}
                  className="w-full bg-white dark:bg-zinc-950 p-4 rounded-xl border border-zinc-300 dark:border-zinc-800 outline-none focus:ring-2 ring-amber-500 text-sm font-bold text-zinc-900 dark:text-zinc-100"
                  placeholder={placeholders[f]}
                  value={newProject[f]}
                  onChange={(e) => setNewProject({ ...newProject, [f]: e.target.value })}
                />
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-8">
            <Button type="submit" className="bg-amber-500 text-black font-black text-[10px] uppercase px-8 py-4 rounded-xl shadow-md">
              <Check className="w-4 h-4 mr-2" /> Confirm
            </Button>
            <Button variant="ghost" type="button" onClick={() => setIsCreating(false)} className="text-zinc-500 font-black uppercase text-xs">
              Cancel
            </Button>
          </div>
        </form>
      )}

      <div className="bg-white dark:bg-[#09090b] rounded-4xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                {["Project Entity", "Client / Location", "Timeline", "Control"].map((h) => (
                  <th key={h} className="px-10 py-5 text-left text-[10px] font-black uppercase tracking-widest text-zinc-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {projects?.map((p: Project) => (
                <tr key={p.id} className="hover:bg-amber-500/5 transition-colors group">
                  <td className="px-10 py-8">
                    <span className="font-black text-lg uppercase tracking-tight text-zinc-900 dark:text-zinc-100 group-hover:text-amber-500 transition-colors">{p.name}</span>
                  </td>
                  <td className="px-10 py-8">
                    <div className="text-xs font-black uppercase text-zinc-800 dark:text-zinc-200">{p.client_name}</div>
                    <div className="text-[10px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1 uppercase font-bold mt-1">
                      <MapPin size={10} className="text-amber-500" /> {p.location || "N/A"}
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500 dark:text-zinc-400 font-bold">
                      <Calendar className="w-3 h-3 text-amber-500" />
                      {new Date(p.updated_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-5">
                      <button
                        onClick={() => handleViewProject(p.id)}
                        disabled={openingId === p.id}
                        className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-black uppercase text-[10px] tracking-widest hover:bg-blue-500 hover:text-white px-4 py-2 rounded-lg border border-blue-500/30 transition-all min-w-22.5 justify-center"
                      >
                        {openingId === p.id ? <Loader2 size={12} className="animate-spin" /> : <><ExternalLink size={12} /> Open</>}
                      </button>
                      <button onClick={() => handleDelete(p.id, p.name)} className="text-zinc-400 hover:text-red-500 transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;