import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { ActiveDebateView } from './components/ActiveDebateView';
import { VerdictView } from './components/VerdictView';
import { RecentDebatesView } from './components/RecentDebatesView';
import { ArchitectureModal } from './components/ArchitectureModal';
import { BackendSetupModal } from './components/BackendSetupModal';
import { DebateSession, DebateTurn, JudgeVerdict } from './types/debate';
import { 
  debateService, 
  mockDebateService, 
  AppDebateMode, 
  BackendIntegrationError 
} from './services/debateApi';
import { Scale, PlayCircle, PlusCircle, History, Sparkles } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'active' | 'verdict' | 'recent'>('dashboard');
  const [activeSession, setActiveSession] = useState<DebateSession | null>(null);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isArchitectureOpen, setIsArchitectureOpen] = useState<boolean>(false);
  const [isBackendSetupOpen, setIsBackendSetupOpen] = useState<boolean>(false);
  const [appMode, setAppMode] = useState<AppDebateMode>(() => debateService.getDefaultMode());
  const [backendError, setBackendError] = useState<BackendIntegrationError | null>(null);
  const [isRealBackendLoading, setIsRealBackendLoading] = useState<boolean>(false);
  const [sessionsList, setSessionsList] = useState<DebateSession[]>(() => mockDebateService.getAllSessions());
  const [initialFormValues, setInitialFormValues] = useState<{
    question: string;
    context?: string;
    criteria?: string;
    rounds: number;
    presetId?: string;
  } | null>(null);

  const isBackendConfigured = debateService.isBackendConfigured();
  const backendBaseUrl = debateService.getBackendBaseUrl();

  // Refresh recent sessions list
  const refreshSessions = useCallback(() => {
    setSessionsList(mockDebateService.getAllSessions());
  }, []);

  // Handle starting a new debate
  const handleStartDebate = async (params: {
    question: string;
    context?: string;
    criteria?: string;
    rounds: number;
    presetId?: string;
  }) => {
    setBackendError(null);

    // REAL BACKEND MODE
    if (appMode === 'backend') {
      setIsRealBackendLoading(true);
      try {
        const session = await debateService.startDebate(params, 'backend');
        setActiveSession(session);
        setIsRealBackendLoading(false);
        setCurrentTab(session.status === 'completed' ? 'verdict' : 'active');
        refreshSessions();
      } catch (err: unknown) {
        setIsRealBackendLoading(false);
        // Important: Never convert backend failures into fake agent messages.
        // Surface the real typed error directly in the UI.
        if (err instanceof BackendIntegrationError) {
          setBackendError(err);
        } else {
          setBackendError(new BackendIntegrationError({
            type: 'network_failure',
            message: err instanceof Error ? err.message : 'Unknown backend error occurred.',
          }));
        }
      }
      return;
    }

    // DEMO MODE (Simulated deliberation stream)
    const session = mockDebateService.createSession(params);
    setActiveSession(session);
    setIsPaused(false);
    setCurrentTab('active');
    refreshSessions();

    // Subscribe to simulated debate turns stream
    mockDebateService.subscribeToSession(
      session.id,
      (turn: DebateTurn) => {
        setActiveSession((prev) => {
          if (!prev || prev.id !== session.id) return prev;
          if (prev.transcript.some(t => t.id === turn.id)) return prev;
          return {
            ...prev,
            currentRound: turn.round,
            transcript: [...prev.transcript, turn],
          };
        });
      },
      (verdict: JudgeVerdict) => {
        setActiveSession((prev) => {
          if (!prev || prev.id !== session.id) return prev;
          return {
            ...prev,
            status: 'completed',
            verdict,
          };
        });
        refreshSessions();
      },
      (err: Error) => {
        console.error('Debate stream error:', err);
      }
    );
  };

  // Inspect an existing preset or past debate immediately in Verdict view
  const handleInspectSession = (sessionId: string) => {
    const session = mockDebateService.getSession(sessionId);
    if (session) {
      if (session.status !== 'completed') {
        mockDebateService.fastForwardToVerdict(session.id);
      }
      const updated = mockDebateService.getSession(sessionId) || session;
      setActiveSession(updated);
      setCurrentTab('verdict');
    }
  };

  // Toggle pause on active debate
  const handlePauseToggle = () => {
    if (!activeSession) return;
    const nowPaused = mockDebateService.togglePause(activeSession.id);
    setIsPaused(nowPaused);
    setActiveSession((prev) => prev ? { ...prev, status: nowPaused ? 'paused' : 'debating' } : null);
  };

  // Step one turn forward manually
  const handleStepForward = () => {
    if (!activeSession) return;
    mockDebateService.stepForward(activeSession.id);
    const updated = mockDebateService.getSession(activeSession.id);
    if (updated) {
      setActiveSession({ ...updated });
      refreshSessions();
    }
  };

  // Fast forward directly to judge verdict
  const handleFastForward = () => {
    if (!activeSession) return;
    const completed = mockDebateService.fastForwardToVerdict(activeSession.id);
    if (completed) {
      setActiveSession({ ...completed });
      refreshSessions();
    }
  };

  // Reset all state when starting a fresh debate
  const handleStartNewDebate = () => {
    setInitialFormValues(null);
    setBackendError(null);
    setIsPaused(false);
    setCurrentTab('dashboard');
  };

  // Re-run an existing debate with option to edit parameters
  const handleRerunDebate = (session: DebateSession) => {
    setInitialFormValues({
      question: session.question,
      context: session.backgroundContext,
      criteria: session.decisionCriteria,
      rounds: session.totalRounds,
      presetId: session.id.startsWith('debate-') ? undefined : session.id,
    });
    setBackendError(null);
    setCurrentTab('dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Top Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        hasActiveSession={!!activeSession}
        hasVerdict={!!activeSession?.verdict}
        appMode={appMode}
        isBackendConfigured={isBackendConfigured}
        backendUrl={backendBaseUrl}
        onSelectTab={setCurrentTab}
        onOpenArchitecture={() => setIsArchitectureOpen(true)}
        onOpenBackendSetup={() => setIsBackendSetupOpen(true)}
        onNewDebate={handleStartNewDebate}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentTab === 'dashboard' && (
          <DashboardView
            initialValues={initialFormValues}
            appMode={appMode}
            backendBaseUrl={backendBaseUrl}
            isBackendConfigured={isBackendConfigured}
            backendError={backendError}
            isRealBackendLoading={isRealBackendLoading}
            onStartDebate={handleStartDebate}
            onInspectPreset={handleInspectSession}
            onOpenBackendSetup={() => setIsBackendSetupOpen(true)}
            onSwitchToDemo={() => {
              setAppMode('demo');
              setBackendError(null);
            }}
            onDismissBackendError={() => setBackendError(null)}
          />
        )}

        {currentTab === 'active' && (
          activeSession ? (
            <ActiveDebateView
              session={activeSession}
              onPauseToggle={handlePauseToggle}
              onStepForward={handleStepForward}
              onFastForward={handleFastForward}
              onViewVerdict={() => setCurrentTab('verdict')}
              onStartNewDebate={handleStartNewDebate}
              isPaused={isPaused}
            />
          ) : (
            <div className="max-w-xl mx-auto px-4 py-20 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto mb-4 text-indigo-400">
                <PlayCircle className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">No Active Debate in Progress</h2>
              <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                Launch a live debate to watch Pro, Con, and Moderator agents deliberate your question round-by-round.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={handleStartNewDebate}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Configure New Debate</span>
                </button>
                <button
                  onClick={() => {
                    const presets = mockDebateService.getPresets();
                    if (presets.length > 0) {
                      handleStartDebate({
                        question: presets[0].question,
                        context: presets[0].context,
                        criteria: presets[0].criteria,
                        rounds: presets[0].rounds,
                        presetId: presets[0].id,
                      });
                    }
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span>Launch Sample Debate</span>
                </button>
              </div>
            </div>
          )
        )}

        {currentTab === 'verdict' && (
          activeSession && activeSession.verdict ? (
            <VerdictView
              session={activeSession}
              onStartNewDebate={handleStartNewDebate}
              onBackToDebate={() => setCurrentTab('active')}
              onRerunDebate={handleRerunDebate}
            />
          ) : (
            <div className="max-w-xl mx-auto px-4 py-20 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto mb-4 text-indigo-400">
                <Scale className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">No Verdict Selected</h2>
              <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                Choose a completed debate from the recent archives, or start a new deliberation to see the Judge Agent's synthesis.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => setCurrentTab('recent')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 cursor-pointer"
                >
                  <History className="w-4 h-4" />
                  <span>Browse Recent Verdicts</span>
                </button>
                <button
                  onClick={handleStartNewDebate}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Start New Debate</span>
                </button>
              </div>
            </div>
          )
        )}

        {currentTab === 'recent' && (
          <RecentDebatesView
            sessions={sessionsList}
            onSelectSession={(session) => {
              setActiveSession(session);
              if (session.status === 'completed' && session.verdict) {
                setCurrentTab('verdict');
              } else {
                setCurrentTab('active');
              }
            }}
            onStartNewDebate={handleStartNewDebate}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-200">DebateDesk</span>
            <span>·</span>
            <span className="text-slate-400">Multi-Agent Decision Intelligence</span>
            <span>·</span>
            <button
              onClick={() => setIsBackendSetupOpen(true)}
              className="text-left cursor-pointer"
            >
              {appMode === 'demo' ? (
                <span className="text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/25 text-[11px] font-semibold transition-colors">
                  Demo Mode (Simulated)
                </span>
              ) : (
                <span className="text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/25 text-[11px] font-semibold transition-colors">
                  Real Backend Mode
                </span>
              )}
            </button>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <button
              onClick={() => setIsBackendSetupOpen(true)}
              className="hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded px-1 cursor-pointer"
            >
              Backend Setup Guide
            </button>
            <span className="text-slate-700">·</span>
            <button
              onClick={() => setIsArchitectureOpen(true)}
              className="hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded px-1 cursor-pointer"
            >
              LangChain Architecture
            </button>
            <span className="text-slate-700">·</span>
            <button
              onClick={() => setCurrentTab('recent')}
              className="hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded px-1 cursor-pointer"
            >
              Demo Archive
            </button>
          </div>
        </div>
      </footer>

      {/* Architecture Explainer Modal */}
      <ArchitectureModal
        isOpen={isArchitectureOpen}
        onClose={() => setIsArchitectureOpen(false)}
      />

      {/* Backend Integration & Setup Modal */}
      <BackendSetupModal
        isOpen={isBackendSetupOpen}
        onClose={() => setIsBackendSetupOpen(false)}
        appMode={appMode}
        onToggleMode={(mode) => {
          setAppMode(mode);
          setBackendError(null);
        }}
        backendBaseUrl={backendBaseUrl}
      />

    </div>
  );
}
