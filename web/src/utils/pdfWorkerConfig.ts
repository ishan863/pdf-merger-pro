import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
// Use CDN URL for reliability and speed
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export { pdfjsLib };
