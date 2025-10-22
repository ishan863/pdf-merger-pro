# Quick Start Guide - PDF Merger Pro

## 5-Minute Setup

### Step 1: Install Dependencies
```powershell
cd c:\Users\R A J A\Pyton_proj\pdf_merger
npm install
```

### Step 2: Setup Firebase

#### Option A: Use Existing Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project or use existing one
3. Copy credentials and update `web/.env.local`:
```env
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456
VITE_FIREBASE_APP_ID=1:123456:web:abc123
```

#### Option B: Use Firebase Emulator (Development)
```powershell
# Install emulator
firebase emulators:start

# In another terminal
cd web
npm run dev
```

### Step 3: Start Development Servers

```powershell
# Terminal 1 - Frontend
cd c:\Users\R A J A\Pyton_proj\pdf_merger\web
npm run dev
# Opens http://localhost:5173

# Terminal 2 - Cloud Functions
cd c:\Users\R A J A\Pyton_proj\pdf_merger\functions
npm run build
npm run dev
# Runs on http://localhost:5001
```

## Project Already Includes

✅ **Complete project structure**
- Monorepo with web + functions
- TypeScript everywhere
- ESLint + Prettier configured

✅ **Firebase integration**
- Authentication ready
- Firestore & Storage rules written
- Cloud Functions boilerplate

✅ **React setup**
- Tailwind CSS with custom theme
- Framer Motion for animations
- Zustand for state management
- React Router for navigation

✅ **PDF utilities**
- Merge, split, extract, rotate, delete
- Watermarking
- Page range parsing

✅ **Type definitions**
- User, PDFFile, FileOperation types
- All parameters typed
- Editor state management

## Building Features

### To Add PDF Viewer (Example)

1. **Install PDF.js**:
```bash
npm install --workspace=web pdfjs-dist
```

2. **Create component**:
```tsx
// web/src/components/PDFViewer.tsx
import { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

export const PDFViewer = ({ fileUrl }: { fileUrl: string }) => {
  const [pages, setPages] = useState<number>(0);

  return (
    <div className="pdf-viewer">
      {/* Render pages here */}
    </div>
  );
};
```

3. **Use in pages**:
```tsx
import { PDFViewer } from '@/components/PDFViewer';

export const EditorPage = () => {
  return (
    <div>
      <PDFViewer fileUrl="/path/to/pdf" />
    </div>
  );
};
```

### Adding Authentication

1. **Update LoginPage**:
```tsx
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/utils/firebase';
import { useAuthStore } from '@/context/authContext';

export const LoginPage = () => {
  const { setUser } = useAuthStore();

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    setUser({
      uid: result.user.uid,
      displayName: result.user.displayName,
      email: result.user.email,
      photoURL: result.user.photoURL,
      role: 'free',
      plan: 'free',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  };

  return (
    <button onClick={handleGoogleLogin}>
      Sign in with Google
    </button>
  );
};
```

2. **Deploy to Firebase Hosting**:
```bash
firebase deploy --only hosting
```

## Common Commands

```powershell
# Development
npm run dev              # Start all servers
npm run build            # Build production
npm run lint             # Check code quality
npm run format           # Format all code

# Firebase
firebase init            # Initialize new project
firebase deploy          # Deploy everything
firebase emulators:start # Start emulator suite
firebase rules:test      # Test security rules

# TypeScript
npm run type-check       # Check types

# Within web or functions
npm run build            # Build workspace
npm run test             # Test workspace
```

## Troubleshooting

### "Cannot find module" errors
```bash
# Clear node_modules and reinstall
rm -r node_modules package-lock.json
npm install
```

### Firebase auth not working
- Check credentials in `.env.local`
- Verify authentication providers enabled in Firebase Console
- Check security rules allow writes

### PDF.js not found
```bash
# Make sure pdf.worker.min.js is in public/
# Download from: https://cdnjs.com/libraries/pdf.js
```

### Styles not loading
```bash
# Rebuild Tailwind CSS
npm run build -- --force
```

## File Size Limits

- **Max file upload**: 100MB (configurable in `config.ts`)
- **Client-side processing**: 50MB (switch to server above this)
- **Cloud Storage**: Unlimited (Firebase plan dependent)

## Next: Build Your First Feature

### Feature: Upload & List PDFs

**Steps**:
1. Create `UploadZone` component with drag-drop
2. Add to Dashboard page
3. Use `useFileStore()` to manage uploads
4. Call Cloud Function to create file records
5. List files from Firestore

**Time**: ~2 hours  
**Difficulty**: Medium

### Follow tutorial in `/web/src` for examples

---

## Support

- **Docs**: See `README.md` for detailed documentation
- **Types**: Check `src/types/index.ts` for all interfaces
- **Utils**: PDF operations in `src/utils/pdfOperations.ts`
- **Components**: Example patterns in `src/components/`

**Ready to build?** Start with the Dashboard page and add a file upload feature! 🚀
