import { describe, expect, it } from 'vitest'
import {
  businesses,
  collectives,
  contributions,
  entrepreneurs,
  loans,
  payments,
  riskEvents,
} from '../data/mockData'
import { calculateRiskScore } from './riskService'

describe('riskService', () => {
  it('detecta sinais coletivos antes da inadimplencia consolidada', () => {
    const collective = collectives[0]
    const members = entrepreneurs.filter((person) => collective.memberIds.includes(person.id))

    const result = calculateRiskScore({
      collective,
      members,
      businesses,
      contributions,
      loans,
      payments,
      events: riskEvents,
    })

    expect(result.score).toBeGreaterThan(40)
    expect(result.signals.map((signal) => signal.type)).toContain('contribuicao_atrasada')
    expect(result.preventiveActions.length).toBeGreaterThan(0)
  })
})
