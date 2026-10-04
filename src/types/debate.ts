export type AgentRole = 'pro' | 'con' | 'moderator' | 'judge';

export type VerdictType = 'Yes' | 'No' | 'Conditional';

export type TurnKind = 
  | 'argument' 
  | 'moderator_question' 
  | 'round_summary' 
  | 'judge_verdict';

export interface DebateTurnToolSource {
  title?: string;
  url?: string;
  snippet?: string;
}

export interface DebateTurnToolCall {
  name: string;
  query?: string;
  status: 'running' | 'success' | 'error';
  sources?: DebateTurnToolSource[];
  error?: string;
}

export interface DebateTurn {
  id: string;
  round: number;
  agentRole: AgentRole;
  agentName: string;
  kind: TurnKind;
  title: string;
  content: string;
  keyPoints?: string[];
  targetedAgent?: 'pro' | 'con' | 'both';
  timestamp: string;
  toolCall?: DebateTurnToolCall;
  toolCalls?: DebateTurnToolCall[];
}

export interface JudgeVerdict {
  verdict: VerdictType;
  confidence: number; // 0 to 100
  summary: string;
  decidingFactors: string[];
  risks: string[];
  reasoning: string;
  actionableRecommendations: string[];
  voteBreakdown?: {
    proStrength: number;
    conStrength: number;
  };
}

export interface DebateSession {
  id: string;
  question: string;
  backgroundContext?: string;
  decisionCriteria?: string;
  totalRounds: number;
  currentRound: number;
  status: 'configuring' | 'debating' | 'completed' | 'paused';
  currentTurnIndex: number;
  transcript: DebateTurn[];
  verdict?: JudgeVerdict;
  createdAt: string;
  isDemo: boolean;
}

export interface DebatePreset {
  id: string;
  title: string;
  category: 'Infrastructure' | 'Product' | 'Strategy' | 'Engineering' | 'Security';
  question: string;
  context: string;
  criteria: string;
  rounds: number;
  expectedVerdict: VerdictType;
  confidence: number;
  transcript: DebateTurn[];
  verdict: JudgeVerdict;
}
