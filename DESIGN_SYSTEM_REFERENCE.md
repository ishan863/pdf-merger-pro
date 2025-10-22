# Dashboard 2.0 Pro - Complete UI/UX Design Reference

## Application Structure

```
PDF Merger Pro 2.0
├── Authentication Layer
│   ├── Login Page (email/Google)
│   └── Protected Routes (all pages below)
│
├── Main Layout
│   ├── Navbar (Top)
│   │   ├── Logo
│   │   ├── Search Bar (Cmd+K)
│   │   ├── Theme Toggle
│   │   ├── Notifications
│   │   └── User Profile Dropdown
│   │
│   ├── Sidebar (Left)
│   │   ├── Dashboard
│   │   ├── Files Manager
│   │   ├── PDF Editor
│   │   ├── Merge PDFs
│   │   ├── Split & Extract
│   │   ├── Convert
│   │   ├── Cloud Storage
│   │   ├── Collaborate
│   │   ├── History
│   │   ├── Settings
│   │   └── Help
│   │
│   └── Main Content Area
│       └── Page-specific content
│
└── Mobile Layout
    └── Bottom FAB Menu (Hamburger)
```

## Page Layouts

### 1. Dashboard 2.0 (Home)
```
┌─────────────────────────────────────────┐
│ Navbar (Search, Theme, User)            │
├────────┬──────────────────────────────┬─┤
│Sidebar │  Welcome Back, [User]        │ │
│        │  "Drag files or click upload"│ │
│        │                              │ │
│        │  File Cards Grid (1-4 cols)  │ │
│        │  ┌────┬────┬────┬────┐       │ │
│        │  │PDF │PDF │PDF │PDF │       │ │
│        │  └────┴────┴────┴────┘       │ │
│        │                              │ │
│        │  Upload Modal (on drag)      │ │
│        │  ┌──────────────────────┐    │ │
│        │  │ Upload Zone          │    │ │
│        │  │ Drag files here      │    │ │
│        │  └──────────────────────┘    │ │
└────────┴──────────────────────────────┴─┘
```

### 2. Files Manager
```
┌─────────────────────────────────────────┐
│ Navbar                                  │
├────────┬──────────────────────────────┬─┤
│Sidebar │ My Files                     │ │
│        │ [Search] [Upload] [Delete]   │ │
│        │                              │ │
│        │ File Cards Grid              │ │
│        │ ┌─────────┬─────────┐        │ │
│        │ │PDF File │PDF File │        │ │
│        │ │[check]  │         │        │ │
│        │ │Actions: │Actions: │        │ │
│        │ │DL Share │DL Share │        │ │
│        │ └─────────┴─────────┘        │ │
└────────┴──────────────────────────────┴─┘
```

### 3. Merge PDFs
```
┌─────────────────────────────────────────┐
│ Navbar                                  │
├────────┬──────────────────────────────┬─┤
│Sidebar │ Merge PDFs                   │ │
│        │ ┌─────────────┬────────────┐  │ │
│        │ │ Available   │ Merge      │  │ │
│        │ │ Files       │ Order      │  │ │
│        │ │ □ File 1    │ 1. File 2  │  │ │
│        │ │ ☑ File 2    │ 2. File 1  │  │ │
│        │ │ □ File 3    │ 3. File 4  │  │ │
│        │ │ □ File 4    │ [Up Down ✕]│  │ │
│        │ │             │ [Merge DL] │  │ │
│        │ └─────────────┴────────────┘  │ │
└────────┴──────────────────────────────┴─┘
```

### 4. Split & Extract
```
┌─────────────────────────────────────────┐
│ Navbar                                  │
├────────┬──────────────────────────────┬─┤
│Sidebar │ Split & Extract              │ │
│        │ ┌──────────────────────────┐ │ │
│        │ │ Select File │ Split Pts  │ │ │
│        │ │ File 1   ☑ │ Pages 1→5  │ │ │
│        │ │ File 2     │ + Add Split │ │ │
│        │ │ File 3     │ Pages 6→10  │ │ │
│        │ │            │ + Add Split │ │ │
│        │ │            │ [Split DL]  │ │ │
│        │ └──────────────────────────┘ │ │
└────────┴──────────────────────────────┴─┘
```

### 5. Universal Converter
```
┌─────────────────────────────────────────┐
│ Navbar                                  │
├────────┬──────────────────────────────┬─┤
│Sidebar │ Universal Converter          │ │
│        │ ┌────┬────┬────┬────┐        │ │
│        │ │📄  │📊  │🎨  │🖼️ │        │ │
│        │ │Word│Excel|PPT │Image│       │ │
│        │ └────┴────┴────┴────┘        │ │
│        │                              │ │
│        │ ┌──────────────────────────┐ │ │
│        │ │ Drag files or click      │ │ │
│        │ │                          │ │ │
│        │ │ Files: File 1 [████] 50% │ │ │
│        │ │ Files: File 2 [██  ] 20% │ │ │
│        │ │ [Convert Files]          │ │ │
│        │ └──────────────────────────┘ │ │
└────────┴──────────────────────────────┴─┘
```

### 6. Cloud Storage
```
┌─────────────────────────────────────────┐
│ Navbar                                  │
├────────┬──────────────────────────────┬─┤
│Sidebar │ Cloud Storage                │ │
│        │ ┌────────┬────────┬────────┐ │ │
│        │ │💾      │🔗      │🔒      │ │ │
│        │ │2.3GB/5GB│3 Shared│12 Private
│        │ └────────┴────────┴────────┘ │ │
│        │                              │ │
│        │ Cloud Files                  │ │
│        │ File 1       2.5MB [DL Share✕] │
│        │ File 2       1.8MB [DL Share✕] │
└────────┴──────────────────────────────┴─┘
```

### 7. Real-time Collaboration
```
┌─────────────────────────────────────────┐
│ Navbar                                  │
├────────┬──────────────────────────────┬─┤
│Sidebar │ Collaboration                │ │
│        │ ┌─────────────┬────────────┐ │ │
│        │ │ Session     │ Participants
│        │ │ ABC-123-XYZ │ 👤 You      │ │
│        │ │ [Copy]      │ 👤 John ✓  │ │
│        │ │ [Invite]    │ 👤 Jane ✓  │ │
│        │ │             │             │ │
│        │ │ Chat:       │             │ │
│        │ │ Messages... │             │ │
│        │ │ [Input...] [Send]         │ │
│        │ └─────────────┴────────────┘ │ │
└────────┴──────────────────────────────┴─┘
```

### 8. Activity History
```
┌─────────────────────────────────────────┐
│ Navbar                                  │
├────────┬──────────────────────────────┬─┤
│Sidebar │ History                      │ │
│        │ [All][Merge][Split][Convert] │ │
│        │                              │ │
│        │ Timeline:                    │ │
│        │ 🔗 Merged 3 PDFs             │ │
│        │    Details... 2h ago [Revert]│ │
│        │                              │ │
│        │ ✂️  Split PDF into 2          │ │
│        │    Details... 5h ago [Revert]│ │
│        │                              │ │
│        │ 🔄 Converted PDF to Word     │ │
│        │    Details... 1d ago [Revert]│ │
└────────┴──────────────────────────────┴─┘
```

### 9. Settings
```
┌─────────────────────────────────────────┐
│ Navbar                                  │
├────────┬──────────────────────────────┬─┤
│Sidebar │ Settings                     │ │
│        │                              │ │
│        │ 🔔 Notifications             │ │
│        │  ☑ Email Notifications       │ │
│        │  ☑ Sound Effects             │ │
│        │                              │ │
│        │ 🎨 Appearance                │ │
│        │  Theme: [Dark ▼]             │ │
│        │  ☑ Enable Animations         │ │
│        │                              │ │
│        │ 🔒 Security                  │ │
│        │  [Change Password]           │ │
│        │  [2-Factor Auth]             │ │
│        │                              │ │
│        │ [Save All Settings]          │ │
└────────┴──────────────────────────────┴─┘
```

## Color Scheme

### Dark Mode (Default)
```
Background:     #0f172a (slate-950)
Secondary BG:   #1e293b (slate-900)
Surface:        rgba(255, 255, 255, 0.05)
Text Primary:   #ffffff
Text Secondary: #9ca3af (gray-400)
Accent:         #3b82f6 (blue-500)
Accent Alt:     #06b6d4 (cyan-500)
Border:         rgba(255, 255, 255, 0.1)
```

### Light Mode
```
Background:     #ffffff
Secondary BG:   #f8fafc (slate-50)
Surface:        rgba(255, 255, 255, 0.6)
Text Primary:   #0f172a (slate-900)
Text Secondary: #4b5563 (gray-600)
Accent:         #3b82f6 (blue-500)
Accent Alt:     #06b6d4 (cyan-500)
Border:         rgba(255, 255, 255, 0.3)
```

## Component Patterns

### Card Pattern
```
┌─────────────────────────────┐
│ Glassmorphic card           │
│ backdrop-blur-md            │
│ bg-white/5 border-white/10  │
│ hover:bg-white/10           │
│ rounded-xl to rounded-2xl   │
│                             │
│ [Content here]              │
└─────────────────────────────┘
```

### Button Patterns
```
Primary Button:
┌──────────────────────────┐
│ bg-gradient-to-r         │
│ from-blue-500 to-cyan-500│
│ text-white rounded-lg    │
│ hover:shadow-lg          │
└──────────────────────────┘

Secondary Button:
┌──────────────────────────┐
│ bg-white/10              │
│ text-white hover:bg-white│
│ /20 rounded-lg           │
└──────────────────────────┘

Danger Button:
┌──────────────────────────┐
│ bg-red-500/20            │
│ text-red-400             │
│ hover:bg-red-500/30      │
└──────────────────────────┘
```

### Input Patterns
```
Text Input:
┌──────────────────────────┐
│ bg-white/10              │
│ border border-white/20   │
│ text-white               │
│ focus:border-white/40    │
│ placeholder-gray-500     │
│ rounded-lg px-4 py-2     │
└──────────────────────────┘

Select/Dropdown:
┌──────────────────────────┐
│ bg-white/10              │
│ border border-white/20   │
│ text-white rounded-lg    │
│ px-4 py-2                │
└──────────────────────────┘
```

## Typography

### Headings
- **H1**: text-4xl font-bold
- **H2**: text-2xl font-bold
- **H3**: text-xl font-bold
- **Body**: text-sm/base

### Font Family
- **Default**: System font stack (Tailwind default)
- **Code**: Font-mono

## Spacing

### Padding
- **Small**: px-3 py-2
- **Medium**: px-4 py-3
- **Large**: px-6 py-4
- **XL**: px-8 py-6

### Gaps
- **Small**: gap-2
- **Medium**: gap-4
- **Large**: gap-6
- **XL**: gap-8

## Responsive Breakpoints

### Mobile (sm < 640px)
- Single column layouts
- Bottom FAB menu
- Full-width cards
- Stack vertically

### Tablet (md 640px - 1024px)
- 2-column layouts
- Sidebar visible but narrower
- Horizontal scrolling for tables
- Medium-sized cards

### Desktop (lg 1024px+)
- 3-4 column layouts
- Full sidebar visible
- All features visible
- Optimized spacing

## Animation Guidelines

### Entrance Animations
```typescript
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ delay: index * 0.05 }}
```

### Hover Effects
```typescript
whileHover={{ scale: 1.05 }}
whileTap={{ scale: 0.95 }}
```

### Loading State
```typescript
<div className="w-4 h-4 border-2 border-white 
                border-t-transparent rounded-full 
                animate-spin" />
```

## State Indicators

### Loading
- Spinning loader (border animation)
- Disabled state (opacity-50)

### Success
- Green accent color (#10b981)
- Toast notification
- Checkmark icon

### Error
- Red accent color (#ef4444)
- Toast notification
- Alert icon

### Warning
- Orange accent color (#f59e0b)
- Toast notification
- Warning icon

## Accessibility Features

✅ Keyboard navigation (Tab, Enter, Escape)
✅ Dark mode support with system preference detection
✅ Color contrast ratios > 4.5:1
✅ Semantic HTML structure
✅ ARIA labels on interactive elements
✅ Focus indicators on all buttons
✅ Readable font sizes (minimum 16px on mobile)

## Performance Optimizations

✅ Lazy loading for heavy components
✅ Web Workers for file processing
✅ Image optimization
✅ Code splitting by route
✅ CSS-in-JS optimization (Tailwind)
✅ React.memo for list items
✅ Framer Motion GPU acceleration

---

This design system provides a cohesive, professional, and modern experience across all 14+ pages of Dashboard 2.0 Pro.
