/**
 * Client-Side Office Document Converter (100% FREE - UNLIMITED)
 * Converts Word, Excel, PowerPoint to PDF in the browser
 * No server required, no API limits, completely private
 */

import mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Convert Word document to PDF
 * Uses: Mammoth.js (extracts HTML) + jsPDF (converts to PDF)
 */
export async function convertWordToPDF(file: File): Promise<Blob> {
  try {
    // Read file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // Extract HTML from Word document
    const result = await mammoth.convertToHtml({ arrayBuffer });
    const html = result.value;

    // Create temporary container
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.width = '210mm'; // A4 width
    container.style.padding = '20mm';
    container.style.fontFamily = 'Arial, sans-serif';
    container.style.fontSize = '12pt';
    container.style.lineHeight = '1.5';
    container.style.color = '#000000';
    container.style.backgroundColor = '#ffffff';
    container.innerHTML = html;
    document.body.appendChild(container);

    // Convert HTML to canvas
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    // Remove temporary container
    document.body.removeChild(container);

    // Create PDF from canvas
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    // Add first page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= 297; // A4 height in mm

    // Add additional pages if needed
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= 297;
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
 * Uses: SheetJS (reads Excel) + jsPDF (converts to PDF)
 */
export async function convertExcelToPDF(file: File): Promise<Blob> {
  try {
    // Read Excel file
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });

    // Create PDF
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    let isFirstSheet = true;

    // Process each sheet
    for (const sheetName of workbook.SheetNames) {
      const worksheet = workbook.Sheets[sheetName];

      // Convert to HTML
      const html = XLSX.utils.sheet_to_html(worksheet, {
        header: '',
        footer: '',
      });

      // Create temporary container
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.width = '297mm'; // A4 landscape width
      container.style.padding = '10mm';
      container.innerHTML = html;

      // Style the table
      const table = container.querySelector('table');
      if (table) {
        table.style.width = '100%';
        table.style.borderCollapse = 'collapse';
        table.style.fontSize = '10pt';
        table.style.fontFamily = 'Arial, sans-serif';

        const cells = table.querySelectorAll('td, th');
        cells.forEach((cell: any) => {
          cell.style.border = '1px solid #000';
          cell.style.padding = '4px';
        });
      }

      document.body.appendChild(container);

      // Convert to canvas
      const canvas = await html2canvas(container, {
        scale: 1.5,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      document.body.removeChild(container);

      // Add page to PDF
      if (!isFirstSheet) {
        pdf.addPage();
      }
      isFirstSheet = false;

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 277; // A4 landscape width minus margins
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.text(sheetName, 10, 10); // Sheet name as header
      pdf.addImage(imgData, 'PNG', 10, 15, imgWidth, imgHeight);
    }

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
