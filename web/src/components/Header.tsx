import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX, FiLogOut } from 'react-icons/fi';
import { useAuthStore } from '@/context/authContext';

const Header: React.FC = () => {
  const { user, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="container-max px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <a href="/" className="text-2xl font-bold text-accent-500">
            PDF Merger
          </a>
          <div className="hidden md:flex items-center gap-6">
            <a href="/dashboard" className="text-primary-700 hover:text-accent-500 transition">
              Dashboard
            </a>
            <a href="/" className="text-primary-700 hover:text-accent-500 transition">
              Home
            </a>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <>
              <div className="flex items-center gap-3">
                {user.photoURL && (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <span className="text-primary-700">{user.displayName}</span>
              </div>
              <button
                onClick={handleLogout}
                className="btn-secondary gap-2"
              >
                <FiLogOut /> Logout
              </button>
            </>
          ) : (
            <a href="/login" className="btn-primary">
              Login
            </a>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t bg-primary-50"
          >
            <div className="container-max px-4 py-4 flex flex-col gap-4">
              <a href="/dashboard" className="text-primary-700 hover:text-accent-500">
                Dashboard
              </a>
              <a href="/" className="text-primary-700 hover:text-accent-500">
                Home
              </a>
              {user && (
                <button
                  onClick={handleLogout}
                  className="btn-secondary w-full justify-center"
                >
                  Logout
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
