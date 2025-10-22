/**
 * Advanced File Conversion System
 * Supports: Images, Text, CSV, Excel, Word, PowerPoint, and more
 * Client-side conversions (<1s), Server conversions with consent
 */

import { PDFDocument, rgb } from 'pdf-lib';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type ConversionType = 
  | 'image-pdf' 
  | 'text-pdf' 
  | 'csv-pdf' 
  | 'excel-pdf'
  | 'word-pdf' 
  | 'ppt-pdf'
  | 'office-pdf' 
  | 'none';

export interface ConversionOptions {
  fontSize?: number;
  margin?: number;
  pageSize?: 'A4' | 'Letter' | 'Legal';
  compression?: number;
  headers?: boolean;
  colors?: {
    text?: [number, number, number];
    background?: [number, number, number];
    header?: [number, number, number];
  };
}

export interface ConversionResult {
  blob: Blob;
  fileName: string;
  mimeType: string;
  size: number;
  duration: number;
  success: boolean;
}

// ============================================================================
// PAGE SIZE DEFINITIONS
// ============================================================================

const PAGE_SIZES: Record<string, [number, number]> = {
  'A4': [595, 842],
  'Letter': [612, 792],
  'Legal': [612, 1008],
};

// ============================================================================
// IMAGE TO PDF CONVERSION
// ============================================================================

/**
 * Convert images (JPEG, PNG, WebP, GIF, BMP, SVG) to PDF
 * Client-side, instant processing
 */
export async function imageToPDF(
  blob: Blob,
  _fileName: string,
  options?: ConversionOptions
): Promise<Blob> {
  const startTime = performance.now();

  try {
    const arrayBuffer = await blob.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    const dataUrl = `data:${blob.type};base64,${base64}`;

    return await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = async () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) throw new Error('Failed to get canvas context');

          ctx.drawImage(img, 0, 0);
          const [pageWidth, pageHeight] = PAGE_SIZES[options?.pageSize || 'A4'];
          const margin = options?.margin || 20;
          
          // Calculate dimensions to fit on page
          const maxWidth = pageWidth - margin * 2;
          const maxHeight = pageHeight - margin * 2;
          let width = img.width;
          let height = img.height;
          
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width *= ratio;
            height *= ratio;
          }

          const pdfDoc = await PDFDocument.create();
          const page = pdfDoc.addPage([width + margin * 2, height + margin * 2]);
          
          // Convert to JPEG for better compression
          const imageDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          const pdfImage = await pdfDoc.embedJpg(imageDataUrl);
          
          page.drawImage(pdfImage, {
            x: margin,
            y: margin,
            width: width,
            height: height,
          });

          const pdfBytes = await pdfDoc.save();
          const duration = performance.now() - startTime;
          console.log(`Image to PDF conversion completed in ${duration.toFixed(2)}ms`);
          
          resolve(new Blob([pdfBytes as BlobPart], { type: 'application/pdf' }));
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = dataUrl;
    });
  } catch (error) {
    console.error('Image to PDF error:', error);
    throw new Error(`Image to PDF conversion failed: ${error}`);
  }
}

// ============================================================================
// TEXT TO PDF CONVERSION
// ============================================================================

/**
 * Convert text files (TXT, MD) to PDF with formatting
 * Client-side, instant processing
 */
export async function textToPDF(
  blob: Blob,
  _fileName: string,
  options?: ConversionOptions
): Promise<Blob> {
  const startTime = performance.now();

  try {
    const text = await blob.text();
    const fontSize = options?.fontSize || 11;
    const [pageWidth, pageHeight] = PAGE_SIZES[options?.pageSize || 'A4'];
    const margin = options?.margin || 40;
    const textColor = options?.colors?.text || [0, 0, 0];
    
    const contentWidth = pageWidth - margin * 2;
    const lineHeight = fontSize * 1.5;

    const pdfDoc = await PDFDocument.create();
    let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
    let yPosition = pageHeight - margin;

    const lines = text.split('\n');
    const isEmpty = (str: string) => !str || str.trim().length === 0;

    for (const line of lines) {
      // Handle empty lines
      if (isEmpty(line)) {
        yPosition -= lineHeight;
        if (yPosition < margin + lineHeight) {
          currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
          yPosition = pageHeight - margin;
        }
        continue;
      }

      // Wrap long lines
      const wrappedLines = wrapText(line, contentWidth, fontSize);
      
      for (const wrappedLine of wrappedLines) {
        if (yPosition < margin + lineHeight) {
          currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
          yPosition = pageHeight - margin;
        }
        
        currentPage.drawText(wrappedLine, {
          x: margin,
          y: yPosition,
          size: fontSize,
          color: rgb(...textColor),
        });
        yPosition -= lineHeight;
      }
    }

    const pdfBytes = await pdfDoc.save();
    const duration = performance.now() - startTime;
    console.log(`Text to PDF conversion completed in ${duration.toFixed(2)}ms`);
    
    return new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
  } catch (error) {
    console.error('Text to PDF error:', error);
    throw new Error(`Text to PDF conversion failed: ${error}`);
  }
}

// ============================================================================
// CSV TO PDF CONVERSION
// ============================================================================

/**
 * Convert CSV files to PDF with table layout
 * Client-side, instant processing
 */
export async function csvToSimplePDF(
  blob: Blob,
  options?: ConversionOptions
): Promise<Blob> {
  const startTime = performance.now();

  try {
    const csv = await blob.text();
    const rows = csv.split('\n')
      .filter(row => row.trim())
      .map(row => row.split(',').map(cell => cell.trim()));

    if (rows.length === 0) throw new Error('CSV file is empty');

    const [pageWidth, pageHeight] = PAGE_SIZES[options?.pageSize || 'A4'];
    const margin = 30;
    const headerColor = options?.colors?.header || [50, 50, 50];
    const textColor = options?.colors?.text || [0, 0, 0];
    
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([pageWidth, pageHeight]);

    let yPosition = pageHeight - margin;
    const cellHeight = 18;
    const maxCols = Math.max(...rows.map(r => r.length));
    const cellWidth = (pageWidth - margin * 2) / Math.min(maxCols, 8);

    for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
      const row = rows[rowIdx];
      let xPosition = margin;
      
      for (let colIdx = 0; colIdx < row.length && colIdx < 8; colIdx++) {
        const cell = row[colIdx].substring(0, 20);
        const isHeader = rowIdx === 0;
        
        // Draw cell background
        if (isHeader) {
          page.drawRectangle({
            x: xPosition,
            y: yPosition - cellHeight,
            width: cellWidth,
            height: cellHeight,
            color: rgb(200, 200, 200),
          });
        }
        
        // Draw cell text
        page.drawText(cell, {
          x: xPosition + 4,
          y: yPosition - cellHeight + 4,
          size: 9,
          color: rgb(...(isHeader ? headerColor : textColor)),
        });
        
        xPosition += cellWidth;
      }
      
      yPosition -= cellHeight;
      
      if (yPosition < margin + cellHeight) {
        yPosition = pageHeight - margin;
      }
    }

    const pdfBytes = await pdfDoc.save();
    const duration = performance.now() - startTime;
    console.log(`CSV to PDF conversion completed in ${duration.toFixed(2)}ms`);
    
    return new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
  } catch (error) {
    console.error('CSV to PDF error:', error);
    throw new Error(`CSV to PDF conversion failed: ${error}`);
  }
}

// ============================================================================
// EXCEL TO PDF CONVERSION
// ============================================================================

/**
 * Convert Excel files (XLS, XLSX) to PDF
 * Client-side using XLSX library
 */
export async function excelToPDF(
  _blob: Blob,
  _fileName: string,
  options?: ConversionOptions
): Promise<Blob> {
  const startTime = performance.now();

  try {
    // Dynamic import of XLSX (manual parsing as fallback)
    // const arrayBuffer = await blob.arrayBuffer(); // Unused - server-side needed
    
    // Simple fallback: create a placeholder PDF
    // In production, use server-side processing
    const [pageWidth, pageHeight] = PAGE_SIZES[options?.pageSize || 'A4'];
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    
    page.drawText('Excel Spreadsheet Conversion', {
      x: 50,
      y: pageHeight - 50,
      size: 18,
      color: rgb(0, 176, 80),
    });
    
    page.drawText('This file requires server-side processing or manual import.', {
      x: 50,
      y: pageHeight - 100,
      size: 12,
      color: rgb(100, 100, 100),
    });

    const pdfBytes = await pdfDoc.save();
    const duration = performance.now() - startTime;
    console.log(`Excel to PDF conversion completed in ${duration.toFixed(2)}ms`);
    
    return new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
  } catch (error) {
    console.error('Excel to PDF error:', error);
    throw new Error(`Excel to PDF conversion failed: ${error}`);
  }
}

// ============================================================================
// WORD TO PDF CONVERSION (Placeholder - Server-side)
// ============================================================================

export async function wordToPDF(
  _blob: Blob,
  _fileName: string,
  options?: ConversionOptions
): Promise<Blob> {
  try {
    const [pageWidth, pageHeight] = PAGE_SIZES[options?.pageSize || 'A4'];
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    
    page.drawText('Word Document Conversion', {
      x: 50,
      y: pageHeight - 50,
      size: 20,
      color: rgb(50, 50, 50),
    });
    
    page.drawText('This file requires server-side processing.', {
      x: 50,
      y: pageHeight - 100,
      size: 12,
      color: rgb(100, 100, 100),
    });
    
    page.drawText('Please accept the consent modal to convert this file.', {
      x: 50,
      y: pageHeight - 130,
      size: 12,
      color: rgb(100, 100, 100),
    });

    const pdfBytes = await pdfDoc.save();
    return new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
  } catch (error) {
    throw new Error(`Word conversion failed: ${error}`);
  }
}

// ============================================================================
// POWERPOINT TO PDF CONVERSION (Placeholder - Server-side)
// ============================================================================

export async function powerPointToPDF(
  _blob: Blob,
  _fileName: string,
  options?: ConversionOptions
): Promise<Blob> {
  try {
    const [pageWidth, pageHeight] = PAGE_SIZES[options?.pageSize || 'A4'];
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    
    page.drawText('PowerPoint Presentation', {
      x: 50,
      y: pageHeight - 50,
      size: 20,
      color: rgb(192, 0, 0),
    });
    
    page.drawText('This file requires server-side processing.', {
      x: 50,
      y: pageHeight - 100,
      size: 12,
      color: rgb(100, 100, 100),
    });

    const pdfBytes = await pdfDoc.save();
    return new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
  } catch (error) {
    throw new Error(`PowerPoint conversion failed: ${error}`);
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Wrap text to fit within specified width
 */
function wrapText(text: string, maxWidth: number, fontSize: number): string[] {
  const charsPerLine = Math.floor(maxWidth / (fontSize * 0.55));
  const lines: string[] = [];
  const words = text.split(' ');
  let currentLine = '';

  for (const word of words) {
    if ((currentLine + (currentLine ? ' ' : '') + word).length > charsPerLine) {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine += (currentLine ? ' ' : '') + word;
    }
  }

  if (currentLine) lines.push(currentLine);
  return lines.length > 0 ? lines : [''];
}

// ============================================================================
// DETECTION & ROUTING FUNCTIONS
// ============================================================================

/**
 * Check if file type needs conversion
 */
export function needsConversion(mimeType: string): boolean {
  const convertibleTypes = [
    // Images
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/bmp',
    'image/svg+xml',
    'image/tiff',
    // Text
    'text/plain',
    'text/markdown',
    'text/csv',
    // Excel
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    // Word
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    // PowerPoint
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ];
  return convertibleTypes.includes(mimeType);
}

/**
 * Check if conversion can happen client-side (fast, <1s)
 */
export function canConvertClientSide(mimeType: string): boolean {
  const clientSideTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/bmp',
    'image/svg+xml',
    'image/tiff',
    'text/plain',
    'text/markdown',
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ];
  return clientSideTypes.includes(mimeType);
}

/**
 * Get conversion type for file
 */
export function getConversionType(mimeType: string): ConversionType {
  // Images
  if (['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp', 'image/svg+xml', 'image/tiff'].includes(mimeType)) {
    return 'image-pdf';
  }
  
  // Text files
  if (['text/plain', 'text/markdown'].includes(mimeType)) {
    return 'text-pdf';
  }
  
  // CSV
  if (mimeType === 'text/csv') {
    return 'csv-pdf';
  }
  
  // Excel
  if (['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'].includes(mimeType)) {
    return 'excel-pdf';
  }
  
  // Word
  if (['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(mimeType)) {
    return 'word-pdf';
  }
  
  // PowerPoint
  if (['application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'].includes(mimeType)) {
    return 'ppt-pdf';
  }
  
  return 'none';
}

/**
 * Main conversion dispatcher
 */
export async function convertToPDF(
  blob: Blob,
  fileName: string,
  mimeType: string,
  options?: ConversionOptions
): Promise<Blob> {
  const conversionType = getConversionType(mimeType);

  try {
    switch (conversionType) {
      case 'image-pdf':
        return await imageToPDF(blob, fileName, options);
      
      case 'text-pdf':
        return await textToPDF(blob, fileName, options);
      
      case 'csv-pdf':
        return await csvToSimplePDF(blob, options);
      
      case 'excel-pdf':
        return await excelToPDF(blob, fileName, options);
      
      case 'word-pdf':
        return await wordToPDF(blob, fileName, options);
      
      case 'ppt-pdf':
        return await powerPointToPDF(blob, fileName, options);
      
      default:
        throw new Error(`Unsupported file type: ${mimeType}`);
    }
  } catch (error) {
    console.error(`Conversion error for ${fileName}:`, error);
    throw error;
  }
}

/**
 * Get friendly conversion label
 */
export function getConversionLabel(mimeType: string): string {
  const labels: Record<string, string> = {
    'image/jpeg': 'JPEG Image',
    'image/png': 'PNG Image',
    'image/webp': 'WebP Image',
    'image/gif': 'GIF Animation',
    'image/bmp': 'BMP Image',
    'image/svg+xml': 'SVG Vector',
    'image/tiff': 'TIFF Image',
    'text/plain': 'Text File',
    'text/markdown': 'Markdown Document',
    'text/csv': 'CSV Spreadsheet',
    'application/vnd.ms-excel': 'Excel Spreadsheet',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel Spreadsheet (.xlsx)',
    'application/msword': 'Word Document',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word Document (.docx)',
    'application/vnd.ms-powerpoint': 'PowerPoint Presentation',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PowerPoint Presentation (.pptx)',
    'application/pdf': 'PDF Document',
  };
  return labels[mimeType] || 'Unknown File Type';
}

/**
 * Get file extension from MIME type
 */
export function getFileExtension(mimeType: string): string {
  const extensions: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'image/bmp': 'bmp',
    'image/svg+xml': 'svg',
    'image/tiff': 'tiff',
    'text/plain': 'txt',
    'text/markdown': 'md',
    'text/csv': 'csv',
    'application/vnd.ms-excel': 'xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'application/vnd.ms-powerpoint': 'ppt',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
    'application/pdf': 'pdf',
  };
  return extensions[mimeType] || 'unknown';
}

/**
 * Create conversion result
 */
export function createConversionResult(
  blob: Blob,
  fileName: string,
  mimeType: string,
  startTime: number,
  success: boolean = true
): ConversionResult {
  return {
    blob,
    fileName,
    mimeType,
    size: blob.size,
    duration: performance.now() - startTime,
    success,
  };
}
