import React from 'react';
import { motion } from 'framer-motion';

const LoadingScreen: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary-50 to-accent-50">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <motion.div
          className="w-16 h-16 mx-auto mb-4 rounded-full border-4 border-accent-200 border-t-accent-500"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
        <h2 className="text-xl font-semibold text-primary-900 mb-2">Loading</h2>
        <p className="text-primary-600">Please wait...</p>
      </motion.div>
    </div>
  );
};

export default LoadingScreen;
