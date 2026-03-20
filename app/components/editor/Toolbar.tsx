"use client";

import React from 'react';
import { 
  Type, 
  Image as ImageIcon, 
  PenTool, 
  Square, 
  Layout,
  Plus
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useEditor } from '../../store/EditorContext';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ToolButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  active?: boolean;
}

const ToolButton = ({ icon, label, onClick, active }: ToolButtonProps) => (
  <button
    onClick={onClick}
    className={cn(
      "group flex flex-col items-center justify-center gap-1 w-16 h-16 rounded-xl transition-all duration-200",
      active 
        ? "bg-primary/20 text-primary border border-primary/30" 
        : "text-foreground/60 hover:text-primary hover:bg-surface-high border border-transparent"
    )}
  >
    <div className="w-6 h-6">{icon}</div>
    <span className="text-[10px] uppercase font-bold tracking-wider">{label}</span>
  </button>
);

export default function Toolbar() {
  const { addText } = useEditor();

  return (
    <div className="w-24 flex flex-col items-center py-6 gap-6 glass-panel border-r-0 rounded-r-3xl z-50">
      <div className="mb-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-mint-accent flex items-center justify-center text-primary-foreground font-black text-xl shadow-lg shadow-primary/20">
          N
        </div>
      </div>
      
      <div className="flex flex-col gap-4">
        <ToolButton 
          icon={<Type />} 
          label="Text" 
          onClick={() => addText('New Text Element')}
        />
        <ToolButton icon={<ImageIcon />} label="Logos" />
        <ToolButton icon={<PenTool />} label="Sign" />
        <ToolButton icon={<Square />} label="Shapes" />
        <ToolButton icon={<Layout />} label="Layouts" />
      </div>

      <div className="mt-auto">
         <button className="w-12 h-12 rounded-full flex items-center justify-center bg-surface-high text-foreground/40 hover:text-primary transition-colors border border-outline/20">
           <Plus className="w-6 h-6" />
         </button>
      </div>
    </div>
  );
}
