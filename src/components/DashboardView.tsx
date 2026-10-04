import React, { useState, useEffect } from 'react';
import { 
  Scale, 
  ArrowRight, 
  ShieldCheck, 
  AlertTriangle, 
  HelpCircle, 
  Gavel, 
  Layers, 
  CheckCircle2, 
  Lightbulb, 
  Sparkles,
  Sliders,
  ChevronRight,
  Loader2,
  Server,
  Settings
} from 'lucide-react';
import { DEMO_PRESETS } from '../data/demoDebates';
import { DebatePreset } from '../types/debate';
import { AppDebateMode } from '../services/debateApi';
import { BackendIntegrationError } from '../services/debateService.types';
import { BackendErrorAlert } from './BackendErrorAlert';

interface DashboardViewProps {
  initialValues?: {
    question: string;
    context?: string;
    criteria?: string;
    rounds: number;
    presetId?: string;
  } | null;
  appMode: AppDebateMode;
  backendBaseUrl: string | null;
  isBackendConfigured: boolean;
  backendError: BackendIntegrationError | null;
  isRealBackendLoading?: boolean;
  onStartDebate: (params: {
    question: string;
    context?: string;
    criteria?: string;
    rounds: number;
    presetId?: string;
  }) => void;
  onInspectPreset: (presetId: string) => void;
  onOpenBackendSetup: () => void;
  onSwitchToDemo?: () => void;
  onDismissBackendError?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  initialValues,
  appMode,
  backendBaseUrl,
  isBackendConfigured,
  backendError,
  isRealBackendLoading = false,
  onStartDebate,
  onInspectPreset,
  onOpenBackendSetup,
  onSwitchToDemo,
  onDismissBackendError,
}) => {
  const [question, setQuestion] = useState(initialValues?.question || '');
  const [context, setContext] = useState(initialValues?.context || '');
  const [criteria, setCriteria] = useState(initialValues?.criteria || '');
  const [rounds, setRounds] = useState<number>(initialValues?.rounds || 2);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(initialValues?.presetId || null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isLocalSubmitting, setIsLocalSubmitting] = useState<boolean>(false);

  const isSubmitting = isLocalSubmitting || isRealBackendLoading;

  // Sync when initialValues change (e.g. from Re-run button)
  useEffect(() => {
    if (initialValues) {
      setQuestion(initialValues.question || '');
      setContext(initialValues.context || '');
      setCriteria(initialValues.criteria || '');
      setRounds(initialValues.rounds || 2);
      setSelectedPresetId(initialValues.presetId || null);
      setValidationError(null);
    }
  }, [initialValues]);

  const handleSelectPreset = (preset: DebatePreset) => {
    setSelectedPresetId(preset.id);
    setQuestion(preset.question);
    setContext(preset.context);
    setCriteria(preset.criteria);
    setRounds(preset.rounds);
    setValidationError(null);
  };

  const handleClearForm = () => {
    setSelectedPresetId(null);
    setQuestion('');
    setContext('');
    setCriteria('');
    setRounds(2);
    setValidationError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const trimmedQuestion = question.trim();
    if (!trimmedQuestion) {
      setValidationError('Please enter a decision question to initiate the debate.');
      return;
    }
    if (trimmedQuestion.length < 8) {
      setValidationError('Please enter a sufficiently specific decision question (at least 8 characters).');
      return;
    }

    setValidationError(null);

    if (appMode === 'backend') {
      onStartDebate({
        question: trimmedQuestion,
        context: context.trim() || undefined,
        criteria: criteria.trim() || undefined,
        rounds,
        presetId: selectedPresetId || undefined,
      });
      return;
    }

    setIsLocalSubmitting(true);
    // Provide a brief loading feedback before triggering the debate view in demo mode
    setTimeout(() => {
      onStartDebate({
        question: trimmedQuestion,
        context: context.trim() || undefined,
        criteria: criteria.trim() || undefined,
        rounds,
        presetId: selectedPresetId || undefined,
      });
      setIsLocalSubmitting(false);
    }, 400);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      
      {/* Hero Welcome Heading */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-medium text-indigo-300 mb-4 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span>Multi-Agent Adversarial Deliberation</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4 text-balance">
          Stress-test critical decisions with autonomous AI debaters
        </h1>
        <p className="text-base sm:text-lg text-slate-300 leading-relaxed text-balance max-w-2xl mx-auto">
          Four specialized agents debate your proposal across structured rounds: 
          advancing arguments, exposing counter-risks, interrogating assumptions, and delivering an objective verdict.
        </p>
      </div>

      {/* Backend Error Alert if present */}
      {backendError && (
        <div className="max-w-4xl mx-auto mb-6">
          <BackendErrorAlert
            error={backendError}
            onRetry={() => {
              if (question.trim()) {
                onStartDebate({
                  question: question.trim(),
                  context: context.trim() || undefined,
                  criteria: criteria.trim() || undefined,
                  rounds,
                  presetId: selectedPresetId || undefined,
                });
              }
            }}
            onSwitchToDemo={onSwitchToDemo}
            onOpenSetupGuide={onOpenBackendSetup}
            onDismiss={onDismissBackendError || (() => {})}
          />
        </div>
      )}

      {/* Main Layout: 2 Columns on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Debate Form (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-xl p-6 sm:p-8 shadow-xl backdrop-blur-sm">
          
          {/* Execution Mode Banner */}
          <div className={`p-3 rounded-lg border flex flex-wrap items-center justify-between gap-2.5 mb-6 text-xs ${
            appMode === 'demo'
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
          }`}>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full shrink-0 ${appMode === 'demo' ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'}`} />
              <span className="font-semibold text-white">
                {appMode === 'demo' ? 'Execution Mode: Demo Mode (Simulated Deliberation)' : 'Execution Mode: Real Python Backend'}
              </span>
              <span className="hidden sm:inline text-slate-400">·</span>
              <span className="text-slate-300">
                {appMode === 'demo' 
                  ? (isBackendConfigured ? `Backend configured at ${backendBaseUrl}` : 'VITE_API_BASE_URL unset') 
                  : `Target: ${backendBaseUrl || 'unspecified'}`}
              </span>
            </div>
            <button
              type="button"
              onClick={onOpenBackendSetup}
              className="text-indigo-400 hover:text-indigo-300 font-medium underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-400 rounded px-1 cursor-pointer"
            >
              Setup Guide
            </button>
          </div>

          <div className="flex items-center justify-between pb-5 border-b border-slate-800/80 mb-6">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Configure New Debate</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {appMode === 'backend' ? 'Submits decision parameters to your Python backend' : 'Define your question and optional decision parameters'}
              </p>
            </div>
            {selectedPresetId && (
              <button
                type="button"
                onClick={handleClearForm}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded px-1.5 py-0.5"
              >
                Reset to Blank
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            
            {/* Required Decision Question */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="decision-question-input" className="block text-sm font-semibold text-slate-200">
                  Decision Question <span className="text-indigo-400" aria-hidden="true">*</span>
                </label>
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <span className="font-mono tabular-nums">{question.length} chars</span>
                  <span className="text-slate-600">·</span>
                  <span className="text-slate-400 font-medium">Required</span>
                </div>
              </div>
              <textarea
                id="decision-question-input"
                name="question"
                rows={3}
                value={question}
                onChange={(e) => {
                  setQuestion(e.target.value);
                  if (validationError) setValidationError(null);
                }}
                aria-required="true"
                aria-invalid={!!validationError}
                aria-describedby={validationError ? "decision-question-error" : undefined}
                placeholder="e.g., Should we rewrite our latency-critical ingestion pipeline from Python to Rust?"
                className={`w-full px-4 py-3 rounded-lg bg-slate-950/90 border text-sm text-slate-100 placeholder-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 transition-all ${
                  validationError ? 'border-rose-500/80 focus-visible:ring-rose-500' : 'border-slate-800'
                }`}
              />
              
              {/* Quick Preset Starters */}
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-xs text-slate-300">
                <span className="text-[11px] text-slate-400 font-medium">Quick fill:</span>
                {DEMO_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectPreset(p)}
                    className="px-2.5 py-1 rounded-md text-[11px] bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors border border-slate-700/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 cursor-pointer font-medium"
                  >
                    {p.title.split(' ')[0]}...
                  </button>
                ))}
              </div>

              {validationError && (
                <p id="decision-question-error" role="alert" className="mt-2.5 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2 font-medium">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" aria-hidden="true" />
                  <span>{validationError}</span>
                </p>
              )}
            </div>

            {/* Optional Background Context */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="background-context-input" className="block text-sm font-semibold text-slate-200">
                  Background Context <span className="text-slate-400 text-xs font-normal">(Optional)</span>
                </label>
                <span className="text-[11px] text-slate-400 font-mono">Constraints & Team State</span>
              </div>
              <textarea
                id="background-context-input"
                name="context"
                rows={2}
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="e.g., Current team has 2 Rust engineers and 12 Python engineers. We face p99 latency spikes of 400ms during peak loads."
                className="w-full px-4 py-2.5 rounded-lg bg-slate-950/90 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:border-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 transition-all"
              />
            </div>

            {/* Optional Decision Criteria */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="decision-criteria-input" className="block text-sm font-semibold text-slate-200">
                  Evaluation Criteria <span className="text-slate-400 text-xs font-normal">(Optional)</span>
                </label>
                <span className="text-[11px] text-slate-400 font-mono">Weighted Factors</span>
              </div>
              <input
                id="decision-criteria-input"
                name="criteria"
                type="text"
                value={criteria}
                onChange={(e) => setCriteria(e.target.value)}
                placeholder="e.g., Delivery velocity over 6 months, infrastructure cost, on-call bus factor"
                className="w-full px-4 py-2.5 rounded-lg bg-slate-950/90 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:border-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 transition-all"
              />
            </div>

              {/* Round Selector (1 to 4) */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <label id="rounds-group-label" className="block text-sm font-semibold text-slate-200">
                  Debate Depth & Rounds
                </label>
                <span className="text-xs font-mono tabular-nums text-indigo-300 bg-indigo-950/80 px-2 py-0.5 rounded-md border border-indigo-800/60 font-medium">
                  {rounds} {rounds === 1 ? 'Round' : 'Rounds'} · {rounds * 4} Turns Total
                </span>
              </div>
              
              <div 
                className="grid grid-cols-4 gap-2.5" 
                role="radiogroup" 
                aria-labelledby="rounds-group-label"
              >
                {[1, 2, 3, 4].map((num) => {
                  const isSelected = rounds === num;
                  const label = num === 1 ? 'Rapid' : num === 2 ? 'Standard' : num === 3 ? 'Stress-Test' : 'Exhaustive';
                  return (
                    <button
                      key={num}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      tabIndex={isSelected ? 0 : -1}
                      onClick={() => setRounds(num)}
                      onKeyDown={(e) => {
                        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                          e.preventDefault();
                          setRounds(num < 4 ? num + 1 : 1);
                        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                          e.preventDefault();
                          setRounds(num > 1 ? num - 1 : 4);
                        }
                      }}
                      className={`py-3 px-2 rounded-xl border text-center transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
                        isSelected
                          ? 'bg-indigo-600/25 border-indigo-500 text-white shadow-md shadow-indigo-500/20 ring-1 ring-indigo-400'
                          : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                      }`}
                    >
                      <div className="text-base font-bold font-mono tabular-nums">{num}</div>
                      <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-300 mt-0.5">
                        {label}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-2.5 text-xs text-slate-300 bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 leading-relaxed">
                {rounds === 1 && '1 Round: Rapid first-principles opening thesis, adversarial cross-examination, and immediate judge arbitration.'}
                {rounds === 2 && '2 Rounds: Opening positions followed by rigorous rebuttal, blind spot challenge, and round synthesis.'}
                {rounds === 3 && '3 Rounds: Deep interrogation of edge cases, operational failure modes, and staged rollback gates.'}
                {rounds === 4 && '4 Rounds: Exhaustive multi-stage audit covering reversibility, organizational bus factors, and second-order dependencies.'}
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div className="text-xs flex items-center gap-1.5">
                {appMode === 'backend' ? (
                  <>
                    <Server className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-slate-300 font-medium">
                      Python Backend Mode · <code className="text-indigo-300 font-mono text-[11px]">{backendBaseUrl || 'VITE_API_BASE_URL'}</code>
                    </span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-400" aria-hidden="true" />
                    <span className="text-slate-300">Simulated 4-agent runtime ready (Demo Mode)</span>
                  </>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white font-semibold text-sm shadow-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
                  isSubmitting 
                    ? 'bg-indigo-800 cursor-not-allowed opacity-80' 
                    : 'bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 shadow-indigo-600/25 cursor-pointer hover:translate-y-[-1px]'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-300" />
                    <span>
                      {appMode === 'backend' ? 'Connecting to Python Backend...' : 'Initializing Agents...'}
                    </span>
                  </>
                ) : (
                  <>
                    <span>
                      {appMode === 'backend' ? 'Submit to Backend' : 'Start Debate'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

          </form>
        </div>

        {/* Right Column: Presets & Agent Roster (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Example Questions / Presets */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
                <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Curated Decision Scenarios</span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">Click to pre-fill</span>
            </div>

            <div className="space-y-3">
              {DEMO_PRESETS.map((preset) => {
                const isSelected = selectedPresetId === preset.id;
                return (
                  <div
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-indigo-950/50 border-indigo-500/80 ring-1 ring-indigo-500/50 shadow-md shadow-indigo-500/10'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-950'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-semibold text-indigo-300">{preset.title}</span>
                      <span className="text-[10px] text-slate-300 uppercase tracking-wider font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 font-medium">{preset.category}</span>
                    </div>
                    <p className="text-xs text-slate-200 line-clamp-2 leading-relaxed">
                      {preset.question}
                    </p>
                    <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                      <span className="text-slate-300">
                        {preset.rounds} Rounds · Prior: <strong className="text-white font-semibold">{preset.expectedVerdict}</strong> ({preset.confidence}%)
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onStartDebate({
                              question: preset.question,
                              context: preset.context,
                              criteria: preset.criteria,
                              rounds: preset.rounds,
                              presetId: preset.id,
                            });
                          }}
                          className="px-2.5 py-1 rounded-md bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 hover:text-white border border-indigo-500/40 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 cursor-pointer"
                        >
                          Run Live
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onInspectPreset(preset.id);
                          }}
                          className="text-slate-300 hover:text-white hover:underline flex items-center gap-0.5 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 rounded px-1.5 py-0.5 cursor-pointer"
                        >
                          <span>Verdict</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Agent Roster Explanation */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg">
            <h3 className="text-sm font-bold text-slate-100 mb-3.5 flex items-center gap-2">
              <Scale className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>The 4 Autonomous Agents</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* Pro Agent */}
              <div className="p-3.5 rounded-xl bg-slate-950/90 border border-emerald-500/30 hover:border-emerald-500/50 transition-colors">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Pro Agent</span>
                  </div>
                  <span className="text-[10px] uppercase font-mono font-semibold text-emerald-300 bg-emerald-950/80 border border-emerald-800/60 px-1.5 py-0.5 rounded">Affirmative</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Builds the affirmative case: strategic upside, operational return on investment, and capability growth.
                </p>
              </div>

              {/* Con Agent */}
              <div className="p-3.5 rounded-xl bg-slate-950/90 border border-rose-500/30 hover:border-rose-500/50 transition-colors">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>Con Agent</span>
                  </div>
                  <span className="text-[10px] uppercase font-mono font-semibold text-rose-300 bg-rose-950/80 border border-rose-800/60 px-1.5 py-0.5 rounded">Adversarial</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Uncovers blind spots, hidden opportunity costs, reversibility hurdles, and operational failure modes.
                </p>
              </div>

              {/* Moderator Agent */}
              <div className="p-3.5 rounded-xl bg-slate-950/90 border border-cyan-500/30 hover:border-cyan-500/50 transition-colors">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400">
                    <HelpCircle className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Moderator</span>
                  </div>
                  <span className="text-[10px] uppercase font-mono font-semibold text-cyan-300 bg-cyan-950/80 border border-cyan-800/60 px-1.5 py-0.5 rounded">Inquisitor</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Frames evidence-focused questions, enforces topical discipline, and summarizes each structured round.
                </p>
              </div>

              {/* Judge Agent */}
              <div className="p-3.5 rounded-xl bg-slate-950/90 border border-indigo-500/30 hover:border-indigo-500/50 transition-colors">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300">
                    <Gavel className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Judge Agent</span>
                  </div>
                  <span className="text-[10px] uppercase font-mono font-semibold text-indigo-200 bg-indigo-950/80 border border-indigo-800/60 px-1.5 py-0.5 rounded">Arbitration</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Reviews the full debate record to issue an objective Yes, No, or Conditional verdict with deciding factors.
                </p>
              </div>

            </div>

            <div className="mt-3.5 text-xs text-slate-400 border-t border-slate-800/80 pt-2.5 flex items-center justify-between">
              <span>Autonomous prompt chaining</span>
              <span className="font-mono text-slate-300 font-medium">Zero Fabricated Citations</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
