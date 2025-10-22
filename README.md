# PDF Merger Pro - Professional PDF Processing Web Application

A modern, feature-rich web application for uploading, viewing, and manipulating PDF documents with a smooth, animated UI.

## Features

### Core PDF Operations
- **Merge**: Combine multiple PDFs with drag-to-order
- **Split**: Extract pages by range (e.g., 1,3-5,7)
- **Extract**: Get specific page numbers into a new PDF
- **Reorder**: Drag-and-drop page reordering with animations
- **Rotate**: 90° increments on individual or bulk pages
- **Compress**: Client-side or server-side compression
- **OCR**: Tesseract.js for searchable PDFs
- **Watermark**: Add text/image watermarks
- **Redaction**: Remove sensitive content (legal-grade server-side)

### User Experience
- Drag-and-drop file upload
- PDF thumbnail previews with lazy-loading
- Real-time page highlighting during range input
- Smooth animations with Framer Motion
- Progress bars with ETA calculation
- Keyboard shortcuts (R=rotate, D=delete, M=merge, Ctrl+Z=undo)
- Responsive design (mobile, tablet, desktop)
- Full accessibility (ARIA labels, keyboard navigation)

### Authentication & Storage
- Google / Facebook / GitHub login via Firebase Auth
- Cloud Storage for file management
- Firestore for metadata & history
- Cloud Functions for heavy processing

## Project Structure

```
pdf-merger/
├── web/                      # React frontend
│   ├── src/
│   │   ├── components/       # Reusable React components
│   │   ├── pages/            # Page components (Home, Editor, Dashboard)
│   │   ├── hooks/            # Custom React hooks
│   │   ├── utils/            # Helper functions (PDF ops, storage, etc)
│   │   ├── types/            # TypeScript type definitions
│   │   ├── context/          # React Context (Auth, Files, UI)
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── functions/                # Firebase Cloud Functions
│   ├── src/
│   │   ├── index.ts          # Main function entry points
│   │   ├── services/         # Business logic (PDF processing, etc)
│   │   └── middleware/       # Auth, error handling
│   ├── package.json
│   └── tsconfig.json
├── infrastructure/           # Terraform / Firebase rules
│   ├── firestore.rules
│   ├── storage.rules
│   └── terraform/
├── package.json              # Root workspace config
└── README.md
```

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Firebase CLI: `npm install -g firebase-tools`

### Installation

```bash
# Clone and install
git clone <repo>
cd pdf-merger
npm install

# Setup Firebase
firebase login
firebase init

# Create .env file
cp web/.env.example web/.env.local
```

### Development

```bash
# Start dev servers (web + functions)
npm run dev

# Start only frontend
cd web && npm run dev

# Start only Cloud Functions
cd functions && npm run dev
```

### Build & Deploy

```bash
# Build all workspaces
npm run build

# Deploy to Firebase
npm run firebase:deploy
```

## Configuration

### Firebase Setup

1. Create project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable:
   - Authentication (Google, Facebook, GitHub)
   - Firestore Database
   - Cloud Storage
   - Cloud Functions
3. Download credentials JSON
4. Set environment variables in `web/.env.local`

### Environment Variables (web/.env.local)

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_MAX_FILE_SIZE_MB=100
VITE_CLIENT_SIDE_THRESHOLD_MB=50
```

## Key Libraries

| Library | Purpose |
|---------|---------|
| **React 18** | UI framework |
| **TypeScript** | Type safety |
| **Vite** | Build tool & dev server |
| **Tailwind CSS** | Styling |
| **Framer Motion** | Animations |
| **PDF.js** | PDF rendering & thumbnails |
| **pdf-lib** | Client-side PDF manipulation |
| **Tesseract.js** | OCR |
| **Firebase** | Auth, Storage, Firestore, Functions |
| **react-beautiful-dnd** | Drag-and-drop |
| **Sentry** | Error tracking |

## Development Guide

### Adding a New Component

```tsx
// src/components/MyComponent.tsx
import React from 'react';
import { motion } from 'framer-motion';

interface MyComponentProps {
  title: string;
}

export const MyComponent: React.FC<MyComponentProps> = ({ title }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 bg-white rounded-lg shadow"
    >
      <h2 className="text-xl font-bold">{title}</h2>
    </motion.div>
  );
};
```

### PDF Operations (Client-side)

```typescript
import { PDFDocument } from 'pdf-lib';

// Merge PDFs
const merged = await PDFDocument.create();
for (const blob of files) {
  const doc = await PDFDocument.load(await blob.arrayBuffer());
  const pages = await merged.copyPages(doc, doc.getPageIndices());
  pages.forEach(page => merged.addPage(page));
}
const result = await merged.save();
```

### Firebase Firestore Usage

```typescript
import { db } from '@/utils/firebase';
import { collection, addDoc, onSnapshot } from 'firebase/firestore';

// Listen to files in real-time
onSnapshot(collection(db, 'files'), (snapshot) => {
  const files = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
});
```

## Security

- HTTPS enforced
- Firestore/Storage rules enforce uid-based access
- Input validation on all endpoints
- GDPR-compliant data deletion
- Virus scanning on upload (server-side)
- XSS protection via React/Content Security Policy

## Performance

- Code splitting by route (Vite)
- Web Workers for heavy PDF operations
- Lazy-loading thumbnails
- Service Worker for offline support
- CDN caching for static assets
- Resumable uploads for large files

## Testing

```bash
# Unit tests
npm run test

# Integration tests (Firebase Emulator)
npm run test:integration

# E2E tests (Playwright)
npm run test:e2e
```

## Deployment

Deployed on Firebase Hosting with Cloud Functions. CI/CD via GitHub Actions.

```bash
# Manual deploy
firebase deploy --only hosting,functions
```

## Troubleshooting

### PDF.js WASM Error
```
Set VITE_PUBLIC_WASM_ENABLED=true in .env
```

### Firebase Connection Issues
```
Check Firebase credentials in .env.local
Verify project ID matches firebase.json
```

### Large File Upload Fails
```
Use resumable upload for files >100MB
Check Cloud Storage quota
Verify CORS policy
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes and test
4. Submit a pull request

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines.

## License

MIT

## Support

- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Email**: support@pdfmerger.app

---

## 📋 Roadmap: Dashboard 2.0 Upgrade

We're transforming PDF Merger into a **production-grade PDF processing platform** with advanced features. See [HANDOFF.md](./HANDOFF.md) for the complete implementation roadmap.

### Current Status
- **Phase 0** ✅ **COMPLETE**: Security & Consent infrastructure
- **Phase 1** 🚀 **70% COMPLETE**: Core UX + Conversion MVP
- **Phase 2** ⏳ Ready: Annotations + OCR + Smart Checks
- **Phase 3** ⏳ Ready: Sessions & Collaboration
- **Phase 4** ⏳ Ready: Tests, CI/CD & Release

### Documentation
- 📖 [HANDOFF.md](./HANDOFF.md) - **START HERE** for complete overview
- 📊 [COMPLETE_CODEBASE_DOCUMENTATION.md](./COMPLETE_CODEBASE_DOCUMENTATION.md) - Full architecture
- 🎯 [PHASE_0_1_SUMMARY.md](./PHASE_0_1_SUMMARY.md) - Detailed Phase 0-1 status
- 🔧 [.env.local.example](./web/.env.local.example) - Feature flags & configuration

### Quick Links
- **Feature Flags**: See `web/src/utils/features.ts` (all disabled by default for safety)
- **Consent Modal**: See `web/src/components/ConversionConsentModal.tsx`
- **Conversions**: See `web/src/utils/conversion.ts` (image, text, CSV → PDF)
- **Security**: See `infrastructure/firestore.rules` & `infrastructure/storage.rules`

---

**Built with ❤️ using React, Firebase, and PDF.js**
