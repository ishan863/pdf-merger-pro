import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { useAuthStore } from '@/context/authContext';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-accent-50 to-primary-50">
      <Header />
      <main className="container-max px-4 py-20 text-center">
        <h1 className="text-5xl font-bold text-primary-900 mb-6">
          Professional PDF Processing
        </h1>
        <p className="text-xl text-primary-600 mb-12 max-w-2xl mx-auto">
          Merge, split, extract, and manipulate PDFs with ease. All processing is secure and private.
        </p>
        <div className="flex justify-center gap-4">
          <a href="/login" className="btn-primary px-8">
            Get Started
          </a>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
