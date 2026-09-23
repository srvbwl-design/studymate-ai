import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  HelpCircle,
  Sparkles,
  CheckCircle2,
  XCircle,
  Award,
  ArrowRight,
  RotateCcw,
  FileDown,
  Printer,
  Loader2,
  Clock,
  Eye,
  Check,
} from 'lucide-react';
import { api } from '../services/api';
import { Quiz, QuizSubmitResult } from '../types';
import { DifficultySelector } from '../components/DifficultySelector';
import { useToast } from '../context/ToastContext';
import { exportQuizPdf, exportQuizTxt } from '../utils/exporter';

export const QuizzesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const quizIdFromUrl = searchParams.get('id');

  const [activeTab, setActiveTab] = useState<'create' | 'active' | 'history'>('create');

  // Generator Inputs
  const [topic, setTopic] = useState('Operating Systems Process Management');
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [questionsCount, setQuestionsCount] = useState<number>(5);
  const [questionType, setQuestionType] = useState<'MCQ' | 'True/False'>('MCQ');
  const [isGenerating, setIsGenerating] = useState(false);

  // Active Quiz Attempt State
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({}); // { [questionId]: selectedOption }
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<QuizSubmitResult | null>(null);

  // Past Quizzes List
  const [pastQuizzes, setPastQuizzes] = useState<Quiz[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const { success, error } = useToast();

  useEffect(() => {
    loadQuizzesHistory();
  }, []);

  useEffect(() => {
    if (quizIdFromUrl) {
      loadSpecificQuiz(quizIdFromUrl);
    }
  }, [quizIdFromUrl]);

  const loadQuizzesHistory = async () => {
    try {
      setIsLoadingHistory(true);
      const res = await api.getQuizzes();
      setPastQuizzes(res.quizzes);
    } catch (err: any) {
      error('Failed to load past quizzes.');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const loadSpecificQuiz = async (id: string) => {
    try {
      const res = await api.getQuiz(id);
      setActiveQuiz(res.quiz);
      setUserAnswers({});
      setResult(null);
      setCurrentQuestionIndex(0);
      setActiveTab('active');
    } catch (err: any) {
      error('Failed to load quiz details.');
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      error('Please enter a quiz topic.');
      return;
    }

    try {
      setIsGenerating(true);
      const res = await api.generateQuiz({
        topic: topic.trim(),
        difficulty,
        questionsCount,
        questionType,
      });

      setActiveQuiz(res.quiz);
      setUserAnswers({});
      setResult(null);
      setCurrentQuestionIndex(0);
      setActiveTab('active');
      setSearchParams({ id: res.quiz.id });
      success('Interactive quiz generated! Ready when you are.');
      loadQuizzesHistory();
    } catch (err: any) {
      error(err.message || 'Failed to generate quiz.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectOption = (questionId: string, option: string) => {
    if (result) return; // Prevent changing after submission
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: option,
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuiz || !activeQuiz.questions) return;

    // Check if any unanswered
    const unansweredCount = activeQuiz.questions.filter((q) => !userAnswers[q.id]).length;
    if (unansweredCount > 0) {
      if (!window.confirm(`You have ${unansweredCount} unanswered questions. Submit anyway?`)) {
        return;
      }
    }

    try {
      setIsSubmitting(true);
      const res = await api.submitQuiz(activeQuiz.id, userAnswers);
      setResult(res);
      success(`Quiz submitted! Your score: ${res.scoreDisplay} (${res.percentage}%)`);
      loadQuizzesHistory();
    } catch (err: any) {
      error(err.message || 'Failed to submit quiz.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentQuestion = activeQuiz?.questions?.[currentQuestionIndex];
  const totalQuestions = activeQuiz?.questions?.length || 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'create'
                ? 'bg-primary-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate Quiz</span>
          </button>

          {activeQuiz && (
            <button
              onClick={() => setActiveTab('active')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'active'
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Current Test: {activeQuiz.topic.slice(0, 20)}...</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'history'
                ? 'bg-primary-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Saved Quizzes ({pastQuizzes.length})</span>
          </button>
        </div>
      </div>

      {activeTab === 'create' && (
        /* Generator View */
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-600 text-white flex items-center justify-center shadow-xs">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                AI Quiz Generator
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Generate tailored multiple-choice or true/false quizzes with delayed feedback and detailed explanations
              </p>
            </div>
          </div>

          <form onSubmit={handleGenerate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                  Topic / Subject
                </label>
                <input
                  type="text"
                  required
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Operating System Deadlocks"
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                  Number of Questions
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[5, 10, 15, 20].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setQuestionsCount(num)}
                      className={`py-2 rounded-xl border text-xs font-bold text-center transition-all ${
                        questionsCount === num
                          ? 'bg-primary-50 dark:bg-primary-950/40 border-primary-500 text-primary-700 dark:text-primary-300 ring-1 ring-primary-500'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {num} Qs
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                  Question Format
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['MCQ', 'True/False'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setQuestionType(t)}
                      className={`py-2 rounded-xl border text-xs font-bold text-center transition-all ${
                        questionType === t
                          ? 'bg-primary-50 dark:bg-primary-950/40 border-primary-500 text-primary-700 dark:text-primary-300 ring-1 ring-primary-500'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <p className="text-[11px] text-slate-400">
                ⚠️ Answers will remain hidden during test taking to maximize active recall!
              </p>
              <button
                type="submit"
                disabled={isGenerating || !topic.trim()}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-sm shadow-md shadow-purple-500/20 disabled:opacity-50 transition-all flex items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Generating Quiz...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Quiz</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'active' && activeQuiz && (
        /* Interactive Quiz Taking & Result Review View */
        <div className="space-y-6">
          {/* Quiz Header Bar */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                {activeQuiz.difficulty} • {activeQuiz.questionType}
              </span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-1.5">
                {activeQuiz.title}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => exportQuizTxt(activeQuiz, !!result)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                title="Export TXT"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>Export TXT</span>
              </button>

              <button
                onClick={() => exportQuizPdf(activeQuiz, !!result)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                title="Export PDF"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Export PDF</span>
              </button>
            </div>
          </div>

          {!result ? (
            /* Taking Mode (Answers Hidden) */
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
              {/* Progress & Stepper */}
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 pb-2 border-b border-slate-100 dark:border-slate-800">
                <span>
                  Question {currentQuestionIndex + 1} of {totalQuestions}
                </span>
                <span>
                  Answered: {Object.keys(userAnswers).length} / {totalQuestions}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-purple-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
                />
              </div>

              {/* Current Question Body */}
              {currentQuestion && (
                <div className="space-y-6 animate-fade-in">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
                    {currentQuestion.order}. {currentQuestion.question}
                  </h3>

                  {/* Options */}
                  <div className="space-y-3">
                    {currentQuestion.options.map((option, optIdx) => {
                      const letter = String.fromCharCode(65 + optIdx);
                      const isSelected = userAnswers[currentQuestion.id] === option;
                      return (
                        <div
                          key={optIdx}
                          onClick={() => handleSelectOption(currentQuestion.id, option)}
                          className={`flex items-center gap-3.5 p-4 rounded-2xl border cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-500 text-purple-950 dark:text-purple-100 ring-2 ring-purple-500/20 shadow-xs'
                              : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          <div
                            className={`w-7 h-7 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 transition-colors ${
                              isSelected
                                ? 'bg-purple-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            {letter}
                          </div>
                          <span className="text-sm font-medium">{option}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Navigation Stepper Controls */}
                  <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      disabled={currentQuestionIndex === 0}
                      onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                      className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 disabled:opacity-30"
                    >
                      Previous
                    </button>

                    <div className="flex items-center gap-2">
                      {currentQuestionIndex < totalQuestions - 1 ? (
                        <button
                          type="button"
                          onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                          className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs"
                        >
                          Next Question
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={handleSubmitQuiz}
                          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 disabled:opacity-50 flex items-center gap-1.5"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Grading...</span>
                            </>
                          ) : (
                            <>
                              <Check className="w-4 h-4" />
                              <span>Submit Quiz</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Result Review Mode (Scored Breakdown & Explanations) */
            <div className="space-y-6 animate-fade-in">
              {/* Score Banner */}
              <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-900/10 via-primary-900/10 to-emerald-900/10 dark:from-purple-950/40 dark:to-emerald-950/40 border border-purple-500/20 text-center space-y-3">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-emerald-600 text-white shadow-lg mx-auto">
                  <Award className="w-7 h-7" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                  Score: {result.scoreDisplay}
                </h3>
                <p className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                  {result.percentage >= 70
                    ? `Great job! You scored ${result.percentage}%.`
                    : `Keep reviewing! You scored ${result.percentage}%.`}
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setResult(null);
                      setUserAnswers({});
                      setCurrentQuestionIndex(0);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Retake Quiz</span>
                  </button>
                </div>
              </div>

              {/* Detailed Breakdown for each question */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Detailed Answer Review
                </h4>

                {result.questions.map((q, idx) => (
                  <div
                    key={q.id}
                    className={`p-6 rounded-3xl border shadow-xs transition-all ${
                      q.isCorrect
                        ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300/80 dark:border-emerald-900/40'
                        : 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-300/80 dark:border-rose-900/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        {q.isCorrect ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        ) : (
                          <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
                        )}
                        <span className="text-xs font-bold text-slate-500">Question {idx + 1}</span>
                      </div>
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                          q.isCorrect
                            ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200'
                            : 'bg-rose-100 dark:bg-rose-900/50 text-rose-800 dark:text-rose-200'
                        }`}
                      >
                        {q.isCorrect ? 'Correct (+1)' : 'Incorrect'}
                      </span>
                    </div>

                    <h5 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base mb-4">
                      {q.question}
                    </h5>

                    <div className="space-y-2 mb-4">
                      {q.options.map((opt, oIdx) => {
                        const letter = String.fromCharCode(65 + oIdx);
                        const isStudentAnswer = q.studentAnswer === opt;
                        const isCorrectAnswer = q.correctAnswer === opt;

                        let badgeColor = 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900';
                        if (isCorrectAnswer) {
                          badgeColor = 'border-emerald-500 bg-emerald-100/60 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-100 font-bold';
                        } else if (isStudentAnswer && !q.isCorrect) {
                          badgeColor = 'border-rose-500 bg-rose-100/60 dark:bg-rose-950/60 text-rose-900 dark:text-rose-100 line-through';
                        }

                        return (
                          <div
                            key={oIdx}
                            className={`flex items-center gap-3 p-3 rounded-xl border text-xs ${badgeColor}`}
                          >
                            <span className="font-bold w-5">{letter}.</span>
                            <span className="flex-1">{opt}</span>
                            {isCorrectAnswer && (
                              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                                ✓ Correct Answer
                              </span>
                            )}
                            {isStudentAnswer && !isCorrectAnswer && (
                              <span className="text-[10px] font-bold text-rose-700 dark:text-rose-300 uppercase tracking-wider">
                                ✗ Your Answer
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      <strong className="text-slate-900 dark:text-white">Explanation: </strong>
                      {q.explanation}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        /* Saved Quizzes History */
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Saved Quizzes & Attempts
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {isLoadingHistory ? (
              <div className="col-span-2 py-10 text-center text-xs text-slate-400">Loading history...</div>
            ) : pastQuizzes.length === 0 ? (
              <div className="col-span-2 py-10 text-center text-xs text-slate-400">
                No quizzes found. Generate your first quiz above!
              </div>
            ) : (
              pastQuizzes.map((quiz) => {
                const latestAttempt = quiz.attempts?.[0];
                return (
                  <div
                    key={quiz.id}
                    className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300">
                          {quiz.difficulty}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(quiz.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">
                        {quiz.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {quiz.questionsCount} questions • {quiz.questionType}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                      {latestAttempt ? (
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          Score: {latestAttempt.score} / {latestAttempt.totalQuestions}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">Not taken yet</span>
                      )}

                      <button
                        onClick={() => loadSpecificQuiz(quiz.id)}
                        className="px-3 py-1.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs shadow-xs"
                      >
                        {latestAttempt ? 'Review / Retake' : 'Take Quiz'}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
