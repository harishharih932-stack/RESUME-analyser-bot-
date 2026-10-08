import React from 'react';
import { KeyRound, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ApiKeyBanner: React.FC<{ featureName?: string }> = ({ featureName = 'This AI feature' }) => {
  const { settings, setActiveTab } = useApp();

  if (settings.groqApiKey && settings.groqApiKey.trim().length > 0) {
    return null;
  }

  return (
    <div className="mb-4 flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50/80 px-4 py-2.5 text-xs text-amber-900 shadow-xs dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
      <div className="flex items-center gap-2">
        <KeyRound className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
        <span>
          <strong>Groq API key not set.</strong> {featureName} is using local NLP & ML heuristics. Connect your free Groq key for full LLM semantic evaluation.
        </span>
      </div>
      <button
        onClick={() => setActiveTab('settings')}
        className="ml-3 inline-flex items-center gap-1 font-semibold text-amber-800 hover:text-amber-950 hover:underline dark:text-amber-300 dark:hover:text-amber-100"
      >
        <span>Open Settings</span>
        <ArrowRight className="h-3 w-3" />
      </button>
    </div>
  );
};
