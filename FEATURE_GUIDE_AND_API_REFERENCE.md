# Dashboard 2.0 Pro - Feature Guide & API Reference

## Quick Start Guide

### 1. Starting the Dev Server
```bash
cd web
npm install  # If first time
npm run dev  # Start Vite dev server
```
Open http://localhost:5173 in your browser.

### 2. Login
- Email: test@example.com
- Password: (Firebase Auth required)
- Or use Google sign-in

### 3. Navigate Pages
- Click sidebar items to navigate
- Use Cmd+K to search
- Theme toggle in navbar (Sun/Moon icon)

---

## Feature Overview & Usage

### 📊 Dashboard
**Location**: `/dashboard` (Default home page after login)

**Features**:
- Welcome message with user name
- Drag-drop file upload zone
- Recent files grid display
- Upload modal (overlay)
- Cmd+K command palette
- Dark/light theme toggle

**How to Use**:
1. Click "Upload Files" button
2. Drag PDFs into the zone or click to browse
3. Files appear in grid once uploaded
4. Click file card to open in editor

**API Endpoints** (To implement):
- `GET /api/files` - List user's files
- `POST /api/files` - Upload file
- `GET /api/files/:id` - Get file details

---

### 📂 Files Manager
**Location**: `/files`

**Features**:
- Search files by name
- Multi-select with checkboxes
- Download files
- Share files
- Delete files
- File metadata (size, date)

**How to Use**:
1. Type in search box to filter files
2. Click checkbox to select multiple files
3. Use action buttons (Download, Share, Delete)
4. Delete button appears when files selected

**Selected Files Counter**:
- Shows count of selected files
- Delete button becomes active
- Press ESC to deselect all

---

### 🔗 Merge PDFs
**Location**: `/merge`

**Features**:
- Select multiple files from library
- Drag-reorder files in merge queue
- Up/down arrows to reorder
- Remove individual files
- Merge progress bar
- Download merged PDF

**How to Use**:
1. Left side: Select files from available list
2. Selections appear on right side
3. Click up/down arrows to reorder
4. Remove button deletes from merge queue
5. Click "Merge & Download" when ready
6. Merged file downloads automatically

**Merge Algorithm** (To implement):
- Extract pages from each PDF in order
- Combine into single PDF
- Preserve bookmarks if available
- Optimize file size

---

### ✂️ Split & Extract
**Location**: `/split`

**Features**:
- Select single PDF file
- Define multiple split points
- Specify page ranges (start-end)
- Add/remove split configurations
- Extract specific page ranges
- Download split documents

**How to Use**:
1. Left side: Select file to split
2. Right side: Define split points
3. Click "+ Add Split" for each range
4. Set start and end page numbers
5. Click "Split & Download"
6. Gets multiple PDF files (one per range)

**Example**:
```
File: report.pdf (20 pages)
Split 1: Pages 1-5 → report_1.pdf
Split 2: Pages 6-15 → report_2.pdf
Split 3: Pages 16-20 → report_3.pdf
```

---

### 🔄 Universal Converter
**Location**: `/convert`

**Features**:
- Convert to 4 formats:
  - 📄 Word (.DOCX)
  - 📊 Excel (.XLSX)
  - 🎨 PowerPoint (.PPTX)
  - 🖼️ Images (.PNG/.JPG)
- Drag-drop upload
- Progress tracking per file
- Download converted files

**How to Use**:
1. Click format button (Word/Excel/PPT/Image)
2. Drag files into upload zone
3. Files appear in queue with progress bars
4. Click "Convert Files" to start
5. Download converted files as they complete

**Supported Conversions**:
```
PDF → Word:     OCR + Layout preservation
PDF → Excel:    Table detection
PDF → PowerPoint: Slide per page
PDF → Images:   High-res PNG/JPG per page
```

---

### ☁️ Cloud Storage
**Location**: `/cloud`

**Features**:
- Storage usage dashboard
  - Used/Total storage
  - Shared files count
  - Private files count
- File table with metadata
- Download files from cloud
- Share files with link
- Delete files
- Status indicators (Shared/Private)

**How to Use**:
1. View storage stats at top
2. Browse files in table below
3. Click Download to fetch file
4. Click Share to generate link
5. Click Delete to remove file

**Cloud Features** (To implement):
- Auto-sync with local changes
- Version history per file
- Access control settings
- Bandwidth optimization

---

### 👥 Real-time Collaboration
**Location**: `/collaborate`

**Features**:
- Session ID display
- Copy session ID button
- Active participants list
- User presence status
- Session chat
- Invite others button

**How to Use**:
1. Share Session ID with team
2. They use same ID to join
3. See participant list update
4. Chat messages in real-time
5. See cursor positions (when editing)

**Session Join Flow**:
1. User A: Starts editing, gets Session ID
2. User B: Clicks "Collaborate"
3. User B: Enters Session ID or uses link
4. Both see each other in participants
5. Changes sync in real-time

---

### 📋 Activity History
**Location**: `/history`

**Features**:
- Timeline of all operations
- Filter by operation type:
  - All
  - Merge
  - Split
  - Convert
- Time formatting (just now, 2h ago, etc)
- Operation details
- Revert to version button
- Operation icons and descriptions

**How to Use**:
1. View full timeline of operations
2. Click filter buttons to narrow down
3. See operation details
4. Click "Revert" to undo operation
5. File restored to previous state

**History Tracking** (To implement):
- Save before/after file state
- Store operation metadata
- Implement version control
- Allow revert up to 30 days

---

### ⚙️ Settings
**Location**: `/settings`

**Features**:
- **Notifications**
  - Email notifications toggle
  - Sound effects toggle
- **Appearance**
  - Theme selector (Light/Dark/Auto)
  - Animations toggle
- **Preferences**
  - Auto-save toggle
  - Language selector
- **Security & Privacy**
  - Change password
  - Two-factor authentication
  - Delete account

**How to Use**:
1. Toggle switches for boolean settings
2. Use dropdowns for options
3. Click buttons for actions (Change Password, etc)
4. Click "Save All Settings" to persist
5. Settings saved to Firebase

**User Preferences Storage** (To implement):
- Firestore collection: `users/{uid}/preferences`
- Sync across devices
- Local storage fallback

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd+K` / `Ctrl+K` | Open search/command palette |
| `Escape` | Close modals, deselect files |
| `Tab` | Navigate between elements |
| `Enter` | Submit forms, confirm actions |
| `Ctrl+A` | Select all visible items |
| `Delete` | Delete selected files |

---

## Component API Reference

### Navbar Component
```typescript
interface NavbarProps {
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

// Usage
<Navbar isDarkMode={isDarkMode} onThemeToggle={toggleTheme} />
```

**Features**:
- Logo and branding
- Search bar with Cmd+K
- Theme toggle
- Notifications bell
- User profile dropdown

---

### Sidebar Component
```typescript
interface SidebarProps {
  isDarkMode: boolean;
}

// Usage
<Sidebar isDarkMode={isDarkMode} />
```

**Features**:
- Collapsible navigation
- 11 nav items
- Active route highlighting
- Mobile responsive

---

## Error Handling

### Toast Notifications
```typescript
import toast from 'react-hot-toast';

// Success
toast.success('Operation completed!');

// Error
toast.error('Something went wrong');

// Info
toast.loading('Processing...');

// Custom
toast((t) => (
  <div>Custom content</div>
), {
  duration: 4000,
});
```

---

## State Management

### Using File Context
```typescript
import { useFileStore } from '@/context/fileContext';

const MyComponent = () => {
  const { files, addFile, removeFile } = useFileStore();
  
  // Access files
  console.log(files);
  
  // Add file
  addFile(newFile);
  
  // Remove file
  removeFile(fileId);
};
```

### Using Auth Context
```typescript
import { useAuthStore } from '@/context/authContext';

const MyComponent = () => {
  const { user, setUser, loading } = useAuthStore();
  
  // Access user
  console.log(user?.email);
  
  // Update user
  setUser(newUser);
};
```

---

## Firebase Integration

### Firestore Collections
```
users/
  ├── {uid}/
  │   ├── profile (name, email, photo)
  │   ├── preferences (settings)
  │   └── subscription (plan, status)
│
files/
  ├── {fileId}/
  │   ├── metadata (name, size, type)
  │   ├── pages[] (page info)
  │   └── operations[] (history)
│
operations/
  ├── {opId}/
  │   ├── type (merge, split, convert)
  │   ├── input[] (file IDs)
  │   ├── output (result file ID)
  │   └── timestamp
│
sessions/
  ├── {sessionId}/
  │   ├── participants[] (user IDs)
  │   ├── activeFile (file ID)
  │   ├── messages[]
  │   └── createdAt
```

### Authentication
```typescript
import { auth } from '@/utils/firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';

// Login
await signInWithEmailAndPassword(auth, email, password);

// Logout
await signOut(auth);

// Get current user
const user = auth.currentUser;
```

---

## Common Tasks

### Upload a File
```typescript
const handleFileUpload = async (file: File) => {
  try {
    // 1. Upload to Firebase Storage
    const storageRef = ref(storage, `files/${file.name}`);
    await uploadBytes(storageRef, file);
    
    // 2. Create metadata in Firestore
    await addDoc(collection(db, 'files'), {
      name: file.name,
      size: file.size,
      uploadedAt: new Date(),
      userId: user.uid,
    });
    
    toast.success('File uploaded!');
  } catch (error) {
    toast.error('Upload failed');
  }
};
```

### Merge Multiple PDFs
```typescript
const handleMerge = async (fileIds: string[]) => {
  try {
    // 1. Get all PDFs from storage
    const pdfs = await Promise.all(
      fileIds.map(id => downloadFile(id))
    );
    
    // 2. Merge using pdf-lib
    const mergedPdf = await PDFDocument.create();
    for (const pdf of pdfs) {
      const pages = await PDFDocument.load(pdf);
      const copiedPages = await mergedPdf.copyPages(
        pages,
        pages.getPageIndices()
      );
      copiedPages.forEach(page => mergedPdf.addPage(page));
    }
    
    // 3. Save result
    const pdfBytes = await mergedPdf.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    
    // 4. Upload merged file
    const mergedFileRef = ref(storage, `files/merged-${Date.now()}.pdf`);
    await uploadBytes(mergedFileRef, blob);
    
    toast.success('Files merged successfully!');
  } catch (error) {
    toast.error('Merge failed');
  }
};
```

---

## Performance Tips

1. **Use Web Workers** for large file processing
2. **Lazy load** heavy components (Tesseract.js, Lottie)
3. **Debounce** search and input handlers
4. **Memoize** components with React.memo
5. **Code split** by route with React.lazy
6. **Optimize images** before upload
7. **Cache** API responses with React Query

---

## Troubleshooting

### Files not appearing
- Check Firestore rules allow read access
- Verify file upload completed
- Check browser console for errors

### Merge not working
- Ensure PDF files are valid
- Check browser memory usage
- Try with smaller files first

### Slow performance
- Clear browser cache
- Disable animations in settings
- Reduce file resolution
- Use web workers

### Dark mode not persisting
- Check localStorage is enabled
- Verify theme preference saved
- Clear browser storage

---

## What's Next?

1. **Backend Integration**
   - Connect Firestore operations
   - Implement Cloud Functions
   - Set up file processing queue

2. **Real Features**
   - Actual PDF merge/split/convert
   - Collaboration sync
   - Cloud storage sync

3. **Testing**
   - Unit tests for utilities
   - E2E tests for workflows
   - Performance testing

4. **Deployment**
   - Firebase Hosting
   - Cloud Functions
   - Firestore indexes

5. **Analytics**
   - User behavior tracking
   - Error logging
   - Performance monitoring

---

**Created**: Dashboard 2.0 Pro  
**Status**: UI/UX Complete, Ready for Backend Integration  
**Developed with**: React, TypeScript, Tailwind, Framer Motion, Firebase
