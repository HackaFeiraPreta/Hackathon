import { useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  Bot,
  Camera,
  CircleDollarSign,
  Clock3,
  Edit3,
  ExternalLink,
  Eye,
  GraduationCap,
  HandCoins,
  LineChart,
  LockKeyhole,
  MessageCircle,
  Send,
  ShieldCheck,
  Store,
  Trash2,
  UserRound,
  Video,
  Users,
  WalletCards,
} from 'lucide-react'
import './App.css'
import { contributions as mockContributions, entrepreneurs, loans as mockLoans } from './data/mockData'
import { currency } from './domain/utils'

type Role = 'user' | 'admin'
type UserView = 'caixa' | 'trilhas' | 'comunidade' | 'alertas'
type AdminView = 'caixa' | 'trilhas' | 'alertas' | 'emprestimos' | 'empreendedoras'
type AppView = UserView | AdminView
type CashTab = 'resumo' | 'emprestimos' | 'contribuicoes'
type AuthMode = 'login' | 'register'
type LoanStatus = 'pendente' | 'aprovado' | 'rejeitado'
type Session = { role: Role; name: string }
type Toast = { id: number; message: string; tone: 'success' | 'danger' }

type RegisteredUser = {
  fullName: string
  password: string
}

type Profile = {
  photo: string
  fullName: string
  cpf: string
  age: string
  education: string
  segment: string
  cep: string
  street: string
  number: string
  neighborhood: string
  city: string
  state: string
  monthlyIncome: string
  about: string
  plan: 100 | 200 | 300
}

type LoanRequest = {
  id: string
  cpf: string
  borrowerName: string
  amount: number
  purpose: string
  neededAt: string
  interest: number
  totalDue: number
  dueDate: string
  status: LoanStatus
  requestedAt: string
  approvedBy?: string
}

type ChatMessage = {
  from: string
  text: string
}

type ContributionPayments = Record<string, Record<string, boolean>>

type AiMessage = {
  from: 'IA Iyalode' | 'Você'
  text: string
}

type AdminProfile = {
  photo: string
  password: string
}

const educationOptions = [
  'Ensino fundamental incompleto',
  'Ensino fundamental completo',
  'Ensino médio incompleto',
  'Ensino médio completo',
  'Ensino superior incompleto',
  'Ensino superior completo',
  'Pós-graduação',
]

const segmentOptions = [
  'Beleza e Estética',
  'Alimentação e Bebidas',
  'Moda, Vestuário e Costura',
  'Artesanato e Produtos Manuais',
  'Comércio e Vendas (Loja Física ou Online)',
  'Serviços Domésticos e Limpeza',
  'Educação, Reforço Escolar e Cursos',
  'Saúde, Bem-estar e Cuidados Pessoais',
  'Tecnologia, Marketing e Serviços Digitais',
  'Eventos, Cultura e Economia Criativa',
  'Outro',
]

const userNavigation = [
  { id: 'caixa', label: 'Fluxo de caixa', icon: WalletCards },
  { id: 'trilhas', label: 'Trilhas', icon: GraduationCap },
  { id: 'comunidade', label: 'Comunidade', icon: Users },
  { id: 'alertas', label: 'Alertas', icon: AlertTriangle },
] satisfies Array<{ id: UserView; label: string; icon: typeof WalletCards }>

const adminNavigation = [
  { id: 'caixa', label: 'Dashboard Financeiro', icon: WalletCards },
  { id: 'trilhas', label: 'Trilhas', icon: GraduationCap },
  { id: 'alertas', label: 'Alertas', icon: AlertTriangle },
  { id: 'emprestimos', label: 'Empréstimos', icon: HandCoins },
  { id: 'empreendedoras', label: 'Empreendedoras', icon: Users },
] satisfies Array<{ id: AdminView; label: string; icon: typeof WalletCards }>

const seedCpfs = ['11122233344', '55566677788']
const seedPlans: Array<Profile['plan']> = [100, 200, 300, 200, 100]
const businessTypeSegmentLabels: Record<string, string> = {
  beleza: 'Beleza e Estética',
  alimentacao: 'Alimentação e Bebidas',
  costura: 'Moda, Vestuário e Costura',
  confeitaria: 'Alimentação e Bebidas',
  artesanato: 'Artesanato e Produtos Manuais',
  delivery: 'Alimentação e Bebidas',
  cuidados: 'Saúde, Bem-estar e Cuidados Pessoais',
  educacao: 'Educação, Reforço Escolar e Cursos',
  limpeza: 'Serviços Domésticos e Limpeza',
  tecnologia: 'Tecnologia, Marketing e Serviços Digitais',
  moda: 'Moda, Vestuário e Costura',
  mercearia: 'Comércio e Vendas (Loja Física ou Online)',
  agroecologia: 'Comércio e Vendas (Loja Física ou Online)',
}

function getSeedCpf(index: number) {
  return seedCpfs[index] ?? String(90000000000 + index + 1)
}

const initialProfiles: Profile[] = entrepreneurs.map((person, index) => {
  const segment = businessTypeSegmentLabels[person.businessType] ?? 'Outro'
  return {
    photo: '',
    fullName: person.fullName,
    cpf: getSeedCpf(index),
    age: String(person.age),
    education: index % 4 === 0 ? 'Ensino médio incompleto' : 'Ensino médio completo',
    segment,
    cep: person.fullName === 'Bea Lacerda' ? '04852000' : String(5800000 + index * 137).padStart(8, '0'),
    street: person.fullName === 'Bea Lacerda' ? 'Rua das Empreendedoras' : `Rua ${person.neighborhood}`,
    number: person.fullName === 'Bea Lacerda' ? '204' : String(80 + index * 11),
    neighborhood: person.neighborhood,
    city: 'Sao Paulo',
    state: 'SP',
    monthlyIncome: String(person.monthlyRevenue),
    about: `Negócio de ${segment.toLowerCase()} com ${person.tags.join(', ')}.`,
    plan: person.fullName === 'Bea Lacerda' ? 200 : seedPlans[index % seedPlans.length],
  }
})

const initialRegisteredUsers: RegisteredUser[] = initialProfiles.map((profile) => ({
  fullName: profile.fullName,
  password: 'Senha1',
}))

const profileByEntrepreneurId = new Map(entrepreneurs.map((person, index) => [person.id, initialProfiles[index]]))

const initialLoanRequests: LoanRequest[] = [
  ...mockLoans.flatMap((loan) => {
    const profile = profileByEntrepreneurId.get(loan.borrowerId)
    if (!profile) return []
    const interest = loan.principal * 0.03
    return [
      {
        id: loan.id,
        cpf: profile.cpf,
        borrowerName: profile.fullName,
        amount: loan.principal,
        purpose: loan.purpose,
        neededAt: loan.issuedAt,
        interest,
        totalDue: loan.principal + interest,
        dueDate: loan.dueDate,
        status: 'aprovado' as const,
        requestedAt: loan.issuedAt,
        approvedBy: 'Adm',
      },
    ]
  }),
  {
    id: 'sol-demo-001',
    cpf: getSeedCpf(0),
    borrowerName: 'Aline Rocha',
    amount: 260,
    purpose: 'Comprar estoque para atendimento de fim de semana.',
    neededAt: '2026-06-05',
    interest: 7.8,
    totalDue: 267.8,
    dueDate: '2026-08-04',
    status: 'pendente',
    requestedAt: '2026-05-18',
  },
  {
    id: 'sol-demo-002',
    cpf: getSeedCpf(2),
    borrowerName: 'Carla Nascimento',
    amount: 390,
    purpose: 'Comprar tecido para encomendas de uniformes.',
    neededAt: '2026-05-28',
    interest: 11.7,
    totalDue: 401.7,
    dueDate: '2026-07-27',
    status: 'rejeitado',
    requestedAt: '2026-05-12',
  },
]

function buildInitialContributionPayments() {
  const payments = mockContributions.reduce<ContributionPayments>((current, contribution) => {
    const entrepreneurIndex = entrepreneurs.findIndex((person) => person.id === contribution.userId)
    if (entrepreneurIndex < 0 || contribution.status !== 'paga') return current
    const cpf = getSeedCpf(entrepreneurIndex)
    const monthId = contribution.dueDate.slice(0, 7)
    current[cpf] = {
      ...(current[cpf] ?? {}),
      [monthId]: true,
    }
    return current
  }, {})

  entrepreneurs.slice(0, 10).forEach((_, index) => {
    const cpf = getSeedCpf(index)
    payments[cpf] = {
      ...(payments[cpf] ?? {}),
      '2026-01': true,
      '2026-02': index !== 6,
    }
  })

  return payments
}

const initialContributionPayments = buildInitialContributionPayments()

const chatSeed: Record<string, ChatMessage[]> = {
  'Bruna Conceicao': [
    { from: 'Bruna Conceicao', text: 'Oi, podemos trocar fornecedores de embalagens?' },
    { from: 'Você', text: 'Sim, vou te mandar minhas indicações.' },
  ],
}

const storageKeys = {
  users: 'iyalode:users',
  profiles: 'iyalode:profiles',
  session: 'iyalode:session',
  loans: 'iyalode:loans',
  chats: 'iyalode:chats',
  contributions: 'iyalode:contributions',
  adminProfile: 'iyalode:admin-profile',
  seedVersion: 'iyalode:seed-version',
}

const mockSeedVersion = 'afrocapital-demo-kpis-v3'

const sebraeTracks = [
  {
    id: 'sebrae-basico-mei',
    level: 'Básico',
    title: 'Formalização MEI sem complicação',
    summary: 'Entenda quando o MEI vale a pena, quais documentos separar e como manter o CNPJ regular.',
    duration: 8,
    videoUrl: 'https://www.youtube.com/results?search_query=sebrae+como+abrir+mei',
    sebraeUrl: 'https://loja.sebrae.com.br/catalogsearch/result/?q=mei',
  },
  {
    id: 'sebrae-basico-caixa',
    level: 'Básico',
    title: 'Controle de caixa para pequenos negócios',
    summary: 'Organize entradas, saídas, retirada pessoal e reserva para reposição de estoque.',
    duration: 10,
    videoUrl: 'https://www.youtube.com/results?search_query=sebrae+controle+de+caixa',
    sebraeUrl: 'https://loja.sebrae.com.br/catalogsearch/result/?q=controle%20de%20caixa',
  },
  {
    id: 'sebrae-basico-preco',
    level: 'Básico',
    title: 'Preço de venda com lucro',
    summary: 'Calcule custo, tempo, margem e preço final sem perder dinheiro nas vendas.',
    duration: 9,
    videoUrl: 'https://www.youtube.com/results?search_query=sebrae+formacao+de+preco',
    sebraeUrl: 'https://loja.sebrae.com.br/catalogsearch/result/?q=preco',
  },
  {
    id: 'sebrae-intermediario-vendas',
    level: 'Intermediário',
    title: 'Vendas digitais para empreendedoras',
    summary: 'Use WhatsApp, redes sociais e catálogo online para vender com rotina e acompanhamento.',
    duration: 12,
    videoUrl: 'https://www.youtube.com/results?search_query=sebrae+vendas+digitais',
    sebraeUrl: 'https://loja.sebrae.com.br/catalogsearch/result/?q=vendas%20digitais',
  },
  {
    id: 'sebrae-intermediario-financas',
    level: 'Intermediário',
    title: 'Finanças para crescer com segurança',
    summary: 'Monte metas, acompanhe margem, planeje compras e reduza risco antes de pedir crédito.',
    duration: 14,
    videoUrl: 'https://www.youtube.com/results?search_query=sebrae+financas+pequenos+negocios',
    sebraeUrl: 'https://loja.sebrae.com.br/catalogsearch/result/?q=financas',
  },
  {
    id: 'sebrae-intermediario-cliente',
    level: 'Intermediário',
    title: 'Relacionamento e fidelização',
    summary: 'Crie uma rotina de pós-venda, indicação e atendimento para fortalecer receita recorrente.',
    duration: 11,
    videoUrl: 'https://www.youtube.com/results?search_query=sebrae+fidelizacao+de+clientes',
    sebraeUrl: 'https://loja.sebrae.com.br/catalogsearch/result/?q=clientes',
  },
  {
    id: 'sebrae-avancado-credito',
    level: 'Avançado',
    title: 'Preparação para crédito produtivo',
    summary: 'Organize comprovantes, histórico de vendas e capacidade de pagamento para captar melhor.',
    duration: 15,
    videoUrl: 'https://www.youtube.com/results?search_query=sebrae+credito+pequenos+negocios',
    sebraeUrl: 'https://loja.sebrae.com.br/catalogsearch/result/?q=credito',
  },
  {
    id: 'sebrae-avancado-gestao',
    level: 'Avançado',
    title: 'Gestão de crescimento e estoque',
    summary: 'Planeje compra, giro, fornecedores e expansão sem comprometer o caixa.',
    duration: 16,
    videoUrl: 'https://www.youtube.com/results?search_query=sebrae+gestao+de+estoque',
    sebraeUrl: 'https://loja.sebrae.com.br/catalogsearch/result/?q=estoque',
  },
  {
    id: 'sebrae-avancado-lideranca',
    level: 'Avançado',
    title: 'Liderança e negociação',
    summary: 'Fortaleça negociação com fornecedores, clientes e parceiros de comunidade.',
    duration: 13,
    videoUrl: 'https://www.youtube.com/results?search_query=sebrae+lideranca+negociacao',
    sebraeUrl: 'https://loja.sebrae.com.br/catalogsearch/result/?q=negociacao',
  },
]

const managementTracks = [
  {
    id: 'gestao-indicadores',
    level: 'Gestão',
    title: 'Indicadores financeiros para pequenos negócios',
    summary: 'Curso Sebrae para acompanhar caixa, margem, inadimplência e metas de crescimento.',
    duration: 14,
    videoUrl: 'https://www.youtube.com/results?search_query=sebrae+indicadores+financeiros',
    sebraeUrl: 'https://loja.sebrae.com.br/catalogsearch/result/?q=indicadores%20financeiros',
  },
  {
    id: 'gestao-inadimplencia',
    level: 'Gestão',
    title: 'Gestão de crédito e inadimplência',
    summary: 'Aprenda a analisar risco, acompanhar pagamentos e criar ações preventivas.',
    duration: 16,
    videoUrl: 'https://www.youtube.com/results?search_query=sebrae+inadimplencia+pequenos+negocios',
    sebraeUrl: 'https://loja.sebrae.com.br/catalogsearch/result/?q=credito',
  },
  {
    id: 'gestao-comunidade',
    level: 'Gestão',
    title: 'Liderança de redes empreendedoras',
    summary: 'Boas práticas para acompanhar grupos, mediar conflitos e fortalecer confiança coletiva.',
    duration: 13,
    videoUrl: 'https://www.youtube.com/results?search_query=sebrae+lideranca+empreendedora',
    sebraeUrl: 'https://loja.sebrae.com.br/catalogsearch/result/?q=lideranca',
  },
]

function readStored<T>(key: string, fallback: T): T {
  try {
    const stored = window.localStorage.getItem(key)
    return stored ? (JSON.parse(stored) as T) : fallback
  } catch {
    return fallback
  }
}

function writeStored<T>(key: string, value: T) {
  window.localStorage.setItem(key, JSON.stringify(value))
}

function hasCurrentSeedVersion() {
  try {
    return window.localStorage.getItem(storageKeys.seedVersion) === mockSeedVersion
  } catch {
    return true
  }
}

function mergeSeededProfiles(storedProfiles: Profile[]) {
  if (storedProfiles.length === 0 || hasCurrentSeedVersion()) return storedProfiles.length ? storedProfiles : initialProfiles
  const byCpf = new Map(initialProfiles.map((profile) => [profile.cpf, profile]))
  storedProfiles.forEach((profile) => byCpf.set(profile.cpf, profile))
  return Array.from(byCpf.values())
}

function mergeSeededUsers(storedUsers: RegisteredUser[]) {
  if (storedUsers.length === 0 || hasCurrentSeedVersion()) return storedUsers.length ? storedUsers : initialRegisteredUsers
  const byName = new Map(initialRegisteredUsers.map((user) => [user.fullName.toLowerCase(), user]))
  storedUsers.forEach((user) => byName.set(user.fullName.toLowerCase(), user))
  return Array.from(byName.values())
}

function mergeSeededLoanRequests(storedRequests: LoanRequest[]) {
  if (storedRequests.length === 0 || hasCurrentSeedVersion()) return storedRequests.length ? storedRequests : initialLoanRequests
  const byId = new Map(initialLoanRequests.map((request) => [request.id, request]))
  storedRequests.forEach((request) => byId.set(request.id, request))
  return Array.from(byId.values()).sort((a, b) => b.requestedAt.localeCompare(a.requestedAt))
}

function mergeContributionPayments(base: ContributionPayments, stored: ContributionPayments) {
  const merged: ContributionPayments = { ...base }
  Object.entries(stored).forEach(([cpf, months]) => {
    merged[cpf] = {
      ...(merged[cpf] ?? {}),
      ...months,
    }
  })
  return merged
}

function LogoBlock({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? 'brand brand--compact' : 'login-brand'}>
      <img src="/logomarca.png" alt="Logomarca Iyalode" />
      <div>
        <strong>Iyalode</strong>
        <span>{compact ? 'Cooperativa' : 'Créditos que circulam, mulheres que avançam.'}</span>
      </div>
    </div>
  )
}

function createBlankProfile(fullName: string): Profile {
  return {
    photo: '',
    fullName,
    cpf: '',
    age: '',
    education: '',
    segment: '',
    cep: '',
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    state: '',
    monthlyIncome: '',
    about: '',
    plan: 100,
  }
}

function daysFromNow(days: number) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

function getUserFinance(profile: Profile, loanRequests: LoanRequest[], year: string, contributionPayments: ContributionPayments) {
  const paidMonths = contributionPayments[profile.cpf] ?? {}
  const approvedRequests = loanRequests.filter(
    (item) => item.cpf === profile.cpf && item.status === 'aprovado' && item.requestedAt.startsWith(year),
  )
  let contributionAccumulated = 0
  let loanAccumulated = 0

  return Array.from({ length: 12 }, (_, index) => {
    const month = index + 1
    const monthId = `${year}-${String(month).padStart(2, '0')}`
    const contribution = paidMonths[monthId] ? profile.plan : 0
    const loanValue = approvedRequests
      .filter((item) => new Date(`${item.requestedAt}T00:00:00`).getMonth() + 1 === month)
      .reduce((sum, item) => sum + item.amount, 0)
    const interest = loanValue * 0.03

    contributionAccumulated += contribution
    loanAccumulated += loanValue

    return {
      month: new Date(Number(year), index, 1).toLocaleDateString('pt-BR', { month: 'long' }),
      monthId,
      contribution,
      loanValue,
      contributionAccumulated,
      loanAccumulated,
      interest,
    }
  })
}

function LoginCard({
  role,
  onUserLogin,
  onAdminLogin,
  onRegister,
  registeredUsers,
}: {
  role: Role
  onUserLogin: (name: string, password: string) => void
  onAdminLogin: (name: string, password: string) => void
  onRegister: (name: string, password: string) => void
  registeredUsers: RegisteredUser[]
}) {
  const [mode, setMode] = useState<AuthMode>('login')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const canRegister = name.trim().length > 2 && password.length > 0 && password === confirmPassword
  const alreadyRegistered = registeredUsers.some((user) => user.fullName.toLowerCase() === name.trim().toLowerCase())

  if (role === 'admin') {
    return (
      <article className="login-card">
        <div className="login-card-icon">
          <Store size={24} aria-hidden="true" />
        </div>
        <div className="login-card-copy">
          <h2>Login Adm</h2>
        </div>
        <form
          className="login-form"
          onSubmit={(event) => {
            event.preventDefault()
            onAdminLogin(name, password)
          }}
        >
          <label>
            <span>Login</span>
            <input value={name} onChange={(event) => setName(event.target.value)} required />
          </label>
          <label>
            <span>Senha</span>
            <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" required />
          </label>
          <button type="submit">
            <LockKeyhole size={17} aria-hidden="true" />
            Entrar
          </button>
        </form>
      </article>
    )
  }

  return (
    <article className="login-card">
      <div className="login-card-icon">
        <UserRound size={24} aria-hidden="true" />
      </div>
      <div className="login-card-copy">
        <h2>Login</h2>
      </div>
      <form
        className="login-form"
        onSubmit={(event) => {
          event.preventDefault()
          if (mode === 'register') {
            onRegister(name, password)
            return
          }
          onUserLogin(name, password)
        }}
      >
        <label>
          <span>Nome completo</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Digite seu nome completo"
            autoComplete="name"
            required
          />
        </label>
        <label>
          <span>Senha</span>
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="***********"
            type="password"
            autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
            required
          />
        </label>

        {mode === 'register' && (
          <>
            <label>
              <span>Confirme sua senha</span>
              <input
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="***********"
                type="password"
                autoComplete="new-password"
                required
              />
            </label>
            <div className="password-rules" aria-live="polite">
              <span className={password.length > 0 ? 'valid' : ''}>senha preenchida</span>
              <span className={password === confirmPassword && confirmPassword ? 'valid' : ''}>senhas iguais</span>
              {alreadyRegistered && <span>Esse nome já possui cadastro.</span>}
            </div>
          </>
        )}

        <button type="submit" disabled={mode === 'register' ? !canRegister || alreadyRegistered : false}>
          <LockKeyhole size={17} aria-hidden="true" />
          {mode === 'register' ? 'Criar conta' : 'Entrar'}
        </button>
        <button className="link-button" type="button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
          {mode === 'login' ? 'Criar nova conta' : 'Já tenho cadastro'}
        </button>
      </form>
    </article>
  )
}

function ProfileForm({
  initialProfile,
  onSave,
}: {
  initialProfile: Profile
  onSave: (profile: Profile) => void
}) {
  const [profile, setProfile] = useState<Profile>(initialProfile)
  const [addressStatus, setAddressStatus] = useState('')

  function update(field: keyof Profile, value: string | 100 | 200 | 300) {
    setProfile((current) => ({ ...current, [field]: value }))
  }

  async function recognizeCep() {
    const cleanCep = profile.cep.replace(/\D/g, '')
    if (cleanCep.length !== 8) {
      return
    }

    setAddressStatus('Reconhecendo endereço pela API ViaCEP...')
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
      const data = (await response.json()) as { erro?: boolean; logradouro?: string; bairro?: string; localidade?: string; uf?: string }
      if (data.erro) {
        setAddressStatus('CEP não encontrado. Preencha manualmente.')
        return
      }
      setProfile((current) => ({
        ...current,
        street: data.logradouro ?? current.street,
        neighborhood: data.bairro ?? current.neighborhood,
        city: data.localidade ?? current.city,
        state: data.uf ?? current.state,
      }))
      setAddressStatus('Endereço reconhecido automaticamente.')
    } catch {
      setAddressStatus('Não foi possível consultar a API agora. Preencha manualmente.')
    }
  }

  const requiredFields = [
    profile.fullName,
    profile.cpf,
    profile.age,
    profile.education,
    profile.segment,
    profile.street,
    profile.number,
    profile.monthlyIncome,
  ]
  const canSave = requiredFields.every((field) => String(field).trim().length > 0)

  return (
    <main className="registration-page">
      <section className="registration-panel">
        <LogoBlock />
        <div className="section-heading">
          <div>
            <span className="eyebrow">Cadastro obrigatório</span>
            <h1>Complete suas informações</h1>
          </div>
        </div>
        <form
          className="profile-form"
          onSubmit={(event) => {
            event.preventDefault()
            onSave(profile)
          }}
        >
          <label className="photo-field">
            <span>Foto</span>
            <input
              type="file"
              accept="image/*"
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (!file) return
                update('photo', URL.createObjectURL(file))
              }}
            />
            <div className="photo-preview">
              {profile.photo ? <img src={profile.photo} alt="Prévia da foto enviada" /> : <Camera size={28} aria-hidden="true" />}
            </div>
          </label>

          <label>
            <span>Nome completo</span>
            <input value={profile.fullName} onChange={(event) => update('fullName', event.target.value)} required />
          </label>
          <label>
            <span>CPF</span>
            <input value={profile.cpf} onChange={(event) => update('cpf', event.target.value)} required />
          </label>
          <label>
            <span>Idade</span>
            <input value={profile.age} onChange={(event) => update('age', event.target.value)} type="number" min="18" required />
          </label>
          <label>
            <span>Escolaridade</span>
            <select value={profile.education} onChange={(event) => update('education', event.target.value)} required>
              <option value="">Selecione</option>
              {educationOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Segmento de atuação</span>
            <select value={profile.segment} onChange={(event) => update('segment', event.target.value)} required>
              <option value="">Selecione</option>
              {segmentOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>
          <label>
            <span>CEP</span>
            <input value={profile.cep} onChange={(event) => update('cep', event.target.value)} onBlur={recognizeCep} />
          </label>
          <label>
            <span>Rua</span>
            <input value={profile.street} onChange={(event) => update('street', event.target.value)} onBlur={recognizeCep} required />
          </label>
          <label>
            <span>Número</span>
            <input value={profile.number} onChange={(event) => update('number', event.target.value)} required />
          </label>
          <label>
            <span>Bairro</span>
            <input value={profile.neighborhood} onChange={(event) => update('neighborhood', event.target.value)} />
          </label>
          <label>
            <span>Cidade</span>
            <input value={profile.city} onChange={(event) => update('city', event.target.value)} />
          </label>
          <label>
            <span>UF</span>
            <input value={profile.state} onChange={(event) => update('state', event.target.value)} maxLength={2} />
          </label>
          <label>
            <span>Rendimento mensal aproximado</span>
            <input
              value={profile.monthlyIncome}
              onChange={(event) => update('monthlyIncome', event.target.value)}
              inputMode="decimal"
              placeholder="0,00"
              required
            />
          </label>
          <label className="full-field">
            <span>Sobre você</span>
            <textarea value={profile.about} onChange={(event) => update('about', event.target.value)} rows={4} />
          </label>
          <fieldset className="plan-field full-field">
            <legend>Plano mensal</legend>
            {[100, 200, 300].map((value) => (
              <label key={value}>
                <input
                  checked={profile.plan === value}
                  name="plan"
                  type="radio"
                  onChange={() => update('plan', value as 100 | 200 | 300)}
                />
                {currency(value)}
              </label>
            ))}
          </fieldset>
          {addressStatus && <p className="form-note full-field">{addressStatus}</p>}
          <button className="full-field" type="submit" disabled={!canSave}>
            Salvar cadastro e acessar
          </button>
        </form>
      </section>
    </main>
  )
}

function AdminProfileForm({
  initialProfile,
  onSave,
}: {
  initialProfile: AdminProfile
  onSave: (profile: AdminProfile) => void
}) {
  const [profile, setProfile] = useState(initialProfile)

  return (
    <main className="registration-page">
      <section className="registration-panel">
        <LogoBlock />
        <div className="section-heading">
          <div>
            <span className="eyebrow">Perfil Adm</span>
            <h1 className="page-title">Editar perfil administrativo</h1>
          </div>
        </div>
        <form
          className="profile-form admin-profile-form"
          onSubmit={(event) => {
            event.preventDefault()
            onSave(profile)
          }}
        >
          <label className="photo-field">
            <span>Foto</span>
            <input
              type="file"
              accept="image/*"
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (!file) return
                setProfile((current) => ({ ...current, photo: URL.createObjectURL(file) }))
              }}
            />
            <div className="photo-preview">
              {profile.photo ? <img src={profile.photo} alt="Prévia da foto do Adm" /> : <Camera size={28} aria-hidden="true" />}
            </div>
          </label>
          <label>
            <span>Nova senha Adm</span>
            <input value={profile.password} onChange={(event) => setProfile((current) => ({ ...current, password: event.target.value }))} type="password" />
          </label>
          <button type="submit">Salvar perfil Adm</button>
        </form>
      </section>
    </main>
  )
}

function Header({
  role,
  profile,
  adminProfile,
  onEditProfile,
  onLogout,
}: {
  role: Role
  profile?: Profile
  adminProfile: AdminProfile
  onEditProfile: () => void
  onLogout: () => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="topbar">
      <LogoBlock compact />
      <div className="profile-menu">
        <button className="profile-chip" type="button" onClick={() => setMenuOpen((current) => !current)}>
        {role === 'user' && profile ? (
          <>
            <div className="avatar">{profile.photo ? <img src={profile.photo} alt={profile.fullName} /> : profile.fullName.charAt(0)}</div>
            <strong>{profile.fullName}</strong>
          </>
        ) : (
          <>
            <div className="avatar">{adminProfile.photo ? <img src={adminProfile.photo} alt="Perfil Adm" /> : 'A'}</div>
            <strong>Adm</strong>
          </>
        )}
        </button>
        {menuOpen && (
          <div className="profile-dropdown">
            <button type="button" onClick={() => setMenuOpen(false)}>
              <Eye size={15} aria-hidden="true" />
              Visualizar perfil
            </button>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false)
                onEditProfile()
              }}
            >
              <Edit3 size={15} aria-hidden="true" />
              Editar perfil
            </button>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false)
                onLogout()
              }}
            >
              <LockKeyhole size={15} aria-hidden="true" />
              Sair
            </button>
          </div>
        )}
      </div>
    </header>
  )
}

function AppFooter() {
  return (
    <footer className="app-footer">
      <ShieldCheck size={18} aria-hidden="true" />
      <span>Dados tratados com segurança e princípios da LGPD. Este sistema é um MVP para validação da solução.</span>
    </footer>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof WalletCards
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

function ToastStack({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="toast-stack" aria-live="polite">
      {toasts.map((toast) => (
        <div className={`toast toast--${toast.tone}`} key={toast.id}>
          {toast.message}
        </div>
      ))}
    </div>
  )
}

function TimelineChart({
  rows,
  compact = false,
}: {
  rows: Array<{ month: string; contribution: number; loanValue: number }>
  compact?: boolean
}) {
  const maxValue = Math.max(1, ...rows.flatMap((row) => [row.contribution, row.loanValue]))
  const points = (key: 'contribution' | 'loanValue') =>
    rows
      .map((row, index) => {
        const x = 36 + index * (528 / 11)
        const y = 190 - (row[key] / maxValue) * 150
        return `${x},${y}`
      })
      .join(' ')

  return (
    <article className={compact ? 'panel chart-panel chart-panel--compact' : 'panel chart-panel'}>
      <div className="panel-title">
        <LineChart size={20} aria-hidden="true" />
        <h2>Linha do tempo anual</h2>
      </div>
      <svg className="timeline-chart" viewBox="0 0 620 230" role="img" aria-label="Gráfico de contribuições e empréstimos por mês">
        <line x1="36" y1="190" x2="584" y2="190" />
        <line x1="36" y1="40" x2="36" y2="190" />
        <polyline className="chart-line chart-line--contribution" points={points('contribution')} />
        <polyline className="chart-line chart-line--loan" points={points('loanValue')} />
        {rows.map((row, index) => (
          <text key={row.month} x={36 + index * (528 / 11)} y="214">
            {row.month.slice(0, 3)}
          </text>
        ))}
      </svg>
      <div className="chart-legend">
        <span><i className="legend-contribution" />Contribuição</span>
        <span><i className="legend-loan" />Empréstimos</span>
      </div>
    </article>
  )
}

function getLoanSegmentRanking(profiles: Profile[], loanRequests: LoanRequest[]) {
  const profilesByCpf = new Map(profiles.map((profile) => [profile.cpf, profile]))
  const ranking = new Map<string, { segment: string; requests: number; amount: number }>()

  loanRequests.forEach((request) => {
    const segment = profilesByCpf.get(request.cpf)?.segment ?? 'Sem cadastro'
    const current = ranking.get(segment) ?? { segment, requests: 0, amount: 0 }
    ranking.set(segment, {
      ...current,
      requests: current.requests + 1,
      amount: current.amount + request.amount,
    })
  })

  return Array.from(ranking.values()).sort((a, b) => b.requests - a.requests || b.amount - a.amount || a.segment.localeCompare(b.segment))
}

function SegmentLoanRankingChart({ profiles, loanRequests }: { profiles: Profile[]; loanRequests: LoanRequest[] }) {
  const ranking = getLoanSegmentRanking(profiles, loanRequests)
  const maxRequests = Math.max(1, ...ranking.map((item) => item.requests))

  return (
    <article className="panel segment-ranking-panel">
      <div className="panel-title">
        <HandCoins size={20} aria-hidden="true" />
        <h2>Segmentos que mais solicitaram empréstimos</h2>
      </div>
      <div className="segment-ranking-list">
        {ranking.map((item, index) => (
          <div className="segment-ranking-row" key={item.segment}>
            <strong>{index + 1}</strong>
            <span>{item.segment}</span>
            <div className="segment-bar" aria-hidden="true">
              <i style={{ width: `${(item.requests / maxRequests) * 100}%` }} />
            </div>
            <small>
              {item.requests === 1 ? '1 solicitação' : `${item.requests} solicitações`} · {currency(item.amount)}
            </small>
          </div>
        ))}
      </div>
    </article>
  )
}

function CashFlowView({
  profile,
  profiles,
  loanRequests,
  role,
  onLoanRequest,
  contributionPayments,
  onContribute,
  onDeleteProfile,
  cashTab,
}: {
  profile?: Profile
  profiles: Profile[]
  loanRequests: LoanRequest[]
  role: Role
  onLoanRequest: (request: LoanRequest) => void
  contributionPayments: ContributionPayments
  onContribute: (profile: Profile, monthId: string) => void
  onDeleteProfile: (profile: Profile) => void
  cashTab: CashTab
}) {
  const [year, setYear] = useState('2026')
  const [showLoanForm, setShowLoanForm] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Profile | null>(null)
  const visibleProfiles = role === 'admin' ? profiles : profile ? [profile] : []
  const currentProfile = profile ?? profiles[0]
  const rows = visibleProfiles.flatMap((item) =>
    getUserFinance(item, loanRequests, year, contributionPayments).map((row) => ({ ...row, person: item.fullName, cpf: item.cpf, plan: item.plan })),
  )
  const timelineRows = Array.from(
    rows
      .reduce((months, row) => {
        const current = months.get(row.monthId) ?? { month: row.month, monthId: row.monthId, contribution: 0, loanValue: 0 }
        months.set(row.monthId, {
          ...current,
          contribution: current.contribution + row.contribution,
          loanValue: current.loanValue + row.loanValue,
        })
        return months
      }, new Map<string, { month: string; monthId: string; contribution: number; loanValue: number }>())
      .values(),
  ).sort((a, b) => a.monthId.localeCompare(b.monthId))
  const contributionTotal = rows.reduce((sum, row) => sum + row.contribution, 0)
  const loanTotal = rows.reduce((sum, row) => sum + row.loanValue, 0)
  const cashOnHand = contributionTotal - loanTotal
  const interestTotal = rows.reduce((sum, row) => sum + row.interest, 0)
  const platformFee = contributionTotal * 0.01
  const today = new Date()
  const currentMonthId = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
  const userRequests = currentProfile ? loanRequests.filter((request) => request.cpf === currentProfile.cpf) : []

  if (role === 'admin') {
    return (
      <section className="view-stack">
        <div className="section-heading">
          <div>
            <h1 className="page-title">Dashboard Financeiro</h1>
          </div>
          <div className="toolbar">
            <label>
              <span>Ano</span>
              <select value={year} onChange={(event) => setYear(event.target.value)}>
                <option>2026</option>
                <option>2025</option>
              </select>
            </label>
          </div>
        </div>
        <div className="stat-grid admin-stat-grid">
          <StatCard icon={CircleDollarSign} label="Total de contribuição" value={currency(contributionTotal)} detail="cotas pagas" />
          <StatCard icon={HandCoins} label="Total de empréstimos" value={currency(loanTotal)} detail="valores liberados" />
          <StatCard icon={WalletCards} label="Total no caixa" value={currency(cashOnHand)} detail="contribuições - empréstimos" />
          <StatCard icon={Users} label="Total de usuárias" value={String(profiles.length)} detail="empreendedoras cadastradas" />
          <StatCard icon={LineChart} label="Total de juros" value={currency(interestTotal)} detail="3% por empréstimo" />
          <StatCard icon={WalletCards} label="Manutenção da plataforma" value={currency(platformFee)} detail="1% das contribuições" />
        </div>
        <TimelineChart rows={timelineRows} compact />
        <SegmentLoanRankingChart profiles={profiles} loanRequests={loanRequests} />
      </section>
    )
  }

  return (
    <section className="view-stack">
      <div className="section-heading">
        <div>
          <h1 className="page-title">
            {cashTab === 'resumo' ? 'Meu resumo financeiro' : cashTab === 'emprestimos' ? 'Meus empréstimos' : 'Minhas contribuições'}
          </h1>
        </div>
        <div className="toolbar">
          <label>
            <span>Ano</span>
            <select value={year} onChange={(event) => setYear(event.target.value)}>
              <option>2026</option>
              <option>2025</option>
            </select>
          </label>
          {role === 'user' && (
            <button type="button" onClick={() => setShowLoanForm((current) => !current)}>
              <HandCoins size={17} aria-hidden="true" />
              {showLoanForm ? 'Voltar' : 'Solicitar empréstimo'}
            </button>
          )}
        </div>
      </div>

      {showLoanForm && currentProfile && (
        <LoanRequestForm profile={currentProfile} loanRequests={loanRequests} contributionPayments={contributionPayments} onSubmit={onLoanRequest} />
      )}

      {cashTab === 'resumo' && (
        <>
          <div className="stat-grid">
            <StatCard icon={CircleDollarSign} label="Contribuição" value={currency(contributionTotal)} detail="valor total contribuído" />
            <StatCard icon={HandCoins} label="Empréstimos" value={currency(loanTotal)} detail="valor total aprovado" />
            <StatCard icon={LineChart} label="Juros" value={currency(interestTotal)} detail="3% no mês do empréstimo" />
          </div>
          <TimelineChart rows={timelineRows} compact />
        </>
      )}

      {cashTab === 'emprestimos' && (
        <article className="panel">
          <div className="cash-table">
            <div className="cash-header loan-table-header">
              <span>Data</span>
              <span>Valor</span>
              <span>% juros</span>
              <span>Até quando vai pagar</span>
              <span>Motivo</span>
              <span>Status Adm</span>
            </div>
            {userRequests.map((request) => (
              <div className="cash-row loan-table-row" key={request.id}>
                <strong>{new Intl.DateTimeFormat('pt-BR').format(new Date(`${request.requestedAt}T00:00:00`))}</strong>
                <span>{currency(request.amount)}</span>
                <span>3%</span>
                <span>{new Intl.DateTimeFormat('pt-BR').format(new Date(`${request.dueDate}T00:00:00`))}</span>
                <span>{request.purpose}</span>
                <span className={`status-dot status-dot--${request.status}`}>{request.status}</span>
              </div>
            ))}
          </div>
        </article>
      )}

      {cashTab === 'contribuicoes' && (
        <article className="panel">
          <div className="cash-table">
            <div className="cash-header contribution-table-header">
              <span>Mês</span>
              <span>Contribuição no mês</span>
              <span>Contribuições acumuladas</span>
              <span>Status</span>
            </div>
            {rows.map((row) => {
              const rowDate = new Date(`${row.monthId}-01T00:00:00`)
              const currentDate = new Date(`${currentMonthId}-01T00:00:00`)
              const status = row.contribution > 0 ? 'Já contribuiu' : rowDate < currentDate ? 'Mês fechado' : rowDate > currentDate ? 'Abrirá em breve' : 'Contribuir'
              const statusClass =
                status === 'Mês fechado'
                  ? 'contribution-status contribution-status--closed'
                  : status === 'Abrirá em breve'
                    ? 'contribution-status contribution-status--upcoming'
                    : 'contribution-status'
              return (
                <div className="cash-row contribution-table-row" key={`${row.person}-${row.month}`}>
                  <strong>{row.month}</strong>
                  <span>{currency(row.contribution)}</span>
                  <span>{currency(row.contributionAccumulated)}</span>
                  <span className="table-actions">
                    <button
                      className={statusClass}
                      type="button"
                      disabled={status !== 'Contribuir'}
                      onClick={() => profile && onContribute(profile, row.monthId)}
                    >
                      {status}
                    </button>
                  </span>
                </div>
              )
            })}
          </div>
        </article>
      )}

      {deleteTarget && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Confirmar exclusão">
          <article className="modal">
            <h2>Deletar pessoa?</h2>
            <p>Tem certeza que deseja remover {deleteTarget.fullName} do sistema?</p>
            <div className="decision-line">
              <button
                type="button"
                onClick={() => {
                  onDeleteProfile(deleteTarget)
                  setDeleteTarget(null)
                }}
              >
                Confirmar
              </button>
              <button className="ghost-button" type="button" onClick={() => setDeleteTarget(null)}>
                Cancelar
              </button>
            </div>
          </article>
        </div>
      )}
    </section>
  )
}

function LoanRequestForm({
  profile,
  loanRequests,
  contributionPayments,
  onSubmit,
}: {
  profile: Profile
  loanRequests: LoanRequest[]
  contributionPayments: ContributionPayments
  onSubmit: (request: LoanRequest) => void
}) {
  const finance = getUserFinance(profile, loanRequests, '2026', contributionPayments)
  const contributionTotal = finance.reduce((sum, row) => sum + row.contribution, 0)
  const maxLoan = contributionTotal * 1.3
  const [amount, setAmount] = useState('')
  const [purpose, setPurpose] = useState('')
  const [neededAt, setNeededAt] = useState('')
  const numericAmount = Number(amount.replace(',', '.')) || 0
  const interest = numericAmount * 0.03
  const canSubmit = numericAmount > 0 && numericAmount <= maxLoan && purpose.trim().length > 3 && neededAt

  return (
    <article className="panel loan-form-panel">
      <div className="panel-title">
        <HandCoins size={20} aria-hidden="true" />
        <h2>Solicitar empréstimo</h2>
      </div>
      <form
        className="loan-form"
        onSubmit={(event) => {
          event.preventDefault()
          onSubmit({
            id: `sol-${Date.now()}`,
            cpf: profile.cpf,
            borrowerName: profile.fullName,
            amount: numericAmount,
            purpose,
            neededAt,
            interest,
            totalDue: numericAmount + interest,
            dueDate: daysFromNow(60),
            status: 'pendente',
            requestedAt: new Date().toISOString().slice(0, 10),
          })
          setAmount('')
          setPurpose('')
          setNeededAt('')
        }}
      >
        <label>
          <span>Solicitante</span>
          <input value={`${profile.fullName} - CPF ${profile.cpf}`} readOnly />
        </label>
        <label>
          <span>Quanto deseja emprestado? Teto: {currency(maxLoan)}</span>
          <input value={amount} onChange={(event) => setAmount(event.target.value)} inputMode="decimal" required />
        </label>
        <label className="full-field">
          <span>Para que precisa do empréstimo?</span>
          <textarea value={purpose} onChange={(event) => setPurpose(event.target.value)} rows={3} required />
        </label>
        <label>
          <span>Para quando?</span>
          <input value={neededAt} onChange={(event) => setNeededAt(event.target.value)} type="date" required />
        </label>
        <div className="loan-summary">
          <strong>Juros de 3%: {currency(interest)}</strong>
          <span>Total estimado: {currency(numericAmount + interest)}</span>
          <small>Prazo de pagamento: 60 dias. Atrasos notificam o Adm e podem gerar exclusão do sistema.</small>
        </div>
        <button type="submit" disabled={!canSubmit}>
          Enviar solicitação
        </button>
      </form>
    </article>
  )
}

function LearningView({ role }: { role: Role }) {
  const tracks = role === 'admin' ? managementTracks : sebraeTracks
  return (
    <section className="view-stack">
      <div className="section-heading">
        <div>
          <h1 className="page-title">Aprendizagem Orientada</h1>
          <p className="sebrae-subtitle">Sebrae</p>
        </div>
      </div>
      <div className="lesson-grid">
        {tracks.map((lesson) => (
          <article className="lesson-card" key={lesson.id}>
            <span className="level-pill">{lesson.level}</span>
            <h3>{lesson.title}</h3>
            <p>{lesson.summary}</p>
            <div className="video-preview">
              <Video size={36} aria-hidden="true" />
              <span>{lesson.duration} min</span>
            </div>
            <div className="lesson-actions">
              <a href={lesson.videoUrl} target="_blank" rel="noreferrer">
                <Video size={15} aria-hidden="true" />
                Assistir vídeo
              </a>
              <a href={lesson.sebraeUrl} target="_blank" rel="noreferrer" className="sebrae-button">
                <ExternalLink size={15} aria-hidden="true" />
                Ver no Sebrae
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function CommunityView({
  profiles,
  currentProfile,
  chats,
  onSend,
}: {
  profiles: Profile[]
  currentProfile?: Profile
  chats: Record<string, ChatMessage[]>
  onSend: (recipient: string, message: string) => void
}) {
  const [selected, setSelected] = useState(profiles.find((item) => item.fullName !== currentProfile?.fullName)?.fullName ?? profiles[0]?.fullName ?? '')
  const [message, setMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const people = profiles
    .filter((item) => item.fullName !== currentProfile?.fullName)
    .filter((item) => item.fullName.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <section className="view-stack">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Rede de apoio</span>
          <h1 className="page-title">Comunidade</h1>
          <p className="view-description">Chat online em tempo real entre empreendedoras cadastradas.</p>
        </div>
      </div>
      <div className="community-grid">
        <article className="panel">
          <label className="community-search">
            <span>Filtrar por nome</span>
            <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Digite o nome da empreendedora" />
          </label>
          <div className="member-list">
            {people.map((person) => (
              <button className="community-person" key={person.cpf} type="button" onClick={() => setSelected(person.fullName)}>
                <strong>{person.fullName}</strong>
                <span>{person.segment}</span>
                <small>{person.city || person.neighborhood}</small>
              </button>
            ))}
          </div>
        </article>
        <article className="panel chat-panel">
          <div className="panel-title">
            <MessageCircle size={20} aria-hidden="true" />
            <h2>Chat com {selected || 'comunidade'}</h2>
          </div>
          <div className="chat-window whatsapp-window">
            {(chats[selected] ?? []).map((item, index) => (
              <div className={item.from === 'Você' ? 'chat-message mine' : 'chat-message'} key={`${item.from}-${index}`}>
                <strong>{item.from}</strong>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
          <form
            className="chat-form"
            onSubmit={(event) => {
              event.preventDefault()
              if (!message.trim() || !selected) return
              onSend(selected, message)
              setMessage('')
            }}
          >
            <input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Escreva uma mensagem" />
            <button type="submit">
              <Send size={17} aria-hidden="true" />
              Enviar
            </button>
          </form>
        </article>
      </div>
    </section>
  )
}

function normalizeSearchText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

function getCourseRecommendations(message: string, role: Role, profile?: Profile) {
  const tracks = role === 'admin' ? managementTracks : sebraeTracks
  const normalizedMessage = normalizeSearchText(message)
  const stopWords = new Set([
    'sobre',
    'curso',
    'cursos',
    'quero',
    'preciso',
    'indica',
    'indique',
    'para',
    'com',
    'uma',
    'das',
    'dos',
    'tem',
    'tenho',
    'quais',
    'voces',
    'voce',
  ])
  const tokens = normalizedMessage
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 2 && !stopWords.has(token))

  const profileHints = profile ? normalizeSearchText(`${profile.segment} ${profile.about}`) : ''
  const hasQueryTokens = tokens.length > 0
  const ranked = tracks
    .map((track) => {
      const haystack = normalizeSearchText(`${track.level} ${track.title} ${track.summary}`)
      const tokenScore = tokens.reduce((score, token) => score + (haystack.includes(token) ? 2 : 0), 0)
      const profileScore =
        profileHints.includes('aliment') && haystack.includes('vendas')
          ? 1
          : profileHints.includes('beleza') && haystack.includes('cliente')
            ? 1
            : profileHints.includes('moda') && haystack.includes('preco')
              ? 1
              : 0

      return { track, score: tokenScore + (hasQueryTokens ? 0 : profileScore) }
    })
    .sort((a, b) => b.score - a.score)

  const matches = ranked.filter((item) => item.score > 0).map((item) => item.track)
  const fallback = tracks.filter((track) => !matches.some((match) => match.id === track.id))
  return [...matches, ...fallback].slice(0, 3)
}

function formatCourseAnswer(message: string, role: Role, profile?: Profile) {
  const recommendations = getCourseRecommendations(message, role, profile)
  const intro =
    role === 'admin'
      ? 'Olhei as trilhas de gestão que temos cadastradas com links do Sebrae. Recomendo começar por:'
      : 'Olhei os cursos e trilhas Sebrae cadastrados na plataforma. Para essa pergunta, recomendo:'

  return `${intro}\n${recommendations
    .map((course, index) => `${index + 1}. ${course.title} (${course.level}) - ${course.summary} Link: ${course.sebraeUrl}`)
    .join('\n')}`
}

function buildAiAnswer(profile: Profile | undefined, message: string, suggestedMax: number, role: Role) {
  const text = message.toLowerCase()
  const normalizedText = normalizeSearchText(message)
  const asksForCourses =
    normalizedText.includes('curso') ||
    normalizedText.includes('sebrae') ||
    normalizedText.includes('aula') ||
    normalizedText.includes('trilha') ||
    normalizedText.includes('aprender')

  if (asksForCourses) {
    return formatCourseAnswer(message, role, profile)
  }

  if (!profile) {
    return 'Na visão Adm, priorize solicitações pendentes, pessoas sem contribuição no mês atual e empréstimos próximos do prazo de 60 dias.'
  }
  if (text.includes('empr') || text.includes('crédito') || text.includes('credito')) {
    return `Pelo seu perfil e contribuição registrada, eu recomendaria um teto prudente de ${currency(suggestedMax)} neste mês. Antes de solicitar, confirme se o valor cabe no caixa dos próximos 60 dias.`
  }
  return `Insight do seu perfil: sua cota mensal é ${currency(profile.plan)} e seu rendimento informado é ${currency(Number(profile.monthlyIncome.replace(',', '.')) || 0)}. Mantenha a contribuição em dia e solicite crédito apenas quando houver retorno claro para o negócio.`
}

function AlertsView({
  profile,
  profiles,
  loanRequests,
  role,
  contributionPayments,
}: {
  profile?: Profile
  profiles: Profile[]
  loanRequests: LoanRequest[]
  role: Role
  contributionPayments: ContributionPayments
}) {
  const userRequests = profile ? loanRequests.filter((item) => item.cpf === profile.cpf) : loanRequests
  const contributionBase = profile ? getUserFinance(profile, loanRequests, '2026', contributionPayments).reduce((sum, row) => sum + row.contribution, 0) : 0
  const suggestedMax = contributionBase * 1.2
  const lateOrPending = userRequests.filter((item) => item.status === 'pendente').length
  const currentMonthId = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
  const adminRiskUsers = profiles.map((item) => {
    const contributionLate = !contributionPayments[item.cpf]?.[currentMonthId]
    const userLoanTotal = loanRequests.filter((request) => request.cpf === item.cpf && request.status === 'aprovado').reduce((sum, request) => sum + request.amount, 0)
    const income = Number(item.monthlyIncome.replace(',', '.')) || 1
    const highConsumption = userLoanTotal > income * 0.35
    const pending = loanRequests.some((request) => request.cpf === item.cpf && request.status === 'pendente')
    return {
      ...item,
      risk: highConsumption ? 'alto consumo' : contributionLate ? 'atraso de cota' : pending ? 'solicitação pendente' : 'baixo risco',
      level: highConsumption || contributionLate ? 'alto' : pending ? 'moderado' : 'baixo',
    }
  })
  const [aiInput, setAiInput] = useState('')
  const [aiMessages, setAiMessages] = useState<AiMessage[]>([
    {
      from: 'IA Iyalode',
      text:
        role === 'admin'
          ? 'Estou acompanhando solicitações pendentes, riscos por atraso e concentração de crédito.'
          : `Com base no seu perfil, posso conversar sobre empréstimos, trilhas e saúde do caixa. Seu teto prudente inicial é ${currency(suggestedMax)}.`,
    },
  ])

  return (
    <section className="view-stack">
      <div className="section-heading">
        <div>
          <span className="eyebrow">IA generativa</span>
          <h1 className="page-title">Alertas</h1>
        </div>
        <div className={lateOrPending ? 'alert-badge' : 'status-chip'}>
          <AlertTriangle size={16} aria-hidden="true" />
          {lateOrPending ? `${lateOrPending} alerta(s)` : 'sem alerta crítico'}
        </div>
      </div>
      <div className="alerts-grid">
        <article className="panel ai-panel">
          <div className="panel-title">
            <Bot size={20} aria-hidden="true" />
            <h2>Conversa com IA</h2>
          </div>
          <p>
            {role === 'admin'
              ? 'Análise coletiva: há solicitações pendentes para validação e acompanhamento de risco.'
              : `Com base na sua contribuição, o valor prudente para empréstimo neste mês é até ${currency(suggestedMax)}.`}
          </p>
          <div className="chat-window ai-chat-window">
            {aiMessages.map((item, index) => (
              <div className={item.from === 'Você' ? 'chat-message mine' : 'chat-message'} key={`${item.from}-${index}`}>
                <strong>{item.from}</strong>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
          <form
            className="chat-form"
            onSubmit={(event) => {
              event.preventDefault()
              if (!aiInput.trim()) return
              const answer = buildAiAnswer(profile, aiInput, suggestedMax, role)
              setAiMessages((current) => [...current, { from: 'Você', text: aiInput }, { from: 'IA Iyalode', text: answer }])
              setAiInput('')
            }}
          >
            <input value={aiInput} onChange={(event) => setAiInput(event.target.value)} placeholder="Pergunte sobre crédito, caixa ou trilhas" />
            <button type="submit">
              <Send size={17} aria-hidden="true" />
              Conversar
            </button>
          </form>
        </article>
        <article className="panel">
          <div className="panel-title">
            <Clock3 size={20} aria-hidden="true" />
            <h2>Sinais financeiros</h2>
          </div>
          <ul className="action-list">
            <li>Limite ideal calculado sobre contribuições e histórico da pessoa.</li>
            <li>Solicitações pendentes notificam o Adm.</li>
            <li>Atraso após 60 dias gera alerta para avaliação administrativa.</li>
          </ul>
        </article>
        {role === 'admin' && (
          <article className="panel wide-panel">
            <div className="panel-title">
              <AlertTriangle size={20} aria-hidden="true" />
              <h2>Usuárias com sinais de risco</h2>
            </div>
            <div className="risk-user-list">
              {adminRiskUsers.map((user) => (
                <div className="risk-user-row" key={user.cpf}>
                  <strong>{user.fullName}</strong>
                  <span>{user.segment}</span>
                  <span className={`status-dot status-dot--${user.level === 'alto' ? 'rejeitado' : user.level === 'moderado' ? 'pendente' : 'aprovado'}`}>
                    {user.risk}
                  </span>
                </div>
              ))}
            </div>
          </article>
        )}
      </div>
    </section>
  )
}

function AdminEntrepreneursView({
  profiles,
  onDeleteProfile,
}: {
  profiles: Profile[]
  onDeleteProfile: (profile: Profile) => void
}) {
  const [deleteTarget, setDeleteTarget] = useState<Profile | null>(null)

  return (
    <section className="view-stack">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Base de usuárias</span>
          <h1 className="page-title">Empreendedoras</h1>
        </div>
        <div className="status-chip">
          <Users size={16} aria-hidden="true" />
          {profiles.length} cadastradas
        </div>
      </div>
      <article className="panel">
        <div className="cash-table">
          <div className="cash-header entrepreneur-table-header">
            <span>Nome</span>
            <span>CPF</span>
            <span>Idade</span>
            <span>Escolaridade</span>
            <span>Segmento</span>
            <span>Território</span>
            <span>Renda</span>
            <span>Plano</span>
            <span>Ação</span>
          </div>
          {profiles.map((person) => (
            <div className="cash-row entrepreneur-table-row" key={person.cpf}>
              <strong data-label="Nome">{person.fullName}</strong>
              <span data-label="CPF">{person.cpf}</span>
              <span data-label="Idade">{person.age || '-'}</span>
              <span data-label="Escolaridade">{person.education || '-'}</span>
              <span data-label="Segmento">{person.segment || '-'}</span>
              <span data-label="Território">{person.neighborhood ? `${person.neighborhood}, ${person.city || 'Sao Paulo'}` : person.city || '-'}</span>
              <span data-label="Renda">{currency(Number(person.monthlyIncome.replace(',', '.')) || 0)}</span>
              <span data-label="Plano">{currency(person.plan)}</span>
              <span className="table-actions" data-label="Ação">
                <button
                  className="icon-button danger"
                  type="button"
                  aria-label={`Excluir ${person.fullName}`}
                  title={`Excluir ${person.fullName}`}
                  onClick={() => setDeleteTarget(person)}
                >
                  <Trash2 size={16} aria-hidden="true" />
                </button>
              </span>
            </div>
          ))}
        </div>
      </article>

      {deleteTarget && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Confirmar exclusão">
          <article className="modal">
            <h2>Excluir empreendedora?</h2>
            <p>Tem certeza que deseja remover {deleteTarget.fullName} do sistema?</p>
            <div className="decision-line">
              <button
                type="button"
                onClick={() => {
                  onDeleteProfile(deleteTarget)
                  setDeleteTarget(null)
                }}
              >
                Confirmar
              </button>
              <button className="ghost-button" type="button" onClick={() => setDeleteTarget(null)}>
                Cancelar
              </button>
            </div>
          </article>
        </div>
      )}
    </section>
  )
}

function AdminLoansView({
  loanRequests,
  onDecision,
}: {
  loanRequests: LoanRequest[]
  onDecision: (id: string, status: LoanStatus) => void
}) {
  return (
    <section className="view-stack">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Validação administrativa</span>
          <h1 className="page-title">Solicitações de empréstimo</h1>
        </div>
      </div>
      <article className="panel">
        <div className="cash-table">
          <div className="cash-header admin-loan-header">
            <span>Solicitante</span>
            <span>Data</span>
            <span>Valor</span>
            <span>Juros</span>
            <span>Prazo</span>
            <span>Motivo</span>
            <span>Status</span>
            <span>Decisão Adm</span>
          </div>
          {loanRequests.map((request) => (
            <div className="cash-row admin-loan-row" key={request.id}>
              <strong data-label="Solicitante">{request.borrowerName}</strong>
              <span data-label="Data">{new Intl.DateTimeFormat('pt-BR').format(new Date(`${request.requestedAt}T00:00:00`))}</span>
              <span data-label="Valor">{currency(request.amount)}</span>
              <span data-label="Juros">{currency(request.interest)}</span>
              <span data-label="Prazo">{new Intl.DateTimeFormat('pt-BR').format(new Date(`${request.dueDate}T00:00:00`))}</span>
              <span data-label="Motivo">{request.purpose}</span>
              <span className={`status-dot status-dot--${request.status}`} data-label="Status">
                {request.status}
              </span>
              <span className="decision-line" data-label="Decisão Adm">
                {request.status === 'pendente' ? (
                  <>
                    <button type="button" onClick={() => onDecision(request.id, 'aprovado')}>
                      Aprovar
                    </button>
                    <button className="ghost-button" type="button" onClick={() => onDecision(request.id, 'rejeitado')}>
                      Rejeitar
                    </button>
                  </>
                ) : (
                  <small className="decision-locked">Decisão registrada</small>
                )}
              </span>
            </div>
          ))}
        </div>
      </article>
    </section>
  )
}

function App() {
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>(() => mergeSeededUsers(readStored(storageKeys.users, [])))
  const [profiles, setProfiles] = useState<Profile[]>(() => mergeSeededProfiles(readStored(storageKeys.profiles, [])))
  const [session, setSession] = useState<Session | null>(() => readStored<Session | null>(storageKeys.session, null))
  const [pendingProfileName, setPendingProfileName] = useState('')
  const [loginError, setLoginError] = useState('')
  const [activeView, setActiveView] = useState<AppView>('caixa')
  const [loanRequests, setLoanRequests] = useState<LoanRequest[]>(() => mergeSeededLoanRequests(readStored(storageKeys.loans, [])))
  const [chats, setChats] = useState<Record<string, ChatMessage[]>>(() => readStored(storageKeys.chats, chatSeed))
  const [contributionPayments, setContributionPayments] = useState<ContributionPayments>(() =>
    mergeContributionPayments(initialContributionPayments, readStored(storageKeys.contributions, {})),
  )
  const [adminProfile, setAdminProfile] = useState<AdminProfile>(() => readStored(storageKeys.adminProfile, { photo: '', password: 'Adm' }))
  const [editingProfile, setEditingProfile] = useState(false)
  const [cashTab, setCashTab] = useState<CashTab>('resumo')
  const [toasts, setToasts] = useState<Toast[]>([])
  const [clientId] = useState(() => crypto.randomUUID())

  useEffect(() => {
    if (!('BroadcastChannel' in window)) {
      return
    }
    const channel = new BroadcastChannel('iyalode-chat')
    channel.onmessage = (event: MessageEvent<{ recipient: string; message: ChatMessage; senderId: string }>) => {
      const { recipient, message, senderId } = event.data
      if (senderId === clientId) {
        return
      }
      setChats((current) => ({
        ...current,
        [recipient]: [...(current[recipient] ?? []), message],
      }))
    }
    return () => channel.close()
  }, [clientId])

  useEffect(() => {
    writeStored(storageKeys.users, registeredUsers)
    writeStored(storageKeys.profiles, profiles)
    writeStored(storageKeys.session, session)
    writeStored(storageKeys.loans, loanRequests)
    writeStored(storageKeys.chats, chats)
    writeStored(storageKeys.contributions, contributionPayments)
    writeStored(storageKeys.adminProfile, adminProfile)
    writeStored(storageKeys.seedVersion, mockSeedVersion)
  }, [adminProfile, chats, contributionPayments, loanRequests, profiles, registeredUsers, session])

  const currentProfile = useMemo(
    () => profiles.find((profile) => profile.fullName.toLowerCase() === session?.name.toLowerCase()),
    [profiles, session?.name],
  )

  function showToast(message: string, tone: Toast['tone'] = 'success') {
    const id = Date.now()
    setToasts((current) => [...current, { id, message, tone }])
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id))
    }, 3000)
  }

  function handleDeleteProfile(person: Profile) {
    setProfiles((current) => current.filter((item) => item.cpf !== person.cpf))
    setRegisteredUsers((current) => current.filter((item) => item.fullName !== person.fullName))
    setLoanRequests((current) => current.filter((item) => item.cpf !== person.cpf))
    setContributionPayments((current) => {
      const next = { ...current }
      delete next[person.cpf]
      return next
    })
    showToast(`${person.fullName} removida do sistema.`, 'danger')
  }

  function handleUserLogin(name: string, password: string) {
    const user = registeredUsers.find((item) => item.fullName.toLowerCase() === name.trim().toLowerCase())
    if (!user || user.password !== password) {
      setLoginError('Login não encontrado ou senha incorreta. Crie uma nova conta se ainda não possui cadastro.')
      return
    }
    setLoginError('')
    setSession({ role: 'user', name: user.fullName })
    setPendingProfileName(profiles.some((profile) => profile.fullName === user.fullName) ? '' : user.fullName)
    setActiveView('caixa')
  }

  function handleRegister(name: string, password: string) {
    const fullName = name.trim()
    setRegisteredUsers((current) => [...current, { fullName, password }])
    setLoginError('')
    setSession({ role: 'user', name: fullName })
    setPendingProfileName(fullName)
    setActiveView('caixa')
  }

  function handleAdminLogin(name: string, password: string) {
    if (name !== 'Adm' || password !== adminProfile.password) {
      setLoginError('Login Adm inválido. Use Adm e senha Adm.')
      return
    }
    setLoginError('')
    setSession({ role: 'admin', name: 'Adm' })
    setActiveView('caixa')
  }

  if (!session) {
    return (
      <main className="login-page">
        <section className="login-hero" aria-labelledby="login-description">
          <LogoBlock />
          <p className="login-description" id="login-description">
            Plataforma financeira para organização de créditos coletivos de mulheres negras empreendedoras no Brasil.
          </p>
          {loginError && (
            <div className="login-error" role="alert">
              {loginError}
            </div>
          )}
          <div className="login-grid">
            <LoginCard
              role="user"
              onUserLogin={handleUserLogin}
              onAdminLogin={handleAdminLogin}
              onRegister={handleRegister}
              registeredUsers={registeredUsers}
            />
            <LoginCard
              role="admin"
              onUserLogin={handleUserLogin}
              onAdminLogin={handleAdminLogin}
              onRegister={handleRegister}
              registeredUsers={registeredUsers}
            />
          </div>
        </section>
        <AppFooter />
      </main>
    )
  }

  if (session.role === 'user' && (pendingProfileName || !currentProfile || editingProfile)) {
    return (
      <ProfileForm
        initialProfile={currentProfile ?? createBlankProfile(pendingProfileName || session.name)}
        onSave={(profile) => {
          setProfiles((current) => {
            const exists = current.some((item) => item.fullName === profile.fullName)
            return exists ? current.map((item) => (item.fullName === profile.fullName ? profile : item)) : [...current, profile]
          })
          setPendingProfileName('')
          setEditingProfile(false)
          setSession({ role: 'user', name: profile.fullName })
        }}
      />
    )
  }

  if (session.role === 'admin' && editingProfile) {
    return (
      <AdminProfileForm
        initialProfile={adminProfile}
        onSave={(profile) => {
          setAdminProfile(profile)
          setEditingProfile(false)
          showToast('Perfil Adm atualizado com sucesso.')
        }}
      />
    )
  }

  const navigation = session.role === 'admin' ? adminNavigation : userNavigation

  return (
    <div className={session.role === 'admin' ? 'app-shell app-shell--admin' : 'app-shell'}>
      <Header
        role={session.role}
        profile={currentProfile}
        adminProfile={adminProfile}
        onEditProfile={() => setEditingProfile(true)}
        onLogout={() => {
          setSession(null)
          setPendingProfileName('')
          setEditingProfile(false)
          setLoginError('')
          setActiveView('caixa')
        }}
      />
      <div className="workspace">
        <aside className="sidebar" aria-label="Navegacao principal">
          <nav>
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <div className="nav-group" key={item.id}>
                  <button
                    className={activeView === item.id ? 'active' : ''}
                    type="button"
                    onClick={() => setActiveView(item.id)}
                  >
                    <Icon size={18} aria-hidden="true" />
                    {item.label}
                  </button>
                  {session.role === 'user' && item.id === 'caixa' && activeView === 'caixa' && (
                    <div className="cash-subnav">
                      <button className={cashTab === 'resumo' ? 'active' : ''} type="button" onClick={() => setCashTab('resumo')}>
                        Resumo financeiro
                      </button>
                      <button className={cashTab === 'emprestimos' ? 'active' : ''} type="button" onClick={() => setCashTab('emprestimos')}>
                        Empréstimos
                      </button>
                      <button className={cashTab === 'contribuicoes' ? 'active' : ''} type="button" onClick={() => setCashTab('contribuicoes')}>
                        Contribuições
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </nav>
          <section className={session.role === 'admin' ? 'side-summary side-summary--admin-hidden' : 'side-summary'}>
            <span>Seu plano mensal</span>
            <strong>{currency(currentProfile?.plan ?? 0)}</strong>
            <small>contribuição recorrente</small>
          </section>
        </aside>

        <main className="content">
          {activeView === 'caixa' && (
            <CashFlowView
              profile={currentProfile}
              profiles={profiles}
              loanRequests={loanRequests}
              role={session.role}
              contributionPayments={contributionPayments}
              cashTab={cashTab}
              onLoanRequest={(request) => {
                setLoanRequests((current) => [request, ...current])
                showToast('Solicitação de empréstimo enviada com sucesso.')
              }}
              onContribute={(person, monthId) => {
                setContributionPayments((current) => ({
                  ...current,
                  [person.cpf]: {
                    ...(current[person.cpf] ?? {}),
                    [monthId]: true,
                  },
                }))
                showToast('Contribuição registrada com sucesso.')
              }}
              onDeleteProfile={handleDeleteProfile}
            />
          )}
          {activeView === 'trilhas' && <LearningView role={session.role} />}
          {activeView === 'comunidade' && (
            <CommunityView
              profiles={profiles}
              currentProfile={currentProfile}
              chats={chats}
              onSend={(recipient, message) => {
                const chatMessage = { from: 'Você', text: message }
                setChats((current) => ({
                  ...current,
                  [recipient]: [...(current[recipient] ?? []), chatMessage],
                }))
                if ('BroadcastChannel' in window) {
                  const channel = new BroadcastChannel('iyalode-chat')
                  channel.postMessage({ recipient, message: chatMessage, senderId: clientId })
                  channel.close()
                }
              }}
            />
          )}
          {activeView === 'alertas' && (
            <AlertsView profile={currentProfile} profiles={profiles} loanRequests={loanRequests} role={session.role} contributionPayments={contributionPayments} />
          )}
          {activeView === 'emprestimos' && session.role === 'admin' && (
            <AdminLoansView
              loanRequests={loanRequests}
              onDecision={(id, status) => {
                setLoanRequests((current) =>
                  current.map((request) =>
                    request.id === id && request.status === 'pendente'
                      ? { ...request, status, approvedBy: status === 'aprovado' ? 'Adm' : undefined }
                      : request,
                  ),
                )
                showToast(status === 'aprovado' ? 'Empréstimo aprovado com sucesso.' : 'Empréstimo rejeitado com sucesso.', status === 'aprovado' ? 'success' : 'danger')
              }}
            />
          )}
          {activeView === 'empreendedoras' && session.role === 'admin' && (
            <AdminEntrepreneursView profiles={profiles} onDeleteProfile={handleDeleteProfile} />
          )}
        </main>
      </div>
      <ToastStack toasts={toasts} />
      <AppFooter />
    </div>
  )
}

export default App
