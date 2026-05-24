import { useMemo, useState } from 'react'
import {
  AlertTriangle,
  BadgeCheck,
  BanknoteArrowUp,
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  CircleDollarSign,
  ClipboardList,
  ExternalLink,
  FileCheck2,
  GraduationCap,
  HandCoins,
  Headphones,
  Landmark,
  LineChart,
  ListChecks,
  PiggyBank,
  PlayCircle,
  Scale,
  ShieldAlert,
  ShieldCheck,
  UserRoundCog,
  Video,
  Users,
  WalletCards,
} from 'lucide-react'
import './App.css'
import { businesses, collectives, contributions, entrepreneurs, loans, payments, riskEvents } from './data/mockData'
import { learningLessons } from './data/learningContent'
import type { Collective, LearningLevel, PersonalizedLesson, Recommendation, RiskLevel, ScoreImpact } from './domain/models'
import { calculateCashFlow } from './domain/financeService'
import { buildLearningPath } from './domain/learningService'
import { calculateResilienceScore, suggestCommunityGroup } from './domain/matchingService'
import { calculateRiskScore } from './domain/riskService'
import { calculateCollectiveHealthScore } from './domain/scoreService'
import { currency, percent } from './domain/utils'

type View = 'visao' | 'trilha' | 'matching' | 'risco' | 'caixa' | 'api'

const navigation = [
  { id: 'visao', label: 'Visão geral', icon: LineChart },
  { id: 'trilha', label: 'Trilha', icon: GraduationCap },
  { id: 'matching', label: 'Matching', icon: Users },
  { id: 'risco', label: 'Risco', icon: ShieldAlert },
  { id: 'caixa', label: 'Fluxo de caixa', icon: WalletCards },
  { id: 'api', label: 'Payloads', icon: ClipboardList },
] satisfies Array<{ id: View; label: string; icon: typeof LineChart }>

const recommendationCopy: Record<Recommendation, string> = {
  aprovar: 'Aprovar',
  revisar: 'Revisar',
  rejeitar: 'Rejeitar',
}

const riskCopy: Record<RiskLevel, string> = {
  baixo: 'Baixo',
  moderado: 'Moderado',
  alto: 'Alto',
  critico: 'Crítico',
}

const impactCopy: Record<ScoreImpact, string> = {
  positivo: 'positivo',
  negativo: 'negativo',
  neutro: 'neutro',
}

const levelCopy: Record<LearningLevel, string> = {
  basico: 'Básico',
  intermediario: 'Intermediário',
  avancado: 'Avançado',
}

function ScoreRing({
  value,
  label,
  tone,
}: {
  value: number
  label: string
  tone: 'resilience' | 'risk' | 'health'
}) {
  return (
    <div className={`score-ring score-ring--${tone}`} style={{ '--score': `${value * 3.6}deg` } as React.CSSProperties}>
      <strong>{value}</strong>
            <span>{label}</span>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof Users
  label: string
  value: string
  detail: string
}) {
  return (
    <article className="stat-card">
      <Icon size={20} aria-hidden="true" />
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{detail}</small>
      </div>
    </article>
  )
}

function RecommendationPill({ value }: { value: Recommendation }) {
  return <span className={`pill pill--${value}`}>{recommendationCopy[value]}</span>
}

function RiskPill({ value }: { value: RiskLevel }) {
  return <span className={`pill pill--risk-${value}`}>{riskCopy[value]}</span>
}

function LevelPill({ value }: { value: LearningLevel }) {
  return <span className={`level-pill level-pill--${value}`}>{levelCopy[value]}</span>
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="progress-bar" aria-label={`Progresso de ${value}%`}>
      <i style={{ width: `${value}%` }} />
    </div>
  )
}

function LessonCard({
  lesson,
  isActive,
  onPlay,
}: {
  lesson: PersonalizedLesson
  isActive: boolean
  onPlay: (lessonId: string) => void
}) {
  return (
    <article className={`lesson-card ${lesson.isNext ? 'lesson-card--next' : ''} ${isActive ? 'lesson-card--active' : ''}`}>
      <div className="lesson-card-header">
        <LevelPill value={lesson.level} />
        <span>
          <Video size={15} aria-hidden="true" />
          {lesson.durationMinutes} min
        </span>
      </div>
      <h3>{lesson.title}</h3>
      <p>{lesson.plainLanguageSummary}</p>
      <ol className="micro-steps">
        {lesson.steps.slice(0, 3).map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      <div className="lesson-reason">
        <BrainCircuit size={15} aria-hidden="true" />
        {lesson.recommendedReason}
      </div>
      <div className="lesson-actions">
        <button type="button" onClick={() => onPlay(lesson.id)}>
          <PlayCircle size={16} aria-hidden="true" />
          Assistir
        </button>
        <button type="button" className="ghost-button" onClick={() => onPlay(lesson.id)}>
          <Headphones size={16} aria-hidden="true" />
          Ouvir
        </button>
        <a href={lesson.sebraeCourseUrl} target="_blank" rel="noreferrer" className="sebrae-link">
          <ExternalLink size={16} aria-hidden="true" />
          Sebrae
        </a>
      </div>
    </article>
  )
}

function Bar({ value, max, label }: { value: number; max: number; label: string }) {
  const width = max === 0 ? 0 : Math.max(8, (value / max) * 100)
  return (
    <div className="bar-row">
      <span>{label}</span>
      <div className="bar-track">
        <i style={{ width: `${width}%` }} />
      </div>
      <strong>{currency(value)}</strong>
    </div>
  )
}

function ApiBlock({ title, children }: { title: string; children: string }) {
  return (
    <article className="api-block">
      <h3>{title}</h3>
      <pre>{children}</pre>
    </article>
  )
}

function App() {
  const [activeView, setActiveView] = useState<View>('visao')
  const [selectedCollectiveId, setSelectedCollectiveId] = useState(collectives[0].id)
  const [selectedLearnerId, setSelectedLearnerId] = useState(entrepreneurs[0].id)
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null)

  const selectedCollective = collectives.find((collective) => collective.id === selectedCollectiveId) as Collective
  const members = entrepreneurs.filter((person) => selectedCollective.memberIds.includes(person.id))
  const selectedLearner = entrepreneurs.find((person) => person.id === selectedLearnerId) ?? entrepreneurs[0]
  const selectedBusiness = businesses.find((business) => business.ownerId === selectedLearner.id)

  const resilience = useMemo(() => calculateResilienceScore(members, businesses), [members])
  const learningPath = useMemo(
    () => buildLearningPath({ entrepreneur: selectedLearner, business: selectedBusiness, lessons: learningLessons }),
    [selectedBusiness, selectedLearner],
  )
  const suggestedGroup = useMemo(
    () => suggestCommunityGroup(entrepreneurs, businesses, selectedCollective.targetSize),
    [selectedCollective.targetSize],
  )
  const risk = useMemo(
    () =>
      calculateRiskScore({
        collective: selectedCollective,
        members,
        businesses,
        contributions,
        loans,
        payments,
        events: riskEvents,
      }),
    [members, selectedCollective],
  )
  const cashFlow = useMemo(
    () => calculateCashFlow({ collective: selectedCollective, contributions, loans, payments }),
    [selectedCollective],
  )
  const healthScore = calculateCollectiveHealthScore(resilience, risk)
  const activeLoans = loans.filter((loan) => loan.collectiveId === selectedCollective.id && loan.status !== 'quitado')
  const totalCredit = loans
    .filter((loan) => loan.collectiveId === selectedCollective.id)
    .reduce((sum, loan) => sum + loan.principal, 0)
  const maxMonthlyValue = Math.max(
    ...cashFlow.months.flatMap((month) => [month.contributions, month.loansIssued, month.repayments]),
  )
  const allLessons = learningPath.levels.flatMap((level) => level.lessons)
  const spotlightLesson = allLessons.find((lesson) => lesson.id === selectedLessonId) ?? learningPath.nextLesson

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">
            <Scale size={22} aria-hidden="true" />
          </div>
          <div>
            <strong>AfroCapital Coletivo</strong>
            <span>crédito comunitário com IA</span>
          </div>
        </div>

        <label className="collective-select">
          <span>Coletivo</span>
          <select value={selectedCollectiveId} onChange={(event) => setSelectedCollectiveId(event.target.value)}>
            {collectives.map((collective) => (
              <option key={collective.id} value={collective.id}>
                {collective.name}
              </option>
            ))}
          </select>
        </label>
      </header>

      <div className="workspace">
        <aside className="sidebar" aria-label="Navegacao principal">
          <nav>
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  className={activeView === item.id ? 'active' : ''}
                  type="button"
                  onClick={() => setActiveView(item.id)}
                >
                  <Icon size={18} aria-hidden="true" />
                  {item.label}
                </button>
              )
            })}
          </nav>

          <section className="side-summary">
            <span>Fundo mensal</span>
            <strong>{currency(selectedCollective.monthlyContribution * selectedCollective.memberIds.length)}</strong>
            <small>
              {selectedCollective.memberIds.length} mulheres x {currency(selectedCollective.monthlyContribution)}
            </small>
          </section>
        </aside>

        <main className="content">
          {activeView === 'visao' && (
            <section className="view-stack">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">Demo operacional</span>
                  <h1>{selectedCollective.name}</h1>
                </div>
                <div className="status-chip">
                  <CheckCircle2 size={16} aria-hidden="true" />
                  dados mockados
                </div>
              </div>

              <div className="stat-grid">
                <StatCard
                  icon={Users}
                  label="Mulheres ativas"
                  value={String(members.length)}
                  detail={`${selectedCollective.targetSize} vagas no desenho ideal`}
                />
                <StatCard icon={PiggyBank} label="Saldo do fundo" value={currency(selectedCollective.fundBalance)} detail="ciclo atual" />
                <StatCard icon={HandCoins} label="Crédito circulando" value={currency(totalCredit)} detail={`${activeLoans.length} empréstimos ativos`} />
                <StatCard icon={Landmark} label="Receita da plataforma" value={currency(cashFlow.totals.platformFee)} detail="10% dos juros pagos" />
              </div>

              <div className="dashboard-grid">
                <article className="panel score-panel">
                  <div className="panel-title">
                    <BrainCircuit size={20} aria-hidden="true" />
                    <h2>Saúde do coletivo</h2>
                  </div>
                  <div className="score-row">
                    <ScoreRing value={healthScore} label="índice" tone="health" />
                    <ScoreRing value={resilience.score} label="resiliência" tone="resilience" />
                    <ScoreRing value={risk.score} label="risco" tone="risk" />
                  </div>
                  <div className="decision-line">
                    <RecommendationPill value={resilience.recommendation} />
                    <RiskPill value={risk.level} />
                  </div>
                </article>

                <article className="panel">
                  <div className="panel-title">
                    <ShieldCheck size={20} aria-hidden="true" />
                    <h2>Ações preventivas</h2>
                  </div>
                  <ul className="action-list">
                    {risk.preventiveActions.map((action) => (
                      <li key={action}>{action}</li>
                    ))}
                  </ul>
                </article>

                <article className="panel wide">
                  <div className="panel-title">
                    <CircleDollarSign size={20} aria-hidden="true" />
                    <h2>Movimento financeiro</h2>
                  </div>
                  <div className="flow-bars">
                    {cashFlow.months.map((month) => (
                      <div className="flow-month" key={month.month}>
                        <span>{month.month}</span>
                        <Bar value={month.contributions} max={maxMonthlyValue} label="Contrib." />
                        <Bar value={month.loansIssued} max={maxMonthlyValue} label="Credito" />
                        <Bar value={month.repayments} max={maxMonthlyValue} label="Retorno" />
                      </div>
                    ))}
                  </div>
                </article>
              </div>
            </section>
          )}

          {activeView === 'trilha' && (
            <section className="view-stack learning-view">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">Trilha personalizada</span>
                  <h1>Aprendizado para o negócio</h1>
                </div>
                <div className="status-chip">
                  <BookOpen size={16} aria-hidden="true" />
                  linguagem simples
                </div>
              </div>

              <div className="learning-top-grid">
                <article className="panel learner-panel">
                  <div className="panel-title">
                    <UserRoundCog size={20} aria-hidden="true" />
                    <h2>Contexto da empreendedora</h2>
                  </div>
                  <label className="learner-select">
                    <span>Aprender como</span>
                    <select value={selectedLearnerId} onChange={(event) => setSelectedLearnerId(event.target.value)}>
                      {members.map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.fullName}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="learner-profile">
                    <strong>{selectedLearner.fullName}</strong>
                    <span>
                      {selectedLearner.businessType} em {selectedLearner.neighborhood}
                    </span>
                  </div>
                  <div className="learning-progress">
                    <div>
                      <span>Etapa atual</span>
                      <strong>{learningPath.currentStageLabel}</strong>
                    </div>
                    <ProgressBar value={learningPath.progressPercent} />
                  </div>
                  <div className="tag-row">
                    {learningPath.focusTags.map((tag) => (
                      <span key={tag}>{tag.replaceAll('_', ' ')}</span>
                    ))}
                  </div>
                </article>

                <article className="panel video-spotlight">
                  <div className="panel-title">
                    <Video size={20} aria-hidden="true" />
                    <h2>Próximo vídeo</h2>
                  </div>
                  <div className="video-preview">
                    <PlayCircle size={56} aria-hidden="true" />
                    <span>{spotlightLesson.durationMinutes} min</span>
                  </div>
                  <LevelPill value={spotlightLesson.level} />
                  <h3>{spotlightLesson.videoTitle}</h3>
                  <p>{spotlightLesson.plainLanguageSummary}</p>
                  <div className="lesson-actions">
                    <button type="button">
                      <PlayCircle size={16} aria-hidden="true" />
                      Assistir aula
                    </button>
                    <button type="button" className="ghost-button">
                      <Headphones size={16} aria-hidden="true" />
                      Ouvir áudio
                    </button>
                    <a href={spotlightLesson.sebraeCourseUrl} target="_blank" rel="noreferrer" className="sebrae-link">
                      <ExternalLink size={16} aria-hidden="true" />
                      Ver no Sebrae
                    </a>
                  </div>
                </article>
              </div>

              <article className="panel next-action-panel">
                <div>
                  <BookOpen size={22} aria-hidden="true" />
                  <strong>Próximo passo recomendado</strong>
                </div>
                <p>{learningPath.nextAction}</p>
              </article>

              <div className="lesson-levels">
                {learningPath.levels.map((levelGroup) => (
                  <section className="learning-level" key={levelGroup.level}>
                    <div className="learning-level-title">
                      <LevelPill value={levelGroup.level} />
                      <strong>{levelGroup.title}</strong>
                    </div>
                    <div className="lesson-grid">
                      {levelGroup.lessons.map((lesson) => (
                        <LessonCard
                          key={lesson.id}
                          lesson={lesson}
                          isActive={lesson.id === spotlightLesson.id}
                          onPlay={setSelectedLessonId}
                        />
                      ))}
                    </div>
                  </section>
                ))}
              </div>

              <article className="panel mei-panel">
                <div className="panel-title">
                  <ListChecks size={20} aria-hidden="true" />
                  <h2>Como fazer um MEI</h2>
                </div>
                <div className="mei-checklist">
                  {learningPath.meiChecklist.map((step) => (
                    <div className={`mei-step ${step.completed ? 'mei-step--done' : ''}`} key={step.id}>
                      <FileCheck2 size={18} aria-hidden="true" />
                      <div>
                        <strong>{step.title}</strong>
                        <span>{step.detail}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            </section>
          )}

          {activeView === 'matching' && (
            <section className="view-stack">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">Motor 1</span>
                  <h1>Matching comunitário</h1>
                </div>
                <RecommendationPill value={suggestedGroup.resilience.recommendation} />
              </div>

              <div className="split-grid">
                <article className="panel">
                  <div className="panel-title">
                    <Users size={20} aria-hidden="true" />
                    <h2>Composição sugerida</h2>
                  </div>
                  <div className="member-list">
                    {suggestedGroup.members.map((member) => (
                      <div className="member-row" key={member.id}>
                        <span>{member.fullName}</span>
                        <strong>{member.businessType}</strong>
                        <small>{member.neighborhood}</small>
                      </div>
                    ))}
                  </div>
                </article>

                <article className="panel">
                  <div className="panel-title">
                    <BadgeCheck size={20} aria-hidden="true" />
                    <h2>Score de resiliência</h2>
                  </div>
                  <div className="single-score">
                    <ScoreRing value={suggestedGroup.resilience.score} label="de 100" tone="resilience" />
                  </div>
                  <div className="factor-list">
                    {suggestedGroup.resilience.factors.map((factor) => (
                      <div className={`factor factor--${factor.impact}`} key={factor.label}>
                        <div>
                          <strong>{factor.label}</strong>
                          <span>{factor.detail}</span>
                        </div>
                        <em>
                          {impactCopy[factor.impact]} +{factor.points}
                        </em>
                      </div>
                    ))}
                  </div>
                </article>
              </div>
            </section>
          )}

          {activeView === 'risco' && (
            <section className="view-stack">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">Motor 2</span>
                  <h1>Monitoramento de risco</h1>
                </div>
                <RiskPill value={risk.level} />
              </div>

              <div className="risk-layout">
                <article className="panel score-panel">
                  <div className="panel-title">
                    <AlertTriangle size={20} aria-hidden="true" />
                    <h2>Alerta atual</h2>
                  </div>
                  <ScoreRing value={risk.score} label="risco" tone="risk" />
                  <p className="quiet">Sinais individuais e coletivos antes da inadimplencia.</p>
                </article>

                <article className="panel wide">
                  <div className="panel-title">
                    <ShieldAlert size={20} aria-hidden="true" />
                    <h2>Sinais detectados</h2>
                  </div>
                  <div className="signal-grid">
                    {risk.signals.map((item) => (
                      <div className="signal" key={item.type}>
                        <RiskPill value={item.level} />
                        <strong>{item.label}</strong>
                        <span>{item.description}</span>
                        <small>{item.affectedCount} afetada(s)</small>
                      </div>
                    ))}
                  </div>
                </article>
              </div>

              <article className="panel">
                <div className="panel-title">
                  <ClipboardList size={20} aria-hidden="true" />
                  <h2>Eventos recentes</h2>
                </div>
                <div className="event-timeline">
                  {riskEvents.map((event) => (
                    <div className="event" key={event.id}>
                      <time>{new Intl.DateTimeFormat('pt-BR').format(new Date(event.createdAt))}</time>
                      <strong>{event.description}</strong>
                      <RiskPill value={event.severity} />
                    </div>
                  ))}
                </div>
              </article>
            </section>
          )}

          {activeView === 'caixa' && (
            <section className="view-stack">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">Modelo financeiro</span>
                  <h1>Fluxo de caixa</h1>
                </div>
                <div className="status-chip">
                  <BanknoteArrowUp size={16} aria-hidden="true" />
                  {currency(cashFlow.nextMonthProjection)} proj.
                </div>
              </div>

              <div className="stat-grid">
                <StatCard icon={PiggyBank} label="Contribuicoes pagas" value={currency(cashFlow.totals.contributions)} detail="marco a maio" />
                <StatCard icon={HandCoins} label="Emprestimos liberados" value={currency(cashFlow.totals.loansIssued)} detail="fundo coletivo" />
                <StatCard icon={CircleDollarSign} label="Juros ao fundo" value={currency(cashFlow.totals.interestReturned)} detail="após taxa de plataforma" />
                <StatCard icon={Landmark} label="Taxa AfroCapital" value={currency(cashFlow.totals.platformFee)} detail="10% dos juros" />
              </div>

              <article className="panel">
                <div className="panel-title">
                  <LineChart size={20} aria-hidden="true" />
                  <h2>Mês a mês</h2>
                </div>
                <div className="cash-table">
                  <div className="cash-header">
                    <span>Mês</span>
                    <span>Contribuições</span>
                    <span>Crédito</span>
                    <span>Retornos</span>
                    <span>Juros</span>
                    <span>Saldo</span>
                  </div>
                  {cashFlow.months.map((month) => (
                    <div className="cash-row" key={month.month}>
                      <strong>{month.month}</strong>
                      <span>{currency(month.contributions)}</span>
                      <span>{currency(month.loansIssued)}</span>
                      <span>{currency(month.repayments)}</span>
                      <span>{currency(month.interestReturned)}</span>
                      <span>{currency(month.balance)}</span>
                    </div>
                  ))}
                </div>
              </article>

              <article className="panel">
                <div className="panel-title">
                  <WalletCards size={20} aria-hidden="true" />
                  <h2>Escala mockada</h2>
                </div>
                <div className="scale-grid">
                  <div>
                    <strong>500 grupos</strong>
                    <span>7.500 mulheres no primeiro ano</span>
                  </div>
                  <div>
                    <strong>2.000 grupos</strong>
                    <span>30.000 mulheres no segundo ano</span>
                  </div>
                  <div>
                    <strong>{currency(1_500_000)}</strong>
                    <span>crédito comunitário mensal estimado</span>
                  </div>
                  <div>
                    <strong>{percent(10)}</strong>
                    <span>taxa sobre juros circulantes</span>
                  </div>
                </div>
              </article>
            </section>
          )}

          {activeView === 'api' && (
            <section className="view-stack">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">REST futura</span>
                  <h1>Payloads da demo</h1>
                </div>
              </div>

              <div className="api-grid">
                <ApiBlock title="POST /empreendedoras">
{`{
  "nome": "Aline Rocha",
  "territorio": "Capao Redondo",
  "tipoNegocio": "beleza",
  "rendaMensal": 3400,
  "formalizacao": "mei_em_preparo"
}`}
                </ApiBlock>
                <ApiBlock title="POST /coletivos/sugerir-grupo">
{`{
  "tamanhoAlvo": 15,
  "criterios": [
    "diversidade_negocios",
    "regularidade_pagamento",
    "engajamento_comunitario",
    "sazonalidade"
  ]
}`}
                </ApiBlock>
                <ApiBlock title="GET /coletivos/c-001/risco">
{`{
  "score": ${risk.score},
  "alerta": "${risk.level}",
  "sinais": ${JSON.stringify(risk.signals.map((item) => item.type), null, 2)}
}`}
                </ApiBlock>
                <ApiBlock title="POST /emprestimos">
{`{
  "coletivoId": "c-001",
  "empreendedoraId": "u-004",
  "valor": 650,
  "jurosMes": 0.03,
  "prazoDias": 60,
  "finalidade": "Insumos para confeitaria"
}`}
                </ApiBlock>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  )
}

export default App
