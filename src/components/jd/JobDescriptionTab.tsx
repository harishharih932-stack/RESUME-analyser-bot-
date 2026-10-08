import React, { useState } from 'react';
import {
  Sparkles,
  Save,
  Plus,
  Trash2,
  Tag,
  Briefcase,
  MapPin,
  Clock,
  GraduationCap,
  X,
  FileText,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { JobDescription } from '../../types';
import { extractRequirementsFromJDText } from '../../lib/groq/client';
import { ApiKeyBanner } from '../common/ApiKeyBanner';
import { extractSkillsFromText } from '../../lib/nlp/skillsTaxonomy';

export const JobDescriptionTab: React.FC = () => {
  const {
    currentJD,
    jobDescriptions,
    setCurrentJDId,
    saveJobDescription,
    createNewJobDescription,
    deleteJobDescription,
    settings,
    showToast
  } = useApp();

  const [formData, setFormData] = useState<JobDescription>(currentJD);
  const [newRequiredSkill, setNewRequiredSkill] = useState('');
  const [newPreferredSkill, setNewPreferredSkill] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);

  // Sync formData when currentJD changes
  React.useEffect(() => {
    setFormData(currentJD);
  }, [currentJD]);

  const handleAddRequiredSkill = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    if (newRequiredSkill.trim() && !formData.requiredSkills.includes(newRequiredSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        requiredSkills: [...prev.requiredSkills, newRequiredSkill.trim()]
      }));
      setNewRequiredSkill('');
    }
  };

  const handleRemoveRequiredSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      requiredSkills: prev.requiredSkills.filter(s => s !== skill)
    }));
  };

  const handleAddPreferredSkill = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    if (newPreferredSkill.trim() && !formData.preferredSkills.includes(newPreferredSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        preferredSkills: [...prev.preferredSkills, newPreferredSkill.trim()]
      }));
      setNewPreferredSkill('');
    }
  };

  const handleRemovePreferredSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      preferredSkills: prev.preferredSkills.filter(s => s !== skill)
    }));
  };

  // Auto-extract using Groq LLM (or fallback NLP taxonomy)
  const handleAutoExtract = async () => {
    if (!formData.rawText || formData.rawText.trim().length < 20) {
      showToast('Please paste a substantial Job Description text first.', 'error');
      return;
    }

    setIsExtracting(true);
    try {
      if (settings.groqApiKey && settings.groqApiKey.trim().length > 0) {
        showToast('Analyzing Job Description with Groq LLM...', 'info');
        const extracted = await extractRequirementsFromJDText(formData.rawText, settings);

        setFormData(prev => ({
          ...prev,
          title: extracted.title || prev.title,
          requiredSkills: extracted.requiredSkills && extracted.requiredSkills.length > 0 ? extracted.requiredSkills : prev.requiredSkills,
          preferredSkills: extracted.preferredSkills && extracted.preferredSkills.length > 0 ? extracted.preferredSkills : prev.preferredSkills,
          minExperienceYears: extracted.minExperienceYears !== undefined ? extracted.minExperienceYears : prev.minExperienceYears,
          educationLevel: (extracted.educationLevel as any) || prev.educationLevel,
          location: extracted.location || prev.location
        }));
        showToast('Successfully extracted structured requirements via Groq!', 'success');
      } else {
        // Local NLP extraction fallback
        const extractedSkills = extractSkillsFromText(formData.rawText);
        const req = extractedSkills.slice(0, 6);
        const pref = extractedSkills.slice(6, 12);

        setFormData(prev => ({
          ...prev,
          requiredSkills: req.length > 0 ? req : prev.requiredSkills,
          preferredSkills: pref.length > 0 ? pref : prev.preferredSkills
        }));
        showToast('Extracted skills using local NLP taxonomy (Groq key not configured).', 'info');
      }
    } catch (err: any) {
      showToast(`Extraction failed: ${err.message}`, 'error');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSave = () => {
    saveJobDescription(formData);
  };

  return (
    <div className="space-y-6">
      <ApiKeyBanner featureName="Auto-extract requirements using AI" />

      {/* Top Bar: Selector & Actions */}
      <div className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-2xs sm:flex-row sm:items-center dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Job Profiles:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {jobDescriptions.map(jd => (
              <button
                key={jd.id}
                onClick={() => setCurrentJDId(jd.id)}
                className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
                  jd.id === currentJD.id
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {jd.title}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={createNewJobDescription}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <Plus className="h-3.5 w-3.5 text-indigo-600" />
            <span>New Profile</span>
          </button>
          {jobDescriptions.length > 1 && (
            <button
              onClick={() => deleteJobDescription(currentJD.id)}
              className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-100 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-300"
              title="Delete this profile"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete</span>
            </button>
          )}
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700"
          >
            <Save className="h-3.5 w-3.5" />
            <span>Save Profile</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Form & Freeform JD text */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left Column: Structured Requirements */}
        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <h2 className="font-semibold text-slate-900 dark:text-white">Structured Criteria</h2>
          <p className="text-xs text-slate-500">
            These parameters calibrate the scoring weights and skill coverage percentages.
          </p>

          <div className="space-y-3.5 text-xs">
            {/* Title & Department */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block font-medium text-slate-700 dark:text-slate-300">
                  Job Title *
                </label>
                <div className="relative">
                  <Briefcase className="pointer-events-none absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={formData.title}
                    onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    placeholder="e.g. Senior Machine Learning Engineer"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block font-medium text-slate-700 dark:text-slate-300">
                  Department
                </label>
                <input
                  type="text"
                  value={formData.department || ''}
                  onChange={e => setFormData(p => ({ ...p, department: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 bg-white py-1.5 px-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  placeholder="e.g. Applied AI Systems"
                />
              </div>
            </div>

            {/* Experience & Education & Location */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label className="mb-1 block font-medium text-slate-700 dark:text-slate-300">
                  Min Experience (Years)
                </label>
                <div className="relative">
                  <Clock className="pointer-events-none absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={formData.minExperienceYears}
                    onChange={e =>
                      setFormData(p => ({ ...p, minExperienceYears: parseInt(e.target.value, 10) || 0 }))
                    }
                    className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block font-medium text-slate-700 dark:text-slate-300">
                  Education Level Prerequisite
                </label>
                <div className="relative">
                  <GraduationCap className="pointer-events-none absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <select
                    value={formData.educationLevel}
                    onChange={e => setFormData(p => ({ ...p, educationLevel: e.target.value as any }))}
                    className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  >
                    <option value="Any">Any Education</option>
                    <option value="High School">High School</option>
                    <option value="Associate">Associate Degree</option>
                    <option value="Bachelors">Bachelor's Degree</option>
                    <option value="Masters">Master's Degree</option>
                    <option value="PhD">Ph.D. / Doctorate</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block font-medium text-slate-700 dark:text-slate-300">
                  Location
                </label>
                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={formData.location || ''}
                    onChange={e => setFormData(p => ({ ...p, location: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    placeholder="e.g. San Francisco, CA"
                  />
                </div>
              </div>
            </div>

            {/* Required Skills Tags */}
            <div>
              <div className="flex items-center justify-between">
                <label className="font-medium text-slate-700 dark:text-slate-300">
                  Required Skills (Mandatory Prerequisite)
                </label>
                <span className="text-[11px] text-slate-400">{formData.requiredSkills.length} defined</span>
              </div>
              <div className="mt-1 flex flex-wrap gap-1.5 rounded-lg border border-slate-200 bg-slate-50/50 p-2 dark:border-slate-700 dark:bg-slate-800/40">
                {formData.requiredSkills.map(skill => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 rounded bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-200"
                  >
                    {skill}
                    <button
                      onClick={() => handleRemoveRequiredSkill(skill)}
                      className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-300"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                <div className="flex flex-1 min-w-[120px] items-center gap-1">
                  <input
                    type="text"
                    value={newRequiredSkill}
                    onChange={e => setNewRequiredSkill(e.target.value)}
                    onKeyDown={handleAddRequiredSkill}
                    placeholder="Add skill & press Enter..."
                    className="w-full bg-transparent px-1 py-0.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden dark:text-slate-100"
                  />
                </div>
              </div>
            </div>

            {/* Preferred Skills Tags */}
            <div>
              <div className="flex items-center justify-between">
                <label className="font-medium text-slate-700 dark:text-slate-300">
                  Preferred / Nice-to-Have Skills
                </label>
                <span className="text-[11px] text-slate-400">{formData.preferredSkills.length} defined</span>
              </div>
              <div className="mt-1 flex flex-wrap gap-1.5 rounded-lg border border-slate-200 bg-slate-50/50 p-2 dark:border-slate-700 dark:bg-slate-800/40">
                {formData.preferredSkills.map(skill => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 rounded bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-800 dark:bg-slate-700 dark:text-slate-200"
                  >
                    {skill}
                    <button
                      onClick={() => handleRemovePreferredSkill(skill)}
                      className="text-slate-600 hover:text-slate-900 dark:text-slate-400"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                <div className="flex flex-1 min-w-[120px] items-center gap-1">
                  <input
                    type="text"
                    value={newPreferredSkill}
                    onChange={e => setNewPreferredSkill(e.target.value)}
                    onKeyDown={handleAddPreferredSkill}
                    placeholder="Add skill & press Enter..."
                    className="w-full bg-transparent px-1 py-0.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden dark:text-slate-100"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Freeform JD Text & AI Extractor */}
        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-white">Full Job Description Text</h2>
              <p className="text-xs text-slate-500">
                Used for TF-IDF cosine similarity, BM25 matching & LLM semantic reasoning.
              </p>
            </div>

            <button
              onClick={handleAutoExtract}
              disabled={isExtracting}
              className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1.5 text-xs font-semibold text-indigo-700 shadow-2xs transition-colors hover:bg-indigo-100 disabled:opacity-50 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300"
              title="Parse JD with Groq to automatically fill structured fields"
            >
              <Sparkles className={`h-3.5 w-3.5 ${isExtracting ? 'animate-spin' : ''}`} />
              <span>{isExtracting ? 'Extracting...' : 'Auto-Extract with AI'}</span>
            </button>
          </div>

          <textarea
            rows={15}
            value={formData.rawText}
            onChange={e => setFormData(p => ({ ...p, rawText: e.target.value }))}
            placeholder="Paste complete Job Description here..."
            className="w-full font-mono rounded-lg border border-slate-200 bg-slate-50/60 p-3 text-xs leading-relaxed text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-hidden dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200 dark:focus:bg-slate-900"
          />

          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Character count: {formData.rawText.length}</span>
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700"
            >
              <Save className="h-3.5 w-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
