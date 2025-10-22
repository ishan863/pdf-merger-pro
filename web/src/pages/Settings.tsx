import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiSave, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import toast from 'react-hot-toast';

const Settings: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    soundEnabled: true,
    animationsEnabled: true,
    autoSave: true,
    language: 'en',
    theme: 'dark',
  });

  const handleToggle = (key: string) => {
    setSettings((prev: any) => ({
      ...prev,
      [key]: typeof prev[key] === 'boolean' ? !prev[key] : prev[key],
    }));
  };

  const handleSave = () => {
    toast.success('Settings saved successfully!');
  };

  const settingSections = [
    {
      title: 'Notifications',
      icon: '🔔',
      items: [
        { key: 'emailNotifications', label: 'Email Notifications', type: 'toggle' },
        { key: 'soundEnabled', label: 'Sound Effects', type: 'toggle' },
      ],
    },
    {
      title: 'Appearance',
      icon: '🎨',
      items: [
        { key: 'theme', label: 'Theme', type: 'select', options: ['Light', 'Dark', 'Auto'] },
        { key: 'animationsEnabled', label: 'Enable Animations', type: 'toggle' },
      ],
    },
    {
      title: 'Preferences',
      icon: '⚙️',
      items: [
        { key: 'autoSave', label: 'Auto-save Files', type: 'toggle' },
        { key: 'language', label: 'Language', type: 'select', options: ['English', 'Spanish', 'French', 'German'] },
      ],
    },
  ];

  return (
    <div className={`flex h-screen ${isDarkMode ? 'bg-slate-950' : 'bg-white'}`}>
      <Sidebar isDarkMode={isDarkMode} />
      <div className="flex-1 flex flex-col">
        <Navbar isDarkMode={isDarkMode} onThemeToggle={() => setIsDarkMode(!isDarkMode)} />

        <div className="flex-1 overflow-auto p-8">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className={`text-4xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Settings
            </h1>
            <p className={`mb-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Customize your PDF Merger Pro experience
            </p>
          </motion.div>

          <div className="space-y-6 max-w-4xl">
            {settingSections.map((section, sectionIndex) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: sectionIndex * 0.1 }}
                className={`rounded-2xl border p-8 ${
                  isDarkMode
                    ? 'bg-gradient-to-br from-white/10 to-white/5 border-white/20'
                    : 'bg-gradient-to-br from-white/60 to-white/40 border-white/30'
                } backdrop-blur-xl`}
              >
                <h2 className={`text-2xl font-bold mb-6 flex items-center gap-3 ${
                  isDarkMode ? 'text-white' : 'text-slate-900'
                }`}>
                  <span className="text-3xl">{section.icon}</span>
                  {section.title}
                </h2>

                <div className="space-y-4">
                  {section.items.map((item) => (
                    <motion.div
                      key={item.key}
                      className={`flex items-center justify-between p-4 rounded-lg ${
                        isDarkMode ? 'bg-white/5' : 'bg-white/40'
                      }`}
                    >
                      <div className="flex-1">
                        <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                          {item.label}
                        </h3>
                      </div>

                      {item.type === 'toggle' ? (
                        <button
                          onClick={() => handleToggle(item.key)}
                          className="transition-transform transform hover:scale-110"
                        >
                          {(settings as any)[item.key] ? (
                            <FiToggleRight className="text-blue-500" size={28} />
                          ) : (
                            <FiToggleLeft className={isDarkMode ? 'text-gray-600' : 'text-gray-400'} size={28} />
                          )}
                        </button>
                      ) : item.type === 'select' ? (
                        <select
                          value={(settings as any)[item.key]}
                          onChange={(e) =>
                            setSettings((prev) => ({
                              ...prev,
                              [item.key]: e.target.value,
                            }))
                          }
                          className={`px-4 py-2 rounded-lg outline-none text-sm ${
                            isDarkMode
                              ? 'bg-white/10 text-white border border-white/20'
                              : 'bg-white/40 text-slate-900 border border-white/30'
                          }`}
                        >
                          {(item.options || []).map((opt: string) => (
                            <option key={opt} value={opt.toLowerCase()}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      ) : null}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}

            {/* Security Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: settingSections.length * 0.1 }}
              className={`rounded-2xl border p-8 ${
                isDarkMode
                  ? 'bg-gradient-to-br from-white/10 to-white/5 border-white/20'
                  : 'bg-gradient-to-br from-white/60 to-white/40 border-white/30'
              } backdrop-blur-xl`}
            >
              <h2 className={`text-2xl font-bold mb-6 flex items-center gap-3 ${
                isDarkMode ? 'text-white' : 'text-slate-900'
              }`}>
                <span className="text-3xl">🔒</span>
                Security & Privacy
              </h2>

              <div className="space-y-4">
                <motion.button className={`w-full p-4 rounded-lg text-left font-medium transition-all ${
                  isDarkMode
                    ? 'bg-white/5 hover:bg-white/10 text-blue-400'
                    : 'bg-white/40 hover:bg-white/60 text-blue-600'
                }`}>
                  Change Password
                </motion.button>
                <motion.button className={`w-full p-4 rounded-lg text-left font-medium transition-all ${
                  isDarkMode
                    ? 'bg-white/5 hover:bg-white/10 text-blue-400'
                    : 'bg-white/40 hover:bg-white/60 text-blue-600'
                }`}>
                  Two-Factor Authentication
                </motion.button>
                <motion.button className={`w-full p-4 rounded-lg text-left font-medium transition-all ${
                  isDarkMode
                    ? 'bg-white/5 hover:bg-white/10 text-red-400'
                    : 'bg-white/40 hover:bg-white/60 text-red-600'
                }`}>
                  Delete Account
                </motion.button>
              </div>
            </motion.div>

            {/* Save button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: (settingSections.length + 1) * 0.1 }}
              onClick={handleSave}
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-blue-500/50 transition-all flex items-center justify-center gap-2 text-lg"
            >
              <FiSave size={24} />
              Save All Settings
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
