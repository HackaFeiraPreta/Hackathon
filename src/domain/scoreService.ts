import type { ResilienceScore, RiskScore } from './models'
import { clamp } from './utils'

export function calculateCollectiveHealthScore(resilience: ResilienceScore, risk: RiskScore) {
  return Math.round(clamp(resilience.score * 0.6 + (100 - risk.score) * 0.4))
}
