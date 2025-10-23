/**
 * Browser Compatibility Utilities
 * Detects browser capabilities and provides fallbacks
 */

export interface BrowserInfo {
  name: string;
  version: string;
  mobile: boolean;
  ios: boolean;
  android: boolean;
  supported: boolean;
}

/**
 * Detect browser information
 */
export function detectBrowser(): BrowserInfo {
  const ua = navigator.userAgent;
  let name = 'Unknown';
  let version = 'Unknown';
  
  // Detect browser
  if (ua.indexOf('Firefox') > -1) {
    name = 'Firefox';
    version = ua.match(/Firefox\/(\d+)/)?.[1] || 'Unknown';
  } else if (ua.indexOf('Chrome') > -1 && ua.indexOf('Edg') === -1) {
    name = 'Chrome';
    version = ua.match(/Chrome\/(\d+)/)?.[1] || 'Unknown';
  } else if (ua.indexOf('Safari') > -1 && ua.indexOf('Chrome') === -1) {
    name = 'Safari';
    version = ua.match(/Version\/(\d+)/)?.[1] || 'Unknown';
  } else if (ua.indexOf('Edg') > -1) {
    name = 'Edge';
    version = ua.match(/Edg\/(\d+)/)?.[1] || 'Unknown';
  }

  // Detect mobile
  const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const ios = /iPhone|iPad|iPod/i.test(ua);
  const android = /Android/i.test(ua);

  // Check if browser is supported (ES2015+, Canvas, FileReader)
  const supported = 
    typeof FileReader !== 'undefined' &&
    typeof HTMLCanvasElement !== 'undefined' &&
    typeof Blob !== 'undefined' &&
    typeof Promise !== 'undefined';

  return {
    name,
    version,
    mobile,
    ios,
    android,
    supported,
  };
}

/**
 * Check if browser supports required features
 */
export function checkBrowserSupport(): {
  supported: boolean;
  missing: string[];
} {
  const missing: string[] = [];

  if (typeof FileReader === 'undefined') {
    missing.push('FileReader API');
  }
  if (typeof HTMLCanvasElement === 'undefined') {
    missing.push('Canvas API');
  }
  if (typeof Blob === 'undefined') {
    missing.push('Blob API');
  }
  if (typeof Promise === 'undefined') {
    missing.push('Promise API');
  }
  if (!window.requestAnimationFrame) {
    missing.push('requestAnimationFrame');
  }

  return {
    supported: missing.length === 0,
    missing,
  };
}

/**
 * Check if device has enough memory for large operations
 */
export function checkMemorySupport(): {
  hasEnoughMemory: boolean;
  estimatedMB: number | null;
} {
  // @ts-ignore - performance.memory is Chrome-specific
  const memory = performance.memory;
  
  if (memory) {
    const usedMB = memory.usedJSHeapSize / (1024 * 1024);
    const limitMB = memory.jsHeapSizeLimit / (1024 * 1024);
    const availableMB = limitMB - usedMB;
    
    return {
      hasEnoughMemory: availableMB > 100, // Need at least 100MB free
      estimatedMB: availableMB,
    };
  }

  // Assume mobile has less memory
  const isMobile = detectBrowser().mobile;
  return {
    hasEnoughMemory: !isMobile, // Desktop assumed to have enough
    estimatedMB: null,
  };
}

/**
 * Get recommended file size limit based on device
 */
export function getRecommendedFileSizeLimit(): number {
  const browser = detectBrowser();
  const memory = checkMemorySupport();

  // Mobile devices: lower limits
  if (browser.mobile) {
    if (browser.ios) return 25; // iOS: 25MB
    if (browser.android) return 30; // Android: 30MB
  }

  // Desktop: check memory
  if (memory.estimatedMB !== null) {
    if (memory.estimatedMB < 100) return 50; // Low memory: 50MB
    if (memory.estimatedMB < 500) return 75; // Medium memory: 75MB
  }

  return 100; // Default: 100MB
}

/**
 * Show browser compatibility warning if needed
 */
export function getBrowserWarning(): string | null {
  const support = checkBrowserSupport();
  const browser = detectBrowser();

  if (!support.supported) {
    return `Your browser is missing required features: ${support.missing.join(', ')}. Please use a modern browser (Chrome, Firefox, Safari, Edge).`;
  }

  if (browser.mobile) {
    return 'Mobile devices may have performance limitations with large files. For best results, use a desktop browser.';
  }

  return null;
}

/**
 * Check if canvas to blob is supported
 */
export function supportsCanvasToBlob(): boolean {
  const canvas = document.createElement('canvas');
  return typeof canvas.toBlob === 'function';
}

/**
 * Polyfill for canvas.toBlob if not supported
 */
export function canvasToBlobPolyfill(canvas: HTMLCanvasElement, callback: (blob: Blob | null) => void, mimeType = 'image/png', quality = 1): void {
  if (canvas.toBlob) {
    canvas.toBlob(callback, mimeType, quality);
    return;
  }

  // Fallback for older browsers
  const dataURL = canvas.toDataURL(mimeType, quality);
  const binary = atob(dataURL.split(',')[1]);
  const array = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    array[i] = binary.charCodeAt(i);
  }
  callback(new Blob([array], { type: mimeType }));
}

/**
 * Get optimal canvas scale based on device
 */
export function getOptimalCanvasScale(): number {
  const browser = detectBrowser();
  const pixelRatio = window.devicePixelRatio || 1;

  // Mobile: lower scale to save memory
  if (browser.mobile) {
    return Math.min(pixelRatio, 1.5);
  }

  // Desktop: use device pixel ratio but cap at 3
  return Math.min(pixelRatio, 3);
}

/**
 * Check if file size is safe for this device
 */
export function isFileSizeSafe(fileSizeBytes: number): {
  safe: boolean;
  warning: string | null;
} {
  const fileSizeMB = fileSizeBytes / (1024 * 1024);
  const limit = getRecommendedFileSizeLimit();
  
  if (fileSizeMB > limit) {
    return {
      safe: false,
      warning: `File size (${fileSizeMB.toFixed(1)}MB) exceeds recommended limit for your device (${limit}MB). Conversion may fail or be slow.`,
    };
  }

  return { safe: true, warning: null };
}
