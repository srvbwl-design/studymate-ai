import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  BookOpenText,
  Sparkles,
  Save,
  Copy,
  Check,
  Printer,
  FileDown,
  Trash2,
  Edit3,
  Search,
  Loader2,
  Plus,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import { api } from '../services/api';
import { Note } from '../types';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import { DifficultySelector } from '../components/DifficultySelector';
import { useToast } from '../context/ToastContext';
import { exportNotePdf, exportNoteTxt } from '../utils/exporter';

export const NotesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeNoteId = searchParams.get('id');

  const [activeTab, setActiveTab] = useState<'generate' | 'library'>(activeNoteId ? 'library' : 'generate');

  // Generator State
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [length, setLength] = useState<'Short' | 'Medium' | 'Detailed'>('Medium');
  const [generatedTitle, setGeneratedTitle] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Library State
  const [savedNotes, setSavedNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('All');
  const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);

  // Editor State
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [copied, setCopied] = useState(false);

  const { success, error } = useToast();

  useEffect(() => {
    loadSavedNotes();
  }, [searchTerm, filterDifficulty]);

  useEffect(() => {
    if (activeNoteId && savedNotes.length > 0) {
      const found = savedNotes.find((n) => n.id === activeNoteId);
      if (found) {
        setSelectedNote(found);
        setActiveTab('library');
      }
    }
  }, [activeNoteId, savedNotes]);

  const loadSavedNotes = async () => {
    try {
      setIsLoadingLibrary(true);
      const res = await api.getNotes({
        search: searchTerm || undefined,
        difficulty: filterDifficulty !== 'All' ? filterDifficulty : undefined,
      });
      setSavedNotes(res.notes);
      if (res.notes.length > 0 && !selectedNote) {
        setSelectedNote(res.notes[0]);
      }
    } catch (err: any) {
      error('Failed to load saved notes library.');
    } finally {
      setIsLoadingLibrary(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      error('Please enter a topic for notes.');
      return;
    }

    try {
      setIsGenerating(true);
      const res = await api.generateNotes({
        topic: topic.trim(),
        difficulty,
        length,
      });
      setGeneratedTitle(res.title);
      setGeneratedContent(res.content);
      success('Study notes synthesized successfully!');
    } catch (err: any) {
      error(err.message || 'Failed to generate study notes.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveGenerated = async () => {
    if (!generatedContent) return;
    try {
      setIsSaving(true);
      const res = await api.saveNote({
        title: generatedTitle || `${topic} Notes`,
        topic: topic.trim() || 'Study Topic',
        difficulty,
        length,
        content: generatedContent,
        tags: [topic.trim(), difficulty, `${length} Notes`],
      });
      success('Note saved to library!');
      await loadSavedNotes();
      setSelectedNote(res.note);
      setActiveTab('library');
    } catch (err: any) {
      error('Failed to save note.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (noteId: string) => {
    if (!window.confirm('Are you sure you want to delete this study note?')) return;
    try {
      await api.deleteNote(noteId);
      setSavedNotes((prev) => prev.filter((n) => n.id !== noteId));
      if (selectedNote?.id === noteId) {
        setSelectedNote(savedNotes.find((n) => n.id !== noteId) || null);
      }
      success('Note deleted from library.');
    } catch (err: any) {
      error('Failed to delete note.');
    }
  };

  const handleStartEdit = () => {
    if (!selectedNote) return;
    setEditTitle(selectedNote.title);
    setEditContent(selectedNote.content);
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedNote) return;
    try {
      setIsUpdating(true);
      const res = await api.updateNote(selectedNote.id, {
        title: editTitle,
        content: editContent,
      });
      setSelectedNote(res.note);
      setSavedNotes((prev) => prev.map((n) => (n.id === res.note.id ? res.note : n)));
      setIsEditing(false);
      success('Note updated successfully!');
    } catch (err: any) {
      error('Failed to update note.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    success('Copied note to clipboard!');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Tab Switcher */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('generate')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'generate'
                ? 'bg-primary-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Notes Generator</span>
          </button>
          <button
            onClick={() => setActiveTab('library')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'library'
                ? 'bg-primary-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <BookOpenText className="w-3.5 h-3.5" />
            <span>Saved Notes Library ({savedNotes.length})</span>
          </button>
        </div>
      </div>

      {activeTab === 'generate' ? (
        /* Generator View */
        <div className="space-y-8">
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              Generate Exam-Ready Study Notes
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Creates structured notes with definitions, formulas, case examples, and rapid revision cheat-sheets
            </p>

            <form onSubmit={handleGenerate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                    Topic
                  </label>
                  <input
                    type="text"
                    required
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. Virtual Memory & Paging"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div className="md:col-span-1">
                  <DifficultySelector
                    value={difficulty}
                    onChange={setDifficulty}
                    label="Target Difficulty"
                  />
                </div>

                <div className="md:col-span-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                    Note Detail Length
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Short', 'Medium', 'Detailed'] as const).map((l) => (
                      <button
                        key={l}
                        type="button"
                        onClick={() => setLength(l)}
                        className={`py-2.5 px-3 rounded-xl border text-xs font-bold text-center transition-all ${
                          length === l
                            ? 'bg-primary-50 dark:bg-primary-950/40 border-primary-500 text-primary-700 dark:text-primary-300 ring-1 ring-primary-500'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isGenerating || !topic.trim()}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 text-white font-bold text-sm shadow-md shadow-primary-500/20 disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Synthesizing notes...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate Notes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {generatedContent && (
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-md animate-fade-in space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300">
                    {length} Notes
                  </span>
                  <span className="text-xs text-slate-400">{difficulty} Level</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveGenerated}
                    disabled={isSaving}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold shadow-xs transition-colors"
                  >
                    {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    <span>Save to Library</span>
                  </button>
                  <button
                    onClick={() => handleCopy(generatedContent)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              <div className="prose dark:prose-invert max-w-none">
                <MarkdownRenderer content={generatedContent} />
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Saved Notes Library Split View */
        <div className="flex flex-col lg:flex-row gap-6 min-h-[600px]">
          {/* Left Notes List */}
          <div className="w-full lg:w-80 shrink-0 space-y-4">
            {/* Search & Filter */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <div className="flex gap-1">
                {['All', 'Beginner', 'Intermediate', 'Advanced'].map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setFilterDifficulty(diff)}
                    className={`flex-1 py-1 text-[10px] font-bold rounded-lg border transition-all ${
                      filterDifficulty === diff
                        ? 'bg-primary-50 dark:bg-primary-950/40 border-primary-500 text-primary-700 dark:text-primary-300'
                        : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {isLoadingLibrary ? (
                <div className="p-8 text-center text-xs text-slate-400">Loading library...</div>
              ) : savedNotes.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">No notes found.</div>
              ) : (
                savedNotes.map((note) => (
                  <div
                    key={note.id}
                    onClick={() => {
                      setSelectedNote(note);
                      setIsEditing(false);
                    }}
                    className={`p-3.5 rounded-2xl cursor-pointer border transition-all ${
                      selectedNote?.id === note.id
                        ? 'bg-primary-50/60 dark:bg-primary-950/40 border-primary-500 shadow-xs'
                        : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {note.difficulty}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(note.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">
                      {note.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {note.topic}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Selected Note Detail / Editor View */}
          <div className="flex-1 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs">
            {selectedNote ? (
              <div className="space-y-6">
                {/* Actions Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="text-xl font-bold px-3 py-1.5 rounded-xl border border-primary-500 bg-slate-50 dark:bg-slate-950 w-full"
                      />
                    ) : (
                      <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                        {selectedNote.title}
                      </h2>
                    )}
                    <p className="text-xs text-slate-400 mt-0.5">
                      Topic: {selectedNote.topic} • {selectedNote.difficulty} • {selectedNote.length} Detail
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <button
                        onClick={handleSaveEdit}
                        disabled={isUpdating}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
                      >
                        {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        <span>Save Changes</span>
                      </button>
                    ) : (
                      <button
                        onClick={handleStartEdit}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                        title="Edit note"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleCopy(selectedNote.content)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                      title="Copy content"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>

                    <button
                      onClick={() => exportNoteTxt(selectedNote)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                      title="Export TXT"
                    >
                      <FileDown className="w-3.5 h-3.5" />
                      <span>TXT</span>
                    </button>

                    <button
                      onClick={() => exportNotePdf(selectedNote)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                      title="Export PDF"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>PDF</span>
                    </button>

                    <button
                      onClick={() => handleDelete(selectedNote.id)}
                      className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                      title="Delete note"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                {isEditing ? (
                  <textarea
                    rows={18}
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                ) : (
                  <div className="prose dark:prose-invert max-w-none">
                    <MarkdownRenderer content={selectedNote.content} />
                  </div>
                )}
              </div>
            ) : (
              <div className="py-24 text-center text-xs text-slate-400">
                Select a note from the left to view, edit, or export.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
