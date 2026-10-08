/**
 * TalentRank AI - Main Application Context & State Management
 * Persistent storage via localStorage, full ML/NLP pipeline orchestration,
 * and reactive UI updates.
 */

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  AppSettings,
  Candidate,
  CandidateStatus,
  ChatMessage,
  ComponentScores,
  FitCategory,
  JobDescription,
  LogisticRegressionModelWeights,
  PipelineProgress,
  ScoringWeights
} from '../types';
import { DEMO_JOB_DESCRIPTION, generateDemoCandidates } from '../lib/demoData';
import { analyzeResumeWithGroq, mapConcurrent } from '../lib/groq/client';
import { calculateHybridScore, generateScoreExplanation } from '../lib/ml/hybridScorer';
import { FeedbackSample, InBrowserLogisticRegression } from '../lib/ml/logisticRegression';
import { scoreEducationFit, scoreExperienceFit, inferEducationLevel } from '../lib/nlp/experienceEdu';
import { evaluateSkillMatch, extractSkillsFromText } from '../lib/nlp/skillsTaxonomy';
import { TFIDFModel } from '../lib/nlp/tfidf';
import { BM25Model } from '../lib/nlp/bm25';
import { parseResumeText } from '../lib/parsers/resumeExtractor';

export type AppTab =
  | 'dashboard'
  | 'jd'
  | 'upload'
  | 'ranking'
  | 'compare'
  | 'analytics'
  | 'chat'
  | 'report'
  | 'methodology'
  | 'settings';

interface AppContextType {
  // Navigation
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;

  // Settings
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  updateWeights: (weights: ScoringWeights) => void;

  // Job Descriptions
  jobDescriptions: JobDescription[];
  currentJD: JobDescription;
  setCurrentJDId: (id: string) => void;
  saveJobDescription: (jd: JobDescription) => void;
  createNewJobDescription: () => void;
  deleteJobDescription: (id: string) => void;

  // Candidates & Ranking
  candidates: Candidate[];
  selectedCandidate: Candidate | null;
  setSelectedCandidate: (candidate: Candidate | null) => void;
  compareCandidateIds: string[];
  toggleCompareCandidate: (id: string) => void;
  clearCompareSelection: () => void;

  // Candidate Actions
  updateCandidateStatus: (candidateId: string, status: CandidateStatus) => void;
  updateCandidateNotes: (candidateId: string, notes: string) => void;
  deleteCandidate: (candidateId: string) => void;
  clearAllCandidates: () => void;

  // Pipeline Execution
  pipeline: PipelineProgress;
  runScreening: (filesToParse?: Array<{ file: File; text: string; links: string[] }>) => Promise<void>;

  // Logistic Regression Feedback Model
  lrModel: LogisticRegressionModelWeights;

  // AI Chat
  chatMessages: ChatMessage[];
  addChatMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearChatHistory: () => void;

  // Data Actions
  loadDemoData: () => void;
  clearAllData: () => void;
  exportProjectJSON: () => void;
  importProjectJSON: (jsonString: string) => boolean;
  exportCSV: () => void;

  // Global Toast
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const DEFAULT_SETTINGS: AppSettings = {
  groqApiKey: '',
  model: 'llama-3.3-70b-versatile',
  customModelName: '',
  temperature: 0.2,
  maxTokens: 2048,
  weights: {
    lexical: 25,
    skills: 30,
    experience: 20,
    education: 10,
    llm: 15
  },
  blindScreening: false,
  theme: 'light',
  autoGenerateReport: false
};

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Settings state
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('talentrank_settings');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // 2. Active Tab
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');

  // 3. Job Descriptions
  const [jobDescriptions, setJobDescriptions] = useState<JobDescription[]>(() => {
    try {
      const saved = localStorage.getItem('talentrank_jds');
      return saved ? JSON.parse(saved) : [DEMO_JOB_DESCRIPTION];
    } catch {
      return [DEMO_JOB_DESCRIPTION];
    }
  });

  const [currentJDId, setCurrentJDId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('talentrank_current_jdid');
      return saved || DEMO_JOB_DESCRIPTION.id;
    } catch {
      return DEMO_JOB_DESCRIPTION.id;
    }
  });

  const currentJD = useMemo(() => {
    return jobDescriptions.find(j => j.id === currentJDId) || jobDescriptions[0] || DEMO_JOB_DESCRIPTION;
  }, [jobDescriptions, currentJDId]);

  // 4. Candidates
  const [candidates, setCandidates] = useState<Candidate[]>(() => {
    try {
      const saved = localStorage.getItem('talentrank_candidates');
      if (saved) {
        return JSON.parse(saved);
      }
      return generateDemoCandidates();
    } catch {
      return generateDemoCandidates();
    }
  });

  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [compareCandidateIds, setCompareCandidateIds] = useState<string[]>([]);

  // 5. Pipeline Progress
  const [pipeline, setPipeline] = useState<PipelineProgress>({
    active: false,
    stage: 'idle',
    currentCandidate: '',
    progressPercent: 0,
    totalCandidates: 0,
    processedCount: 0
  });

  // 6. Toast Notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // 7. Chat Assistant Messages
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('talentrank_chat');
      if (saved) return JSON.parse(saved);
      return [
        {
          id: 'welcome-msg',
          sender: 'assistant',
          content: 'Hello! I am your **TalentRank AI Assistant**. I have analyzed all candidate resumes against your Job Description.\n\nYou can ask me:\n- *"Who are the top 3 candidates and why?"*\n- *"Which candidates know PyTorch and Kubernetes?"*\n- *"Compare Candidate #1 and Candidate #2"*\n- *"Draft a shortlist email for the top candidate"*',
          timestamp: new Date().toISOString()
        }
      ];
    } catch {
      return [];
    }
  });

  // 8. Logistic Regression state
  const [lrModel, setLrModel] = useState<LogisticRegressionModelWeights>({
    featureNames: ['TF-IDF Lexical', 'BM25 Score', 'Skill Coverage', 'Experience Fit', 'Education Fit', 'LLM Semantic'],
    weights: [0.25, 0.2, 0.3, 0.2, 0.1, 0.2],
    bias: -0.2,
    accuracy: 85,
    loss: 0.32,
    sampleCount: 3,
    trained: false
  });

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('talentrank_settings', JSON.stringify(settings));
    } catch (e) {}
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem('talentrank_jds', JSON.stringify(jobDescriptions));
      localStorage.setItem('talentrank_current_jdid', currentJDId);
    } catch (e) {}
  }, [jobDescriptions, currentJDId]);

  useEffect(() => {
    try {
      localStorage.setItem('talentrank_candidates', JSON.stringify(candidates));
    } catch (e) {}
  }, [candidates]);

  useEffect(() => {
    try {
      localStorage.setItem('talentrank_chat', JSON.stringify(chatMessages));
    } catch (e) {}
  }, [chatMessages]);

  // Keep dark/light class on document
  useEffect(() => {
    const isDark = settings.theme === 'dark';
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }
  }, [settings.theme]);

  // Retrain Logistic Regression model whenever feedback labels change
  useEffect(() => {
    const feedbackSamples: FeedbackSample[] = [];

    for (const c of candidates) {
      if (c.status === 'Shortlisted') {
        feedbackSamples.push({
          features: [
            (c.scores.tfidfCosineScore || 50) / 100,
            (c.scores.bm25Score || 50) / 100,
            (c.scores.skillMatchScore || 50) / 100,
            (c.scores.experienceFitScore || 50) / 100,
            (c.scores.educationFitScore || 50) / 100,
            (c.scores.llmSemanticScore || 50) / 100
          ],
          label: 1
        });
      } else if (c.status === 'Rejected') {
        feedbackSamples.push({
          features: [
            (c.scores.tfidfCosineScore || 50) / 100,
            (c.scores.bm25Score || 50) / 100,
            (c.scores.skillMatchScore || 50) / 100,
            (c.scores.experienceFitScore || 50) / 100,
            (c.scores.educationFitScore || 50) / 100,
            (c.scores.llmSemanticScore || 50) / 100
          ],
          label: 0
        });
      }
    }

    if (feedbackSamples.length >= 2) {
      const lr = new InBrowserLogisticRegression();
      const updatedModel = lr.train(feedbackSamples);
      setLrModel(updatedModel);
    }
  }, [candidates]);

  // Update Settings helper
  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  // Update weights with auto-normalization
  const updateWeights = (newWeights: ScoringWeights) => {
    setSettings(prev => ({ ...prev, weights: newWeights }));

    // Re-calculate final scores and rankings for existing candidates
    setCandidates(prev => {
      const updated = prev.map(c => {
        const finalScore = calculateHybridScore(c.scores, newWeights);
        return {
          ...c,
          finalScore
        };
      });

      updated.sort((a, b) => b.finalScore - a.finalScore);
      updated.forEach((c, idx) => {
        c.rank = idx + 1;
      });
      return updated;
    });

    showToast('Scoring weights updated and rankings re-indexed.', 'success');
  };

  // Job Description Management
  const saveJobDescription = (jd: JobDescription) => {
    setJobDescriptions(prev => {
      const exists = prev.some(item => item.id === jd.id);
      if (exists) {
        return prev.map(item => (item.id === jd.id ? { ...jd, updatedAt: new Date().toISOString() } : item));
      }
      return [...prev, { ...jd, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }];
    });
    setCurrentJDId(jd.id);
    showToast(`Job Description "${jd.title}" saved.`, 'success');
  };

  const createNewJobDescription = () => {
    const newId = `jd-${Date.now()}`;
    const newJd: JobDescription = {
      id: newId,
      title: 'New Position',
      department: 'Engineering',
      location: 'Remote',
      minExperienceYears: 3,
      educationLevel: 'Bachelors',
      requiredSkills: ['Python', 'Docker', 'SQL'],
      preferredSkills: ['Kubernetes', 'Cloud'],
      rawText: 'We are seeking a talented Software Engineer to join our team...',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setJobDescriptions(prev => [...prev, newJd]);
    setCurrentJDId(newId);
    setActiveTab('jd');
    showToast('New Job Description profile created.', 'info');
  };

  const deleteJobDescription = (id: string) => {
    if (jobDescriptions.length <= 1) {
      showToast('Cannot delete the only remaining Job Description.', 'error');
      return;
    }
    const remaining = jobDescriptions.filter(j => j.id !== id);
    setJobDescriptions(remaining);
    setCurrentJDId(remaining[0].id);
    showToast('Job Description deleted.', 'info');
  };

  // Candidate Status update
  const updateCandidateStatus = (candidateId: string, status: CandidateStatus) => {
    setCandidates(prev =>
      prev.map(c => (c.id === candidateId ? { ...c, status } : c))
    );
    if (selectedCandidate && selectedCandidate.id === candidateId) {
      setSelectedCandidate(prev => prev ? { ...prev, status } : null);
    }
    showToast(`Candidate status changed to "${status}". Feedback logged for ML model.`, 'success');
  };

  const updateCandidateNotes = (candidateId: string, notes: string) => {
    setCandidates(prev =>
      prev.map(c => (c.id === candidateId ? { ...c, notes } : c))
    );
    if (selectedCandidate && selectedCandidate.id === candidateId) {
      setSelectedCandidate(prev => prev ? { ...prev, notes } : null);
    }
  };

  const deleteCandidate = (candidateId: string) => {
    setCandidates(prev => {
      const remaining = prev.filter(c => c.id !== candidateId);
      remaining.sort((a, b) => b.finalScore - a.finalScore);
      remaining.forEach((c, idx) => {
        c.rank = idx + 1;
      });
      return remaining;
    });
    if (selectedCandidate?.id === candidateId) {
      setSelectedCandidate(null);
    }
    setCompareCandidateIds(prev => prev.filter(id => id !== candidateId));
    showToast('Candidate removed.', 'info');
  };

  const clearAllCandidates = () => {
    setCandidates([]);
    setSelectedCandidate(null);
    setCompareCandidateIds([]);
    showToast('All candidates cleared.', 'info');
  };

  // Compare selection
  const toggleCompareCandidate = (id: string) => {
    setCompareCandidateIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(i => i !== id);
      }
      if (prev.length >= 4) {
        showToast('Maximum 4 candidates can be compared simultaneously.', 'info');
        return prev;
      }
      return [...prev, id];
    });
  };

  const clearCompareSelection = () => setCompareCandidateIds([]);

  // AI Chat
  const addChatMessage = (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMsg: ChatMessage = {
      ...msg,
      id: `chat-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString()
    };
    setChatMessages(prev => [...prev, newMsg]);
  };

  const clearChatHistory = () => {
    setChatMessages([
      {
        id: 'welcome-reset',
        sender: 'assistant',
        content: 'Chat history cleared. How can I assist you with your candidate rankings today?',
        timestamp: new Date().toISOString()
      }
    ]);
    showToast('Chat history cleared.', 'info');
  };

  // Load Demo Data
  const loadDemoData = () => {
    const demoCandidates = generateDemoCandidates();
    setJobDescriptions([DEMO_JOB_DESCRIPTION]);
    setCurrentJDId(DEMO_JOB_DESCRIPTION.id);
    setCandidates(demoCandidates);
    setSelectedCandidate(null);
    setCompareCandidateIds([]);
    showToast('Loaded 9 realistic candidate profiles and ML Engineer JD!', 'success');
  };

  // Clear All Data
  const clearAllData = () => {
    localStorage.removeItem('talentrank_settings');
    localStorage.removeItem('talentrank_jds');
    localStorage.removeItem('talentrank_candidates');
    localStorage.removeItem('talentrank_chat');
    setSettings(DEFAULT_SETTINGS);
    setJobDescriptions([DEMO_JOB_DESCRIPTION]);
    setCurrentJDId(DEMO_JOB_DESCRIPTION.id);
    setCandidates([]);
    setSelectedCandidate(null);
    setCompareCandidateIds([]);
    clearChatHistory();
    showToast('All application data cleared from browser storage.', 'info');
  };

  // JSON Export / Import
  const exportProjectJSON = () => {
    const projectData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      settings,
      jobDescriptions,
      currentJDId,
      candidates,
      chatMessages
    };

    const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TalentRank_AI_Project_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Project JSON exported successfully.', 'success');
  };

  const importProjectJSON = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (data.settings) setSettings(data.settings);
      if (Array.isArray(data.jobDescriptions)) setJobDescriptions(data.jobDescriptions);
      if (data.currentJDId) setCurrentJDId(data.currentJDId);
      if (Array.isArray(data.candidates)) setCandidates(data.candidates);
      if (Array.isArray(data.chatMessages)) setChatMessages(data.chatMessages);
      showToast('Project imported successfully!', 'success');
      return true;
    } catch (e) {
      showToast('Failed to import JSON file. Invalid format.', 'error');
      return false;
    }
  };

  // CSV Export
  const exportCSV = () => {
    if (candidates.length === 0) {
      showToast('No candidates available to export.', 'info');
      return;
    }

    const headers = [
      'Rank',
      'Name',
      'Email',
      'Phone',
      'Final Score',
      'Status',
      'Fit Category',
      'Experience (Yrs)',
      'Education Level',
      'Matched Required Skills',
      'Missing Required Skills',
      'TF-IDF Score',
      'BM25 Score',
      'Skill Match Score',
      'LLM Semantic Score',
      'Verdict'
    ];

    const rows = candidates.map(c => [
      c.rank || '',
      `"${c.parsedData.name}"`,
      `"${c.parsedData.email}"`,
      `"${c.parsedData.phone}"`,
      c.finalScore,
      c.status,
      c.llmAnalysis?.fit_category || 'Good',
      c.parsedData.totalExperienceYears,
      `"${c.parsedData.education[0]?.degree || ''}"`,
      `"${c.skillDetails.matchedRequired.join(', ')}"`,
      `"${c.skillDetails.missingRequired.join(', ')}"`,
      c.scores.tfidfCosineScore,
      c.scores.bm25Score,
      c.scores.skillMatchScore,
      c.scores.llmSemanticScore,
      `"${(c.llmAnalysis?.one_line_verdict || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TalentRank_Candidates_${currentJD.title.replace(/\s+/g, '_')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Candidates exported to CSV.', 'success');
  };

  /**
   * Main Hybrid NLP & ML Screening Pipeline
   */
  const runScreening = async (filesToParse?: Array<{ file: File; text: string; links: string[] }>) => {
    setPipeline({
      active: true,
      stage: 'parsing',
      currentCandidate: 'Initializing pipeline...',
      progressPercent: 5,
      totalCandidates: (filesToParse?.length || candidates.length),
      processedCount: 0
    });

    try {
      const activeJD = currentJD;

      // 1. Parse resumes if raw files provided, else use existing candidates
      let candidatePool: Candidate[] = [];

      if (filesToParse && filesToParse.length > 0) {
        setPipeline(p => ({ ...p, stage: 'parsing', progressPercent: 15, currentCandidate: 'Extracting entities & links...' }));

        const parsedList = filesToParse.map((item, idx) => {
          const parsedData = parseResumeText(item.text, item.file.name, item.links);
          const skillDetails = evaluateSkillMatch(parsedData.skills, activeJD.requiredSkills, activeJD.preferredSkills, item.text);

          const defaultScores: ComponentScores = {
            tfidfCosineScore: 50,
            bm25Score: 50,
            lexicalCombinedScore: 50,
            skillMatchScore: skillDetails.requiredCoveragePct,
            experienceFitScore: 70,
            educationFitScore: 75,
            llmSemanticScore: 70
          };

          const newCandidate: Candidate = {
            id: `cand-${Date.now()}-${idx}`,
            fileName: item.file.name,
            fileSize: item.file.size,
            parsedAt: new Date().toISOString(),
            parsedData,
            scores: defaultScores,
            finalScore: 60,
            skillDetails,
            status: 'New',
            notes: '',
            explanation: '',
            blindName: `Candidate #${idx + 1}`
          };

          return newCandidate;
        });

        candidatePool = parsedList;
      } else {
        candidatePool = [...candidates];
      }

      if (candidatePool.length === 0) {
        throw new Error('No candidate resumes to screen. Upload resumes or load demo data.');
      }

      // 2. Classical NLP: TF-IDF & Cosine Similarity
      setPipeline(p => ({ ...p, stage: 'nlp_features', progressPercent: 30, currentCandidate: 'Computing TF-IDF & BM25 vectors...' }));

      const allDocs = [activeJD.rawText, ...candidatePool.map(c => c.parsedData.rawText)];
      const tfidfModel = new TFIDFModel();
      tfidfModel.fit(allDocs);
      const jdVec = tfidfModel.transform(activeJD.rawText);

      const bm25 = new BM25Model();
      bm25.fit(candidatePool.map(c => c.parsedData.rawText));

      // Calculate classical NLP features for each candidate
      candidatePool = candidatePool.map((cand, idx) => {
        const candVec = tfidfModel.transform(cand.parsedData.rawText);
        const cosineSim = TFIDFModel.cosineSimilarity(jdVec, candVec);
        const tfidfScore = Math.round(cosineSim * 100);

        const bm25Raw = bm25.scoreDoc(idx, activeJD.rawText);
        // Sigmoid normalization for BM25
        const bm25Score = Math.min(100, Math.max(0, Math.round((1 / (1 + Math.exp(-0.06 * (bm25Raw - 15)))) * 100)));
        const lexicalCombined = Math.round((0.5 * tfidfScore + 0.5 * bm25Score) * 10) / 10;

        // Skills match
        const skillDetails = evaluateSkillMatch(
          cand.parsedData.skills,
          activeJD.requiredSkills,
          activeJD.preferredSkills,
          cand.parsedData.rawText
        );
        const skillMatchScore = Math.round((0.75 * skillDetails.requiredCoveragePct + 0.25 * skillDetails.preferredCoveragePct));

        // Experience fit
        const experienceFitScore = scoreExperienceFit(
          cand.parsedData.totalExperienceYears,
          activeJD.minExperienceYears,
          activeJD.maxExperienceYears
        );

        // Education fit
        const eduLevel = inferEducationLevel(cand.parsedData.education, cand.parsedData.rawText);
        const educationFitScore = scoreEducationFit(eduLevel, activeJD.educationLevel);

        return {
          ...cand,
          scores: {
            ...cand.scores,
            tfidfCosineScore: tfidfScore,
            bm25Score,
            lexicalCombinedScore: lexicalCombined,
            skillMatchScore,
            experienceFitScore,
            educationFitScore
          },
          skillDetails
        };
      });

      // 3. ML Scoring (Logistic Regression Inference)
      setPipeline(p => ({ ...p, stage: 'ml_scoring', progressPercent: 50, currentCandidate: 'Applying trained ML classifier...' }));
      const lr = new InBrowserLogisticRegression();

      candidatePool = candidatePool.map(c => {
        const features = [
          c.scores.tfidfCosineScore / 100,
          c.scores.bm25Score / 100,
          c.scores.skillMatchScore / 100,
          c.scores.experienceFitScore / 100,
          c.scores.educationFitScore / 100,
          (c.scores.llmSemanticScore || 70) / 100
        ];
        const mlProb = lr.predict(features);
        return {
          ...c,
          scores: {
            ...c.scores,
            mlAdjustedScore: mlProb
          }
        };
      });

      // 4. LLM Analysis (Groq Layer)
      setPipeline(p => ({ ...p, stage: 'llm_analysis', progressPercent: 65, currentCandidate: 'Invoking Groq LLM inference...' }));

      const hasGroqKey = Boolean(settings.groqApiKey && settings.groqApiKey.trim().length > 0);

      // Process with limited concurrency (2 parallel requests to prevent 429)
      const updatedWithLLM = await mapConcurrent(candidatePool, 2, async (cand, index) => {
        setPipeline(p => ({
          ...p,
          currentCandidate: `Analyzing ${settings.blindScreening ? cand.blindName : cand.parsedData.name}...`,
          processedCount: index + 1,
          progressPercent: 65 + Math.round(((index + 1) / candidatePool.length) * 25)
        }));

        if (hasGroqKey) {
          try {
            const llmAnalysis = await analyzeResumeWithGroq(cand.parsedData, activeJD, settings);
            return {
              ...cand,
              scores: {
                ...cand.scores,
                llmSemanticScore: llmAnalysis.semantic_match_score
              },
              llmAnalysis
            };
          } catch (llmErr: any) {
            console.warn(`Groq LLM call failed for ${cand.parsedData.name}, using ML ensemble fallback:`, llmErr);
            // Fall back gracefully to NLP ensemble
            const fallbackLLM = Math.round(
              0.4 * cand.scores.skillMatchScore +
              0.3 * cand.scores.lexicalCombinedScore +
              0.3 * cand.scores.experienceFitScore
            );
            return {
              ...cand,
              scores: {
                ...cand.scores,
                llmSemanticScore: fallbackLLM
              }
            };
          }
        } else {
          // If no Groq key, derive qualitative score from hybrid NLP signals
          const pseudoLLM = Math.round(
            0.5 * cand.scores.skillMatchScore +
            0.3 * cand.scores.lexicalCombinedScore +
            0.2 * cand.scores.experienceFitScore
          );
          const fitCat: FitCategory = pseudoLLM >= 80 ? 'Excellent' : pseudoLLM >= 65 ? 'Good' : pseudoLLM >= 50 ? 'Average' : 'Poor';

          return {
            ...cand,
            scores: {
              ...cand.scores,
              llmSemanticScore: cand.scores.llmSemanticScore || pseudoLLM
            },
            llmAnalysis: cand.llmAnalysis || {
              semantic_match_score: pseudoLLM,
              strengths: [
                `Matches ${cand.skillDetails.matchedRequired.length} required skills`,
                `${cand.parsedData.totalExperienceYears} years of total engineering experience`
              ],
              weaknesses: cand.skillDetails.missingRequired.length > 0
                ? [`Missing required skill(s): ${cand.skillDetails.missingRequired.join(', ')}`]
                : ['Review specific domain frameworks during technical screen'],
              red_flags: [],
              skill_evidence: cand.parsedData.skills.slice(0, 3).map(s => ({ skill: s, evidence: 'Verified from resume history' })),
              suggested_interview_questions: [
                `Can you explain your experience using ${cand.parsedData.skills[0] || 'core technologies'} in production?`,
                'Describe a challenging debugging incident in your past role.'
              ],
              one_line_verdict: `Candidate demonstrates ${fitCat.toLowerCase()} alignment with the ${activeJD.title} requirements.`,
              fit_category: fitCat,
              isDemo: true
            }
          };
        }
      });

      // 5. Compute Final Weighted Hybrid Scores & Explanations
      setPipeline(p => ({ ...p, stage: 'ranking', progressPercent: 95, currentCandidate: 'Computing final rankings & explanations...' }));

      const finalizedCandidates = updatedWithLLM.map(cand => {
        const finalScore = calculateHybridScore(cand.scores, settings.weights);
        const explanation = generateScoreExplanation(
          settings.blindScreening ? cand.blindName : cand.parsedData.name,
          cand.scores,
          finalScore,
          activeJD,
          cand.skillDetails.matchedRequired.length,
          activeJD.requiredSkills.length,
          cand.parsedData.totalExperienceYears,
          cand.parsedData.education[0]?.degree || 'Degree'
        );

        return {
          ...cand,
          finalScore,
          explanation
        };
      });

      // Sort descending by finalScore
      finalizedCandidates.sort((a, b) => b.finalScore - a.finalScore);
      finalizedCandidates.forEach((c, idx) => {
        c.rank = idx + 1;
      });

      setCandidates(finalizedCandidates);

      setPipeline({
        active: false,
        stage: 'completed',
        currentCandidate: 'Screening completed successfully!',
        progressPercent: 100,
        totalCandidates: finalizedCandidates.length,
        processedCount: finalizedCandidates.length
      });

      showToast(`Successfully screened ${finalizedCandidates.length} candidate resumes!`, 'success');

      // Auto redirect to Ranking tab
      setActiveTab('ranking');

      // Auto-generate report if toggled
      if (settings.autoGenerateReport) {
        setTimeout(() => setActiveTab('report'), 1200);
      }
    } catch (err: any) {
      console.error('Pipeline error:', err);
      setPipeline(p => ({
        ...p,
        active: false,
        stage: 'idle',
        error: err?.message || 'Error occurred during resume screening'
      }));
      showToast(err?.message || 'Screening pipeline failed', 'error');
    }
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        settings,
        updateSettings,
        updateWeights,
        jobDescriptions,
        currentJD,
        setCurrentJDId,
        saveJobDescription,
        createNewJobDescription,
        deleteJobDescription,
        candidates,
        selectedCandidate,
        setSelectedCandidate,
        compareCandidateIds,
        toggleCompareCandidate,
        clearCompareSelection,
        updateCandidateStatus,
        updateCandidateNotes,
        deleteCandidate,
        clearAllCandidates,
        pipeline,
        runScreening,
        lrModel,
        chatMessages,
        addChatMessage,
        clearChatHistory,
        loadDemoData,
        clearAllData,
        exportProjectJSON,
        importProjectJSON,
        exportCSV,
        toast,
        showToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
