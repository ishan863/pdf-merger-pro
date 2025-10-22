/**
 * Annotation Drawer Component
 * Drawing tools for PDF annotations (freehand, shapes, text, highlights)
 */

'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiPenTool,
  FiSlash,
  FiSquare,
  FiCircle,
  FiType,
  FiTrash2,
  FiDownload,
  FiX,
} from 'react-icons/fi';

interface Point {
  x: number;
  y: number;
}

interface AnnotationPath {
  type: 'freehand' | 'line' | 'rectangle' | 'circle' | 'text' | 'highlight';
  points: Point[];
  color: string;
  strokeWidth: number;
  text?: string;
  timestamp: number;
  id: string;
}

interface AnnotationDrawerProps {
  canvasWidth: number;
  canvasHeight: number;
  onAnnotationsChange?: (annotations: AnnotationPath[]) => void;
  isOpen: boolean;
  onClose: () => void;
}

const COLORS = ['#000000', '#FF0000', '#FFD700', '#00FF00', '#0000FF', '#FF69B4'];
const STROKE_WIDTHS = [1, 2, 3, 5, 8];

export const AnnotationDrawer: React.FC<AnnotationDrawerProps> = ({
  canvasWidth,
  canvasHeight,
  onAnnotationsChange,
  isOpen,
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState<'freehand' | 'line' | 'rectangle' | 'circle' | 'text' | 'highlight'>('freehand');
  const [currentColor, setCurrentColor] = useState('#000000');
  const [currentStrokeWidth, setCurrentStrokeWidth] = useState(2);
  const [annotations, setAnnotations] = useState<AnnotationPath[]>([]);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    canvasRef.current.width = canvasWidth;
    canvasRef.current.height = canvasHeight;

    const context = canvasRef.current.getContext('2d');
    if (!context) return;

    context.lineCap = 'round';
    context.lineJoin = 'round';
    contextRef.current = context;

    // Draw existing annotations
    redrawAnnotations();
  }, [canvasWidth, canvasHeight]);

  // Redraw all annotations
  const redrawAnnotations = useCallback(() => {
    const context = contextRef.current;
    if (!context || !canvasRef.current) return;

    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    annotations.forEach(annotation => {
      drawAnnotation(context, annotation);
    });
  }, [annotations]);

  // Draw single annotation
  const drawAnnotation = (context: CanvasRenderingContext2D, annotation: AnnotationPath) => {
    context.strokeStyle = annotation.color;
    context.fillStyle = annotation.color;
    context.lineWidth = annotation.strokeWidth;

    switch (annotation.type) {
      case 'freehand': {
        context.beginPath();
        context.moveTo(annotation.points[0].x, annotation.points[0].y);
        annotation.points.forEach(point => context.lineTo(point.x, point.y));
        context.stroke();
        break;
      }
      case 'line': {
        if (annotation.points.length < 2) break;
        context.beginPath();
        context.moveTo(annotation.points[0].x, annotation.points[0].y);
        context.lineTo(annotation.points[1].x, annotation.points[1].y);
        context.stroke();
        break;
      }
      case 'rectangle': {
        if (annotation.points.length < 2) break;
        const x = Math.min(annotation.points[0].x, annotation.points[1].x);
        const y = Math.min(annotation.points[0].y, annotation.points[1].y);
        const width = Math.abs(annotation.points[1].x - annotation.points[0].x);
        const height = Math.abs(annotation.points[1].y - annotation.points[0].y);
        context.strokeRect(x, y, width, height);
        break;
      }
      case 'circle': {
        if (annotation.points.length < 2) break;
        const radius = Math.sqrt(
          Math.pow(annotation.points[1].x - annotation.points[0].x, 2) +
          Math.pow(annotation.points[1].y - annotation.points[0].y, 2)
        );
        context.beginPath();
        context.arc(annotation.points[0].x, annotation.points[0].y, radius, 0, Math.PI * 2);
        context.stroke();
        break;
      }
      case 'highlight': {
        context.globalAlpha = 0.3;
        if (annotation.points.length < 2) break;
        const x = Math.min(annotation.points[0].x, annotation.points[1].x);
        const y = Math.min(annotation.points[0].y, annotation.points[1].y);
        const width = Math.abs(annotation.points[1].x - annotation.points[0].x);
        const height = Math.abs(annotation.points[1].y - annotation.points[0].y);
        context.fillRect(x, y, width, height);
        context.globalAlpha = 1;
        break;
      }
      case 'text': {
        context.font = `${currentStrokeWidth * 4}px Arial`;
        context.fillText(annotation.text || '', annotation.points[0].x, annotation.points[0].y);
        break;
      }
    }
  };

  // Mouse down handler
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setStartPoint({ x, y });
    setCurrentPath([{ x, y }]);
  };

  // Mouse move handler
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !contextRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Redraw base annotations
    redrawAnnotations();

    // Draw current path
    const context = contextRef.current;
    context.strokeStyle = currentColor;
    context.lineWidth = currentStrokeWidth;

    if (currentTool === 'freehand') {
      setCurrentPath(prev => [...prev, { x, y }]);
      context.beginPath();
      context.moveTo(currentPath[currentPath.length - 1]?.x || x, currentPath[currentPath.length - 1]?.y || y);
      context.lineTo(x, y);
      context.stroke();
    } else if (startPoint) {
      // For shape tools, show preview
      const endpoint = { x, y };

      switch (currentTool) {
        case 'line':
          context.beginPath();
          context.moveTo(startPoint.x, startPoint.y);
          context.lineTo(endpoint.x, endpoint.y);
          context.stroke();
          break;
        case 'rectangle': {
          const rectX = Math.min(startPoint.x, endpoint.x);
          const rectY = Math.min(startPoint.y, endpoint.y);
          const width = Math.abs(endpoint.x - startPoint.x);
          const height = Math.abs(endpoint.y - startPoint.y);
          context.strokeRect(rectX, rectY, width, height);
          break;
        }
        case 'circle': {
          const radius = Math.sqrt(
            Math.pow(endpoint.x - startPoint.x, 2) +
            Math.pow(endpoint.y - startPoint.y, 2)
          );
          context.beginPath();
          context.arc(startPoint.x, startPoint.y, radius, 0, Math.PI * 2);
          context.stroke();
          break;
        }
        case 'highlight': {
          context.globalAlpha = 0.3;
          const hX = Math.min(startPoint.x, endpoint.x);
          const hY = Math.min(startPoint.y, endpoint.y);
          const hWidth = Math.abs(endpoint.x - startPoint.x);
          const hHeight = Math.abs(endpoint.y - startPoint.y);
          context.fillStyle = currentColor;
          context.fillRect(hX, hY, hWidth, hHeight);
          context.globalAlpha = 1;
          break;
        }
      }
    }
  };

  // Mouse up handler
  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPoint) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const endpoint = { x, y };
    let points: Point[] = [];

    if (currentTool === 'freehand') {
      points = currentPath;
    } else {
      points = [startPoint, endpoint];
    }

    if (points.length > 0) {
      const newAnnotation: AnnotationPath = {
        type: currentTool,
        points,
        color: currentColor,
        strokeWidth: currentStrokeWidth,
        timestamp: Date.now(),
        id: `anno-${Date.now()}`,
      };

      const updatedAnnotations = [...annotations, newAnnotation];
      setAnnotations(updatedAnnotations);
      onAnnotationsChange?.(updatedAnnotations);
    }

    setIsDrawing(false);
    setStartPoint(null);
    setCurrentPath([]);
    redrawAnnotations();
  };

  // Clear annotations
  const handleClear = () => {
    if (!contextRef.current || !canvasRef.current) return;
    contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setAnnotations([]);
    onAnnotationsChange?.([]);
  };

  // Undo last annotation
  const handleUndo = () => {
    const updated = annotations.slice(0, -1);
    setAnnotations(updated);
    onAnnotationsChange?.(updated);
    redrawAnnotations();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: -300 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -300 }}
        className="fixed left-0 top-0 h-full w-80 bg-white shadow-2xl z-40 flex flex-col"
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-bold text-lg text-gray-900">Annotate</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        {/* Drawing Tools */}
        <div className="px-4 py-4 border-b border-gray-200">
          <p className="text-xs font-bold text-gray-600 mb-2">TOOLS</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { tool: 'freehand' as const, icon: FiPenTool, label: 'Pen' },
              { tool: 'line' as const, icon: FiSlash, label: 'Line' },
              { tool: 'rectangle' as const, icon: FiSquare, label: 'Box' },
              { tool: 'circle' as const, icon: FiCircle, label: 'Circle' },
              { tool: 'highlight' as const, icon: FiSquare, label: 'Highlight' },
              { tool: 'text' as const, icon: FiType, label: 'Text' },
            ].map(({ tool, icon: Icon, label }) => (
              <button
                key={tool}
                onClick={() => setCurrentTool(tool)}
                className={`p-2 rounded-lg font-medium text-sm transition ${
                  currentTool === tool
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                }`}
              >
                <Icon className="h-4 w-4 mx-auto mb-1" />
                <div>{label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Color Picker */}
        <div className="px-4 py-4 border-b border-gray-200">
          <p className="text-xs font-bold text-gray-600 mb-2">COLOR</p>
          <div className="flex gap-2">
            {COLORS.map(color => (
              <button
                key={color}
                onClick={() => setCurrentColor(color)}
                className={`w-8 h-8 rounded-lg border-2 transition ${
                  currentColor === color
                    ? 'border-gray-900 scale-110'
                    : 'border-gray-300'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        {/* Stroke Width */}
        <div className="px-4 py-4 border-b border-gray-200">
          <p className="text-xs font-bold text-gray-600 mb-2">THICKNESS</p>
          <div className="flex gap-2">
            {STROKE_WIDTHS.map(width => (
              <button
                key={width}
                onClick={() => setCurrentStrokeWidth(width)}
                className={`flex-1 py-2 rounded-lg border-2 font-medium text-sm transition ${
                  currentStrokeWidth === width
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-900 border-gray-300 hover:border-gray-400'
                }`}
              >
                {width}px
              </button>
            ))}
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-grow overflow-auto bg-gray-50 flex items-center justify-center">
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="cursor-crosshair bg-white shadow-inner"
            style={{ maxWidth: '100%', maxHeight: '100%' }}
          />
        </div>

        {/* Actions */}
        <div className="px-4 py-3 border-t border-gray-200 flex gap-2">
          <button
            onClick={handleUndo}
            className="flex-1 px-3 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium text-sm transition"
          >
            Undo
          </button>
          <button
            onClick={handleClear}
            className="flex-1 px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium text-sm transition flex items-center justify-center gap-1"
          >
            <FiTrash2 className="h-4 w-4" />
            Clear
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition flex items-center justify-center gap-1"
          >
            <FiDownload className="h-4 w-4" />
            Done
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AnnotationDrawer;
