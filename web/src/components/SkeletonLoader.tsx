import React from 'react';
import { motion } from 'framer-motion';

interface SkeletonLoaderProps {
  variant?: 'text' | 'rect' | 'circle' | 'thumbnail';
  width?: string;
  height?: string;
  count?: number;
  className?: string;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  variant = 'text',
  width = '100%',
  height,
  count = 1,
  className = '',
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'text':
        return 'h-4 rounded';
      case 'rect':
        return 'rounded-lg';
      case 'circle':
        return 'rounded-full';
      case 'thumbnail':
        return 'rounded-lg aspect-[1/1.4]';
      default:
        return 'rounded';
    }
  };

  const skeletonElement = (
    <motion.div
      className={`bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 ${getVariantClasses()} ${className}`}
      style={{
        width: variant === 'circle' ? height : width,
        height: height || (variant === 'text' ? '1rem' : undefined),
        backgroundSize: '200% 100%',
      }}
      animate={{
        backgroundPosition: ['200% 0', '-200% 0'],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'linear',
      }}
    />
  );

  if (count === 1) {
    return skeletonElement;
  }

  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="mb-2 last:mb-0">
          {skeletonElement}
        </div>
      ))}
    </>
  );
};

export default SkeletonLoader;
