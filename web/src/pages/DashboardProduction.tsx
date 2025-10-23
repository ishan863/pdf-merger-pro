/**
 * Dashboard Production - Real Workflow
 * After login: Show Merge, Split, Convert features
 * Upload files → Choose feature → See preview → Process
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiGitMerge,
  FiScissors,
  FiFileText,
  FiClock,
  FiSettings,
  FiUpload,
  FiChevronRight,
  FiImage,
  FiFile,
} from 'react-icons/fi';
import { useAuthStore } from '@/context/authContext';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import EnhancedUploadZone from '@/components/EnhancedUploadZone';

const DashboardProduction: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showConvertDropdown, setShowConvertDropdown] = useState(false);

  // Convert format options
  const convertOptions = [
    {
      id: 'image-to-pdf',
      icon: FiImage,
      title: 'Image to PDF',
      description: 'Convert JPEG, PNG, GIF, WebP to PDF',
      color: 'from-orange-500 to-red-500',
      action: () => {
        navigate('/convert/image');
        setShowConvertDropdown(false);
      },
    },
    {
      id: 'word-to-pdf',
      icon: FiFile,
      title: 'Word to PDF',
      description: 'Convert DOCX files to PDF',
      color: 'from-blue-600 to-blue-400',
      action: () => {
        navigate('/convert/word');
        setShowConvertDropdown(false);
      },
    },
    {
      id: 'excel-to-pdf',
      icon: FiFile,
      title: 'Excel to PDF',
      description: 'Convert XLSX files to PDF',
      color: 'from-green-600 to-green-400',
      action: () => {
        navigate('/convert/excel');
        setShowConvertDropdown(false);
      },
    },
    {
      id: 'ppt-to-pdf',
      icon: FiFile,
      title: 'PowerPoint to PDF',
      description: 'Convert PPTX files to PDF',
      color: 'from-red-600 to-red-400',
      action: () => {
        navigate('/convert/ppt');
        setShowConvertDropdown(false);
      },
    },
  ];

  // Feature cards with direct navigation
  const features = [
    {
      id: 'merge',
      icon: FiGitMerge,
      title: 'Merge PDFs',
      description: 'Combine multiple PDF files into one',
      color: 'from-blue-500 to-cyan-500',
      action: () => navigate('/merge'),
      hasDropdown: false,
    },
    {
      id: 'split',
      icon: FiScissors,
      title: 'Split PDF',
      description: 'Extract specific pages or split into multiple files',
      color: 'from-purple-500 to-pink-500',
      action: () => navigate('/split'),
      hasDropdown: false,
    },
    {
      id: 'convert',
      icon: FiFileText,
      title: 'Convert to PDF',
      description: 'Convert images, Word docs, and more to PDF',
      color: 'from-green-500 to-emerald-500',
      action: () => setShowConvertDropdown(!showConvertDropdown),
      hasDropdown: true,
    },
  ];

  const quickActions = [
    {
      id: 'recent',
      icon: FiClock,
      title: 'Recent Files',
      description: 'Your recently processed files',
      action: () => navigate('/files'),
    },
    {
      id: 'history',
      icon: FiClock,
      title: 'History',
      description: 'View your operation history',
      action: () => navigate('/history'),
    },
    {
      id: 'settings',
      icon: FiSettings,
      title: 'Settings',
      description: 'Manage your preferences',
      action: () => navigate('/settings'),
    },
  ];

  return (
    <div className={`flex h-screen transition-colors duration-300 ${
      isDarkMode ? 'bg-slate-950' : 'bg-gradient-to-br from-blue-50 to-indigo-50'
    }`}>
      {/* Sidebar */}
      <Sidebar isDarkMode={isDarkMode} />

      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <Navbar isDarkMode={isDarkMode} onThemeToggle={() => setIsDarkMode(!isDarkMode)} />

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-6 py-8">
            {/* Welcome Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12"
            >
              <h1 className={`text-5xl font-bold mb-2 ${
                isDarkMode ? 'text-white' : 'text-slate-900'
              }`}>
                Welcome, {user?.displayName || 'User'}! 👋
              </h1>
              <p className={`text-lg ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Choose a feature below to get started with your PDF processing
              </p>
            </motion.div>

            {/* Quick Upload Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 20 }}
              className="mb-12"
            >
              <button
                onClick={() => setShowUploadModal(true)}
                className="w-full max-w-md px-8 py-4 bg-gradient-to-r from-blue-500 via-cyan-500 to-purple-500 text-white rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 flex items-center justify-center gap-3 group"
              >
                <FiUpload size={24} className="group-hover:scale-110 transition-transform" />
                <span>Upload PDF File to Get Started</span>
                <FiChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>

            {/* Main Features Grid */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.1 }}
              className="mb-16"
            >
              <h2 className={`text-2xl font-bold mb-6 ${
                isDarkMode ? 'text-white' : 'text-slate-900'
              }`}>
                Main Features
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div key={feature.id}>
                      <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => {
                          if (feature.hasDropdown) {
                            setShowConvertDropdown(!showConvertDropdown);
                          } else {
                            feature.action();
                          }
                        }}
                        className={`group relative w-full p-6 rounded-2xl backdrop-blur-xl border transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden ${
                          isDarkMode
                            ? 'bg-white/10 border-white/20 hover:bg-white/15 hover:border-white/30'
                            : 'bg-white/40 border-white/50 hover:bg-white/60 hover:border-white/60'
                        }`}
                      >
                        {/* Gradient Background */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

                        {/* Content */}
                        <div className="relative z-10 text-left">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                            <Icon size={24} className="text-white" />
                          </div>
                          <h3 className={`text-xl font-bold mb-2 group-hover:translate-x-1 transition-transform ${
                            isDarkMode ? 'text-white' : 'text-slate-900'
                          }`}>
                            {feature.title}
                          </h3>
                          <p className={`text-sm ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {feature.description}
                          </p>
                        </div>

                        {/* Hover Arrow */}
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <FiChevronRight size={20} className={`group-hover:translate-x-1 transition-transform ${
                            feature.hasDropdown && showConvertDropdown ? 'rotate-180' : ''
                          }`} />
                        </div>
                      </motion.button>
                    </div>
                  );
                })}
              </div>

              {/* Dropdown Modal - Professional Submenu Style */}
              {showConvertDropdown && (
                <>
                  {/* Overlay - Close on click */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowConvertDropdown(false)}
                    className="fixed inset-0 z-40 backdrop-blur-sm"
                  />
                  
                  {/* Professional Dropdown Menu */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.92, y: -20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.92, y: -20 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 rounded-2xl backdrop-blur-2xl border shadow-2xl w-full max-w-2xl overflow-hidden ${
                      isDarkMode
                        ? 'bg-gradient-to-br from-slate-900/95 to-slate-800/95 border-cyan-400/30'
                        : 'bg-gradient-to-br from-white/95 to-blue-50/95 border-blue-300/40'
                    }`}
                  >
                    {/* Header Section */}
                    <div className={`relative px-8 py-6 border-b ${
                      isDarkMode ? 'border-cyan-400/20' : 'border-blue-200/50'
                    }`}>
                      {/* Gradient accent */}
                      <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${
                        isDarkMode ? 'from-cyan-500 via-blue-500 to-purple-500' : 'from-blue-500 via-cyan-500 to-purple-500'
                      }`} />
                      
                      <h2 className={`text-3xl font-black mb-2 ${
                        isDarkMode ? 'text-white' : 'text-slate-900'
                      }`}>
                        Convert to PDF
                      </h2>
                      <p className={`text-sm font-medium ${
                        isDarkMode ? 'text-gray-300' : 'text-slate-600'
                      }`}>
                        Choose your file format below to get started
                      </p>
                    </div>

                    {/* Options Grid */}
                    <div className="p-6 grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                      {convertOptions.map((option, optIndex) => {
                        const OptionIcon = option.icon;
                        return (
                          <motion.button
                            key={option.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: optIndex * 0.08 }}
                            whileHover={{ scale: 1.05, translateY: -4 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              option.action();
                              setShowConvertDropdown(false);
                            }}
                            type="button"
                            className={`group relative p-6 rounded-xl transition-all duration-200 border-2 overflow-hidden ${
                              isDarkMode
                                ? 'bg-gradient-to-br from-white/5 to-white/0 border-cyan-400/20 hover:bg-gradient-to-br hover:from-white/15 hover:to-white/5 hover:border-cyan-400/50'
                                : 'bg-gradient-to-br from-blue-50/50 to-white/30 border-blue-200/40 hover:bg-gradient-to-br hover:from-blue-100/60 hover:to-blue-50/40 hover:border-blue-300/60'
                            }`}
                          >
                            {/* Gradient overlay on hover */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${option.color} opacity-0 group-hover:opacity-5 transition-opacity duration-200`} />
                            
                            {/* Content */}
                            <div className="relative z-10 text-left">
                              {/* Icon */}
                              <div className={`w-14 h-14 rounded-lg bg-gradient-to-br ${option.color} flex items-center justify-center mb-3 group-hover:scale-110 group-hover:shadow-lg transition-all duration-200 shadow-lg`}>
                                <OptionIcon size={28} className="text-white" />
                              </div>
                              
                              {/* Text */}
                              <h3 className={`text-lg font-bold mb-1 group-hover:translate-x-1 transition-transform ${
                                isDarkMode ? 'text-white group-hover:text-cyan-300' : 'text-slate-900 group-hover:text-blue-600'
                              }`}>
                                {option.title}
                              </h3>
                              <p className={`text-xs leading-relaxed ${
                                isDarkMode ? 'text-gray-400 group-hover:text-gray-300' : 'text-gray-600 group-hover:text-gray-700'
                              }`}>
                                {option.description}
                              </p>
                            </div>

                            {/* Arrow indicator */}
                            <div className={`absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity ${
                              isDarkMode ? 'text-cyan-400' : 'text-blue-600'
                            }`}>
                              <FiChevronRight size={18} />
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>

                    {/* Footer Section */}
                    <div className={`px-8 py-4 border-t ${
                      isDarkMode ? 'border-cyan-400/20 bg-white/2' : 'border-blue-200/50 bg-blue-50/20'
                    }`}>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowConvertDropdown(false)}
                        className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                          isDarkMode
                            ? 'bg-gradient-to-r from-cyan-500/30 to-blue-500/30 hover:from-cyan-500/50 hover:to-blue-500/50 text-cyan-300 hover:text-cyan-200'
                            : 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 hover:from-blue-500/40 hover:to-cyan-500/40 text-blue-700 hover:text-blue-600'
                        }`}
                      >
                        <span>Close Menu</span>
                        <FiChevronRight size={18} className="rotate-90 group-hover:translate-y-0.5 transition-transform" />
                      </motion.button>
                    </div>
                  </motion.div>
                </>
              )}
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mb-16"
            >
              <h2 className={`text-2xl font-bold mb-6 ${
                isDarkMode ? 'text-white' : 'text-slate-900'
              }`}>
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <motion.button
                      key={action.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      onClick={action.action}
                      className={`group p-4 rounded-xl backdrop-blur-md border transition-all duration-300 hover:translate-y-[-2px] text-left ${
                        isDarkMode
                          ? 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                          : 'bg-white/30 border-white/40 hover:bg-white/50 hover:border-white/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Icon size={20} className={isDarkMode ? 'text-cyan-400' : 'text-blue-600'} />
                        <FiChevronRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <h3 className={`font-semibold text-sm mb-1 ${
                        isDarkMode ? 'text-white' : 'text-slate-900'
                      }`}>
                        {action.title}
                      </h3>
                      <p className={`text-xs ${
                        isDarkMode ? 'text-gray-500' : 'text-gray-600'
                      }`}>
                        {action.description}
                      </p>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>

            {/* How It Works */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className={`rounded-2xl backdrop-blur-xl border p-8 ${
                isDarkMode
                  ? 'bg-gradient-to-br from-white/10 to-white/5 border-white/20'
                  : 'bg-gradient-to-br from-white/50 to-white/30 border-white/50'
              }`}
            >
              <h2 className={`text-2xl font-bold mb-6 ${
                isDarkMode ? 'text-white' : 'text-slate-900'
              }`}>
                How It Works
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { step: 1, title: 'Upload', description: 'Select your PDF or file to process' },
                  { step: 2, title: 'Choose Feature', description: 'Pick merge, split, or convert' },
                  { step: 3, title: 'Preview & Download', description: 'Review result and download' },
                ].map((item) => (
                  <div key={item.step} className="text-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg mb-3 mx-auto ${
                      isDarkMode
                        ? 'bg-gradient-to-br from-cyan-500 to-blue-500 text-white'
                        : 'bg-gradient-to-br from-blue-500 to-indigo-500 text-white'
                    }`}>
                      {item.step}
                    </div>
                    <h3 className={`font-bold text-lg mb-2 ${
                      isDarkMode ? 'text-white' : 'text-slate-900'
                    }`}>
                      {item.title}
                    </h3>
                    <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowUploadModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-2xl rounded-2xl border ${
              isDarkMode
                ? 'bg-gradient-to-b from-white/10 to-white/5 border-white/20'
                : 'bg-gradient-to-b from-white/80 to-white/60 border-white/40'
            } backdrop-blur-xl p-8`}
          >
            <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Upload Your File
            </h2>
            <EnhancedUploadZone onUploadComplete={() => setShowUploadModal(false)} />
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default DashboardProduction;
