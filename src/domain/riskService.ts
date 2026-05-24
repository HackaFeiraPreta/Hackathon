import type {
  Business,
  Collective,
  Contribution,
  Entrepreneur,
  Loan,
  Payment,
  RiskEvent,
  RiskLevel,
  RiskScore,
  RiskSignal,
} from './models'
import { clamp, daysBetween } from './utils'
import { recommendPreventiveActions } from './recommendationService'

const severityWeight: Record<RiskLevel, number> = {
  baixo: 4,
  moderado: 8,
  alto: 13,
  critico: 20,
}

function levelFor(score: number): RiskLevel {
  if (score >= 75) return 'critico'
  if (score >= 50) return 'alto'
  if (score >= 25) return 'moderado'
  return 'baixo'
}

function loanOutstanding(loan: Loan, payments: Payment[]) {
  const paid = payments
    .filter((payment) => payment.loanId === loan.id)
    .reduce((sum, payment) => sum + payment.amount, 0)
  const total = loan.principal * (1 + loan.interestRateMonthly * 2)
  return Math.max(0, total - paid)
}

function signal(
  type: RiskSignal['type'],
  label: string,
  level: RiskLevel,
  affectedCount: number,
  weight: number,
  description: string,
): RiskSignal {
  return { type, label, level, affectedCount, weight, description }
}

export function calculateRiskScore(params: {
  collective: Collective
  members: Entrepreneur[]
  businesses: Business[]
  contributions: Contribution[]
  loans: Loan[]
  payments: Payment[]
  events: RiskEvent[]
  todayIso?: string
}): RiskScore {
  const {
    collective,
    members,
    businesses,
    contributions,
    loans,
    payments,
    events,
    todayIso = '2026-05-24',
  } = params

  const memberIds = new Set(members.map((member) => member.id))
  const collectiveContributions = contributions.filter((item) => item.collectiveId === collective.id)
  const collectiveLoans = loans.filter((loan) => loan.collectiveId === collective.id)
  const collectiveEvents = events.filter((event) => event.collectiveId === collective.id)
  const activeLoans = collectiveLoans.filter((loan) => loan.status !== 'quitado')

  const lateContributions = collectiveContributions.filter(
    (item) => item.status !== 'paga' && new Date(item.dueDate) < new Date(todayIso),
  )
  const lowInteraction = members.filter(
    (member) => daysBetween(member.lastInteractionAt, todayIso) > 18 || member.communityEngagement < 48,
  )
  const activityDrop = businesses.filter(
    (business) => memberIds.has(business.ownerId) && business.activityTrend <= -18,
  )
  const overdueLoans = activeLoans.filter((loan) => new Date(loan.dueDate) < new Date(todayIso))

  const outstandingByBorrower = activeLoans.reduce<Record<string, number>>((acc, loan) => {
    acc[loan.borrowerId] = (acc[loan.borrowerId] ?? 0) + loanOutstanding(loan, payments)
    return acc
  }, {})
  const totalOutstanding = Object.values(outstandingByBorrower).reduce((sum, value) => sum + value, 0)
  const largestBorrowerShare = totalOutstanding
    ? Math.max(...Object.values(outstandingByBorrower)) / totalOutstanding
    : 0

  const eventWeight = collectiveEvents.reduce((sum, event) => sum + severityWeight[event.severity], 0)
  const fundPressure = totalOutstanding > collective.fundBalance * 1.1

  const signals: RiskSignal[] = []

  if (lateContributions.length) {
    signals.push(
      signal(
        'contribuicao_atrasada',
        'Atraso em contribuicao',
        lateContributions.length >= 3 ? 'alto' : 'moderado',
        lateContributions.length,
        Math.min(22, lateContributions.length * 8),
        `${lateContributions.length} contribuicoes do ciclo ainda nao foram pagas.`,
      ),
    )
  }

  if (activityDrop.length) {
    signals.push(
      signal(
        'queda_atividade',
        'Queda de atividade financeira',
        activityDrop.length >= 3 ? 'alto' : 'moderado',
        activityDrop.length,
        Math.min(20, activityDrop.length * 6),
        `${activityDrop.length} negocios tiveram queda de movimentacao acima de 18%.`,
      ),
    )
  }

  if (lowInteraction.length) {
    signals.push(
      signal(
        'baixa_interacao',
        'Baixa interacao',
        lowInteraction.length >= 4 ? 'alto' : 'moderado',
        lowInteraction.length,
        Math.min(16, lowInteraction.length * 5),
        `${lowInteraction.length} integrantes reduziram presenca no coletivo.`,
      ),
    )
  }

  if (largestBorrowerShare > 0.38) {
    signals.push(
      signal(
        'concentracao_emprestimos',
        'Concentracao de emprestimos',
        largestBorrowerShare > 0.55 ? 'alto' : 'moderado',
        1,
        largestBorrowerShare > 0.55 ? 18 : 10,
        `${Math.round(largestBorrowerShare * 100)}% do saldo em aberto esta concentrado em uma integrante.`,
      ),
    )
  }

  if (overdueLoans.length) {
    signals.push(
      signal(
        'inadimplencia_tendencia',
        'Tendencia de inadimplencia',
        overdueLoans.length >= 2 ? 'critico' : 'alto',
        overdueLoans.length,
        Math.min(30, overdueLoans.length * 15),
        `${overdueLoans.length} emprestimos passaram do prazo de 60 dias.`,
      ),
    )
  }

  if (fundPressure || eventWeight >= 35) {
    signals.push(
      signal(
        'colapso_grupo',
        'Risco de colapso do grupo',
        fundPressure ? 'alto' : 'moderado',
        members.length,
        fundPressure ? 12 : 8,
        'Pressao sobre o fundo exige acao coletiva antes do proximo ciclo.',
      ),
    )
  }

  const score = clamp(
    signals.reduce((sum, item) => sum + item.weight, 0) + Math.min(20, eventWeight),
  )

  return {
    score,
    level: levelFor(score),
    signals: signals.sort((a, b) => b.weight - a.weight),
    preventiveActions: recommendPreventiveActions(signals),
  }
}
