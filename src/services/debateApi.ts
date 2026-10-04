/**
 * DebateDesk API Service Coordinator
 * 
 * Provides a unified frontend service interface for starting debates and receiving results.
 * 
 * Architecture:
 * 1. Mock service (MockDebateService) and Real HTTP service (RealBackendDebateService)
 *    are kept strictly separated.
 * 2. Reads backend base URL from VITE_API_BASE_URL.
 * 3. Does NOT invent backend endpoints or fake live backend connectivity.
 * 4. When VITE_API_BASE_URL is not configured (or in demo mode), requests route through
 *    the simulated multi-agent mock service.
 * 5. When real backend mode is active, requests route through realBackendDebateService,
 *    and any network, HTTP, or response schema errors are reported explicitly to the user
 *    without being disguised as fake agent messages.
 * 6. No Groq API keys are handled or exposed in client code.
 */

import { DebateSession, DebateTurn, JudgeVerdict } from '../types/debate';
import { 
  StartDebatePayload, 
  BackendIntegrationError, 
  IDebateService 
} from './debateService.types';
import { mockDebateService } from './mockDebateService';
import { realBackendDebateService } from './realBackendDebateService';

export * from './debateService.types';
export { mockDebateService } from './mockDebateService';
export { realBackendDebateService } from './realBackendDebateService';

export type AppDebateMode = 'demo' | 'backend';

class DebateServiceCoordinator {
  /**
   * Check whether VITE_API_BASE_URL is set in the environment
   */
  public isBackendConfigured(): boolean {
    return realBackendDebateService.isBackendConfigured();
  }

  /**
   * Get the configured backend base URL, or null if unset
   */
  public getBackendBaseUrl(): string | null {
    return realBackendDebateService.getBaseUrl();
  }

  /**
   * Determine the default mode based on environment configuration:
   * Returns 'backend' if VITE_API_BASE_URL is configured, otherwise 'demo'.
   */
  public getDefaultMode(): AppDebateMode {
    return this.isBackendConfigured() ? 'backend' : 'demo';
  }

  /**
   * Start a debate using either the real backend service or the simulated mock service
   */
  public async startDebate(
    payload: StartDebatePayload, 
    mode: AppDebateMode = this.getDefaultMode()
  ): Promise<DebateSession> {
    if (mode === 'backend') {
      // Use real HTTP service - raises BackendIntegrationError on failure
      return await realBackendDebateService.startDebate(payload);
    }

    // Default: use simulated multi-agent engine
    return await mockDebateService.startDebate(payload);
  }

  /**
   * Retrieve a session by ID from the active store
   */
  public getSession(id: string, mode: AppDebateMode = 'demo'): DebateSession | null {
    if (mode === 'backend') {
      return realBackendDebateService.getSession(id);
    }
    return mockDebateService.getSession(id);
  }

  /**
   * Subscribe to live debate streaming (supported in Demo Mode)
   */
  public subscribeToStream(
    sessionId: string,
    onTurn: (turn: DebateTurn) => void,
    onVerdict: (verdict: JudgeVerdict) => void,
    onError: (error: Error) => void
  ): () => void {
    return mockDebateService.subscribeToSession(sessionId, onTurn, onVerdict, onError);
  }
}

export const debateService = new DebateServiceCoordinator();
