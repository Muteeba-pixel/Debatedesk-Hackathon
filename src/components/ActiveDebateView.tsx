import React, { useEffect, useRef, useState } from 'react';
import { 
  Play, 
  Pause, 
  FastForward, 
  SkipForward, 
  ShieldCheck, 
  AlertTriangle, 
  HelpCircle, 
  FileText, 
  Gavel, 
  CheckCircle2, 
  Clock, 
  Scale, 
  Layers,
  ArrowRight,
  Sparkles,
  Info
} from 'lucide-react';
import { DebateSession, DebateTurn, JudgeVerdict } from '../types/debate';
import { ToolCallDisplay } from './ToolCallDisplay';

interface ActiveDebateViewProps {
  session: DebateSession;
  onPauseToggle: () => void;
  onStepForward: () => void;
  onFastForward: () => void;
  onViewVerdict: () => void;
  onStartNewDebate?: () => void;
  isPaused: boolean;
}

export const ActiveDebateView: React.FC<ActiveDebateViewProps> = ({
  session,
  onPauseToggle,
  onStepForward,
  onFastForward,
  onViewVerdict,
  onStartNewDebate,
  isPaused,
}) => {
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // Auto-scroll when new turns arrive
  useEffect(() => {
    if (autoScroll && transcriptEndRef.current) {
      transcriptEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [session.transcript.length, autoScroll]);

  // Determine current active speaker
  const latestTurn = session.transcript[session.transcript.length - 1];
  const isCompleted = session.status === 'completed';

  // Calculate estimated progress
  const totalEstimatedTurns = session.totalRounds * 4;
  const currentProgressPercent = Math.min(
    100, 
    Math.round((session.transcript.length / totalEstimatedTurns) * 100)
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      
      {/* Top Banner: Decision Question & Context */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-6 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Live Debate
            </span>
            <span className="text-xs text-slate-400">
              Round {session.currentRound} of {session.totalRounds}
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-slate-400 font-mono tabular-nums">
              {session.transcript.length} turns recorded
            </span>
          </div>

          {/* Status Indicator */}
          <div className="flex items-center gap-2">
            {isCompleted ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Debate Complete · Judge Evaluated
              </span>
            ) : isPaused ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                <Pause className="w-3 h-3" />
                Paused
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
                Deliberating Live
              </span>
            )}
          </div>
        </div>

        {/* Question Title */}
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
          {session.question}
        </h1>

        {/* Background / Criteria Metadata */}
        {(session.backgroundContext || session.decisionCriteria) && (
          <div className="mt-3 pt-3 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {session.backgroundContext && (
              <div>
                <span className="text-slate-400 font-medium block mb-0.5">Context & Constraints:</span>
                <p className="text-slate-300 line-clamp-2">{session.backgroundContext}</p>
              </div>
            )}
            {session.decisionCriteria && (
              <div>
                <span className="text-slate-400 font-medium block mb-0.5">Deciding Criteria:</span>
                <p className="text-slate-300 line-clamp-2">{session.decisionCriteria}</p>
              </div>
            )}
          </div>
        )}

        {/* Progress Bar & Stage Indicator */}
        <div className="mt-4 pt-3 border-t border-slate-800/60">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span>Overall Progress</span>
            <span className="font-mono tabular-nums">{currentProgressPercent}% Complete</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 transition-all duration-500 ease-out"
              style={{ width: `${currentProgressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Control Toolbar */}
      <div className="sticky top-20 z-20 mb-6 bg-slate-900/95 border border-slate-800 rounded-xl p-3 sm:p-3.5 shadow-lg backdrop-blur-md flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {!isCompleted ? (
            <>
              <button
                onClick={onPauseToggle}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 cursor-pointer"
                title={isPaused ? "Resume automated streaming" : "Pause live deliberation"}
                aria-label={isPaused ? "Resume automated deliberation" : "Pause live deliberation"}
              >
                {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5 text-amber-400" />}
                <span>{isPaused ? 'Resume' : 'Pause'}</span>
              </button>

              <button
                onClick={onStepForward}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 cursor-pointer"
                title="Step forward one turn"
                aria-label="Step forward one turn"
              >
                <SkipForward className="w-3.5 h-3.5 text-indigo-400" />
                <span>Next Turn</span>
              </button>

              <button
                onClick={onFastForward}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/25 hover:bg-indigo-600/40 text-indigo-200 text-xs font-semibold border border-indigo-500/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 cursor-pointer"
                title="Fast forward all turns to Judge verdict"
                aria-label="Fast-forward all remaining turns directly to verdict"
              >
                <FastForward className="w-3.5 h-3.5" />
                <span>Fast-Forward to Verdict</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" aria-hidden="true" />
              <span className="text-xs text-slate-300 font-medium">All structured debate rounds completed.</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-indigo-500 focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-950"
            />
            <span>Auto-scroll</span>
          </label>

          {isCompleted && (
            <button
              onClick={onViewVerdict}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 cursor-pointer"
            >
              <span>View Judge Verdict</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Chronological Transcript Stream */}
      <div className="space-y-5">
        
        {session.transcript.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <Clock className="w-6 h-6 animate-spin text-indigo-400" />
            </div>
            <h3 className="text-base font-semibold text-white mb-1">Debate Initializing</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              The Moderator is framing the opening inquiry for Round 1. Arguments will begin shortly...
            </p>
          </div>
        ) : (
          session.transcript.map((turn, index) => {
            const isFirstInRound = index === 0 || session.transcript[index - 1].round !== turn.round;
            return (
              <React.Fragment key={turn.id || index}>
                {isFirstInRound && (
                  <div className="py-2.5 my-2 flex items-center gap-3">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-800 to-slate-800" />
                    <div className="flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-900 border border-slate-700/80 shadow-sm text-xs font-semibold text-indigo-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                      <span>Round {turn.round} of {session.totalRounds}</span>
                    </div>
                    <div className="h-px flex-1 bg-gradient-to-r from-slate-800 via-slate-800 to-transparent" />
                  </div>
                )}
                <TranscriptTurnCard turn={turn} isLatest={index === session.transcript.length - 1} />
              </React.Fragment>
            );
          })
        )}

        {/* Live typing / thinking indicator if debate is still active */}
        {!isCompleted && !isPaused && (
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-4 flex items-center gap-3 animate-pulse">
            <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
              <Sparkles className="w-4 h-4 text-indigo-400 animate-spin" />
            </div>
            <div className="flex-1 text-xs text-slate-400">
              <span>Agent formulating counter-argument in Round {session.currentRound}...</span>
            </div>
          </div>
        )}

        {/* Completion Banner at bottom */}
        {isCompleted && (
          <div className="bg-gradient-to-r from-indigo-950/40 via-slate-900 to-indigo-950/40 border border-indigo-500/30 rounded-xl p-6 text-center shadow-xl">
            <div className="w-10 h-10 rounded-full bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center mx-auto mb-2 text-indigo-300">
              <Gavel className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Judge Deliberation Complete</h3>
            <p className="text-xs text-slate-300 max-w-md mx-auto mb-4">
              All structured rounds have concluded. The Judge has synthesized the deciding factors, critical risks, and issued a binding verdict.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={onViewVerdict}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
              >
                <span>Inspect Complete Verdict & Analysis</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              {onStartNewDebate && (
                <button
                  onClick={onStartNewDebate}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium border border-slate-700 transition-colors cursor-pointer"
                >
                  <span>Start New Debate</span>
                </button>
              )}
            </div>
          </div>
        )}

        <div ref={transcriptEndRef} />
      </div>

    </div>
  );
};

/**
 * Visually distinct turn card rendering for:
 * 1. Pro Agent
 * 2. Con Agent
 * 3. Moderator Question (distinct inquiry style)
 * 4. Moderator Round Summary (distinct synthesis style)
 */
interface TranscriptTurnCardProps {
  turn: DebateTurn;
  isLatest: boolean;
}

const TranscriptTurnCard: React.FC<TranscriptTurnCardProps> = ({ turn, isLatest }) => {
  const { agentRole, kind, title, content, keyPoints, timestamp } = turn;

  // 1. Moderator Question: Distinct inquisitorial inquiry separated from arguments
  if (kind === 'moderator_question') {
    return (
      <div className="bg-slate-900/95 border-l-4 border-l-cyan-400 border-t border-r border-b border-slate-800 rounded-xl p-5 sm:p-6 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs mb-3 pb-2.5 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-semibold shrink-0">
              <HelpCircle className="w-4 h-4 text-cyan-400" />
            </div>
            <span className="font-bold text-cyan-300 tracking-tight">Moderator Inquiry</span>
            <span className="text-slate-600">·</span>
            <span className="text-[11px] text-slate-400 font-mono">{timestamp}</span>
          </div>
          <span className="text-[10px] uppercase font-mono tracking-wider text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/60 font-semibold">
            Directive to Both Agents
          </span>
        </div>

        <h3 className="text-base font-bold text-white mb-2.5 leading-snug">{title}</h3>
        <div className="bg-slate-950/80 rounded-lg p-4 border border-cyan-900/50 text-sm sm:text-base text-cyan-100 leading-relaxed italic">
          "{content}"
        </div>
        <ToolCallDisplay toolCall={turn.toolCall} toolCalls={turn.toolCalls} />
      </div>
    );
  }

  // 2. Moderator Round Summary: Distinct synthesis card separated from arguments
  if (kind === 'round_summary') {
    return (
      <div className="bg-slate-900/95 border-l-4 border-l-indigo-400 border-t border-r border-b border-slate-800 rounded-xl p-5 sm:p-6 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs mb-3 pb-2.5 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-semibold shrink-0">
              <FileText className="w-4 h-4 text-indigo-400" />
            </div>
            <span className="font-bold text-indigo-300 tracking-tight">Moderator Round Synthesis</span>
            <span className="text-slate-600">·</span>
            <span className="text-[11px] text-slate-400 font-mono">{timestamp}</span>
          </div>
          <span className="text-[10px] uppercase font-mono tracking-wider text-indigo-300 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800/60 font-semibold">
            Round Synthesis
          </span>
        </div>

        <h3 className="text-base font-bold text-slate-100 mb-2 leading-snug">{title}</h3>
        <p className="text-sm text-slate-200 leading-relaxed mb-3">
          {content}
        </p>

        <ToolCallDisplay toolCall={turn.toolCall} toolCalls={turn.toolCalls} />

        <div className="pt-2.5 text-[11px] font-mono text-slate-400 flex items-center justify-between border-t border-slate-800/80">
          <span className="text-slate-300">Round {turn.round} Deliberation Concluded</span>
          <span className="text-indigo-300 font-medium">Record Updated</span>
        </div>
      </div>
    );
  }

  // 3. Pro Agent Argument
  if (agentRole === 'pro') {
    return (
      <div className="bg-slate-900/90 border-l-4 border-l-emerald-500 border-t border-r border-b border-slate-800 rounded-xl p-5 sm:p-6 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs mb-3 pb-2.5 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-semibold shrink-0">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="font-bold text-emerald-400">Pro Agent</span>
            <span className="text-slate-600">·</span>
            <span className="text-[11px] text-slate-400 font-mono">{timestamp}</span>
          </div>
          <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60 font-semibold">
            Affirmative Position
          </span>
        </div>

        <h3 className="text-base font-bold text-white mb-2 leading-snug">{title}</h3>
        <p className="text-sm text-slate-200 leading-relaxed mb-4">
          {content}
        </p>

        {keyPoints && keyPoints.length > 0 && (
          <div className="bg-slate-950/80 rounded-lg p-3.5 border border-slate-800 space-y-2">
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block font-mono">
              Key Strategic Theses:
            </span>
            {keyPoints.map((point, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" aria-hidden="true" />
                <span>{point}</span>
              </div>
            ))}
          </div>
        )}

        <ToolCallDisplay toolCall={turn.toolCall} toolCalls={turn.toolCalls} />
      </div>
    );
  }

  // 4. Con Agent Argument
  return (
    <div className="bg-slate-900/90 border-l-4 border-l-rose-500 border-t border-r border-b border-slate-800 rounded-xl p-5 sm:p-6 shadow-md">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs mb-3 pb-2.5 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-rose-500/20 text-rose-400 flex items-center justify-center font-semibold shrink-0">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <span className="font-bold text-rose-400">Con Agent</span>
          <span className="text-slate-600">·</span>
          <span className="text-[11px] text-slate-400 font-mono">{timestamp}</span>
        </div>
        <span className="text-[10px] uppercase font-mono tracking-wider text-rose-300 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-800/60 font-semibold">
          Adversarial Challenge
        </span>
      </div>

      <h3 className="text-base font-bold text-white mb-2 leading-snug">{title}</h3>
      <p className="text-sm text-slate-200 leading-relaxed mb-4">
        {content}
      </p>

      {keyPoints && keyPoints.length > 0 && (
        <div className="bg-slate-950/80 rounded-lg p-3.5 border border-slate-800 space-y-2">
          <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider block font-mono">
            Vulnerabilities & Blind Spots Identified:
          </span>
          {keyPoints.map((point, idx) => (
            <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200 leading-relaxed">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-2 shrink-0" aria-hidden="true" />
              <span>{point}</span>
            </div>
          ))}
        </div>
      )}

      <ToolCallDisplay toolCall={turn.toolCall} toolCalls={turn.toolCalls} />
    </div>
  );
};

