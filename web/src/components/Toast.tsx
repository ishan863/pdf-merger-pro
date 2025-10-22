import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaCheck, FaExclamationTriangle, FaInfo, FaTimes } from 'react-icons/fa';

export interface ToastProps {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, duration = 3000, onClose }) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (duration === Infinity) return;

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);

      if (remaining === 0) {
        clearInterval(interval);
        onClose();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [duration, onClose]);

  const config = {
    success: {
      icon: FaCheck,
      bgColor: 'bg-green-500',
      textColor: 'text-white',
      progressColor: 'bg-green-700',
    },
    error: {
      icon: FaTimes,
      bgColor: 'bg-red-500',
      textColor: 'text-white',
      progressColor: 'bg-red-700',
    },
    warning: {
      icon: FaExclamationTriangle,
      bgColor: 'bg-yellow-500',
      textColor: 'text-white',
      progressColor: 'bg-yellow-700',
    },
    info: {
      icon: FaInfo,
      bgColor: 'bg-blue-500',
      textColor: 'text-white',
      progressColor: 'bg-blue-700',
    },
  };

  const { icon: Icon, bgColor, textColor, progressColor } = config[type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -50, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
      className={`${bgColor} ${textColor} rounded-lg shadow-lg overflow-hidden max-w-md w-full pointer-events-auto`}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start gap-3 p-4">
        <div className="flex-shrink-0 mt-0.5">
          <Icon size={20} />
        </div>
        <p className="flex-1 text-sm font-medium">{message}</p>
        <button
          onClick={onClose}
          className="flex-shrink-0 hover:opacity-75 transition"
          aria-label="Close notification"
        >
          <FaTimes size={16} />
        </button>
      </div>
      {duration !== Infinity && (
        <div className="h-1 bg-black/20">
          <motion.div
            className={`h-full ${progressColor}`}
            initial={{ width: '100%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.05, ease: 'linear' }}
          />
        </div>
      )}
    </motion.div>
  );
};

export default Toast;
