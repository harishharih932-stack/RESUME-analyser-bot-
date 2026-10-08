import React, { useState } from 'react';
import {
  X,
  ExternalLink,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building,
  GraduationCap,
  Sparkles,
  Award,
  AlertTriangle,
  HelpCircle,
  FileText,
  Save,
  CheckCircle2,
  XCircle,
  Clock,
  Shield,
  Layers,
  Code2,
  Globe,
  Share2
} from 'lucide-react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip
} from 'recharts';
import { Candidate, CandidateStatus, ExtractedLink } from '../../types';
import { useApp } from '../../context/AppContext';

interface CandidateDetailModalProps {
  candidate: Candidate | null;
  onClose: () => void;
}

export const CandidateDetailModal: React.FC<CandidateDetailModalProps> = ({ candidate, onClose }) => {
  const { updateCandidateStatus, updateCandidateNotes, settings } = useApp();
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'skills' | 'experience' | 'interview' | 'rawText'>('overview');
  const [notesText, setNotesText] = useState(candidate?.notes || '');

  if (!candidate) return null;

  const displayName = settings.blindScreening ? candidate.blindName : candidate.parsedData.name;
  const displayEmail = settings.blindScreening ? 'masked@candidate-review.internal' : candidate.parsedData.email;
  const displayPhone = settings.blindScreening ? '+1 (***) ***-****' : candidate.parsedData.phone;

  // Radar chart data
  const radarData = [
    { subject: 'TF-IDF Lexical', value: candidate.scores.tfidfCosineScore },
    { subject: 'BM25 Score', value: candidate.scores.bm25Score },
    { subject: 'Skill Match', value: candidate.scores.skillMatchScore },
    { subject: 'Experience', value: candidate.scores.experienceFitScore },
    { subject: 'Education', value: candidate.scores.educationFitScore },
    { subject: 'LLM Semantic', value: candidate.scores.llmSemanticScore }
  ];

  const handleSaveNotes = () => {
    updateCandidateNotes(candidate.id, notesText);
  };

  const getPlatformIcon = (cat: ExtractedLink['category']) => {
    switch (cat) {
      case 'LinkedIn':
        return <Share2 className="h-3.5 w-3.5 text-blue-600" />;
      case 'GitHub':
      case 'GitLab':
        return <Code2 className="h-3.5 w-3.5 text-slate-800 dark:text-slate-200" />;
      case 'Kaggle':
      case 'LeetCode':
      case 'HackerRank':
        return <Award className="h-3.5 w-3.5 text-amber-600" />;
      case 'Portfolio/Website':
        return <Globe className="h-3.5 w-3.5 text-emerald-600" />;
      default:
        return <ExternalLink className="h-3.5 w-3.5 text-indigo-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-2 sm:p-4 backdrop-blur-xs">
      <div className="flex h-full max-h-[92vh] w-full max-w-4xl flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden dark:border-slate-800 dark:bg-slate-900">
        {/* Top Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/80 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/90">
          <div className="flex items-center gap-4">
            {/* Score Ring */}
            <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
              <span className="font-mono text-xl font-bold leading-none">{candidate.finalScore}</span>
              <span className="text-[10px] opacity-80">SCORE</span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">{displayName}</h2>
                <span className="rounded bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300">
                  Rank #{candidate.rank}
                </span>
                <span
                  className={`rounded px-2 py-0.5 text-xs font-semibold ${
                    candidate.llmAnalysis?.fit_category === 'Excellent'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : candidate.llmAnalysis?.fit_category === 'Good'
                      ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  }`}
                >
                  {candidate.llmAnalysis?.fit_category || 'Good'} Fit
                </span>
              </div>

              {/* Contact meta */}
              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {displayEmail}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {displayPhone}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {candidate.parsedData.location}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Extracted Links Strip (All clickable chips opening in new tab) */}
        {candidate.parsedData.links && candidate.parsedData.links.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 bg-slate-50/40 px-6 py-2.5 dark:border-slate-800 dark:bg-slate-900/40">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Extracted Links:
            </span>
            {candidate.parsedData.links.map((link, idx) => (
              <a
                key={idx}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-2xs hover:border-indigo-400 hover:text-indigo-600 transition-colors dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-indigo-500 dark:hover:text-indigo-400"
              >
                {getPlatformIcon(link.category)}
                <span>{link.category}: {link.text || 'View Profile'}</span>
                <ExternalLink className="h-2.5 w-2.5 opacity-60" />
              </a>
            ))}
          </div>
        )}

        {/* Sub-tabs header */}
        <div className="flex border-b border-slate-200 px-6 text-xs font-medium dark:border-slate-800">
          <button
            onClick={() => setActiveSubTab('overview')}
            className={`border-b-2 py-3 px-3 transition-colors ${
              activeSubTab === 'overview'
                ? 'border-indigo-600 font-semibold text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            Overview & Radar
          </button>
          <button
            onClick={() => setActiveSubTab('skills')}
            className={`border-b-2 py-3 px-3 transition-colors ${
              activeSubTab === 'skills'
                ? 'border-indigo-600 font-semibold text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            Skill Evidence & Gaps
          </button>
          <button
            onClick={() => setActiveSubTab('experience')}
            className={`border-b-2 py-3 px-3 transition-colors ${
              activeSubTab === 'experience'
                ? 'border-indigo-600 font-semibold text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            Experience & Education
          </button>
          <button
            onClick={() => setActiveSubTab('interview')}
            className={`border-b-2 py-3 px-3 transition-colors ${
              activeSubTab === 'interview'
                ? 'border-indigo-600 font-semibold text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            AI Interview Questions
          </button>
          <button
            onClick={() => setActiveSubTab('rawText')}
            className={`border-b-2 py-3 px-3 transition-colors ${
              activeSubTab === 'rawText'
                ? 'border-indigo-600 font-semibold text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            Resume Text
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeSubTab === 'overview' && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Radar Chart */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900/60">
                <h4 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
                  5-Dimension Scoring Radar
                </h4>
                <div className="mt-2 h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#cbd5e1" strokeDasharray="3 3" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11 }} />
                      <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9 }} />
                      <Radar
                        name="Candidate"
                        dataKey="value"
                        stroke="#6366f1"
                        fill="#6366f1"
                        fillOpacity={0.35}
                      />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Explainability & Breakdown */}
              <div className="space-y-4">
                <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 dark:border-indigo-900/50 dark:bg-indigo-950/20">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-900 dark:text-indigo-300">
                    <Sparkles className="h-4 w-4" />
                    <span>Plain English Explainability</span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-indigo-950/80 dark:text-indigo-200">
                    {candidate.explanation}
                  </p>
                  {candidate.llmAnalysis?.one_line_verdict && (
                    <div className="mt-2 text-xs font-medium italic text-indigo-800 dark:text-indigo-300 border-t border-indigo-200/60 pt-2 dark:border-indigo-900/60">
                      "{candidate.llmAnalysis.one_line_verdict}"
                    </div>
                  )}
                </div>

                {/* Strengths & Weaknesses */}
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3 dark:border-slate-800 dark:bg-slate-900">
                  <div>
                    <h5 className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                      Top Strengths Identified:
                    </h5>
                    <ul className="mt-1 list-disc list-inside space-y-1 text-xs text-slate-700 dark:text-slate-300">
                      {candidate.llmAnalysis?.strengths.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>

                  {candidate.llmAnalysis?.weaknesses && candidate.llmAnalysis.weaknesses.length > 0 && (
                    <div className="border-t border-slate-100 pt-2 dark:border-slate-800">
                      <h5 className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                        Areas for Scrutiny / Gaps:
                      </h5>
                      <ul className="mt-1 list-disc list-inside space-y-1 text-xs text-slate-700 dark:text-slate-300">
                        {candidate.llmAnalysis.weaknesses.map((w, i) => (
                          <li key={i}>{w}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {candidate.llmAnalysis?.red_flags && candidate.llmAnalysis.red_flags.length > 0 && (
                    <div className="border-t border-slate-100 pt-2 dark:border-slate-800">
                      <h5 className="flex items-center gap-1 text-xs font-semibold text-rose-700 dark:text-rose-400">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        <span>Potential Red Flags:</span>
                      </h5>
                      <ul className="mt-1 list-disc list-inside space-y-1 text-xs text-rose-700 dark:text-rose-300">
                        {candidate.llmAnalysis.red_flags.map((rf, i) => (
                          <li key={i}>{rf}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'skills' && (
            <div className="space-y-6">
              {/* Matched Required Skills */}
              <div>
                <h4 className="text-xs font-semibold text-emerald-700 uppercase tracking-wider dark:text-emerald-400">
                  Matched Required Skills ({candidate.skillDetails.matchedRequired.length})
                </h4>
                <div className="mt-2 flex flex-wrap gap-2">
                  {candidate.skillDetails.matchedRequired.map((s) => (
                    <span
                      key={s}
                      className="rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300"
                    >
                      ✓ {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Missing Required Skills */}
              {candidate.skillDetails.missingRequired.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-rose-700 uppercase tracking-wider dark:text-rose-400">
                    Missing Required Skills ({candidate.skillDetails.missingRequired.length})
                  </h4>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {candidate.skillDetails.missingRequired.map((s) => (
                      <span
                        key={s}
                        className="rounded-md border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-800 dark:border-rose-900 dark:bg-rose-950/60 dark:text-rose-300"
                      >
                        ✗ {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Matched Preferred Skills */}
              <div>
                <h4 className="text-xs font-semibold text-indigo-700 uppercase tracking-wider dark:text-indigo-400">
                  Preferred / Nice-To-Have Skills Matched ({candidate.skillDetails.matchedPreferred.length})
                </h4>
                <div className="mt-2 flex flex-wrap gap-2">
                  {candidate.skillDetails.matchedPreferred.map((s) => (
                    <span
                      key={s}
                      className="rounded-md border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-800 dark:border-indigo-900 dark:bg-indigo-950/60 dark:text-indigo-300"
                    >
                      ★ {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Extra Detected Skills */}
              {candidate.skillDetails.extraSkills.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Additional Domain Skills In Resume ({candidate.skillDetails.extraSkills.length})
                  </h4>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {candidate.skillDetails.extraSkills.map((s) => (
                      <span
                        key={s}
                        className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeSubTab === 'experience' && (
            <div className="space-y-6">
              {/* Experience Timeline */}
              <div>
                <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider dark:text-white">
                  Professional Experience ({candidate.parsedData.totalExperienceYears} Years Total)
                </h4>
                <div className="mt-3 space-y-4">
                  {candidate.parsedData.experience.map((exp, idx) => (
                    <div
                      key={idx}
                      className="relative border-l-2 border-indigo-200 pl-4 ml-2 dark:border-indigo-900"
                    >
                      <div className="absolute -left-1.5 top-1.5 h-3 w-3 rounded-full border-2 border-white bg-indigo-600 dark:border-slate-900" />
                      <div className="font-semibold text-slate-900 dark:text-white">{exp.role}</div>
                      <div className="text-xs text-slate-500">
                        {exp.company} {exp.duration ? `• ${exp.duration}` : ''}
                      </div>
                      {exp.description && (
                        <p className="mt-1 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                          {exp.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Education */}
              <div className="border-t border-slate-100 pt-4 dark:border-slate-800">
                <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider dark:text-white">
                  Academic Credentials
                </h4>
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {candidate.parsedData.education.map((edu, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 dark:border-slate-800 dark:bg-slate-800/40"
                    >
                      <div className="flex items-start gap-2.5">
                        <GraduationCap className="h-4 w-4 text-indigo-600 dark:text-indigo-400 mt-0.5" />
                        <div>
                          <div className="font-semibold text-xs text-slate-900 dark:text-white">
                            {edu.degree}
                          </div>
                          <div className="text-xs text-slate-500">{edu.institute}</div>
                          <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-400">
                            {edu.year && <span>Class of {edu.year}</span>}
                            {edu.cgpa && <span>GPA: {edu.cgpa}</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Projects */}
              {candidate.parsedData.projects && candidate.parsedData.projects.length > 0 && (
                <div className="border-t border-slate-100 pt-4 dark:border-slate-800">
                  <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider dark:text-white">
                    Key Projects & Repositories
                  </h4>
                  <div className="mt-3 space-y-2">
                    {candidate.parsedData.projects.map((proj, idx) => (
                      <div
                        key={idx}
                        className="rounded-lg border border-slate-200 p-3 dark:border-slate-800"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-xs text-slate-900 dark:text-white">
                            {proj.name}
                          </span>
                          {proj.link && (
                            <a
                              href={proj.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:underline dark:text-indigo-400"
                            >
                              <span>View Project</span>
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                        {proj.description && (
                          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                            {proj.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeSubTab === 'interview' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-4 dark:border-indigo-900/60 dark:bg-indigo-950/30">
                <div className="flex items-center gap-2 text-xs font-semibold text-indigo-900 dark:text-indigo-300">
                  <HelpCircle className="h-4 w-4" />
                  <span>AI-Generated Technical Interview Questions</span>
                </div>
                <p className="mt-1 text-xs text-indigo-800/80 dark:text-indigo-300/80">
                  Tailored to test specific claims, architecture decisions, and potential gaps in {displayName}'s resume.
                </p>
              </div>

              <div className="space-y-3">
                {candidate.llmAnalysis?.suggested_interview_questions?.map((q, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 font-mono text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                      {idx + 1}
                    </span>
                    <p className="text-xs font-medium text-slate-800 leading-relaxed dark:text-slate-200">
                      {q}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSubTab === 'rawText' && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-xs leading-relaxed text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
              <pre className="whitespace-pre-wrap font-sans">{candidate.parsedData.rawText}</pre>
            </div>
          )}
        </div>

        {/* Bottom Action Footer & Notes */}
        <div className="border-t border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Recruiter Notes input */}
            <div className="flex-1 max-w-md">
              <input
                type="text"
                value={notesText}
                onChange={(e) => setNotesText(e.target.value)}
                onBlur={handleSaveNotes}
                placeholder="Add recruiter notes (saved automatically)..."
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              />
            </div>

            {/* Quick Status Toggles (Triggers in-browser Logistic Regression retraining!) */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateCandidateStatus(candidate.id, 'Shortlisted')}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold shadow-2xs transition-colors ${
                  candidate.status === 'Shortlisted'
                    ? 'bg-emerald-600 text-white'
                    : 'border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                }`}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Shortlist</span>
              </button>

              <button
                onClick={() => updateCandidateStatus(candidate.id, 'On Hold')}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold shadow-2xs transition-colors ${
                  candidate.status === 'On Hold'
                    ? 'bg-amber-600 text-white'
                    : 'border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                }`}
              >
                <Clock className="h-3.5 w-3.5" />
                <span>Hold</span>
              </button>

              <button
                onClick={() => updateCandidateStatus(candidate.id, 'Rejected')}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold shadow-2xs transition-colors ${
                  candidate.status === 'Rejected'
                    ? 'bg-rose-600 text-white'
                    : 'border border-rose-300 bg-rose-50 text-rose-800 hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300'
                }`}
              >
                <XCircle className="h-3.5 w-3.5" />
                <span>Reject</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
