import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiChevronDown, FiMail, FiBook, FiCommand, FiVideo } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';

const Help: React.FC = () => {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(0);

  const faqs = [
    {
      question: 'How do I merge multiple PDFs?',
      answer: 'Go to Merge page, select multiple PDF files from your library, arrange them in the desired order, and click "Merge & Download".'
    },
    {
      question: 'Can I split a PDF into multiple files?',
      answer: 'Yes! Go to Split page, upload your PDF, specify the page ranges where you want to split, and download the resulting files.'
    },
    {
      question: 'How do I convert images to PDF?',
      answer: 'Click Convert on Dashboard, select "Image to PDF", upload your images (JPEG, PNG, GIF, WebP), and download the converted PDF.'
    },
    {
      question: 'What file formats can I convert?',
      answer: 'We support converting: Images (JPEG, PNG, GIF, WebP), Word (DOCX), Excel (XLSX), and PowerPoint (PPTX) to PDF format.'
    },
    {
      question: 'How do I extract specific pages from a PDF?',
      answer: 'Go to Extract on Dashboard, upload your PDF, select the page numbers you want, and download them as a new PDF.'
    },
    {
      question: 'Can I edit PDFs directly?',
      answer: 'Yes! Upload a PDF and it will open in our editor where you can rotate, delete, and reorder pages.'
    },
    {
      question: 'Is my data secure?',
      answer: 'All files are encrypted and stored securely. Files are automatically deleted after processing. We never keep your PDFs.'
    },
    {
      question: 'Can I use this on mobile?',
      answer: 'Yes! Our app works on any device with a web browser. You can also download our mobile app from the App Store or Google Play.'
    },
  ];

  const shortcuts = [
    { key: 'Cmd+K', action: 'Open search' },
    { key: 'Cmd+N', action: 'New file' },
    { key: 'Cmd+S', action: 'Save file' },
    { key: 'Esc', action: 'Close modals' },
    { key: 'Space', action: 'Toggle sidebar' },
    { key: '?', action: 'Show this help' },
  ];

  return (
    <div className={`flex h-screen ${isDarkMode ? 'bg-slate-950' : 'bg-white'}`}>
      <Sidebar isDarkMode={isDarkMode} />
      <div className="flex-1 flex flex-col">
        <Navbar isDarkMode={isDarkMode} onThemeToggle={() => setIsDarkMode(!isDarkMode)} />

        <div className="flex-1 overflow-auto p-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <button
              onClick={() => navigate('/dashboard')}
              className={`flex items-center gap-2 mb-6 px-4 py-2 rounded-lg transition-all ${
                isDarkMode
                  ? 'text-blue-400 hover:bg-white/10'
                  : 'text-blue-600 hover:bg-white/40'
              }`}
            >
              <FiArrowLeft size={20} />
              <span className="font-medium">Back to Dashboard</span>
            </button>

            <h1 className={`text-4xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Help & Support
            </h1>
            <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Find answers to common questions and learn how to use PDF Merger Pro
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12"
          >
            {[
              { icon: FiBook, label: 'Documentation', color: 'from-blue-500 to-cyan-500' },
              { icon: FiCommand, label: 'Keyboard Shortcuts', color: 'from-purple-500 to-pink-500' },
              { icon: FiVideo, label: 'Video Tutorials', color: 'from-orange-500 to-red-500' },
              { icon: FiMail, label: 'Contact Support', color: 'from-green-500 to-emerald-500' },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.05, y: -4 }}
                  className={`p-6 rounded-xl backdrop-blur-md border transition-all ${
                    isDarkMode
                      ? 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                      : 'bg-white/40 border-white/30 hover:bg-white/60 hover:border-white/40'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center mb-3`}>
                    <Icon size={24} className="text-white" />
                  </div>
                  <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    {item.label}
                  </h3>
                </motion.button>
              );
            })}
          </motion.div>

          {/* FAQs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Frequently Asked Questions
            </h2>

            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className={`rounded-lg border backdrop-blur-md overflow-hidden ${
                    isDarkMode
                      ? 'bg-white/5 border-white/10'
                      : 'bg-white/40 border-white/30'
                  }`}
                >
                  <button
                    onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                    className={`w-full p-4 flex items-center justify-between transition-colors ${
                      expandedFAQ === index
                        ? isDarkMode
                          ? 'bg-white/10'
                          : 'bg-white/60'
                        : ''
                    }`}
                  >
                    <span className={`font-semibold text-left ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      {faq.question}
                    </span>
                    <motion.div
                      animate={{ rotate: expandedFAQ === index ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <FiChevronDown size={20} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
                    </motion.div>
                  </button>

                  {expandedFAQ === index && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className={`border-t px-4 py-3 ${isDarkMode ? 'border-white/10' : 'border-white/30'}`}
                    >
                      <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Keyboard Shortcuts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-12"
          >
            <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Keyboard Shortcuts
            </h2>

            <div className={`rounded-xl border backdrop-blur-md p-6 ${
              isDarkMode
                ? 'bg-white/5 border-white/10'
                : 'bg-white/40 border-white/30'
            }`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {shortcuts.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                      {shortcut.action}
                    </span>
                    <kbd className={`px-3 py-1 rounded font-mono text-sm ${
                      isDarkMode
                        ? 'bg-white/10 text-cyan-300'
                        : 'bg-white/60 text-blue-600'
                    }`}>
                      {shortcut.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Contact Support */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={`rounded-xl border backdrop-blur-md p-8 text-center ${
              isDarkMode
                ? 'bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20'
                : 'bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20'
            }`}
          >
            <h2 className={`text-2xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Still Need Help?
            </h2>
            <p className={`mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Contact our support team and we'll help you get what you need
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center gap-2 mx-auto"
            >
              <FiMail size={20} />
              <span>Email Support</span>
            </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Help;
