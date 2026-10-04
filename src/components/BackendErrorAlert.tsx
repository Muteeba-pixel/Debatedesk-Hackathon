import React from 'react';
import { 
  AlertTriangle, 
  WifiOff, 
  ServerCrash, 
  FileCode, 
  Settings, 
  RotateCcw, 
  Play, 
  X,
  HelpCircle
} from 'lucide-react';
import { BackendIntegrationError } from '../services/debateService.types';

interface BackendErrorAlertProps {
  error: BackendIntegrationError;
  onRetry?: () => void;
  onSwitchToDemo?: () => void;
  onOpenSetupGuide?: () => void;
  onDismiss: () => void;
}

export const BackendErrorAlert: React.FC<BackendErrorAlertProps> = ({
  error,
  onRetry,
  onSwitchToDemo,
  onOpenSetupGuide,
  onDismiss,
}) => {
  const getIconAndTitle = () => {
    switch (error.type) {
      case 'network_failure':
        return {
          icon: <WifiOff className="w-5 h-5 text-rose-400 shrink-0" />,
          title: 'Backend Network Connection Failed',
          badge: 'Network Failure',
        };
      case 'http_error':
        return {
          icon: <ServerCrash className="w-5 h-5 text-rose-400 shrink-0" />,
          title: `Backend HTTP Error ${error.status ? `(${error.status})` : ''}`,
          badge: `HTTP ${error.status || 'Error'}`,
        };
      case 'invalid_response':
        return {
          icon: <FileCode className="w-5 h-5 text-amber-400 shrink-0" />,
          title: 'Invalid Backend Response Schema',
          badge: 'Malformed Payload',
        };
      case 'unimplemented_endpoint':
        return {
          icon: <Settings className="w-5 h-5 text-indigo-400 shrink-0" />,
          title: 'Backend Route Specification Pending',
          badge: 'Awaiting Team Route',
        };
      case 'missing_config':
      default:
        return {
          icon: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
          title: 'VITE_API_BASE_URL Not Configured',
          badge: 'Missing Configuration',
        };
    }
  };

  const { icon, title, badge } = getIconAndTitle();

  return (
    <div 
      className="p-5 rounded-xl bg-slate-900 border-2 border-rose-500/40 shadow-xl text-left my-4 relative animate-in fade-in duration-200"
      role="alert"
      aria-live="assertive"
    >
      <button
        onClick={onDismiss}
        aria-label="Dismiss error"
        className="absolute top-4 right-4 p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-start gap-3.5 pr-6">
        <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
          {icon}
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className="text-sm font-bold text-white tracking-tight">{title}</h3>
            <span className="text-[10px] uppercase font-mono font-semibold px-2 py-0.5 rounded bg-slate-950 text-rose-300 border border-rose-500/30">
              {badge}
            </span>
          </div>

          <p className="text-xs text-slate-200 leading-relaxed mb-2">
            {error.message}
          </p>

          {error.details && (
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800/80 font-mono text-[11px] text-slate-400 mb-3 overflow-x-auto max-h-24">
              {error.details}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-slate-800/80">
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry Request</span>
              </button>
            )}

            {onSwitchToDemo && (
              <button
                type="button"
                onClick={onSwitchToDemo}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-xs font-semibold border border-amber-500/40 transition-colors cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 text-amber-400" />
                <span>Switch to Demo Mode</span>
              </button>
            )}

            {onOpenSetupGuide && (
              <button
                type="button"
                onClick={onOpenSetupGuide}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
                <span>Setup Instructions</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
