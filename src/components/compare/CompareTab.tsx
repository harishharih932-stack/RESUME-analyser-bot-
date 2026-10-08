import React, { useState } from 'react';
import {
  GitCompare,
  Sparkles,
  Trophy,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Plus,
  Trash2,
  Share2,
  Code2,
  Award
} from 'lucide-react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { Candidate } from '../../types';
import { ApiKeyBanner } from '../common/ApiKeyBanner';
import { callGroqChat } from '../../lib/groq/client';

const RADAR_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899'];

export const CompareTab: React.FC = () => {
  const {
    candidates,
    compareCandidateIds,
    toggleCompareCandidate,
    clearCompareSelection,
    setSelectedCandidate,
    updateCandidateStatus,
    settings,
    currentJD,
    showToast
  } = useApp();

  const [aiSummary, setAiSummary] = useState<string>('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // Selected candidates objects
  const comparedCandidates = candidates.filter((c) => compareCandidateIds.includes(c.id));

  // Build Radar overlay dataset
  const radarDimensions = [
    { subject: 'TF-IDF Lexical', key: 'tfidfCosineScore' },
    { subject: 'BM25 Score', key: 'bm25Score' },
    { subject: 'Skill Match', key: 'skillMatchScore' },
    { subject: 'Experience Fit', key: 'experienceFitScore' },
    { subject: 'Education Fit', key: 'educationFitScore' },
    { subject: 'LLM Semantic', key: 'llmSemanticScore' }
  ];

  const radarData = radarDimensions.map((dim) => {
    const item: any = { subject: dim.subject };
    comparedCandidates.forEach((c) => {
      const displayName = settings.blindScreening ? c.blindName : c.parsedData.name;
      item[displayName] = (c.scores as any)[dim.key];
    });
    return item;
  });

  // Calculate highest metric values for winner highlighting
  const maxFinalScore = Math.max(...comparedCandidates.map((c) => c.finalScore), 0);
  const maxSkillMatch = Math.max(...comparedCandidates.map((c) => c.scores.skillMatchScore), 0);
  const maxExp = Math.max(...comparedCandidates.map((c) => c.parsedData.totalExperienceYears), 0);
  const maxLLM = Math.max(...comparedCandidates.map((c) => c.scores.llmSemanticScore), 0);

  // Generate comparison summary using Groq (or fallback)
  const handleGenerateAiComparison = async () => {
    if (comparedCandidates.length < 2) {
      showToast('Select at least 2 candidates to compare.', 'info');
      return;
    }

    setIsGeneratingAi(true);
    try {
      if (settings.groqApiKey && settings.groqApiKey.trim().length > 0) {
        const candidateBios = comparedCandidates
          .map(
            (c, i) =>
              `Candidate ${i + 1} (${settings.blindScreening ? c.blindName : c.parsedData.name}): Score ${c.finalScore}/100. Experience: ${c.parsedData.totalExperienceYears} yrs. Education: ${c.parsedData.education[0]?.degree}. Skills: ${c.parsedData.skills.join(', ')}. LLM strengths: ${c.llmAnalysis?.strengths.join('; ')}. Weaknesses: ${c.llmAnalysis?.weaknesses.join('; ')}`
          )
          .join('\n\n');

        const prompt = `Compare these ${comparedCandidates.length} candidates for the position of "${currentJD.title}".
Synthesize their comparative strengths, trade-offs, and recommend who should be hired first and why.
Keep response concise, structured with bullet points and bold candidate names.

CANDIDATES:
${candidateBios}`;

        const res = await callGroqChat(
          [
            { role: 'system', content: 'You are a talent evaluation director. Provide a crisp executive comparison.' },
            { role: 'user', content: prompt }
          ],
          settings
        );
        setAiSummary(res);
      } else {
        // High quality heuristic comparison
        const top = [...comparedCandidates].sort((a, b) => b.finalScore - a.finalScore)[0];
        const second = [...comparedCandidates].sort((a, b) => b.finalScore - a.finalScore)[1];
        const topName = settings.blindScreening ? top.blindName : top.parsedData.name;
        const secondName = settings.blindScreening ? second.blindName : second.parsedData.name;

        setAiSummary(
          `**Comparative Synthesis:**\n\n- **Primary Recommendation:** **${topName}** leads with an overall score of **${top.finalScore}/100** and ${top.scores.skillMatchScore}% core skill alignment. Strongest match for the ${currentJD.title} requirements.\n- **Secondary Alternative:** **${secondName}** (${second.finalScore}/100) provides strong complementary experience (${second.parsedData.totalExperienceYears} yrs) but has minor prerequisites to verify in interview rounds.\n- **Recommendation:** Proceed with technical screening for ${topName} first.`
        );
      }
    } catch (err: any) {
      showToast(`Comparison generation failed: ${err.message}`, 'error');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  return (
    <div className="space-y-6">
      <ApiKeyBanner featureName="AI Candidate Comparison" />

      {/* Candidate Selector Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-white">Side-by-Side Candidate Comparison</h2>
            <p className="text-xs text-slate-500">
              Select 2 to 4 candidates to benchmark scoring vectors, skills, and qualifications.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {comparedCandidates.length > 0 && (
              <button
                onClick={clearCompareSelection}
                className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              >
                Clear Selection
              </button>
            )}

            <button
              onClick={handleGenerateAiComparison}
              disabled={isGeneratingAi || comparedCandidates.length < 2}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 disabled:opacity-50"
            >
              <Sparkles className={`h-3.5 w-3.5 ${isGeneratingAi ? 'animate-spin' : ''}`} />
              <span>{isGeneratingAi ? 'Synthesizing...' : 'Generate AI Comparison'}</span>
            </button>
          </div>
        </div>

        {/* Selected Candidate Chips */}
        <div className="mt-3 flex flex-wrap gap-2">
          {candidates.map((c) => {
            const isSelected = compareCandidateIds.includes(c.id);
            const displayName = settings.blindScreening ? c.blindName : c.parsedData.name;

            return (
              <button
                key={c.id}
                onClick={() => toggleCompareCandidate(c.id)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                <span>{displayName} (#{c.rank})</span>
                {isSelected ? <CheckCircle2 className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
              </button>
            );
          })}
        </div>
      </div>

      {comparedCandidates.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-800">
          <GitCompare className="h-10 w-10 text-slate-300 dark:text-slate-600" />
          <h3 className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
            No candidates selected for comparison
          </h3>
          <p className="mt-1 text-xs text-slate-500 max-w-sm">
            Click the candidate chips above or the compare button in the Ranking table to select 2 to 4 candidates.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Radar Overlay & AI Comparison Summary */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Multi-Radar Chart */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Multi-Candidate Score Overlay
              </h3>
              <div className="mt-3 h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#cbd5e1" strokeDasharray="3 3" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10 }} />
                    <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9 }} />
                    {comparedCandidates.map((c, idx) => {
                      const name = settings.blindScreening ? c.blindName : c.parsedData.name;
                      return (
                        <Radar
                          key={c.id}
                          name={name}
                          dataKey={name}
                          stroke={RADAR_COLORS[idx % RADAR_COLORS.length]}
                          fill={RADAR_COLORS[idx % RADAR_COLORS.length]}
                          fillOpacity={0.2}
                        />
                      );
                    })}
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* AI Comparison Summary Box */}
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-5 shadow-2xs dark:border-indigo-950/60 dark:bg-indigo-950/30">
              <div className="flex items-center justify-between border-b border-indigo-200/60 pb-3 dark:border-indigo-900/60">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="font-semibold text-xs text-indigo-950 dark:text-indigo-200">
                    Executive Comparative Analysis
                  </h3>
                </div>
                {aiSummary && (
                  <button
                    onClick={handleGenerateAiComparison}
                    className="text-[11px] font-medium text-indigo-700 hover:underline dark:text-indigo-300"
                  >
                    Regenerate
                  </button>
                )}
              </div>

              <div className="mt-4 text-xs leading-relaxed text-indigo-950/90 dark:text-indigo-100">
                {aiSummary ? (
                  <div className="whitespace-pre-line space-y-2 font-sans">{aiSummary}</div>
                ) : (
                  <div className="py-8 text-center text-indigo-600/70 dark:text-indigo-400/70">
                    Click <strong>"Generate AI Comparison"</strong> above to let Groq synthesize deep trade-offs between these {comparedCandidates.length} candidates.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Matrix Comparison Table */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-800/50">
                  <tr>
                    <th className="w-48 px-4 py-3 font-semibold text-slate-500">Metric</th>
                    {comparedCandidates.map((c, idx) => {
                      const displayName = settings.blindScreening ? c.blindName : c.parsedData.name;
                      return (
                        <th key={c.id} className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                          <div className="flex items-center gap-2">
                            <span
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: RADAR_COLORS[idx % RADAR_COLORS.length] }}
                            />
                            <span>{displayName}</span>
                            <span className="text-[10px] text-slate-400 font-normal">Rank #{c.rank}</span>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {/* Final Score */}
                  <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Final Weighted Score</td>
                    {comparedCandidates.map((c) => {
                      const isWinner = c.finalScore === maxFinalScore && maxFinalScore > 0;
                      return (
                        <td key={c.id} className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`font-mono font-bold text-sm ${
                                isWinner
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : 'text-slate-800 dark:text-slate-200'
                              }`}
                            >
                              {c.finalScore}/100
                            </span>
                            {isWinner && <Trophy className="h-3.5 w-3.5 text-amber-500" />}
                          </div>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Skill Match */}
                  <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Skill Match Score</td>
                    {comparedCandidates.map((c) => {
                      const isWinner = c.scores.skillMatchScore === maxSkillMatch && maxSkillMatch > 0;
                      return (
                        <td key={c.id} className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <span className={`font-semibold ${isWinner ? 'text-emerald-600' : ''}`}>
                              {c.scores.skillMatchScore}%
                            </span>
                            <span className="text-slate-400 text-[11px]">
                              ({c.skillDetails.matchedRequired.length} req)
                            </span>
                          </div>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Experience */}
                  <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Total Experience</td>
                    {comparedCandidates.map((c) => {
                      const isWinner = c.parsedData.totalExperienceYears === maxExp;
                      return (
                        <td key={c.id} className="px-4 py-3">
                          <span className={`font-medium ${isWinner ? 'text-indigo-600' : ''}`}>
                            {c.parsedData.totalExperienceYears} Years
                          </span>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Education */}
                  <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Education</td>
                    {comparedCandidates.map((c) => (
                      <td key={c.id} className="px-4 py-3">
                        <div className="font-medium text-slate-800 dark:text-slate-200">
                          {c.parsedData.education[0]?.degree || 'Degree'}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {c.parsedData.education[0]?.institute}
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* LLM Semantic Score */}
                  <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="px-4 py-3 font-medium text-slate-600 dark:text-slate-400">LLM Semantic Match</td>
                    {comparedCandidates.map((c) => {
                      const isWinner = c.scores.llmSemanticScore === maxLLM;
                      return (
                        <td key={c.id} className="px-4 py-3">
                          <span className={`font-semibold ${isWinner ? 'text-indigo-600' : ''}`}>
                            {c.scores.llmSemanticScore}/100
                          </span>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Extracted Profiles & Portfolios */}
                  <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Verified Links</td>
                    {comparedCandidates.map((c) => (
                      <td key={c.id} className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {c.parsedData.links?.slice(0, 3).map((l, i) => (
                            <a
                              key={i}
                              href={l.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-indigo-600 hover:underline dark:bg-slate-800 dark:text-indigo-400"
                            >
                              <span>{l.category}</span>
                              <ExternalLink className="h-2 w-2" />
                            </a>
                          ))}
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Status & Quick Action */}
                  <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Decision Status</td>
                    {comparedCandidates.map((c) => (
                      <td key={c.id} className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded px-2 py-0.5 text-[10px] font-semibold ${
                              c.status === 'Shortlisted'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : c.status === 'Rejected'
                                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                            }`}
                          >
                            {c.status}
                          </span>

                          <button
                            onClick={() => setSelectedCandidate(c)}
                            className="text-xs text-indigo-600 hover:underline dark:text-indigo-400"
                          >
                            Inspect
                          </button>
                        </div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
