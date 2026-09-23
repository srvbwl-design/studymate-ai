import React, { useState } from 'react';
import {
  Sparkles,
  BookmarkPlus,
  Copy,
  Check,
  FileDown,
  Printer,
  Loader2,
  BookOpen,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import { api } from '../services/api';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import { DifficultySelector } from '../components/DifficultySelector';
import { useToast } from '../context/ToastContext';
import { printAsPdf, downloadTxt } from '../utils/exporter';

export const ExplainPage: React.FC = () => {
  const [topic, setTopic] = useState('Deadlock in Operating Systems');
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [whatIKnow, setWhatIKnow] = useState('');
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const { success, error } = useToast();

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topic.trim()) {
      error('Please enter a topic to explain.');
      return;
    }

    try {
      setIsGenerating(true);
      const res = await api.explainTopic({
        topic: topic.trim(),
        difficulty,
        whatIKnow: whatIKnow.trim() || undefined,
      });
      setExplanation(res.explanation);
      success('8-Part Explanation generated!');
    } catch (err: any) {
      error(err.message || 'Failed to generate topic explanation.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveAsNote = async () => {
    if (!explanation) return;
    try {
      setIsSaving(true);
      await api.saveNote({
        title: `${topic} - 8-Part Explanation`,
        topic,
        difficulty,
        length: 'Detailed',
        content: explanation,
        tags: [topic, 'Explanation', difficulty],
      });
      success('Explanation saved to your Study Notes!');
    } catch (err: any) {
      error('Failed to save note.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopy = () => {
    if (!explanation) return;
    navigator.clipboard.writeText(explanation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    success('Copied to clipboard!');
  };

  const handleExportTxt = () => {
    if (!explanation) return;
    downloadTxt(`${topic.replace(/\s+/g, '_')}_explanation`, explanation);
  };

  const handleExportPdf = () => {
    if (!explanation) return;
    const cleanBody = explanation
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em>$1</em>')
      .replace(/^- (.*$)/gim, '<li>$1</li>')
      .replace(/\n\n/gim, '<br/><br/>');

    printAsPdf(
      `${topic} Explanation`,
      `<h1>${topic}</h1><p><strong>Difficulty:</strong> ${difficulty}</p><hr/>${cleanBody}`
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Configuration Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 to-accent-600 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              AI Topic Explainer
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Break down any difficult concept into an 8-part structured pedagogical guide
            </p>
          </div>
        </div>

        <form onSubmit={handleGenerate} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                Topic to Learn
              </label>
              <input
                type="text"
                required
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Deadlock in Operating Systems"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <DifficultySelector
                value={difficulty}
                onChange={setDifficulty}
                label="Target Difficulty"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
              What I Already Know (Optional Context)
            </label>
            <input
              type="text"
              value={whatIKnow}
              onChange={(e) => setWhatIKnow(e.target.value)}
              placeholder="e.g. I know what a process is and that threads share memory, but don't understand deadlock conditions."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="text-[11px] text-slate-400 font-medium">
              Produces 8 parts: Definition, Concept, Operational Flow, Example, Analogy, Exam Points, Pitfalls & Recap.
            </div>
            <button
              type="submit"
              disabled={isGenerating || !topic.trim()}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 text-white font-bold text-sm shadow-md shadow-primary-500/20 disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing explanation...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Explanation</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Output Document Display */}
      {explanation && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-md animate-fade-in space-y-6">
          {/* Header Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 border border-primary-200/50 dark:border-primary-800/50">
                {difficulty} Level
              </span>
              <span className="text-xs text-slate-400">8-Part Pedagogical Breakdown</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveAsNote}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 text-xs font-semibold border border-indigo-200/60 dark:border-indigo-800/60 transition-colors"
                title="Save as Note"
              >
                {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <BookmarkPlus className="w-3.5 h-3.5" />}
                <span>Save as Note</span>
              </button>

              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
                title="Copy to clipboard"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                onClick={handleExportTxt}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
                title="Export as TXT"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>TXT</span>
              </button>

              <button
                onClick={handleExportPdf}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
                title="Export as PDF"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>PDF</span>
              </button>
            </div>
          </div>

          {/* Rendered 8-Part Markdown */}
          <div className="prose dark:prose-invert max-w-none">
            <MarkdownRenderer content={explanation} />
          </div>
        </div>
      )}
    </div>
  );
};
