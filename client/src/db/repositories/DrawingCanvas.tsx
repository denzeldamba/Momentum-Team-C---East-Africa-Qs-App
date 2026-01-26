 
import { useState, useEffect } from "react";
import { Stage, Layer, Line, Circle } from "react-konva";
import { Loader2, Ruler, Square, MousePointer2 } from "lucide-react";
import type { KonvaEventObject } from "konva/lib/Node"; // Import specific type

interface Measurement {
  id: string;
  type: "length" | "area";
  points: number[];
  value: number;
}

const DrawingCanvas = ({ fileUrl, scale = 1 }: { fileUrl: string; scale?: number }) => {
  const [tool, setTool] = useState<"select" | "length" | "area">("select");
  const [points, setPoints] = useState<number[]>([]);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new window.Image();
    img.src = fileUrl;
    img.onload = () => setImage(img);
  }, [fileUrl]);

  // ✅ Fixed Error 1: Replaced 'any' with KonvaEventObject
  const handleStageClick = (e: KonvaEventObject<MouseEvent>) => {
    if (tool === "select") return;

    const stage = e.target.getStage();
    if (!stage) return;
    
    const point = stage.getPointerPosition();
    if (!point) return;
    
    const newPoints = [...points, point.x, point.y];
    setPoints(newPoints);
  };

  const finishMeasurement = () => {
    if (points.length < 4) return; 

    const newMeasure: Measurement = {
      id: crypto.randomUUID(),
      type: tool === "area" ? "area" : "length",
      points: points,
      value: calculateValue(points, scale),
    };

    setMeasurements([...measurements, newMeasure]);
    setPoints([]); 
  };

  // ✅ Fixed Errors 2 & 3: Implemented real QS math using the parameters
  const calculateValue = (pts: number[], scaleFactor: number) => {
    if (pts.length < 4) return 0;

    if (tool === "length") {
      let totalLength = 0;
      for (let i = 0; i < pts.length - 2; i += 2) {
        const dx = pts[i + 2] - pts[i];
        const dy = pts[i + 3] - pts[i + 1];
        totalLength += Math.sqrt(dx * dx + dy * dy);
      }
      return totalLength * scaleFactor;
    }

    if (tool === "area") {
      // Shoelace Formula for Area
      let area = 0;
      for (let i = 0; i < pts.length; i += 2) {
        const x1 = pts[i];
        const y1 = pts[i + 1];
        const x2 = pts[(i + 2) % pts.length];
        const y2 = pts[(i + 3) % pts.length];
        area += x1 * y2 - x2 * y1;
      }
      return (Math.abs(area) / 2) * (scaleFactor * scaleFactor);
    }

    return 0;
  };

  if (!image) return (
    <div className="flex justify-center p-20">
      <Loader2 className="animate-spin text-amber-500" />
    </div>
  );

  return (
    <div className="relative bg-zinc-950 rounded-4xl overflow-hidden border border-zinc-800 shadow-2xl">
      {/* Toolbar */}
      <div className="absolute top-6 left-6 z-10 flex gap-2 bg-zinc-900/90 p-2 rounded-2xl border border-zinc-700 backdrop-blur-md">
        <button 
          onClick={() => { setTool("select"); setPoints([]); }}
          className={`p-3 rounded-xl transition-all ${tool === "select" ? "bg-amber-500 text-black" : "text-zinc-400 hover:bg-zinc-800"}`}
        >
          <MousePointer2 size={18} />
        </button>
        <button 
          onClick={() => { setTool("length"); setPoints([]); }}
          className={`p-3 rounded-xl transition-all ${tool === "length" ? "bg-amber-500 text-black" : "text-zinc-400 hover:bg-zinc-800"}`}
        >
          <Ruler size={18} />
        </button>
        <button 
          onClick={() => { setTool("area"); setPoints([]); }}
          className={`p-3 rounded-xl transition-all ${tool === "area" ? "bg-amber-500 text-black" : "text-zinc-400 hover:bg-zinc-800"}`}
        >
          <Square size={18} />
        </button>
        <div className="w-px h-8 bg-zinc-700 mx-1 self-center" />
        <button 
          onClick={finishMeasurement} 
          className="px-4 text-[10px] font-black uppercase text-amber-500 hover:text-white transition-colors disabled:opacity-30"
          disabled={points.length < 4}
        >
          Complete
        </button>
      </div>

      <Stage
        width={window.innerWidth * 0.8}
        height={800}
        onClick={handleStageClick}
        draggable={tool === "select"}
      >
        <Layer>
          {/* Background Indicator */}
          <Circle x={0} y={0} radius={0} /> 

          {/* Rendered Measurements */}
          {measurements.map((m) => (
            <Line
              key={m.id}
              points={m.points}
              stroke="#f59e0b"
              strokeWidth={3}
              closed={m.type === "area"}
              fill={m.type === "area" ? "rgba(245, 158, 11, 0.2)" : undefined}
            />
          ))}
          
          {/* Active Drawing Line */}
          <Line
            points={points}
            stroke="#ffffff"
            strokeWidth={2}
            dash={[5, 5]}
            closed={tool === "area" && points.length > 4}
          />
        </Layer>
      </Stage>
      
      {/* Legend / Stats */}
      <div className="absolute bottom-6 right-6 bg-zinc-900/80 p-4 rounded-2xl border border-zinc-800 backdrop-blur-sm">
        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-2">Live Take-off</p>
        <div className="flex gap-4">
          <div className="text-zinc-100 font-mono text-xs">
            Items: <span className="text-amber-500">{measurements.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DrawingCanvas;