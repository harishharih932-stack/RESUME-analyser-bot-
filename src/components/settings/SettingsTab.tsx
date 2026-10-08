import React, { useState, useEffect } from 'react';
import {
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  Sliders,
  Shield,
  Moon,
  Sun,
  Trash2,
  Download,
  Upload,
  Sparkles,
  Save,
  RotateCcw,
  Cpu,
  Layers,
  RefreshCw,
  Palette
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { testGroqConnection, fetchGroqModels, POPULAR_GROQ_MODELS } from '../../lib/groq/client';
import { ScoringWeights } from '../../types';

export const SettingsTab: React.FC = () => {
  const {
    settings,
    updateSettings,
    updateWeights,
    clearAllData,
    exportProjectJSON,
    importProjectJSON,
    showToast
  } = useApp();

  const [apiKeyInput, setApiKeyInput] = useState(settings.groqApiKey || '');
  const [showKey, setShowKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Dynamic models fetched from Groq API
  const [availableModels, setAvailableModels] = useState<Array<{ id: string; name: string }>>(POPULAR_GROQ_MODELS);
  const [isFetchingModels, setIsFetchingModels] = useState(false);

  // Local weights state
  const [weights, setWeights] = useState<ScoringWeights>(settings.weights);

  const handleSaveApiKey = () => {
    updateSettings({ groqApiKey: apiKeyInput.trim() });
    showToast('Groq API Key saved successfully.', 'success');
  };

  const handleClearApiKey = () => {
    setApiKeyInput('');
    updateSettings({ groqApiKey: '' });
    setTestResult(null);
    showToast('Groq API Key cleared.', 'info');
  };

  const handleTestConnection = async () => {
    if (!apiKeyInput.trim()) {
      showToast('Please enter an API Key to test.', 'error');
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    const result = await testGroqConnection(apiKeyInput);
    setTestResult(result);
    setIsTesting(false);

    if (result.success) {
      showToast('Groq connection verified!', 'success');
      updateSettings({ groqApiKey: apiKeyInput.trim() });
      // Also fetch live model list
      handleFetchLiveModels(apiKeyInput.trim());
    } else {
      showToast(`Connection error: ${result.message}`, 'error');
    }
  };

  const handleFetchLiveModels = async (keyToUse?: string) => {
    const key = keyToUse || apiKeyInput || settings.groqApiKey;
    if (!key) {
      showToast('Enter a Groq API key first to query live models.', 'info');
      return;
    }

    setIsFetchingModels(true);
    try {
      const models = await fetchGroqModels(key);
      if (models.length > 0) {
        // Merge fetched models with default ones without duplicates
        const modelMap = new Map<string, string>();
        POPULAR_GROQ_MODELS.forEach((m) => modelMap.set(m.id, m.name));
        models.forEach((id) => {
          if (!modelMap.has(id)) {
            modelMap.set(id, id);
          }
        });

        const merged = Array.from(modelMap.entries()).map(([id, name]) => ({ id, name }));
        setAvailableModels(merged);
        showToast(`Loaded ${models.length} live models from Groq API!`, 'success');
      } else {
        showToast('Could not fetch models. Check API Key or permissions.', 'error');
      }
    } catch (e: any) {
      showToast(`Error fetching models: ${e.message}`, 'error');
    } finally {
      setIsFetchingModels(false);
    }
  };

  /**
   * Auto-normalize weights so they always sum to exactly 100%
   */
  const handleWeightChange = (key: keyof ScoringWeights, newValue: number) => {
    const oldWeights = { ...weights };
    const diff = newValue - oldWeights[key];
    const otherKeys = (Object.keys(oldWeights) as Array<keyof ScoringWeights>).filter((k) => k !== key);
    const sumOthers = otherKeys.reduce((sum, k) => sum + oldWeights[k], 0);

    const nextWeights: ScoringWeights = { ...oldWeights, [key]: newValue };

    if (sumOthers > 0) {
      let remainderSum = 0;
      otherKeys.forEach((k) => {
        const ratio = oldWeights[k] / sumOthers;
        const adjusted = Math.max(5, Math.round(oldWeights[k] - diff * ratio));
        nextWeights[k] = adjusted;
        remainderSum += adjusted;
      });

      const currentTotal = nextWeights[key] + remainderSum;
      const discrepancy = 100 - currentTotal;
      if (discrepancy !== 0 && otherKeys[0]) {
        nextWeights[otherKeys[0]] = Math.max(5, nextWeights[otherKeys[0]] + discrepancy);
      }
    }

    setWeights(nextWeights);
    updateWeights(nextWeights);
  };

  const handleResetDefaultWeights = () => {
    const defaultWeights: ScoringWeights = {
      lexical: 25,
      skills: 30,
      experience: 20,
      education: 10,
      llm: 15
    };
    setWeights(defaultWeights);
    updateWeights(defaultWeights);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        importProjectJSON(content);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-lg font-bold text-slate-900 dark:text-white">Settings & Configuration</h1>
        <p className="text-xs text-slate-500">
          Configure your Groq Cloud API credentials, model selection, visual theme (black/white background), and scoring algorithm weights.
        </p>
      </div>

      {/* 1. Groq API Configuration */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          <h2 className="font-semibold text-sm text-slate-900 dark:text-white">
            Groq Cloud API Connection
          </h2>
        </div>
        <p className="text-xs text-slate-500">
          Your key is stored only in this browser and is used to run AI analysis on candidate resumes.{' '}
          <a
            href="https://console.groq.com/keys"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 hover:underline inline-flex items-center gap-0.5 dark:text-indigo-400"
          >
            Get a free key at console.groq.com/keys
          </a>
          .
        </p>

        {/* API Key Input */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1 dark:text-slate-300">
            Groq API key
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="gsk_..."
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <button
              onClick={handleSaveApiKey}
              className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700"
            >
              <Save className="h-3.5 w-3.5" />
              <span>Save</span>
            </button>

            <button
              onClick={handleTestConnection}
              disabled={isTesting}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-2xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <Sparkles className={`h-3.5 w-3.5 text-indigo-500 ${isTesting ? 'animate-spin' : ''}`} />
              <span>{isTesting ? 'Testing...' : 'Test Connection'}</span>
            </button>

            {apiKeyInput && (
              <button
                onClick={handleClearApiKey}
                className="rounded-lg border border-slate-200 p-2 text-slate-400 hover:text-rose-600 dark:border-slate-700"
                title="Clear Key"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Test Result Feedback */}
        {testResult && (
          <div
            className={`flex items-center gap-2 rounded-lg p-3 text-xs ${
              testResult.success
                ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                : 'bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300'
            }`}
          >
            {testResult.success ? <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" /> : <XCircle className="h-4 w-4 text-rose-600 shrink-0" />}
            <span>{testResult.message}</span>
          </div>
        )}

        {/* Model Selection & Parameters */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 pt-2">
          <div className="sm:col-span-1">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Model
              </label>
              <button
                type="button"
                onClick={() => handleFetchLiveModels()}
                disabled={isFetchingModels}
                className="inline-flex items-center gap-1 text-[11px] text-indigo-600 hover:underline dark:text-indigo-400 disabled:opacity-50"
                title="Fetch all models directly from your Groq account"
              >
                <RefreshCw className={`h-2.5 w-2.5 ${isFetchingModels ? 'animate-spin' : ''}`} />
                <span>Fetch from Groq</span>
              </button>
            </div>
            <select
              value={settings.model}
              onChange={(e) => updateSettings({ model: e.target.value })}
              className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs font-mono text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              {availableModels.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex justify-between text-xs font-medium text-slate-700 mb-1 dark:text-slate-300">
              <span>Temperature</span>
              <span className="font-mono text-slate-500">{settings.temperature}</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="1.0"
              step="0.05"
              value={settings.temperature}
              onChange={(e) => updateSettings({ temperature: parseFloat(e.target.value) })}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-medium text-slate-700 mb-1 dark:text-slate-300">
              <span>Max Tokens</span>
              <span className="font-mono text-slate-500">{settings.maxTokens}</span>
            </div>
            <input
              type="number"
              min="500"
              max="4096"
              step="128"
              value={settings.maxTokens}
              onChange={(e) => updateSettings({ maxTokens: parseInt(e.target.value, 10) || 2048 })}
              className="w-full rounded-lg border border-slate-200 bg-white p-1.5 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            />
          </div>
        </div>

        {settings.model === 'custom' && (
          <div className="pt-1">
            <label className="block text-xs font-medium text-slate-700 mb-1 dark:text-slate-300">
              Custom Model Name
            </label>
            <input
              type="text"
              value={settings.customModelName || ''}
              onChange={(e) => updateSettings({ customModelName: e.target.value })}
              placeholder="e.g. openai/gpt-oss-120b or qwen/qwen3.8-27b"
              className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs font-mono text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            />
          </div>
        )}
      </div>

      {/* 2. Theme / Appearance Switcher (Black / White Background Switch) */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          <h2 className="font-semibold text-sm text-slate-900 dark:text-white">
            Appearance & Background Theme
          </h2>
        </div>
        <p className="text-xs text-slate-500">
          Switch the visual background between crisp White (Light Mode) and deep Black/Dark Slate (Dark Mode).
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {/* Light Mode Card */}
          <button
            type="button"
            onClick={() => {
              updateSettings({ theme: 'light' });
              showToast('Switched to White (Light) background.', 'info');
            }}
            className={`flex items-center gap-3.5 p-4 rounded-xl border-2 text-left transition-all ${
              settings.theme === 'light'
                ? 'border-indigo-600 bg-indigo-50/50 shadow-xs dark:bg-slate-800'
                : 'border-slate-200 bg-slate-50 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-800/40'
            }`}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-amber-500 shadow-2xs">
              <Sun className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-slate-900 dark:text-white">
                  Light Theme (White Background)
                </span>
                {settings.theme === 'light' && (
                  <CheckCircle2 className="h-4 w-4 text-indigo-600" />
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Crisp white cards, high-contrast typography, optimal for bright rooms.
              </p>
            </div>
          </button>

          {/* Dark Mode Card */}
          <button
            type="button"
            onClick={() => {
              updateSettings({ theme: 'dark' });
              showToast('Switched to Black (Dark) background.', 'info');
            }}
            className={`flex items-center gap-3.5 p-4 rounded-xl border-2 text-left transition-all ${
              settings.theme === 'dark'
                ? 'border-indigo-500 bg-slate-900 shadow-xs'
                : 'border-slate-200 bg-slate-50 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-800/40'
            }`}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-indigo-400 shadow-2xs">
              <Moon className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-slate-900 dark:text-white">
                  Dark Theme (Black Background)
                </span>
                {settings.theme === 'dark' && (
                  <CheckCircle2 className="h-4 w-4 text-indigo-400" />
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Deep black & slate background, reduces eye strain for nighttime reviews.
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* 3. Scoring Weights Sliders (Auto-normalizing to 100%) */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="font-semibold text-sm text-slate-900 dark:text-white">
              Hybrid Scoring Weights (Must sum to 100%)
            </h2>
          </div>
          <button
            onClick={handleResetDefaultWeights}
            className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:underline dark:text-indigo-400"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset Defaults</span>
          </button>
        </div>

        <p className="text-xs text-slate-500">
          Adjust the relative influence of each mathematical signal. Sliders automatically rebalance across other dimensions to maintain a 100% total.
        </p>

        <div className="space-y-3 pt-2">
          {/* Skill Match */}
          <div>
            <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
              <span>Skill Match (Canonical taxonomy exact & synonym coverage)</span>
              <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                {weights.skills}%
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="60"
              value={weights.skills}
              onChange={(e) => handleWeightChange('skills', parseInt(e.target.value, 10))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>

          {/* Lexical: TF-IDF & BM25 */}
          <div>
            <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
              <span>TF-IDF & Okapi BM25 Lexical Overlap</span>
              <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                {weights.lexical}%
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              value={weights.lexical}
              onChange={(e) => handleWeightChange('lexical', parseInt(e.target.value, 10))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>

          {/* Experience */}
          <div>
            <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
              <span>Experience Fit (Candidate years vs. JD requirement)</span>
              <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                {weights.experience}%
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="40"
              value={weights.experience}
              onChange={(e) => handleWeightChange('experience', parseInt(e.target.value, 10))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>

          {/* LLM Semantic Score */}
          <div>
            <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
              <span>Groq LLM Semantic Score (Qualitative evidence & leadership)</span>
              <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                {weights.llm}%
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="40"
              value={weights.llm}
              onChange={(e) => handleWeightChange('llm', parseInt(e.target.value, 10))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>

          {/* Education Fit */}
          <div>
            <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
              <span>Education Fit (Degree level hierarchy matching)</span>
              <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                {weights.education}%
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="30"
              value={weights.education}
              onChange={(e) => handleWeightChange('education', parseInt(e.target.value, 10))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>
        </div>

        <div className="rounded-lg bg-slate-50 p-2.5 text-right font-mono text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-400">
          Total Normalized Sum:{' '}
          <span className="font-bold text-emerald-600 dark:text-emerald-400">
            {weights.skills + weights.lexical + weights.experience + weights.education + weights.llm}%
          </span>
        </div>
      </div>

      {/* 4. Bias Mitigation & Privacy Toggles */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          <h2 className="font-semibold text-sm text-slate-900 dark:text-white">
            Ethical Governance & Workflow Preferences
          </h2>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
          {/* Blind Screening Toggle */}
          <div className="flex items-center justify-between py-3">
            <div>
              <div className="font-semibold text-slate-900 dark:text-white">
                Blind Screening Mode
              </div>
              <div className="text-slate-500">
                Replaces names, contact info, and photos with anonymous identifiers (e.g. "Candidate #1") to reduce demographic and unconscious bias.
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.blindScreening}
                onChange={(e) => updateSettings({ blindScreening: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:width-5 after:transition-all peer-checked:bg-indigo-600 dark:bg-slate-700"></div>
            </label>
          </div>

          {/* Auto Generate Report */}
          <div className="flex items-center justify-between py-3">
            <div>
              <div className="font-semibold text-slate-900 dark:text-white">
                Auto-generate Executive Report after screening
              </div>
              <div className="text-slate-500">
                Immediately navigate to the Report tab once batch screening is completed.
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoGenerateReport}
                onChange={(e) => updateSettings({ autoGenerateReport: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:width-5 after:transition-all peer-checked:bg-indigo-600 dark:bg-slate-700"></div>
            </label>
          </div>
        </div>
      </div>

      {/* 5. Data Management: Export / Import / Clear */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="font-semibold text-sm text-slate-900 dark:text-white">
          Data Backup & Storage
        </h2>
        <p className="text-xs text-slate-500">
          Export your entire project (parsed resumes, rankings, feedback, chat history) or reset all stored browser data.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={exportProjectJSON}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-2xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <Download className="h-4 w-4 text-indigo-600" />
            <span>Export Project JSON</span>
          </button>

          <label className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-2xs cursor-pointer dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
            <Upload className="h-4 w-4 text-emerald-600" />
            <span>Import Project JSON</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileImport}
              className="hidden"
            />
          </label>

          <button
            onClick={clearAllData}
            className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 shadow-2xs dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300"
          >
            <Trash2 className="h-4 w-4" />
            <span>Clear All Stored Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
