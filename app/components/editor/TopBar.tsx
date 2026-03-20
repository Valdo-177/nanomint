"use client";

import React from 'react';
import { Download, ChevronDown, CheckCircle2, History, Share2 } from 'lucide-react';
import { useEditor } from '../../store/EditorContext';

export default function TopBar() {
  const { canvas } = useEditor();

  const handleExportPNG = async () => {
    if (!canvas) return;
    
    // 1. Prepare for export: Deselect & Force render
    canvas.discardActiveObject();
    canvas.renderAll();

    // 2. Export only the artboard area
    // Fabric 7.x: toDataURL with crop options is relative to absolute coordinates
    // We must ensure the multiplier is handled correctly.
    
    const artboard = canvas.getObjects().find(obj => (obj as any).dataId === 'artboard');
    if (!artboard) {
      alert("Error: Artboard not found");
      return;
    }

    // Hide shadow temporarily for a clean edge
    const originalShadow = artboard.shadow;
    artboard.set({ shadow: null });

    // Store current state to reset view
    const originalVpt = [...(canvas.viewportTransform || [1, 0, 0, 1, 0, 0])];
    
    // Reset view to Identity for consistent clipping (0,0 is world origin)
    canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    canvas.renderAll();

    try {
      // Since origin is center (0,0), the top-left of the 1000x700 rect is (-500, -350)
      const dataURL = canvas.toDataURL({
        format: 'png',
        left: -500,
        top: -350,
        width: 1000,
        height: 700,
        multiplier: 2, 
        enableRetinaScaling: false,
      });

      // 3. Trigger download
      const link = document.createElement('a');
      link.download = `nanomint-certificate-${Date.now()}.png`;
      link.href = dataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      // 4. Restore everything
      artboard.set({ shadow: originalShadow });
      canvas.setViewportTransform(originalVpt as any);
      canvas.renderAll();
    }
  };

  return (
    <header className="h-20 w-full glass-panel border-t-0 border-x-0 flex items-center justify-between px-8 z-50">
      <div className="flex items-center gap-6">
         <div className="flex items-center gap-3">
            <span className="text-xl font-manrope font-black tracking-tighter text-foreground/90 uppercase">NanoMint</span>
            <div className="px-3 py-1 bg-primary/10 rounded-full border border-primary/20 text-[10px] uppercase font-black text-primary tracking-widest">
              PRO
            </div>
         </div>
         <div className="w-px h-6 bg-outline/20" />
         <div className="flex items-center gap-2 group cursor-pointer">
            <span className="text-sm font-medium text-foreground/50 group-hover:text-foreground">Certificate of Excellence 2024</span>
            <ChevronDown size={14} className="text-foreground/30" />
         </div>
         <div className="flex items-center gap-2 ml-4">
            <CheckCircle2 size={16} className="text-primary/40" />
            <span className="text-[10px] font-bold uppercase text-foreground/20 tracking-widest">Autosaved</span>
         </div>
      </div>

      <div className="flex items-center gap-4">
         <button className="p-3 rounded-xl bg-surface-low border border-outline/20 hover:border-primary/40 transition-all text-foreground/40 hover:text-primary">
            <History size={20} />
         </button>
         <button className="p-3 rounded-xl bg-surface-low border border-outline/20 hover:border-primary/40 transition-all text-foreground/40 hover:text-primary">
            <Share2 size={20} />
         </button>
         
         <div className="h-10 w-px bg-outline/20 mx-2" />

         <button 
            onClick={handleExportPNG}
            className="btn-primary flex items-center gap-3 px-8 py-3.5 rounded-xl font-bold text-sm shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95 group"
         >
            <Download size={20} className="group-hover:-translate-y-0.5 transition-transform" />
            Export Project
            <ChevronDown size={16} className="opacity-40" />
         </button>
      </div>
    </header>
  );
}
