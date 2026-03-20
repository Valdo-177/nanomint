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
  Italic,
  Type,
  Pipette,
  Search,
  Check
} from 'lucide-react';
import { useEditor } from '../../store/EditorContext';

const fontDatabase = [
  { name: "Inter", category: "Sans Serif" },
  { name: "Manrope", category: "Sans Serif" },
  { name: "Montserrat", category: "Sans Serif" },
  { name: "Roboto", category: "Sans Serif" },
  { name: "Playfair Display", category: "Serif" },
  { name: "Prata", category: "Serif" },
  { name: "Cinzel", category: "Serif" },
  { name: "Great Vibes", category: "Script" },
  { name: "Alex Brush", category: "Script" },
  { name: "Dancing Script", category: "Script" },
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
  
  // States
  const [fontSize, setFontSize] = useState<number>(32);
  const [fontFamily, setFontFamily] = useState<string>("Inter");
  const [charSpacing, setCharSpacing] = useState<number>(0);
  const [lineHeight, setLineHeight] = useState<number>(1.1);
  const [fill, setFill] = useState<string>("#121414");
  const [textAlign, setTextAlign] = useState<string>("center");
  const [fontWeight, setFontWeight] = useState<string>("400");
  const [fontStyle, setFontStyle] = useState<string>("normal");

  // Dropdown UI
  const [fontSearch, setFontSearch] = useState("");
  const [isFontOpen, setIsFontOpen] = useState(false);

  useEffect(() => {
    if (selectedObject) {
      const obj = selectedObject as any;
      setFontSize(Math.round(obj.fontSize) || 32);
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

  const handleUpdate = (prop: string, val: any) => {
     updateProperty(prop, val);
     // Manual render call for immediate font loading update
     canvas?.requestRenderAll();
  };

  const filteredFonts = fontDatabase.filter(f => f.name.toLowerCase().includes(fontSearch.toLowerCase()));

  return (
    <div className="w-80 h-full flex flex-col p-6 gap-8 glass-panel border-l-0 rounded-l-3xl shadow-2xl z-50 overflow-y-auto custom-scrollbar relative">
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

      {/* Typography Section */}
      <section className="space-y-6">
        <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 block">Typography</label>
        
        <div className="space-y-4">
          
          {/* Custom Font Selector UI */}
          <div className="relative">
            <button 
                onClick={() => setIsFontOpen(!isFontOpen)}
                className="w-full flex items-center justify-between p-4 rounded-2xl bg-surface-low border border-outline/10 hover:border-primary/40 transition-all text-left group"
            >
                <div className="flex flex-col">
                    <span className="text-[9px] uppercase font-bold text-foreground/30 mb-0.5">Family</span>
                    <span className="font-semibold text-sm group-hover:text-primary transition-colors" style={{ fontFamily }}>{fontFamily}</span>
                </div>
                <ChevronDown size={18} className={`opacity-20 transition-transform duration-300 ${isFontOpen ? 'rotate-180' : ''}`} />
            </button>

            {isFontOpen && (
                <>
                <div className="fixed inset-0 z-[60]" onClick={() => setIsFontOpen(false)} />
                <div className="absolute top-[calc(100%+8px)] left-0 w-[120%] -left-[10%] bg-surface-lowest border border-outline/10 shadow-2xl rounded-3xl z-[70] overflow-hidden backdrop-blur-3xl animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-4 border-b border-outline/10 flex items-center gap-3">
                        <Search size={16} className="opacity-20" />
                        <input 
                            autoFocus
                            placeholder="Search fonts..."
                            className="bg-transparent border-none outline-none text-sm w-full font-medium"
                            value={fontSearch}
                            onChange={(e) => setFontSearch(e.target.value)}
                        />
                    </div>
                    <div className="max-h-72 overflow-y-auto custom-scrollbar py-2">
                        {filteredFonts.map(f => (
                            <button 
                                key={f.name}
                                onClick={() => {
                                    handleUpdate('fontFamily', f.name);
                                    setIsFontOpen(false);
                                }}
                                className={`w-full flex items-center justify-between px-5 py-3 hover:bg-white/5 transition-colors group ${fontFamily === f.name ? 'text-primary bg-primary/5' : ''}`}
                            >
                                <div className="flex flex-col items-start translate-x-0 group-hover:translate-x-1 transition-transform">
                                    <span className="text-xs opacity-40 uppercase font-bold text-[8px] mb-1">{f.category}</span>
                                    <span style={{ fontFamily: f.name }} className="text-lg">{f.name}</span>
                                </div>
                                {fontFamily === f.name && <Check size={16} />}
                            </button>
                        ))}
                    </div>
                </div>
                </>
            )}
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
                  handleUpdate('fontSize', val);
                }}
                className="w-full p-4 rounded-2xl bg-surface-low border border-outline/10 font-mono text-center focus:border-primary/40 outline-none transition-all hover:bg-surface-high/50"
              />
            </div>
            <div className="space-y-2">
              <span className="text-[9px] uppercase font-bold text-foreground/30">Weight</span>
              <div className="relative group">
                <select 
                  value={fontWeight}
                  onChange={(e) => handleUpdate('fontWeight', e.target.value)}
                  className="w-full appearance-none p-4 rounded-2xl bg-surface-low border border-outline/10 font-bold cursor-pointer outline-none hover:bg-surface-high/50 transition-all text-center"
                >
                  {weights.map(w => <option key={w} value={w}>{w}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="flex gap-2">
              <button 
                onClick={() => handleUpdate('fontStyle', fontStyle === 'italic' ? 'normal' : 'italic')}
                className={`flex-1 flex items-center justify-center p-4 rounded-2xl border transition-all ${fontStyle === 'italic' ? 'bg-primary/20 text-primary border-primary/30 shadow-[0_0_15px_rgba(59,219,173,0.2)]' : 'bg-surface-low border-outline/10 text-foreground/30 hover:bg-surface-high'}`}
              >
                <Italic size={18} />
              </button>
              <div className="flex-2 flex gap-1 p-1 rounded-2xl bg-surface-low border border-outline/5">
                {[
                    { val: 'left', icon: <AlignLeft size={18}/> },
                    { val: 'center', icon: <AlignCenter size={18}/> },
                    { val: 'right', icon: <AlignRight size={18}/> }
                ].map(item => (
                    <button 
                        key={item.val}
                        onClick={() => handleUpdate('textAlign', item.val)}
                        className={`flex-1 flex justify-center p-3 rounded-xl transition-all ${textAlign === item.val ? 'bg-primary/20 text-primary shadow-sm' : 'opacity-20 hover:opacity-100'}`}
                    >
                        {item.icon}
                    </button>
                ))}
              </div>
          </div>

          <div className="space-y-4 pt-2">
             <div className="flex justify-between items-center text-[9px] uppercase font-extrabold tracking-tighter text-foreground/20">
                <span>Letter Spacing</span>
                <span className="font-mono text-primary/60">{Math.round(charSpacing)}</span>
             </div>
             <input type="range" min="-100" max="1000" value={charSpacing} onChange={(e) => { setCharSpacing(parseInt(e.target.value)); handleUpdate('charSpacing', parseInt(e.target.value)); }} className="w-full accent-primary h-1 bg-outline/10 rounded-lg appearance-none cursor-pointer" />
             
             <div className="flex justify-between items-center text-[9px] uppercase font-extrabold tracking-tighter text-foreground/20 pt-2">
                <span>Line Height</span>
                <span className="font-mono text-primary/60">{lineHeight.toFixed(1)}</span>
             </div>
             <input type="range" min="0.5" max="3" step="0.1" value={lineHeight} onChange={(e) => { setLineHeight(parseFloat(e.target.value)); handleUpdate('lineHeight', parseFloat(e.target.value)); }} className="w-full accent-primary h-1 bg-outline/10 rounded-lg appearance-none cursor-pointer" />
          </div>
        </div>
      </section>

      {/* Color UI */}
      <section className="space-y-4">
        <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 block">Palette & Tint</label>
        <div className="flex flex-wrap gap-2.5 items-center">
          {["#69dbad", "#121414", "#FFFFFF", "#3EB489", "#FFD700", "#FF6B6B"].map(color => (
            <ColorButton key={color} color={color} active={fill === color} onClick={() => handleUpdate('fill', color)} />
          ))}
          <div className="w-px h-6 bg-outline/10 mx-1" />
          <button 
            onClick={() => colorInputRef.current?.click()}
            className="w-10 h-10 rounded-full border border-outline/10 flex items-center justify-center bg-surface-low hover:border-primary/40 transition-all text-foreground/20 hover:text-primary relative overflow-hidden group shadow-lg"
          >
             <Pipette size={16} className="z-10 group-hover:scale-110 transition-transform" />
             <input ref={colorInputRef} type="color" value={fill} onChange={(e) => handleUpdate('fill', e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer scale-150" />
          </button>
        </div>
      </section>

      {/* Layers UI */}
      <section className="space-y-4">
        <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 block">Arrangement</label>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => { canvas?.bringObjectToFront(selectedObject); const sheet = canvas?.getObjects().find(o => (o as any).dataId === 'artboard'); if (sheet) canvas?.sendObjectToBack(sheet); canvas?.renderAll(); }} className="flex items-center gap-3 p-4 rounded-2xl bg-surface-low border border-outline/10 hover:border-primary/40 transition-all font-bold text-[10px] uppercase tracking-wider group">
            <BringToFront size={16} className="text-primary group-hover:scale-110 transition-transform" />
            Front
          </button>
          <button onClick={() => { canvas?.sendObjectToBack(selectedObject); const sheet = canvas?.getObjects().find(o => (o as any).dataId === 'artboard'); if (sheet) canvas?.sendObjectToBack(sheet); canvas?.renderAll(); }} className="flex items-center gap-3 p-4 rounded-2xl bg-surface-low border border-outline/10 hover:border-primary/40 transition-all font-bold text-[10px] uppercase tracking-wider group text-foreground/30">
            <SendToBack size={16} className="group-hover:scale-110 transition-transform" />
            Back
          </button>
        </div>
      </section>

      {/* Actions */}
      <div className="flex flex-col gap-3 mt-auto">
        <button 
            onClick={() => {
                if (selectedObject && canvas) {
                    selectedObject.clone().then((cloned: any) => {
                        cloned.set({ left: (selectedObject.left || 0) + 20, top: (selectedObject.top || 0) + 20 });
                        canvas.add(cloned); canvas.setActiveObject(cloned); canvas.renderAll();
                    });
                }
            }}
            className="w-full p-4 rounded-2xl bg-surface-high/50 hover:bg-surface-high border border-outline/10 transition-all font-bold flex items-center justify-center gap-3 group text-xs uppercase tracking-widest"
        >
            <Copy size={18} className="opacity-40 group-hover:opacity-100 transition-opacity" />
            Duplicate
        </button>
      </div>
    </div>
  );
}
