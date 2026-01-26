/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  FileText, Trash2, Upload, Loader2, ArrowLeft, 
  Calculator, ListChecks, ChevronRight, HardHat 
} from "lucide-react";

// Repositories
import { getProjectFilesByProject, addProjectFile, deleteProjectFile } from "../db/repositories/drawingsrepo";
import { getBoqByProject } from "../db/repositories/boqrepo";
import { useAuth } from "../lib/AuthContext";
import type { ProjectFile } from "../db/OfflineDb";
import toast from "react-hot-toast";

// Assuming DrawingCanvas is in the same directory or adjust path
import DrawingCanvas from "../db/repositories/DrawingCanvas"; 

const ProjectDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState<"drawings" | "boq" | "takeoffs">("drawings");
  const [isUploading, setIsUploading] = useState(false);
  const [selectedDrawing, setSelectedDrawing] = useState<ProjectFile | null>(null);

  // Queries
  const { data: drawings, isLoading: loadingDrawings } = useQuery({
    queryKey: ["drawings", id],
    queryFn: () => getProjectFilesByProject(id!),
    enabled: !!id,
  });

  const { data: boqItems, isLoading: loadingBoq } = useQuery({
    queryKey: ["boq", id],
    queryFn: () => getBoqByProject(id!),
    enabled: !!id,
  });

  // ✅ FIXED: Delete Handler with proper async flow and UI refresh
  const handleDeleteFile = async (fileId: string) => {
    if (!user?.id) return;
    if (!window.confirm("Are you sure you want to delete this blueprint?")) return;

    const toastId = toast.loading("Purging from vault...");
    try {
      await deleteProjectFile(fileId, user.id);
      await queryClient.invalidateQueries({ queryKey: ["drawings", id] });
      toast.success("File removed", { id: toastId });
      if (selectedDrawing?.id === fileId) setSelectedDrawing(null);
    } catch (error) {
      toast.error("Delete failed", { id: toastId });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id || !user) return;

    setIsUploading(true);
    const toastId = toast.loading("Processing blueprint...");

    try {
      const newDrawing: ProjectFile = {
        id: crypto.randomUUID(),
        project_id: id,
        name: file.name,
        file_url: URL.createObjectURL(file), 
        file_type: file.type.includes("pdf") ? "pdf" : "image", 
        version: 1,
        is_latest: true,
        updated_at: Date.now(),
      };

      await addProjectFile(newDrawing, user.id);
      await queryClient.invalidateQueries({ queryKey: ["drawings", id] });
      toast.success("Added to local vault", { id: toastId });
    } catch (_error) {
      toast.error("Upload failed", { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  const launchCanvas = (doc: ProjectFile) => {
    setSelectedDrawing(doc);
    setActiveTab("takeoffs");
  };

  if (loadingDrawings || loadingBoq) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <Loader2 className="animate-spin text-amber-500 mb-4" size={40} />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400">Loading Project Assets...</p>
    </div>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col gap-6">
        <Link to="/dashboard" className="flex items-center gap-2 text-zinc-500 hover:text-amber-500 transition-colors font-black uppercase text-[10px] tracking-widest group">
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Workspace
        </Link>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-5xl font-black uppercase tracking-tighter italic text-amber-300 dark:text-zinc-100">Project Master</h1>
            <div className="flex items-center gap-3 mt-2">
              <span className="bg-amber-500/10 text-amber-600 dark:text-amber-500 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border border-amber-500/20">Active Site</span>
              <p className="text-zinc-400 dark:text-zinc-500 text-[10px] font-bold uppercase tracking-widest">ID: {id?.slice(0, 8)}</p>
            </div>
          </div>

          <div className="flex gap-3">
             <label className="cursor-pointer group">
              <input type="file" className="hidden" onChange={handleFileUpload} accept=".pdf,image/*" />
              <div className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 transition-all active:scale-95 shadow-xl hover:bg-zinc-800 dark:hover:bg-white">
                {isUploading ? <Loader2 className="animate-spin w-4 h-4" /> : <Upload size={16} />}
                Add Document
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-8 border-b border-zinc-200 dark:border-zinc-800/50">
        {[
          { id: "drawings", label: "Blueprints", icon: FileText },
          { id: "boq", label: "Bill of Quantities", icon: ListChecks },
          { id: "takeoffs", label: "Take-off Canvas", icon: Calculator }
        ].map((tab) => (
          <button
            key={tab.id}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${
              activeTab === tab.id ? "border-b-2 border-amber-500 text-amber-600 dark:text-amber-500" : "text-zinc-400 hover:text-zinc-900 dark:text-zinc-600 dark:hover:text-zinc-400"
            }`}
          >
            <tab.icon size={14} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="mt-8">
        {activeTab === "drawings" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {drawings?.map((doc) => (
              <div key={doc.id} className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 p-6 rounded-3xl group hover:border-amber-500/50 transition-all shadow-sm">
                <div className="flex justify-between items-start mb-6">
                  <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-2xl text-amber-500 group-hover:scale-110 transition-transform">
                    <FileText size={24} />
                  </div>
                  <button onClick={() => handleDeleteFile(doc.id)} className="text-zinc-300 dark:text-zinc-700 hover:text-red-500 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
                <h3 className="font-black uppercase text-sm tracking-tight truncate text-zinc-800 dark:text-zinc-100">{doc.name}</h3>
                <p className="text-[9px] text-zinc-500 font-bold uppercase mt-1 tracking-widest">v{doc.version} • {doc.file_type}</p>
                <button 
                  onClick={() => launchCanvas(doc)}
                  className="w-full mt-6 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 group-hover:bg-amber-500 group-hover:text-black py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all flex items-center justify-center gap-2"
                >
                  Launch Canvas <ChevronRight size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === "boq" && (
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-4xl overflow-hidden shadow-2xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-900/50 text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] border-b border-zinc-200 dark:border-zinc-800">
                  <th className="p-6">Item Description</th>
                  <th className="p-6">Unit</th>
                  <th className="p-6">Measured Qty</th>
                  <th className="p-6 text-right">Total (KES)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
                {boqItems?.map((item) => (
                  <tr key={item.id} className="group hover:bg-amber-500/5 transition-colors">
                    <td className="p-6 text-xs font-black uppercase text-zinc-700 dark:text-zinc-200">{item.description}</td>
                    <td className="p-6 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase">{item.unit}</td>
                    <td className="p-6 text-xs font-mono text-amber-600 dark:text-amber-500 font-bold">0.00</td>
                    <td className="p-6 text-right text-xs font-mono text-zinc-600 dark:text-zinc-400 italic">KES 0.00</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "takeoffs" && (
          <div className="min-h-150 w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-4xl overflow-hidden transition-all">
            {selectedDrawing ? (
              <DrawingCanvas fileUrl={selectedDrawing.file_url} />
            ) : (
              <div className="flex flex-col items-center justify-center py-40">
                <HardHat size={48} className="text-zinc-300 dark:text-zinc-800 mb-4" />
                <p className="text-zinc-500 font-black uppercase text-[10px] tracking-widest">Select a drawing from the Blueprints tab to start measuring</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetailPage;