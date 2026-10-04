import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  ChevronRight, 
  Scale, 
  PlusCircle,
  Calendar,
  Sparkles
} from 'lucide-react';
import { DebateSession, VerdictType } from '../types/debate';

interface RecentDebatesViewProps {
  sessions: DebateSession[];
  onSelectSession: (session: DebateSession) => void;
  onStartNewDebate: () => void;
}

export const RecentDebatesView: React.FC<RecentDebatesViewProps> = ({
  sessions,
  onSelectSession,
  onStartNewDebate,
}) => {
  const [search, setSearch] = useState('');
  const [verdictFilter, setVerdictFilter] = useState<'all' | VerdictType>('all');

  const filtered = sessions.filter((session) => {
    const matchesSearch = 
      session.question.toLowerCase().includes(search.toLowerCase()) ||
      (session.backgroundContext && session.backgroundContext.toLowerCase().includes(search.toLowerCase()));

    const verdict = session.verdict?.verdict;
    const matchesVerdict = verdictFilter === 'all' || verdict === verdictFilter;

    return matchesSearch && matchesVerdict;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-1">
            <History className="w-4 h-4" />
            <span>Decision Archive</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Recent Demo Debates
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Browse through completed multi-agent deliberations, verdicts, and deciding factors.
          </p>
        </div>

        <button
          onClick={onStartNewDebate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Launch New Debate</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search decisions, keywords, contexts..."
            aria-label="Search recent decisions"
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:border-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 transition-colors"
          />
        </div>

        {/* Verdict Filter Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs self-start sm:self-auto" role="tablist" aria-label="Filter decisions by verdict">
          {(['all', 'Yes', 'No', 'Conditional'] as const).map((filter) => {
            const isSelected = verdictFilter === filter;
            return (
              <button
                key={filter}
                role="tab"
                aria-selected={isSelected}
                onClick={() => setVerdictFilter(filter)}
                className={`px-3 py-1.5 rounded-md font-semibold capitalize transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                {filter === 'all' ? 'All Verdicts' : filter}
              </button>
            );
          })}
        </div>

      </div>

      {/* Sessions Grid */}
      {filtered.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-12 text-center">
          <Scale className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white mb-1">No Debates Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
            No deliberations match the current search or verdict filters.
          </p>
          <button
            onClick={() => { setSearch(''); setVerdictFilter('all'); }}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded px-2 py-1 cursor-pointer"
          >
            Clear Search & Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((session) => {
            const verdict = session.verdict;
            const isYes = verdict?.verdict === 'Yes';
            const isNo = verdict?.verdict === 'No';
            const isConditional = verdict?.verdict === 'Conditional';

            const badgeBg = isYes 
              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
              : isNo
              ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
              : 'bg-amber-500/10 text-amber-300 border-amber-500/30';

            const icon = isYes ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : isNo ? (
              <XCircle className="w-3.5 h-3.5 text-rose-400" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            );

            return (
              <div
                key={session.id}
                role="button"
                tabIndex={0}
                onClick={() => onSelectSession(session)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectSession(session);
                  }
                }}
                className="bg-slate-900/90 border border-slate-800 hover:border-indigo-500/60 focus-visible:border-indigo-400 focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 focus-visible:outline-none rounded-xl p-5 shadow-md hover:shadow-indigo-500/10 transition-all cursor-pointer group flex flex-col justify-between text-left"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      {verdict ? (
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold border ${badgeBg}`}>
                          {icon}
                          <span>{verdict.verdict}</span>
                        </span>
                      ) : (
                        <span className="text-xs text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 font-medium">
                          In Progress
                        </span>
                      )}

                      {verdict?.confidence && (
                        <span className="text-xs font-mono tabular-nums text-slate-300 font-medium">
                          {verdict.confidence}% confidence
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      <span>{new Date(session.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-100 group-hover:text-indigo-200 transition-colors line-clamp-2 leading-snug mb-2">
                    {session.question}
                  </h3>

                  {verdict?.summary ? (
                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      "{verdict.summary}"
                    </p>
                  ) : session.backgroundContext ? (
                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      {session.backgroundContext}
                    </p>
                  ) : null}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span className="text-[11px] font-medium text-slate-400">
                    {session.totalRounds} Rounds · {session.transcript.length} Turns
                  </span>

                  <span className="text-indigo-400 group-hover:text-indigo-300 font-semibold inline-flex items-center gap-1 transition-colors">
                    <span>Inspect Verdict</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
