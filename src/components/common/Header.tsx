import React, { useRef } from 'react';
import {
  Sparkles,
  Search,
  Play,
  Database,
  Moon,
  Sun,
  Keyboard,
  Briefcase,
  Plus,
  Shield,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface HeaderProps {
  onOpenShortcuts: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenShortcuts, searchQuery, setSearchQuery }) => {
  const {
    currentJD,
    jobDescriptions,
    setCurrentJDId,
    createNewJobDescription,
    loadDemoData,
    runScreening,
    pipeline,
    settings,
    updateSettings,
    setActiveTab,
    candidates
  } = useApp();

  const searchInputRef = useRef<HTMLInputElement>(null);

  const toggleTheme = () => {
    updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' });
  };

  const hasGroqKey = Boolean(settings.groqApiKey && settings.groqApiKey.trim().length > 0);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-md sm:px-6 dark:border-slate-800 dark:bg-slate-900/95">
      {/* Left: Branding & Current JD Selector */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-xs">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">TalentRank AI</span>
              <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                Hybrid NLP+ML
              </span>
            </div>
          </div>
        </div>

        {/* Vertical divider */}
        <div className="hidden h-6 w-px bg-slate-200 lg:block dark:bg-slate-800" />

        {/* Active JD selector */}
        <div className="hidden items-center gap-1.5 lg:flex">
          <Briefcase className="h-4 w-4 text-slate-400" />
          <select
            value={currentJD.id}
            onChange={(e) => setCurrentJDId(e.target.value)}
            className="max-w-[220px] truncate rounded-md border border-slate-200 bg-slate-50 py-1 pl-2 pr-7 text-xs font-medium text-slate-800 transition-colors hover:bg-slate-100 focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            {jobDescriptions.map((jd) => (
              <option key={jd.id} value={jd.id}>
                {jd.title}
              </option>
            ))}
          </select>
          <button
            onClick={createNewJobDescription}
            title="Create New Job Profile"
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Center: Global Search */}
      <div className="hidden md:flex max-w-sm flex-1 items-center px-4">
        <div className="relative w-full">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search candidates, skills, institutes... (Press / to focus)"
            className="w-full rounded-lg border border-slate-200 bg-slate-50/70 py-1.5 pl-9 pr-9 text-xs text-slate-900 placeholder-slate-400 transition-all focus:border-indigo-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:bg-slate-900"
          />
          <kbd className="pointer-events-none absolute right-2.5 top-2 rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
            /
          </kbd>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        {/* Blind screening indicator */}
        {settings.blindScreening && (
          <div
            title="Blind screening is enabled to eliminate demographic bias"
            className="hidden items-center gap-1 rounded bg-violet-50 px-2 py-1 text-[11px] font-medium text-violet-700 sm:flex dark:bg-violet-950/50 dark:text-violet-300"
          >
            <Shield className="h-3.5 w-3.5" />
            <span>Blind Mode On</span>
          </div>
        )}

        {/* Groq Key Status */}
        <button
          onClick={() => setActiveTab('settings')}
          title={hasGroqKey ? 'Groq LPU active' : 'Groq key missing - click to configure'}
          className={`flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium transition-colors ${
            hasGroqKey
              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300'
              : 'bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300'
          }`}
        >
          {hasGroqKey ? (
            <>
              <CheckCircle2 className="h-3 w-3 text-emerald-500" />
              <span className="hidden sm:inline">Groq Active</span>
            </>
          ) : (
            <>
              <AlertCircle className="h-3 w-3 text-amber-500" />
              <span className="hidden sm:inline">Add Groq Key</span>
            </>
          )}
        </button>

        {/* Load Demo Data Button */}
        <button
          onClick={loadDemoData}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          title="Load 9 realistic candidate resumes and Machine Learning JD"
        >
          <Database className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
          <span className="hidden sm:inline">Demo Data</span>
        </button>

        {/* Run Screening Button */}
        <button
          onClick={() => runScreening()}
          disabled={pipeline.active || candidates.length === 0}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors ${
            pipeline.active || candidates.length === 0
              ? 'cursor-not-allowed bg-indigo-400 dark:bg-indigo-700'
              : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          <Play className={`h-3.5 w-3.5 ${pipeline.active ? 'animate-spin' : ''}`} />
          <span>{pipeline.active ? 'Screening...' : 'Run Screening'}</span>
        </button>

        {/* Theme Toggle (Black / White background) */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle color theme"
          title={settings.theme === 'dark' ? 'Switch to Light (White) background' : 'Switch to Dark (Black) background'}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          {settings.theme === 'dark' ? (
            <>
              <Sun className="h-3.5 w-3.5 text-amber-400" />
              <span className="hidden sm:inline">Light</span>
            </>
          ) : (
            <>
              <Moon className="h-3.5 w-3.5 text-indigo-500" />
              <span className="hidden sm:inline">Dark</span>
            </>
          )}
        </button>

        {/* Shortcuts button */}
        <button
          onClick={onOpenShortcuts}
          aria-label="View keyboard shortcuts"
          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
        >
          <Keyboard className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
};
