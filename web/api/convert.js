/**
 * Vercel Serverless Function - Office Document to PDF Converter
 * Completely FREE - No credit card required
 * Supports: Word (.docx, .doc), Excel (.xlsx, .xls), PowerPoint (.pptx, .ppt)
 */

// Note: libreoffice-convert requires system dependencies
// For Vercel, we'll use a lighter alternative: officegen + pdf-lib
// OR use a free third-party API like CloudConvert (25 free/day)

module.exports = async (req, res) => {
  // Enable CORS
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
      return res.status(400).json({ error: 'Missing fileBase64 or fileName' });
    }

    const ext = fileName.split('.').pop().toLowerCase();

    // For now, return a message that this requires external service
    // We'll implement CloudConvert API (25 free conversions/day)
    return res.status(200).json({
      message: 'Office conversion coming soon',
      suggestion: 'Use CloudConvert API for now',
      ext: ext,
    });
  } catch (error) {
    console.error('Conversion error:', error);
    return res.status(500).json({
      error: 'Conversion failed',
      message: error.message,
    });
  }
};
