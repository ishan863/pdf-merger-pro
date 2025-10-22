import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Modal from './Modal';
import { FaServer, FaClock, FaLock } from 'react-icons/fa6';
import toast from 'react-hot-toast';

interface ConversionConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConsent: (consent: boolean) => void;
  fileName: string;
  fileType: string;
  fileSize: number;
}

export const ConversionConsentModal: React.FC<ConversionConsentModalProps> = ({
  isOpen,
  onClose,
  onConsent,
  fileName,
  fileType,
  fileSize,
}) => {
  const [accepted, setAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleConsent = async () => {
    if (!accepted) {
      toast.error('Please accept the terms to proceed');
      return;
    }

    try {
      setIsLoading(true);
      onConsent(true);
      toast.success(`Preparing to convert ${fileName}...`);
      onClose();
    } catch (error) {
      toast.error('Failed to process consent');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecline = () => {
    onConsent(false);
    onClose();
  };

  const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(2);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleDecline}
      title="Server-Side File Conversion"
      size="lg"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* File Info */}
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm font-semibold text-gray-700 mb-2">File Details</p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Name:</span>
              <p className="font-mono text-gray-900 truncate">{fileName}</p>
            </div>
            <div>
              <span className="text-gray-600">Type:</span>
              <p className="font-semibold text-gray-900">{fileType.toUpperCase()}</p>
            </div>
            <div>
              <span className="text-gray-600">Size:</span>
              <p className="font-semibold text-gray-900">{fileSizeMB} MB</p>
            </div>
            <div>
              <span className="text-gray-600">Status:</span>
              <p className="font-semibold text-orange-600">Requires Server Processing</p>
            </div>
          </div>
        </div>

        {/* Explanation */}
        <div className="space-y-4">
          <p className="text-sm text-gray-700 leading-relaxed">
            This file type requires <strong>server-side processing</strong> to convert to PDF with high fidelity.
            Your file will be securely uploaded to our servers, converted, and then deleted.
          </p>

          {/* Key Points */}
          <div className="space-y-3">
            <motion.div
              whileHover={{ x: 4 }}
              className="flex gap-3 items-start p-3 bg-green-50 rounded-lg border border-green-200"
            >
              <FaLock className="text-green-600 mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold text-green-900 text-sm">End-to-End Encrypted</p>
                <p className="text-xs text-green-800">Your file is encrypted during upload and storage.</p>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ x: 4 }}
              className="flex gap-3 items-start p-3 bg-blue-50 rounded-lg border border-blue-200"
            >
              <FaClock className="text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold text-blue-900 text-sm">Automatic Deletion</p>
                <p className="text-xs text-blue-800">Files are automatically deleted 1 hour after conversion.</p>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ x: 4 }}
              className="flex gap-3 items-start p-3 bg-purple-50 rounded-lg border border-purple-200"
            >
              <FaServer className="text-purple-600 mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold text-purple-900 text-sm">No Logs Retained</p>
                <p className="text-xs text-purple-800">We do not retain processing logs or metadata.</p>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ x: 4 }}
              className="flex gap-3 items-start p-3 bg-amber-50 rounded-lg border border-amber-200"
            >
              <FaLock className="text-amber-600 mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold text-amber-900 text-sm">Privacy Policy</p>
                <p className="text-xs text-amber-800">
                  See our <a href="/privacy" target="_blank" className="underline font-semibold">Privacy Policy</a> and{' '}
                  <a href="/terms" target="_blank" className="underline font-semibold">Terms of Service</a>.
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Consent Checkbox */}
        <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
          <input
            type="checkbox"
            id="consent"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="w-5 h-5 mt-1 cursor-pointer accent-blue-600"
          />
          <label htmlFor="consent" className="text-sm text-gray-700 cursor-pointer">
            I understand that my file will be uploaded to the server for conversion. I accept the privacy terms
            and consent to this process. <span className="text-red-600 font-semibold">*</span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleDecline}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg font-semibold hover:bg-gray-300 transition"
          >
            Decline
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleConsent}
            disabled={!accepted || isLoading}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Processing...' : 'Accept & Convert'}
          </motion.button>
        </div>

        {/* Additional Info */}
        <div className="text-xs text-gray-500 text-center">
          <p>By clicking "Accept & Convert", you confirm that you have permission to process this file.</p>
        </div>
      </motion.div>
    </Modal>
  );
};

export default ConversionConsentModal;
