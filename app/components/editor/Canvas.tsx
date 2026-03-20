"use client";

import React, { useEffect, useRef } from "react";
import * as fabric from "fabric";
import { useEditor } from "../../store/EditorContext";

/**
 * 🎨 Figma-style Infinite Canvas
 * Fix: Removed infinite loop by stabilizing dependencies.
 */
export default function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Destructure functions from context
  const { 
    setCanvas, 
    setSelectedObject, 
    zoomIn, zoomOut, zoomToFit, 
    undo, redo, deleteSelected 
  } = useEditor();

  // Create refs for functions to avoid re-running the main initialization effect
  const undoRef = useRef(undo);
  const redoRef = useRef(redo);
  const deleteRef = useRef(deleteSelected);

  useEffect(() => {
    undoRef.current = undo;
    redoRef.current = redo;
    deleteRef.current = deleteSelected;
  }, [undo, redo, deleteSelected]);

  // Guidelines state (ref is fine, doesn't trigger re-renders)
  const snappingLines = useRef({ vertical: false, horizontal: false });

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const container = containerRef.current;

    // 1. Initialize Canvas Instance
    const instance = new fabric.Canvas(canvasRef.current, {
      width: container.clientWidth || 1000,
      height: container.clientHeight || 700,
      backgroundColor: "#121414",
      preserveObjectStacking: true,
      fireRightClick: true,
      stopContextMenu: true,
    });

    setCanvas(instance);

    // 2. Initial Artboard
    const sheet = new fabric.Rect({
      left: 0, top: 0, width: 1000, height: 700,
      fill: "#ffffff", selectable: false, evented: false,
      originX: "center", originY: "center",
      // @ts-ignore
      dataId: "artboard",
      shadow: new fabric.Shadow({ color: "rgba(0,0,0,0.4)", blur: 40, offsetX: 0, offsetY: 15 }),
    });

    const title = new fabric.Textbox("CERTIFICATE", {
      left: 0, top: -170, width: 800,
      fontFamily: "Manrope", fontSize: 80, fontWeight: "900",
      charSpacing: 200, fill: "#121414",
      originX: "center", originY: "center", textAlign: "center",
    });

    instance.add(sheet, title);

    const fit = () => {
      const cw = container.clientWidth;
      const ch = container.clientHeight;
      const s = Math.min((cw - 100) / 1000, (ch - 100) / 700, 1);
      instance.setViewportTransform([s, 0, 0, s, cw / 2, ch / 2] as any);
      instance.requestRenderAll();
    };

    // 3. Events
    instance.on('object:moving', (opt) => {
      const obj = opt.target;
      if (!obj) return;
      snappingLines.current = { vertical: false, horizontal: false };
      if (Math.abs(obj.left) < 5) { obj.set({ left: 0 }); snappingLines.current.vertical = true; }
      if (Math.abs(obj.top) < 5) { obj.set({ top: 0 }); snappingLines.current.horizontal = true; }
    });

    instance.on('after:render', () => {
      const ctx = instance.getContext();
      const vpt = instance.viewportTransform!;
      ctx.save();
      ctx.transform(vpt[0], vpt[1], vpt[2], vpt[3], vpt[4], vpt[5]);
      ctx.strokeStyle = '#ff3e3e';
      ctx.lineWidth = 1 / instance.getZoom();
      ctx.setLineDash([5, 5]);
      if (snappingLines.current.vertical) { ctx.beginPath(); ctx.moveTo(0, -2000); ctx.lineTo(0, 2000); ctx.stroke(); }
      if (snappingLines.current.horizontal) { ctx.beginPath(); ctx.moveTo(-2000, 0); ctx.lineTo(1000, 0); ctx.stroke(); }
      ctx.restore();
    });

    instance.on("mouse:wheel", (opt) => {
      const e = opt.e as WheelEvent;
      if (e.ctrlKey || e.metaKey) {
        let zoom = instance.getZoom();
        zoom *= 0.991 ** e.deltaY;
        zoom = Math.min(Math.max(zoom, 0.05), 20);
        instance.zoomToPoint(new fabric.Point(e.offsetX, e.offsetY), zoom);
      } else {
        const vpt = [...(instance.viewportTransform || [1,0,0,1,0,0])];
        vpt[4] -= e.deltaX; vpt[5] -= e.deltaY;
        instance.setViewportTransform(vpt as any);
      }
      e.preventDefault(); e.stopPropagation();
    });

    // Pan
    let isDrag = false, lx = 0, ly = 0;
    instance.on("mouse:down", (opt) => {
      const e = opt.e as any;
      if (e.altKey || e.button === 1 || e.button === 2) {
        isDrag = true; instance.selection = false;
        lx = e.clientX; ly = e.clientY;
        container.style.cursor = "grabbing";
      }
    });
    instance.on("mouse:move", (opt) => {
      if (isDrag) {
        const e = opt.e as any;
        const vpt = [...(instance.viewportTransform || [1,0,0,1,0,0])];
        vpt[4] += e.clientX - lx; vpt[5] += e.clientY - ly;
        instance.setViewportTransform(vpt as any);
        lx = e.clientX; ly = e.clientY;
        instance.requestRenderAll();
      }
    });
    instance.on("mouse:up", () => {
      isDrag = false; instance.selection = true;
      container.style.cursor = "default";
      snappingLines.current = { vertical: false, horizontal: false };
      instance.requestRenderAll();
    });

    // Selection
    const sel = (e: any) => {
      const obj = e.selected?.[0];
      if (obj && obj.dataId === "artboard") { instance.discardActiveObject(); return; }
      setSelectedObject(obj || null);
    };
    instance.on("selection:created", sel);
    instance.on("selection:updated", sel);
    instance.on("selection:cleared", () => setSelectedObject(null));

    // Shortcuts using REFs to avoid re-rendering
    const handleKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); undoRef.current(); }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'Z'))) { e.preventDefault(); redoRef.current(); }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const act = instance.getActiveObject();
        if (act && !(act as any).isEditing) deleteRef.current();
      }
    };
    window.addEventListener('keydown', handleKey);

    // Resize
    const observer = new ResizeObserver(() => {
      if (!instance.getElement()) return;
      instance.setDimensions({ width: container.clientWidth, height: container.clientHeight });
      fit();
    });
    observer.observe(container);

    fit();

    return () => {
      observer.disconnect();
      window.removeEventListener('keydown', handleKey);
      instance.dispose();
      // Use a reference to setCanvas if needed, but actually setCanvas is stable
      setCanvas(null);
    };
    // Only setCanvas is a stable dependency. Others would cause loops.
  }, [setCanvas, setSelectedObject]); 

  return (
    <div
      ref={containerRef}
      className="flex-1 bg-[#121414] overflow-hidden relative"
      onContextMenu={(e) => e.preventDefault()}
    >
      <canvas ref={canvasRef} />

      {/* Hints */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full glass-panel flex items-center gap-3 border-outline/10 pointer-events-none opacity-40">
        <div className="flex items-center gap-2">
          <kbd className="px-2 py-0.5 rounded bg-surface-high text-[10px] border border-outline/20">CTRL</kbd>
          <span className="text-[9px] font-black uppercase">+ WHEEL TO ZOOM</span>
        </div>
        <div className="w-px h-3 bg-outline/20" />
        <div className="flex items-center gap-2">
          <kbd className="px-2 py-0.5 rounded bg-surface-high text-[10px] border border-outline/20">MID CLICK</kbd>
          <span className="text-[9px] font-black uppercase">OR ALT + DRAG TO PAN</span>
        </div>
      </div>

      {/* Zoom UI */}
      <div className="absolute bottom-12 right-12 flex flex-col gap-2 scale-90 origin-bottom-right">
        <div className="glass-panel p-2 rounded-2xl flex flex-col gap-1 border-outline/10 shadow-2xl">
          <button onClick={zoomIn} className="w-10 h-10 rounded-xl hover:bg-surface-high flex items-center justify-center font-bold text-foreground/60">+</button>
          <div className="h-px w-6 bg-outline/10 mx-auto" />
          <button onClick={zoomOut} className="w-10 h-10 rounded-xl hover:bg-surface-high flex items-center justify-center font-bold text-foreground/60">-</button>
        </div>
        <button onClick={zoomToFit} className="glass-panel w-14 h-14 rounded-2xl flex items-center justify-center text-foreground/60 border-outline/10 hover:text-primary transition-colors">
          <span className="text-[10px] font-black tracking-widest uppercase text-primary">Fit</span>
        </button>
      </div>
    </div>
  );
}
