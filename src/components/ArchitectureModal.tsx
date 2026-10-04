import React from 'react';
import { 
  X, 
  Cpu, 
  ShieldCheck, 
  AlertTriangle, 
  HelpCircle, 
  Gavel, 
  ArrowRight, 
  Layers, 
  Terminal, 
  ExternalLink,
  Sparkles,
  CheckCircle2,
  Download
} from 'lucide-react';

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="modal-arch-title">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 my-8 text-left">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close architecture modal"
          className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h2 id="modal-arch-title" className="text-xl font-bold text-white tracking-tight">
              DebateDesk Multi-Agent Architecture
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              LangChain Prompt-Chaining Pipeline with Groq LPU Accelerated Inference
            </p>
          </div>
        </div>

        {/* Current State / Demo Mode Callout */}
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 mb-6 text-xs text-amber-200 leading-relaxed">
          <div className="font-semibold text-amber-300 mb-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>Frontend & Backend Separation (Hackathon Milestone)</span>
          </div>
          This frontend is decoupled from the Python environment. While our team finalizes the 
          <code className="mx-1 px-1.5 py-0.5 rounded bg-slate-950 text-amber-300 font-mono">Agent.py</code> LangChain prototype with Groq API keys, this frontend runs in 
          <strong> Demo Mode</strong> using simulated multi-turn deliberation data. No live Groq credentials or backend dependencies are bundled in this build.
        </div>

        {/* 4-Agent Workflow Flowchart */}
        <div className="space-y-4 mb-8">
          <h3 className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-3">
            Agent Roles & Execution Flow
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* Moderator */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-cyan-500/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-cyan-300 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-cyan-400" />
                  1. Moderator Agent
                </span>
                <span className="text-[10px] uppercase font-mono text-cyan-400/80">Inquisitor</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Frames rigorous, evidence-focused questions for each round, enforces topic discipline, and delivers round synthesis before the next phase.
              </p>
            </div>

            {/* Pro Agent */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-emerald-500/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  2. Pro Agent
                </span>
                <span className="text-[10px] uppercase font-mono text-emerald-400/80">Affirmative</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Argues in favor of adoption, establishing strategic upside, long-term ROI, organizational capacity growth, and competitive advantages.
              </p>
            </div>

            {/* Con Agent */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-rose-500/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-rose-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  3. Con Agent
                </span>
                <span className="text-[10px] uppercase font-mono text-rose-400/80">Adversarial</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Interrogates assumptions, calculates hidden opportunity costs, surfaces unhandled edge cases, and challenges Pro's delivery estimates.
              </p>
            </div>

            {/* Judge Agent */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-indigo-500/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
                  <Gavel className="w-4 h-4 text-indigo-400" />
                  4. Judge Agent
                </span>
                <span className="text-[10px] uppercase font-mono text-indigo-400/80">Arbitration</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Reviews the complete transcript to yield an objective verdict (Yes, No, or Conditional), confidence score, deciding factors, and actionable conditions.
              </p>
            </div>

          </div>
        </div>

        {/* Backend Contract Specification */}
        <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 font-mono text-xs text-slate-300 mb-6">
          <div className="flex items-center justify-between text-slate-400 pb-2 mb-2 border-b border-slate-800 text-[11px]">
            <span className="flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-indigo-400" />
              <span>Target Backend Interface (src/services/realBackendDebateService.ts)</span>
            </span>
            <span className="text-indigo-400">VITE_API_BASE_URL</span>
          </div>
          <pre className="text-[11px] leading-relaxed overflow-x-auto text-slate-300 font-mono">
{`// 1. Configure VITE_API_BASE_URL (e.g. "http://localhost:8000")
// 2. Set ACTUAL_BACKEND_ENDPOINT in realBackendDebateService.ts once route is supplied
// 3. Request payload interface (src/services/debateService.types.ts):
{
  "question": string,
  "context"?: string,
  "criteria"?: string,
  "rounds": number // 1 to 4
}
// Expected response: DebateSession with transcript and final JudgeVerdict`}
          </pre>
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <a
            href="/debatedesk-source.zip"
            download="debatedesk-source.zip"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span>Download Project ZIP Backup</span>
          </a>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Close Architecture View
          </button>
        </div>

      </div>
    </div>
  );
};
