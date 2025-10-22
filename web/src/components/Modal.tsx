import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaX } from 'react-icons/fa6';

interface ModalProps {
  isOpen: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  actions?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'danger' | 'secondary';
    disabled?: boolean;
    loading?: boolean;
  }[];
  size?: 'sm' | 'md' | 'lg';
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  title,
  children,
  onClose,
  actions = [],
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
  };

  const variantClasses = {
    primary: 'btn-primary',
    danger: 'bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition',
    secondary: 'btn-secondary',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl z-50 w-full mx-4 ${sizeClasses[size]}`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">{title}</h2>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded transition"
                aria-label="Close modal"
              >
                <FaX size={18} className="text-gray-600" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 max-h-96 overflow-y-auto">{children}</div>

            {/* Footer with Actions */}
            {actions.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl flex items-center justify-end gap-3">
                {actions.map((action, idx) => (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      action.onClick();
                    }}
                    disabled={action.disabled}
                    className={`${variantClasses[action.variant || 'secondary']} ${action.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {action.loading ? 'Processing...' : action.label}
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Modal;
