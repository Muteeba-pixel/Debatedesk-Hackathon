import { DebateSession, DebateTurn, JudgeVerdict } from '../types/debate';

export interface StartDebatePayload {
  question: string;
  context?: string;
  criteria?: string;
  rounds: number;
  presetId?: string;
}

export type BackendErrorType = 
  | 'network_failure' 
  | 'http_error' 
  | 'invalid_response' 
  | 'unimplemented_endpoint' 
  | 'missing_config';

export class BackendIntegrationError extends Error {
  public readonly type: BackendErrorType;
  public readonly status?: number;
  public readonly statusText?: string;
  public readonly details?: string;

  constructor(params: {
    type: BackendErrorType;
    message: string;
    status?: number;
    statusText?: string;
    details?: string;
  }) {
    super(params.message);
    this.name = 'BackendIntegrationError';
    this.type = params.type;
    this.status = params.status;
    this.statusText = params.statusText;
    this.details = params.details;
  }
}

/**
 * Common typed interface for both simulated (mock) and real backend debate services.
 */
export interface IDebateService {
  startDebate(payload: StartDebatePayload): Promise<DebateSession>;
  getSession(id: string): DebateSession | null;
  getAllSessions(): DebateSession[];
}
