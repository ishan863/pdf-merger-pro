import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiBell, FiUser, FiLogOut, FiMoon, FiSun } from 'react-icons/fi';
import { useAuthStore } from '@/context/authContext';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '@/utils/firebase';

interface NavbarProps {
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ isDarkMode, onThemeToggle }) => {
  const { user } = useAuthStore();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className={`sticky top-0 z-40 backdrop-blur-md border-b ${
      isDarkMode
        ? 'bg-slate-900/50 border-white/10'
        : 'bg-white/50 border-white/30'
    }`}>
      <div className="px-4 md:px-8 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
            PDF
          </div>
          <span className={`text-lg md:text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Merger Pro
          </span>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Theme toggle */}
          <button
            onClick={onThemeToggle}
            className={`p-2 rounded-lg transition-all ${
              isDarkMode
                ? 'bg-white/10 hover:bg-white/20 text-yellow-400'
                : 'bg-white/40 hover:bg-white/60 text-slate-700'
            }`}
            aria-label="Toggle theme"
          >
            {isDarkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
          </button>

          {/* Notifications */}
          <button 
            className={`p-2 rounded-lg relative transition-all ${
              isDarkMode
                ? 'bg-white/10 hover:bg-white/20 text-white'
                : 'bg-white/40 hover:bg-white/60 text-slate-900'
            }`}
            aria-label="Notifications"
          >
            <FiBell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-all ${
                isDarkMode
                  ? 'bg-gradient-to-br from-blue-500/50 to-cyan-500/50 text-white hover:from-blue-500 hover:to-cyan-500'
                  : 'bg-gradient-to-br from-blue-500/30 to-cyan-500/30 text-blue-600 hover:from-blue-500/50 hover:to-cyan-500/50'
              }`}
            >
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </button>

            {isUserMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`absolute right-0 mt-2 w-48 rounded-xl border backdrop-blur-md shadow-lg ${
                  isDarkMode
                    ? 'bg-slate-800/80 border-white/10'
                    : 'bg-white/80 border-white/40'
                }`}
              >
                <div className={`p-4 border-b ${isDarkMode ? 'border-white/10' : 'border-white/20'}`}>
                  <p className={`font-medium text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    {user?.email}
                  </p>
                </div>
                <button
                  className={`w-full px-4 py-3 text-left text-sm font-medium flex items-center gap-3 transition-all ${
                    isDarkMode
                      ? 'text-gray-400 hover:text-white hover:bg-white/5'
                      : 'text-gray-600 hover:text-slate-900 hover:bg-white/40'
                  }`}
                >
                  <FiUser size={16} />
                  Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-3 text-left text-sm font-medium text-red-500 flex items-center gap-3 hover:bg-red-500/10 transition-all"
                >
                  <FiLogOut size={16} />
                  Logout
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
