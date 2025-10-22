# 🎨 Visual UI Reference Guide

## Application Screens

### 1. Home Page (`/`)
```
┌─────────────────────────────────────────────────────────────────┐
│  Header: Logo | Dashboard | Login                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│              🎯 PDF Merger - Professional PDF Tools             │
│                                                                  │
│         [Get Started]  [Learn More]  [View Documentation]       │
│                                                                  │
│  ✨ Features:                                                   │
│  • Merge multiple PDFs                                          │
│  • Split and extract pages                                      │
│  • Rotate and reorder                                           │
│  • Download edited PDFs                                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 2. Dashboard (`/dashboard`)
```
┌─────────────────────────────────────────────────────────────────┐
│  Header: Logo | Dashboard | John Doe 👤 | Logout               │
├─────────────────────────────────────────────────────────────────┤
│  My PDFs (3 files)                          [+ Upload New]      │
│                                                                  │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │ 📄 Document.pdf  │  │ 📄 Report.pdf    │  │ 📄 Notes.pdf │  │
│  │ 5 pages • 2.3MB  │  │ 12 pages • 4.1MB │  │ 8 pages      │  │
│  │ [Edit] [Delete]  │  │ [Edit] [Delete]  │  │ [Edit] [Del] │  │
│  └──────────────────┘  └──────────────────┘  └──────────────┘  │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  📂 Drag & Drop PDFs Here or Click to Browse            │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 3. Editor Page (`/editor/:id`)

#### Desktop View (Horizontal Layout)
```
┌─────────────────────────────────────────────────────────────────────────┐
│  Header: Logo | Dashboard | John Doe 👤 | Logout                        │
├─────────────────────────────────────────────────────────────────────────┤
│  📄 Document.pdf                              [Vertical] [Horizontal]   │
│  5 pages • 2.3MB                                                         │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ 0 pages selected   │ ↻ 🗑️ 🔀 ✂️ ↶ ↷  │            📥 Download │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌─────────────────────────────┐  ┌──────────────────────────────┐     │
│  │  PDF Viewer                 │  │  Thumbnails (Drag to Reorder)│     │
│  │  ┌───────────────────────┐  │  │  ┌────┐ ┌────┐ ┌────┐        │     │
│  │  │                       │  │  │  │ 1  │ │ 2  │ │ 3  │ ← Drag │     │
│  │  │   Page 1 of 5         │  │  │  └────┘ └────┘ └────┘        │     │
│  │  │                       │  │  │  ┌────┐ ┌────┐               │     │
│  │  │  [Content Preview]    │  │  │  │ 4  │ │ 5  │               │     │
│  │  │                       │  │  │  └────┘ └────┘               │     │
│  │  └───────────────────────┘  │  │                               │     │
│  │  [ - ] 100% [ + ] [↻] [⛶] │  │  ✓ = Selected                │     │
│  └─────────────────────────────┘  └──────────────────────────────┘     │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │  Total: 5 pages  |  Size: 2.3MB  |  Uploaded: Today  | [Download] │  │
│  └────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
```

#### Mobile View
```
┌────────────────────────────────┐
│  ☰ PDF Merger    John Doe 👤  │
├────────────────────────────────┤
│  Document.pdf                  │
│  5 pages • 2.3MB               │
│                                │
│  [Show Thumbnails]             │
│                                │
│  ┌─────────────────────────┐  │
│  │ 0 selected              │  │
│  │ ↻ 🗑️ 🔀 ✂️ ↶ ↷ 📥    │  │
│  └─────────────────────────┘  │
│                                │
│  ┌──────────────────────────┐ │
│  │  PDF Viewer              │ │
│  │  ┌────────────────────┐  │ │
│  │  │                    │  │ │
│  │  │   Page 1 of 5      │  │ │
│  │  │                    │  │ │
│  │  └────────────────────┘  │ │
│  │  [Controls]              │ │
│  └──────────────────────────┘ │
│                                │
│  5 pages | 2.3MB | [Download] │
└────────────────────────────────┘
```

### 4. Merge Modal
```
┌─────────────────────────────────────────────┐
│  Merge PDFs                          [✕]    │
├─────────────────────────────────────────────┤
│                                              │
│  Output filename:                            │
│  [merged.pdf                           ]     │
│                                              │
│  Files to merge (2):                         │
│  ┌──────────────────────────────────────┐  │
│  │ 1 📄 Document.pdf (5 pages, 2.3MB)   │  │
│  │   [↑] [↓] [🗑️]                        │  │
│  └──────────────────────────────────────┘  │
│  ┌──────────────────────────────────────┐  │
│  │ 2 📄 Report.pdf (12 pages, 4.1MB)    │  │
│  │   [↑] [↓] [🗑️]                        │  │
│  └──────────────────────────────────────┘  │
│                                              │
│  Available files (1):                        │
│  ┌──────────────────────────────────────┐  │
│  │ 📄 Notes.pdf (8 pages, 1.8MB)  [✓]  │  │
│  └──────────────────────────────────────┘  │
│                                              │
│  💡 Tip: Use up/down arrows to reorder      │
│                                              │
│            [Cancel]  [Merge]                 │
└─────────────────────────────────────────────┘
```

### 5. Split/Extract Modal
```
┌─────────────────────────────────────────────┐
│  Extract Pages                       [✕]    │
├─────────────────────────────────────────────┤
│                                              │
│  [Extract Pages]  [Split PDF]               │
│                                              │
│  Pages to extract:                           │
│  [1,3-5,7                              ]     │
│  Total pages: 12                             │
│                                              │
│  ✓ 5 page(s) selected: 1, 3, 4, 5, 7        │
│                                              │
│  Output filename:                            │
│  [extracted.pdf                        ]     │
│                                              │
│  ℹ️ Format examples:                         │
│    • 1,2,3 - Individual pages                │
│    • 1-5 - Page range                        │
│    • 1-3,5,7-10 - Mixed format               │
│                                              │
│            [Cancel]  [Extract]               │
└─────────────────────────────────────────────┘
```

### 6. Keyboard Shortcuts Help Modal
```
┌─────────────────────────────────────────────┐
│  Keyboard Shortcuts                  [✕]    │
├─────────────────────────────────────────────┤
│                                              │
│  Navigation                                  │
│  ────────────────────────────────            │
│  ←  →  ↑  ↓    Navigate pages               │
│  Space         Scroll down                   │
│                                              │
│  Actions                                     │
│  ────────────────────────────────            │
│  R             Rotate selected pages         │
│  D             Delete selected pages         │
│  M             Open merge modal              │
│  S             Open split/extract modal      │
│                                              │
│  Editing                                     │
│  ────────────────────────────────            │
│  Ctrl + Z      Undo                          │
│  Ctrl+Shift+Z  Redo                          │
│                                              │
│  Help                                        │
│  ────────────────────────────────            │
│  ?             Show this help                │
│                                              │
│                   [Close]                    │
└─────────────────────────────────────────────┘
```

### 7. Error Boundary Screen
```
┌─────────────────────────────────────────────┐
│  ⚠️  Oops! Something went wrong             │
│  We encountered an unexpected error.        │
│  Don't worry, your data is safe.            │
├─────────────────────────────────────────────┤
│                                              │
│  Error Message:                              │
│  ┌──────────────────────────────────────┐  │
│  │ Cannot read property 'foo' of        │  │
│  │ undefined                             │  │
│  └──────────────────────────────────────┘  │
│                                              │
│  ▼ Technical Details (click to expand)       │
│                                              │
│         [🔄 Try Again]  [🏠 Go Home]         │
│                                              │
│  💡 Tip: If this error persists, try        │
│  refreshing the page or clearing cache.     │
└─────────────────────────────────────────────┘
```

---

## Color Palette

### Primary Colors
- **Primary**: `#3B82F6` (Blue) - Main actions, links
- **Accent**: `#8B5CF6` (Purple) - Highlights, gradients
- **Success**: `#10B981` (Green) - Success states
- **Warning**: `#F59E0B` (Yellow) - Warnings
- **Error**: `#EF4444` (Red) - Errors, destructive actions

### Neutral Colors
- **Gray 50-900**: Background, text, borders

### Gradients
- **Background**: `from-primary-50 to-accent-50`
- **Header**: `from-primary-600 to-accent-600`
- **Error**: `from-red-500 to-orange-500`

---

## Typography

### Font Family
- **Sans**: `Inter, system-ui, -apple-system, sans-serif`
- **Mono**: `Menlo, Monaco, 'Courier New', monospace`

### Font Sizes
- **xs**: 0.75rem (12px) - Captions
- **sm**: 0.875rem (14px) - Secondary text
- **base**: 1rem (16px) - Body text
- **lg**: 1.125rem (18px) - Emphasized text
- **xl**: 1.25rem (20px) - Subheadings
- **2xl**: 1.5rem (24px) - Headings
- **3xl**: 1.875rem (30px) - Large headings

---

## Spacing

### Padding/Margin Scale
- **1**: 0.25rem (4px)
- **2**: 0.5rem (8px)
- **3**: 0.75rem (12px)
- **4**: 1rem (16px)
- **6**: 1.5rem (24px)
- **8**: 2rem (32px)
- **12**: 3rem (48px)

---

## Animation Timings

### Durations
- **Fast**: 150ms - Hover states
- **Normal**: 300ms - Page transitions
- **Slow**: 500ms - Modal entrances
- **Very Slow**: 1000ms - Loading spinners

### Easing
- **Ease Out**: Default for UI transitions
- **Ease In Out**: Modal animations
- **Spring**: Drag-and-drop physics
- **Linear**: Progress bars, spinners

---

## Icons

### Library
All icons from `react-icons/fa` (Font Awesome)

### Common Icons
- 📄 **FaFilePdf** - PDF files
- 🔀 **FaLayerGroup** - Merge
- ✂️ **FaColumns** - Split
- ↻ **FaSyncAlt** - Rotate
- 🗑️ **FaTrash** - Delete
- 📥 **FaDownload** - Download
- ↶ **FaUndoAlt** - Undo
- ↷ **FaRedoAlt** - Redo
- ⚙️ **FaCog** - Settings
- ❓ **FaQuestion** - Help

---

## Responsive Breakpoints

```css
/* Mobile */
@media (max-width: 767px) {
  /* Single column, simplified UI */
}

/* Tablet */
@media (min-width: 768px) and (max-width: 1023px) {
  /* 2-column layouts */
}

/* Desktop */
@media (min-width: 1024px) {
  /* Full layouts, 3-4 columns */
}
```

---

## Component States

### Button States
1. **Default**: Gray background, blue text
2. **Hover**: Slightly darker, scale(1.05)
3. **Active**: Pressed, scale(0.95)
4. **Disabled**: Gray, opacity 50%, cursor not-allowed
5. **Loading**: Spinner icon, disabled

### Input States
1. **Default**: White background, gray border
2. **Focus**: Blue ring, blue border
3. **Error**: Red border, red text
4. **Disabled**: Gray background, no interaction

---

This visual guide helps understand the UI structure and design system! 🎨
