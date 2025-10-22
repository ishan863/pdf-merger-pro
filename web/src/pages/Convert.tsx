import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiUpload, FiDownload } from 'react-icons/fi';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import toast from 'react-hot-toast';

interface ConvertFile {
  id: string;
  name: string;
  type: string;
  progress: number;
}

const Convert: React.FC = () => {
  const [selectedFormat, setSelectedFormat] = useState<'word' | 'excel' | 'pptx' | 'image'>('word');
  const [files, setFiles] = useState<ConvertFile[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isConverting, setIsConverting] = useState(false);

  const formats = [
    { id: 'word', label: 'Word (.DOCX)', icon: '📄', description: 'Convert to Word document' },
    { id: 'excel', label: 'Excel (.XLSX)', icon: '📊', description: 'Convert to Excel spreadsheet' },
    { id: 'pptx', label: 'PowerPoint (.PPTX)', icon: '🎨', description: 'Convert to presentation' },
    { id: 'image', label: 'Images (.PNG/.JPG)', icon: '🖼️', description: 'Convert to images' },
  ];

  const handleConvert = async () => {
    if (files.length === 0) {
      toast.error('Upload files to convert');
      return;
    }

    setIsConverting(true);
    try {
      // Simulate conversion
      for (let i = 0; i < files.length; i++) {
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          setFiles((prev) => {
            const newFiles = [...prev];
            newFiles[i] = { ...newFiles[i], progress };
            return newFiles;
          });
        }
      }
      toast.success(`${files.length} file(s) converted successfully!`);
      setFiles([]);
    } catch (error) {
      toast.error('Conversion failed');
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className={`flex h-screen ${isDarkMode ? 'bg-slate-950' : 'bg-white'}`}>
      <Sidebar isDarkMode={isDarkMode} />
      <div className="flex-1 flex flex-col">
        <Navbar isDarkMode={isDarkMode} onThemeToggle={() => setIsDarkMode(!isDarkMode)} />

        <div className="flex-1 overflow-auto p-8">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className={`text-4xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Universal Converter
            </h1>
            <p className={`mb-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Convert PDFs to Word, Excel, PowerPoint, or Images
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            {formats.map((format) => (
              <motion.button
                key={format.id}
                onClick={() => setSelectedFormat(format.id as any)}
                whileHover={{ scale: 1.05 }}
                className={`p-6 rounded-xl border-2 transition-all text-center cursor-pointer ${
                  selectedFormat === format.id
                    ? isDarkMode
                      ? 'bg-blue-500/20 border-blue-500/50'
                      : 'bg-blue-500/10 border-blue-500/30'
                    : isDarkMode
                      ? 'bg-white/5 border-white/10 hover:border-white/20'
                      : 'bg-white/40 border-white/20 hover:border-white/40'
                }`}
              >
                <div className="text-4xl mb-2">{format.icon}</div>
                <h3 className={`font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  {format.label}
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {format.description}
                </p>
              </motion.button>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl border p-8 ${
              isDarkMode
                ? 'bg-gradient-to-br from-white/10 to-white/5 border-white/20'
                : 'bg-gradient-to-br from-white/60 to-white/40 border-white/30'
            } backdrop-blur-xl`}
          >
            {/* Upload area */}
            <div
              className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
                isDarkMode
                  ? 'border-white/20 hover:border-blue-500/50 hover:bg-blue-500/5'
                  : 'border-white/30 hover:border-blue-500/50 hover:bg-blue-500/5'
              }`}
            >
              <FiUpload className="mx-auto mb-4 text-gray-400" size={48} />
              <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Drag & drop your files here
              </h3>
              <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                or click to browse
              </p>
              <button className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all">
                Select Files
              </button>
            </div>

            {/* File list */}
            {files.length > 0 && (
              <div className="mt-8 space-y-4">
                <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  Files to convert ({files.length})
                </h3>
                <div className="space-y-3">
                  {files.map((file) => (
                    <motion.div
                      key={file.id}
                      className={`p-4 rounded-lg ${isDarkMode ? 'bg-white/10' : 'bg-white/40'}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                          {file.name}
                        </span>
                        <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {file.progress}%
                        </span>
                      </div>
                      <div className={`w-full h-2 rounded-full overflow-hidden ${
                        isDarkMode ? 'bg-white/10' : 'bg-white/30'
                      }`}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${file.progress}%` }}
                          className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="mt-8 flex gap-4">
              <button
                onClick={handleConvert}
                disabled={files.length === 0 || isConverting}
                className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-blue-500/50 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isConverting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Converting...
                  </>
                ) : (
                  <>
                    <FiDownload size={20} />
                    Convert Files
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Convert;
