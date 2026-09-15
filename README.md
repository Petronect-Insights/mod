# Petronect Insights

**Rastreabilidade comportamental e reengajamento automático para o Portal Petronect**

> Disponibilizar a plataforma não é decidir a contratação. O Petronect Insights identifica o fornecedor certo, na oportunidade certa, e aciona o canal mais eficiente antes que o prazo se esgote.

---

## O problema

O Portal Petronect conecta o Grupo Petrobras a fornecedores para compras e contratações desde 2002. Cada oportunidade tem requisitos, prazos e condições próprias — mas hoje só se sabe *quantos* acessos acontecem. Não se sabe quem trava, quem abandona o fluxo ou quem está prestes a desistir.

Um fornecedor que não consegue submeter uma proposta no **Módulo Propostas** não é apenas um problema de UX — é uma oportunidade de negócio perdida para ambos os lados, e o Contratante fica aguardando sem saber o motivo.

## A solução

O **Petronect Insights** captura eventos de comportamento de navegação, classifica automaticamente cada fornecedor em um perfil de risco e aciona o reengajamento no canal certo antes que o abandono se torne definitivo.

### A jornada do fornecedor no portal

```
[1] Necessidade      [2] Análise          [3] Proposta         [4] Desfecho
    Contratante          Fornecedor            Fornecedor            Contratante
    Publica a            Lê condições,         Prepara e             Avalia e conduz
    oportunidade         esclarece dúvidas     envia informações     as etapas seguintes
```

O abandono quase sempre ocorre na etapa **Proposta**. O Insights detecta isso em tempo real e aciona o canal mais adequado.

### Sistema de sinais

| Sinal | Condição |
|-------|----------|
| **Crítico** | Prazo urgente com abandono, ou score ≥ 85 |
| **Atenção** | Abandono detectado, ou score ≥ 50 |
| **Monitoramento** | Baixo engajamento, sem abandono recente |

O sinal substitui o ranking numérico de score — o foco é urgência, não hierarquia de importância entre fornecedores.

### Motor de reengajamento — plano de contato

| Etapa | Canal | Ativado quando |
|-------|-------|----------------|
| T+0h | Notificação no Portal Petronect | Sempre |
| T+4h | E-mail com link de retomada | Sempre |
| T+16h | **Sala de Colaboração** do edital | Score ≥ 50 (ou erro técnico detectado) |
| T+24h | WhatsApp Business / segundo e-mail + guia | Score ≥ 70 |
| T+48h | Ligação direta, gestor comercial Petronect | Score ≥ 85 ou prazo urgente |

O canal do T+16h é adaptativo: quando o abandono for causado por erro de preenchimento, a mensagem muda para apoio técnico via Sala de Colaboração.

---

## Funcionalidades (MVP)

### Dashboard
- **ROI strip** — faixa com métricas em destaque: propostas em risco, valor monitorado estimado, reengajamentos ativos e custo de infraestrutura (R$ 0)
- **Métricas com CountUp** — todos os números animam de 0 ao valor real ao carregar
- **Eventos em tempo real** — feed ao vivo com eventos do portal aparecendo a cada 3 segundos (logins, buscas, abandonos detectados pelo motor)
- **Distribuição de prioridade** — gráfico de rosca ou barras horizontais, alternável
- **Funil de resultado** — Acionados → Retornaram → Retomaram → Concluíram
- **Lista de prioridades** — os 5 fornecedores que merecem atenção imediata

### Usuários do Portal
- Lista completa com busca e filtro por prioridade (Alta, Média, Baixa)
- Cards com sinal (Crítico, Atenção, Monitoramento), comportamento e status de automação

### Análise individual
- **Stepper de jornada** — Necessidade → Análise → Proposta → Desfecho, com indicador de travamento
- **Linha do tempo de eventos** — módulos do portal, horários e marcação do ponto de abandono
- **Score comportamental** — anel visual com pontuação interna (base dos gatilhos do motor)
- **Motivo da classificação** — comportamento detectado e contexto do edital
- **Exportar ficha** — download de `.txt` com todos os dados e histórico de eventos do fornecedor

### Automações
- **Motor de reengajamento ativo** — lista de fornecedores com automações em andamento, filtro por status (Aguardando, Em andamento, Concluído)
- **Simulação de eventos** — demonstração do ciclo completo: abandono → notificação → retomada → conclusão
- **Plano de contato detalhado** — 5 etapas com canal, urgência, mensagem enviada e status por fornecedor
- **Toasts de feedback** — notificação visual ao acionar simulações

### Configuração
- **Fluxo de integração** — diagrama Portal Petronect → Motor Insights → Canais de contato
- **Módulos monitorados** — quais eventos são capturados por módulo (Oportunidades, Propostas, Sala de Colaboração, Login)
- **Cadência de reengajamento** — visão completa do plano multi-toque com delay, canal e condição de ativação
- **Fatores do score** — explicação de como o motor comportamental pontua cada tipo de evento

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Interface | React 19 + Vite 8 |
| Roteamento | Hash-based customizado |
| Estilo | CSS inline (zero dependências externas) |
| Dados | Simulados com motor comportamental em JS puro |
| Deploy | GitHub Pages via GitHub Actions |

**Custo de infraestrutura: R$ 0**

---

## Como rodar localmente

```bash
npm install
npm run dev
```

Acesse `http://localhost:5173`

## Demo

[petronect-insights.github.io/mod](https://petronect-insights.github.io/mod/)

---

## Contexto

Desenvolvido para o **Hackathon Petronect** como protótipo funcional de solução de analytics comportamental para o Portal Petronect. Os dados são simulados — em produção, os eventos seriam capturados diretamente do portal via instrumentação de eventos no frontend e integrados à rastreabilidade nativa do portal (histórico de ações e participações em editais).

---

*Petronect Insights — Do clique anônimo à ação direcionada.*
