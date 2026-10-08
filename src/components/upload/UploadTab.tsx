import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Play,
  Trash2,
  Eye,
  Database,
  ExternalLink,
  Sparkles,
  Link2,
  FolderUp,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { parsePDFFile } from '../../lib/parsers/pdfParser';
import { parseDocxFile, parseTxtFile } from '../../lib/parsers/docxParser';
import { parseResumeText } from '../../lib/parsers/resumeExtractor';
import { ApiKeyBanner } from '../common/ApiKeyBanner';

interface QueuedFile {
  file: File;
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'pending' | 'parsing' | 'parsed' | 'error';
  extractedText?: string;
  extractedLinks?: string[];
  errorMessage?: string;
}

export const UploadTab: React.FC = () => {
  const { runScreening, pipeline, showToast, loadDemoData, candidates } = useApp();
  const [queuedFiles, setQueuedFiles] = useState<QueuedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [previewFile, setPreviewFile] = useState<QueuedFile | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newQueued: QueuedFile[] = Array.from(files).map((f) => ({
      file: f,
      id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      name: f.name,
      size: f.size,
      type: f.name.split('.').pop()?.toLowerCase() || '',
      status: 'pending'
    }));

    setQueuedFiles((prev) => [...prev, ...newQueued]);

    // Parse each file asynchronously
    for (const qf of newQueued) {
      setQueuedFiles((prev) =>
        prev.map((item) => (item.id === qf.id ? { ...item, status: 'parsing' } : item))
      );

      try {
        let extractedText = '';
        let links: string[] = [];

        if (qf.name.endsWith('.pdf')) {
          const res = await parsePDFFile(qf.file);
          extractedText = res.text;
          links = res.links;
        } else if (qf.name.endsWith('.docx')) {
          extractedText = await parseDocxFile(qf.file);
        } else if (qf.name.endsWith('.txt') || qf.name.endsWith('.md')) {
          extractedText = await parseTxtFile(qf.file);
        } else {
          // Fallback to text reading
          extractedText = await qf.file.text();
        }

        setQueuedFiles((prev) =>
          prev.map((item) =>
            item.id === qf.id
              ? {
                  ...item,
                  status: 'parsed',
                  extractedText,
                  extractedLinks: links
                }
              : item
          )
        );
      } catch (err: any) {
        console.error(`Error parsing ${qf.name}:`, err);
        setQueuedFiles((prev) =>
          prev.map((item) =>
            item.id === qf.id
              ? {
                  ...item,
                  status: 'error',
                  errorMessage: err?.message || 'Failed to parse document'
                }
              : item
          )
        );
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleRemove = (id: string) => {
    setQueuedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleStartScreening = async () => {
    const readyFiles = queuedFiles.filter((f) => f.status === 'parsed' && f.extractedText);
    if (readyFiles.length === 0) {
      showToast('Please upload at least one valid resume file first.', 'error');
      return;
    }

    const payload = readyFiles.map((rf) => ({
      file: rf.file,
      text: rf.extractedText || '',
      links: rf.extractedLinks || []
    }));

    await runScreening(payload);
  };

  const stages = [
    { id: 'parsing', label: '1. Ingestion & Links' },
    { id: 'nlp_features', label: '2. TF-IDF & BM25' },
    { id: 'ml_scoring', label: '3. Skill & ML Models' },
    { id: 'llm_analysis', label: '4. Groq Reasoning' },
    { id: 'ranking', label: '5. Calibrated Rank' }
  ];

  return (
    <div className="space-y-6">
      <ApiKeyBanner featureName="Groq LLM resume reasoning" />

      {/* Pipeline Progress Stepper (Visible when screening is active) */}
      {pipeline.active && (
        <div className="rounded-xl border border-indigo-200 bg-indigo-50/70 p-5 shadow-xs dark:border-indigo-900/60 dark:bg-indigo-950/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 animate-spin text-indigo-600 dark:text-indigo-400" />
              <span className="font-semibold text-sm text-indigo-950 dark:text-indigo-200">
                Hybrid NLP + ML Screening Pipeline in Progress
              </span>
            </div>
            <span className="font-mono text-xs font-bold text-indigo-700 dark:text-indigo-300">
              {pipeline.progressPercent}%
            </span>
          </div>

          <div className="mt-3 text-xs text-indigo-800 dark:text-indigo-300">
            Current task: <span className="font-medium">{pipeline.currentCandidate}</span>
          </div>

          {/* Animated Progress Bar */}
          <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-indigo-200 dark:bg-indigo-900">
            <div
              className="h-full rounded-full bg-indigo-600 transition-all duration-300 ease-out dark:bg-indigo-400"
              style={{ width: `${pipeline.progressPercent}%` }}
            />
          </div>

          {/* Stage indicators */}
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5 text-center text-[11px]">
            {stages.map((st) => {
              const isDone =
                (st.id === 'parsing' && pipeline.progressPercent >= 25) ||
                (st.id === 'nlp_features' && pipeline.progressPercent >= 45) ||
                (st.id === 'ml_scoring' && pipeline.progressPercent >= 60) ||
                (st.id === 'llm_analysis' && pipeline.progressPercent >= 90) ||
                (st.id === 'ranking' && pipeline.progressPercent === 100);

              return (
                <div
                  key={st.id}
                  className={`rounded-lg py-1 px-2 border transition-colors ${
                    isDone
                      ? 'border-indigo-400 bg-indigo-100 font-semibold text-indigo-900 dark:border-indigo-700 dark:bg-indigo-900/70 dark:text-indigo-100'
                      : 'border-indigo-200/50 bg-white/50 text-indigo-600 dark:border-indigo-900/40 dark:bg-slate-900/50 dark:text-indigo-400'
                  }`}
                >
                  {st.label}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
          isDragging
            ? 'border-indigo-500 bg-indigo-50/50 dark:border-indigo-400 dark:bg-indigo-950/20'
            : 'border-slate-300 bg-slate-50/50 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900/40 dark:hover:border-slate-600'
        }`}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-950/70 dark:text-indigo-400">
          <UploadCloud className="h-6 w-6" />
        </div>

        <h3 className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">
          Drag & drop resumes here, or browse files
        </h3>
        <p className="mt-1 text-xs text-slate-500 max-w-md">
          Supports <strong>PDF</strong> (extracts embedded annotations & hyperlinks), <strong>DOCX</strong> (Word documents), and <strong>TXT</strong>. Batch upload multiple files or full folders.
        </p>

        {/* Buttons: File, Folder, Demo */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.docx,.txt,.md"
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700"
          >
            <UploadCloud className="h-4 w-4" />
            <span>Select Files</span>
          </button>

          <input
            ref={folderInputRef}
            type="file"
            multiple
            // @ts-ignore
            webkitdirectory=""
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
          />
          <button
            onClick={() => folderInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <FolderUp className="h-4 w-4 text-indigo-500" />
            <span>Upload Folder</span>
          </button>

          <button
            onClick={loadDemoData}
            className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50/80 px-3.5 py-2 text-xs font-medium text-indigo-700 shadow-2xs hover:bg-indigo-100 dark:border-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-300"
          >
            <Database className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span>Load 9 Demo Resumes</span>
          </button>
        </div>
      </div>

      {/* Queued Files List */}
      {queuedFiles.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">
                Uploaded Resumes ({queuedFiles.length})
              </h3>
              <p className="text-xs text-slate-500">
                {queuedFiles.filter((f) => f.status === 'parsed').length} ready for screening
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setQueuedFiles([])}
                className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              >
                Clear All
              </button>
              <button
                onClick={handleStartScreening}
                disabled={pipeline.active}
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 disabled:opacity-50"
              >
                <Play className="h-3.5 w-3.5" />
                <span>Run Screening Pipeline</span>
              </button>
            </div>
          </div>

          <div className="mt-4 divide-y divide-slate-100 text-xs dark:divide-slate-800">
            {queuedFiles.map((qf) => (
              <div
                key={qf.id}
                className="flex items-center justify-between py-2.5 hover:bg-slate-50/50 px-2 rounded-lg dark:hover:bg-slate-800/40"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-slate-400" />
                  <div>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{qf.name}</span>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <span>{Math.round(qf.size / 1024)} KB</span>
                      <span aria-hidden="true">·</span>
                      <span>Format: {qf.type.toUpperCase()}</span>
                      {qf.extractedLinks && qf.extractedLinks.length > 0 && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="flex items-center gap-0.5 text-indigo-600 dark:text-indigo-400 font-medium">
                            <Link2 className="h-3 w-3" />
                            {qf.extractedLinks.length} Links Extracted
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {qf.status === 'parsing' && (
                    <span className="text-[11px] text-amber-600 animate-pulse">Parsing...</span>
                  )}
                  {qf.status === 'parsed' && (
                    <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                      <CheckCircle2 className="h-3 w-3" />
                      Ready
                    </span>
                  )}
                  {qf.status === 'error' && (
                    <span className="inline-flex items-center gap-1 rounded bg-rose-50 px-2 py-0.5 text-[10px] font-semibold text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
                      <AlertCircle className="h-3 w-3" />
                      Failed
                    </span>
                  )}

                  <button
                    onClick={() => setPreviewFile(qf)}
                    className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800"
                    title="Preview extracted raw text"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </button>

                  <button
                    onClick={() => handleRemove(qf.id)}
                    className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-rose-600 dark:hover:bg-slate-800"
                    title="Remove"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Raw Text Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-600" />
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                  Extracted Text: {previewFile.name}
                </h3>
              </div>
              <button
                onClick={() => setPreviewFile(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {previewFile.extractedLinks && previewFile.extractedLinks.length > 0 && (
              <div className="mt-3 rounded-lg border border-indigo-100 bg-indigo-50/50 p-2.5 text-xs dark:border-indigo-900/40 dark:bg-indigo-950/30">
                <span className="font-semibold text-indigo-900 dark:text-indigo-300">
                  Extracted Hyperlinks ({previewFile.extractedLinks.length}):
                </span>
                <div className="mt-1 flex flex-wrap gap-2">
                  {previewFile.extractedLinks.map((url, i) => (
                    <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded bg-white px-2 py-0.5 text-[11px] font-medium text-indigo-600 hover:underline shadow-2xs dark:bg-slate-800 dark:text-indigo-400"
                    >
                      <span>{url.replace(/^https?:\/\//, '').split('/')[0]}</span>
                      <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 flex-1 overflow-y-auto rounded-lg border border-slate-100 bg-slate-50 p-3 font-mono text-xs text-slate-700 leading-relaxed dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
              <pre className="whitespace-pre-wrap font-sans">{previewFile.extractedText || 'No text extracted'}</pre>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setPreviewFile(null)}
                className="rounded-lg bg-slate-200 px-4 py-2 text-xs font-medium text-slate-800 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
