import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiMessageSquare, FiPlus, FiCopy } from 'react-icons/fi';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import toast from 'react-hot-toast';

const Collab: React.FC = () => {
  const [sessionId] = useState('ABC-123-XYZ');
  const [participants] = useState([
    { id: '1', name: 'You', email: 'you@example.com', cursor: 'blue', active: true },
    { id: '2', name: 'John', email: 'john@example.com', cursor: 'green', active: true },
  ]);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const copySessionId = () => {
    navigator.clipboard.writeText(sessionId);
    toast.success('Session ID copied!');
  };

  return (
    <div className={`flex h-screen ${isDarkMode ? 'bg-slate-950' : 'bg-white'}`}>
      <Sidebar isDarkMode={isDarkMode} />
      <div className="flex-1 flex flex-col">
        <Navbar isDarkMode={isDarkMode} onThemeToggle={() => setIsDarkMode(!isDarkMode)} />

        <div className="flex-1 overflow-auto p-8">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className={`text-4xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Real-time Collaboration
            </h1>
            <p className={`mb-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Edit PDFs together with your team in real-time
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Session info */}
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
                Session Info
              </h2>

              <div className={`p-4 rounded-lg mb-4 ${isDarkMode ? 'bg-white/10' : 'bg-white/40'}`}>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Session ID</p>
                <div className="flex items-center gap-2 mt-2">
                  <code className={`flex-1 font-mono text-sm ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`}>
                    {sessionId}
                  </code>
                  <button
                    onClick={copySessionId}
                    className="p-2 rounded hover:bg-white/10 transition-all"
                  >
                    <FiCopy size={18} />
                  </button>
                </div>
              </div>

              <button className="w-full px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all flex items-center justify-center gap-2 text-sm font-medium">
                <FiPlus size={16} />
                Invite Others
              </button>
            </motion.div>

            {/* Participants */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={`lg:col-span-2 rounded-2xl border p-6 ${
                isDarkMode
                  ? 'bg-gradient-to-br from-white/10 to-white/5 border-white/20'
                  : 'bg-gradient-to-br from-white/60 to-white/40 border-white/30'
              } backdrop-blur-xl`}
            >
              <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                <FiUsers size={24} />
                Active Participants ({participants.length})
              </h2>

              <div className="space-y-3">
                {participants.map((user) => (
                  <motion.div
                    key={user.id}
                    className={`p-4 rounded-lg flex items-center gap-4 ${
                      isDarkMode ? 'bg-white/10' : 'bg-white/40'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${
                      user.cursor === 'blue' ? 'bg-blue-500' : 'bg-green-500'
                    }`}>
                      {user.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        {user.name}
                      </p>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {user.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-3 py-1 rounded-full ${
                        user.active
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {user.active ? 'Editing' : 'Away'}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Chat section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`mt-8 rounded-2xl border p-6 ${
              isDarkMode
                ? 'bg-gradient-to-br from-white/10 to-white/5 border-white/20'
                : 'bg-gradient-to-br from-white/60 to-white/40 border-white/30'
            } backdrop-blur-xl`}
          >
            <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              <FiMessageSquare size={24} />
              Session Chat
            </h2>

            <div className={`h-48 rounded-lg p-4 mb-4 ${isDarkMode ? 'bg-white/5' : 'bg-white/30'} overflow-y-auto`}>
              <p className={`text-center py-8 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                Messages appear here
              </p>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type a message..."
                className={`flex-1 px-4 py-2 rounded-lg outline-none text-sm ${
                  isDarkMode
                    ? 'bg-white/10 text-white border border-white/20'
                    : 'bg-white/40 text-slate-900 border border-white/30'
                }`}
              />
              <button className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all font-medium">
                Send
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Collab;
