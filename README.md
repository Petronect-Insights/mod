# Petronect Insights

**Inteligência comportamental para o Portal Petronect**

> Transformamos a navegação no portal em inteligência de relacionamento — identificando quais fornecedores estão ativos, quais estão travando e quais estão prestes a desistir, para que a equipe certa aja antes que uma oportunidade seja perdida.

---

## O problema

O Portal Petronect concentra todo o relacionamento comercial entre a Petrobras e seus fornecedores — cadastro, licitações, propostas e contratos. Porém, hoje só se sabe *quantos* acessos acontecem. Não se sabe quem trava, quem abandona o fluxo ou quem está prestes a desistir.

Um fornecedor que não consegue submeter uma proposta não é apenas um problema de UX — é uma oportunidade de negócio perdida para ambos os lados.

## A solução

O **Petronect Insights** captura eventos de comportamento de navegação, classifica automaticamente cada fornecedor em um perfil de risco e aciona o reengajamento antes que o abandono se torne definitivo.

### Perfis de classificação

| Perfil | Sinal |
|--------|-------|
| **Ativo** | Acessa regularmente e conclui fluxos |
| **Em atrito** | Tentativas repetidas, tempo alto, recarregamentos |
| **Em risco** | Frequência caindo, sessões sem ação |
| **Alta interação + abandono** | Demonstrou interesse mas saiu antes da conclusão |

### Ciclo automático

```
Fornecedor acessa o portal
        ↓
Eventos de comportamento são capturados
(login, cliques, buscas, downloads, abandono)
        ↓
Motor classifica o perfil automaticamente
        ↓
Dashboard prioriza quem precisa de atenção agora
        ↓
Reengajamento disparado + acompanhamento do retorno
```

---

## Funcionalidades (MVP)

- **Dashboard** — visão geral com métricas de comportamento, distribuição de prioridade e funil de reengajamento
- **Visão de usuários** — lista com busca, filtro por prioridade e score comportamental de cada fornecedor
- **Análise individual** — linha do tempo de eventos, motivos da classificação e motor de reengajamento
- **Central de automações** — acompanhamento de todos os reengajamentos disparados
- **Simulação de eventos** — botão que simula o retorno do fornecedor ao portal (demonstração do ciclo completo)
- **Modo escuro** — alternância entre tema claro e escuro

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Interface | React 19 + Vite |
| Roteamento | Hash-based customizado |
| Estilo | CSS inline (zero dependências) |
| Dados | Simulados (sem API externa) |
| Deploy | Vercel |

**Custo de infraestrutura: R$ 0**

---

## Como rodar localmente

```bash
npm install
npm run dev
```

Acesse `http://localhost:5173`

## Deploy

O projeto está publicado em: [petronect-insights.vercel.app](https://petronect-insights.vercel.app)

---

## Contexto

Desenvolvido para o **Hackathon Petronect** como protótipo funcional de solução de analytics comportamental para o Portal Petronect. Os dados são simulados — em produção, os eventos seriam capturados diretamente do portal via instrumentação de eventos no frontend.

---

*Petronect Insights — Do clique anônimo à ação direcionada.*
