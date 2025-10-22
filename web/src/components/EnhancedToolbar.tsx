/**
 * Enhanced Toolbar Component
 * Comprehensive PDF editing toolbar with all operations
 */

'use client';

import React, { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FiRotateCw,
  FiTrash2,
  FiCopy,
  FiScissors,
  FiCrop,
  FiPenTool,
  FiDownload,
  FiZoomIn,
  FiZoomOut,
  FiMenu,
} from 'react-icons/fi';
import { BsFiletypeXlsx, BsFiletypeDoc } from 'react-icons/bs';

interface EnhancedToolbarProps {
  onRotate: (degrees: 90 | 180 | 270) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMerge: () => void;
  onSplit: () => void;
  onCrop: () => void;
  onAnnotate: () => void;
  onDownload: () => void;
  onZoom: (direction: 'in' | 'out') => void;
  onConvert: (format: 'xlsx' | 'docx' | 'pptx') => void;
  canRotate?: boolean;
  canDelete?: boolean;
  canDuplicate?: boolean;
  canMerge?: boolean;
  canSplit?: boolean;
  canCrop?: boolean;
  zoom?: number;
  maxZoom?: number;
  minZoom?: number;
  isCompact?: boolean;
}

const ToolButton: React.FC<{
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  shortcut?: string;
  compact?: boolean;
}> = ({
  icon,
  label,
  onClick,
  disabled = false,
  variant = 'secondary',
  shortcut,
  compact = false,
}) => {
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
  };

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      onClick={onClick}
      disabled={disabled}
      title={shortcut ? `${label} (${shortcut})` : label}
      className={`
        flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all
        ${variantClasses[variant]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${compact ? 'p-2' : ''}
      `}
    >
      <span className="flex-shrink-0">{icon}</span>
      {!compact && <span className="text-sm hidden sm:inline">{label}</span>}
    </motion.button>
  );
};

export const EnhancedToolbar: React.FC<EnhancedToolbarProps> = ({
  onRotate,
  onDelete,
  onDuplicate,
  onMerge,
  onSplit,
  onCrop,
  onAnnotate,
  onDownload,
  onZoom,
  onConvert,
  canRotate = true,
  canDelete = true,
  canDuplicate = true,
  canMerge = true,
  canSplit = true,
  canCrop = true,
  zoom = 100,
  maxZoom = 400,
  minZoom = 50,
  isCompact = false,
}) => {
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const handleRotate = useCallback(
    (degrees: 90 | 180 | 270) => {
      onRotate(degrees);
    },
    [onRotate]
  );

  const zoomPercentage = `${Math.round(zoom)}%`;
  const canZoomIn = zoom < maxZoom;
  const canZoomOut = zoom > minZoom;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`
        flex flex-wrap items-center gap-2 p-3 bg-gray-50 border-b border-gray-200
        ${isCompact ? 'justify-center' : 'justify-start'}
      `}
    >
      {/* File Operations */}
      <div className="flex items-center gap-2 border-r border-gray-300 pr-2">
        <ToolButton
          icon={<FiDownload className="h-4 w-4" />}
          label="Download"
          onClick={onDownload}
          variant="primary"
          shortcut="Ctrl+D"
          compact={isCompact}
        />
      </div>

      {/* Rotation */}
      {canRotate && (
        <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
          <ToolButton
            icon={<FiRotateCw className="h-4 w-4" />}
            label="Rotate 90°"
            onClick={() => handleRotate(90)}
            disabled={!canRotate}
            shortcut="R"
            compact={isCompact}
          />
          <button
            onClick={() => handleRotate(180)}
            className="text-xs px-1.5 py-1 rounded bg-gray-200 hover:bg-gray-300 hidden sm:block"
            title="Rotate 180°"
          >
            180°
          </button>
          <button
            onClick={() => handleRotate(270)}
            className="text-xs px-1.5 py-1 rounded bg-gray-200 hover:bg-gray-300 hidden sm:block"
            title="Rotate 270°"
          >
            270°
          </button>
        </div>
      )}

      {/* Page Operations */}
      <div className="flex items-center gap-2 border-r border-gray-300 pr-2">
        {canDuplicate && (
          <ToolButton
            icon={<FiCopy className="h-4 w-4" />}
            label="Duplicate"
            onClick={onDuplicate}
            disabled={!canDuplicate}
            shortcut="Ctrl+D"
            compact={isCompact}
          />
        )}
        {canDelete && (
          <ToolButton
            icon={<FiTrash2 className="h-4 w-4" />}
            label="Delete"
            onClick={onDelete}
            disabled={!canDelete}
            variant="danger"
            shortcut="Del"
            compact={isCompact}
          />
        )}
      </div>

      {/* Merge/Split Operations */}
      <div className="flex items-center gap-2 border-r border-gray-300 pr-2">
        {canMerge && (
          <ToolButton
            icon={<FiCopy className="h-4 w-4 transform -scale-x-100" />}
            label="Merge"
            onClick={onMerge}
            disabled={!canMerge}
            shortcut="Ctrl+M"
            compact={isCompact}
          />
        )}
        {canSplit && (
          <ToolButton
            icon={<FiScissors className="h-4 w-4" />}
            label="Split"
            onClick={onSplit}
            disabled={!canSplit}
            shortcut="Ctrl+X"
            compact={isCompact}
          />
        )}
      </div>

      {/* Advanced Operations */}
      <div className="flex items-center gap-2 border-r border-gray-300 pr-2">
        {canCrop && (
          <ToolButton
            icon={<FiCrop className="h-4 w-4" />}
            label="Crop"
            onClick={onCrop}
            disabled={!canCrop}
            shortcut="C"
            compact={isCompact}
          />
        )}
        <ToolButton
          icon={<FiPenTool className="h-4 w-4" />}
          label="Annotate"
          onClick={onAnnotate}
          shortcut="A"
          compact={isCompact}
        />
      </div>

      {/* Zoom Controls */}
      <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
        <ToolButton
          icon={<FiZoomOut className="h-4 w-4" />}
          label="Zoom Out"
          onClick={() => onZoom('out')}
          disabled={!canZoomOut}
          compact={isCompact}
        />
        <span className="text-xs font-medium text-gray-700 px-2 bg-white rounded border border-gray-300 min-w-[50px] text-center">
          {zoomPercentage}
        </span>
        <ToolButton
          icon={<FiZoomIn className="h-4 w-4" />}
          label="Zoom In"
          onClick={() => onZoom('in')}
          disabled={!canZoomIn}
          compact={isCompact}
        />
      </div>

      {/* Convert Options */}
      <div className="flex items-center gap-2 border-r border-gray-300 pr-2">
        <motion.div className="relative">
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className="flex items-center gap-1 px-3 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium transition"
          >
            <FiMenu className="h-4 w-4" />
            {!isCompact && <span className="text-sm">Convert</span>}
          </button>

          {showMoreMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute top-full right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50"
            >
              <button
                onClick={() => {
                  onConvert('docx');
                  setShowMoreMenu(false);
                }}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-900 hover:bg-gray-50 w-full text-left"
              >
                <BsFiletypeDoc className="h-4 w-4" />
                Convert to Word
              </button>
              <button
                onClick={() => {
                  onConvert('xlsx');
                  setShowMoreMenu(false);
                }}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-900 hover:bg-gray-50 w-full text-left"
              >
                <BsFiletypeXlsx className="h-4 w-4" />
                Convert to Excel
              </button>
              <button
                onClick={() => {
                  onConvert('pptx');
                  setShowMoreMenu(false);
                }}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-900 hover:bg-gray-50 w-full text-left border-t border-gray-200"
              >
                <span className="h-4 w-4">📊</span>
                Convert to PowerPoint
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Spacer */}
      <div className="flex-grow" />

      {/* Help Text (Desktop) */}
      <div className="hidden lg:block text-xs text-gray-600 px-2">
        Press <kbd className="bg-gray-300 px-1 rounded">?</kbd> for shortcuts
      </div>
    </motion.div>
  );
};

export default EnhancedToolbar;
