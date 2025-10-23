// Test Office Conversions
// Quick test to verify mammoth and xlsx packages are working

console.log('Testing Office conversion packages...');

// Test mammoth (Word processing)
try {
  const mammoth = require('mammoth');
  console.log('✓ Mammoth package loaded successfully');
  
  // Test basic functionality
  const testWordBuffer = Buffer.from('test');
  mammoth.extractRawText({ buffer: testWordBuffer }).then(() => {
    console.log('✓ Mammoth extractRawText function available');
  }).catch((error) => {
    console.log('! Mammoth test with dummy data failed (expected):', error.message);
  });
  
} catch (error) {
  console.log('✗ Mammoth package failed to load:', error.message);
}

// Test XLSX (Excel processing)
try {
  const XLSX = require('xlsx');
  console.log('✓ XLSX package loaded successfully');
  
  // Test basic functionality
  const testWorkbook = XLSX.utils.book_new();
  const testWorksheet = XLSX.utils.aoa_to_sheet([['A1', 'B1'], ['A2', 'B2']]);
  XLSX.utils.book_append_sheet(testWorkbook, testWorksheet, 'TestSheet');
  
  const jsonData = XLSX.utils.sheet_to_json(testWorksheet, { header: 1 });
  console.log('✓ XLSX conversion test passed:', jsonData);
  
} catch (error) {
  console.log('✗ XLSX package failed to load:', error.message);
}

// Test jsPDF
try {
  const { jsPDF } = require('jspdf');
  console.log('✓ jsPDF package loaded successfully');
  
  const doc = new jsPDF();
  doc.text('Test PDF', 10, 10);
  const pdfOutput = doc.output('datauristring');
  console.log('✓ jsPDF test passed, output length:', pdfOutput.length);
  
} catch (error) {
  console.log('✗ jsPDF package failed:', error.message);
}

console.log('Package testing complete!');