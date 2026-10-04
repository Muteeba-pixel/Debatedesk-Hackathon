import React from 'react';
import { Scale, History, PlayCircle, PlusCircle, HelpCircle, Server, Download } from 'lucide-react';
import { AppDebateMode } from '../services/debateApi';

interface NavbarProps {
  currentTab: 'dashboard' | 'active' | 'verdict' | 'recent';
  hasActiveSession: boolean;
  hasVerdict: boolean;
  appMode: AppDebateMode;
  isBackendConfigured: boolean;
  backendUrl: string | null;
  onSelectTab: (tab: 'dashboard' | 'active' | 'verdict' | 'recent') => void;
  onOpenArchitecture: () => void;
  onOpenBackendSetup: () => void;
  onNewDebate?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  hasActiveSession,
  hasVerdict,
  appMode,
  isBackendConfigured,
  backendUrl,
  onSelectTab,
  onOpenArchitecture,
  onOpenBackendSetup,
  onNewDebate,
}) => {
  const handleNewDebateClick = () => {
    if (onNewDebate) {
      onNewDebate();
    } else {
      onSelectTab('dashboard');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/90 bg-slate-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onSelectTab('dashboard')}
            className="flex items-center gap-2.5 text-left group transition-all rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 cursor-pointer"
            aria-label="DebateDesk Home"
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-md shadow-indigo-500/20 text-white shrink-0 group-hover:from-indigo-400 group-hover:to-indigo-600 transition-all">
              <Scale className="w-5 h-5 text-indigo-50" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-white group-hover:text-indigo-200 transition-colors">
                DebateDesk
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">
                Multi-Agent Decision Intelligence
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5" aria-label="Main Navigation">
          <button
            onClick={handleNewDebateClick}
            aria-current={currentTab === 'dashboard' ? 'page' : undefined}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 cursor-pointer ${
              currentTab === 'dashboard'
                ? 'bg-slate-800 text-indigo-300 shadow-sm border border-slate-700/80 font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-900/80'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <PlusCircle className="w-3.5 h-3.5" />
              New Debate
            </span>
          </button>

          {hasActiveSession && (
            <button
              onClick={() => onSelectTab('active')}
              aria-current={currentTab === 'active' ? 'page' : undefined}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 cursor-pointer ${
                currentTab === 'active'
                  ? 'bg-slate-800 text-indigo-300 shadow-sm border border-slate-700/80 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900/80'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <PlayCircle className="w-3.5 h-3.5 text-indigo-400" />
                Active Debate
              </span>
            </button>
          )}

          {hasVerdict && (
            <button
              onClick={() => onSelectTab('verdict')}
              aria-current={currentTab === 'verdict' ? 'page' : undefined}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 cursor-pointer ${
                currentTab === 'verdict'
                  ? 'bg-slate-800 text-indigo-300 shadow-sm border border-slate-700/80 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900/80'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-indigo-400" />
                Verdict & Analysis
              </span>
            </button>
          )}

          <button
            onClick={() => onSelectTab('recent')}
            aria-current={currentTab === 'recent' ? 'page' : undefined}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 cursor-pointer ${
              currentTab === 'recent'
                ? 'bg-slate-800 text-indigo-300 shadow-sm border border-slate-700/80 font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-900/80'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <History className="w-3.5 h-3.5" />
              Recent Debates
            </span>
          </button>
        </nav>

        {/* Zone 3: Actions & Mode Indicator */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          
          {/* Mode Pill (Clickable to view Backend Setup) */}
          <button
            type="button"
            onClick={onOpenBackendSetup}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold tracking-wide transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 cursor-pointer border ${
              appMode === 'demo'
                ? 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30 text-amber-300'
                : 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30 text-emerald-300'
            }`}
            title={
              appMode === 'demo'
                ? (isBackendConfigured 
                    ? `Demo Mode active (Backend configured at ${backendUrl}). Click to switch or configure.` 
                    : 'Demo Mode active (VITE_API_BASE_URL unset). Click to view integration setup.')
                : `Real Backend Mode active (Target: ${backendUrl || 'unspecified'}). Click to view details.`
            }
            aria-label={`Current execution mode: ${appMode === 'demo' ? 'Demo Mode' : 'Real Backend Mode'}. Click to configure backend.`}
          >
            <span 
              className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                appMode === 'demo' ? 'bg-amber-400' : 'bg-emerald-400'
              }`} 
              aria-hidden="true" 
            />
            <span>{appMode === 'demo' ? 'DEMO MODE' : 'BACKEND MODE'}</span>
          </button>

          <button
            onClick={onOpenBackendSetup}
            className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 cursor-pointer"
            title="Configure connection to Python backend (Agent.py)"
          >
            <Server className="w-3.5 h-3.5 text-indigo-400" />
            <span>Backend Setup</span>
          </button>

          <button
            onClick={onOpenArchitecture}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
            <span>Architecture</span>
          </button>

          <a
            href="/debatedesk-source.zip"
            download="debatedesk-source.zip"
            className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 cursor-pointer"
            title="Download full project source code ZIP backup"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span>Backup ZIP</span>
          </a>

          <button
            onClick={handleNewDebateClick}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 transition-all shadow-sm shadow-indigo-600/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Start New Debate</span>
            <span className="sm:hidden">New</span>
          </button>
        </div>

      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="md:hidden border-t border-slate-800/80 px-2 py-1.5 flex items-center justify-around overflow-x-auto gap-1 bg-slate-950/95" aria-label="Mobile Navigation">
        <button
          onClick={handleNewDebateClick}
          aria-current={currentTab === 'dashboard' ? 'page' : undefined}
          className={`min-h-[44px] px-3 py-2 rounded-lg text-xs whitespace-nowrap transition-colors flex items-center font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
            currentTab === 'dashboard' ? 'text-indigo-300 bg-slate-900 font-semibold border border-slate-800' : 'text-slate-300 hover:text-white'
          }`}
        >
          New Debate
        </button>
        {hasActiveSession && (
          <button
            onClick={() => onSelectTab('active')}
            aria-current={currentTab === 'active' ? 'page' : undefined}
            className={`min-h-[44px] px-3 py-2 rounded-lg text-xs whitespace-nowrap transition-colors flex items-center font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
              currentTab === 'active' ? 'text-indigo-300 bg-slate-900 font-semibold border border-slate-800' : 'text-slate-300 hover:text-white'
            }`}
          >
            Active Debate
          </button>
        )}
        {hasVerdict && (
          <button
            onClick={() => onSelectTab('verdict')}
            aria-current={currentTab === 'verdict' ? 'page' : undefined}
            className={`min-h-[44px] px-3 py-2 rounded-lg text-xs whitespace-nowrap transition-colors flex items-center font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
              currentTab === 'verdict' ? 'text-indigo-300 bg-slate-900 font-semibold border border-slate-800' : 'text-slate-300 hover:text-white'
            }`}
          >
            Verdict
          </button>
        )}
        <button
          onClick={() => onSelectTab('recent')}
          aria-current={currentTab === 'recent' ? 'page' : undefined}
          className={`min-h-[44px] px-3 py-2 rounded-lg text-xs whitespace-nowrap transition-colors flex items-center font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
            currentTab === 'recent' ? 'text-indigo-300 bg-slate-900 font-semibold border border-slate-800' : 'text-slate-300 hover:text-white'
          }`}
        >
          Recent
        </button>
        <button
          onClick={onOpenBackendSetup}
          className="min-h-[44px] px-3 py-2 rounded-lg text-xs whitespace-nowrap text-indigo-400 hover:text-indigo-300 flex items-center font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
        >
          Backend
        </button>
        <button
          onClick={onOpenArchitecture}
          className="min-h-[44px] px-3 py-2 rounded-lg text-xs whitespace-nowrap text-slate-400 hover:text-slate-200 flex items-center font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
        >
          Architecture
        </button>
      </div>
    </header>
  );
};

