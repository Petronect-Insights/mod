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

### Perfis de classificação

| Perfil | Sinal |
|--------|-------|
| **Alta interação + abandono** | Demonstrou interesse, iniciou proposta, saiu antes da conclusão |
| **Alta frequência sem conclusão** | Navega com frequência, nunca submete proposta |
| **Jornada concluída** | Proposta submetida com sucesso |
| **Baixa interação** | Poucos acessos, sem engajamento com oportunidades |

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

- **Dashboard** — métricas de comportamento, distribuição de prioridade e funil (Retornaram ao Portal / Retomaram a oportunidade / Proposta submetida / Taxa de reengajamento)
- **Fornecedores do Portal** — lista com busca, filtro por prioridade, score comportamental e barra visual de progresso
- **Análise individual** — stepper de jornada (Necessidade → Análise → Proposta → Desfecho), linha do tempo com módulos do portal, motivo da classificação e motor de reengajamento
- **Central de automações** — acompanhamento de reengajamentos ativos organizados por oportunidade, canal e urgência
- **Plano de contato multi-toque** — 5 etapas com canal, urgência e status por fornecedor
- **Simulação de eventos** — demonstração do ciclo completo (abandono → reengajamento → retomada → conclusão)
- **Modo escuro** — alternância entre tema claro e escuro

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

Desenvolvido para o **Hackathon Petronect** como protótipo funcional de solução de analytics comportamental para o Portal Petronect. Os dados são simulados — em produção, os eventos seriam capturados diretamente do portal via instrumentação de eventos no frontend e integrados à rastreabilidade nativa do portal (histórico de ações e participações).

---

*Petronect Insights — Do clique anônimo à ação direcionada.*
