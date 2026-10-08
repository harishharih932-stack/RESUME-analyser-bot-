import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: '/', description: 'Focus candidate search bar' },
    { key: 'g then d', description: 'Navigate to Dashboard' },
    { key: 'g then r', description: 'Navigate to Ranking Table' },
    { key: 'g then u', description: 'Navigate to Upload Resumes' },
    { key: 'g then j', description: 'Navigate to Job Description' },
    { key: 'g then a', description: 'Navigate to Analytics' },
    { key: 'g then c', description: 'Navigate to AI Assistant' },
    { key: 'g then s', description: 'Navigate to Settings' },
    { key: 'b', description: 'Toggle Blind Screening Mode' },
    { key: '?', description: 'Open this shortcuts cheatsheet' },
    { key: 'Esc', description: 'Close any open drawer or modal' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Keyboard className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Keyboard Shortcuts</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 divide-y divide-slate-100 text-sm dark:divide-slate-800">
          {shortcuts.map((s, idx) => (
            <div key={idx} className="flex items-center justify-between py-2">
              <span className="text-slate-600 dark:text-slate-400">{s.description}</span>
              <kbd className="rounded border border-slate-200 bg-slate-100 px-2 py-0.5 font-mono text-xs font-medium text-slate-700 shadow-2xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="mt-5 text-center text-xs text-slate-400 dark:text-slate-500">
          Press <kbd className="rounded bg-slate-100 px-1 py-0.5 text-xs dark:bg-slate-800">Esc</kbd> anytime to dismiss
        </div>
      </div>
    </div>
  );
};
