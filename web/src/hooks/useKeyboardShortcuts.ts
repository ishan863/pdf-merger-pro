// Keyboard shortcuts hook

import { useEffect, useCallback } from 'react';
import { useEditorStore } from '@/context/editorContext';
import toast from 'react-hot-toast';

interface KeyboardShortcutsOptions {
  onRotate?: () => void;
  onDelete?: () => void;
  onMerge?: () => void;
  onSplit?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onHelp?: () => void;
  enabled?: boolean;
}

/**
 * Keyboard shortcuts hook for PDF editor
 * 
 * Shortcuts:
 * - R: Rotate selected pages 90°
 * - D: Delete selected pages
 * - M: Open merge modal
 * - S: Open split/extract modal
 * - Ctrl+Z: Undo last operation
 * - Ctrl+Shift+Z: Redo last operation
 * - ?: Show help/shortcuts
 */
export function useKeyboardShortcuts(options: KeyboardShortcutsOptions = {}) {
  const {
    onRotate,
    onDelete,
    onMerge,
    onSplit,
    onHelp,
    enabled = true,
  } = options;

  const { selectedPages, undo, redo, undoStack, redoStack } = useEditorStore();

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    // Ignore if typing in input field
    const target = event.target as HTMLElement;
    const isTyping =
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target.contentEditable === 'true';

    if (isTyping) return;

    // Check for keyboard shortcuts
    const key = event.key.toLowerCase();

    // Ctrl+Z: Undo
    if ((event.ctrlKey || event.metaKey) && key === 'z' && !event.shiftKey) {
      event.preventDefault();
      if (undoStack.length > 0) {
        undo();
        toast.success('↶ Undo');
      } else {
        toast('Nothing to undo', { icon: '⚠️' });
      }
      return;
    }

    // Ctrl+Shift+Z: Redo
    if ((event.ctrlKey || event.metaKey) && key === 'z' && event.shiftKey) {
      event.preventDefault();
      if (redoStack.length > 0) {
        redo();
        toast.success('↷ Redo');
      } else {
        toast('Nothing to redo', { icon: '⚠️' });
      }
      return;
    }

    // R: Rotate (requires pages selected)
    if (key === 'r' && selectedPages.size > 0) {
      event.preventDefault();
      onRotate?.();
      return;
    }

    // D: Delete (requires pages selected)
    if (key === 'd' && selectedPages.size > 0) {
      event.preventDefault();
      onDelete?.();
      return;
    }

    // M: Merge (requires pages selected)
    if (key === 'm' && selectedPages.size > 0) {
      event.preventDefault();
      onMerge?.();
      return;
    }

    // S: Split (requires pages selected)
    if (key === 's' && selectedPages.size > 0) {
      event.preventDefault();
      onSplit?.();
      return;
    }

    // ?: Show help
    if (key === '?' || key === '/') {
      event.preventDefault();
      onHelp?.();
      return;
    }
  }, [enabled, selectedPages, undo, redo, undoStack, redoStack, onRotate, onDelete, onMerge, onSplit, onHelp]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
}

/**
 * Get keyboard shortcuts reference
 */
export function getKeyboardShortcutsReference() {
  return [
    {
      key: 'R',
      description: 'Rotate selected pages 90°',
      requiresSelection: true,
    },
    {
      key: 'D',
      description: 'Delete selected pages',
      requiresSelection: true,
    },
    {
      key: 'M',
      description: 'Open merge dialog',
      requiresSelection: true,
    },
    {
      key: 'S',
      description: 'Open split/extract dialog',
      requiresSelection: true,
    },
    {
      key: 'Ctrl+Z',
      description: 'Undo last operation',
      requiresSelection: false,
    },
    {
      key: 'Ctrl+Shift+Z',
      description: 'Redo last operation',
      requiresSelection: false,
    },
    {
      key: '?',
      description: 'Show this help dialog',
      requiresSelection: false,
    },
  ];
}
