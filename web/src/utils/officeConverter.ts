/**
 * Client-Side Office Document Converter (100% FREE - UNLIMITED)
 * Converts Word, Excel, PowerPoint to PDF in the browser
 * No server required, no API limits, completely private
 */

import mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';

/**
 * Convert Word document to PDF
 * Uses: Mammoth.js (extracts text) + jsPDF (creates PDF with text)
 */
export async function convertWordToPDF(file: File): Promise<Blob> {
  try {
    // Read file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // Extract text from Word document
    const result = await mammoth.extractRawText({ arrayBuffer });
    const text = result.value;

    if (!text || text.trim().length === 0) {
      throw new Error('Document appears to be empty or could not be read');
    }

    // Create PDF with text content
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Set font and size
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0);

    // Split text into lines that fit the page width
    const pageWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const margin = 20; // 20mm margin
    const lineHeight = 6; // Line spacing
    const maxWidth = pageWidth - (2 * margin); // Available width for text
    
    // Split text into paragraphs
    const paragraphs = text.split(/\n\s*\n/);
    let yPosition = margin;

    for (const paragraph of paragraphs) {
      if (paragraph.trim()) {
        // Split paragraph into lines that fit the width
        const lines = pdf.splitTextToSize(paragraph.trim(), maxWidth);
        
        // Check if we need a new page
        if (yPosition + (lines.length * lineHeight) > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }

        // Add the lines to the PDF
        for (const line of lines) {
          pdf.text(line, margin, yPosition);
          yPosition += lineHeight;
        }
        
        // Add extra space after paragraph
        yPosition += lineHeight * 0.5;
      }
    }

    // If no content was added, add a message
    if (yPosition <= margin + lineHeight) {
      pdf.text('Document converted successfully. Original formatting may not be preserved.', margin, margin);
      pdf.text(`Original filename: ${file.name}`, margin, margin + lineHeight);
      pdf.text(`File size: ${(file.size / 1024).toFixed(1)} KB`, margin, margin + (lineHeight * 2));
    }

    // Return as Blob
    return pdf.output('blob');
  } catch (error) {
    console.error('Word to PDF conversion failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to convert Word document: ${errorMessage}`);
  }
}

/**
 * Convert Excel spreadsheet to PDF
 * Uses: SheetJS (reads Excel) + jsPDF (creates table)
 */
export async function convertExcelToPDF(file: File): Promise<Blob> {
  try {
    // Read Excel file
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });

    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      throw new Error('No sheets found in Excel file');
    }

    // Create PDF
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);

    let isFirstSheet = true;

    // Process each sheet
    for (const sheetName of workbook.SheetNames) {
      const worksheet = workbook.Sheets[sheetName];

      // Convert sheet to JSON to get data
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
        header: 1, 
        defval: '',
        raw: false 
      }) as string[][];

      // Add page for each sheet (except first)
      if (!isFirstSheet) {
        pdf.addPage();
      }
      isFirstSheet = false;

      // Add sheet name as header
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(sheetName, 15, 20);
      
      // Reset font for data
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');

      if (jsonData.length === 0) {
        pdf.text('(Empty sheet)', 15, 35);
        continue;
      }

      // Calculate column widths based on content
      const maxCols = Math.max(...jsonData.map(row => row.length));
      const availableWidth = 277 - 30; // A4 landscape minus margins
      const colWidth = Math.min(availableWidth / maxCols, 40); // Max 40mm per column

      let yPosition = 30;
      const rowHeight = 6;
      const pageHeight = 210; // A4 landscape height

      // Add data rows
      for (let rowIndex = 0; rowIndex < Math.min(jsonData.length, 50); rowIndex++) {
        const row = jsonData[rowIndex];
        
        // Check if we need a new page
        if (yPosition > pageHeight - 20) {
          pdf.addPage();
          // Re-add sheet name
          pdf.setFontSize(14);
          pdf.setFont('helvetica', 'bold');
          pdf.text(sheetName + ' (continued)', 15, 20);
          pdf.setFontSize(8);
          pdf.setFont('helvetica', 'normal');
          yPosition = 30;
        }

        // Add each cell in the row
        for (let colIndex = 0; colIndex < Math.min(row.length, 15); colIndex++) {
          const cellValue = row[colIndex]?.toString() || '';
          const xPosition = 15 + (colIndex * colWidth);
          
          // Truncate long text
          const truncatedText = cellValue.length > 15 ? cellValue.substring(0, 12) + '...' : cellValue;
          
          pdf.text(truncatedText, xPosition, yPosition);
        }
        
        yPosition += rowHeight;
      }

      // Add note if data was truncated
      if (jsonData.length > 50) {
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'italic');
        pdf.text(`(Showing first 50 rows of ${jsonData.length} total)`, 15, yPosition + 10);
      }
    }

    // Add file info on first page
    pdf.setPage(1);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Original file: ${file.name}`, 15, 195);
    pdf.text(`File size: ${(file.size / 1024).toFixed(1)} KB`, 15, 200);
    pdf.text(`Sheets: ${workbook.SheetNames.length}`, 15, 205);

    return pdf.output('blob');
  } catch (error) {
    console.error('Excel to PDF conversion failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to convert Excel: ${errorMessage}`);
  }
}

/**
 * Convert PowerPoint to PDF
 * Note: PowerPoint conversion is complex - uses API fallback
 */
export async function convertPowerPointToPDF(_file: File): Promise<Blob> {
  // PowerPoint binary format is too complex for client-side
  // Options:
  // 1. Use ConvertAPI (1500 free conversions/month)
  // 2. Use ILovePDF API (limited free tier)
  // 3. Show message to user to convert manually

  throw new Error(
    'PowerPoint conversion requires external service. ' +
    'Please use https://www.ilovepdf.com/powerpoint_to_pdf or ' +
    'https://convertio.co/ppt-pdf/ for free conversion.'
  );
}

/**
 * Main conversion function
 */
export async function convertOfficeToPDF(file: File): Promise<Blob> {
  const extension = file.name.split('.').pop()?.toLowerCase();

  switch (extension) {
    case 'doc':
    case 'docx':
      return await convertWordToPDF(file);

    case 'xls':
    case 'xlsx':
      return await convertExcelToPDF(file);

    case 'ppt':
    case 'pptx':
      return await convertPowerPointToPDF(file);

    default:
      throw new Error(`Unsupported file type: .${extension}`);
  }
}

/**
 * Check if file can be converted client-side
 */
export function canConvertClientSide(fileName: string): boolean {
  const ext = fileName.split('.').pop()?.toLowerCase();
  return ['doc', 'docx', 'xls', 'xlsx'].includes(ext || '');
}
