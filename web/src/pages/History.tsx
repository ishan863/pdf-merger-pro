import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiClock, FiRotateCcw } from 'react-icons/fi';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/context/authContext';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/utils/firebase';

interface HistoryItem {
  id: string;
  type: 'merge' | 'split' | 'convert' | 'rotate' | 'delete' | 'download';
  description: string;
  timestamp: Date;
  details: string;
  userId: string;
  pages?: number;
  inputSize?: number;
  outputSize?: number;
  duration?: number;
}

const History: React.FC = () => {
  const [filterType, setFilterType] = useState<'all' | 'merge' | 'split' | 'convert'>('all');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const { user } = useAuthStore();

  // Fetch user action history from Firestore
  useEffect(() => {
    const fetchHistory = async () => {
      if (!user?.uid) return;
      
      try {
        const q = query(
          collection(db, 'audit_logs'),
          where('userId', '==', user.uid),
          orderBy('timestamp', 'desc'),
          limit(50)
        );
        
        const snapshot = await getDocs(q);
        const historyData = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            type: data.action?.toLowerCase() || 'download',
            description: formatDescription(data.action, data),
            timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : new Date(),
            details: formatDetails(data),
            userId: data.userId,
            pages: data.pages,
            inputSize: data.inputSize,
            outputSize: data.outputSize,
            duration: data.duration,
          } as HistoryItem;
        });
        
        setHistory(historyData);
      } catch (error) {
        console.error('Failed to fetch history:', error);
        // Show fallback history
        setHistory([]);
        toast.error('Failed to load history');
      }
    };

    fetchHistory();
  }, [user?.uid]);

  const formatDescription = (action: string, data: any) => {
    switch (action) {
      case 'merge':
        return `Merged ${data.fileCount || 'multiple'} PDFs`;
      case 'split':
        return `Split PDF (${data.pages} pages)`;
      case 'convert':
        return `Converted to ${data.format || 'PDF'}`;
      case 'download':
        return 'Downloaded file';
      default:
        return action.charAt(0).toUpperCase() + action.slice(1);
    }
  };

  const formatDetails = (data: any) => {
    const parts = [];
    if (data.pages) parts.push(`${data.pages} pages`);
    if (data.inputSize) parts.push(`${(data.inputSize / 1024 / 1024).toFixed(2)}MB input`);
    if (data.outputSize) parts.push(`${(data.outputSize / 1024 / 1024).toFixed(2)}MB output`);
    if (data.duration) parts.push(`${data.duration}ms`);
    return parts.length > 0 ? parts.join(' • ') : 'Operation completed successfully';
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'merge':
        return 'from-blue-500 to-cyan-500';
      case 'split':
        return 'from-purple-500 to-pink-500';
      case 'convert':
        return 'from-green-500 to-emerald-500';
      default:
        return 'from-gray-500 to-slate-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'merge':
        return '🔗';
      case 'split':
        return '✂️';
      case 'convert':
        return '🔄';
      default:
        return '📝';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (60 * 60 * 1000));
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'Yesterday';
    return `${days}d ago`;
  };

  const filteredHistory = history.filter((item) =>
    filterType === 'all' ? true : item.type === filterType
  );

  return (
    <div className={`flex h-screen ${isDarkMode ? 'bg-slate-950' : 'bg-white'}`}>
      <Sidebar isDarkMode={isDarkMode} />
      <div className="flex-1 flex flex-col">
        <Navbar isDarkMode={isDarkMode} onThemeToggle={() => setIsDarkMode(!isDarkMode)} />

        <div className="flex-1 overflow-auto p-8">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className={`text-4xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Activity History
            </h1>
            <p className={`mb-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              View all your PDF operations and revert to previous versions
            </p>
          </motion.div>

          {/* Filter buttons */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 mb-8">
            {(['all', 'merge', 'split', 'convert'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filterType === type
                    ? 'bg-blue-500 text-white'
                    : isDarkMode
                      ? 'bg-white/10 text-gray-300 hover:bg-white/20'
                      : 'bg-white/40 text-slate-900 hover:bg-white/60'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </motion.div>

          {/* Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl border p-8 ${
              isDarkMode
                ? 'bg-gradient-to-br from-white/10 to-white/5 border-white/20'
                : 'bg-gradient-to-br from-white/60 to-white/40 border-white/30'
            } backdrop-blur-xl`}
          >
            {filteredHistory.length > 0 ? (
              <div className="space-y-4">
                {filteredHistory.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-6 rounded-lg border flex items-start gap-4 ${
                      isDarkMode
                        ? 'bg-white/5 border-white/10 hover:bg-white/10'
                        : 'bg-white/40 border-white/20 hover:bg-white/60'
                    } transition-all`}
                  >
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getTypeColor(item.type)} flex items-center justify-center text-xl flex-shrink-0`}>
                      {getTypeIcon(item.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        {item.description}
                      </h3>
                      <p className={`text-sm mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {item.details}
                      </p>
                      <div className="flex items-center gap-4 text-xs">
                        <span className={`flex items-center gap-1 ${
                          isDarkMode ? 'text-gray-500' : 'text-gray-500'
                        }`}>
                          <FiClock size={14} />
                          {formatTime(item.timestamp)}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <button
                      onClick={() => toast.success('Reverted to this version')}
                      className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all flex items-center gap-2 text-sm font-medium flex-shrink-0"
                    >
                      <FiRotateCcw size={16} />
                      Revert
                    </button>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className={`text-center py-12 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                <FiClock className="mx-auto mb-4 opacity-50" size={48} />
                <p className="text-lg font-medium mb-2">No history found</p>
                <p className="text-sm">Your operations will appear here</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default History;
