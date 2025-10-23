/**
 * Browser Compatibility Checker Component
 * Shows warnings for unsupported browsers or mobile devices
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertTriangle, FiX, FiSmartphone, FiMonitor } from 'react-icons/fi';
import { detectBrowser, getBrowserWarning, getRecommendedFileSizeLimit } from '@/utils/browserCompat';

const BrowserCompatChecker: React.FC = () => {
  const [warning, setWarning] = useState<string | null>(null);
  const [showWarning, setShowWarning] = useState(true);
  const [browserInfo, setBrowserInfo] = useState<{
    mobile: boolean;
    fileSizeLimit: number;
  } | null>(null);

  useEffect(() => {
    const warningMessage = getBrowserWarning();
    const browser = detectBrowser();
    const limit = getRecommendedFileSizeLimit();

    setWarning(warningMessage);
    setBrowserInfo({
      mobile: browser.mobile,
      fileSizeLimit: limit,
    });

    // Hide mobile warning after 10 seconds
    if (warningMessage && browser.mobile) {
      const timer = setTimeout(() => {
        setShowWarning(false);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!warning || !showWarning) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-2xl w-full px-4"
      >
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl shadow-2xl p-4 flex items-start gap-4">
          <div className="flex-shrink-0 mt-1">
            {browserInfo?.mobile ? (
              <FiSmartphone size={24} />
            ) : (
              <FiAlertTriangle size={24} />
            )}
          </div>

          <div className="flex-1">
            <h3 className="font-bold text-lg mb-1">
              {browserInfo?.mobile ? 'Mobile Device Detected' : 'Browser Compatibility'}
            </h3>
            <p className="text-sm opacity-90 mb-2">{warning}</p>
            
            {browserInfo && (
              <div className="bg-white/20 rounded-lg p-2 text-xs">
                <p className="flex items-center gap-2">
                  <FiMonitor size={16} />
                  <span>
                    Recommended file size limit: <strong>{browserInfo.fileSizeLimit}MB</strong>
                  </span>
                </p>
              </div>
            )}
          </div>

          <button
            onClick={() => setShowWarning(false)}
            className="flex-shrink-0 p-1 hover:bg-white/20 rounded-lg transition"
            aria-label="Close warning"
          >
            <FiX size={20} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BrowserCompatChecker;
