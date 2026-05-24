import { describe, expect, it } from 'vitest'
import { businesses, entrepreneurs } from '../data/mockData'
import { calculateResilienceScore, suggestCommunityGroup } from './matchingService'

describe('matchingService', () => {
  it('calcula score de resiliencia com recomendacao acionavel', () => {
    const group = entrepreneurs.slice(0, 15)
    const result = calculateResilienceScore(group, businesses)

    expect(result.score).toBeGreaterThan(60)
    expect(['aprovar', 'revisar', 'rejeitar']).toContain(result.recommendation)
    expect(result.factors.length).toBeGreaterThanOrEqual(4)
  })

  it('sugere grupo respeitando tamanho alvo', () => {
    const result = suggestCommunityGroup(entrepreneurs, businesses, 10)

    expect(result.members).toHaveLength(10)
    expect(result.resilience.score).toBeGreaterThan(50)
  })
})
