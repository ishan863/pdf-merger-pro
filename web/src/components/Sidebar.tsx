import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiMenu, FiX, FiHome, FiGitMerge, FiScissors, FiFilter, FiClock, FiSettings, FiHelpCircle } from 'react-icons/fi';
import { useNavigate, useLocation } from 'react-router-dom';

interface SidebarProps {
  isDarkMode: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isDarkMode }) => {
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: FiHome, label: 'Dashboard', path: '/dashboard' },
    { icon: FiGitMerge, label: 'Merge', path: '/merge' },
    { icon: FiScissors, label: 'Split', path: '/split' },
    { icon: FiFilter, label: 'Convert', path: '/convert' },
    { icon: FiClock, label: 'History', path: '/history' },
    { icon: FiSettings, label: 'Settings', path: '/settings' },
    { icon: FiHelpCircle, label: 'Help', path: '/help' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Sidebar */}
      <motion.aside
        animate={{ width: isOpen ? 280 : 80 }}
        transition={{ duration: 0.3 }}
        className={`hidden md:flex flex-col border-r ${
          isDarkMode
            ? 'bg-gradient-to-b from-slate-900 to-slate-950 border-white/10'
            : 'bg-gradient-to-b from-white/50 to-white/30 border-white/30'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 h-20">
          {isOpen && (
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}
            >
              Menu
            </motion.h2>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`p-2 rounded-lg transition-all ${
              isDarkMode
                ? 'bg-white/10 hover:bg-white/20 text-white'
                : 'bg-white/40 hover:bg-white/60 text-slate-900'
            }`}
          >
            {isOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 overflow-y-auto space-y-2 px-4 py-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <motion.button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  active
                    ? isDarkMode
                      ? 'bg-gradient-to-r from-blue-500/30 to-cyan-500/30 text-blue-300'
                      : 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-600'
                    : isDarkMode
                      ? 'text-gray-400 hover:text-white hover:bg-white/10'
                      : 'text-gray-600 hover:text-slate-900 hover:bg-white/40'
                }`}
                title={item.label}
              >
                <Icon size={20} className="flex-shrink-0" />
                {isOpen && <span className="text-sm font-medium">{item.label}</span>}
              </motion.button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className={`border-t p-4 ${isDarkMode ? 'border-white/10' : 'border-white/20'}`}>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-2"
            >
              <p className={`text-xs text-center font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Created by Raja Patel
              </p>
              <p className={`text-xs text-center ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                v2.0 Pro
              </p>
            </motion.div>
          )}
        </div>
      </motion.aside>

      {/* Mobile menu button (shown on sm screens) */}
      <button className="md:hidden fixed bottom-8 right-8 z-40 p-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full shadow-lg">
        <FiMenu size={24} />
      </button>
    </>
  );
};

export default Sidebar;
