/**
 * Feature Flags for Dashboard 2.0 and production features
 * Control gradual rollout and A/B testing of new functionality
 */

export const FEATURE_FLAGS = {
  // Phase 1: Conversion & Advanced UX
  SERVER_SIDE_CONVERSION: process.env.VITE_ENABLE_SERVER_CONVERSION === 'true',
  CLIENT_SIDE_IMAGE_CONVERT: true, // Always enabled (fast, no server)
  CLIENT_SIDE_TEXT_CONVERT: true, // Always enabled (fast, no server)

  // Phase 2: OCR & Smart Checks
  OCR_ENABLED: process.env.VITE_ENABLE_OCR === 'true',
  BLANK_PAGE_DETECTION: process.env.VITE_ENABLE_BLANK_DETECTION === 'true',
  DUPLICATE_DETECTION: process.env.VITE_ENABLE_DUPLICATE_DETECTION === 'true',

  // Phase 3: Sessions & Collaboration
  SESSION_CLOUD_SAVE: process.env.VITE_ENABLE_SESSION_SAVE === 'true',
  COLLABORATION: process.env.VITE_ENABLE_COLLABORATION === 'true',
  SHARE_LINKS: process.env.VITE_ENABLE_SHARE_LINKS === 'true',

  // Dashboard 2.0 UI
  GLASSMORPHIC_NAVBAR: process.env.VITE_ENABLE_NAVBAR_V2 === 'true',
  CTRL_K_SEARCH: process.env.VITE_ENABLE_SEARCH === 'true',
  THEME_TOGGLE: process.env.VITE_ENABLE_THEME === 'true',

  // Annotations
  ANNOTATIONS: process.env.VITE_ENABLE_ANNOTATIONS === 'true',
  CROP_TOOL: process.env.VITE_ENABLE_CROP === 'true',
};

/**
 * Get list of enabled features (for debugging/logging)
 */
export function getEnabledFeatures(): string[] {
  return Object.entries(FEATURE_FLAGS)
    .filter(([_, enabled]) => enabled)
    .map(([name]) => name);
}

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(feature: keyof typeof FEATURE_FLAGS): boolean {
  return FEATURE_FLAGS[feature] ?? false;
}

/**
 * Privacy & Consent settings
 */
export const PRIVACY_SETTINGS = {
  // Require explicit consent for server uploads
  REQUIRE_SERVER_UPLOAD_CONSENT: true,
  
  // Auto-delete uploaded files after conversion (minutes)
  CONVERSION_FILE_TTL: 60,
  
  // Encrypt cloud-saved sessions
  ENCRYPT_CLOUD_SAVES: true,
  
  // Maximum file size for client-side processing (MB)
  CLIENT_PROCESSING_LIMIT_MB: 50,
  
  // Maximum file size for server processing (MB)
  SERVER_PROCESSING_LIMIT_MB: 100,
  
  // Retention policy for conversion logs (days)
  LOG_RETENTION_DAYS: 7,
  
  // Enable data export (GDPR)
  ENABLE_DATA_EXPORT: true,
  
  // Enable data deletion (GDPR)
  ENABLE_DATA_DELETION: true,
};

/**
 * Consent types that can be tracked
 */
export enum ConsentType {
  SERVER_CONVERSION = 'server_conversion',
  CLOUD_SAVE = 'cloud_save',
  COLLABORATION = 'collaboration',
  ANALYTICS = 'analytics',
  COOKIES = 'cookies',
}

/**
 * User consent state (stored in Firestore per user)
 */
export interface UserConsents {
  userId: string;
  [ConsentType.SERVER_CONVERSION]: boolean;
  [ConsentType.CLOUD_SAVE]: boolean;
  [ConsentType.COLLABORATION]: boolean;
  [ConsentType.ANALYTICS]: boolean;
  [ConsentType.COOKIES]: boolean;
  lastUpdated: Date;
}
