/**
 * TalentRank AI - Automated Resume Screening & Candidate Ranking System
 * Hybrid NLP + Machine Learning Architecture
 */

import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { ShortcutsModal } from './components/common/ShortcutsModal';
import { DashboardTab } from './components/dashboard/DashboardTab';
import { JobDescriptionTab } from './components/jd/JobDescriptionTab';
import { UploadTab } from './components/upload/UploadTab';
import { RankingTab } from './components/ranking/RankingTab';
import { CompareTab } from './components/compare/CompareTab';
import { AnalyticsTab } from './components/analytics/AnalyticsTab';
import { ChatTab } from './components/chat/ChatTab';
import { ReportTab } from './components/report/ReportTab';
import { MethodologyTab } from './components/methodology/MethodologyTab';
import { SettingsTab } from './components/settings/SettingsTab';
import { CandidateDetailModal } from './components/detail/CandidateDetailModal';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const MainContent: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    selectedCandidate,
    setSelectedCandidate,
    settings,
    updateSettings,
    toast
  } = useApp();

  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [lastKeyPressed, setLastKeyPressed] = useState<string | null>(null);

  // Global Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input, textarea or contentEditable
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        if (e.key === 'Escape') {
          target.blur();
        }
        return;
      }

      if (e.key === '?') {
        e.preventDefault();
        setShortcutsOpen(true);
        return;
      }

      if (e.key === 'Escape') {
        setShortcutsOpen(false);
        setSelectedCandidate(null);
        return;
      }

      if (e.key === 'b' || e.key === 'B') {
        updateSettings({ blindScreening: !settings.blindScreening });
        return;
      }

      // 2-key sequence navigation: 'g' followed by key
      if (lastKeyPressed === 'g') {
        setLastKeyPressed(null);
        if (e.key === 'd') setActiveTab('dashboard');
        else if (e.key === 'r') setActiveTab('ranking');
        else if (e.key === 'u') setActiveTab('upload');
        else if (e.key === 'j') setActiveTab('jd');
        else if (e.key === 'a') setActiveTab('analytics');
        else if (e.key === 'c') setActiveTab('chat');
        else if (e.key === 's') setActiveTab('settings');
        return;
      }

      if (e.key === 'g') {
        setLastKeyPressed('g');
        setTimeout(() => setLastKeyPressed(null), 1000);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lastKeyPressed, setActiveTab, setSelectedCandidate, settings.blindScreening, updateSettings]);

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardTab />;
      case 'jd':
        return <JobDescriptionTab />;
      case 'upload':
        return <UploadTab />;
      case 'ranking':
        return <RankingTab />;
      case 'compare':
        return <CompareTab />;
      case 'analytics':
        return <AnalyticsTab />;
      case 'chat':
        return <ChatTab />;
      case 'report':
        return <ReportTab />;
      case 'methodology':
        return <MethodologyTab />;
      case 'settings':
        return <SettingsTab />;
      default:
        return <DashboardTab />;
    }
  };

  return (
    <div className="flex h-screen w-screen flex-col bg-slate-100/70 font-sans text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100">
      {/* Top Header */}
      <Header
        onOpenShortcuts={() => setShortcutsOpen(true)}
        searchQuery={globalSearch}
        setSearchQuery={setGlobalSearch}
      />

      {/* Main App Container */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Dynamic Center Pane */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">{renderActiveTab()}</div>
        </main>
      </div>

      {/* Candidate Detail Modal / Drawer */}
      <CandidateDetailModal
        candidate={selectedCandidate}
        onClose={() => setSelectedCandidate(null)}
      />

      {/* Keyboard Shortcuts Cheatsheet Modal */}
      <ShortcutsModal
        isOpen={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
      />

      {/* Global Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-medium text-slate-800 shadow-xl transition-all dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
          {toast.type === 'success' && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
          {toast.type === 'error' && <AlertCircle className="h-4 w-4 text-rose-500" />}
          {toast.type === 'info' && <Info className="h-4 w-4 text-indigo-500" />}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
