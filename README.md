# Iyalode

Aplicação web demonstrativa criada para o Hackathon Feira Preta.

A **Iyalode** é uma plataforma de crédito comunitário para microempreendedoras negras periféricas. A proposta é organizar contribuições coletivas, empréstimos internos com juros baixos, trilhas de aprendizado e monitoramento de risco sem depender de colateral bancário.

> A garantia não é o colateral. É a comunidade.

## Status do MVP

Esta versão é uma demo 100% mockada para apresentação. Ela roda no navegador, usa `localStorage` para simular persistência e já está preparada para evoluir para backend REST, banco de dados e integrações reais de IA.

## Logins de demonstração

### Admin

```txt
Usuário: Adm
Senha: Adm
```

### Empreendedoras

```txt
Usuário: Bea Lacerda
Senha: Senha1
```

```txt
Usuário: Aline Rocha
Senha: Senha1
```

```txt
Usuário: Bruna Conceicao
Senha: Senha1
```

Outras empreendedoras mockadas também usam a senha `Senha1`.

## Funcionalidades

### Tela da usuária

- Resumo financeiro com contribuições, empréstimos aprovados e juros.
- Gráfico anual compacto e responsivo.
- Solicitação de empréstimo com cálculo automático de juros de 3%.
- Aba de contribuições com status por mês.
- Status `Mês fechado` em cinza e `Abrirá em breve` em laranja, mantendo o estado desabilitado.
- Trilha de aprendizado com cursos e vídeos vinculados ao Sebrae.
- Comunidade com chat mockado entre empreendedoras.
- Alertas com IA simulada que responde olhando os cursos cadastrados na plataforma.

### Tela do ADM

- Dashboard financeiro com:
  - total de contribuição;
  - total de empréstimos;
  - total no caixa;
  - total de usuárias;
  - total de juros;
  - taxa de manutenção da plataforma.
- Gráfico de linha do tempo compacto.
- Ranking de segmentos que mais solicitaram empréstimos.
- Aba `Empreendedoras` com tabela/lista de cadastradas e ação de exclusão.
- Aba `Empréstimos` com aprovação ou rejeição.
- Empréstimos já aprovados ou rejeitados ficam bloqueados para nova decisão.
- Telas de `Empréstimos` e `Empreendedoras` responsivas, virando cards em telas menores.
- Alertas administrativos com visão de risco coletivo.

## Dados mockados

Os dados principais ficam em:

```txt
src/data/mockData.ts
```

Esse arquivo contém:

- empreendedoras;
- negócios;
- coletivo;
- contribuições;
- empréstimos;
- pagamentos;
- eventos de risco.

A Bea Lacerda já está cadastrada no mock central e recebe contribuições simuladas junto com as demais empreendedoras.

## Stack

- React
- TypeScript
- Vite
- Vitest
- Lucide React
- CSS puro
- `localStorage` para persistência mockada

## Como rodar localmente

Instale as dependências:

```bash
npm install
```

Rode o servidor local:

```bash
npm run dev
```

Acesse:

```txt
http://127.0.0.1:5173/
```

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run test
```

## Validação

Antes de publicar, rode:

```bash
npm run test
npm run lint
npm run build
```

## Deploy na Vercel

Configuração recomendada:

```txt
Framework Preset: Vite
Install Command: npm install
Build Command: npm run build
Output Directory: dist
```

Se o projeto for publicado por uma organização, a conta usada no deploy precisa estar dentro do time da Vercel dessa organização e ter acesso ao repositório no GitHub.

## Estrutura principal

```txt
src/
  data/
    mockData.ts
    learningContent.ts
  domain/
    financeService.ts
    learningService.ts
    matchingService.ts
    recommendationService.ts
    riskService.ts
    scoreService.ts
    models.ts
  App.tsx
  App.css
```

## Motores de domínio

O projeto também contém serviços de domínio para a evolução do produto:

- `matchingService`: sugere grupos e calcula score de resiliência coletiva.
- `riskService`: monitora sinais de risco individual e coletivo.
- `scoreService`: calcula fatores de score.
- `recommendationService`: sugere ações preventivas.
- `financeService`: calcula fluxo de caixa do coletivo.
- `learningService`: monta trilhas de aprendizado.

## Próximos passos

- Criar backend REST.
- Persistir dados em PostgreSQL ou Supabase.
- Implementar autenticação real por perfil.
- Criar painel específico para mentoras.
- Integrar IA/ML real para matching, risco e recomendação educacional.
- Formalizar consentimento e auditoria LGPD.
