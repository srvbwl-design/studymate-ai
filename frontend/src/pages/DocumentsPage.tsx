import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  UploadCloud,
  Trash2,
  Bot,
  Send,
  Sparkles,
  FileCheck,
  AlertCircle,
  Loader2,
  X,
  FileUp,
  FileSpreadsheet,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../services/api';
import { DocumentItem } from '../types';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import { useToast } from '../context/ToastContext';

export const DocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Q&A State
  const [qaHistory, setQaHistory] = useState<Array<{ question: string; answer: string }>>([]);
  const [questionInput, setQuestionInput] = useState('');
  const [isAsking, setIsAsking] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const qaEndRef = useRef<HTMLDivElement>(null);
  const { success, error } = useToast();

  const suggestedPrompts = [
    'Summarize this PDF',
    'What are the most important exam topics?',
    'Create 10 MCQs from this document',
    'Explain the key formulas and core algorithms',
  ];

  useEffect(() => {
    loadDocuments();
  }, []);

  useEffect(() => {
    qaEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [qaHistory, isAsking]);

  const loadDocuments = async () => {
    try {
      setIsLoadingDocs(true);
      const res = await api.getDocuments();
      setDocuments(res.documents);
      if (res.documents.length > 0 && !selectedDoc) {
        setSelectedDoc(res.documents[0]);
      }
    } catch (err: any) {
      error('Failed to load documents.');
    } finally {
      setIsLoadingDocs(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (15MB)
    if (file.size > 15 * 1024 * 1024) {
      error('File is too large. Max limit is 15MB.');
      return;
    }

    try {
      setIsUploading(true);
      const res = await api.uploadDocument(file);
      setDocuments((prev) => [res.document, ...prev]);
      setSelectedDoc(res.document);
      setQaHistory([]);
      success(`Uploaded and indexed ${file.name}!`);
    } catch (err: any) {
      error(err.message || 'Failed to upload document.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Delete this uploaded document?')) return;
    try {
      await api.deleteDocument(id);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
      if (selectedDoc?.id === id) {
        setSelectedDoc(documents.find((d) => d.id !== id) || null);
        setQaHistory([]);
      }
      success('Document deleted.');
    } catch (err: any) {
      error('Failed to delete document.');
    }
  };

  const handleAsk = async (queryText?: string) => {
    const query = queryText || questionInput;
    if (!selectedDoc || !query.trim() || isAsking) return;

    const currentQ = query.trim();
    setQuestionInput('');
    setIsAsking(true);

    try {
      const res = await api.askDocument(selectedDoc.id, currentQ);
      setQaHistory((prev) => [...prev, { question: currentQ, answer: res.answer }]);
    } catch (err: any) {
      error(err.message || 'Failed to ask question about document.');
    } finally {
      setIsAsking(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Upload Header Box */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-bold text-xs uppercase tracking-wider mb-1">
              <UploadCloud className="w-4 h-4" />
              <span>Document Intelligence & PDF Learning</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Upload Your Study Materials
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Upload course syllabus, lecture slides, or textbook chapters (PDF, TXT, MD) and ask grounded questions.
            </p>
          </div>

          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".pdf,.txt,.md,.csv"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 text-white font-bold text-xs shadow-md shadow-primary-500/20 disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Extracting document text...</span>
                </>
              ) : (
                <>
                  <FileUp className="w-4 h-4" />
                  <span>Upload PDF or TXT</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Split Interface */}
      <div className="flex flex-col lg:flex-row gap-6 min-h-[600px]">
        {/* Left Documents List */}
        <div className="w-full lg:w-80 shrink-0 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Your Documents ({documents.length})
            </h3>
          </div>

          <div className="space-y-2.5 max-h-[620px] overflow-y-auto">
            {isLoadingDocs ? (
              <div className="p-8 text-center text-xs text-slate-400">Loading documents...</div>
            ) : documents.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                No documents uploaded yet. Upload a lecture PDF or TXT note above!
              </div>
            ) : (
              documents.map((doc) => {
                const isSelected = selectedDoc?.id === doc.id;
                const isPdf = doc.mimeType.includes('pdf') || doc.originalName.endsWith('.pdf');
                return (
                  <div
                    key={doc.id}
                    onClick={() => {
                      setSelectedDoc(doc);
                      setQaHistory([]);
                    }}
                    className={`group p-4 rounded-2xl cursor-pointer border transition-all ${
                      isSelected
                        ? 'bg-primary-50/70 dark:bg-primary-950/40 border-primary-500 shadow-xs'
                        : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            isPdf
                              ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-600'
                              : 'bg-blue-100 dark:bg-blue-900/40 text-blue-600'
                          }`}
                        >
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                            {doc.originalName}
                          </h4>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {formatFileSize(doc.sizeBytes)} • {new Date(doc.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={(e) => handleDelete(doc.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-opacity"
                        title="Delete document"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {doc.summary && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2.5 line-clamp-2 italic">
                        "{doc.summary}"
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Document Q&A Assistant */}
        <div className="flex-1 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-col shadow-xs overflow-hidden">
          {selectedDoc ? (
            <div className="flex flex-col h-full">
              {/* Active Document Header */}
              <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-primary-100 dark:bg-primary-900/50 text-primary-600 flex items-center justify-center shrink-0">
                    <FileCheck className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                      Ask AI about: {selectedDoc.originalName}
                    </h3>
                    <p className="text-[10px] text-slate-400 truncate">
                      Extracted context ready for questions, summaries, and MCQ generation
                    </p>
                  </div>
                </div>
              </div>

              {/* Chat & Q&A Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
                {qaHistory.length === 0 ? (
                  /* Initial Document Overview & Quick Action Chips */
                  <div className="max-w-xl mx-auto py-8 text-center space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary-600 to-accent-600 text-white flex items-center justify-center mx-auto shadow-md">
                      <Bot className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-slate-900 dark:text-white">
                        Ask Anything About This Document
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Select a recommended query below or type your custom question.
                      </p>
                    </div>

                    {/* Pre-made Query Chips */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-4 text-left">
                      {suggestedPrompts.map((prompt, i) => (
                        <button
                          key={i}
                          onClick={() => handleAsk(prompt)}
                          className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 hover:border-primary-500 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-all text-left"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  qaHistory.map((item, index) => (
                    <div key={index} className="space-y-4 animate-fade-in">
                      {/* User Question */}
                      <div className="flex justify-end">
                        <div className="max-w-xl p-3.5 rounded-2xl bg-primary-600 text-white text-xs font-semibold rounded-br-xs shadow-xs">
                          {item.question}
                        </div>
                      </div>

                      {/* AI Answer */}
                      <div className="flex gap-3 justify-start">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary-600 to-accent-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-1">
                          <Bot className="w-4 h-4" />
                        </div>
                        <div className="max-w-2xl p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 text-xs text-slate-800 dark:text-slate-100 shadow-xs">
                          <MarkdownRenderer content={item.answer} />
                        </div>
                      </div>
                    </div>
                  ))
                )}

                {isAsking && (
                  <div className="flex gap-3 items-center text-xs font-semibold text-slate-400 animate-pulse">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary-600 to-accent-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-primary-600" />
                      <span>Reading document context & analyzing...</span>
                    </div>
                  </div>
                )}

                <div ref={qaEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-3.5 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={questionInput}
                    onChange={(e) => setQuestionInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAsk();
                      }
                    }}
                    placeholder="Ask a question about this document (e.g. 'Summarize chapter 1', 'List key definitions')..."
                    className="w-full pl-4 pr-12 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-xs"
                  />
                  <button
                    onClick={() => handleAsk()}
                    disabled={!questionInput.trim() || isAsking}
                    className="absolute right-2 p-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white disabled:opacity-40 transition-all shadow-xs"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-32 text-center text-xs text-slate-400">
              Select or upload a document to begin questioning.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
