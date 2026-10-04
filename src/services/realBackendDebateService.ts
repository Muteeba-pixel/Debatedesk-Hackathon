/**
 * Real Backend Debate Service
 * 
 * Communicates with the external Python backend (e.g. Agent.py running via FastAPI).
 * Reads base URL from import.meta.env.VITE_API_BASE_URL.
 * 
 * IMPORTANT:
 * - This service does not invent endpoints or fabricate backend responses.
 * - When VITE_API_BASE_URL is not set, or when the team's specific endpoint path has
 *   not yet been specified, this service returns explicit typed errors rather than
 *   masking failures or pretending a connection succeeded.
 * - Backend failures are surfaced as real errors, NEVER converted into fake agent messages.
 * - No Groq API keys are stored or exposed in this frontend code.
 */

import { 
  DebateSession, 
  DebateTurn, 
  AgentRole, 
  TurnKind, 
  VerdictType, 
  JudgeVerdict,
  DebateTurnToolCall,
  DebateTurnToolSource
} from '../types/debate';
import { 
  StartDebatePayload, 
  BackendIntegrationError, 
  IDebateService 
} from './debateService.types';

// =============================================================================
// BACKEND INTEGRATION CONFIGURATION
// Configure these constants when your team provides the actual Python endpoint
// =============================================================================

/**
 * When your Python team supplies the exact route from Agent.py, set it here.
 * Set to null by default so we do NOT invent an endpoint.
 * Example once provided by team: '/api/v1/debate' or '/debate'
 */
export const ACTUAL_BACKEND_ENDPOINT: string | null = null;

class RealBackendDebateService implements IDebateService {
  private inMemorySessions: Map<string, DebateSession> = new Map();

  /**
   * Returns the configured backend base URL from VITE_API_BASE_URL, trimmed of trailing slash.
   */
  public getBaseUrl(): string | null {
    const rawUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();
    if (!rawUrl) return null;
    return rawUrl.replace(/\/+$/, '');
  }

  /**
   * Returns true if a valid non-empty VITE_API_BASE_URL is configured.
   */
  public isBackendConfigured(): boolean {
    const url = this.getBaseUrl();
    return !!url && url.length > 0;
  }

  /**
   * Starts a debate on the real backend.
   * Handles:
   * 1. Missing base URL configuration
   * 2. Unspecified endpoint path (waiting on team schema)
   * 3. Network connection errors
   * 4. HTTP error codes (4xx, 5xx)
   * 5. Invalid/malformed response payloads
   */
  public async startDebate(payload: StartDebatePayload): Promise<DebateSession> {
    const baseUrl = this.getBaseUrl();

    if (!baseUrl) {
      throw new BackendIntegrationError({
        type: 'missing_config',
        message: 'Backend URL is not configured. Set VITE_API_BASE_URL in your environment to connect to your team\'s Python server.',
      });
    }

    if (!ACTUAL_BACKEND_ENDPOINT) {
      throw new BackendIntegrationError({
        type: 'unimplemented_endpoint',
        message: `Backend base URL is set to "${baseUrl}", but your team has not yet provided the exact endpoint path and request/response schema. Once provided, configure ACTUAL_BACKEND_ENDPOINT in src/services/realBackendDebateService.ts.`,
        details: 'Awaiting team backend route specification (e.g. POST /debate).',
      });
    }

    const fullUrl = `${baseUrl}${ACTUAL_BACKEND_ENDPOINT}`;

    let response: Response;
    try {
      response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });
    } catch (networkError: unknown) {
      const err = networkError instanceof Error ? networkError : new Error(String(networkError));
      throw new BackendIntegrationError({
        type: 'network_failure',
        message: `Unable to connect to backend at ${fullUrl}. Check that your Python backend (Agent.py) is running and accessible.`,
        details: err.message,
      });
    }

    if (!response.ok) {
      let errorBody = '';
      try {
        errorBody = await response.text();
      } catch {
        // Ignore failure to read error body
      }

      throw new BackendIntegrationError({
        type: 'http_error',
        status: response.status,
        statusText: response.statusText,
        message: `Backend returned HTTP ${response.status} (${response.statusText}).`,
        details: errorBody || undefined,
      });
    }

    let data: unknown;
    try {
      data = await response.json();
    } catch {
      throw new BackendIntegrationError({
        type: 'invalid_response',
        message: 'Backend returned a response that could not be parsed as JSON.',
      });
    }

    // Normalize and validate that response contains required debate session fields
    const session = this.normalizeBackendSession(data, payload);
    if (!session) {
      throw new BackendIntegrationError({
        type: 'invalid_response',
        message: 'Backend returned JSON, but it does not match the DebateSession schema expected by the frontend.',
        details: 'The response is missing required fields (id, question, transcript, etc.).',
      });
    }

    this.inMemorySessions.set(session.id, session);
    return session;
  }

  public getSession(id: string): DebateSession | null {
    return this.inMemorySessions.get(id) || null;
  }

  public getAllSessions(): DebateSession[] {
    return Array.from(this.inMemorySessions.values());
  }

  /**
   * Robust normalizer that accepts either camelCase or snake_case payloads from Python
   * (e.g. FastAPI / Pydantic models), extracts tool-call executions, and validates schema.
   */
  private normalizeBackendSession(raw: unknown, payload: StartDebatePayload): DebateSession | null {
    if (!raw || typeof raw !== 'object') return null;

    // Unwrap envelope if backend returned { session: { ... } } or { data: { ... } }
    const root = (raw as Record<string, unknown>).session || (raw as Record<string, unknown>).data || raw;
    if (!root || typeof root !== 'object') return null;

    const r = root as Record<string, unknown>;

    const question = typeof r.question === 'string' ? r.question : payload.question;
    const transcriptRaw = Array.isArray(r.transcript) ? r.transcript : null;

    if (!transcriptRaw) {
      return null;
    }

    const totalRounds = typeof r.totalRounds === 'number' 
      ? r.totalRounds 
      : typeof r.total_rounds === 'number' 
      ? r.total_rounds 
      : payload.rounds;

    const currentRound = typeof r.currentRound === 'number' 
      ? r.currentRound 
      : typeof r.current_round === 'number' 
      ? r.current_round 
      : totalRounds;

    // Normalize turns including optional tool execution details
    const transcript: DebateTurn[] = transcriptRaw.map((tRaw, idx): DebateTurn => {
      if (!tRaw || typeof tRaw !== 'object') {
        return {
          id: `turn-${idx}`,
          round: 1,
          agentRole: 'pro' as AgentRole,
          agentName: 'Agent',
          kind: 'argument' as TurnKind,
          title: `Turn #${idx + 1}`,
          content: String(tRaw),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
      }
      const t = tRaw as Record<string, unknown>;
      
      const roleRaw = String(t.agentRole || t.agent_role || 'pro').toLowerCase();
      const role: AgentRole = (roleRaw === 'con' || roleRaw === 'moderator' || roleRaw === 'judge') ? (roleRaw as AgentRole) : 'pro';

      // Parse tool call if present
      const toolArray = Array.isArray(t.toolCalls) ? (t.toolCalls as unknown[]) : Array.isArray(t.tool_calls) ? (t.tool_calls as unknown[]) : null;
      const rawTool = t.toolCall || t.tool_call || (toolArray && toolArray.length > 0 ? toolArray[0] : null);
      
      let toolCall: DebateTurnToolCall | undefined = undefined;
      if (rawTool && typeof rawTool === 'object') {
        const tc = rawTool as Record<string, unknown>;
        const rawStatus = String(tc.status || 'success').toLowerCase();
        const status: DebateTurnToolCall['status'] = (rawStatus === 'running' || rawStatus === 'error') ? rawStatus : 'success';
        
        let sources: DebateTurnToolSource[] | undefined = undefined;
        const rawSources = tc.sources || tc.results;
        if (Array.isArray(rawSources)) {
          sources = rawSources.map((s): DebateTurnToolSource => {
            if (typeof s === 'string') return { title: s };
            if (s && typeof s === 'object') {
              const src = s as Record<string, unknown>;
              return {
                title: typeof src.title === 'string' ? src.title : undefined,
                url: typeof src.url === 'string' ? src.url : undefined,
                snippet: typeof src.snippet === 'string' ? src.snippet : typeof src.content === 'string' ? src.content : undefined,
              };
            }
            return { title: String(s) };
          });
        }

        toolCall = {
          name: String(tc.name || tc.tool_name || tc.tool || 'tool'),
          query: typeof tc.query === 'string' ? tc.query : typeof tc.input === 'string' ? tc.input : undefined,
          status,
          sources,
          error: typeof tc.error === 'string' ? tc.error : typeof tc.error_message === 'string' ? tc.error_message : undefined,
        };
      }

      const kindRaw = String(t.kind || 'argument');
      const kind: TurnKind = (kindRaw === 'moderator_question' || kindRaw === 'round_summary' || kindRaw === 'judge_verdict') 
        ? (kindRaw as TurnKind) 
        : 'argument';

      const keyPointsList = Array.isArray(t.keyPoints) 
        ? (t.keyPoints as string[]) 
        : Array.isArray(t.key_points) 
        ? (t.key_points as string[]) 
        : undefined;

      return {
        id: String(t.id || `turn-${idx + 1}`),
        round: typeof t.round === 'number' ? t.round : 1,
        agentRole: role,
        agentName: String(t.agentName || t.agent_name || (role === 'pro' ? 'Pro Agent' : role === 'con' ? 'Con Agent' : role === 'moderator' ? 'Moderator' : 'Judge')),
        kind,
        title: String(t.title || `Round ${t.round || 1} Statement`),
        content: String(t.content || ''),
        keyPoints: keyPointsList,
        targetedAgent: (t.targetedAgent || t.targeted_agent) as any,
        timestamp: String(t.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })),
        toolCall,
      };
    });

    // Parse verdict if provided
    let verdict: JudgeVerdict | undefined = undefined;
    const vRaw = r.verdict;
    if (vRaw && typeof vRaw === 'object') {
      const v = vRaw as Record<string, unknown>;
      const vTypeRaw = String(v.verdict || 'Conditional').toLowerCase();
      const vType: VerdictType = vTypeRaw === 'yes' ? 'Yes' : vTypeRaw === 'no' ? 'No' : 'Conditional';

      const decidingFactorsList: string[] = Array.isArray(v.decidingFactors) 
        ? (v.decidingFactors as string[]) 
        : Array.isArray(v.deciding_factors) 
        ? (v.deciding_factors as string[]) 
        : [];

      const recommendationsList: string[] = Array.isArray(v.actionableRecommendations) 
        ? (v.actionableRecommendations as string[]) 
        : Array.isArray(v.actionable_recommendations) 
        ? (v.actionable_recommendations as string[]) 
        : [];

      verdict = {
        verdict: vType,
        confidence: typeof v.confidence === 'number' ? v.confidence : 80,
        summary: String(v.summary || 'Deliberation concluded with consensus.'),
        decidingFactors: decidingFactorsList,
        risks: Array.isArray(v.risks) ? (v.risks as string[]) : [],
        reasoning: String(v.reasoning || ''),
        actionableRecommendations: recommendationsList,
      };
    }

    const sessionStatus: DebateSession['status'] = 
      r.status === 'completed' || verdict ? 'completed' : 
      r.status === 'paused' ? 'paused' : 'debating';

    return {
      id: String(r.id || `backend-debate-${Date.now()}`),
      question,
      backgroundContext: typeof r.backgroundContext === 'string' ? r.backgroundContext : typeof r.background_context === 'string' ? r.background_context : payload.context,
      decisionCriteria: typeof r.decisionCriteria === 'string' ? r.decisionCriteria : typeof r.decision_criteria === 'string' ? r.decision_criteria : payload.criteria,
      totalRounds,
      currentRound,
      status: sessionStatus,
      currentTurnIndex: typeof r.currentTurnIndex === 'number' ? r.currentTurnIndex : transcript.length,
      transcript,
      verdict,
      createdAt: String(r.createdAt || r.created_at || new Date().toISOString()),
      isDemo: false,
    };
  }
}

export const realBackendDebateService = new RealBackendDebateService();
