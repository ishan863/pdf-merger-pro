/**
 * Client-side file conversion utilities
 * Convert images, text, and other formats to PDF
 * Office conversions: Word/Excel (client-side), PowerPoint (unavailable)
 * Optimized for all browsers including mobile
 */

import { PDFDocument, rgb } from 'pdf-lib';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { 
  detectBrowser, 
  checkBrowserSupport, 
  isFileSizeSafe,
  getOptimalCanvasScale
} from './browserCompat';

/**
 * Image to PDF converter (client-side)
 * Fast, no server needed, preserves quality
 */
export async function imageToPDF(imageBlob: Blob, _fileName: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const img = new Image();
        img.onload = async () => {
          const pdfDoc = await PDFDocument.create();
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) throw new Error('Canvas context failed');

          ctx.drawImage(img, 0, 0);
          const imageDataUrl = canvas.toDataURL('image/png');

          // Add image to PDF
          const page = pdfDoc.addPage([img.width, img.height]);
          const pdfImage = await pdfDoc.embedPng(imageDataUrl);
          page.drawImage(pdfImage, {
            x: 0,
            y: 0,
            width: img.width,
            height: img.height,
          });

          const pdfBytes = await pdfDoc.save();
          resolve(new Blob([pdfBytes as BlobPart], { type: 'application/pdf' }));
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target?.result as string;
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(imageBlob);
  });
}

/**
 * Text/Markdown to PDF converter (client-side)
 * Parse text, format, and render as PDF
 */
export async function textToPDF(
  textBlob: Blob,
  _fileName: string,
  options: { fontSize?: number; fontColor?: [number, number, number]; pageWidth?: number; pageHeight?: number } = {}
): Promise<Blob> {
  const { fontSize = 12, fontColor = [0, 0, 0], pageWidth = 595, pageHeight = 842 } = options;

  const text = await textBlob.text();
  const pdfDoc = await PDFDocument.create();
  let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);

  const lines = text.split('\n');
  let yPosition = pageHeight - 50;
  const lineHeight = fontSize + 5;
  const maxWidth = pageWidth - 50;

  for (const line of lines) {
    if (yPosition < 50) {
      // Add new page if needed
      yPosition = pageHeight - 50;
      currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
    }

    // Simple word wrapping
    const wrappedLines = wrapText(line, fontSize, maxWidth);
    for (const wrappedLine of wrappedLines) {
      currentPage.drawText(wrappedLine, {
        x: 50,
        y: yPosition,
        size: fontSize,
        color: rgb(...fontColor),
      });
      yPosition -= lineHeight;
    }
  }

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
}

/**
 * Helper: wrap text to fit within width
 */
function wrapText(text: string, fontSize: number, maxWidth: number): string[] {
  const approximateCharWidth = fontSize * 0.5; // Rough estimate
  const charsPerLine = Math.floor(maxWidth / approximateCharWidth);

  if (text.length <= charsPerLine) {
    return [text];
  }

  const lines: string[] = [];
  let currentLine = '';
  const words = text.split(' ');

  for (const word of words) {
    if ((currentLine + word).length > charsPerLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine += (currentLine ? ' ' : '') + word;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

/**
 * CSV to PDF converter (simple table layout)
 */
export async function csvToSimplePDF(csvBlob: Blob): Promise<Blob> {
  const csvText = await csvBlob.text();
  const lines = csvText.split('\n').filter((line) => line.trim());
  const rows = lines.map((line) => line.split(',').map((cell) => cell.trim()));

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]);

  let yPosition = 800;
  const rowHeight = 20;
  const fontSize = 10;
  const colWidth = 100;

  for (const row of rows) {
    let xPosition = 50;
    for (const cell of row) {
      page.drawText(cell.substring(0, 15), {
        x: xPosition,
        y: yPosition,
        size: fontSize,
        color: rgb(0, 0, 0),
      });
      xPosition += colWidth;
    }
    yPosition -= rowHeight;
  }

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
}

/**
 * Detect file type that needs conversion
 */
export function needsConversion(mimeType: string): boolean {
  const convertibleTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'text/plain',
    'text/markdown',
    'text/csv',
    // Office docs - require server conversion
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ];

  return convertibleTypes.includes(mimeType);
}

/**
 * Check if file can be converted client-side
 */
export function canConvertClientSide(mimeType: string): boolean {
  const clientConvertible = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'text/plain',
    'text/markdown',
    'text/csv',
    // Office docs - Word and Excel now supported client-side
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ];

  return clientConvertible.includes(mimeType);
}

/**
 * Get conversion type
 */
export type ConversionType = 'image-pdf' | 'text-pdf' | 'csv-pdf' | 'office-pdf' | 'none';

export function getConversionType(mimeType: string): ConversionType {
  if (mimeType.startsWith('image/')) {
    return 'image-pdf';
  }
  if (mimeType === 'text/plain' || mimeType === 'text/markdown') {
    return 'text-pdf';
  }
  if (mimeType === 'text/csv') {
    return 'csv-pdf';
  }
  if (
    mimeType === 'application/msword' ||
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimeType === 'application/vnd.ms-excel' ||
    mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    mimeType === 'application/vnd.ms-powerpoint' ||
    mimeType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ) {
    return 'office-pdf';
  }

  return 'none';
}

/**
 * Word to PDF converter (client-side using Mammoth.js)
 * Optimized for mobile and all browsers
 */
async function wordToPDF(blob: Blob): Promise<Blob> {
  try {
    // Check browser support
    const support = checkBrowserSupport();
    if (!support.supported) {
      throw new Error(`Browser not supported: ${support.missing.join(', ')}`);
    }

    // Check file size
    const sizeCheck = isFileSizeSafe(blob.size);
    if (!sizeCheck.safe && sizeCheck.warning) {
      console.warn(sizeCheck.warning);
    }

    const arrayBuffer = await blob.arrayBuffer();
    const result = await mammoth.convertToHtml({ arrayBuffer });
    const html = result.value;

    // Create temporary container for rendering
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.width = '210mm'; // A4 width
    container.style.padding = '20mm';
    container.style.fontFamily = 'Arial, sans-serif';
    container.style.fontSize = '12pt';
    container.style.lineHeight = '1.5';
    container.style.backgroundColor = '#ffffff';
    container.innerHTML = html;
    document.body.appendChild(container);

    // Get optimal scale for device
    const scale = getOptimalCanvasScale();

    // Convert to canvas
    const canvas = await html2canvas(container, {
      scale: scale,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      allowTaint: true,
    });

    document.body.removeChild(container);

    // Create PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true, // Enable compression for mobile
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.85); // Use JPEG with 85% quality for smaller size
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
    heightLeft -= 297;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= 297;
    }

    return pdf.output('blob');
  } catch (error: any) {
    throw new Error(`Word conversion failed: ${error.message}`);
  }
}

/**
 * Excel to PDF converter (client-side using SheetJS)
 * Optimized for mobile and all browsers
 */
async function excelToPDF(blob: Blob): Promise<Blob> {
  try {
    // Check browser support
    const support = checkBrowserSupport();
    if (!support.supported) {
      throw new Error(`Browser not supported: ${support.missing.join(', ')}`);
    }

    // Check file size
    const sizeCheck = isFileSizeSafe(blob.size);
    if (!sizeCheck.safe && sizeCheck.warning) {
      console.warn(sizeCheck.warning);
    }

    const arrayBuffer = await blob.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });

    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
      compress: true, // Enable compression
    });

    let isFirstSheet = true;
    const browser = detectBrowser();
    const scale = browser.mobile ? 1.0 : 1.5; // Lower scale for mobile

    for (const sheetName of workbook.SheetNames) {
      const worksheet = workbook.Sheets[sheetName];
      const html = XLSX.utils.sheet_to_html(worksheet);

      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.width = '297mm';
      container.style.padding = '10mm';
      container.innerHTML = html;

      const table = container.querySelector('table');
      if (table) {
        table.style.width = '100%';
        table.style.borderCollapse = 'collapse';
        table.style.fontSize = browser.mobile ? '8pt' : '10pt'; // Smaller font on mobile
        const cells = table.querySelectorAll('td, th');
        cells.forEach((cell: any) => {
          cell.style.border = '1px solid #000';
          cell.style.padding = '4px';
        });
      }

      document.body.appendChild(container);

      const canvas = await html2canvas(container, {
        scale: scale,
        logging: false,
        backgroundColor: '#ffffff',
        allowTaint: true,
      });

      document.body.removeChild(container);

      if (!isFirstSheet) {
        pdf.addPage();
      }
      isFirstSheet = false;

      const imgData = canvas.toDataURL('image/jpeg', 0.85); // JPEG for smaller size
      const imgWidth = 277;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.text(sheetName, 10, 10);
      pdf.addImage(imgData, 'JPEG', 10, 15, imgWidth, Math.min(imgHeight, 180));
    }

    return pdf.output('blob');
  } catch (error: any) {
    throw new Error(`Excel conversion failed: ${error.message}`);
  }
}

/**
 * Main conversion dispatcher (client-side)
 */
export async function convertToPDF(blob: Blob, fileName: string, mimeType: string): Promise<Blob> {
  const conversionType = getConversionType(mimeType);

  switch (conversionType) {
    case 'image-pdf':
      return imageToPDF(blob, fileName);
    case 'text-pdf':
      return textToPDF(blob, fileName);
    case 'csv-pdf':
      return csvToSimplePDF(blob);
    case 'office-pdf':
      // Handle Office documents
      if (mimeType === 'application/msword' || 
          mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        return wordToPDF(blob);
      }
      if (mimeType === 'application/vnd.ms-excel' || 
          mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        return excelToPDF(blob);
      }
      // PowerPoint not supported
      if (mimeType === 'application/vnd.ms-powerpoint' || 
          mimeType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
        throw new Error('PowerPoint conversion is currently unavailable. Please convert your file manually at https://www.ilovepdf.com/powerpoint_to_pdf');
      }
      throw new Error('Office conversion not supported for this file type');
    default:
      throw new Error(`Unsupported file type: ${mimeType}`);
  }
}

/**
 * Helper: get friendly conversion label
 */
export function getConversionLabel(mimeType: string): string {
  const labels: Record<string, string> = {
    'image/jpeg': 'JPEG Image',
    'image/png': 'PNG Image',
    'image/webp': 'WebP Image',
    'image/gif': 'GIF Image',
    'text/plain': 'Text File',
    'text/markdown': 'Markdown',
    'text/csv': 'CSV Spreadsheet',
    'application/msword': 'Word Document',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word Document (DOCX)',
    'application/vnd.ms-excel': 'Excel Spreadsheet',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel Spreadsheet (XLSX)',
    'application/vnd.ms-powerpoint': 'PowerPoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PowerPoint (PPTX)',
  };

  return labels[mimeType] || mimeType;
}
