import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  GithubAuthProvider,
} from 'firebase/auth';
import { auth } from '@/utils/firebase';
import { useAuthStore } from '@/context/authContext';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Header from '@/components/Header';
import { FaGoogle, FaGithub, FaFacebook } from 'react-icons/fa';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { setUser } = useAuthStore();

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      setUser({
        uid: result.user.uid,
        email: result.user.email || '',
        displayName: result.user.displayName || '',
        photoURL: result.user.photoURL || '',
      });

      toast.success(`✓ Welcome, ${result.user.displayName}!`);
      navigate('/dashboard');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Login failed';
      toast.error(`Google login failed: ${errorMessage}`);
      console.error('Google login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGitHubSignIn = async () => {
    setIsLoading(true);
    try {
      const provider = new GithubAuthProvider();
      const result = await signInWithPopup(auth, provider);

      setUser({
        uid: result.user.uid,
        email: result.user.email || '',
        displayName: result.user.displayName || '',
        photoURL: result.user.photoURL || '',
      });

      toast.success(`✓ Welcome, ${result.user.displayName}!`);
      navigate('/dashboard');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Login failed';
      toast.error(`GitHub login failed: ${errorMessage}`);
      console.error('GitHub login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFacebookSignIn = async () => {
    setIsLoading(true);
    try {
      const provider = new FacebookAuthProvider();
      const result = await signInWithPopup(auth, provider);

      setUser({
        uid: result.user.uid,
        email: result.user.email || '',
        displayName: result.user.displayName || '',
        photoURL: result.user.photoURL || '',
      });

      toast.success(`✓ Welcome, ${result.user.displayName}!`);
      navigate('/dashboard');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Login failed';
      toast.error(`Facebook login failed: ${errorMessage}`);
      console.error('Facebook login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50">
      <Header />

      <main className="container-max px-4 py-12 flex items-center justify-center min-h-[calc(100vh-80px)]">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full"
        >
          {/* Logo/Title Section */}
          <motion.div variants={itemVariants} className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent mb-2">
              PDF Merger
            </h1>
            <p className="text-gray-600">Sign in to get started</p>
          </motion.div>

          {/* Description */}
          <motion.p variants={itemVariants} className="text-sm text-gray-600 text-center mb-6">
            Edit, merge, split, and process your PDFs with ease.
          </motion.p>

          {/* Sign In Options */}
          <motion.div variants={itemVariants} className="space-y-3 mb-6">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className={`w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg font-medium transition ${
                isLoading
                  ? 'opacity-50 cursor-not-allowed bg-gray-100'
                  : 'bg-white border-2 border-gray-200 hover:border-primary-400 hover:bg-primary-50 text-gray-700'
              }`}
            >
              <FaGoogle size={18} className="text-red-500" />
              Continue with Google
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGitHubSignIn}
              disabled={isLoading}
              className={`w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg font-medium transition ${
                isLoading
                  ? 'opacity-50 cursor-not-allowed bg-gray-100'
                  : 'bg-white border-2 border-gray-200 hover:border-primary-400 hover:bg-primary-50 text-gray-700'
              }`}
            >
              <FaGithub size={18} className="text-gray-800" />
              Continue with GitHub
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleFacebookSignIn}
              disabled={isLoading}
              className={`w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg font-medium transition ${
                isLoading
                  ? 'opacity-50 cursor-not-allowed bg-gray-100'
                  : 'bg-white border-2 border-gray-200 hover:border-primary-400 hover:bg-primary-50 text-gray-700'
              }`}
            >
              <FaFacebook size={18} className="text-blue-600" />
              Continue with Facebook
            </motion.button>
          </motion.div>

          {/* Loading Indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center gap-2 text-primary-600 font-medium"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity }}
                className="w-4 h-4 border-2 border-primary-300 border-t-primary-600 rounded-full"
              />
              Signing in...
            </motion.div>
          )}

          {/* Privacy Notice */}
          <motion.p variants={itemVariants} className="text-xs text-gray-500 text-center mt-6">
            By signing in, you agree to our{' '}
            <a href="#" className="text-primary-600 hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-primary-600 hover:underline">
              Privacy Policy
            </a>
          </motion.p>
        </motion.div>
      </main>
    </div>
  );
};

export default LoginPage;
