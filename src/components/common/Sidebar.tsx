import React from 'react';
import {
  LayoutDashboard,
  FileText,
  UploadCloud,
  Award,
  GitCompare,
  BarChart3,
  MessageSquare,
  FileCheck,
  BrainCircuit,
  Sliders,
  Shield,
  Layers
} from 'lucide-react';
import { AppTab, useApp } from '../../context/AppContext';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, candidates, compareCandidateIds, settings } = useApp();

  const navItems: Array<{
    id: AppTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number | string;
  }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'jd', label: 'Job Description', icon: FileText },
    { id: 'upload', label: 'Upload Resumes', icon: UploadCloud },
    {
      id: 'ranking',
      label: 'Candidate Ranking',
      icon: Award,
      badge: candidates.length > 0 ? candidates.length : undefined
    },
    {
      id: 'compare',
      label: 'Compare',
      icon: GitCompare,
      badge: compareCandidateIds.length > 0 ? `${compareCandidateIds.length}/4` : undefined
    },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'chat', label: 'AI Assistant', icon: MessageSquare },
    { id: 'report', label: 'Full Report', icon: FileCheck },
    { id: 'methodology', label: 'Methodology & Math', icon: BrainCircuit },
    { id: 'settings', label: 'Settings', icon: Sliders }
  ];

  const shortlistedCount = candidates.filter((c) => c.status === 'Shortlisted').length;

  return (
    <aside className="flex w-64 shrink-0 flex-col justify-between border-r border-slate-200 bg-slate-50/60 p-4 transition-all dark:border-slate-800 dark:bg-slate-900/60">
      <div className="space-y-6">
        {/* Navigation list */}
        <div className="space-y-1">
          <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase dark:text-slate-500">
            Navigation
          </div>
          <nav className="space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`group flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-xs dark:bg-indigo-600 dark:text-white'
                      : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`h-4 w-4 ${
                        isActive
                          ? 'text-white'
                          : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span
                      className={`rounded px-1.5 py-0.2 text-[10px] font-semibold ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Screening Stats Summary in Sidebar */}
        <div className="rounded-xl border border-slate-200/80 bg-white/70 p-3.5 shadow-2xs dark:border-slate-800 dark:bg-slate-800/40">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
            <span className="flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-indigo-500" />
              Screening Pool
            </span>
            <span className="text-slate-500 font-mono text-[11px]">{candidates.length} Loaded</span>
          </div>

          <div className="mt-3 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
              <span>Shortlisted</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {shortlistedCount}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
              <span>Under Review</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {candidates.filter((c) => c.status === 'New').length}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
              <span>Rejected</span>
              <span className="font-semibold text-rose-600 dark:text-rose-400">
                {candidates.filter((c) => c.status === 'Rejected').length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer System Status */}
      <div className="border-t border-slate-200 pt-3 text-[11px] text-slate-500 dark:border-slate-800 dark:text-slate-500">
        <div className="flex items-center justify-between">
          <span>Engine: TF-IDF + BM25 + LR</span>
          <span className="text-emerald-500">v1.2</span>
        </div>
        {settings.blindScreening && (
          <div className="mt-1 flex items-center gap-1 text-violet-600 dark:text-violet-400 font-medium">
            <Shield className="h-3 w-3" />
            <span>Blind Screening Active</span>
          </div>
        )}
      </div>
    </aside>
  );
};
