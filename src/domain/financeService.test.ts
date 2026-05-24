import { describe, expect, it } from 'vitest'
import { collectives, contributions, loans, payments } from '../data/mockData'
import { calculateCashFlow } from './financeService'

describe('financeService', () => {
  it('calcula contribuicoes, juros retornados e taxa da plataforma', () => {
    const result = calculateCashFlow({
      collective: collectives[0],
      contributions,
      loans,
      payments,
    })

    expect(result.months.length).toBeGreaterThanOrEqual(3)
    expect(result.totals.contributions).toBeGreaterThan(0)
    expect(result.totals.interestReturned).toBe(27)
    expect(result.totals.platformFee).toBe(3)
  })
})
