import type {
  Business,
  Entrepreneur,
  LearningLesson,
  LearningLevel,
  LearningPath,
  MeiChecklistStep,
  PersonalizedLesson,
} from './models'
import { clamp } from './utils'

const levelOrder: Record<LearningLevel, number> = {
  basico: 1,
  intermediario: 2,
  avancado: 3,
}

const levelTitles: Record<LearningLevel, string> = {
  basico: 'Começar do jeito certo',
  intermediario: 'Organizar e vender melhor',
  avancado: 'Crescer com credito e parceria',
}

const stageLabels: Record<Entrepreneur['formalizationStage'], string> = {
  informal: 'Ainda informal',
  mei_em_preparo: 'Preparando MEI',
  mei: 'MEI ativo',
  formalizada: 'Formalizada',
}

const stageProgress: Record<Entrepreneur['formalizationStage'], number> = {
  informal: 18,
  mei_em_preparo: 38,
  mei: 66,
  formalizada: 84,
}

function scoreLesson(lesson: LearningLesson, entrepreneur: Entrepreneur, business?: Business) {
  let score = 0
  const reasons: string[] = []

  if (lesson.recommendedForStages.includes(entrepreneur.formalizationStage)) {
    score += 42
    reasons.push('combina com seu momento')
  }

  if (lesson.businessTypeTags.includes('todos') || lesson.businessTypeTags.includes(entrepreneur.businessType)) {
    score += 10
  }

  if (
    ['informal', 'mei_em_preparo'].includes(entrepreneur.formalizationStage) &&
    lesson.tags.some((tag) => ['mei', 'formalizacao', 'govbr'].includes(tag))
  ) {
    score += 28
    reasons.push('ajuda a abrir MEI')
  }

  if (entrepreneur.incomeStability < 70 && lesson.tags.some((tag) => ['caixa', 'preco'].includes(tag))) {
    score += 18
    reasons.push('fortalece o caixa')
  }

  if (entrepreneur.paymentRegularity < 72 && lesson.tags.some((tag) => ['das', 'regularidade', 'caixa'].includes(tag))) {
    score += 14
    reasons.push('evita atraso')
  }

  if (business && business.activityTrend < 0 && lesson.tags.some((tag) => ['vendas', 'preco', 'credito'].includes(tag))) {
    score += 12
    reasons.push('responde à queda de movimento')
  }

  if (entrepreneur.formalizationStage === 'formalizada' && lesson.level === 'avancado') {
    score += 20
    reasons.push('prepara crescimento')
  }

  return {
    score: clamp(score),
    reason: reasons.length ? reasons.join(', ') : 'bom reforço para o negócio',
  }
}

function nextActionFor(entrepreneur: Entrepreneur) {
  if (entrepreneur.formalizationStage === 'informal') {
    return 'Separar CPF, endereço, título de eleitor ou recibo do IR e assistir ao passo a passo do MEI.'
  }

  if (entrepreneur.formalizationStage === 'mei_em_preparo') {
    return 'Conferir a atividade permitida, abrir o Portal do Empreendedor e salvar o certificado MEI.'
  }

  if (entrepreneur.formalizationStage === 'mei') {
    return 'Manter o DAS em dia, organizar comprovantes e aprender quando emitir nota fiscal.'
  }

  return 'Preparar histórico financeiro para acessar crédito maior e negociar com clientes ou fornecedores.'
}

function buildMeiChecklist(entrepreneur: Entrepreneur): MeiChecklistStep[] {
  const isMei = ['mei', 'formalizada'].includes(entrepreneur.formalizationStage)
  const isPreparing = entrepreneur.formalizationStage === 'mei_em_preparo'

  return [
    {
      id: 'docs',
      title: 'Separar documentos',
      detail: 'CPF, endereço, telefone, e-mail e acesso gov.br.',
      completed: isPreparing || isMei,
    },
    {
      id: 'atividade',
      title: 'Escolher atividade',
      detail: 'Conferir qual ocupação MEI parece com o seu negócio.',
      completed: isPreparing || isMei,
    },
    {
      id: 'portal',
      title: 'Abrir no Portal do Empreendedor',
      detail: 'Entrar com gov.br e preencher os dados com calma.',
      completed: isMei,
    },
    {
      id: 'ccmei',
      title: 'Salvar o certificado',
      detail: 'Baixar o CCMEI, que é o documento do MEI.',
      completed: isMei,
    },
    {
      id: 'das',
      title: 'Pagar o DAS mensal',
      detail: 'Gerar o boleto todo mês e guardar o comprovante.',
      completed: entrepreneur.formalizationStage === 'formalizada',
    },
  ]
}

export function buildLearningPath(params: {
  entrepreneur: Entrepreneur
  business?: Business
  lessons: LearningLesson[]
}): LearningPath {
  const { entrepreneur, business, lessons } = params
  const scored = lessons
    .map((lesson) => {
      const result = scoreLesson(lesson, entrepreneur, business)
      return {
        ...lesson,
        relevanceScore: result.score,
        recommendedReason: result.reason,
        isNext: false,
      }
    })
    .sort((a, b) => {
      if (b.relevanceScore !== a.relevanceScore) return b.relevanceScore - a.relevanceScore
      return levelOrder[a.level] - levelOrder[b.level]
    })

  const nextLesson = { ...scored[0], isNext: true }
  const personalizedLessons: PersonalizedLesson[] = scored.map((lesson) =>
    lesson.id === nextLesson.id ? nextLesson : lesson,
  )

  const levels = (['basico', 'intermediario', 'avancado'] as LearningLevel[]).map((level) => ({
    level,
    title: levelTitles[level],
    lessons: personalizedLessons
      .filter((lesson) => lesson.level === level)
      .sort((a, b) => b.relevanceScore - a.relevanceScore),
  }))

  return {
    entrepreneurId: entrepreneur.id,
    headline: `Trilha de ${entrepreneur.fullName.split(' ')[0]}`,
    currentStageLabel: stageLabels[entrepreneur.formalizationStage],
    progressPercent: stageProgress[entrepreneur.formalizationStage],
    nextAction: nextActionFor(entrepreneur),
    focusTags: [
      entrepreneur.businessType,
      entrepreneur.formalizationStage,
      entrepreneur.incomeStability < 70 ? 'reforcar caixa' : 'crescimento',
    ],
    nextLesson,
    levels,
    meiChecklist: buildMeiChecklist(entrepreneur),
  }
}
