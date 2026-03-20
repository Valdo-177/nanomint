"use client";

import React, { useEffect, useState, useRef } from 'react';
import { 
  ChevronDown, 
  AlignCenter, 
  AlignLeft, 
  AlignRight,
  BringToFront,
  SendToBack,
  Trash2,
  Copy,
  Bold,
  Italic,
  Type,
  Pipette
} from 'lucide-react';
import { useEditor } from '../../store/EditorContext';

const fonts = [
  "Inter", 
  "Manrope",
  "Montserrat", 
  "Playfair Display", 
  "Roboto", 
  "Great Vibes",
  "Georgia",
  "Arial"
];

const weights = ["300", "400", "500", "600", "700", "800", "900"];

const ColorButton = ({ color, active, onClick }: { color: string, active?: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`w-8 h-8 rounded-full border-2 ${active ? 'border-primary shadow-[0_0_10px_rgba(59,219,173,0.5)] scale-110' : 'border-outline/20'} transition-all hover:scale-110 shadow-sm`}
    style={{ backgroundColor: color }}
  />
);

export default function PropertiesSidebar() {
  const { selectedObject, updateProperty, deleteSelected, canvas } = useEditor();
  const colorInputRef = useRef<HTMLInputElement>(null);
  
  // Local state for UI responsiveness
  const [fontSize, setFontSize] = useState<number>(32);
  const [fontFamily, setFontFamily] = useState<string>("Inter");
  const [charSpacing, setCharSpacing] = useState<number>(0);
  const [lineHeight, setLineHeight] = useState<number>(1.1);
  const [fill, setFill] = useState<string>("#121414");
  const [textAlign, setTextAlign] = useState<string>("center");
  const [fontWeight, setFontWeight] = useState<string>("400");
  const [fontStyle, setFontStyle] = useState<string>("normal");

  // Sync state with selected object
  useEffect(() => {
    if (selectedObject) {
      const obj = selectedObject as any;
      setFontSize(obj.fontSize || 32);
      setFontFamily(obj.fontFamily || "Inter");
      setCharSpacing(obj.charSpacing || 0);
      setLineHeight(obj.lineHeight || 1.1);
      setFill(obj.fill?.toString() || "#121414");
      setTextAlign(obj.textAlign || "left");
      setFontWeight(obj.fontWeight?.toString() || "400");
      setFontStyle(obj.fontStyle || "normal");
    }
  }, [selectedObject]);

  if (!selectedObject) {
    return (
      <div className="w-80 h-full flex flex-col items-center justify-center p-12 text-center gap-4 glass-panel border-l-0 rounded-l-3xl shadow-2xl z-50">
        <div className="w-16 h-16 rounded-3xl bg-surface-high flex items-center justify-center text-foreground/10">
          <Type size={32} />
        </div>
        <p className="text-sm font-bold uppercase tracking-widest text-foreground/20 italic">Select an element to edit properties</p>
      </div>
    );
  }

  const handleBringToFront = () => {
    if (canvas && selectedObject) {
      canvas.bringObjectToFront(selectedObject);
      // Ensure artboard is bottom
      const artboard = canvas.getObjects().find(o => (o as any).dataId === 'artboard');
      if (artboard) canvas.sendObjectToBack(artboard);
      canvas.renderAll();
    }
  };

  const handleSendToBack = () => {
    if (canvas && selectedObject) {
      canvas.sendObjectToBack(selectedObject);
      // Re-send artboard to bottom just in case
      const artboard = canvas.getObjects().find(o => (o as any).dataId === 'artboard');
      if (artboard) canvas.sendObjectToBack(artboard);
      canvas.renderAll();
    }
  };

  return (
    <div className="w-80 h-full flex flex-col p-6 gap-8 glass-panel border-l-0 rounded-l-3xl shadow-2xl z-50 overflow-y-auto custom-scrollbar">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-manrope font-extrabold tracking-tight text-foreground/90 uppercase">Element</h2>
        <div className="flex gap-2">
          <button 
            onClick={deleteSelected}
            className="p-2 rounded-lg bg-red-500/10 text-red-500/40 hover:text-red-500 transition-colors border border-red-500/10"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Font Section */}
      <section className="space-y-6">
        <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 block">Typography</label>
        
        <div className="space-y-4">
          {/* Font Family */}
          <div className="relative group">
            <select 
              value={fontFamily}
              onChange={(e) => updateProperty('fontFamily', e.target.value)}
              className="w-full appearance-none flex items-center justify-between p-4 rounded-xl bg-surface-low border border-outline/20 focus:border-primary/40 outline-none font-medium cursor-pointer"
            >
              {fonts.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
            <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <span className="text-[9px] uppercase font-bold text-foreground/30">Size</span>
              <input 
                type="number" 
                value={fontSize}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 12;
                  setFontSize(val);
                  updateProperty('fontSize', val);
                }}
                className="w-full p-4 rounded-xl bg-surface-low border border-outline/20 font-mono text-center focus:border-primary/40 outline-none"
              />
            </div>
            <div className="space-y-2">
              <span className="text-[9px] uppercase font-bold text-foreground/30">Weight</span>
              <div className="relative group">
                <select 
                  value={fontWeight}
                  onChange={(e) => updateProperty('fontWeight', e.target.value)}
                  className="w-full appearance-none p-4 rounded-xl bg-surface-low border border-outline/20 font-medium cursor-pointer outline-none"
                >
                  {weights.map(w => <option key={w} value={w}>{w}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Quick Style Toggles */}
          <div className="flex gap-2">
              <button 
                onClick={() => updateProperty('fontStyle', fontStyle === 'italic' ? 'normal' : 'italic')}
                className={`flex-1 flex items-center justify-center p-3 rounded-xl border transition-all ${fontStyle === 'italic' ? 'bg-primary/20 text-primary border-primary/30' : 'bg-surface-low border-outline/10 text-foreground/40'}`}
              >
                <Italic size={18} />
              </button>
              <div className="flex-[2] flex gap-1 p-1 rounded-xl bg-surface-low border border-outline/10">
                <button 
                  onClick={() => updateProperty('textAlign', 'left')}
                  className={`flex-1 flex justify-center p-2 rounded-lg transition-all ${textAlign === 'left' ? 'bg-primary/20 text-primary shadow-sm' : 'opacity-40 hover:opacity-100'}`}
                >
                  <AlignLeft size={18} />
                </button>
                <button 
                  onClick={() => updateProperty('textAlign', 'center')}
                  className={`flex-1 flex justify-center p-2 rounded-lg transition-all ${textAlign === 'center' ? 'bg-primary/20 text-primary shadow-sm' : 'opacity-40 hover:opacity-100'}`}
                >
                  <AlignCenter size={18} />
                </button>
                <button 
                  onClick={() => updateProperty('textAlign', 'right')}
                  className={`flex-1 flex justify-center p-2 rounded-lg transition-all ${textAlign === 'right' ? 'bg-primary/20 text-primary shadow-sm' : 'opacity-40 hover:opacity-100'}`}
                >
                  <AlignRight size={18} />
                </button>
              </div>
          </div>

          {/* Character Spacing */}
          <div className="space-y-3">
             <div className="flex justify-between items-center">
                <span className="text-[9px] uppercase font-bold text-foreground/30">Letter Spacing</span>
                <span className="text-[10px] font-mono text-primary">{Math.round(charSpacing)}</span>
             </div>
             <input 
                type="range"
                min="-100" max="1000"
                value={charSpacing}
                onChange={(e) => {
                   const val = parseInt(e.target.value);
                   setCharSpacing(val);
                   updateProperty('charSpacing', val);
                }}
                className="w-full accent-primary h-1 bg-outline/10 rounded-lg appearance-none cursor-pointer"
             />
          </div>

          {/* Line Height */}
          <div className="space-y-3">
             <div className="flex justify-between items-center">
                <span className="text-[9px] uppercase font-bold text-foreground/30">Line Height</span>
                <span className="text-[10px] font-mono text-primary">{lineHeight.toFixed(1)}</span>
             </div>
             <input 
                type="range"
                min="0.5" max="3" step="0.1"
                value={lineHeight}
                onChange={(e) => {
                   const val = parseFloat(e.target.value);
                   setLineHeight(val);
                   updateProperty('lineHeight', val);
                }}
                className="w-full accent-primary h-1 bg-outline/10 rounded-lg appearance-none cursor-pointer"
             />
          </div>
        </div>
      </section>

      {/* Color Section */}
      <section className="space-y-4">
        <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 block">Color Palette</label>
        <div className="flex flex-wrap gap-2 items-center">
          <ColorButton color="#69dbad" active={fill === '#69dbad'} onClick={() => updateProperty('fill', '#69dbad')} />
          <ColorButton color="#121414" active={fill === '#121414'} onClick={() => updateProperty('fill', '#121414')} />
          <ColorButton color="#FFFFFF" active={fill === '#FFFFFF'} onClick={() => updateProperty('fill', '#FFFFFF')} />
          <ColorButton color="#3EB489" active={fill === '#3EB489'} onClick={() => updateProperty('fill', '#3EB489')} />
          <ColorButton color="#FFD700" active={fill === '#FFD700'} onClick={() => updateProperty('fill', '#FFD700')} />
          <ColorButton color="#FF6B6B" active={fill === '#FF6B6B'} onClick={() => updateProperty('fill', '#FF6B6B')} />
          
          <div className="w-px h-6 bg-outline/10 mx-1" />
          
          <button 
            onClick={() => colorInputRef.current?.click()}
            className="w-8 h-8 rounded-full border border-outline/20 flex items-center justify-center bg-surface-high hover:border-primary transition-all text-foreground/40 hover:text-primary group relative overflow-hidden"
          >
             <Pipette size={14} className="z-10" />
             <input 
                ref={colorInputRef}
                type="color" 
                value={fill}
                onChange={(e) => updateProperty('fill', e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer scale-150"
             />
          </button>
        </div>
      </section>

      {/* Layers Section */}
      <section className="space-y-4">
        <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 block">Arrangement</label>
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={handleBringToFront}
            className="flex items-center gap-3 p-4 rounded-xl bg-surface-low border border-outline/20 hover:border-primary/40 transition-all font-medium text-xs group"
          >
            <BringToFront size={16} className="text-primary group-hover:scale-110 transition-transform" />
            To Front
          </button>
          <button 
            onClick={handleSendToBack}
            className="flex items-center gap-3 p-4 rounded-xl bg-surface-low border border-outline/20 hover:border-primary/40 transition-all font-medium text-xs group"
          >
            <SendToBack size={16} className="text-foreground/40 group-hover:scale-110 transition-transform" />
            To Back
          </button>
        </div>
      </section>

      <button 
        onClick={() => {
          if (selectedObject && canvas) {
            selectedObject.clone().then((cloned: any) => {
              cloned.set({
                left: (selectedObject.left || 0) + 20,
                top: (selectedObject.top || 0) + 20
              });
              canvas.add(cloned);
              canvas.setActiveObject(cloned);
              canvas.renderAll();
            });
          }
        }}
        className="w-full p-4 mt-auto rounded-xl btn-primary shadow-xl font-bold flex items-center justify-center gap-2 group"
      >
        <Copy size={20} className="group-hover:rotate-12 transition-transform" />
        Duplicate Layer
      </button>
    </div>
  );
}
