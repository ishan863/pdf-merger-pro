// Environment configuration

export const CONFIG = {
  // File size limits (in MB)
  MAX_FILE_SIZE_MB: parseInt(import.meta.env.VITE_MAX_FILE_SIZE_MB || '100'),
  CLIENT_SIDE_THRESHOLD_MB: parseInt(import.meta.env.VITE_CLIENT_SIDE_THRESHOLD_MB || '50'),

  // PDF.js worker path
  PDF_JS_WORKER_URL: '/pdf.worker.min.js',

  // Tesseract.js worker
  TESSERACT_WORKER_URL: 'https://cdn.jsdelivr.net/npm/tesseract.js@v4/dist',

  // Upload configuration
  CHUNK_SIZE: 1024 * 1024, // 1MB chunks for resumable uploads
  MAX_CONCURRENT_UPLOADS: 3,

  // Animation durations (ms)
  ANIMATION_DURATION: 300,
  TRANSITION_DURATION: 200,

  // API endpoints
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001',

  // Feature flags (from env or defaults)
  ENABLE_SERVER_CONVERSION: import.meta.env.VITE_ENABLE_SERVER_CONVERSION === 'true',
  ENABLE_OCR: import.meta.env.VITE_ENABLE_OCR === 'true' || false,
  ENABLE_BLANK_DETECTION: import.meta.env.VITE_ENABLE_BLANK_DETECTION === 'true' || false,
  ENABLE_DUPLICATE_DETECTION: import.meta.env.VITE_ENABLE_DUPLICATE_DETECTION === 'true' || false,
  ENABLE_SESSION_SAVE: import.meta.env.VITE_ENABLE_SESSION_SAVE === 'true' || false,
  ENABLE_COLLABORATION: import.meta.env.VITE_ENABLE_COLLABORATION === 'true' || false,
  ENABLE_SHARE_LINKS: import.meta.env.VITE_ENABLE_SHARE_LINKS === 'true' || false,
  ENABLE_NAVBAR_V2: import.meta.env.VITE_ENABLE_NAVBAR_V2 === 'true' || false,
  ENABLE_SEARCH: import.meta.env.VITE_ENABLE_SEARCH === 'true' || false,
  ENABLE_THEME: import.meta.env.VITE_ENABLE_THEME === 'true' || false,
  ENABLE_ANNOTATIONS: import.meta.env.VITE_ENABLE_ANNOTATIONS === 'true' || false,
  ENABLE_CROP: import.meta.env.VITE_ENABLE_CROP === 'true' || false,
  ENABLE_WATERMARK: true,
  ENABLE_REDACTION: false, // Requires server-side processing
  ENABLE_COMPRESSION: true,
  ENABLE_DIGITAL_SIGNING: false, // Future feature

  // Pagination
  THUMBNAILS_PER_PAGE: 10,
  FILES_PER_PAGE: 20,

  // Cache settings
  CACHE_TTL_MINUTES: 60,
  THUMBNAIL_CACHE_SIZE: 100,

  // Error retry logic
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 1000,

  // Privacy & Consent
  REQUIRE_SERVER_UPLOAD_CONSENT: true,
  CONVERSION_FILE_TTL_MINUTES: 60,
  ENCRYPT_CLOUD_SAVES: true,
};

export default CONFIG;

