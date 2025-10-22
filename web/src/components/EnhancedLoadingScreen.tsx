import React from 'react';
import { motion } from 'framer-motion';

interface EnhancedLoadingScreenProps {
  message?: string;
  progress?: number; // 0-100
  subMessage?: string;
}

const EnhancedLoadingScreen: React.FC<EnhancedLoadingScreenProps> = ({
  message = 'Loading...',
  progress,
  subMessage = 'Please wait',
}) => {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[300px] bg-gradient-to-br from-primary-50 via-white to-accent-50 rounded-lg border-2 border-dashed border-primary-200 p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-sm"
      >
        {/* Animated Logo/Icon */}
        <motion.div
          animate={{ 
            rotate: 360,
          }}
          transition={{ 
            rotate: { duration: 2, repeat: Infinity, ease: 'linear' },
          }}
          className="w-16 h-16 mx-auto mb-4"
        >
          <div className="w-full h-full bg-gradient-to-br from-primary-600 to-accent-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
            📄
          </div>
        </motion.div>

        {/* Message */}
        <h3 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent mb-2">
          {message}
        </h3>

        <p className="text-sm text-gray-600 mb-4">
          {subMessage}
        </p>

        {/* Progress Bar */}
        <div className="w-full max-w-xs mx-auto mb-3">
          {progress !== undefined ? (
            <>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-gradient-to-r from-primary-500 to-accent-500"
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1.5">{progress}% complete</p>
            </>
          ) : (
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                className="h-full w-1/3 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"
              />
            </div>
          )}
        </div>

        {/* Animated Dots */}
        <div className="flex justify-center gap-1.5 mb-4">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ 
                scale: [1, 1.3, 1],
                opacity: [0.4, 1, 0.4]
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.15,
                ease: 'easeInOut'
              }}
              className="w-1.5 h-1.5 bg-primary-500 rounded-full"
            />
          ))}
        </div>

        {/* Tips - Smaller and simpler */}
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-xs text-blue-700">
            💡 Tip: Use <kbd className="px-1.5 py-0.5 bg-blue-100 rounded text-xs font-mono">R</kbd> to rotate, <kbd className="px-1.5 py-0.5 bg-blue-100 rounded text-xs font-mono">D</kbd> to delete
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default EnhancedLoadingScreen;
