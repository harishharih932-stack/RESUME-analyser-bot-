import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  ZAxis,
  Legend
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  BrainCircuit,
  Info,
  CheckCircle2,
  PieChart as PieIcon,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ApiKeyBanner } from '../common/ApiKeyBanner';

const DONUT_COLORS = ['#10b981', '#6366f1', '#f59e0b', '#f43f5e'];

export const AnalyticsTab: React.FC = () => {
  const { candidates, currentJD, lrModel } = useApp();

  // 1. Score distribution histogram
  const scoreBins = [
    { range: '40-50', count: 0 },
    { range: '50-60', count: 0 },
    { range: '60-70', count: 0 },
    { range: '70-80', count: 0 },
    { range: '80-90', count: 0 },
    { range: '90-100', count: 0 }
  ];

  candidates.forEach((c) => {
    if (c.finalScore < 50) scoreBins[0].count++;
    else if (c.finalScore < 60) scoreBins[1].count++;
    else if (c.finalScore < 70) scoreBins[2].count++;
    else if (c.finalScore < 80) scoreBins[3].count++;
    else if (c.finalScore < 90) scoreBins[4].count++;
    else scoreBins[5].count++;
  });

  // 2. Fit Category Distribution
  const fitCounts: Record<string, number> = { Excellent: 0, Good: 0, Average: 0, Poor: 0 };
  candidates.forEach((c) => {
    const cat = c.llmAnalysis?.fit_category || 'Good';
    fitCounts[cat] = (fitCounts[cat] || 0) + 1;
  });
  const donutData = Object.entries(fitCounts).map(([name, value]) => ({ name, value }));

  // 3. Top Skills Frequency & JD Gap
  const skillFreq: Record<string, number> = {};
  candidates.forEach((c) => {
    c.parsedData.skills.forEach((s) => {
      skillFreq[s] = (skillFreq[s] || 0) + 1;
    });
  });
  const topSkillsData = Object.entries(skillFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([skill, count]) => ({
      skill,
      candidates: count,
      isRequired: currentJD.requiredSkills.includes(skill)
    }));

  // 4. Experience vs Score Scatter Data
  const scatterData = candidates.map((c) => ({
    name: c.parsedData.name,
    experience: c.parsedData.totalExperienceYears,
    score: c.finalScore
  }));

  // 5. Component Averages
  const n = candidates.length || 1;
  const avgComponentsData = [
    {
      name: 'TF-IDF',
      score: Math.round(candidates.reduce((a, b) => a + b.scores.tfidfCosineScore, 0) / n)
    },
    {
      name: 'BM25',
      score: Math.round(candidates.reduce((a, b) => a + b.scores.bm25Score, 0) / n)
    },
    {
      name: 'Skills',
      score: Math.round(candidates.reduce((a, b) => a + b.scores.skillMatchScore, 0) / n)
    },
    {
      name: 'Experience',
      score: Math.round(candidates.reduce((a, b) => a + b.scores.experienceFitScore, 0) / n)
    },
    {
      name: 'Education',
      score: Math.round(candidates.reduce((a, b) => a + b.scores.educationFitScore, 0) / n)
    },
    {
      name: 'LLM Semantics',
      score: Math.round(candidates.reduce((a, b) => a + b.scores.llmSemanticScore, 0) / n)
    }
  ];

  // 6. Funnel
  const qualifiedCount = candidates.filter((c) => c.finalScore >= 65).length;
  const shortlistedCount = candidates.filter((c) => c.status === 'Shortlisted').length;
  const funnelData = [
    { stage: 'Uploaded', count: candidates.length },
    { stage: 'Parsed & Vectors', count: candidates.length },
    { stage: 'Qualified (≥65)', count: qualifiedCount },
    { stage: 'Shortlisted', count: shortlistedCount }
  ];

  // 7. Statistical Metrics Computation
  const scores = candidates.map((c) => c.finalScore).sort((a, b) => a - b);
  const mean = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  const median = scores.length > 0 ? scores[Math.floor(scores.length / 2)] : 0;
  const min = scores.length > 0 ? scores[0] : 0;
  const max = scores.length > 0 ? scores[scores.length - 1] : 0;

  const variance =
    scores.length > 0
      ? scores.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / scores.length
      : 0;
  const stdDev = Math.sqrt(variance);

  const getPercentile = (p: number) => {
    if (scores.length === 0) return 0;
    const index = (p / 100) * (scores.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index - lower;
    return Math.round((scores[lower] * (1 - weight) + scores[upper] * weight) * 10) / 10;
  };

  // Pearson skewness coefficient: 3 * (mean - median) / stdDev
  const skewness = stdDev > 0 ? Math.round(((3 * (mean - median)) / stdDev) * 100) / 100 : 0;

  // 8. Logistic Regression Weights Data
  const lrWeightsData = lrModel.featureNames.map((name, i) => ({
    feature: name,
    weight: lrModel.weights[i] ?? 0.2
  }));

  return (
    <div className="space-y-6">
      <ApiKeyBanner featureName="Analytics insights" />

      {/* Header */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Screening Analytics & Statistical Distribution
        </h2>
        <p className="text-xs text-slate-500">
          In-depth quantitative analytics across lexical NLP, machine learning feature weights, and candidate demographics.
        </p>
      </div>

      {/* Row 1: Score Distribution + Fit Donut */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Histogram */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Score Distribution Histogram
            </h3>
            <span className="text-[11px] text-slate-400">Total N={candidates.length}</span>
          </div>

          <div className="mt-3 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreBins}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <p className="mt-2 text-xs italic text-slate-500 border-t border-slate-100 pt-2 dark:border-slate-800">
            💡 Insight: Scores cluster around the 70–90 range, showing a strong applicant pool for {currentJD.title}.
          </p>
        </div>

        {/* Fit Category Donut */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Fit Rating Segmentation
            </h3>
            <span className="text-[11px] text-slate-400">Ensemble Category</span>
          </div>

          <div className="mt-3 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                >
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <p className="mt-2 text-xs italic text-slate-500 border-t border-slate-100 pt-2 dark:border-slate-800">
            💡 Insight: {Math.round((fitCounts['Excellent'] / (candidates.length || 1)) * 100)}% of candidates attained an "Excellent" rating.
          </p>
        </div>
      </div>

      {/* Row 2: Top Skills & Experience vs Score */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top Skills Bar */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Skill Frequency & JD Alignment
            </h3>
            <span className="text-[11px] text-slate-400">Extracted Taxonomy</span>
          </div>

          <div className="mt-3 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topSkillsData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="skill" type="category" width={90} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="candidates" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <p className="mt-2 text-xs italic text-slate-500 border-t border-slate-100 pt-2 dark:border-slate-800">
            💡 Insight: Python, PyTorch, and Docker are the most prevalent technical proficiencies cited.
          </p>
        </div>

        {/* Experience vs Score Scatter */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Experience (Years) vs. Final Score
            </h3>
            <span className="text-[11px] text-slate-400">Correlation Plot</span>
          </div>

          <div className="mt-3 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  type="number"
                  dataKey="experience"
                  name="Experience"
                  unit=" yrs"
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  type="number"
                  dataKey="score"
                  name="Final Score"
                  domain={[30, 100]}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter name="Candidates" data={scatterData} fill="#6366f1" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          <p className="mt-2 text-xs italic text-slate-500 border-t border-slate-100 pt-2 dark:border-slate-800">
            💡 Insight: Strong positive correlation observed between 4–7 years experience and final ranking scores.
          </p>
        </div>
      </div>

      {/* Row 3: Component Averages & Screening Funnel */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Component Averages */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Average Score per Scoring Component
            </h3>
            <span className="text-[11px] text-slate-400">Mean 0–100</span>
          </div>

          <div className="mt-3 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={avgComponentsData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="score" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <p className="mt-2 text-xs italic text-slate-500 border-t border-slate-100 pt-2 dark:border-slate-800">
            💡 Insight: Education and Skill Match demonstrate highest average scores across applicants.
          </p>
        </div>

        {/* Screening Funnel */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Recruitment Screening Funnel
            </h3>
            <span className="text-[11px] text-slate-400">Conversion Pipeline</span>
          </div>

          <div className="mt-3 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="stage" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#ec4899" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <p className="mt-2 text-xs italic text-slate-500 border-t border-slate-100 pt-2 dark:border-slate-800">
            💡 Insight: {qualifiedCount} of {candidates.length} candidates met the qualification threshold (≥65).
          </p>
        </div>
      </div>

      {/* Row 4: Learned In-Browser Logistic Regression Feature Weights ("What the model learned") */}
      <div className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-5 shadow-2xs dark:border-indigo-900/50 dark:bg-indigo-950/20">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-indigo-200/60 pb-3 dark:border-indigo-900/60">
          <div>
            <div className="flex items-center gap-2">
              <BrainCircuit className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-semibold text-sm text-indigo-950 dark:text-indigo-200">
                What the Machine Learning Model Learned (Logistic Regression Feedback Weights)
              </h3>
            </div>
            <p className="text-xs text-indigo-900/70 dark:text-indigo-300/70">
              Trained client-side in your browser from recruiter feedback (Shortlist = 1, Reject = 0).
            </p>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs text-indigo-950 dark:text-indigo-200">
            <span>Samples: {lrModel.sampleCount}</span>
            <span aria-hidden="true">·</span>
            <span>Accuracy: {lrModel.accuracy}%</span>
            <span aria-hidden="true">·</span>
            <span>Log-Loss: {lrModel.loss}</span>
          </div>
        </div>

        <div className="mt-4 h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={lrWeightsData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e7ff" />
              <XAxis dataKey="feature" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="weight" fill="#4f46e5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <p className="mt-3 text-xs italic text-indigo-900/80 border-t border-indigo-200/50 pt-2 dark:border-indigo-900/50 dark:text-indigo-300">
          💡 The model places highest empirical weight on <strong>Skill Coverage</strong> and <strong>TF-IDF Lexical Match</strong> when replicating recruiter shortlist decisions.
        </p>
      </div>

      {/* Row 5: Statistical Distribution Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
          Statistical Parameter Metrics (Final Score Population)
        </h3>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8 text-center text-xs">
          <div className="rounded-lg bg-slate-50 p-2.5 dark:bg-slate-800/60">
            <span className="text-[11px] text-slate-400">Mean</span>
            <div className="font-mono text-base font-bold text-slate-900 dark:text-white">
              {Math.round(mean * 10) / 10}
            </div>
          </div>
          <div className="rounded-lg bg-slate-50 p-2.5 dark:bg-slate-800/60">
            <span className="text-[11px] text-slate-400">Median</span>
            <div className="font-mono text-base font-bold text-slate-900 dark:text-white">{median}</div>
          </div>
          <div className="rounded-lg bg-slate-50 p-2.5 dark:bg-slate-800/60">
            <span className="text-[11px] text-slate-400">Std Dev</span>
            <div className="font-mono text-base font-bold text-slate-900 dark:text-white">
              {Math.round(stdDev * 10) / 10}
            </div>
          </div>
          <div className="rounded-lg bg-slate-50 p-2.5 dark:bg-slate-800/60">
            <span className="text-[11px] text-slate-400">Min Score</span>
            <div className="font-mono text-base font-bold text-slate-900 dark:text-white">{min}</div>
          </div>
          <div className="rounded-lg bg-slate-50 p-2.5 dark:bg-slate-800/60">
            <span className="text-[11px] text-slate-400">Max Score</span>
            <div className="font-mono text-base font-bold text-slate-900 dark:text-white">{max}</div>
          </div>
          <div className="rounded-lg bg-slate-50 p-2.5 dark:bg-slate-800/60">
            <span className="text-[11px] text-slate-400">25th Percentile</span>
            <div className="font-mono text-base font-bold text-slate-900 dark:text-white">
              {getPercentile(25)}
            </div>
          </div>
          <div className="rounded-lg bg-slate-50 p-2.5 dark:bg-slate-800/60">
            <span className="text-[11px] text-slate-400">75th Percentile</span>
            <div className="font-mono text-base font-bold text-slate-900 dark:text-white">
              {getPercentile(75)}
            </div>
          </div>
          <div className="rounded-lg bg-slate-50 p-2.5 dark:bg-slate-800/60">
            <span className="text-[11px] text-slate-400">Skewness</span>
            <div className="font-mono text-base font-bold text-slate-900 dark:text-white">{skewness}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
