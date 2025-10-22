import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from './Modal';
import { FaKeyboard } from 'react-icons/fa';
import { getKeyboardShortcutsReference } from '@/hooks/useKeyboardShortcuts';

interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

const KeyboardShortcutsHelp: React.FC<KeyboardShortcutsHelpProps> = ({
  isOpen,
  onClose,
}) => {
  const shortcuts = getKeyboardShortcutsReference();

  return (
    <AnimatePresence>
      {isOpen && (
        <Modal
          title="Keyboard Shortcuts"
          isOpen={isOpen}
          onClose={onClose}
          size="md"
          actions={[
            {
              label: 'Close',
              onClick: onClose,
              variant: 'primary',
            },
          ]}
        >
          <div className="space-y-4">
            {/* Icon & Description */}
            <div className="flex items-center gap-3 mb-6 p-4 bg-blue-50 rounded-lg">
              <FaKeyboard className="text-blue-600" size={24} />
              <p className="text-sm text-gray-700">
                Use keyboard shortcuts to speed up your workflow. Shortcuts only work when no text input is focused.
              </p>
            </div>

            {/* Shortcuts Grid */}
            <div className="space-y-3">
              {shortcuts.map((shortcut, index) => (
                <motion.div
                  key={shortcut.key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200 hover:bg-gray-100 transition"
                >
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">
                      {shortcut.description}
                      {shortcut.requiresSelection && (
                        <span className="text-xs text-gray-500 ml-2">(requires selection)</span>
                      )}
                    </p>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="px-3 py-1 bg-gray-200 rounded font-mono text-sm font-bold text-gray-800 ml-4 whitespace-nowrap"
                  >
                    {shortcut.key}
                  </motion.div>
                </motion.div>
              ))}
            </div>

            {/* Tips Section */}
            <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
              <h4 className="font-semibold text-amber-900 mb-2">💡 Tips</h4>
              <ul className="text-sm text-amber-800 space-y-1">
                <li>• Select pages first by clicking or Ctrl+Click on thumbnails</li>
                <li>• Press '?' anytime to open this help dialog</li>
                <li>• Undo/Redo work for all operations</li>
                <li>• Keyboard shortcuts don't work while typing in text fields</li>
              </ul>
            </div>
          </div>
        </Modal>
      )}
    </AnimatePresence>
  );
};

export default KeyboardShortcutsHelp;
