"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import * as fabric from 'fabric';

interface EditorContextType {
  canvas: fabric.Canvas | null;
  setCanvas: (canvas: fabric.Canvas | null) => void;
  selectedObject: fabric.FabricObject | null;
  setSelectedObject: (obj: fabric.FabricObject | null) => void;
  addText: (text?: string) => void;
  deleteSelected: () => void;
  updateProperty: (property: string, value: any) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  zoomToFit: () => void;
  undo: () => void;
  redo: () => void;
  zoom: number;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export function EditorProvider({ children }: { children: React.ReactNode }) {
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [selectedObject, setSelectedObject] = useState<fabric.FabricObject | null>(null);
  const [zoom, setZoom] = useState(1);
  const [history, setHistory] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);

  const saveHistory = useCallback(() => {
    if (!canvas) return;
    const json = JSON.stringify(canvas.toJSON());
    setHistory(prev => [...prev, json]);
    setRedoStack([]);
  }, [canvas]);

  const addText = useCallback((text = 'Click to edit text') => {
    if (!canvas) return;
    saveHistory();
    const newText = new fabric.Textbox(text, {
      left: 0,
      top: 0,
      width: 400,
      fontFamily: 'Inter',
      fontSize: 32,
      fill: '#121414',
      originX: 'center',
      originY: 'center',
      textAlign: 'center',
    });
    canvas.add(newText);
    canvas.setActiveObject(newText);
    canvas.renderAll();
  }, [canvas, saveHistory]);

  const deleteSelected = useCallback(() => {
    if (!canvas || !selectedObject) return;
    saveHistory();
    canvas.remove(selectedObject);
    canvas.discardActiveObject();
    canvas.renderAll();
  }, [canvas, selectedObject, saveHistory]);

  const updateProperty = useCallback((property: string, value: any) => {
    if (!canvas || !selectedObject) return;
    // Don't save history for minor property changes? Actually we should for consistency
    // But maybe on 'mouse:up' for drag events? 
    // For manual properties, we save immediately.
    saveHistory();
    selectedObject.set(property as any, value);
    canvas.renderAll();
  }, [canvas, selectedObject, saveHistory]);

  const undo = useCallback(async () => {
    if (!canvas || history.length === 0) return;
    const currentJson = JSON.stringify(canvas.toJSON());
    const prevJson = history[history.length - 1];
    
    setRedoStack(prev => [...prev, currentJson]);
    setHistory(prev => prev.slice(0, -1));

    await canvas.loadFromJSON(prevJson);
    canvas.renderAll();
  }, [canvas, history]);

  const redo = useCallback(async () => {
    if (!canvas || redoStack.length === 0) return;
    const currentJson = JSON.stringify(canvas.toJSON());
    const nextJson = redoStack[redoStack.length - 1];

    setHistory(prev => [...prev, currentJson]);
    setRedoStack(prev => prev.slice(0, -1));

    await canvas.loadFromJSON(nextJson);
    canvas.renderAll();
  }, [canvas, redoStack]);

  const zoomIn = useCallback(() => {
    if (!canvas) return;
    const cw = canvas.getWidth();
    const ch = canvas.getHeight();
    const newZoom = canvas.getZoom() * 1.2;
    canvas.zoomToPoint(new fabric.Point(cw / 2, ch / 2), newZoom);
    setZoom(newZoom);
  }, [canvas]);

  const zoomOut = useCallback(() => {
    if (!canvas) return;
    const cw = canvas.getWidth();
    const ch = canvas.getHeight();
    const newZoom = canvas.getZoom() / 1.2;
    canvas.zoomToPoint(new fabric.Point(cw / 2, ch / 2), newZoom);
    setZoom(newZoom);
  }, [canvas]);

  const zoomToFit = useCallback(() => {
    if (!canvas) return;
    
    // Support both Fabric 6/7 el structures
    const el = canvas.getElement?.() || (canvas as any).lowerCanvasEl;
    const container = el?.parentElement;
    
    if (!container) return;
    
    const cw = container.clientWidth;
    const ch = container.clientHeight;
    const sheetWidth = 1000;
    const sheetHeight = 700;
    const padding = 100;
    const scaleX = (cw - padding) / sheetWidth;
    const scaleY = (ch - padding) / sheetHeight;
    const finalScale = Math.min(scaleX, scaleY, 1);

    canvas.setViewportTransform([
      finalScale, 0, 0, finalScale,
      cw / 2, ch / 2
    ]);

    setZoom(finalScale);
    canvas.requestRenderAll();
  }, [canvas]);

  return (
    <EditorContext.Provider value={{ 
      canvas, setCanvas, 
      selectedObject, setSelectedObject,
      addText, deleteSelected, updateProperty,
      zoomIn, zoomOut, zoomToFit,
      undo, redo, zoom
    }}>
      {children}
    </EditorContext.Provider>
  );
}

export function useEditor() {
  const context = useContext(EditorContext);
  if (context === undefined) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
}
