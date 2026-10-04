import { DebatePreset, DebateSession, DebateTurn, JudgeVerdict, VerdictType } from '../types/debate';
import { DEMO_PRESETS } from '../data/demoDebates';
import { IDebateService, StartDebatePayload } from './debateService.types';

const STORAGE_KEY = 'debatedesk_sessions_v1';

class MockDebateService implements IDebateService {
  private sessions: Map<string, DebateSession> = new Map();
  private activeStreams: Map<string, { intervalId?: number; timeoutId?: number }> = new Map();

  constructor() {
    this.loadFromStorage();
    // Seed with demo presets if empty
    if (this.sessions.size === 0) {
      DEMO_PRESETS.forEach(preset => {
        const session: DebateSession = {
          id: preset.id,
          question: preset.question,
          backgroundContext: preset.context,
          decisionCriteria: preset.criteria,
          totalRounds: preset.rounds,
          currentRound: preset.rounds,
          status: 'completed',
          currentTurnIndex: preset.transcript.length,
          transcript: preset.transcript,
          verdict: preset.verdict,
          createdAt: new Date(Date.now() - 3600000 * 24 * (preset.id === 'rust-microservices' ? 1 : preset.id === 'soc2-launch' ? 3 : 5)).toISOString(),
          isDemo: true,
        };
        this.sessions.set(session.id, session);
      });
      this.saveToStorage();
    }
  }

  private loadFromStorage() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed: DebateSession[] = JSON.parse(data);
        parsed.forEach(s => this.sessions.set(s.id, s));
      }
    } catch {
      // storage unavailable or parse error, fallback to memory
    }
  }

  private saveToStorage() {
    try {
      const array = Array.from(this.sessions.values());
      localStorage.setItem(STORAGE_KEY, JSON.stringify(array));
    } catch {
      // ignore storage error
    }
  }

  public getAllSessions(): DebateSession[] {
    return Array.from(this.sessions.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getSession(id: string): DebateSession | null {
    const existing = this.sessions.get(id);
    if (existing) return existing;
    
    // Fallback: check if id matches a preset
    const preset = this.getPresetById(id);
    if (preset) {
      const session: DebateSession = {
        id: preset.id,
        question: preset.question,
        backgroundContext: preset.context,
        decisionCriteria: preset.criteria,
        totalRounds: preset.rounds,
        currentRound: preset.rounds,
        status: 'completed',
        currentTurnIndex: preset.transcript.length,
        transcript: [...preset.transcript],
        verdict: { ...preset.verdict },
        createdAt: new Date().toISOString(),
        isDemo: true,
      };
      (session as any)._plannedTurns = preset.transcript;
      (session as any)._plannedVerdict = preset.verdict;
      this.sessions.set(session.id, session);
      this.saveToStorage();
      return session;
    }
    return null;
  }

  public getPresetById(id: string): DebatePreset | undefined {
    return DEMO_PRESETS.find(p => p.id === id);
  }

  public getPresets(): DebatePreset[] {
    return DEMO_PRESETS;
  }

  /**
   * Typed startDebate implementation satisfying IDebateService
   */
  public async startDebate(payload: StartDebatePayload): Promise<DebateSession> {
    return Promise.resolve(this.createSession(payload));
  }

  /**
   * Create a new debate session either from an existing preset or custom user query
   */
  public createSession(params: {
    question: string;
    context?: string;
    criteria?: string;
    rounds: number;
    presetId?: string;
  }): DebateSession {
    const id = params.presetId || `debate-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    
    // Check if it matches a preset
    const preset = params.presetId ? this.getPresetById(params.presetId) : undefined;

    let fullTranscript: DebateTurn[] = [];
    let finalVerdict: JudgeVerdict;

    // Use pre-baked preset only if question and round count exactly match the preset
    if (preset && params.rounds === preset.rounds && params.question.trim().toLowerCase() === preset.question.trim().toLowerCase()) {
      fullTranscript = [...preset.transcript];
      finalVerdict = { ...preset.verdict };
    } else {
      // Dynamically synthesize a multi-round debate tailored to the question and exact selected round count
      const generated = this.generateCustomDebate(params.question, params.context, params.criteria, params.rounds);
      fullTranscript = generated.transcript;
      finalVerdict = generated.verdict;
    }

    const session: DebateSession = {
      id,
      question: params.question,
      backgroundContext: params.context,
      decisionCriteria: params.criteria,
      totalRounds: params.rounds,
      currentRound: 1,
      status: 'debating',
      currentTurnIndex: 0,
      transcript: [], // will be populated as turns happen
      verdict: undefined,
      createdAt: new Date().toISOString(),
      isDemo: true,
    };

    // Store planned turns in a temporary metadata property
    (session as any)._plannedTurns = fullTranscript;
    (session as any)._plannedVerdict = finalVerdict;

    this.sessions.set(session.id, session);
    this.saveToStorage();
    return session;
  }

  /**
   * Fast-forward a session immediately to completion
   */
  public fastForwardToVerdict(sessionId: string): DebateSession | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    const plannedTurns: DebateTurn[] = (session as any)._plannedTurns || session.transcript;
    const plannedVerdict: JudgeVerdict = (session as any)._plannedVerdict || session.verdict;

    session.transcript = [...plannedTurns];
    session.verdict = plannedVerdict;
    session.currentRound = session.totalRounds;
    session.currentTurnIndex = plannedTurns.length;
    session.status = 'completed';

    this.stopStream(sessionId);
    this.saveToStorage();
    return session;
  }

  /**
   * Advance one turn manually
   */
  public stepForward(sessionId: string): DebateTurn | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    const plannedTurns: DebateTurn[] = (session as any)._plannedTurns || [];
    if (session.currentTurnIndex >= plannedTurns.length) {
      if (session.status !== 'completed') {
        session.verdict = (session as any)._plannedVerdict;
        session.status = 'completed';
        this.saveToStorage();
      }
      return null;
    }

    const nextTurn = plannedTurns[session.currentTurnIndex];
    session.transcript.push(nextTurn);
    session.currentTurnIndex++;
    session.currentRound = nextTurn.round;

    if (session.currentTurnIndex >= plannedTurns.length) {
      session.verdict = (session as any)._plannedVerdict;
      session.status = 'completed';
    }

    this.saveToStorage();
    return nextTurn;
  }

  /**
   * Pause or resume automated streaming
   */
  public togglePause(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session || session.status === 'completed') return false;

    if (session.status === 'paused') {
      session.status = 'debating';
      this.saveToStorage();
      return false; // is not paused
    } else {
      session.status = 'paused';
      this.saveToStorage();
      return true; // is paused
    }
  }

  /**
   * Subscribe to real-time animated streaming of turns
   */
  public subscribeToSession(
    sessionId: string,
    onTurn: (turn: DebateTurn) => void,
    onVerdict: (verdict: JudgeVerdict) => void,
    onError: (err: Error) => void
  ): () => void {
    const session = this.sessions.get(sessionId);
    if (!session) {
      onError(new Error('Session not found'));
      return () => {};
    }

    // If already completed, deliver all turns immediately
    if (session.status === 'completed') {
      session.transcript.forEach(t => onTurn(t));
      if (session.verdict) onVerdict(session.verdict);
      return () => {};
    }

    const plannedTurns: DebateTurn[] = (session as any)._plannedTurns || [];
    const plannedVerdict: JudgeVerdict = (session as any)._plannedVerdict;

    const advance = () => {
      const currentSession = this.sessions.get(sessionId);
      if (!currentSession) return;
      if (currentSession.status === 'paused') {
        return; // wait for next interval
      }

      const curIndex = currentSession.currentTurnIndex;
      if (curIndex < plannedTurns.length) {
        const turn = plannedTurns[curIndex];
        currentSession.transcript.push(turn);
        currentSession.currentTurnIndex = curIndex + 1;
        currentSession.currentRound = turn.round;
        this.saveToStorage();
        onTurn(turn);

        if (currentSession.currentTurnIndex >= plannedTurns.length) {
          // Finish and trigger verdict
          setTimeout(() => {
            currentSession.verdict = plannedVerdict;
            currentSession.status = 'completed';
            this.saveToStorage();
            if (plannedVerdict) {
              onVerdict(plannedVerdict);
            }
            this.stopStream(sessionId);
          }, 1200);
        }
      }
    };

    // Deliver first turn quickly, then every 2.4s
    const firstTimeout = window.setTimeout(advance, 800);
    const interval = window.setInterval(advance, 2600);

    this.activeStreams.set(sessionId, {
      timeoutId: firstTimeout,
      intervalId: interval,
    });

    return () => {
      this.stopStream(sessionId);
    };
  }

  private stopStream(sessionId: string) {
    const stream = this.activeStreams.get(sessionId);
    if (stream) {
      if (stream.timeoutId) clearTimeout(stream.timeoutId);
      if (stream.intervalId) clearInterval(stream.intervalId);
      this.activeStreams.delete(sessionId);
    }
  }

  /**
   * Synthesize a customized debate when user enters an original decision
   */
  private generateCustomDebate(
    question: string,
    context?: string,
    criteria?: string,
    rounds: number = 2
  ): { transcript: DebateTurn[]; verdict: JudgeVerdict } {
    const qLower = question.toLowerCase();
    const isTech = /rust|python|react|rewrite|api|database|cloud|aws|kubernetes|stack|code|ai|model|llm/i.test(qLower);
    const isHireOrWork = /hire|team|work|remote|office|rto|salary|bonus|culture|employee/i.test(qLower);
    
    // Determine plausible outcome
    let verdictType: VerdictType = 'Conditional';
    let confidence = 82;
    if (qLower.includes('rewrite') || qLower.includes('before') || qLower.includes('mandate')) {
      verdictType = Math.random() > 0.5 ? 'Conditional' : 'No';
      confidence = Math.floor(78 + Math.random() * 14);
    } else {
      verdictType = Math.random() > 0.4 ? 'Yes' : 'Conditional';
      confidence = Math.floor(75 + Math.random() * 18);
    }

    const transcript: DebateTurn[] = [];

    for (let r = 1; r <= rounds; r++) {
      // 1. Moderator Question
      transcript.push({
        id: `turn-r${r}-mod-q`,
        round: r,
        agentRole: 'moderator',
        agentName: 'Moderator',
        kind: 'moderator_question',
        title: `Round ${r} Inquisitorial Directive`,
        content: r === 1
          ? `Opening round inquiry on: "${question}". Both agents must isolate the core value thesis versus immediate execution constraints. Pro, establish the primary strategic upside. Con, highlight unaddressed risks.`
          : r === 2
          ? `Round 2 cross-examination: Pro, how do you mitigate the failure modes and resource lock-in outlined by Con? Con, what conditions or pilot safeguards would be required if leadership decides to move forward?`
          : r === 3
          ? `Round 3 stress test: Let us evaluate the worst-case scenario over a 12-month horizon. What are the irreversible commitments, and where are the rollback gates?`
          : `Final round audit: Deliver your closing position and precise decision metrics for the Judge.`,
        targetedAgent: 'both',
        timestamp: `Round ${r} · Turn 1`,
      });

      // 2. Pro Agent
      transcript.push({
        id: `turn-r${r}-pro`,
        round: r,
        agentRole: 'pro',
        agentName: 'Pro Agent',
        kind: 'argument',
        title: r === 1
          ? `Strategic Upside and Long-Term Compounding Value`
          : r === 2
          ? `Targeted Implementation Safeguards and Phased Milestones`
          : r === 3
          ? `Stress-Test Resilience and Worst-Case Containment`
          : `Final Closing Defense and Strategic Alignment`,
        content: r === 1
          ? `Pursuing this initiative directly addresses our core strategic bottlenecks. Taking affirmative action positions us ahead of competitors who hesitate due to inertia. The projected return on investment, operational efficiency gains, and compounding organizational learning substantially outweigh the transition friction.`
          : r === 2
          ? `Con assumes an all-or-nothing rollout. By staging implementation into distinct, measurable validation gates, we cap our downside while preserving the entire upside. We can establish clear stop-loss criteria at day 30, 60, and 90 to ensure team resources are not trapped.`
          : r === 3
          ? `Even under stressed assumptions—such as partial delivery delays or temporary efficiency dips—the baseline floor is protected. The downside risk is bounded, whereas the cost of inaction compounds into permanent technical and competitive debt.`
          : `In summary, the strategic upside decisively outweighs the manageable transition costs. With explicit governance gates and phased adoption, proceeding is the only path that unlocks superior long-term performance.`,
        keyPoints: [
          r === 1 ? 'High strategic alignment with long-term organizational trajectory' : r === 2 ? 'Bounded downside through staged milestone deployments' : r === 3 ? 'Stress-tested downside floor remains commercially viable' : 'Decisive proactive posture prevents compounding competitive debt',
          r === 1 ? 'Measurable efficiency multiplier across primary workflows' : r === 2 ? 'Clear stop-loss criteria at each checkpoint' : r === 3 ? 'Contingency plans absorb potential timeline friction' : 'Comprehensive ROI justifies transitional investment',
          r === 1 ? 'Defensible capabilities created for years to come' : r === 2 ? 'Preserves core roadmap momentum during rollout' : r === 3 ? 'Downside exposure is strictly capped' : 'Actionable implementation roadmap ready for execution'
        ],
        timestamp: `Round ${r} · Turn 2`,
      });

      // 3. Con Agent
      transcript.push({
        id: `turn-r${r}-con`,
        round: r,
        agentRole: 'con',
        agentName: 'Con Agent',
        kind: 'argument',
        title: r === 1
          ? `Hidden Opportunity Costs, Fragility, and Execution Risk`
          : r === 2
          ? `Resource Cannibalization and Fragile Assumptions`
          : r === 3
          ? `Underestimated Second-Order Effects and Reversibility Hurdles`
          : `Final Risk Audit and Irreversible Commitment Warning`,
        content: r === 1
          ? `Pro underestimates the severe operational drag and opportunity cost. While the headline benefit appears enticing, the actual implementation demands cross-functional focus that will inevitably stall higher-priority roadmap deliverables. Furthermore, the underlying assumptions rely on optimistic timelines that rarely hold under real-world constraints.`
          : r === 2
          ? `Staged gates sound reassuring in theory, but organizational inertia makes halting an in-flight project notoriously difficult once political and emotional capital are committed. We risk sinking hundreds of engineering and management hours into a venture that solves a secondary problem.`
          : r === 3
          ? `The decisive factor is reversibility. If this decision turns out to be suboptimal after six months, unwinding the dependencies will cost twice as much as the initial deployment. We must enforce strict pre-conditions before committing.`
          : `In closing, the risks outlined are not theoretical—they represent structural execution traps. Diverting focus at this critical moment threatens core stability. If leadership insists on proceeding, it must only be under the strictest conditional pilot constraints.`,
        keyPoints: [
          r === 1 ? 'Significant opportunity cost diverting key talent from core objectives' : r === 2 ? 'Organizational inertia makes staged exit gates hard to enforce' : r === 3 ? 'High reversibility friction: unwinding will multiply costs' : 'Structural execution traps threaten organizational focus',
          r === 1 ? 'Optimistic delivery assumptions vulnerable to real-world friction' : r === 2 ? 'Risk of sunk-cost escalation after initial investment' : r === 3 ? 'Second-order dependencies compound across downstream teams' : 'Irreversible commitments should be avoided at this stage',
          r === 1 ? 'Secondary problems prioritized over primary bottlenecks' : r === 2 ? 'Resource cannibalization strains existing commitments' : r === 3 ? 'Unwinding complexity far exceeds initial migration scope' : 'Strict conditional constraints are mandatory before any rollout'
        ],

        timestamp: `Round ${r} · Turn 3`,
      });

      // 4. Moderator Summary
      transcript.push({
        id: `turn-r${r}-mod-sum`,
        round: r,
        agentRole: 'moderator',
        agentName: 'Moderator',
        kind: 'round_summary',
        title: `Round ${r} Debate Synthesis`,
        content: `Round ${r} surfaced key trade-offs between strategic ambition and operational realism. Pro successfully articulated long-term compounding benefits, while Con identified substantial opportunity costs and reversibility hurdles. ${r === rounds ? 'Deliberation concluded. Passing full record to Judge for verdict.' : 'Moving to next round.'}`,
        timestamp: `Round ${r} · Summary`,
      });
    }

    const verdict: JudgeVerdict = {
      verdict: verdictType,
      confidence,
      summary: verdictType === 'Yes'
        ? `Approve proceeding with the proposal under structured milestone governance and explicit rollback gates.`
        : verdictType === 'No'
        ? `Do not proceed at this time; the immediate operational and opportunity costs outweigh projected returns.`
        : `Approve on a strictly conditional pilot basis; progress contingent on meeting pre-defined quantitative checkpoints.`,
      decidingFactors: [
        `Analysis of question: "${question.length > 60 ? question.substring(0, 60) + '...' : question}"`,
        verdictType === 'No' 
          ? 'Opportunity cost of diverting core focus is excessively high in current cycle'
          : 'Strategic upside creates defensible advantages if execution risk is strictly bounded',
        'Reversibility analysis demonstrates need for explicit stop-loss criteria',
        criteria ? `Evaluated directly against user criteria: "${criteria}"` : 'Balanced organizational velocity against structural sustainability'
      ],
      risks: [
        'Timeline slippage and resource lock-in during initial transition period',
        'Cross-functional coordination overhead and communication friction',
        'Risk of sunk-cost fallacy preventing timely rollback if metrics lag'
      ],
      reasoning: `Both agents presented rigorous arguments. The Pro agent established compelling long-term strategic necessity, while the Con agent revealed critical blind spots in operational execution and reversibility. The Judge finds that ${
        verdictType === 'Yes'
          ? 'the upside and strategic necessity justify moving forward with deliberate milestone tracking.'
          : verdictType === 'No'
          ? 'the immediate risks and opportunity costs outweigh the projected advantages at this junction.'
          : 'proceeding is only justified under tight, measurable pilot constraints that contain blast radius.'
      }`,
      actionableRecommendations: [
        'Formulate a 45-day evaluation sandbox before making irreversible structural changes.',
        'Define 3 non-negotiable metric thresholds that must be met to trigger subsequent phase rollout.',
        'Designate a dedicated owner accountable for monitoring friction points and rollback criteria.',
        'Schedule a formal post-pilot review with all key stakeholders before broad adoption.'
      ],
      voteBreakdown: {
        proStrength: verdictType === 'Yes' ? 68 : verdictType === 'No' ? 32 : 51,
        conStrength: verdictType === 'Yes' ? 32 : verdictType === 'No' ? 68 : 49,
      }
    };

    return { transcript, verdict };
  }
}

export const mockDebateService = new MockDebateService();
