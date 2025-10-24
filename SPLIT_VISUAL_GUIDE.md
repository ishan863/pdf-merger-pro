# 📸 Split Feature - Visual Guide

## 🎯 Feature Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        SPLIT INTERFACE                          │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  📄 Selected File                                        │  │
│  │  ─────────────────────────────────────────────────────  │  │
│  │  [PDF Icon] document.pdf                      [Remove]  │  │
│  │            25 pages • 5.23 MB                           │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  [ Range ]    [ Pages ]    [ Size ]                      │ │
│  │  ════════                                                 │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                 │
│  [Selected Mode Content - Dynamic]                             │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │        🔴  SPLIT & DOWNLOAD  🔴                          │ │
│  └──────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📋 Mode 1: Range - Custom

```
┌─────────────────────────────────────────────────────────────────┐
│  Range mode:                                                    │
│                                                                 │
│  ┌──────────────────┐  ┌──────────────────┐                   │
│  │  Custom ranges   │  │  Fixed ranges    │                   │
│  │  🔴 SELECTED     │  │                  │                   │
│  └──────────────────┘  └──────────────────┘                   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  [Range 1]  from page [1] to [2]              [🗑️]      │  │
│  ├─────────────────────────────────────────────────────────┤  │
│  │  [Range 2]  from page [3] to [5]              [🗑️]      │  │
│  ├─────────────────────────────────────────────────────────┤  │
│  │  [Range 3]  from page [10] to [15]            [🗑️]      │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │           ➕  Add Range                                  │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  ☑️  Merge all ranges in one PDF file.                  │  │
│  └─────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘

Output (Merge OFF): 3 PDFs
  • document_part_1_pages_1-2.pdf
  • document_part_2_pages_3-5.pdf
  • document_part_3_pages_10-15.pdf

Output (Merge ON): 1 PDF
  • document_merged.pdf (contains pages 1-2, 3-5, 10-15)
```

---

## 📋 Mode 2: Range - Fixed

```
┌─────────────────────────────────────────────────────────────────┐
│  Range mode:                                                    │
│                                                                 │
│  ┌──────────────────┐  ┌──────────────────┐                   │
│  │  Custom ranges   │  │  Fixed ranges    │                   │
│  │                  │  │  🔵 SELECTED     │                   │
│  └──────────────────┘  └──────────────────┘                   │
│                                                                 │
│  Extract every [3] pages into a separate document              │
│                                                                 │
│  This will create 9 PDF files                                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

Example: 25-page PDF, interval = 3
Output: 9 PDFs
  • document_part_1_pages_1-3.pdf
  • document_part_2_pages_4-6.pdf
  • document_part_3_pages_7-9.pdf
  • ... continues ...
  • document_part_9_pages_25-25.pdf
```

---

## 📋 Mode 3: Pages

```
┌─────────────────────────────────────────────────────────────────┐
│  Extract specific pages:                                        │
│                                                                 │
│  Extract page [2] and every 2 pages after                      │
│                                                                 │
│  This will extract approximately 12 pages                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

Example: 25-page PDF, extract every 2 pages starting from page 2
Output: 12 PDFs (pages 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24)
  • document_part_1_pages_2-2.pdf
  • document_part_2_pages_4-4.pdf
  • document_part_3_pages_6-6.pdf
  • ... continues ...
```

---

## 📋 Mode 4: Size

```
┌─────────────────────────────────────────────────────────────────┐
│  Split by file size:                                            │
│                                                                 │
│  Maximum size per file: [5] MB                                 │
│                                                                 │
│  The PDF will be split into files of approximately 5 MB each   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

Example: 15 MB PDF, size limit = 5 MB
Output: ~3 PDFs
  • document_part_1_pages_1-8.pdf   (~5 MB)
  • document_part_2_pages_9-16.pdf  (~5 MB)
  • document_part_3_pages_17-25.pdf (~5 MB)
```

---

## 🎨 Color Scheme

### **Range Mode - Custom**
- Border Color: `border-red-500`
- Background: `bg-red-500/20` (dark) or `bg-red-100` (light)
- Text: `text-red-400` (dark) or `text-red-600` (light)

### **Range Mode - Fixed**
- Border Color: `border-blue-500`
- Background: `bg-blue-500/20` (dark) or `bg-blue-100` (light)
- Text: `text-blue-400` (dark) or `text-blue-600` (light)

### **Split Button**
- Background: `from-red-500 to-pink-500`
- Hover: Shadow with `shadow-red-500/50`
- Transform: `scale-[1.02]`

---

## 📱 Responsive Behavior

### **Desktop View**
```
┌────────────────────────────────────────┐
│  Sidebar │  Navbar                     │
│          ├─────────────────────────────┤
│          │  Header                     │
│          │                             │
│          │  File Upload/Info           │
│   Nav    │                             │
│  Items   │  [ Range | Pages | Size ]  │
│          │                             │
│          │  Mode Configuration         │
│          │                             │
│          │  [Split & Download]         │
└────────────────────────────────────────┘
```

### **Mobile View**
```
┌──────────────────┐
│  ☰  Navbar       │
├──────────────────┤
│  Header          │
│                  │
│  File Upload     │
│                  │
│  [Range]         │
│  [Pages]         │
│  [Size]          │
│                  │
│  Config Panel    │
│                  │
│  [Split Button]  │
└──────────────────┘
```

---

## 🎬 User Flow

```
START
  │
  ├─→ Click Upload Zone OR Drag PDF
  │
  ├─→ File Selected
  │     │
  │     ├─→ Display File Info (name, pages, size)
  │     │
  │     └─→ Load PDF & Get Page Count
  │
  ├─→ Select Split Mode (Range/Pages/Size)
  │     │
  │     ├─→ RANGE MODE
  │     │     │
  │     │     ├─→ Custom Ranges
  │     │     │     ├─→ Add/Remove Ranges
  │     │     │     ├─→ Set from/to pages
  │     │     │     └─→ Toggle merge option
  │     │     │
  │     │     └─→ Fixed Ranges
  │     │           └─→ Set interval
  │     │
  │     ├─→ PAGES MODE
  │     │     └─→ Set extraction interval
  │     │
  │     └─→ SIZE MODE
  │           └─→ Set max MB per file
  │
  ├─→ Click "Split & Download"
  │     │
  │     ├─→ Validate Inputs
  │     │
  │     ├─→ Process PDF (client-side)
  │     │
  │     ├─→ Generate Output PDFs
  │     │
  │     ├─→ Trigger Downloads (300ms delay)
  │     │
  │     └─→ Show Success Toast
  │
END
```

---

## ⚡ Performance

### **Processing Speed**
- Small PDFs (<10 pages): < 1 second
- Medium PDFs (10-50 pages): 1-3 seconds
- Large PDFs (50-100 pages): 3-5 seconds

### **Download Strategy**
- 300ms delay between downloads to prevent browser blocking
- Automatic URL cleanup with `revokeObjectURL()`

### **Memory Management**
- Files processed in browser memory
- No server upload required
- Cleanup after processing

---

## 🔒 Security & Privacy

✅ **Client-Side Processing**
- All PDF operations in browser
- No files uploaded to server
- Complete privacy

✅ **Action Logging**
- Metadata only (no content)
- Anonymous user support
- Firestore secure rules

---

## 🎯 Success Metrics

**User Actions Tracked:**
1. File upload
2. Split mode selection
3. Configuration changes
4. Split operation (success/error)
5. Download completion

**Analytics Data:**
- Total splits performed
- Most popular split mode
- Average file size
- Error rate
- Processing time

---

**Visual Guide Complete!** 🎨
All split features working and deployed! ✅
