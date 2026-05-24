export type FormalizationStage =
  | 'informal'
  | 'mei_em_preparo'
  | 'mei'
  | 'formalizada'

export type Seasonality = 'baixa' | 'media' | 'alta'

export type Recommendation = 'aprovar' | 'revisar' | 'rejeitar'

export type RiskLevel = 'baixo' | 'moderado' | 'alto' | 'critico'

export type ScoreImpact = 'positivo' | 'negativo' | 'neutro'

export type LearningLevel = 'basico' | 'intermediario' | 'avancado'

export interface Entrepreneur {
  id: string
  fullName: string
  age: number
  region: string
  neighborhood: string
  businessType: string
  incomeStability: number
  paymentRegularity: number
  communityEngagement: number
  seasonality: Seasonality
  monthlyRevenue: number
  formalizationStage: FormalizationStage
  lastInteractionAt: string
  tags: string[]
}

export interface Business {
  id: string
  ownerId: string
  name: string
  category: string
  monthlyRevenue: number
  activityTrend: number
  seasonalityRisk: number
}

export interface Collective {
  id: string
  name: string
  region: string
  monthlyContribution: number
  targetSize: number
  memberIds: string[]
  fundBalance: number
  status: 'formacao' | 'ativo' | 'alerta'
}

export interface Contribution {
  id: string
  collectiveId: string
  userId: string
  amount: number
  dueDate: string
  paidAt?: string
  status: 'paga' | 'pendente' | 'atrasada'
}

export interface Loan {
  id: string
  collectiveId: string
  borrowerId: string
  principal: number
  interestRateMonthly: number
  issuedAt: string
  dueDate: string
  status: 'ativo' | 'quitado' | 'atrasado'
  purpose: string
}

export interface Payment {
  id: string
  loanId: string
  borrowerId: string
  amount: number
  paidAt: string
  kind: 'principal' | 'juros'
}

export interface RiskEvent {
  id: string
  collectiveId: string
  userId?: string
  type:
    | 'contribuicao_atrasada'
    | 'queda_atividade'
    | 'baixa_interacao'
    | 'concentracao_emprestimos'
    | 'inadimplencia_tendencia'
    | 'colapso_grupo'
  severity: RiskLevel
  description: string
  createdAt: string
}

export interface ScoreFactor {
  label: string
  impact: ScoreImpact
  points: number
  detail: string
}

export interface ResilienceScore {
  score: number
  recommendation: Recommendation
  factors: ScoreFactor[]
}

export interface RiskSignal {
  type: RiskEvent['type']
  label: string
  level: RiskLevel
  affectedCount: number
  weight: number
  description: string
}

export interface RiskScore {
  score: number
  level: RiskLevel
  signals: RiskSignal[]
  preventiveActions: string[]
}

export interface CashFlowMonth {
  month: string
  contributions: number
  loansIssued: number
  repayments: number
  interestReturned: number
  platformFee: number
  balance: number
}

export interface LearningLesson {
  id: string
  title: string
  level: LearningLevel
  durationMinutes: number
  videoTitle: string
  videoUrl: string
  sebraeCourseTitle: string
  sebraeCourseUrl: string
  plainLanguageSummary: string
  steps: string[]
  tags: string[]
  recommendedForStages: FormalizationStage[]
  businessTypeTags: string[]
  hasAudioSupport: boolean
}

export interface PersonalizedLesson extends LearningLesson {
  relevanceScore: number
  recommendedReason: string
  isNext: boolean
}

export interface LearningPathLevel {
  level: LearningLevel
  title: string
  lessons: PersonalizedLesson[]
}

export interface MeiChecklistStep {
  id: string
  title: string
  detail: string
  completed: boolean
}

export interface LearningPath {
  entrepreneurId: string
  headline: string
  currentStageLabel: string
  progressPercent: number
  nextAction: string
  focusTags: string[]
  nextLesson: PersonalizedLesson
  levels: LearningPathLevel[]
  meiChecklist: MeiChecklistStep[]
}
