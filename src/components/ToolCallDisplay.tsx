import React from 'react';
import { 
  Wrench, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle, 
  Loader2, 
  Search, 
  Globe, 
  FileText 
} from 'lucide-react';
import { DebateTurnToolCall } from '../types/debate';

interface ToolCallDisplayProps {
  toolCall?: DebateTurnToolCall;
  toolCalls?: DebateTurnToolCall[];
}

export const ToolCallDisplay: React.FC<ToolCallDisplayProps> = ({ toolCall, toolCalls }) => {
  // Aggregate any tool calls passed either as single toolCall or array of toolCalls
  const list: DebateTurnToolCall[] = [];
  if (toolCall) list.push(toolCall);
  if (toolCalls && Array.isArray(toolCalls)) {
    for (const tc of toolCalls) {
      if (tc && !list.includes(tc)) {
        list.push(tc);
      }
    }
  }

  if (list.length === 0) {
    return null;
  }

  return (
    <div className="mt-3.5 space-y-2.5">
      {list.map((call, idx) => {
        const isRunning = call.status === 'running';
        const isError = call.status === 'error' || !!call.error;
        const isSuccess = call.status === 'success' && !call.error;

        return (
          <div 
            key={idx}
            className={`rounded-lg border text-xs overflow-hidden transition-all ${
              isError
                ? 'bg-rose-950/30 border-rose-800/60 text-rose-200'
                : isRunning
                ? 'bg-indigo-950/30 border-indigo-700/60 text-indigo-200'
                : 'bg-slate-950/80 border-slate-800 text-slate-300'
            }`}
          >
            {/* Header: Tool Name & Status Badge */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-slate-950/60 border-b border-inherit">
              <div className="flex items-center gap-2">
                <Wrench className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="font-semibold text-slate-200">Tool Execution:</span>
                <code className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono text-indigo-300">
                  {call.name}
                </code>
              </div>

              {/* Status Indicator */}
              <div className="flex items-center gap-1.5">
                {isRunning && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Executing
                  </span>
                )}
                {isSuccess && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    <CheckCircle2 className="w-3 h-3" />
                    Success
                  </span>
                )}
                {isError && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-rose-500/15 text-rose-300 border border-rose-500/30">
                    <AlertTriangle className="w-3 h-3" />
                    Failed
                  </span>
                )}
              </div>
            </div>

            {/* Body: Query, Error, and Returned Sources */}
            <div className="p-3 space-y-2.5">
              {/* Tool Query / Input Arguments */}
              {call.query && (
                <div className="flex items-start gap-2 bg-slate-900/90 rounded p-2 border border-slate-800/80 font-mono text-[11px]">
                  <Search className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-slate-400 mr-1.5">Query:</span>
                    <span className="text-slate-200 select-all break-words">{call.query}</span>
                  </div>
                </div>
              )}

              {/* Tool Error Alert */}
              {call.error && (
                <div className="flex items-start gap-2 p-2.5 rounded bg-rose-950/50 border border-rose-800/80 text-rose-200">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-[11px] uppercase tracking-wide text-rose-300">
                      Tool Execution Error
                    </div>
                    <p className="mt-0.5 text-xs text-rose-200 leading-relaxed break-words font-mono text-[11px]">
                      {call.error}
                    </p>
                  </div>
                </div>
              )}

              {/* Returned Sources */}
              {call.sources && call.sources.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    <Globe className="w-3 h-3 text-indigo-400" />
                    <span>Retrieved Sources ({call.sources.length})</span>
                  </div>

                  <div className="space-y-1.5">
                    {call.sources.map((source, sIdx) => {
                      const displayTitle = source.title || source.url || `Source #${sIdx + 1}`;
                      return (
                        <div 
                          key={sIdx}
                          className="p-2 rounded bg-slate-900/70 border border-slate-800/80 text-xs hover:border-slate-700 transition-colors"
                        >
                          <div className="flex items-center justify-between gap-2">
                            {source.url ? (
                              <a
                                href={source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 font-medium text-indigo-400 hover:text-indigo-300 underline decoration-indigo-500/50 underline-offset-2 break-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-400 rounded"
                              >
                                <span>{displayTitle}</span>
                                <ExternalLink className="w-3 h-3 shrink-0" />
                              </a>
                            ) : (
                              <span className="font-medium text-slate-200">{displayTitle}</span>
                            )}
                          </div>

                          {source.snippet && (
                            <p className="mt-1 text-[11px] text-slate-300 leading-relaxed italic line-clamp-3">
                              "{source.snippet}"
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
