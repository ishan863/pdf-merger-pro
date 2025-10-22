import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiCloud, FiDownload, FiShare2, FiTrash2, FiLock } from 'react-icons/fi';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';

const Cloud: React.FC = () => {
  const [cloudFiles] = useState([
    { id: '1', name: 'Project Proposal.pdf', size: 2.5, uploadedAt: new Date(), shared: false },
    { id: '2', name: 'Budget 2024.pdf', size: 1.8, uploadedAt: new Date(), shared: true },
  ]);
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <div className={`flex h-screen ${isDarkMode ? 'bg-slate-950' : 'bg-white'}`}>
      <Sidebar isDarkMode={isDarkMode} />
      <div className="flex-1 flex flex-col">
        <Navbar isDarkMode={isDarkMode} onThemeToggle={() => setIsDarkMode(!isDarkMode)} />

        <div className="flex-1 overflow-auto p-8">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className={`text-4xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Cloud Storage
            </h1>
            <p className={`mb-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Save and manage your PDFs in the cloud
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-xl p-6 ${isDarkMode ? 'bg-white/10' : 'bg-white/40'} backdrop-blur-md`}
            >
              <FiCloud className="text-blue-500 mb-3" size={32} />
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Storage Used</p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>2.3 GB / 5 GB</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={`rounded-xl p-6 ${isDarkMode ? 'bg-white/10' : 'bg-white/40'} backdrop-blur-md`}
            >
              <FiShare2 className="text-green-500 mb-3" size={32} />
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Shared Files</p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>3</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`rounded-xl p-6 ${isDarkMode ? 'bg-white/10' : 'bg-white/40'} backdrop-blur-md`}
            >
              <FiLock className="text-orange-500 mb-3" size={32} />
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Private Files</p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>12</p>
            </motion.div>
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
            <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Cloud Files
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`border-b ${isDarkMode ? 'border-white/10' : 'border-white/20'}`}>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Filename</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Size</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Uploaded</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cloudFiles.map((file) => (
                    <motion.tr
                      key={file.id}
                      className={`border-b transition-colors hover:bg-white/5 ${
                        isDarkMode ? 'border-white/10' : 'border-white/20'
                      }`}
                    >
                      <td className="px-6 py-4 font-medium">{file.name}</td>
                      <td className="px-6 py-4 text-sm">{file.size} MB</td>
                      <td className="px-6 py-4 text-sm">Today</td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-3 py-1 rounded-full ${
                          file.shared
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {file.shared ? 'Shared' : 'Private'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right flex gap-2 justify-end">
                        <button className="p-2 text-blue-400 hover:bg-blue-500/20 rounded">
                          <FiDownload size={18} />
                        </button>
                        <button className="p-2 text-green-400 hover:bg-green-500/20 rounded">
                          <FiShare2 size={18} />
                        </button>
                        <button className="p-2 text-red-400 hover:bg-red-500/20 rounded">
                          <FiTrash2 size={18} />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Cloud;
