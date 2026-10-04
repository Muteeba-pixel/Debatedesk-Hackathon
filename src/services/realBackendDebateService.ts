/**
 * Real Backend Debate Service
 *
 * Communicates with the Python FastAPI backend.
 * Reads base URL from import.meta.env.VITE_API_BASE_URL.
 *
 * Backend contract used by this project:
 *   POST /debate
 *   Request:  { topic: string, rounds: number }
 *   Response: { success: true, data: { topic, rounds, debate_history, evaluation } }
 *
 * No Groq API keys are stored or exposed in this frontend code.
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
// =============================================================================

/**
 * Vercel exposes the FastAPI service through /api.
 * The actual FastAPI route is /debate.
 */
export const ACTUAL_BACKEND_ENDPOINT: string | null = '/api/debate';

class RealBackendDebateService implements IDebateService {
  private inMemorySessions: Map<string, DebateSession> = new Map();

  /**
   * Returns the configured backend base URL from VITE_API_BASE_URL,
   * trimmed of trailing slashes.
   */
  public getBaseUrl(): string | null {
    const rawUrl = (
      import.meta.env.VITE_API_BASE_URL as string | undefined
    )?.trim();

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
   */
  public async startDebate(
    payload: StartDebatePayload
  ): Promise<DebateSession> {
    const baseUrl = this.getBaseUrl();

    if (!baseUrl) {
      throw new BackendIntegrationError({
        type: 'missing_config',
        message:
          'Backend URL is not configured. Set VITE_API_BASE_URL in your environment.'
      });
    }

    if (!ACTUAL_BACKEND_ENDPOINT) {
      throw new BackendIntegrationError({
        type: 'unimplemented_endpoint',
        message:
          'Backend endpoint is not configured in realBackendDebateService.ts.',
        details: 'Expected backend endpoint: POST /api/debate'
      });
    }

    const fullUrl = `${baseUrl}${ACTUAL_BACKEND_ENDPOINT}`;

    let response: Response;

    try {
      /**
       * IMPORTANT:
       * The Python backend expects:
       * {
       *   "topic": "...",
       *   "rounds": 2
       * }
       *
       * So we do NOT send the frontend payload directly.
       */
      const backendPayload = {
        topic: payload.question,
        rounds: payload.rounds
      };

      response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify(backendPayload)
      });
    } catch (networkError: unknown) {
      const err =
        networkError instanceof Error
          ? networkError
          : new Error(String(networkError));

      throw new BackendIntegrationError({
        type: 'network_failure',
        message: `Unable to connect to backend at ${fullUrl}.`,
        details: err.message
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
        details: errorBody || undefined
      });
    }

    let data: unknown;

    try {
      data = await response.json();
    } catch {
      throw new BackendIntegrationError({
        type: 'invalid_response',
        message:
          'Backend returned a response that could not be parsed as JSON.'
      });
    }

    const session = this.normalizeBackendSession(data, payload);

    if (!session) {
      throw new BackendIntegrationError({
        type: 'invalid_response',
        message:
          'Backend returned JSON, but it does not match the expected debate response.',
        details:
          'Expected debate_history and evaluation data from the FastAPI backend.'
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
   * Converts the Python backend response into the frontend DebateSession shape.
   *
   * Supports:
   * - transcript
   * - debate_history
   * - debateHistory
   * - evaluation
   */
  private normalizeBackendSession(
    raw: unknown,
    payload: StartDebatePayload
  ): DebateSession | null {
    if (!raw || typeof raw !== 'object') return null;

    const rawObject = raw as Record<string, unknown>;

    // Unwrap { data: {...} } or { session: {...} }
    const root =
      rawObject.session ||
      rawObject.data ||
      rawObject;

    if (!root || typeof root !== 'object') return null;

    const r = root as Record<string, unknown>;

    const question =
      typeof r.question === 'string'
        ? r.question
        : typeof r.topic === 'string'
        ? r.topic
        : payload.question;

    const totalRounds =
      typeof r.totalRounds === 'number'
        ? r.totalRounds
        : typeof r.total_rounds === 'number'
        ? r.total_rounds
        : typeof r.rounds === 'number'
        ? r.rounds
        : payload.rounds;

    const currentRound =
      typeof r.currentRound === 'number'
        ? r.currentRound
        : typeof r.current_round === 'number'
        ? r.current_round
        : totalRounds;

    // -------------------------------------------------------------------------
    // Get transcript from any supported backend shape
    // -------------------------------------------------------------------------

    const transcriptRaw =
      Array.isArray(r.transcript)
        ? r.transcript
        : Array.isArray(r.debate_history)
        ? r.debate_history
        : Array.isArray(r.debateHistory)
        ? r.debateHistory
        : null;

    if (!transcriptRaw) {
      return null;
    }

    // -------------------------------------------------------------------------
    // Convert backend debate history to frontend transcript
    // -------------------------------------------------------------------------

    const transcript: DebateTurn[] = transcriptRaw.map(
      (tRaw, idx): DebateTurn => {
        if (!tRaw || typeof tRaw !== 'object') {
          return {
            id: `turn-${idx + 1}`,
            round: 1,
            agentRole: 'pro',
            agentName: 'Agent',
            kind: 'argument',
            title: `Turn #${idx + 1}`,
            content: String(tRaw),
            timestamp: new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })
          };
        }

        const t = tRaw as Record<string, unknown>;

        const rawPosition = String(
          t.position ||
            t.agentRole ||
            t.agent_role ||
            ''
        ).toLowerCase();

        const rawAgentName = String(
          t.agent ||
            t.agentName ||
            t.agent_name ||
            ''
        );

        let role: AgentRole = 'pro';

        if (
          rawPosition === 'against' ||
          rawPosition === 'con' ||
          rawPosition.includes('against')
        ) {
          role = 'con';
        } else if (
          rawPosition === 'for' ||
          rawPosition === 'pro' ||
          rawPosition.includes('for')
        ) {
          role = 'pro';
        } else if (rawAgentName.toLowerCase().includes('sarah')) {
          role = 'con';
        } else if (rawAgentName.toLowerCase().includes('judge')) {
          role = 'judge';
        } else if (rawAgentName.toLowerCase().includes('moderator')) {
          role = 'moderator';
        }

        const content = String(
          t.argument ||
            t.content ||
            t.response ||
            ''
        );

        const round =
          typeof t.round === 'number'
            ? t.round
            : 1;

        const agentName =
          rawAgentName ||
          (role === 'pro'
            ? 'Dr. Alex Chen'
            : role === 'con'
            ? 'Prof. Sarah Martinez'
            : role === 'moderator'
            ? 'Moderator'
            : 'Judge');

        const toolArray = Array.isArray(t.toolCalls)
          ? (t.toolCalls as unknown[])
          : Array.isArray(t.tool_calls)
          ? (t.tool_calls as unknown[])
          : null;

        const rawTool =
          t.toolCall ||
          t.tool_call ||
          (toolArray && toolArray.length > 0
            ? toolArray[0]
            : null);

        let toolCall: DebateTurnToolCall | undefined;

        if (rawTool && typeof rawTool === 'object') {
          const tc = rawTool as Record<string, unknown>;

          const rawStatus = String(
            tc.status || 'success'
          ).toLowerCase();

          const status: DebateTurnToolCall['status'] =
            rawStatus === 'running' || rawStatus === 'error'
              ? rawStatus
              : 'success';

          let sources:
            | DebateTurnToolSource[]
            | undefined;

          const rawSources =
            tc.sources || tc.results;

          if (Array.isArray(rawSources)) {
            sources = rawSources.map(
              (s): DebateTurnToolSource => {
                if (typeof s === 'string') {
                  return { title: s };
                }

                if (s && typeof s === 'object') {
                  const src =
                    s as Record<string, unknown>;

                  return {
                    title:
                      typeof src.title === 'string'
                        ? src.title
                        : undefined,
                    url:
                      typeof src.url === 'string'
                        ? src.url
                        : undefined,
                    snippet:
                      typeof src.snippet === 'string'
                        ? src.snippet
                        : typeof src.content === 'string'
                        ? src.content
                        : undefined
                  };
                }

                return {
                  title: String(s)
                };
              }
            );
          }

          toolCall = {
            name: String(
              tc.name ||
                tc.tool_name ||
                tc.tool ||
                'tool'
            ),
            query:
              typeof tc.query === 'string'
                ? tc.query
                : typeof tc.input === 'string'
                ? tc.input
                : undefined,
            status,
            sources,
            error:
              typeof tc.error === 'string'
                ? tc.error
                : typeof tc.error_message === 'string'
                ? tc.error_message
                : undefined
          };
        }

        const keyPointsList =
          Array.isArray(t.keyPoints)
            ? (t.keyPoints as string[])
            : Array.isArray(t.key_points)
            ? (t.key_points as string[])
            : undefined;

        return {
          id: String(
            t.id || `turn-${idx + 1}`
          ),
          round,
          agentRole: role,
          agentName,
          kind: 'argument' as TurnKind,
          title:
            typeof t.title === 'string'
              ? t.title
              : `${role === 'pro' ? 'FOR' : role === 'con' ? 'AGAINST' : 'Agent'} · Round ${round}`,
          content,
          keyPoints: keyPointsList,
          targetedAgent:
            (t.targetedAgent ||
              t.targeted_agent) as
              | 'pro'
              | 'con'
              | 'both'
              | undefined,
          timestamp:
            typeof t.timestamp === 'string'
              ? t.timestamp
              : new Date().toISOString(),
          toolCall
        };
      }
    );

    // -------------------------------------------------------------------------
    // Backend Judge evaluation is currently plain text.
    // Add it as a Judge turn so the real evaluation is visible.
    // -------------------------------------------------------------------------

    const evaluation =
      typeof r.evaluation === 'string'
        ? r.evaluation.trim()
        : '';

    if (evaluation) {
      transcript.push({
        id: `judge-${Date.now()}`,
        round: totalRounds,
        agentRole: 'judge',
        agentName: 'AI Judge',
        kind: 'judge_verdict',
        title: 'AI Judge Evaluation',
        content: evaluation,
        timestamp: new Date().toISOString()
      });
    }

    // -------------------------------------------------------------------------
    // Parse a Winner from the judge text when possible.
    // Backend currently returns free-form judge text, not a structured object.
    // -------------------------------------------------------------------------

    let verdict: JudgeVerdict | undefined;

    if (evaluation) {
      const winnerMatch = evaluation.match(
        /winner\s*[:\-]\s*(for|against|pro|con)/i
      );

      const forScoreMatch = evaluation.match(
        /for\s+score[\s\S]{0,30}?(\d{1,3})\s*(?:\/\s*100|out\s+of\s+100)?/i
      );

      const againstScoreMatch = evaluation.match(
        /against\s+score[\s\S]{0,30}?(\d{1,3})\s*(?:\/\s*100|out\s+of\s+100)?/i
      );

      let verdictType: VerdictType = 'Conditional';

      if (winnerMatch) {
        const winner = winnerMatch[1].toLowerCase();

        if (winner === 'for' || winner === 'pro') {
          verdictType = 'Yes';
        } else if (
          winner === 'against' ||
          winner === 'con'
        ) {
          verdictType = 'No';
        }
      }

      const forScore = forScoreMatch
        ? Number(forScoreMatch[1])
        : undefined;

      const againstScore = againstScoreMatch
        ? Number(againstScoreMatch[1])
        : undefined;

      const knownScores = [
        forScore,
        againstScore
      ].filter(
        (value): value is number =>
          typeof value === 'number' &&
          Number.isFinite(value)
      );

      const confidence =
        knownScores.length > 0
          ? Math.max(...knownScores)
          : 0;

      verdict = {
        verdict: verdictType,
        confidence,
        summary: evaluation,
        decidingFactors: [],
        risks: [],
        reasoning: evaluation,
        actionableRecommendations: [],
        voteBreakdown:
          typeof forScore === 'number' &&
          typeof againstScore === 'number'
            ? {
                proStrength: forScore,
                conStrength: againstScore
              }
            : undefined
      };
    }

    const sessionStatus: DebateSession['status'] =
      evaluation || transcript.length > 0
        ? 'completed'
        : 'debating';

    return {
      id: String(
        r.id ||
          `backend-debate-${Date.now()}`
      ),
      question,
      backgroundContext:
        typeof r.backgroundContext === 'string'
          ? r.backgroundContext
          : typeof r.background_context === 'string'
          ? r.background_context
          : payload.context,
      decisionCriteria:
        typeof r.decisionCriteria === 'string'
          ? r.decisionCriteria
          : typeof r.decision_criteria === 'string'
          ? r.decision_criteria
          : payload.criteria,
      totalRounds,
      currentRound,
      status: sessionStatus,
      currentTurnIndex: transcript.length,
      transcript,
      verdict,
      createdAt:
        typeof r.createdAt === 'string'
          ? r.createdAt
          : typeof r.created_at === 'string'
          ? r.created_at
          : new Date().toISOString(),
      isDemo: false
    };
  }
}

export const realBackendDebateService =
  new RealBackendDebateService();
