import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiScissors, FiPlus } from 'react-icons/fi';
import { useFileStore } from '@/context/fileContext';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import toast from 'react-hot-toast';

const Split: React.FC = () => {
  const { files } = useFileStore();
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [splitPages, setSplitPages] = useState<{ start: number; end: number }[]>([
    { start: 1, end: 1 },
  ]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSplitting, setIsSplitting] = useState(false);

  const addSplit = () => {
    setSplitPages([...splitPages, { start: 1, end: 1 }]);
  };

  const removeSplit = (index: number) => {
    setSplitPages(splitPages.filter((_, i) => i !== index));
  };

  const handleSplit = async () => {
    if (!selectedFile || splitPages.length === 0) {
      toast.error('Select a file and define splits');
      return;
    }

    setIsSplitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      toast.success(`Split ${splitPages.length} documents!`);
    } catch (error) {
      toast.error('Failed to split file');
    } finally {
      setIsSplitting(false);
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
              Split & Extract
            </h1>
            <p className={`mb-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Break PDFs into separate documents or extract specific pages
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* File selection */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`rounded-2xl border p-6 ${
                isDarkMode
                  ? 'bg-gradient-to-br from-white/10 to-white/5 border-white/20'
                  : 'bg-gradient-to-br from-white/60 to-white/40 border-white/30'
              } backdrop-blur-xl`}
            >
              <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Select File
              </h2>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {files.length > 0 ? (
                  files.map((file) => (
                    <button
                      key={file.id}
                      onClick={() => setSelectedFile(file.id)}
                      className={`w-full p-3 rounded-lg text-left text-sm transition-all ${
                        selectedFile === file.id
                          ? isDarkMode
                            ? 'bg-blue-500/20 border border-blue-500/50'
                            : 'bg-blue-500/10 border border-blue-500/30'
                          : isDarkMode
                            ? 'bg-white/5 hover:bg-white/10'
                            : 'bg-white/40 hover:bg-white/60'
                      }`}
                    >
                      {file.name}
                    </button>
                  ))
                ) : (
                  <p className={`text-center py-4 text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    No files available
                  </p>
                )}
              </div>
            </motion.div>

            {/* Split configurations */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-2xl border p-6 lg:col-span-2 ${
                isDarkMode
                  ? 'bg-gradient-to-br from-white/10 to-white/5 border-white/20'
                  : 'bg-gradient-to-br from-white/60 to-white/40 border-white/30'
              } backdrop-blur-xl`}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  Split Points
                </h2>
                <button
                  onClick={addSplit}
                  className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all flex items-center gap-2 text-sm"
                >
                  <FiPlus size={16} />
                  Add Split
                </button>
              </div>

              <div className="space-y-3 max-h-64 overflow-y-auto">
                {splitPages.map((split, index) => (
                  <motion.div key={index} className="flex gap-3 items-end">
                    <div className="flex-1">
                      <label className={`text-sm font-medium block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Pages {index + 1}
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min="1"
                          value={split.start}
                          onChange={(e) => {
                            const newSplits = [...splitPages];
                            newSplits[index].start = parseInt(e.target.value) || 1;
                            setSplitPages(newSplits);
                          }}
                          className={`flex-1 px-3 py-2 rounded-lg text-sm outline-none ${
                            isDarkMode
                              ? 'bg-white/10 text-white border border-white/20'
                              : 'bg-white/40 text-slate-900 border border-white/30'
                          }`}
                          placeholder="Start"
                        />
                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>to</span>
                        <input
                          type="number"
                          min="1"
                          value={split.end}
                          onChange={(e) => {
                            const newSplits = [...splitPages];
                            newSplits[index].end = parseInt(e.target.value) || 1;
                            setSplitPages(newSplits);
                          }}
                          className={`flex-1 px-3 py-2 rounded-lg text-sm outline-none ${
                            isDarkMode
                              ? 'bg-white/10 text-white border border-white/20'
                              : 'bg-white/40 text-slate-900 border border-white/30'
                          }`}
                          placeholder="End"
                        />
                      </div>
                    </div>
                    {splitPages.length > 1 && (
                      <button
                        onClick={() => removeSplit(index)}
                        className="px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30"
                      >
                        Remove
                      </button>
                    )}
                  </motion.div>
                ))}
              </div>

              <button
                onClick={handleSplit}
                disabled={!selectedFile || isSplitting}
                className="w-full mt-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-blue-500/50 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSplitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Splitting...
                  </>
                ) : (
                  <>
                    <FiScissors size={20} />
                    Split & Download
                  </>
                )}
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Split;
