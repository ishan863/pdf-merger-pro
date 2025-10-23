# 🚀 Free Backend Implementation Guide

## Quick Start: Vercel Serverless Functions (FREE)

### Why Vercel?
- ✅ Already using it for frontend
- ✅ No additional setup needed
- ✅ 100GB bandwidth/month FREE
- ✅ 100 hours execution/month FREE
- ✅ No credit card required

---

## Option 1: Vercel Serverless with LibreOffice (Node.js)

### Step 1: Create API Directory

```bash
cd web
mkdir api
cd api
```

### Step 2: Install Dependencies

```bash
npm install libreoffice-convert --save
npm install @types/node --save-dev
```

### Step 3: Create Conversion Endpoint

**File: `web/api/convert.ts`**

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';
import libre from 'libreoffice-convert';
import { promisify } from 'util';

const convertAsync = promisify(libre.convert);

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { fileBase64, fileName } = req.body;

    if (!fileBase64 || !fileName) {
      return res.status(400).json({ error: 'Missing file data' });
    }

    // Convert base64 to buffer
    const inputBuffer = Buffer.from(fileBase64, 'base64');

    // Get file extension
    const ext = fileName.split('.').pop()?.toLowerCase();
    const format = ext === 'docx' ? '.docx' : ext === 'xlsx' ? '.xlsx' : '.pptx';

    // Convert to PDF
    const pdfBuffer = await convertAsync(inputBuffer, format, undefined);

    // Return PDF as base64
    const pdfBase64 = pdfBuffer.toString('base64');

    return res.status(200).json({
      success: true,
      pdf: pdfBase64,
      fileName: fileName.replace(/\.[^.]+$/, '.pdf'),
    });
  } catch (error: any) {
    console.error('Conversion error:', error);
    return res.status(500).json({
      error: 'Conversion failed',
      message: error.message,
    });
  }
}

// Increase timeout to 60 seconds
export const config = {
  maxDuration: 60,
};
```

### Step 4: Update Frontend to Use API

**File: `web/src/utils/serverConversion.ts`**

```typescript
export async function convertDocumentToPDF(file: File): Promise<Blob> {
  // Read file as base64
  const fileBase64 = await fileToBase64(file);

  // Call Vercel serverless function
  const response = await fetch('/api/convert', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fileBase64: fileBase64.split(',')[1], // Remove data:... prefix
      fileName: file.name,
    }),
  });

  if (!response.ok) {
    throw new Error('Conversion failed');
  }

  const data = await response.json();

  // Convert base64 back to Blob
  const pdfBytes = Uint8Array.from(atob(data.pdf), c => c.charCodeAt(0));
  return new Blob([pdfBytes], { type: 'application/pdf' });
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
```

### Step 5: Update vercel.json

**File: `vercel.json`**

```json
{
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/assets/(.*)",
      "dest": "/assets/$1"
    },
    {
      "handle": "filesystem"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "functions": {
    "api/convert.ts": {
      "maxDuration": 60,
      "memory": 1024
    }
  }
}
```

### Step 6: Deploy

```bash
git add .
git commit -m "Add serverless Office to PDF conversion"
git push origin main
```

Vercel will automatically deploy!

---

## Option 2: Firebase Functions (Also FREE)

### Step 1: Initialize Firebase Functions

```bash
cd pdf_merger
npm install -g firebase-tools
firebase login
firebase init functions
```

Select:
- ✅ TypeScript
- ✅ ESLint
- ✅ Install dependencies

### Step 2: Install LibreOffice in Functions

**File: `functions/package.json`**

```json
{
  "dependencies": {
    "firebase-admin": "^12.0.0",
    "firebase-functions": "^4.5.0",
    "libreoffice-convert": "^1.6.0"
  }
}
```

### Step 3: Create Conversion Function

**File: `functions/src/index.ts`**

```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import libre from 'libreoffice-convert';
import { promisify } from 'util';

admin.initializeApp();
const convertAsync = promisify(libre.convert);

export const convertDocument = functions
  .runWith({
    timeoutSeconds: 60,
    memory: '1GB',
  })
  .https.onCall(async (data, context) => {
    const { fileBase64, fileName } = data;

    if (!fileBase64 || !fileName) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Missing file data'
      );
    }

    try {
      // Convert base64 to buffer
      const inputBuffer = Buffer.from(fileBase64, 'base64');

      // Get extension
      const ext = fileName.split('.').pop()?.toLowerCase();
      const format = ext === 'docx' ? '.docx' : ext === 'xlsx' ? '.xlsx' : '.pptx';

      // Convert to PDF
      const pdfBuffer = await convertAsync(inputBuffer, format, undefined);

      // Return as base64
      return {
        success: true,
        pdf: pdfBuffer.toString('base64'),
        fileName: fileName.replace(/\.[^.]+$/, '.pdf'),
      };
    } catch (error: any) {
      console.error('Conversion error:', error);
      throw new functions.https.HttpsError(
        'internal',
        'Conversion failed: ' + error.message
      );
    }
  });
```

### Step 4: Deploy Firebase Function

```bash
cd functions
npm install
cd ..
firebase deploy --only functions
```

### Step 5: Update Frontend

**File: `web/src/utils/firebaseConversion.ts`**

```typescript
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from './firebase';

const functions = getFunctions(app);
const convertDocument = httpsCallable(functions, 'convertDocument');

export async function convertDocumentToPDF(file: File): Promise<Blob> {
  // Read file as base64
  const fileBase64 = await fileToBase64(file);

  // Call Firebase function
  const result = await convertDocument({
    fileBase64: fileBase64.split(',')[1],
    fileName: file.name,
  });

  const data = result.data as any;

  // Convert base64 to Blob
  const pdfBytes = Uint8Array.from(atob(data.pdf), c => c.charCodeAt(0));
  return new Blob([pdfBytes], { type: 'application/pdf' });
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
```

---

## Option 3: Third-Party API (CloudConvert) - 25 FREE conversions/day

### Step 1: Sign Up

Go to https://cloudconvert.com/api/v2
- ✅ 25 free conversions/day
- ✅ No credit card for free tier
- ✅ Get API key

### Step 2: Install SDK

```bash
npm install cloudconvert
```

### Step 3: Create Conversion Utility

**File: `web/src/utils/cloudConvert.ts`**

```typescript
import CloudConvert from 'cloudconvert';

// Get from CloudConvert dashboard
const API_KEY = import.meta.env.VITE_CLOUDCONVERT_API_KEY;

export async function convertDocumentToPDF(file: File): Promise<Blob> {
  const cloudConvert = new CloudConvert(API_KEY);

  // Create job
  const job = await cloudConvert.jobs.create({
    tasks: {
      'import-file': {
        operation: 'import/upload',
      },
      'convert-file': {
        operation: 'convert',
        input: 'import-file',
        output_format: 'pdf',
      },
      'export-file': {
        operation: 'export/url',
        input: 'convert-file',
      },
    },
  });

  // Upload file
  const uploadTask = job.tasks.filter(
    (task) => task.operation === 'import/upload'
  )[0];
  await cloudConvert.tasks.upload(uploadTask, file);

  // Wait for conversion
  const finishedJob = await cloudConvert.jobs.wait(job.id);

  // Download result
  const exportTask = finishedJob.tasks.filter(
    (task) => task.operation === 'export/url'
  )[0];
  const fileUrl = exportTask.result?.files[0]?.url;

  if (!fileUrl) {
    throw new Error('No output file');
  }

  // Fetch PDF
  const response = await fetch(fileUrl);
  return await response.blob();
}
```

### Step 4: Add to .env

```bash
VITE_CLOUDCONVERT_API_KEY=your_api_key_here
```

---

## Comparison Table

| Solution | Free Tier | Setup Time | Reliability | Limitations |
|----------|-----------|------------|-------------|-------------|
| **Vercel Functions** | 100GB/month | 15 min | ⭐⭐⭐⭐⭐ | 10s timeout (enough) |
| **Firebase Functions** | 2M calls/month | 20 min | ⭐⭐⭐⭐⭐ | Cold start delay |
| **CloudConvert API** | 25/day | 5 min | ⭐⭐⭐⭐ | Daily limit |
| **Railway** | $5 credit/month | 10 min | ⭐⭐⭐⭐ | Limited credit |
| **Render** | 750 hrs/month | 10 min | ⭐⭐⭐ | Sleeps after 15min |

---

## My Recommendation

### For You: **Vercel Serverless Functions**

**Pros:**
- ✅ Already using Vercel
- ✅ Same deployment workflow
- ✅ No additional accounts
- ✅ Fast (no cold starts)
- ✅ 100GB/month FREE

**Cons:**
- ⚠️ LibreOffice might be too large (50MB limit)

**Fallback:** If LibreOffice doesn't work on Vercel, use **Firebase Functions** (you already have Firebase set up).

---

## Next Steps

1. **Try Vercel first** - Create `web/api/convert.ts`
2. **If Vercel fails** - Use Firebase Functions
3. **For quick testing** - Use CloudConvert (25 free/day)

Would you like me to implement Option 1 (Vercel) for you? I can create all the files and configure everything! 🚀
