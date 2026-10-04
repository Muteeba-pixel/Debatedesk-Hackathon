import React from 'react';
import { 
  X, 
  Server, 
  Terminal, 
  CheckCircle2, 
  AlertTriangle, 
  Copy, 
  Check, 
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Download
} from 'lucide-react';
import { AppDebateMode } from '../services/debateApi';
import { ACTUAL_BACKEND_ENDPOINT } from '../services/realBackendDebateService';

interface BackendSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  appMode: AppDebateMode;
  onToggleMode: (mode: AppDebateMode) => void;
  backendBaseUrl: string | null;
}

export const BackendSetupModal: React.FC<BackendSetupModalProps> = ({
  isOpen,
  onClose,
  appMode,
  onToggleMode,
  backendBaseUrl,
}) => {
  const [copiedEnv, setCopiedEnv] = React.useState(false);

  if (!isOpen) return null;

  const isConfigured = !!backendBaseUrl;

  const handleCopyEnv = () => {
    const text = 'VITE_API_BASE_URL="http://localhost:8000"';
    navigator.clipboard.writeText(text).then(() => {
      setCopiedEnv(true);
      setTimeout(() => setCopiedEnv(false), 2000);
    });
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="backend-setup-title"
    >
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 my-8 text-left">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close setup modal"
          className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h2 id="backend-setup-title" className="text-xl font-bold text-white tracking-tight">
              Backend Integration & Setup Guide
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Connect the DebateDesk frontend to your team's Python Agent.py service
            </p>
          </div>
        </div>

        {/* Current Connection Status Box */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-300">Environment Status:</span>
              {isConfigured ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>VITE_API_BASE_URL Configured</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>VITE_API_BASE_URL Unset · Running in DEMO MODE</span>
                </span>
              )}
            </div>

            {/* Mode Switcher */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 font-medium">Active Mode:</span>
              <div className="flex items-center p-0.5 bg-slate-900 border border-slate-700/80 rounded-lg">
                <button
                  type="button"
                  onClick={() => onToggleMode('demo')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                    appMode === 'demo'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Demo Mode
                </button>
                <button
                  type="button"
                  onClick={() => onToggleMode('backend')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                    appMode === 'backend'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Real Backend Mode
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block mb-0.5">Base URL (from VITE_API_BASE_URL):</span>
              <code className="text-slate-200 font-mono bg-slate-900 px-2 py-1 rounded border border-slate-800 block truncate">
                {backendBaseUrl || '(Not set — using high-fidelity demo simulation)'}
              </code>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Endpoint Path (Agent.py route):</span>
              <code className="text-slate-200 font-mono bg-slate-900 px-2 py-1 rounded border border-slate-800 block truncate">
                {ACTUAL_BACKEND_ENDPOINT ? ACTUAL_BACKEND_ENDPOINT : '(Awaiting route specification from Python team)'}
              </code>
            </div>
          </div>
        </div>

        {/* Security & Key Separation Notice */}
        <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 mb-6 text-xs text-indigo-200 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="text-indigo-100 font-semibold block mb-0.5">
              Strict Security Isolation: No Groq Keys on Frontend
            </strong>
            The <code className="bg-slate-950 px-1 py-0.5 rounded text-amber-300 font-mono">GROQ_API_KEY</code> must strictly reside in your Python backend environment (<code className="bg-slate-950 px-1 py-0.5 rounded text-amber-300 font-mono">Agent.py</code>). This client never stores, transmits, or handles Groq credentials.
          </div>
        </div>

        {/* Step-by-Step Instructions */}
        <div className="space-y-4 mb-6">
          <h3 className="text-xs uppercase tracking-wider font-bold text-slate-300">
            Setup Instructions When Backend is Ready
          </h3>

          <div className="space-y-3">
            
            {/* Step 1 */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
              <div className="font-semibold text-slate-200 mb-1 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-300 font-bold flex items-center justify-center text-[11px]">1</span>
                <span>Configure Environment Variable</span>
              </div>
              <p className="text-slate-400 mb-2 leading-relaxed">
                Add <code className="text-slate-200 font-mono">VITE_API_BASE_URL</code> to your local <code className="text-slate-200 font-mono">.env</code> file pointing to your Python server:
              </p>
              <div className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800 font-mono text-[11px] text-slate-300">
                <span>VITE_API_BASE_URL="http://localhost:8000"</span>
                <button
                  type="button"
                  onClick={handleCopyEnv}
                  className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-medium transition-colors cursor-pointer"
                >
                  {copiedEnv ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
                  <span>{copiedEnv ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
              <div className="font-semibold text-slate-200 mb-1 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-300 font-bold flex items-center justify-center text-[11px]">2</span>
                <span>Provide Backend Endpoint in Frontend Service</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Open <code className="text-slate-200 font-mono">src/services/realBackendDebateService.ts</code> and assign the route provided by your team (e.g. <code className="text-slate-200 font-mono">ACTUAL_BACKEND_ENDPOINT = '/api/debate'</code>). Until configured, the app will not invent an endpoint and will report that endpoint integration is pending.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
              <div className="font-semibold text-slate-200 mb-1 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-300 font-bold flex items-center justify-center text-[11px]">3</span>
                <span>Transparent Error Handling</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                When in Real Backend Mode, network outages, HTTP 4xx/5xx responses, and malformed schemas are immediately caught and presented as explicit system errors. Failures are <strong>never converted into fake agent messages</strong>.
              </p>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
          <div className="flex items-center gap-3">
            <div className="text-xs text-slate-400">
              Current Status: <span className="font-semibold text-slate-200">{appMode === 'demo' ? 'Demo Mode (Simulated)' : 'Real Backend Mode'}</span>
            </div>
            <a
              href="/debatedesk-source.zip"
              download="debatedesk-source.zip"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
            >
              <Download className="w-3 h-3 text-indigo-400" />
              <span>Download Project ZIP</span>
            </a>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Close Guide
          </button>
        </div>

      </div>
    </div>
  );
};
