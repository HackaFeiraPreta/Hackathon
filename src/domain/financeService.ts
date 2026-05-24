import type { CashFlowMonth, Collective, Contribution, Loan, Payment } from './models'
import { monthKey, monthLabel } from './utils'

function ensureMonth(map: Map<string, CashFlowMonth>, key: string) {
  if (!map.has(key)) {
    map.set(key, {
      month: monthLabel(key),
      contributions: 0,
      loansIssued: 0,
      repayments: 0,
      interestReturned: 0,
      platformFee: 0,
      balance: 0,
    })
  }

  return map.get(key)!
}

export function calculateCashFlow(params: {
  collective: Collective
  contributions: Contribution[]
  loans: Loan[]
  payments: Payment[]
}) {
  const { collective, contributions, loans, payments } = params
  const months = new Map<string, CashFlowMonth>()

  contributions
    .filter((item) => item.collectiveId === collective.id && item.status === 'paga' && item.paidAt)
    .forEach((item) => {
      const entry = ensureMonth(months, monthKey(item.paidAt!))
      entry.contributions += item.amount
    })

  loans
    .filter((loan) => loan.collectiveId === collective.id)
    .forEach((loan) => {
      const entry = ensureMonth(months, monthKey(loan.issuedAt))
      entry.loansIssued += loan.principal
    })

  payments.forEach((payment) => {
    const loan = loans.find((item) => item.id === payment.loanId)
    if (!loan || loan.collectiveId !== collective.id) return

    const entry = ensureMonth(months, monthKey(payment.paidAt))
    if (payment.kind === 'juros') {
      const platformFee = payment.amount * 0.1
      entry.interestReturned += payment.amount - platformFee
      entry.platformFee += platformFee
    } else {
      entry.repayments += payment.amount
    }
  })

  const ordered = [...months.entries()].sort(([a], [b]) => a.localeCompare(b))
  let balance = 0
  const cashFlow = ordered.map(([, entry]) => {
    balance += entry.contributions + entry.repayments + entry.interestReturned - entry.loansIssued
    return {
      ...entry,
      balance,
    }
  })

  const totals = cashFlow.reduce(
    (acc, entry) => ({
      contributions: acc.contributions + entry.contributions,
      loansIssued: acc.loansIssued + entry.loansIssued,
      repayments: acc.repayments + entry.repayments,
      interestReturned: acc.interestReturned + entry.interestReturned,
      platformFee: acc.platformFee + entry.platformFee,
      balance: entry.balance,
    }),
    {
      contributions: 0,
      loansIssued: 0,
      repayments: 0,
      interestReturned: 0,
      platformFee: 0,
      balance: 0,
    },
  )

  const nextMonthProjection =
    collective.memberIds.length * collective.monthlyContribution +
    Math.max(0, totals.repayments * 0.08) +
    Math.max(0, totals.interestReturned * 0.2)

  return {
    months: cashFlow,
    totals,
    nextMonthProjection,
  }
}
