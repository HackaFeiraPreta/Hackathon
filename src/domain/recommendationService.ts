import type { RiskSignal } from './models'

const recommendationsBySignal: Record<RiskSignal['type'], string> = {
  contribuicao_atrasada: 'Abrir renegociacao curta antes do vencimento do proximo ciclo.',
  queda_atividade: 'Oferecer trilha de recomposicao de caixa e compra coletiva de insumos.',
  baixa_interacao: 'Acionar mediadora local para recuperar participacao nas proximas 72 horas.',
  concentracao_emprestimos: 'Pausar novos creditos para a mesma finalidade e redistribuir limite por rodizio.',
  inadimplencia_tendencia: 'Criar plano de pagamento em duas parcelas com acompanhamento comunitario.',
  colapso_grupo: 'Convocar assembleia do coletivo e reduzir temporariamente o teto por emprestimo.',
}

export function recommendPreventiveActions(signals: RiskSignal[]) {
  if (signals.length === 0) {
    return ['Manter ciclo atual e revisar score apos o fechamento do mes.']
  }

  return signals
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 4)
    .map((signal) => recommendationsBySignal[signal.type])
}
