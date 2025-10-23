/**
 * PDF Converter Firebase Functions
 * Converts Office documents (Word, Excel, PowerPoint) to PDF
 */

const {onCall} = require("firebase-functions/v2/https");
const {setGlobalOptions} = require("firebase-functions/v2");
const logger = require("firebase-functions/logger");
const libre = require("libreoffice-convert");
const {promisify} = require("util");

// Convert libre callback to promise
const convertAsync = promisify(libre.convert);

// Set global options for cost control
setGlobalOptions({
  maxInstances: 10,
  region: "us-central1",
});

/**
 * Convert Office document to PDF
 * Accepts: Word (.docx, .doc), Excel (.xlsx, .xls), PowerPoint (.pptx, .ppt)
 * Returns: PDF as base64 string
 */
exports.convertDocument = onCall({
  timeoutSeconds: 300, // 5 minutes for large files
  memory: "1GiB",
  cors: true,
}, async (request) => {
  const fileName = request.data && request.data.fileName ?
    request.data.fileName : "unknown";
  logger.info("Convert document request received", {
    fileName: fileName,
  });

  try {
    const {fileBase64} = request.data;

    // Validate input
    if (!fileBase64 || !fileName) {
      logger.error("Missing required fields");
      throw new Error("Missing fileBase64 or fileName");
    }

    // Get file extension
    const fileNameParts = fileName.split(".");
    const ext = fileNameParts[fileNameParts.length - 1].toLowerCase();
    logger.info("File extension detected", {ext});

    // Validate file type
    const validExtensions = ["doc", "docx", "xls", "xlsx", "ppt", "pptx"];
    if (!validExtensions.includes(ext)) {
      throw new Error(`Unsupported file type: .${ext}`);
    }

    // Map extension to LibreOffice format
    const formatMap = {
      "doc": ".doc",
      "docx": ".docx",
      "xls": ".xls",
      "xlsx": ".xlsx",
      "ppt": ".ppt",
      "pptx": ".pptx",
    };

    // Convert base64 to buffer
    const inputBuffer = Buffer.from(fileBase64, "base64");
    logger.info("Input buffer size", {bytes: inputBuffer.length});

    // Convert to PDF using LibreOffice
    const pdfBuffer = await convertAsync(
        inputBuffer,
        formatMap[ext],
        undefined,
    );

    logger.info("Conversion successful", {
      inputSize: inputBuffer.length,
      outputSize: pdfBuffer.length,
    });

    // Return PDF as base64
    return {
      success: true,
      pdf: pdfBuffer.toString("base64"),
      fileName: fileName.replace(/\.[^.]+$/, ".pdf"),
      inputSize: inputBuffer.length,
      outputSize: pdfBuffer.length,
    };
  } catch (error) {
    logger.error("Conversion failed", {
      error: error.message,
      stack: error.stack,
    });

    throw new Error(`Conversion failed: ${error.message}`);
  }
});

/**
 * Health check endpoint
 */
exports.healthCheck = onCall({
  timeoutSeconds: 10,
  cors: true,
}, async (request) => {
  return {
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  };
});
