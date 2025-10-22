import React from 'react';

const NotFoundPage: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary-50 to-accent-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-accent-500 mb-4">404</h1>
        <h2 className="text-3xl font-semibold text-primary-900 mb-2">Page Not Found</h2>
        <p className="text-primary-600 mb-8">The page you're looking for doesn't exist.</p>
        <a
          href="/"
          className="btn-primary"
        >
          Go Home
        </a>
      </div>
    </div>
  );
};

export default NotFoundPage;
