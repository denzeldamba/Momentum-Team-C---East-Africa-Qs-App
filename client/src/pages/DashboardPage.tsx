import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Added for navigation
import {
  Plus,
  Wifi,
  WifiOff,
  Trash2,
  ExternalLink,
  MapPin,
  Loader2,
  Check,
  X,
  Calendar
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
  const navigate = useNavigate(); // Navigation hook
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: projects, isLoading } = useProjects();
  const isOnline = useNetworkStatus();

  const [isCreating, setIsCreating] = useState(false);
  const [newProject, setNewProject] = useState({ name: "", client_name: "", location: "" });

  const placeholders: Record<string, string> = {
    name: "e.g., Two Rivers Mall",
    client_name: "e.g., Centum Real Estate",
    location: "e.g., Limuru Road, Nairobi"
  };

  const handleCreateNewProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !newProject.name || !newProject.client_name) {
      toast.error("Name and Client are required");
      return;
    }

    const toastId = toast.loading("Initializing project...");

    try {
      // Fixed: Passing only the project object as per your repo
      await createProject({
        id: crypto.randomUUID(),
        user_id: user.id,
        name: newProject.name,
        client_name: newProject.client_name,
        location: newProject.location,
        status: 'active',
        updated_at: Date.now(),
      });

      await queryClient.invalidateQueries({ queryKey: ["projects", user.id] });

      toast.success("Project saved to local vault", { id: toastId });
      setNewProject({ name: "", client_name: "", location: "" });
      setIsCreating(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to save locally", { id: toastId });
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!user?.id) return;

    if (window.confirm(`Permanently delete "${name}"?`)) {
      try {
        // Fixed: Passing only ID as per your repo
        await deleteProject(id);
        await queryClient.invalidateQueries({ queryKey: ["projects", user.id] });
        toast.success("Record purged");
      } catch {
        toast.error("Delete failed");
      }
    }
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
      <div className="text-center font-black text-amber-500 uppercase tracking-widest text-xs animate-pulse">
        Synchronizing Local Database...
      </div>
    </div>
  );

  return (
    <div className="space-y-8 min-h-full pb-20 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-theme">
        <div className="space-y-1">
          <h2 className="text-5xl font-black tracking-tighter text-theme uppercase italic">Dashboard</h2>
          <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest w-fit flex items-center gap-2 border ${isOnline ? "bg-green-500/10 text-green-600 border-green-500/20" : "bg-red-500/10 text-red-600 border-red-500/20"
            }`}>
            {isOnline ? <Wifi size={10} /> : <WifiOff size={10} />}
            {isOnline ? "Cloud Sync Active" : "Site Mode (Local Cache)"}
          </div>
        </div>

        {!isCreating && (
          <Button onClick={() => setIsCreating(true)} className="bg-amber-500 hover:bg-amber-400 text-black font-black uppercase text-xs tracking-widest px-8 py-6 rounded-2xl shadow-xl active:scale-95 transition-all">
            <Plus size={18} className="mr-2 stroke-[3px]" /> New Project
          </Button>
        )}
      </div>

      {/* New Project Form */}
      {isCreating && (
        <form onSubmit={handleCreateNewProject} className="bg-surface p-8 rounded-4xl border-2 border-dashed border-amber-500/30 shadow-2xl animate-in slide-in-from-top-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(['name', 'client_name', 'location'] as const).map((f) => (
              <div key={f} className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">{f.replace('_', ' ')}</label>
                <input
                  autoFocus={f === 'name'}
                  className="w-full bg-main p-4 rounded-xl border border-theme outline-none focus:ring-2 ring-amber-500 text-sm font-bold transition-all text-theme"
                  placeholder={placeholders[f]}
                  value={newProject[f]}
                  onChange={(e) => setNewProject({ ...newProject, [f]: e.target.value })}
                />
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-8">
            <Button type="submit" className="bg-amber-500 text-black font-black text-[10px] uppercase px-8 py-4 rounded-xl shadow-lg hover:bg-amber-400 transition-colors">
              <Check className="w-4 h-4 mr-2" /> Confirm Creation
            </Button>
            <Button variant="ghost" type="button" onClick={() => setIsCreating(false)} className="text-muted font-black uppercase text-xs">
              <X className="w-4 h-4 mr-2" /> Cancel
            </Button>
          </div>
        </form>
      )}

      {/* Project Table */}
      <div className="bg-surface rounded-4xl border border-theme overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-main/50 border-b border-theme">
              <tr>
                {["Project Entity", "Client / Location", "Timeline", "Control"].map((h) => (
                  <th key={h} className="px-10 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-muted">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-theme">
              {!projects?.length ? (
                <tr>
                  <td colSpan={5} className="px-8 py-32 text-center text-muted text-[10px] font-black uppercase tracking-widest italic opacity-50">
                    Local vault empty. Initialize a project to begin tracking.
                  </td>
                </tr>
              ) : (
                projects.map((p: Project) => (
                  <tr key={p.id} className="hover:bg-amber-500/5 transition-colors group text-theme">
                    <td className="px-10 py-8">
                      <span className="font-black text-lg uppercase tracking-tight group-hover:text-amber-500 transition-colors">{p.name}</span>
                    </td>
                    <td className="px-10 py-8">
                      <div className="text-xs font-black uppercase tracking-wider">{p.client_name}</div>
                      <div className="text-[10px] text-muted flex items-center gap-1 uppercase font-bold mt-1"><MapPin size={10} className="text-amber-500" /> {p.location}</div>
                    </td>
                    <td className="px-10 py-8 text-[10px] font-mono text-muted">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3 text-amber-500" />
                        {new Date(p.updated_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-5">
                        <button 
                          onClick={() => navigate(`/projects/${p.id}`)} // Linked to detail page
                          className="flex items-center gap-1.5 text-blue-500 font-black uppercase text-[10px] tracking-widest hover:bg-blue-500 hover:text-white px-4 py-2 rounded-lg border border-blue-500/30 transition-all"
                        >
                          <ExternalLink size={14} /> Open
                        </button>
                        <button onClick={() => handleDelete(p.id, p.name)} className="text-muted hover:text-red-500 transition-colors cursor-pointer">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;