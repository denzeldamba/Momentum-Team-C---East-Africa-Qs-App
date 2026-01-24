import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, HardHat, FileText, Settings, Share2, Clock } from "lucide-react";
import { Button } from "../Components/ui/button";
import { useProjects } from "../hooks/UseProjects";

const ProjectDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: projects } = useProjects();
  
  // Find the specific project from the local cache
  const project = projects?.find((p) => p.id === id);

  if (!project) return (
    <div className="flex flex-col items-center justify-center h-screen text-muted italic uppercase text-xs font-black tracking-widest">
      Project Record Not Found
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Back & Actions */}
      <div className="flex justify-between items-center">
        <button 
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-muted hover:text-theme font-black uppercase text-[10px] tracking-widest transition-colors"
        >
          <ArrowLeft size={16} /> Back to Vault
        </button>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="rounded-full border border-theme"><Share2 size={16}/></Button>
          <Button variant="ghost" size="icon" className="rounded-full border border-theme"><Settings size={16}/></Button>
        </div>
      </div>

      {/* Hero Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 text-amber-500">
            <HardHat size={24} className="stroke-[3px]"/>
            <span className="text-xs font-black uppercase tracking-[0.3em]">Project Master File</span>
        </div>
        <h1 className="text-6xl font-black italic uppercase tracking-tighter text-theme leading-none">
          {project.name}
        </h1>
        <div className="flex flex-wrap gap-6 items-center text-muted">
            <div className="flex items-center gap-2 font-black uppercase text-[10px] tracking-widest">
                <FileText size={14} className="text-amber-500" /> {project.client_name}
            </div>
            <div className="flex items-center gap-2 font-black uppercase text-[10px] tracking-widest">
                <MapPin size={14} className="text-amber-500" /> {project.location}
            </div>
            <div className="flex items-center gap-2 font-black uppercase text-[10px] tracking-widest">
                <Clock size={14} className="text-amber-500" /> Updated {new Date(project.updated_at).toLocaleDateString()}
            </div>
        </div>
      </div>

      {/* Main Grid Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-8">
        {/* Document Area */}
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-surface p-12 rounded-4xl border-2 border-dashed border-theme flex flex-col items-center justify-center gap-6 min-h-[400px] hover:border-amber-500/50 transition-colors cursor-pointer group">
                <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Plus size={32} className="text-amber-500 stroke-[3px]" />
                </div>
                <div className="text-center">
                    <h3 className="text-lg font-black uppercase italic text-theme">Upload PDF Blueprint</h3>
                    <p className="text-[10px] text-muted font-black uppercase tracking-widest mt-2">Maximum file size: 50MB (Stored Locally)</p>
                </div>
            </div>
        </div>

        {/* Sidebar Statistics */}
        <div className="space-y-6">
            <div className="bg-surface p-6 rounded-3xl border border-theme">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-500 mb-6 italic">Project Health</h4>
                <div className="space-y-4">
                    <div className="flex justify-between items-end border-b border-theme pb-2">
                        <span className="text-[10px] font-black uppercase text-muted">Measurements</span>
                        <span className="text-xl font-black italic leading-none">0.00</span>
                    </div>
                    <div className="flex justify-between items-end border-b border-theme pb-2">
                        <span className="text-[10px] font-black uppercase text-muted">Sync Status</span>
                        <span className="text-[10px] font-black uppercase text-green-500">Vaulted</span>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailPage;