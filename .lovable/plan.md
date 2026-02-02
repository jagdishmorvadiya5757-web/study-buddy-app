
# Plan: Fix PDF Preview — Prevent Blob URL Invalidation

## Problem Analysis

When clicking "Open PDF in New Tab," the PDF initially loads, but Chrome's PDF viewer shows the error **"It may have been moved, edited, or deleted"** because:

1. The blob URL is created and written into an iframe in the new tab
2. After 60 seconds, `URL.revokeObjectURL(blobUrl)` is called
3. Chrome's built-in PDF viewer doesn't cache the PDF data — it references the blob URL continuously
4. When the URL is revoked (or sometimes immediately if there's a timing race), the viewer loses access and shows the error

This is a Chrome-specific behavior where the PDF viewer needs the blob URL to remain valid for the lifetime of the viewing session.

## Solution

### Approach 1 (Recommended): Remove Blob URL Revocation

The simplest and most reliable fix is to **not revoke the blob URL**. When the user closes the tab, the browser will garbage-collect the blob automatically. Memory impact is minimal (one PDF per tab).

### Changes Required

**File: `src/pages/admin/AdminScans.tsx`**

Remove the `setTimeout(() => URL.revokeObjectURL(...), 60000)` line entirely:

```typescript
// REMOVE THIS LINE:
setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
```

### Approach 2 (Alternative): Add Download Button

If you want to provide a more reliable fallback for users with aggressive extensions, add a "Download PDF" button that triggers a file download instead of opening in a new tab:

```typescript
const handleDownloadPdf = async () => {
  // Similar fetch logic, but use:
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = `${previewScan.title || 'scan'}.pdf`;
  link.click();
};
```

## Technical Details

| Item | Change |
|------|--------|
| File | `src/pages/admin/AdminScans.tsx` |
| Line ~159 | Remove `setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);` |
| Optional | Add a "Download PDF" button as fallback |

## Why This Works

- Chrome's PDF viewer holds a reference to the blob URL for the entire viewing session
- By not revoking it, the URL remains valid until the tab is closed
- When the tab closes, the browser releases the blob automatically — no memory leak
- This matches the pattern used by most PDF-viewing applications

## User Experience Improvement

The PDF will now:
1. Open reliably in a new tab
2. Remain viewable for as long as the tab is open
3. Not show the "moved, edited, or deleted" error

