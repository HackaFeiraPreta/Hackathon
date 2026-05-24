# AfroCapital Coletivo

Plataforma web demonstrativa para o MVP do **AfroCapital Coletivo**, uma solução de crédito comunitário para microempreendedoras negras periféricas.

A proposta parte de uma lógica simples: a garantia não é o colateral. É a comunidade.

## Sobre o projeto

O AfroCapital Coletivo organiza grupos de 10 a 20 microempreendedoras que contribuem mensalmente para um fundo compartilhado. Esse fundo permite empréstimos internos com juros baixos, enquanto a plataforma acompanha risco coletivo, recomenda ações preventivas e oferece uma trilha de aprendizado para formalização e crescimento do negócio.

Esta versão é uma aplicação web mockada para demonstração no hackathon. Ela ainda não usa banco de dados nem autenticação real, mas a lógica principal foi separada em serviços de domínio para facilitar uma evolução futura para backend REST.

## Funcionalidades

- Dashboard do coletivo com saldo, crédito circulando e saúde do grupo.
- Motor de matching comunitário com score de resiliência.
- Monitoramento de risco coletivo com alertas preventivos.
- Fluxo de caixa do fundo compartilhado.
- Trilha de aprendizado personalizada por perfil de empreendedora.
- Links para cursos EAD oficiais do Sebrae por tema.
- Payloads de exemplo para futura API REST.
- Testes unitários dos principais serviços de negócio.

## Trilha de aprendizado

A trilha foi desenhada para usuárias com diferentes níveis de escolaridade, usando linguagem simples, passos curtos e apoio em vídeo/áudio.

Conteúdos incluídos:

- O que é MEI e quando vale a pena.
- Como abrir MEI pelo celular.
- Como separar dinheiro da casa e do negócio.
- Como colocar preço sem perder dinheiro.
- Como pagar o DAS do MEI.
- Quando emitir nota fiscal.
- Como preparar o negócio para crédito maior.
- Como apresentar o negócio para clientes ou fornecedores.

Cada aula da trilha aponta para uma busca oficial de cursos do Sebrae, como MEI, finanças, preço, nota fiscal, crédito e vendas.

## Motores implementados

### Matching comunitário

O `matchingService` sugere grupos e calcula um score de resiliência de 0 a 100 considerando:

- diversidade de tipos de negócio;
- diversidade territorial;
- estabilidade de renda;
- regularidade de pagamento;
- engajamento comunitário;
- sazonalidade;
- tendência de atividade financeira.

O resultado indica se a composição deve ser `aprovar`, `revisar` ou `rejeitar`, com explicação dos fatores.

### Monitoramento de risco

O `riskService` calcula um score de risco de 0 a 100 e classifica o alerta como `baixo`, `moderado`, `alto` ou `critico`.

Sinais monitorados:

- atraso em contribuição;
- queda de atividade financeira;
- baixa interação;
- concentração de empréstimos;
- tendência de inadimplência;
- risco de colapso do grupo.

As recomendações são preventivas e não punitivas.

### Fluxo de caixa

O `financeService` calcula:

- contribuições pagas;
- empréstimos liberados;
- pagamentos recebidos;
- juros retornados ao fundo;
- taxa da plataforma sobre juros;
- saldo mensal;
- projeção do próximo ciclo.

### Trilha personalizada

O `learningService` monta uma trilha de aprendizado usando:

- estágio de formalização;
- tipo de negócio;
- estabilidade de renda;
- regularidade de pagamento;
- tendência de atividade do negócio.

## Governança de acesso

O produto considera três papéis principais:

| Papel | Acesso esperado |
| --- | --- |
| Empreendedora | Seus dados, seus pagamentos, seus empréstimos, trilha pessoal, saldo do coletivo e alertas não sensíveis. |
| Mentora | Evolução da trilha, necessidades de apoio, estágio do negócio e recomendações de acompanhamento. |
| Admin | Operação, risco, auditoria, pagamentos, eventos de risco e dados agregados/anonimizados. |

Dados sensíveis como CPF, documentos, endereço completo, score individual cru e detalhes de inadimplência não devem ser expostos para outras integrantes do coletivo.

## Stack

- React
- TypeScript
- Vite
- Vitest
- Lucide React
- Dados mockados em memória

## Como rodar

Instale as dependências:

```bash
npm install
```

Rode o servidor de desenvolvimento:

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

## Estrutura

```txt
src/
  data/
    learningContent.ts
    mockData.ts
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

## Payloads futuros da API

### Cadastrar empreendedora

```http
POST /empreendedoras
```

```json
{
  "nome": "Aline Rocha",
  "territorio": "Capao Redondo",
  "tipoNegocio": "beleza",
  "rendaMensal": 3400,
  "formalizacao": "mei_em_preparo"
}
```

### Sugerir grupo

```http
POST /coletivos/sugerir-grupo
```

```json
{
  "tamanhoAlvo": 15,
  "criterios": [
    "diversidade_negocios",
    "regularidade_pagamento",
    "engajamento_comunitario",
    "sazonalidade"
  ]
}
```

### Consultar risco do coletivo

```http
GET /coletivos/c-001/risco
```

```json
{
  "score": 90,
  "alerta": "critico",
  "sinais": [
    "contribuicao_atrasada",
    "queda_atividade",
    "baixa_interacao"
  ]
}
```

### Registrar empréstimo

```http
POST /emprestimos
```

```json
{
  "coletivoId": "c-001",
  "empreendedoraId": "u-004",
  "valor": 650,
  "jurosMes": 0.03,
  "prazoDias": 60,
  "finalidade": "Insumos para confeitaria"
}
```

## Próximos passos

- Criar backend REST.
- Persistir dados em PostgreSQL ou Supabase.
- Implementar autenticação e autorização por perfil.
- Criar painel específico para mentoras.
- Integrar IA/ML para matching, risco e trilha educacional.
- Criar auditoria de consentimento LGPD.
- Substituir vídeos mockados por conteúdos próprios ou incorporados oficialmente.
