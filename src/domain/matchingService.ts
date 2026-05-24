import type {
  Business,
  Entrepreneur,
  Recommendation,
  ResilienceScore,
  ScoreFactor,
} from './models'
import { average, clamp, uniqueCount } from './utils'

function recommendationFor(score: number): Recommendation {
  if (score >= 75) return 'aprovar'
  if (score >= 55) return 'revisar'
  return 'rejeitar'
}

function diversityScore(uniqueItems: number, total: number, expectedVariety: number) {
  if (total <= 1) return 0
  return clamp((uniqueItems / Math.min(total, expectedVariety)) * 100)
}

function seasonalityBalance(group: Entrepreneur[]) {
  const highSeasonality = group.filter((person) => person.seasonality === 'alta').length
  const mediumSeasonality = group.filter((person) => person.seasonality === 'media').length
  const highShare = highSeasonality / Math.max(group.length, 1)
  const mediumShare = mediumSeasonality / Math.max(group.length, 1)

  return clamp(100 - highShare * 72 - mediumShare * 18)
}

export function calculateResilienceScore(
  group: Entrepreneur[],
  businesses: Business[],
): ResilienceScore {
  const businessMap = new Map(businesses.map((business) => [business.ownerId, business]))
  const memberBusinesses = group.flatMap((member) => {
    const business = businessMap.get(member.id)
    return business ? [business] : []
  })

  const businessMix = diversityScore(uniqueCount(group.map((member) => member.businessType)), group.length, 7)
  const territoryMix = diversityScore(uniqueCount(group.map((member) => member.neighborhood)), group.length, 5)
  const incomeStability = average(group.map((member) => member.incomeStability))
  const paymentRegularity = average(group.map((member) => member.paymentRegularity))
  const engagement = average(group.map((member) => member.communityEngagement))
  const activityTrend = clamp(average(memberBusinesses.map((business) => business.activityTrend)) + 70)
  const seasonality = seasonalityBalance(group)

  const factorWeights = {
    businessMix: 0.17,
    territoryMix: 0.1,
    incomeStability: 0.18,
    paymentRegularity: 0.22,
    engagement: 0.16,
    activityTrend: 0.09,
    seasonality: 0.08,
  }

  const score = Math.round(
    businessMix * factorWeights.businessMix +
      territoryMix * factorWeights.territoryMix +
      incomeStability * factorWeights.incomeStability +
      paymentRegularity * factorWeights.paymentRegularity +
      engagement * factorWeights.engagement +
      activityTrend * factorWeights.activityTrend +
      seasonality * factorWeights.seasonality,
  )

  const factors: ScoreFactor[] = [
    {
      label: 'Diversidade de negocios',
      impact: businessMix >= 75 ? 'positivo' : 'negativo',
      points: Math.round(businessMix * factorWeights.businessMix),
      detail: `${uniqueCount(group.map((member) => member.businessType))} categorias reduzem risco de choque setorial.`,
    },
    {
      label: 'Territorios complementares',
      impact: territoryMix >= 70 ? 'positivo' : 'neutro',
      points: Math.round(territoryMix * factorWeights.territoryMix),
      detail: `${uniqueCount(group.map((member) => member.neighborhood))} bairros no mesmo coletivo.`,
    },
    {
      label: 'Regularidade de pagamento',
      impact: paymentRegularity >= 72 ? 'positivo' : 'negativo',
      points: Math.round(paymentRegularity * factorWeights.paymentRegularity),
      detail: `Media do grupo em ${Math.round(paymentRegularity)} de 100.`,
    },
    {
      label: 'Engajamento comunitario',
      impact: engagement >= 68 ? 'positivo' : 'negativo',
      points: Math.round(engagement * factorWeights.engagement),
      detail: `Participacao media em ${Math.round(engagement)} de 100.`,
    },
    {
      label: 'Sazonalidade balanceada',
      impact: seasonality >= 74 ? 'positivo' : 'negativo',
      points: Math.round(seasonality * factorWeights.seasonality),
      detail: 'Evita que muitas rendas caiam no mesmo periodo.',
    },
  ]

  return {
    score: clamp(score),
    recommendation: recommendationFor(score),
    factors,
  }
}

export function suggestCommunityGroup(
  candidates: Entrepreneur[],
  businesses: Business[],
  targetSize: number,
) {
  const selected: Entrepreneur[] = []
  const ordered = [...candidates].sort((a, b) => {
    const scoreA = a.paymentRegularity + a.incomeStability + a.communityEngagement
    const scoreB = b.paymentRegularity + b.incomeStability + b.communityEngagement
    return scoreB - scoreA
  })

  for (const candidate of ordered) {
    if (selected.length >= targetSize) break

    const sameBusinessType = selected.filter((member) => member.businessType === candidate.businessType).length
    const sameNeighborhood = selected.filter((member) => member.neighborhood === candidate.neighborhood).length
    const highSeasonalityCount = selected.filter((member) => member.seasonality === 'alta').length

    const keepsDiversity = sameBusinessType < 3 && sameNeighborhood < 4
    const keepsSeasonality = candidate.seasonality !== 'alta' || highSeasonalityCount < Math.ceil(targetSize * 0.25)

    if (keepsDiversity && keepsSeasonality) {
      selected.push(candidate)
    }
  }

  for (const candidate of ordered) {
    if (selected.length >= targetSize) break
    if (!selected.some((member) => member.id === candidate.id)) selected.push(candidate)
  }

  return {
    members: selected,
    resilience: calculateResilienceScore(selected, businesses),
  }
}
