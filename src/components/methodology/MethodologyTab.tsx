import React from 'react';
import {
  BrainCircuit,
  Binary,
  Cpu,
  Layers,
  ShieldAlert,
  ArrowRight,
  GitBranch,
  Calculator,
  Compass,
  CheckCircle2
} from 'lucide-react';

export const MethodologyTab: React.FC = () => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-xs">
            <BrainCircuit className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">
              System Architecture & Mathematical Methodology
            </h1>
            <p className="text-xs text-slate-500">
              Technical overview of the Hybrid NLP and Machine Learning algorithms powering TalentRank AI.
            </p>
          </div>
        </div>
      </div>

      {/* Visual Pipeline Flow Diagram */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
          End-to-End Processing Architecture
        </h2>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-7 text-xs">
          {/* Step 1 */}
          <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-4 text-center dark:border-slate-800 dark:bg-slate-800/40">
            <span className="font-mono text-[10px] text-slate-400">INPUT</span>
            <span className="mt-1 font-bold text-slate-900 dark:text-white">Resume Ingestion</span>
            <span className="mt-1 text-[11px] text-slate-500">PDF, DOCX, TXT + Link Annotations</span>
          </div>

          <div className="hidden sm:flex items-center justify-center text-slate-300 dark:text-slate-700">
            <ArrowRight className="h-4 w-4" />
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center justify-center rounded-xl border border-indigo-200 bg-indigo-50/60 p-4 text-center dark:border-indigo-900/60 dark:bg-indigo-950/40">
            <span className="font-mono text-[10px] text-indigo-500">STAGE 1</span>
            <span className="mt-1 font-bold text-indigo-950 dark:text-indigo-200">Lexical NLP</span>
            <span className="mt-1 text-[11px] text-indigo-900/70 dark:text-indigo-300/70">
              TF-IDF Vectors + Okapi BM25
            </span>
          </div>

          <div className="hidden sm:flex items-center justify-center text-slate-300 dark:text-slate-700">
            <ArrowRight className="h-4 w-4" />
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 text-center dark:border-emerald-900/60 dark:bg-emerald-950/40">
            <span className="font-mono text-[10px] text-emerald-500">STAGE 2</span>
            <span className="mt-1 font-bold text-emerald-950 dark:text-emerald-200">Skill Taxonomy</span>
            <span className="mt-1 text-[11px] text-emerald-900/70 dark:text-emerald-300/70">
              Synonym Mapping & Exact Match
            </span>
          </div>

          <div className="hidden sm:flex items-center justify-center text-slate-300 dark:text-slate-700">
            <ArrowRight className="h-4 w-4" />
          </div>

          {/* Step 4 */}
          <div className="flex flex-col items-center justify-center rounded-xl border border-violet-200 bg-violet-50/60 p-4 text-center dark:border-violet-900/60 dark:bg-violet-950/40">
            <span className="font-mono text-[10px] text-violet-500">STAGE 3</span>
            <span className="mt-1 font-bold text-violet-950 dark:text-violet-200">Groq LLM Reasoning</span>
            <span className="mt-1 text-[11px] text-violet-900/70 dark:text-violet-300/70">
              Qualitative Semantic Scoring
            </span>
          </div>
        </div>

        {/* Fusion Step */}
        <div className="mt-4 rounded-xl border border-slate-200 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 p-4 text-center dark:border-slate-800 dark:from-slate-900 dark:via-indigo-950/30 dark:to-slate-900">
          <div className="text-xs font-bold text-indigo-900 dark:text-indigo-300">
            Hybrid Fusion Engine & Recruiter Logistic Regression Calibration → Final Ranks
          </div>
        </div>
      </div>

      {/* Mathematical Formulations */}
      <div className="space-y-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Core Mathematical Formulations
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Card 1: TF-IDF & Cosine */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs">
              <Calculator className="h-4 w-4" />
              <span>1. TF-IDF & Cosine Similarity</span>
            </div>
            <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
              We compute term frequency with sub-linear scaling and smooth inverse document frequency:
            </p>
            <div className="mt-3 rounded-lg bg-slate-50 p-3 font-mono text-[11px] text-slate-800 dark:bg-slate-800 dark:text-slate-200">
              <div>TF(t, d) = 1 + ln(f(t, d))</div>
              <div className="mt-1">IDF(t, D) = ln((|D| + 1) / (DF(t) + 1)) + 1</div>
              <div className="mt-2 font-semibold text-indigo-600 dark:text-indigo-400">
                Cosine Similarity = (u · v) / (||u||₂ · ||v||₂)
              </div>
            </div>
          </div>

          {/* Card 2: Okapi BM25 */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2 text-emerald-600 font-semibold text-xs">
              <Binary className="h-4 w-4" />
              <span>2. Okapi BM25 Scoring</span>
            </div>
            <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
              Probabilistic relevance model incorporating document length normalization:
            </p>
            <div className="mt-3 rounded-lg bg-slate-50 p-3 font-mono text-[11px] text-slate-800 dark:bg-slate-800 dark:text-slate-200">
              <div>BM25(D, Q) = ∑ IDF(q) · [ f(q, D)·(k₁ + 1) ] / [ f(q, D) + k₁·(1 - b + b·(|D|/avgdl)) ]</div>
              <div className="mt-2 text-[10px] text-slate-400">
                Parameters calibrated: k₁ = 1.5, b = 0.75
              </div>
            </div>
          </div>

          {/* Card 3: In-Browser Logistic Regression */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2 text-violet-600 font-semibold text-xs">
              <Cpu className="h-4 w-4" />
              <span>3. Logistic Regression Feedback Model</span>
            </div>
            <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
              Learns from recruiter Shortlist (y=1) vs. Reject (y=0) actions via Gradient Descent:
            </p>
            <div className="mt-3 rounded-lg bg-slate-50 p-3 font-mono text-[11px] text-slate-800 dark:bg-slate-800 dark:text-slate-200">
              <div>z = w₀ + ∑ wⱼ · xⱼ</div>
              <div className="mt-1">P(y=1 | x) = σ(z) = 1 / (1 + e⁻ᶻ)</div>
              <div className="mt-1">Loss = -[y·ln(ŷ) + (1-y)·ln(1-ŷ)] + (λ/2m)·||w||²</div>
            </div>
          </div>

          {/* Card 4: Hybrid Weighted Final Score */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2 text-amber-600 font-semibold text-xs">
              <Layers className="h-4 w-4" />
              <span>4. Final Calibrated Hybrid Score</span>
            </div>
            <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
              Normalized convex combination parameterized by configurable sliders:
            </p>
            <div className="mt-3 rounded-lg bg-slate-50 p-3 font-mono text-[11px] text-slate-800 dark:bg-slate-800 dark:text-slate-200">
              <div>S_final = (w_lex·S_lex + w_skl·S_skl + w_exp·S_exp + w_edu·S_edu + w_llm·S_llm) / ∑ w</div>
              <div className="mt-2 text-[10px] text-slate-400">
                Constrained to 0–100 scale with full explainability breakdown
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Limitations and Ethical Guardrails */}
      <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-5 dark:border-rose-950/60 dark:bg-rose-950/20">
        <div className="flex items-center gap-2 text-rose-800 font-semibold text-xs dark:text-rose-300">
          <ShieldAlert className="h-4 w-4" />
          <span>Ethics, Algorithmic Bias Mitigation & Guardrails</span>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-rose-950/80 dark:text-rose-200">
          Automated resume screening models risk perpetuating historical hiring biases if unconstrained. TalentRank AI enforces <strong>Blind Screening Mode</strong>, stripping names, gender pronouns, and photos. Scoring vectors are grounded strictly in objective evidence (code repositories, published papers, tenure duration, and skills taxonomy). Automated rankings serve as decision support tools, never replacing human recruiter oversight.
        </p>
      </div>
    </div>
  );
};
