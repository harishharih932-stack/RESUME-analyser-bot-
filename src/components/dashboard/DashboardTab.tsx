import React from 'react';
import {
  Users,
  Award,
  TrendingUp,
  UserCheck,
  Clock,
  Sparkles,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  FileText,
  UploadCloud,
  ListOrdered
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ApiKeyBanner } from '../common/ApiKeyBanner';

export const DashboardTab: React.FC = () => {
  const { candidates, currentJD, setActiveTab, setSelectedCandidate, settings, runScreening, pipeline } = useApp();

  // Compute KPI metrics
  const totalResumes = candidates.length;
  const avgScore = totalResumes > 0
    ? Math.round((candidates.reduce((acc, c) => acc + c.finalScore, 0) / totalResumes) * 10) / 10
    : 0;
  const topScore = totalResumes > 0 ? Math.max(...candidates.map((c) => c.finalScore)) : 0;
  const shortlistedCount = candidates.filter((c) => c.status === 'Shortlisted').length;
  const avgExperience = totalResumes > 0
    ? Math.round((candidates.reduce((acc, c) => acc + c.parsedData.totalExperienceYears, 0) / totalResumes) * 10) / 10
    : 0;

  // Find most common candidate skill
  const skillCounts: Record<string, number> = {};
  candidates.forEach((c) => {
    c.parsedData.skills.forEach((s) => {
      skillCounts[s] = (skillCounts[s] || 0) + 1;
    });
  });
  let mostCommonSkill = 'Python';
  let maxCount = 0;
  Object.entries(skillCounts).forEach(([skill, count]) => {
    if (count > maxCount) {
      maxCount = count;
      mostCommonSkill = skill;
    }
  });

  const topCandidates = [...candidates].sort((a, b) => b.finalScore - a.finalScore).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* API Key Banner if not set */}
      <ApiKeyBanner featureName="TalentRank AI semantic reasoning" />

      {/* Header Banner */}
      <div className="flex flex-col justify-between gap-4 rounded-xl border border-indigo-100 bg-gradient-to-r from-indigo-50/80 via-white to-violet-50/60 p-6 shadow-xs sm:flex-row sm:items-center dark:border-indigo-950/60 dark:from-indigo-950/30 dark:via-slate-900 dark:to-violet-950/20">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-white">
              Screening Dashboard
            </h1>
            <span className="rounded bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300">
              Active Job: {currentJD.title}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-600 sm:text-sm dark:text-slate-400">
            Real-time candidate ranking powered by TF-IDF lexical vectors, Okapi BM25, exact skill taxonomy, and Groq LLM inference.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setActiveTab('upload')}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <UploadCloud className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span>Upload More</span>
          </button>
          <button
            onClick={() => runScreening()}
            disabled={pipeline.active || candidates.length === 0}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4" />
            <span>{pipeline.active ? 'Processing...' : 'Run Pipeline'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Total Resumes</span>
            <Users className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {totalResumes}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">Processed in memory</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Average Score</span>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {avgScore}
            <span className="text-xs text-slate-400 font-normal">/100</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500">Calibrated ensemble</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Top Score</span>
            <Award className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
            {topScore}
            <span className="text-xs text-slate-400 font-normal">/100</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500">Rank #1 match</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Shortlisted</span>
            <UserCheck className="h-4 w-4 text-violet-500" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {shortlistedCount}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">Recruiter approved</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Avg Experience</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {avgExperience} <span className="text-xs text-slate-400 font-normal">yrs</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500">Req: {currentJD.minExperienceYears}+ yrs</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Top Skill</span>
            <ShieldCheck className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="mt-2 truncate text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            {mostCommonSkill}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">{maxCount} resumes cite this</div>
        </div>
      </div>

      {/* Main Grid: Leaderboard + Quick Start Steps */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Top 5 Leaderboard */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs lg:col-span-2 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-white">Top Candidate Leaderboard</h2>
              <p className="text-xs text-slate-500">Ranked by weighted hybrid NLP, skill taxonomy & Groq score</p>
            </div>
            <button
              onClick={() => setActiveTab('ranking')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400"
            >
              <span>View All {candidates.length}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
            {topCandidates.map((cand, idx) => {
              const displayName = settings.blindScreening ? cand.blindName : cand.parsedData.name;
              const isShortlisted = cand.status === 'Shortlisted';

              return (
                <div
                  key={cand.id}
                  onClick={() => setSelectedCandidate(cand)}
                  className="group flex cursor-pointer items-center justify-between py-3 transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/50 rounded-lg px-2"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                        idx === 0
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300'
                          : idx === 1
                          ? 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200'
                          : idx === 2
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      #{idx + 1}
                    </span>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                          {displayName}
                        </span>
                        {isShortlisted && (
                          <span className="rounded bg-emerald-50 px-1.5 py-0.2 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                            Shortlisted
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span>{cand.parsedData.totalExperienceYears} yrs exp</span>
                        <span aria-hidden="true">·</span>
                        <span>{cand.parsedData.education[0]?.degree || 'Degree'}</span>
                        <span aria-hidden="true">·</span>
                        <span>{cand.skillDetails.matchedRequired.length} req skills</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Score Bar */}
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                          {cand.finalScore}
                        </span>
                        <span className="text-[10px] text-slate-400">/100</span>
                      </div>
                      <div className="h-1.5 w-24 rounded-full bg-slate-100 overflow-hidden dark:bg-slate-800">
                        <div
                          className={`h-full rounded-full ${
                            cand.finalScore >= 85
                              ? 'bg-emerald-500'
                              : cand.finalScore >= 70
                              ? 'bg-indigo-500'
                              : 'bg-amber-500'
                          }`}
                          style={{ width: `${cand.finalScore}%` }}
                        />
                      </div>
                    </div>

                    <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick-Start Stepper & Pipeline Info */}
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
            <h3 className="font-semibold text-slate-900 dark:text-white">Quick Start Pipeline</h3>
            <p className="text-xs text-slate-500">Automate screening in 4 simple steps</p>

            <div className="mt-4 space-y-3">
              <div
                onClick={() => setActiveTab('jd')}
                className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-100 p-2.5 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40"
              >
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                  1
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Define Job Description
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Set required/preferred skills & experience criteria
                  </div>
                </div>
              </div>

              <div
                onClick={() => setActiveTab('upload')}
                className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-100 p-2.5 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40"
              >
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                  2
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Upload PDF / DOCX / TXT
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Drag-drop files or click "Load Demo Data" to test
                  </div>
                </div>
              </div>

              <div
                onClick={() => runScreening()}
                className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-100 p-2.5 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40"
              >
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                  3
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Run Hybrid Screening
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Calculates TF-IDF, BM25, exact skills, and Groq LLM score
                  </div>
                </div>
              </div>

              <div
                onClick={() => setActiveTab('ranking')}
                className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-100 p-2.5 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40"
              >
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                  4
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Rank, Shortlist & Compare
                  </div>
                  <div className="text-[11px] text-slate-500">
                    In-browser Logistic Regression learns from your feedback
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Model Status Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-900 dark:text-white">Active Scoring Weights</span>
              <button
                onClick={() => setActiveTab('settings')}
                className="text-[11px] font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
              >
                Customize
              </button>
            </div>
            <div className="mt-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex justify-between">
                <span>Skill Match:</span>
                <span className="font-mono font-medium">{settings.weights.skills}%</span>
              </div>
              <div className="flex justify-between">
                <span>TF-IDF / BM25 Lexical:</span>
                <span className="font-mono font-medium">{settings.weights.lexical}%</span>
              </div>
              <div className="flex justify-between">
                <span>Experience Fit:</span>
                <span className="font-mono font-medium">{settings.weights.experience}%</span>
              </div>
              <div className="flex justify-between">
                <span>LLM Semantic (Groq):</span>
                <span className="font-mono font-medium">{settings.weights.llm}%</span>
              </div>
              <div className="flex justify-between">
                <span>Education Fit:</span>
                <span className="font-mono font-medium">{settings.weights.education}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
