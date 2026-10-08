import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  ArrowUpDown,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  GitCompare,
  Sparkles,
  SlidersHorizontal,
  ChevronDown,
  Layers,
  FileSpreadsheet
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import { Candidate, CandidateStatus, FitCategory } from '../../types';

export const RankingTab: React.FC = () => {
  const {
    candidates,
    setSelectedCandidate,
    compareCandidateIds,
    toggleCompareCandidate,
    updateCandidateStatus,
    settings,
    exportCSV,
    exportProjectJSON
  } = useApp();

  // Filter & Search states
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [fitFilter, setFitFilter] = useState<string>('All');
  const [minScoreFilter, setMinScoreFilter] = useState<number>(0);
  const [skillFilter, setSkillFilter] = useState<string>('All');

  // Sorting
  const [sortField, setSortField] = useState<'rank' | 'finalScore' | 'name' | 'exp' | 'skill'>('rank');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Multi-select for bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Collect unique skills for filter dropdown
  const allSkills = useMemo(() => {
    const set = new Set<string>();
    candidates.forEach((c) => c.parsedData.skills.forEach((s) => set.add(s)));
    return Array.from(set).sort();
  }, [candidates]);

  // Filter and sort candidates
  const filteredCandidates = useMemo(() => {
    return candidates
      .filter((c) => {
        const nameToSearch = settings.blindScreening ? c.blindName : c.parsedData.name;
        const matchesSearch =
          search === '' ||
          nameToSearch.toLowerCase().includes(search.toLowerCase()) ||
          c.parsedData.skills.some((s) => s.toLowerCase().includes(search.toLowerCase())) ||
          c.parsedData.education.some((e) => e.institute.toLowerCase().includes(search.toLowerCase()));

        const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
        const matchesFit = fitFilter === 'All' || (c.llmAnalysis?.fit_category || 'Good') === fitFilter;
        const matchesScore = c.finalScore >= minScoreFilter;
        const matchesSkill = skillFilter === 'All' || c.parsedData.skills.includes(skillFilter);

        return matchesSearch && matchesStatus && matchesFit && matchesScore && matchesSkill;
      })
      .sort((a, b) => {
        let diff = 0;
        if (sortField === 'rank') {
          diff = (a.rank || 999) - (b.rank || 999);
        } else if (sortField === 'finalScore') {
          diff = b.finalScore - a.finalScore;
        } else if (sortField === 'name') {
          diff = a.parsedData.name.localeCompare(b.parsedData.name);
        } else if (sortField === 'exp') {
          diff = b.parsedData.totalExperienceYears - a.parsedData.totalExperienceYears;
        } else if (sortField === 'skill') {
          diff = b.scores.skillMatchScore - a.scores.skillMatchScore;
        }
        return sortOrder === 'asc' ? diff : -diff;
      });
  }, [candidates, search, statusFilter, fitFilter, minScoreFilter, skillFilter, sortField, sortOrder, settings.blindScreening]);

  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredCandidates.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredCandidates.map((c) => c.id));
    }
  };

  const handleToggleSelectOne = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const handleStatusChangeWithFeedback = (candidateId: string, status: CandidateStatus) => {
    updateCandidateStatus(candidateId, status);
    if (status === 'Shortlisted') {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 }
        });
      } catch (e) {}
    }
  };

  const handleBulkStatusChange = (status: CandidateStatus) => {
    selectedIds.forEach((id) => updateCandidateStatus(id, status));
    setSelectedIds([]);
  };

  return (
    <div className="space-y-5">
      {/* Search & Filter Toolbar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by name, skills, degree..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-3 text-xs text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              <option value="All">All Statuses</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="New">New / In Review</option>
              <option value="On Hold">On Hold</option>
              <option value="Rejected">Rejected</option>
            </select>

            {/* Fit Category */}
            <select
              value={fitFilter}
              onChange={(e) => setFitFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              <option value="All">All Fit Ratings</option>
              <option value="Excellent">Excellent Fit (85+)</option>
              <option value="Good">Good Fit (70-84)</option>
              <option value="Average">Average Fit (50-69)</option>
              <option value="Poor">Poor Fit (&lt;50)</option>
            </select>

            {/* Skill Filter */}
            <select
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
              className="max-w-[140px] truncate rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              <option value="All">All Skills</option>
              {allSkills.map((sk) => (
                <option key={sk} value={sk}>
                  {sk}
                </option>
              ))}
            </select>

            {/* Min Score Slider */}
            <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <span>Score &ge; {minScoreFilter}</span>
              <input
                type="range"
                min="0"
                max="90"
                step="5"
                value={minScoreFilter}
                onChange={(e) => setMinScoreFilter(parseInt(e.target.value, 10))}
                className="h-1.5 w-16 accent-indigo-600 cursor-pointer"
              />
            </div>

            {/* Export buttons */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={exportCSV}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-2xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                title="Export CSV"
              >
                <Download className="h-3.5 w-3.5 text-indigo-500" />
                <span>CSV</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Action Bar (when candidates selected) */}
        {selectedIds.length > 0 && (
          <div className="mt-3 flex items-center justify-between rounded-lg bg-indigo-50 px-3 py-2 text-xs text-indigo-900 dark:bg-indigo-950/60 dark:text-indigo-200">
            <span className="font-medium">
              {selectedIds.length} candidate{selectedIds.length > 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleBulkStatusChange('Shortlisted')}
                className="rounded bg-emerald-600 px-2.5 py-1 font-semibold text-white hover:bg-emerald-700 shadow-2xs"
              >
                Shortlist Selected
              </button>
              <button
                onClick={() => handleBulkStatusChange('On Hold')}
                className="rounded bg-amber-600 px-2.5 py-1 font-semibold text-white hover:bg-amber-700 shadow-2xs"
              >
                Put On Hold
              </button>
              <button
                onClick={() => handleBulkStatusChange('Rejected')}
                className="rounded bg-rose-600 px-2.5 py-1 font-semibold text-white hover:bg-rose-700 shadow-2xs"
              >
                Reject Selected
              </button>
              <button
                onClick={() => setSelectedIds([])}
                className="text-indigo-600 hover:underline dark:text-indigo-400"
              >
                Deselect
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/70 font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300">
              <tr>
                <th className="w-10 px-3 py-3 text-center">
                  <input
                    type="checkbox"
                    checked={
                      filteredCandidates.length > 0 && selectedIds.length === filteredCandidates.length
                    }
                    onChange={handleToggleSelectAll}
                    className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </th>
                <th
                  onClick={() => {
                    setSortField('rank');
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  }}
                  className="w-16 cursor-pointer px-3 py-3 hover:text-indigo-600"
                >
                  <div className="flex items-center gap-1">
                    <span>Rank</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => {
                    setSortField('name');
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  }}
                  className="cursor-pointer px-3 py-3 hover:text-indigo-600"
                >
                  <div className="flex items-center gap-1">
                    <span>Candidate</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => {
                    setSortField('finalScore');
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  }}
                  className="w-40 cursor-pointer px-3 py-3 hover:text-indigo-600"
                >
                  <div className="flex items-center gap-1">
                    <span>Final Score</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => {
                    setSortField('skill');
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  }}
                  className="cursor-pointer px-3 py-3 hover:text-indigo-600"
                >
                  <div className="flex items-center gap-1">
                    <span>Skill Match</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => {
                    setSortField('exp');
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  }}
                  className="cursor-pointer px-3 py-3 hover:text-indigo-600"
                >
                  <div className="flex items-center gap-1">
                    <span>Experience</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="px-3 py-3">Fit Assessment</th>
                <th className="px-3 py-3">Feedback Status</th>
                <th className="w-32 px-3 py-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredCandidates.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No candidates found matching the current filters.
                  </td>
                </tr>
              ) : (
                filteredCandidates.map((cand) => {
                  const displayName = settings.blindScreening ? cand.blindName : cand.parsedData.name;
                  const isChecked = selectedIds.includes(cand.id);
                  const isCompared = compareCandidateIds.includes(cand.id);
                  const fitCat = cand.llmAnalysis?.fit_category || 'Good';

                  return (
                    <tr
                      key={cand.id}
                      className={`hover:bg-slate-50/80 transition-colors dark:hover:bg-slate-800/40 ${
                        isChecked ? 'bg-indigo-50/30 dark:bg-indigo-950/20' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="px-3 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleSelectOne(cand.id)}
                          className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      </td>

                      {/* Rank */}
                      <td className="px-3 py-3 font-mono font-bold text-slate-700 dark:text-slate-300">
                        #{cand.rank}
                      </td>

                      {/* Candidate info */}
                      <td className="px-3 py-3">
                        <div
                          onClick={() => setSelectedCandidate(cand)}
                          className="cursor-pointer group"
                        >
                          <div className="font-semibold text-slate-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                            {displayName}
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                            <span>{cand.parsedData.education[0]?.degree || 'Degree'}</span>
                            <span aria-hidden="true">·</span>
                            <span>{cand.parsedData.education[0]?.institute || 'University'}</span>
                          </div>
                        </div>
                      </td>

                      {/* Final Score with visual progress bar */}
                      <td className="px-3 py-3">
                        <div>
                          <div className="flex items-center justify-between font-mono font-bold">
                            <span
                              className={
                                cand.finalScore >= 85
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : cand.finalScore >= 70
                                  ? 'text-indigo-600 dark:text-indigo-400'
                                  : 'text-amber-600 dark:text-amber-400'
                              }
                            >
                              {cand.finalScore}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Lex:{cand.scores.lexicalCombinedScore} | LLM:{cand.scores.llmSemanticScore}
                            </span>
                          </div>
                          <div className="mt-1 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden dark:bg-slate-800">
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
                      </td>

                      {/* Skill Match */}
                      <td className="px-3 py-3">
                        <div>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {cand.scores.skillMatchScore}%
                          </span>
                          <div className="text-[11px] text-slate-500">
                            {cand.skillDetails.matchedRequired.length} matched /{' '}
                            {cand.skillDetails.missingRequired.length} missing
                          </div>
                        </div>
                      </td>

                      {/* Experience */}
                      <td className="px-3 py-3">
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {cand.parsedData.totalExperienceYears} yrs
                        </span>
                        <div className="text-[11px] text-slate-500">
                          Fit: {cand.scores.experienceFitScore}%
                        </div>
                      </td>

                      {/* Fit category badge */}
                      <td className="px-3 py-3">
                        <span
                          className={`inline-flex rounded px-2 py-0.5 text-[10px] font-semibold ${
                            fitCat === 'Excellent'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                              : fitCat === 'Good'
                              ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300'
                              : fitCat === 'Average'
                              ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
                              : 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300'
                          }`}
                        >
                          {fitCat}
                        </span>
                      </td>

                      {/* Status Selector */}
                      <td className="px-3 py-3">
                        <select
                          value={cand.status}
                          onChange={(e) =>
                            handleStatusChangeWithFeedback(cand.id, e.target.value as CandidateStatus)
                          }
                          className={`rounded border px-2 py-1 text-[11px] font-semibold transition-colors ${
                            cand.status === 'Shortlisted'
                              ? 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                              : cand.status === 'Rejected'
                              ? 'border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300'
                              : cand.status === 'On Hold'
                              ? 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                              : 'border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
                          }`}
                        >
                          <option value="New">New</option>
                          <option value="Shortlisted">Shortlisted</option>
                          <option value="On Hold">On Hold</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="px-3 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Compare toggle */}
                          <button
                            onClick={() => toggleCompareCandidate(cand.id)}
                            title={isCompared ? 'Remove from compare' : 'Add to compare'}
                            className={`rounded p-1.5 transition-colors ${
                              isCompared
                                ? 'bg-indigo-600 text-white'
                                : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200'
                            }`}
                          >
                            <GitCompare className="h-3.5 w-3.5" />
                          </button>

                          {/* Quick Inspect Drawer Button */}
                          <button
                            onClick={() => setSelectedCandidate(cand)}
                            title="Inspect candidate details"
                            className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800 dark:hover:text-indigo-400"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
