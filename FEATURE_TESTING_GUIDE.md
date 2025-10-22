# Feature Testing & Verification Guide 🧪

Complete this guide to verify all features are working properly.

---

## Prerequisites ✅

Before testing, ensure:
- [ ] Firebase project created
- [ ] `.firebaserc` configured with project ID
- [ ] `.env.local` has Firebase credentials
- [ ] `npm run dev` is running in `/web` folder
- [ ] Dev server accessible at `http://localhost:5173`
- [ ] Browser DevTools console open (F12)

---

## Feature 1: Authentication 🔐

### Test User Registration
1. Open http://localhost:5173/login
2. Enter email: `test@example.com`
3. Enter password: `TestPassword123!`
4. Click **"Sign Up"**
5. Expected: Account created, redirected to dashboard
6. Check Firebase Console > Authentication > should see new user

**Status:** ✅ Pass / ❌ Fail

### Test User Login
1. Sign out (click user menu > Sign Out)
2. Try to login with same credentials
3. Enter email: `test@example.com`
4. Enter password: `TestPassword123!`
5. Click **"Sign In"**
6. Expected: Logged in, shown dashboard

**Status:** ✅ Pass / ❌ Fail

### Test Password Reset
1. On login page, click **"Forgot Password?"**
2. Enter email: `test@example.com`
3. Click **"Send Reset Link"**
4. Expected: Success message, email sent
5. Check email for reset link (may go to spam)

**Status:** ✅ Pass / ❌ Fail

---

## Feature 2: File Upload 📤

### Test PDF Upload
1. Navigate to Dashboard
2. Click **"Upload Files"** or drag-drop area
3. Select a PDF file (under 100MB)
4. Expected: 
   - File appears in dashboard
   - Shows page count
   - Shows file size
   - Shows upload date
5. Check Firebase Console > Storage > `/users/[userId]/uploads/` folder has file

**Status:** ✅ Pass / ❌ Fail

### Test Image Upload (Auto-Convert)
1. Upload a JPG or PNG image
2. Expected:
   - Auto-converts to PDF
   - Shows "Converting..." status
   - After 2-3 seconds, shows "Ready"
   - File appears in dashboard as PDF
3. Check Storage > `/users/[userId]/conversions/` for converted PDF

**Status:** ✅ Pass / ❌ Fail

### Test CSV to PDF (Client-Side)
1. Create a simple CSV file:
   ```csv
   Name,Age,City
   John,30,NYC
   Jane,28,LA
   ```
2. Upload CSV file
3. Expected:
   - Auto-converts to PDF
   - Shows as PDF in dashboard
4. Download and verify table structure

**Status:** ✅ Pass / ❌ Fail

### Test Large File Handling
1. Try uploading file > 100MB
2. Expected: Upload rejected with message "File too large"
3. Try uploading file between 50-100MB
4. Expected: Upload succeeds but shows size warning

**Status:** ✅ Pass / ❌ Fail

---

## Feature 3: PDF Viewing 👀

### Test PDF Display
1. Open a PDF from dashboard (click file card or "Open" button)
2. Expected:
   - PDF renders in viewer
   - Shows page count (top left: "Page X of Y")
   - Shows file name
   - Renders correctly

**Status:** ✅ Pass / ❌ Fail

### Test Page Navigation
1. Click **Next Page** button or use arrow keys
2. Expected: Page increments, PDF updates
3. Click **Previous Page** or use arrow keys
4. Expected: Page decrements

**Status:** ✅ Pass / ❌ Fail

### Test Zoom Controls
1. Click **Zoom In** button (or Ctrl+Plus)
2. Expected: PDF zooms to 110%, 125%, 150%, etc.
3. Click **Zoom Out** (or Ctrl+Minus)
4. Expected: PDF zooms out back to normal
5. Click **Fit to Width** or **Fit to Page**
6. Expected: PDF scales accordingly

**Status:** ✅ Pass / ❌ Fail

### Test Thumbnail Strip
1. Check bottom of PDF viewer for thumbnail strip
2. Expected:
   - Shows thumbnails of all pages (or first 10 + load more)
   - Can scroll through thumbnails
   - Click thumbnail to jump to page
   - Thumbnail loading takes <200ms per page

**Status:** ✅ Pass / ❌ Fail

---

## Feature 4: Page Editing ✏️

### Test Page Rotation
1. Open PDF in editor
2. Click **Page Editor** button
3. Select a page (click on thumbnail)
4. Click **Rotate 90°** button (or press R)
5. Expected:
   - Page rotates 90° clockwise
   - Thumbnail updates
   - Can rotate 180° and 270°

**Status:** ✅ Pass / ❌ Fail

### Test Page Deletion
1. With page editor open, select a page
2. Click **Delete** button (or press Del)
3. Expected:
   - Page removed from PDF
   - Thumbnail count decreases
   - File updated in Firestore

**Status:** ✅ Pass / ❌ Fail

### Test Page Duplication
1. Select a page in editor
2. Click **Duplicate** button
3. Expected:
   - Page copied immediately after original
   - Page count increases
   - Thumbnail appears

**Status:** ✅ Pass / ❌ Fail

### Test Multi-Select & Bulk Actions
1. Select page 1 (click thumbnail)
2. Hold Ctrl + Click page 3
3. Expected: Both pages highlighted
4. Shift + Click page 5
5. Expected: Pages 3, 4, 5 also selected
6. With multiple selected, click **Rotate** button
7. Expected: All selected pages rotate

**Status:** ✅ Pass / ❌ Fail

### Test Drag-Drop Reordering
1. Open page editor
2. Drag page 3 thumbnail and drop on page 1 position
3. Expected:
   - Page 3 moves to position 1
   - Other pages shift accordingly
   - Firestore updates with new order

**Status:** ✅ Pass / ❌ Fail

---

## Feature 5: Annotations 🎨

### Test Drawing Tool
1. Open PDF and click **Annotate** button
2. Select **Draw Tool** (pen icon)
3. Draw freehand on PDF page
4. Expected:
   - Line appears where drawn
   - Smooth rendering
   - Can draw multiple strokes

**Status:** ✅ Pass / ❌ Fail

### Test Shapes
1. In annotation drawer, select **Rectangle Tool**
2. Draw rectangle on page
3. Expected: Rectangle shape appears
4. Try **Circle Tool** and **Line Tool**
5. Expected: Shapes draw correctly

**Status:** ✅ Pass / ❌ Fail

### Test Text Annotation
1. Click **Text Tool**
2. Click on PDF where you want text
3. Type text in popup
4. Expected: Text appears on PDF at clicked location
5. Can change color and font size

**Status:** ✅ Pass / ❌ Fail

### Test Color & Stroke Width
1. Select drawing tool
2. Click different colors in annotation drawer
3. Draw with each color
4. Expected: Lines appear in selected colors
5. Adjust stroke width slider
6. Draw with different widths
7. Expected: Thickness changes

**Status:** ✅ Pass / ❌ Fail

### Test Annotation Undo
1. Draw on PDF
2. Click **Undo** button
3. Expected: Last annotation removed
4. Click **Redo**
5. Expected: Annotation reappears

**Status:** ✅ Pass / ❌ Fail

### Test Save Annotations
1. Add annotations to page
2. Click **Done** or close annotation drawer
3. Expected: Annotations saved to Firestore
4. Reload page (F5)
5. Expected: Annotations still visible

**Status:** ✅ Pass / ❌ Fail

---

## Feature 6: Merge PDFs 🔗

### Test Merge Two Files
1. Open Dashboard
2. Select 2 PDF files (checkboxes or Ctrl+Click)
3. Right-click or click **Merge** button
4. Expected: Merge dialog appears
5. Click **Confirm Merge**
6. Expected:
   - Shows "Merging..." status
   - After 5-10 seconds, shows "Merge Complete"
   - New merged PDF appears in dashboard

**Status:** ✅ Pass / ❌ Fail

### Test Merge Multiple Files
1. Select 3+ PDF files
2. Click **Merge**
3. Expected:
   - Merge dialog shows file order
   - Can reorder files with drag-drop
   - Click **Confirm**
   - Merged PDF created successfully

**Status:** ✅ Pass / ❌ Fail

---

## Feature 7: Split/Extract Pages 📄

### Test Extract Single Page
1. Open PDF with 5+ pages
2. Click **Split/Extract** button
3. Select pages: 2-4
4. Click **Extract**
5. Expected:
   - New PDF created with pages 2-4 only
   - Original PDF unchanged
   - New file appears in dashboard

**Status:** ✅ Pass / ❌ Fail

### Test Extract to Multiple PDFs
1. Specify: "Extract page 1, pages 2-3, page 4 to separate files"
2. Click **Extract**
3. Expected: 3 new PDFs created
4. Each has specified pages only

**Status:** ✅ Pass / ❌ Fail

---

## Feature 8: Conversion (Word/Excel/PPT to PDF) 🔄

### Test Word to PDF
1. Prepare a `.docx` file (Microsoft Word format)
2. Upload to dashboard
3. Expected:
   - Shows "Requires Cloud Function"
   - Modal appears asking for consent
   - After clicking OK, conversion starts
   - After 10-30 seconds: "Conversion Complete"
4. PDF appears in dashboard
5. Check Firestore > conversions collection shows conversion record

**Status:** ✅ Pass / ❌ Fail

### Test Excel to PDF
1. Prepare a `.xlsx` file
2. Upload file
3. Expected:
   - Consent modal appears
   - Conversion processes
   - PDF with spreadsheet data created
   - All cells visible in PDF

**Status:** ✅ Pass / ❌ Fail

### Test PowerPoint to PDF
1. Prepare a `.pptx` file (3+ slides)
2. Upload file
3. Expected:
   - Consent modal appears
   - Conversion processes
   - PDF has all slides (1 slide per page minimum)
   - Slides render correctly

**Status:** ✅ Pass / ❌ Fail

### Test Conversion History
1. Go to **Conversion History** tab
2. Expected:
   - List shows all conversions
   - Status column shows: Pending, Processing, Complete, Failed
   - Timestamps accurate
   - Can download converted files

**Status:** ✅ Pass / ❌ Fail

---

## Feature 9: OCR (Optical Character Recognition) 📖

### Test OCR on Scanned Image
1. Upload a scanned document image (JPG/PNG of handwritten/scanned text)
2. After PDF created, click **OCR** button
3. Expected:
   - Shows "Running OCR..."
   - Progress bar moves
   - After 10-30 seconds: "OCR Complete"
   - Text extracted appears

**Status:** ✅ Pass / ❌ Fail

### Test OCR Export
1. After OCR completes
2. Click **Export as Text** button
3. Expected:
   - Downloads `.txt` file
   - Contains extracted text from document

**Status:** ✅ Pass / ❌ Fail

### Test OCR with Multiple Pages
1. Upload multi-page scanned PDF
2. Click **OCR**
3. Expected:
   - Shows progress for each page
   - "Page 1 of 10" indicator
   - All pages processed
   - Combined text exported

**Status:** ✅ Pass / ❌ Fail

---

## Feature 10: Real-Time Collaboration 👥

### Test Presence Indicators
1. Open same PDF in two browser windows (or two computers)
2. Window 1: Labeled as "You"
3. Window 2: Should appear as collaborator (shows name/avatar)
4. Expected: Presence indicator shows "1 other collaborator viewing"

**Status:** ✅ Pass / ❌ Fail

### Test Cursor Tracking
1. In Window 1, hover over page 3
2. In Window 2, check if cursor position updates
3. Expected: See cursor from Window 1 appear on screen
4. Shows color and user label

**Status:** ✅ Pass / ❌ Fail

### Test Live Updates
1. In Window 1, rotate a page
2. In Window 2, watch page update automatically
3. Expected: Page rotates in real-time without refresh
4. Try delete, duplicate, reorder
5. Expected: All changes appear in real-time

**Status:** ✅ Pass / ❌ Fail

### Test Session History
1. Make changes: rotate pages, add annotations
2. Close Window 2
3. Reopen same file
4. Expected: All previous changes preserved
5. Session history shows all edits

**Status:** ✅ Pass / ❌ Fail

---

## Feature 11: Dashboard & UI 🎨

### Test Dark Mode Toggle
1. Click theme toggle (sun/moon icon, top right)
2. Expected: 
   - UI switches to dark theme
   - All components properly styled
   - No text contrast issues
   - Preference persists on refresh

**Status:** ✅ Pass / ❌ Fail

### Test Search (Cmd+K)
1. Press Cmd+K (macOS) or Ctrl+K (Windows/Linux)
2. Search modal appears
3. Type partial filename: "test"
4. Expected: Shows matching files
5. Press Enter to open file

**Status:** ✅ Pass / ❌ Fail

### Test File Cards
1. Dashboard shows grid of file cards
2. Each card shows:
   - [ ] Thumbnail preview
   - [ ] File name
   - [ ] Page count
   - [ ] File size
   - [ ] Last modified date
   - [ ] Quick action buttons (Open, Edit, Delete, Download)
3. Cards responsive on mobile (1-2 columns) and desktop (3-4 columns)

**Status:** ✅ Pass / ❌ Fail

### Test Responsive Design
1. Open dashboard on mobile device (or resize browser to 375px width)
2. Expected:
   - Layout adapts to narrow screen
   - File cards stack (1 column)
   - Buttons still accessible
   - No horizontal scrolling
3. Resize to tablet (768px)
4. Expected: 2 columns
5. Resize to desktop (1920px)
6. Expected: 4 columns

**Status:** ✅ Pass / ❌ Fail

---

## Feature 12: File Management 🗂️

### Test File Download
1. On dashboard, select a PDF
2. Click **Download** button
3. Expected: File downloads to computer
4. PDF opens and renders correctly

**Status:** ✅ Pass / ❌ Fail

### Test File Delete
1. Select a file
2. Click **Delete** button
3. Confirm delete in dialog
4. Expected:
   - File removed from dashboard
   - Removed from Firestore
   - Removed from Cloud Storage

**Status:** ✅ Pass / ❌ Fail

### Test File Sharing (if implemented)
1. Click **Share** on file card
2. Expected:
   - Share dialog appears
   - Shows share link
   - Shows permissions options
   - Can copy link to clipboard

**Status:** ✅ Pass / ❌ Fail

---

## Feature 13: Keyboard Shortcuts ⌨️

Test each shortcut:

| Shortcut | Expected Behavior | Status |
|----------|-------------------|--------|
| R | Rotate page 90° | ✅ / ❌ |
| Del | Delete selected page | ✅ / ❌ |
| M | Open merge dialog | ✅ / ❌ |
| Ctrl+A | Select all pages | ✅ / ❌ |
| Ctrl+Z | Undo annotation | ✅ / ❌ |
| Ctrl+Y | Redo annotation | ✅ / ❌ |
| Ctrl+K | Open search | ✅ / ❌ |
| Esc | Close dialogs | ✅ / ❌ |

---

## Feature 14: Error Handling 🚨

### Test Invalid File Upload
1. Try uploading `.exe` or unsupported format
2. Expected: Error message "File type not supported"
3. Upload not created

**Status:** ✅ Pass / ❌ Fail

### Test Network Error Recovery
1. Disconnect internet
2. Try uploading or converting
3. Expected: Shows "Network error - retrying..."
4. Reconnect internet
5. Expected: Operation resumes automatically

**Status:** ✅ Pass / ❌ Fail

### Test Conversion Failure
1. Upload unsupported format as Word (.txt instead of .docx)
2. Expected: Shows error "Conversion failed"
3. File not processed

**Status:** ✅ Pass / ❌ Fail

---

## Performance Checklist ⚡

- [ ] Page load: <2 seconds on 4G network
- [ ] File upload: <1 second for small files
- [ ] Thumbnail generation: <200ms per page
- [ ] PDF rendering: <500ms for 10 pages
- [ ] Zoom operations: Instant (<100ms)
- [ ] Page editing: Smooth drag-drop, no lag
- [ ] Annotations: No delay when drawing
- [ ] Merge: Complete in <30 seconds
- [ ] Conversion: Complete in <2 minutes (depends on file size)
- [ ] Real-time sync: <500ms latency
- [ ] No memory leaks (check DevTools > Memory)
- [ ] No console errors

---

## Browser Compatibility ✔️

Test on each browser:

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | Latest | ✅ / ❌ |
| Firefox | Latest | ✅ / ❌ |
| Safari | Latest | ✅ / ❌ |
| Edge | Latest | ✅ / ❌ |

---

## Sign-Off

**Testing Date:** _______________
**Tested By:** _______________
**Browser/Device:** _______________

**Overall Status:** ✅ All Features Working / ⚠️ Minor Issues / ❌ Blocking Issues

**Issues Found:**
1. 
2. 
3. 

**Notes:**

---

## Next Steps

- [ ] All tests passing ✅
- [ ] No performance issues
- [ ] Deployment ready for production
- [ ] Team trained on features
- [ ] Documentation complete

**Ready for release!** 🚀

