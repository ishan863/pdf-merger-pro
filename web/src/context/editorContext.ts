// Editor state context

import { create } from 'zustand';
import { PDFFile, PDFPage } from '@/types';

interface EditorState {
  currentFile: PDFFile | null;
  pages: PDFPage[];
  selectedPages: Set<number>;
  undoStack: PDFPage[][];
  redoStack: PDFPage[][];
  loading: boolean;
  error: string | null;
  
  setCurrentFile: (file: PDFFile | null) => void;
  setPages: (pages: PDFPage[]) => void;
  selectPage: (pageNumber: number, multiSelect?: boolean) => void;
  deselectPage: (pageNumber: number) => void;
  clearSelection: () => void;
  updatePage: (pageNumber: number, updates: Partial<PDFPage>) => void;
  reorderPages: (newOrder: number[]) => void;
  pushUndo: (pages: PDFPage[]) => void;
  undo: () => void;
  redo: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  currentFile: null,
  pages: [],
  selectedPages: new Set(),
  undoStack: [],
  redoStack: [],
  loading: false,
  error: null,
  
  setCurrentFile: (file) => set({ currentFile: file }),
  
  setPages: (pages) => set({ pages }),
  
  selectPage: (pageNumber, multiSelect = false) =>
    set((state) => {
      const newSelection = new Set(multiSelect ? state.selectedPages : []);
      newSelection.add(pageNumber);
      return { selectedPages: newSelection };
    }),
  
  deselectPage: (pageNumber) =>
    set((state) => {
      const newSelection = new Set(state.selectedPages);
      newSelection.delete(pageNumber);
      return { selectedPages: newSelection };
    }),
  
  clearSelection: () => set({ selectedPages: new Set() }),
  
  updatePage: (pageNumber, updates) =>
    set((state) => ({
      pages: state.pages.map((p) =>
        p.pageNumber === pageNumber ? { ...p, ...updates } : p
      ),
    })),

  reorderPages: (newOrder) =>
    set((state) => {
      // push current pages to undo stack
      const prev = state.pages;
      const reordered = newOrder.map((pNum, idx) => {
        const page = prev.find((pg) => pg.pageNumber === pNum);
        if (!page) throw new Error('Invalid page number in reorder');
        return { ...page, pageNumber: idx + 1 } as PDFPage;
      });

      return {
        pages: reordered,
        undoStack: [...state.undoStack, prev],
        redoStack: [],
      };
    }),
  
  pushUndo: (pages) =>
    set((state) => ({
      undoStack: [...state.undoStack, pages],
      redoStack: [],
    })),
  
  undo: () =>
    set((state) => {
      if (state.undoStack.length === 0) return state;
      const newUndo = [...state.undoStack];
      const prevPages = newUndo.pop()!;
      return {
        pages: prevPages,
        undoStack: newUndo,
        redoStack: [...state.redoStack, state.pages],
      };
    }),
  
  redo: () =>
    set((state) => {
      if (state.redoStack.length === 0) return state;
      const newRedo = [...state.redoStack];
      const nextPages = newRedo.pop()!;
      return {
        pages: nextPages,
        undoStack: [...state.undoStack, state.pages],
        redoStack: newRedo,
      };
    }),
  
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),
}));
