import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  CalendarCheck,
  Sparkles,
  CheckCircle2,
  Circle,
  FileDown,
  Printer,
  Trash2,
  Clock,
  BookOpen,
  HelpCircle,
  TrendingUp,
  Loader2,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { api } from '../services/api';
import { StudyPlan, StudyPlanDay } from '../types';
import { DifficultySelector } from '../components/DifficultySelector';
import { useToast } from '../context/ToastContext';
import { exportStudyPlanPdf, exportStudyPlanTxt } from '../utils/exporter';

export const StudyPlansPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const planIdFromUrl = searchParams.get('id');

  const [activeTab, setActiveTab] = useState<'create' | 'plans'>('create');

  // Generator Inputs
  const [subject, setSubject] = useState('Operating Systems');
  const [knowledgeLevel, setKnowledgeLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [dailyTimeMinutes, setDailyTimeMinutes] = useState<number>(120);
  const [durationDays, setDurationDays] = useState<number>(7);
  const [examDate, setExamDate] = useState('');
  const [extraTopics, setExtraTopics] = useState('Virtual Memory, Page Replacement, Semaphores');
  const [isGenerating, setIsGenerating] = useState(false);

  // Active Plans List & Selection
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<StudyPlan | null>(null);
  const [expandedDay, setExpandedDay] = useState<number | null>(1);
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);

  const { success, error } = useToast();

  useEffect(() => {
    loadPlans();
  }, []);

  useEffect(() => {
    if (planIdFromUrl && plans.length > 0) {
      loadSpecificPlan(planIdFromUrl);
    }
  }, [planIdFromUrl, plans]);

  const loadPlans = async () => {
    try {
      setIsLoadingPlans(true);
      const res = await api.getStudyPlans();
      setPlans(res.plans);
      if (res.plans.length > 0 && !selectedPlan) {
        loadSpecificPlan(res.plans[0].id);
      }
    } catch (err: any) {
      error('Failed to load study plans.');
    } finally {
      setIsLoadingPlans(false);
    }
  };

  const loadSpecificPlan = async (id: string) => {
    try {
      const res = await api.getStudyPlan(id);
      setSelectedPlan(res.plan);
      setActiveTab('plans');
    } catch (err: any) {
      error('Failed to load study plan details.');
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) {
      error('Please enter a course or subject name.');
      return;
    }

    try {
      setIsGenerating(true);
      const res = await api.generateStudyPlan({
        subject: subject.trim(),
        knowledgeLevel,
        difficulty,
        dailyTimeMinutes,
        durationDays,
        examDate: examDate || undefined,
        extraTopics: extraTopics.trim() || undefined,
      });

      setSelectedPlan(res.plan);
      setPlans((prev) => [res.plan, ...prev]);
      setActiveTab('plans');
      setSearchParams({ id: res.plan.id });
      success('Personalized study plan created successfully!');
    } catch (err: any) {
      error(err.message || 'Failed to generate study plan.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleDay = async (dayId: string, currentStatus: boolean) => {
    if (!selectedPlan) return;
    try {
      const res = await api.toggleStudyPlanDay(selectedPlan.id, dayId, !currentStatus);
      setSelectedPlan(res.plan);
      setPlans((prev) => prev.map((p) => (p.id === res.plan.id ? res.plan : p)));
      success(
        !currentStatus
          ? 'Day marked as completed! Keep up the great work.'
          : 'Day marked as incomplete.'
      );
    } catch (err: any) {
      error('Failed to update day completion.');
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this study plan?')) return;
    try {
      await api.deleteStudyPlan(id);
      setPlans((prev) => prev.filter((p) => p.id !== id));
      if (selectedPlan?.id === id) {
        setSelectedPlan(plans.find((p) => p.id !== id) || null);
      }
      success('Study plan deleted.');
    } catch (err: any) {
      error('Failed to delete study plan.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Navigation Tabs */}
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
            <span>Create New Plan</span>
          </button>

          <button
            onClick={() => setActiveTab('plans')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'plans'
                ? 'bg-primary-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <CalendarCheck className="w-3.5 h-3.5" />
            <span>Active Roadmaps ({plans.length})</span>
          </button>
        </div>
      </div>

      {activeTab === 'create' ? (
        /* Generator Form */
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-xs">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Personalized Study Plan Generator
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Design a realistic day-by-day roadmap balancing theory, hands-on practice, and revision
              </p>
            </div>
          </div>

          <form onSubmit={handleGenerate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                  Course / Subject Name
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Operating Systems"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <DifficultySelector
                  value={difficulty}
                  onChange={setDifficulty}
                  label="Target Rigor Level"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                  Current Knowledge Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Beginner', 'Intermediate', 'Advanced'] as const).map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setKnowledgeLevel(k)}
                      className={`py-2 px-1 text-center rounded-xl border text-xs font-bold transition-all ${
                        knowledgeLevel === k
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {k}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                  Daily Study Time
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: '1 hr', val: 60 },
                    { label: '2 hrs', val: 120 },
                    { label: '3 hrs', val: 180 },
                  ].map((t) => (
                    <button
                      key={t.val}
                      type="button"
                      onClick={() => setDailyTimeMinutes(t.val)}
                      className={`py-2 rounded-xl border text-xs font-bold text-center transition-all ${
                        dailyTimeMinutes === t.val
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                  Plan Duration (Days)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[7, 14, 30].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDurationDays(d)}
                      className={`py-2 rounded-xl border text-xs font-bold text-center transition-all ${
                        durationDays === d
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {d} Days
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                  Exam Date (Optional)
                </label>
                <input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                  Topics Needing Extra Attention
                </label>
                <input
                  type="text"
                  value={extraTopics}
                  onChange={(e) => setExtraTopics(e.target.value)}
                  placeholder="e.g. Semaphores, Page Replacement, File Systems"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isGenerating || !subject.trim()}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-md shadow-emerald-500/20 disabled:opacity-50 transition-all flex items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Constructing Roadmap...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Study Plan</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Active Plan View with Progress Tracking */
        <div className="flex flex-col lg:flex-row gap-6 min-h-[600px]">
          {/* Left Plans List */}
          <div className="w-full lg:w-72 shrink-0 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 px-1">
              Your Roadmaps
            </h3>
            {isLoadingPlans ? (
              <div className="p-4 text-xs text-slate-400">Loading plans...</div>
            ) : plans.length === 0 ? (
              <div className="p-4 text-xs text-slate-400">No active plans. Create one above!</div>
            ) : (
              plans.map((p) => (
                <div
                  key={p.id}
                  onClick={() => loadSpecificPlan(p.id)}
                  className={`p-4 rounded-2xl cursor-pointer border transition-all ${
                    selectedPlan?.id === p.id
                      ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-500 shadow-xs'
                      : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {p.subject}
                    </span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      {p.progressPercent}%
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mb-2">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${p.progressPercent}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400">
                    {p.durationDays} Days • {p.dailyTimeMinutes} min/day
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Right Selected Plan Days Timeline */}
          <div className="flex-1 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-xs">
            {selectedPlan ? (
              <div className="space-y-6">
                {/* Header & Controls */}
                <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                        {selectedPlan.title}
                      </h2>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {selectedPlan.durationDays} Days Schedule • {selectedPlan.dailyTimeMinutes} min/day • Level: {selectedPlan.knowledgeLevel}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => exportStudyPlanTxt(selectedPlan)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                    >
                      <FileDown className="w-3.5 h-3.5" />
                      <span>TXT</span>
                    </button>
                    <button
                      onClick={() => exportStudyPlanPdf(selectedPlan)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>PDF</span>
                    </button>
                    <button
                      onClick={() => handleDeletePlan(selectedPlan.id)}
                      className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                      title="Delete study plan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Progress Overview Bar */}
                <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold text-xs">
                      {selectedPlan.progressPercent}%
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        Curriculum Progress
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {selectedPlan.days?.filter((d) => d.isCompleted).length || 0} of {selectedPlan.durationDays} Days Completed
                      </p>
                    </div>
                  </div>
                  <div className="w-48 hidden sm:block">
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${selectedPlan.progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Days Accordion */}
                <div className="space-y-3">
                  {(selectedPlan.days || []).map((day) => {
                    const isExpanded = expandedDay === day.dayNumber;
                    return (
                      <div
                        key={day.id}
                        className={`rounded-2xl border transition-all ${
                          day.isCompleted
                            ? 'bg-emerald-50/20 dark:bg-emerald-950/10 border-emerald-200/80 dark:border-emerald-900/30'
                            : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800'
                        }`}
                      >
                        {/* Day Card Header */}
                        <div
                          onClick={() => setExpandedDay(isExpanded ? null : day.dayNumber)}
                          className="p-4 flex items-center justify-between cursor-pointer select-none"
                        >
                          <div className="flex items-center gap-3 min-w-0 pr-3">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleDay(day.id, day.isCompleted);
                              }}
                              className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                                day.isCompleted
                                  ? 'bg-emerald-600 text-white'
                                  : 'border-2 border-slate-300 dark:border-slate-700 hover:border-emerald-500'
                              }`}
                            >
                              {day.isCompleted && <Check className="w-4 h-4 stroke-[3]" />}
                            </button>

                            <div>
                              <h4
                                className={`text-sm font-bold truncate ${
                                  day.isCompleted
                                    ? 'line-through text-slate-400 dark:text-slate-500'
                                    : 'text-slate-900 dark:text-white'
                                }`}
                              >
                                {day.title}
                              </h4>
                              <p className="text-[11px] text-slate-400 mt-0.5">
                                Topics: {day.topics.join(', ')}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full hidden sm:inline">
                              {day.durationMinutes} min
                            </span>
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-slate-400" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                        </div>

                        {/* Day Card Details Expanded */}
                        {isExpanded && (
                          <div className="px-5 pb-5 pt-1 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs animate-fade-in">
                            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800">
                              <span className="font-bold text-primary-600 dark:text-primary-400 block mb-1">
                                📖 Learning Activity
                              </span>
                              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                                {day.learningActivity}
                              </p>
                            </div>

                            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800">
                              <span className="font-bold text-indigo-600 dark:text-indigo-400 block mb-1">
                                ✍️ Practice Activity
                              </span>
                              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                                {day.practiceActivity}
                              </p>
                            </div>

                            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800">
                              <span className="font-bold text-amber-600 dark:text-amber-400 block mb-1">
                                🔄 Revision Activity
                              </span>
                              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                                {day.revisionActivity}
                              </p>
                            </div>

                            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800">
                              <span className="font-bold text-purple-600 dark:text-purple-400 block mb-1">
                                🎯 Quiz / Review
                              </span>
                              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                                {day.quizReview}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="py-24 text-center text-xs text-slate-400">
                Select a roadmap from the left or create a new one above.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
