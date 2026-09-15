import { useEffect, useMemo, useState } from "react";

/* =========================================================
   DADOS SIMULADOS
========================================================= */

const baseUsers = [
  {
    id: "empresa-a",
    name: "Metalúrgica Nordeste Ltda",
    type: "Fornecedor",
    lastAccess: "Hoje, 10:15",
    edital: "nº 4600123456",
    prazo: "18/09, faltam 3 dias",
    prazoUrgente: true,
    events: [
      { time: "10:02", type: "Login", detail: "Acesso ao Portal Petronect", phase: "before" },
      { time: "10:05", type: "Busca", detail: "Módulo Oportunidades, consultou editais de licitação abertos", phase: "before" },
      { time: "10:07", type: "Visualização", detail: "Módulo Oportunidades, visualizou edital nº 4600123456", phase: "before" },
      { time: "10:10", type: "Download", detail: "Módulo Propostas, baixou caderno de especificações técnicas", phase: "before" },
      { time: "10:12", type: "Início de jornada", detail: "Módulo Propostas, iniciou envio de proposta comercial", phase: "before" },
      { time: "10:15", type: "Abandono", detail: "Módulo Propostas, abandonou envio antes do prazo de entrega", phase: "before" },
    ],
    followUpTemplate: [
      { time: "11:02", type: "Login", detail: "Retornou ao Portal após contato da equipe Petronect", phase: "after" },
      { time: "11:07", type: "Retomada de jornada", detail: "Retomou envio da proposta comercial", phase: "after" },
      { time: "11:18", type: "Conclusão", detail: "Proposta submetida dentro do prazo", phase: "after" },
    ],
  },

  {
    id: "empresa-b",
    name: "Construtora Vega S.A.",
    type: "Fornecedor",
    lastAccess: "Hoje, 09:40",
    events: [
      { time: "09:20", type: "Login", detail: "Acesso ao Portal Petronect", phase: "before" },
      { time: "09:25", type: "Busca", detail: "Consultou oportunidades disponíveis", phase: "before" },
      { time: "09:30", type: "Visualização", detail: "Visualizou edital nº 4600098712", phase: "before" },
      { time: "09:40", type: "Conclusão", detail: "Proposta submetida com sucesso", phase: "before" },
    ],
    followUpTemplate: [],
  },

  {
    id: "empresa-c",
    name: "Distribuidora Atlântico ME",
    type: "Fornecedor",
    lastAccess: "Há 12 dias",
    events: [
      { time: "14:02", type: "Login", detail: "Acesso ao Portal Petronect", phase: "before" },
      { time: "14:05", type: "Visualização", detail: "Visualizou área de cadastro de fornecedor", phase: "before" },
    ],
    followUpTemplate: [],
  },

  {
    id: "empresa-d",
    name: "Tech Suprimentos Bahia",
    type: "Fornecedor",
    lastAccess: "Hoje, 09:35",
    edital: "nº 4600201345",
    prazo: "22/09, faltam 7 dias",
    prazoUrgente: false,
    events: [
      { time: "08:30", type: "Login", detail: "Acesso ao Portal Petronect", phase: "before" },
      { time: "08:35", type: "Busca", detail: "Módulo Oportunidades, consultou editais da categoria Tecnologia", phase: "before" },
      { time: "08:40", type: "Visualização", detail: "Módulo Oportunidades, visualizou edital nº 4600201345", phase: "before" },
      { time: "08:48", type: "Início de jornada", detail: "Módulo Propostas, iniciou envio de proposta técnica", phase: "before" },
      { time: "08:55", type: "Abandono", detail: "Módulo Propostas, erro no preenchimento de campos obrigatórios", phase: "before" },
    ],
    followUpTemplate: [
      { time: "09:22", type: "Login", detail: "Retornou ao Portal após o reengajamento", phase: "after" },
      { time: "09:27", type: "Retomada de jornada", detail: "Retomou a atividade anteriormente abandonada", phase: "after" },
      { time: "09:35", type: "Conclusão", detail: "Concluiu a jornada com sucesso", phase: "after" },
    ],
  },

  {
    id: "empresa-e",
    name: "Porto Seguro Logística",
    type: "Cliente",
    lastAccess: "Ontem, 16:20",
    events: [
      { time: "15:45", type: "Login", detail: "Acesso ao Portal Petronect", phase: "before" },
      { time: "15:53", type: "Busca", detail: "Consultou contratos de logística disponíveis", phase: "before" },
      { time: "16:03", type: "Download", detail: "Baixou minuta de contrato de prestação de serviços", phase: "before" },
      { time: "16:20", type: "Conclusão", detail: "Documentação enviada e processo finalizado", phase: "before" },
    ],
    followUpTemplate: [],
  },

  {
    id: "empresa-f",
    name: "Serviços Integrados JK",
    type: "Fornecedor",
    lastAccess: "Hoje, 11:30",
    events: [
      { time: "11:01", type: "Login", detail: "Acesso ao Portal Petronect", phase: "before" },
      { time: "11:05", type: "Busca", detail: "Consultou editais da categoria Serviços Gerais", phase: "before" },
      { time: "11:10", type: "Visualização", detail: "Visualizou edital nº 4600334421", phase: "before" },
      { time: "11:16", type: "Busca", detail: "Refinou busca por região geográfica", phase: "before" },
      { time: "11:22", type: "Visualização", detail: "Visualizou edital nº 4600334590", phase: "before" },
      { time: "11:30", type: "Visualização", detail: "Consultou requisitos de habilitação técnica", phase: "before" },
    ],
    followUpTemplate: [],
  },
];

/* =========================================================
   MOTOR DE ANÁLISE
========================================================= */

function analyzeUser(user) {
  const originalEvents = user.events.filter(
    (event) => event.phase !== "after"
  );

  const interactions = originalEvents.length;

  const searches = originalEvents.filter(
    (event) => event.type === "Busca"
  ).length;

  const views = originalEvents.filter(
    (event) => event.type === "Visualização"
  ).length;

  const downloads = originalEvents.filter(
    (event) => event.type === "Download"
  ).length;

  const started = originalEvents.some(
    (event) => event.type === "Início de jornada"
  );

  const abandoned = originalEvents.some(
    (event) => event.type === "Abandono"
  );

  const completed = originalEvents.some(
    (event) => event.type === "Conclusão"
  );

  let score = 0;
  const reasons = [];

  if (interactions >= 6) {
    score += 25;
    reasons.push("Alto volume de interações");
  } else if (interactions >= 4) {
    score += 15;
    reasons.push("Volume relevante de interações");
  } else {
    score += 5;
    reasons.push("Baixo volume de interações");
  }

  if (searches >= 3) {
    score += 15;
    reasons.push("Realizou múltiplas buscas");
  } else if (searches >= 1) {
    score += 10;
    reasons.push("Realizou buscas no Portal");
  }

  if (views >= 1) {
    score += 10;
    reasons.push("Visualizou conteúdos");
  }

  if (downloads >= 1) {
    score += 10;
    reasons.push("Realizou download");
  }

  if (started) {
    score += 20;
    reasons.push("Iniciou uma jornada");
  }

  if (abandoned) {
    score += 25;
    reasons.push("Abandonou antes da conclusão");
  }

  if (completed) {
    score -= 25;
    reasons.push("Jornada já concluída");
  }

  score = Math.max(0, Math.min(100, score));

  let priority = "Baixa";

  if (score >= 70) {
    priority = "Alta";
  } else if (score >= 40) {
    priority = "Média";
  }

  let behavior = "Interação moderada";

  if (abandoned && started) {
    behavior = "Alta interação + abandono";
  } else if (completed) {
    behavior = "Jornada concluída";
  } else if (interactions >= 6) {
    behavior = "Alta frequência sem conclusão";
  } else if (interactions <= 2) {
    behavior = "Baixa interação";
  }

  let signal;
  if ((user.prazoUrgente && abandoned) || score >= 85) {
    signal = "Crítico";
  } else if (abandoned || score >= 50) {
    signal = "Atenção";
  } else {
    signal = "Monitoramento";
  }

  return {
    ...user,
    interactions,
    searches,
    views,
    downloads,
    started,
    abandoned,
    completed,
    score,
    priority,
    behavior,
    signal,
    reasons,
  };
}

/* =========================================================
   MOTOR DE REENGAJAMENTO
========================================================= */

function applyReengagementEngine(user) {
  const postEvents = user.events.filter(
    (event) => event.phase === "after"
  );

  const shouldReengage =
    user.priority === "Alta" &&
    user.abandoned &&
    !user.completed;

  if (!shouldReengage) {
    return {
      ...user,
      automation: {
        active: false,
        status: "Monitoramento",
        trigger: null,
        action: null,
        execution: null,
        returned: false,
        continued: false,
        completed: false,
      },
    };
  }

  const returned = postEvents.some(
    (event) => event.type === "Login"
  );

  const continued = postEvents.some(
    (event) =>
      event.type === "Retomada de jornada" ||
      event.type === "Início de jornada"
  );

  const completed = postEvents.some(
    (event) => event.type === "Conclusão"
  );

  let status = "Aguardando retorno";

  if (returned) {
    status = "Usuário retornou";
  }

  if (continued) {
    status = "Jornada retomada";
  }

  if (completed) {
    status = "Concluído";
  }

  let trigger = "Alta prioridade + abandono após demonstração de interesse";
  let action = "Contato prioritário com link de retomada da proposta";
  let execution = "Olá! Notamos que você iniciou uma proposta no Portal mas não concluiu. Nossa equipe pode ajudar, retome de onde parou.";

  if (user.behavior === "Alta frequência sem conclusão") {
    trigger = "Alta frequência de navegação sem submissão de proposta detectada";
    action = "Convite para sessão de orientação com especialista Petronect";
    execution = "Identificamos que você navega com frequência pelo Portal mas ainda não submeteu uma proposta. Podemos agendar uma sessão de orientação com nossa equipe técnica?";
  } else if (user.behavior === "Alta interação + abandono") {
    trigger = "Abandono após início de proposta comercial, comportamento de alta intenção";
    action = "Contato prioritário com link direto de retomada da proposta";
    execution = "Olá! Notamos que você iniciou uma proposta no Portal mas não concluiu. Nossa equipe pode ajudar, retome de onde parou.";
  }

  const abandonEvent = user.events.find((e) => e.type === "Abandono");
  const abandonedAt = abandonEvent
    ? abandonEvent.detail.split(", ")[0]
    : null;

  let channel, channelLevel;
  if (user.score >= 85 || user.prazoUrgente) {
    channel = "Ligação direta, gestor comercial";
    channelLevel = "Urgente";
  } else if (user.score >= 70) {
    channel = "WhatsApp Business + link de retomada";
    channelLevel = "Alta";
  } else {
    channel = "E-mail personalizado";
    channelLevel = "Média";
  }

  const hasFieldError = !!(abandonEvent && (
    abandonEvent.detail.toLowerCase().includes("erro") ||
    abandonEvent.detail.toLowerCase().includes("campo")
  ));
  const steps = [
    { delay: "T+0h",  label: "Notificação no Portal Petronect",                                                                   done: true },
    { delay: "T+4h",  label: "E-mail com link direto para retomar a proposta",                                                     done: true },
    { delay: "T+16h", label: hasFieldError ? "Sala de Colaboração, apoio técnico no preenchimento da proposta" : "Mensagem via Sala de Colaboração do edital", done: user.score >= 50 },
    { delay: "T+24h", label: user.score >= 70 ? "WhatsApp Business com urgência" : "Segundo e-mail + guia de apoio ao usuário",    done: user.score >= 70 },
    { delay: "T+48h", label: "Ligação direta, gestor comercial Petronect",                                                        done: !!(user.score >= 85 || user.prazoUrgente) },
  ];

  return {
    ...user,
    automation: {
      active: true,
      trigger,
      action,
      execution,
      status,
      returned,
      continued,
      completed,
      channel,
      channelLevel,
      abandonedAt,
      steps,
    },
  };
}

/* =========================================================
   ROTAS
========================================================= */

function getRoute() {
  const hash = window.location.hash || "#/";

  if (hash === "#/users") {
    return { page: "users", userId: null };
  }

  if (hash === "#/automations") {
    return { page: "automations", userId: null };
  }

  if (hash === "#/config") {
    return { page: "config", userId: null };
  }

  if (hash.startsWith("#/automation/")) {
    return {
      page: "automation",
      userId: decodeURIComponent(
        hash.replace("#/automation/", "")
      ),
    };
  }

  if (hash.startsWith("#/user/")) {
    return {
      page: "details",
      userId: decodeURIComponent(
        hash.replace("#/user/", "")
      ),
    };
  }

  return {
    page: "dashboard",
    userId: null,
  };
}

/* =========================================================
   COMPONENTES BÁSICOS
========================================================= */

function PriorityBadge({ priority }) {
  return (
    <span className={`priority priority-${priority}`}>
      {priority}
    </span>
  );
}

function SignalBadge({ signal }) {
  const cls = signal === "Crítico" ? "signal-Critico" : signal === "Atenção" ? "signal-Atencao" : "signal-Monitoramento";
  return (
    <span className={`signal-badge ${cls}`}>
      <span className="signal-dot" />
      {signal}
    </span>
  );
}

function AutomationBadge({ automation }) {
  if (!automation.active) {
    return (
      <span className="automation-badge automation-off">
        Monitoramento
      </span>
    );
  }

  if (automation.completed) {
    return (
      <span className="automation-badge automation-success">
        Concluído
      </span>
    );
  }

  if (automation.continued || automation.returned) {
    return (
      <span className="automation-badge automation-progress">
        Em andamento
      </span>
    );
  }

  return (
    <span className="automation-badge automation-active">
      Aguardando
    </span>
  );
}

function StatCard({ value, label, type }) {
  return (
    <article className="stat-card">
      <div className={`stat-card-accent stat-card-accent-${type}`} />
      <strong className="stat-value"><CountUp value={value} /></strong>
      <span className="stat-label">{label}</span>
    </article>
  );
}

function Header({
  goHome,
  goUsers,
  goAutomations,
  goConfig,
  page,
  theme,
  toggleTheme,
}) {
  const usersActive =
    page === "users" || page === "details";

  const automationActive =
    page === "automations" || page === "automation";

  return (
    <header className="topbar">
      <div className="topbar-content">
        <button className="brand" onClick={goHome}>
          <span>PETRONECT</span>
          <strong>Insights</strong>
        </button>

        <nav className="main-nav">
          <button
            className={page === "dashboard" ? "nav-active" : ""}
            onClick={goHome}
          >
            Dashboard
          </button>

          <button
            className={usersActive ? "nav-active" : ""}
            onClick={goUsers}
          >
            Usuários
          </button>

          <button
            className={automationActive ? "nav-active" : ""}
            onClick={goAutomations}
          >
            Automações
          </button>

          <button
            className={page === "config" ? "nav-active" : ""}
            onClick={goConfig}
          >
            Configuração
          </button>
        </nav>

        <div className="header-actions">
          <div className="mvp-badge">
            <span className="status-dot" />
            MVP
          </div>

          <button
            className="theme-toggle"
            onClick={toggleTheme}
          >
            <span>{theme === "light" ? "☾" : "☀"}</span>

            <span className="theme-label">
              {theme === "light" ? "Escuro" : "Claro"}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}

function MiniBar({
  label,
  value,
  max,
  tone = "blue",
}) {
  const width =
    max > 0 ? Math.max(4, (value / max) * 100) : 0;

  return (
    <div className="mini-bar-row">
      <div className="mini-bar-heading">
        <span>{label}</span>
        <strong>{value}</strong>
      </div>

      <div className="mini-bar-track">
        <div
          className={`mini-bar-fill mini-${tone}`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

function DonutChart({ segments }) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  if (total === 0) return null;

  const r = 46;
  const cx = 70;
  const cy = 70;
  const circ = 2 * Math.PI * r;

  let cumulative = 0;

  const arcs = segments.map((seg) => {
    const frac = seg.value / total;
    const dash = frac * circ;
    const gap = circ - dash;
    const dashOffset = circ - cumulative * circ;
    cumulative += frac;
    return { ...seg, dash, gap, dashOffset };
  });

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
      <svg width="140" height="140" viewBox="0 0 140 140" style={{ flexShrink: 0 }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--surface-soft)" strokeWidth="18" />
        {arcs.map((arc, i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={arc.color}
            strokeWidth="18"
            strokeDasharray={`${arc.dash} ${arc.gap}`}
            strokeDashoffset={arc.dashOffset}
            transform={`rotate(-90, ${cx}, ${cy})`}
          />
        ))}
        <text x={cx} y={cy - 7} textAnchor="middle"
          style={{ fontSize: "22px", fontWeight: 750, fill: "var(--text)", fontFamily: "inherit" }}>
          {total}
        </text>
        <text x={cx} y={cy + 14} textAnchor="middle"
          style={{ fontSize: "10px", fill: "var(--muted)", fontFamily: "inherit" }}>
          usuários
        </text>
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 11, flex: 1, minWidth: 100 }}>
        {segments.map((seg) => (
          <div key={seg.label} style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: seg.color, flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: "var(--text-secondary)", fontWeight: 550 }}>{seg.label}</span>
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "baseline", gap: 5 }}>
              <strong style={{ fontSize: 15 }}>{seg.value}</strong>
              <span style={{ fontSize: 11, color: "var(--muted)" }}>{Math.round(seg.value / total * 100)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================================================
   CONFIGURAÇÃO / INTEGRAÇÃO
========================================================= */

const CONFIG_MODULES = [
  { name: "Módulo Oportunidades", events: ["Busca", "Visualização", "Download"], status: "ativo" },
  { name: "Módulo Propostas",     events: ["Início de jornada", "Abandono", "Conclusão"], status: "ativo" },
  { name: "Sala de Colaboração",  events: ["Pergunta", "Resposta", "Mensagem"], status: "ativo" },
  { name: "Portal — Login",       events: ["Login", "Logout", "Sessão"], status: "ativo" },
];

const CONFIG_CHANNELS = [
  { canal: "Notificação no Portal", delay: "T+0h",  nivel: "Sempre",  cor: "#29488f" },
  { canal: "E-mail",                delay: "T+4h",  nivel: "Sempre",  cor: "#29488f" },
  { canal: "Sala de Colaboração",   delay: "T+16h", nivel: "Score ≥ 50", cor: "#d7a633" },
  { canal: "WhatsApp Business",     delay: "T+24h", nivel: "Score ≥ 70", cor: "#d7a633" },
  { canal: "Ligação direta",        delay: "T+48h", nivel: "Score ≥ 85 ou prazo urgente", cor: "#d85b5b" },
];

function ConfigPage() {
  return (
    <div className="config-page">
      <div className="config-header">
        <div>
          <span className="eyebrow">INTEGRAÇÃO</span>
          <h1 className="config-title">Configuração do sistema</h1>
          <p className="config-subtitle">Como o Petronect Insights se conecta ao Portal e define a cadência de reengajamento.</p>
        </div>
        <span className="config-status-badge">
          <span className="live-dot" style={{background:"#71bf44"}} />
          Sistema operacional
        </span>
      </div>

      {/* Fluxo de integração */}
      <div className="config-flow">
        <div className="config-flow-node config-flow-node-portal">
          <strong>Portal Petronect</strong>
          <span>Fonte de eventos</span>
        </div>
        <div className="config-flow-arrow">
          <span className="config-arrow-label">webhooks</span>
          <div className="config-arrow-line" />
        </div>
        <div className="config-flow-node config-flow-node-engine">
          <strong>Motor Insights</strong>
          <span>Análise comportamental</span>
        </div>
        <div className="config-flow-arrow">
          <span className="config-arrow-label">gatilhos</span>
          <div className="config-arrow-line" />
        </div>
        <div className="config-flow-node config-flow-node-channels">
          <strong>Canais de contato</strong>
          <span>Reengajamento multi-toque</span>
        </div>
      </div>

      <div className="config-grid">
        {/* Módulos capturados */}
        <div className="config-card">
          <span className="eyebrow">CAPTURA DE EVENTOS</span>
          <h2 className="config-card-title">Módulos monitorados</h2>
          <div className="config-modules">
            {CONFIG_MODULES.map((m) => (
              <div key={m.name} className="config-module-row">
                <div className="config-module-info">
                  <span className="config-module-dot" />
                  <strong>{m.name}</strong>
                </div>
                <div className="config-module-events">
                  {m.events.map((e) => (
                    <span key={e} className="config-event-tag">{e}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cadência de canais */}
        <div className="config-card">
          <span className="eyebrow">CADÊNCIA DE REENGAJAMENTO</span>
          <h2 className="config-card-title">Plano de contato multi-toque</h2>
          <div className="config-channels">
            {CONFIG_CHANNELS.map((c, i) => (
              <div key={i} className="config-channel-row">
                <span className="config-channel-delay">{c.delay}</span>
                <div className="config-channel-bar" style={{borderLeft:`3px solid ${c.cor}`, paddingLeft:12}}>
                  <strong>{c.canal}</strong>
                  <span>{c.nivel}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Score comportamental */}
        <div className="config-card config-card-full">
          <span className="eyebrow">MOTOR COMPORTAMENTAL</span>
          <h2 className="config-card-title">Como o score é calculado</h2>
          <div className="config-score-factors">
            {[
              { fator: "Interações no portal",         peso: "+15 por evento registrado" },
              { fator: "Abandono de jornada",           peso: "+35 (gatilho principal)" },
              { fator: "Prazo crítico detectado",       peso: "+20 (urgência)" },
              { fator: "Múltiplas tentativas",          peso: "+10 por retorno" },
              { fator: "Erro técnico no preenchimento", peso: "+15 (suporte prioritário)" },
            ].map((f) => (
              <div key={f.fator} className="config-factor-row">
                <span className="config-factor-name">{f.fator}</span>
                <span className="config-factor-peso">{f.peso}</span>
              </div>
            ))}
          </div>
          <p className="config-score-note">Score ≥ 85 ou prazo urgente = sinal Crítico. Score ≥ 50 = Atenção. Abaixo = Monitoramento.</p>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   ABA "EM ATENÇÃO" (mantida no arquivo, não está no nav)
========================================================= */

function getSinais(user) {
  const sinais = [];
  if (user.abandoned) sinais.push({ label: "Abandono de jornada", color: "#d85b5b" });
  if (user.events.filter(e => e.type === "Abandono" || e.type === "Início de jornada").length > 1)
    sinais.push({ label: "Múltiplas tentativas", color: "#d7a633" });
  if (user.automation?.hasFieldError) sinais.push({ label: "Erro no preenchimento", color: "#d85b5b" });
  if (user.prazoUrgente) sinais.push({ label: "Prazo se esgota em breve", color: "#d85b5b" });
  if (user.interactions >= 5 && !user.abandoned)
    sinais.push({ label: "Alta frequência sem conclusão", color: "#d7a633" });
  if (!user.abandoned && user.interactions < 3)
    sinais.push({ label: "Baixa interação", color: "#8d9aad" });
  if (sinais.length === 0) sinais.push({ label: "Monitoramento padrão", color: "#8d9aad" });
  return sinais.slice(0, 3);
}

function getAcao(user) {
  if (user.priority === "Alta")  return { label: "Entrar em contato", cls: "atencao-btn-alta" };
  if (user.priority === "Média") return { label: "Enviar orientação",  cls: "atencao-btn-media" };
  return                                { label: "Monitorar",          cls: "atencao-btn-baixa" };
}

function AtencaoPage({ users, onSelectUser }) {
  const [filter, setFilter] = useState("Todos");
  const [search, setSearch] = useState("");

  const emAtencao = users.filter(u => u.signal !== "Monitoramento" || u.abandoned);
  const altaPrioridade = users.filter(u => u.priority === "Alta");

  const filtered = emAtencao.filter(u => {
    const matchFilter = filter === "Todos" || u.priority === filter;
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const pct = (n) => Math.round((n / users.length) * 100);

  return (
    <div className="atencao-page">
      {/* ── Header ── */}
      <div className="atencao-header">
        <div>
          <h1 className="atencao-title">Usuários em atenção</h1>
          <p className="atencao-subtitle">Identifique quem precisa de ação e entenda os motivos.</p>
        </div>
        <span className="atencao-period">Últimos 30 dias</span>
      </div>

      {/* ── Stats ── */}
      <div className="atencao-stats">
        <div className="atencao-stat">
          <strong>{users.length}</strong>
          <span>Usuários analisados</span>
        </div>
        <div className="atencao-stat atencao-stat-mid">
          <strong>{emAtencao.length} <em>{pct(emAtencao.length)}%</em></strong>
          <span>Em atenção</span>
        </div>
        <div className="atencao-stat">
          <strong>{altaPrioridade.length} <em>{pct(altaPrioridade.length)}%</em></strong>
          <span>Alta prioridade</span>
        </div>
      </div>

      {/* ── Filtros ── */}
      <div className="atencao-filters">
        <div className="search-wrap" style={{maxWidth: 260}}>
          <span className="search-icon">⌕</span>
          <input
            placeholder="Buscar fornecedor..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="atencao-pills">
          {["Todos", "Alta", "Média", "Baixa"].map(p => (
            <button
              key={p}
              className={`priority-pill${filter === p ? " pill-active" : ""} priority-pill-${p}`}
              onClick={() => setFilter(p)}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tabela ── */}
      <div className="atencao-table-wrap">
        <div className="atencao-table-head">
          <span>Usuário</span>
          <span>Nível de atenção</span>
          <span>Principais sinais</span>
          <span>Última atividade</span>
          <span>Ação sugerida</span>
        </div>

        {filtered.map(user => {
          const sinais = getSinais(user);
          const acao = getAcao(user);
          const lastEvent = user.events[user.events.length - 1];
          return (
            <div
              key={user.id}
              className="atencao-row"
              onClick={() => onSelectUser(user)}
            >
              <div className="atencao-cell-user">
                <div className={`company-avatar avatar-priority-${user.priority}`} style={{width:36,height:36,fontSize:14}}>
                  {user.name[0].toUpperCase()}
                </div>
                <div>
                  <strong>{user.name}</strong>
                  <span>{user.type}</span>
                </div>
              </div>

              <div>
                <PriorityBadge priority={user.priority} />
              </div>

              <div className="atencao-sinais">
                {sinais.map((s, i) => (
                  <div key={i} className="atencao-sinal">
                    <span className="atencao-sinal-dot" style={{background: s.color}} />
                    <span>{s.label}</span>
                  </div>
                ))}
              </div>

              <div className="atencao-cell-date">
                {lastEvent ? lastEvent.time : user.lastAccess}
              </div>

              <div onClick={e => e.stopPropagation()}>
                <button
                  className={`atencao-btn ${acao.cls}`}
                  onClick={() => onSelectUser(user)}
                >
                  {acao.label}
                </button>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="atencao-empty">Nenhum usuário encontrado.</div>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   FEED DE EVENTOS (pool para simulação ao vivo)
========================================================= */

const FEED_POOL = [
  { company: "Metalúrgica Nordeste Ltda",  type: "Login",            detail: "Acesso ao Portal Petronect",                              sys: false },
  { company: "Tech Suprimentos Bahia",     type: "Busca",            detail: "Módulo Oportunidades, consultou editais de Tecnologia",    sys: false },
  { company: "Construtora Vega S.A.",      type: "Visualização",     detail: "Módulo Oportunidades, visualizou edital nº 4600098712",    sys: false },
  { company: "Distribuidora Atlântico ME", type: "Login",            detail: "Primeiro acesso do dia",                                  sys: false },
  { company: "Engenharia Sul Ltda",        type: "Download",         detail: "Módulo Propostas, baixou especificações técnicas",         sys: false },
  { company: "Petroforte Serviços",        type: "Busca",            detail: "Módulo Oportunidades, consultou bens e serviços industriais", sys: false },
  { company: "Motor",                      type: "Detecção",         detail: "Abandono detectado, Metalúrgica Nordeste Ltda",            sys: true  },
  { company: "Motor",                      type: "Automação",        detail: "Notificação disparada, Tech Suprimentos Bahia",           sys: true  },
  { company: "Motor",                      type: "Retorno",          detail: "Novo login detectado, Metalúrgica Nordeste Ltda",          sys: true  },
  { company: "Tech Suprimentos Bahia",     type: "Início de jornada",detail: "Módulo Propostas, iniciou envio de proposta técnica",      sys: false },
  { company: "Construtora Vega S.A.",      type: "Conclusão",        detail: "Proposta submetida com sucesso",                          sys: false },
  { company: "Motor",                      type: "Sala de Colaboração", detail: "Mensagem enviada, Tech Suprimentos Bahia",             sys: true  },
];

function makeFeedTime(secsAgo) {
  if (secsAgo < 5)  return "agora";
  if (secsAgo < 60) return `há ${secsAgo}s`;
  return `há ${Math.floor(secsAgo / 60)}min`;
}

/* ── CountUp ── */
function CountUp({ value }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (!value) { setDisplay(0); return; }
    let current = 0;
    const steps = 24;
    const inc = value / steps;
    const t = setInterval(() => {
      current += inc;
      if (current >= value) { setDisplay(value); clearInterval(t); }
      else setDisplay(Math.floor(current));
    }, 700 / steps);
    return () => clearInterval(t);
  }, [value]);
  return <>{display}</>;
}

/* ── ToastContainer ── */
function ToastContainer({ toasts }) {
  if (!toasts.length) return null;
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          <span className="toast-dot" />
          <div className="toast-body">
            <strong>{t.title}</strong>
            <span>{t.message}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

/* =========================================================
   DASHBOARD
========================================================= */

function Dashboard({
  users,
  onSeeAll,
  onSelectUser,
  openAutomations,
}) {
  const [chartView, setChartView] = useState("donut");

  const [feedItems, setFeedItems] = useState(() =>
    FEED_POOL.slice(0, 5).map((item, i) => ({ ...item, id: i, secsAgo: (5 - i) * 14 + 8 }))
  );

  useEffect(() => {
    let idx = 5;
    const interval = setInterval(() => {
      const item = FEED_POOL[idx % FEED_POOL.length];
      idx++;
      setFeedItems((prev) => [
        { ...item, id: Date.now(), secsAgo: 0 },
        ...prev.map((f) => ({ ...f, secsAgo: f.secsAgo + 3 })).slice(0, 5),
      ]);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const priorityUsers = users.filter(
    (user) =>
      user.priority === "Alta" ||
      user.priority === "Média"
  );

  const activeAutomations = users.filter(
    (user) => user.automation.active
  );

  const returned = activeAutomations.filter(
    (user) => user.automation.returned
  ).length;

  const continued = activeAutomations.filter(
    (user) => user.automation.continued
  ).length;

  const completed = activeAutomations.filter(
    (user) => user.automation.completed
  ).length;

  const successRate =
    activeAutomations.length > 0
      ? Math.round(
          (completed / activeAutomations.length) * 100
        )
      : 0;

  const priorityCounts = {
    Alta: users.filter((user) => user.priority === "Alta").length,
    Média: users.filter((user) => user.priority === "Média").length,
    Baixa: users.filter((user) => user.priority === "Baixa").length,
  };

  const maxPriority = Math.max(
    priorityCounts.Alta,
    priorityCounts.Média,
    priorityCounts.Baixa,
    1
  );

  return (
    <>
      <section className="hero">
        <div className="hero-tag">
          Rastreabilidade e reengajamento · Portal Petronect
        </div>

        <h1>
          Quem merece atenção
          <span> agora?</span>
        </h1>

        <p>
          Disponibilizar a plataforma não é decidir a contratação.
          O Petronect Insights identifica o fornecedor certo, na oportunidade certa,
          e aciona o canal mais eficiente antes que o prazo se esgote.
        </p>
      </section>

      {(() => {
        const abandoned = users.filter(u => u.abandoned).length;
        const valorEmRisco = abandoned * 480;
        const ativos = activeAutomations.length;
        const recuperados = completed > 0 ? completed : returned;
        return (
          <div className="roi-strip">
            <div className="roi-item">
              <strong><CountUp value={abandoned} /></strong>
              <span>proposta{abandoned !== 1 ? "s" : ""} em risco</span>
            </div>
            <div className="roi-divider" />
            <div className="roi-item roi-item-highlight">
              <strong>R$ <CountUp value={valorEmRisco} />k</strong>
              <span>valor monitorado</span>
            </div>
            <div className="roi-divider" />
            <div className="roi-item">
              <strong><CountUp value={ativos} /></strong>
              <span>reengajamento{ativos !== 1 ? "s" : ""} ativo{ativos !== 1 ? "s" : ""}</span>
            </div>
            <div className="roi-divider" />
            <div className="roi-item">
              <strong>R$ 0</strong>
              <span>custo de infraestrutura</span>
            </div>
          </div>
        );
      })()}

      <section className="stats-grid">
        <StatCard
          value={users.length}
          label="Usuários analisados"
          type="blue"
        />

        <StatCard
          value={
            users.filter((user) =>
              user.behavior.includes("Alta")
            ).length
          }
          label="Alta interação"
          type="green"
        />

        <StatCard
          value={
            users.filter((user) => user.abandoned).length
          }
          label="Abandonos"
          type="blue"
        />

        <StatCard
          value={activeAutomations.length}
          label="Reengajamentos automáticos"
          type="green"
        />
      </section>

      <section className="results-strip">
        <div>
          <span>Retornaram ao Portal</span>
          <strong><CountUp value={returned} /></strong>
        </div>
        <div>
          <span>Retomaram a oportunidade</span>
          <strong><CountUp value={continued} /></strong>
        </div>
        <div>
          <span>Proposta submetida</span>
          <strong><CountUp value={completed} /></strong>
        </div>
        <div>
          <span>Taxa de reengajamento</span>
          <strong><CountUp value={successRate} />%</strong>
        </div>
      </section>

      <section className="charts-grid">
        <article className="chart-card">
          <div className="chart-heading">
            <div>
              <span className="eyebrow">COMPORTAMENTO</span>
              <h2>Distribuição por prioridade</h2>
            </div>

            <div className="chart-toggle">
              <button
                className={chartView === "donut" ? "chart-toggle-active" : ""}
                onClick={() => setChartView("donut")}
                title="Gráfico de rosca"
              >◎</button>
              <button
                className={chartView === "bars" ? "chart-toggle-active" : ""}
                onClick={() => setChartView("bars")}
                title="Barras horizontais"
              >≡</button>
            </div>
          </div>

          <div style={{ marginTop: 24 }}>
            {chartView === "donut" ? (
              <DonutChart
                segments={[
                  { label: "Alta prioridade", value: priorityCounts.Alta, color: "#d85b5b" },
                  { label: "Média prioridade", value: priorityCounts.Média, color: "#d7a633" },
                  { label: "Baixa prioridade", value: priorityCounts.Baixa, color: "#8d9aad" },
                ]}
              />
            ) : (
              <div className="bars-list">
                <MiniBar label="Alta" value={priorityCounts.Alta} max={maxPriority} tone="red" />
                <MiniBar label="Média" value={priorityCounts.Média} max={maxPriority} tone="yellow" />
                <MiniBar label="Baixa" value={priorityCounts.Baixa} max={maxPriority} tone="gray" />
              </div>
            )}
          </div>
        </article>

        <article className="chart-card">
          <div className="chart-heading">
            <div>
              <span className="eyebrow">REENGAJAMENTO</span>
              <h2>Funil de resultado</h2>
            </div>

            <button
              className="text-button"
              onClick={openAutomations}
            >
              Central →
            </button>
          </div>

          <div className="funnel">
            <div>
              <strong><CountUp value={activeAutomations.length} /></strong>
              <span>Acionados</span>
            </div>
            <div>
              <strong><CountUp value={returned} /></strong>
              <span>Retornaram</span>
            </div>
            <div>
              <strong><CountUp value={continued} /></strong>
              <span>Retomaram</span>
            </div>
            <div>
              <strong><CountUp value={completed} /></strong>
              <span>Concluíram</span>
            </div>
          </div>
        </article>
      </section>

      <section className="live-feed-section">
        <div className="live-feed-header">
          <div>
            <span className="eyebrow">ATIVIDADE DO PORTAL</span>
            <h2 style={{margin:"4px 0 0"}}>Eventos em tempo real</h2>
          </div>
          <span className="live-indicator">
            <span className="live-dot" />
            ao vivo
          </span>
        </div>
        <div className="live-feed-list">
          {feedItems.map((item) => (
            <div key={item.id} className={`feed-item${item.sys ? " feed-item-sys" : ""} feed-item-enter`}>
              <span className="feed-time">{makeFeedTime(item.secsAgo)}</span>
              <span className={`feed-type-dot feed-type-${item.type.replace(/\s/g,"")}`} />
              <div className="feed-content">
                <strong>{item.company}</strong>
                <span>{item.type} · {item.detail}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="main-panel">
        <div className="panel-header">
          <div>
            <span className="eyebrow">PRIORIDADES</span>

            <h2>Quem merece atenção agora</h2>

            <p>
              Usuários priorizados automaticamente pelo motor
              comportamental.
            </p>
          </div>

          <button
            className="primary-button"
            onClick={onSeeAll}
          >
            Ver todos →
          </button>
        </div>

        <div className="user-list">
          <div className="table-header">
            <span>Usuário</span>
            <span>Comportamento</span>
            <span>Sinal</span>
            <span>Prioridade</span>
            <span>Automação</span>
          </div>

          {priorityUsers.slice(0, 5).map((user) => (
            <button
              className="user-row"
              key={user.id}
              onClick={() => onSelectUser(user)}
            >
              <div className="company-info">
                <div className="company-avatar">
                  {user.name[0].toUpperCase()}
                </div>

                <div>
                  <strong>{user.name}</strong>
                  <span>{user.type}</span>
                </div>
              </div>

              <div className="behavior-text">
                {user.behavior}
              </div>

              <div className="score-cell">
                <SignalBadge signal={user.signal} />
              </div>

              <div>
                <PriorityBadge priority={user.priority} />
              </div>

              <div>
                <AutomationBadge
                  automation={user.automation}
                />
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="engine-banner">
        <div className="engine-icon">◎</div>

        <div>
          <span>MOTOR AUTOMÁTICO</span>

          <h3>
            Detectar. Priorizar. Agir. Medir.
          </h3>

          <p>
            A análise não termina no abandono. O sistema acompanha
            automaticamente se o usuário retornou e concluiu a jornada.
          </p>
        </div>

        <button onClick={openAutomations}>
          Ver automações →
        </button>
      </section>
    </>
  );
}

/* =========================================================
   USUÁRIOS
========================================================= */

function UsersPage({
  users,
  onBack,
  onSelectUser,
}) {
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] =
    useState("Todas");

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const searchOk =
        user.name
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        user.behavior
          .toLowerCase()
          .includes(search.toLowerCase());

      const priorityOk =
        priorityFilter === "Todas" ||
        user.priority === priorityFilter;

      return searchOk && priorityOk;
    });
  }, [users, search, priorityFilter]);

  return (
    <section className="page-section">
      <div className="page-hero">
        <span className="eyebrow">RASTREABILIDADE POR OPORTUNIDADE</span>
        <h1>Fornecedores do Portal</h1>
        <p>Histórico de ações e participações de cada fornecedor — identifique comportamentos, prazos críticos e quem precisa de suporte agora.</p>
      </div>

      <div className="search-wrap">
        <span className="search-icon-char">⌕</span>
        <input
          type="text"
          placeholder="Buscar empresa ou comportamento..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <div className="filter-row">
        <div className="priority-pills">
          {["Todas", "Alta", "Média", "Baixa"].map((p) => (
            <button
              key={p}
              className={`priority-pill priority-pill-${p}${priorityFilter === p ? " pill-active" : ""}`}
              onClick={() => setPriorityFilter(p)}
            >
              {p}
            </button>
          ))}
        </div>
        <span className="result-tally">
          <strong>{filteredUsers.length}</strong> fornecedores
        </span>
      </div>

      <div className="users-grid">
        {filteredUsers.map((user) => (
          <article
            key={user.id}
            className={`user-card user-card-priority-${user.priority}`}
            onClick={() => onSelectUser(user)}
          >
            <div className="user-card-top">
              <div className={`company-avatar large avatar-priority-${user.priority}`}>
                {user.name[0].toUpperCase()}
              </div>
              <PriorityBadge priority={user.priority} />
            </div>

            <h3>{user.name}</h3>
            <span className="user-type-label">{user.type}</span>

            <div className="user-card-behavior">{user.behavior}</div>

            <div className="user-card-signal">
              <SignalBadge signal={user.signal} />
            </div>

            <div className="user-card-footer">
              <div className="user-card-stat">
                <span>Interações</span>
                <strong>{user.interactions}</strong>
              </div>
              <div className="user-card-automation-inline">
                <AutomationBadge automation={user.automation} />
              </div>
            </div>

            <div className="user-card-cta">Ver análise completa →</div>
          </article>
        ))}
      </div>
    </section>
  );
}

/* =========================================================
   CENTRAL DE AUTOMAÇÕES
========================================================= */

const ACOES_CONFIG = {
  email:   { label: "Disparar e-mail",       done: "E-mail enviado",    type: "success" },
  sala:    { label: "Sala de Colaboração",   done: "Mensagem enviada",  type: "success" },
  ligacao: { label: "Acionar ligação",        done: "Equipe acionada",   type: "alert"   },
  whats:   { label: "WhatsApp Business",      done: "Mensagem enviada",  type: "success" },
};

function AcaoBtn({ userId, acao, fired, onFire, variant = "primary" }) {
  const cfg = ACOES_CONFIG[acao];
  const key = userId + acao;
  const isDone = !!fired[key];
  return (
    <button
      className={`aa-btn aa-btn-${variant}${isDone ? " aa-btn-done" : ""}`}
      onClick={(e) => { e.stopPropagation(); onFire(userId, acao); }}
    >
      {isDone ? cfg.done : cfg.label}
    </button>
  );
}

function AutomationsPage({
  users,
  onBack,
  openAutomation,
  addToast,
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [fired, setFired] = useState({});

  function fireAction(userId, acao) {
    const key = userId + acao;
    if (fired[key]) return;
    setFired((prev) => ({ ...prev, [key]: true }));
    const cfg = ACOES_CONFIG[acao];
    const user = users.find((u) => u.id === userId);
    addToast(cfg.done, user?.name || "", cfg.type);
    setTimeout(() => setFired((prev) => { const c = { ...prev }; delete c[key]; return c; }), 3000);
  }

  const activeUsers = users.filter((user) => user.automation.active);

  const manualUsers = users.filter(
    (u) => (u.signal === "Crítico" || u.signal === "Atenção") &&
            u.abandoned && !u.automation.completed
  );

  const filtered = activeUsers.filter((user) => {
    const searchOk = user.name.toLowerCase().includes(search.toLowerCase());
    let statusOk = true;
    if (statusFilter === "Aguardando")   statusOk = !user.automation.returned && !user.automation.completed;
    if (statusFilter === "Em andamento") statusOk = user.automation.returned && !user.automation.completed;
    if (statusFilter === "Concluído")    statusOk = user.automation.completed;
    return searchOk && statusOk;
  });

  const waiting   = activeUsers.filter((u) => !u.automation.returned).length;
  const progress  = activeUsers.filter((u) => u.automation.returned && !u.automation.completed).length;
  const completed = activeUsers.filter((u) => u.automation.completed).length;

  return (
    <section className="page-section">

      {/* ── Seção: Motor ativo ── */}
      <div className="automations-band">
        <div className="page-hero" style={{ marginBottom: 0 }}>
          <span className="eyebrow">MOTOR DE REENGAJAMENTO</span>
          <h1>Automações ativas</h1>
          <p>Fornecedores acionados automaticamente, com canal e urgência definidos pelo comportamento no Portal.</p>
        </div>
        <div className="automations-band-stats">
          <div><strong>{activeUsers.length}</strong><span>acionados</span></div>
          <div><strong>{waiting}</strong><span>aguardando</span></div>
          <div><strong>{progress}</strong><span>em andamento</span></div>
          <div><strong>{completed}</strong><span>concluídos</span></div>
        </div>
      </div>

      <div className="search-wrap" style={{ marginBottom: 16 }}>
        <span className="search-icon-char">⌕</span>
        <input
          value={search}
          placeholder="Buscar empresa..."
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <div className="filter-row" style={{ marginBottom: 24 }}>
        <div className="priority-pills">
          {["Todos", "Aguardando", "Em andamento", "Concluído"].map((s) => (
            <button
              key={s}
              className={`priority-pill${statusFilter === s ? " pill-active" : ""}`}
              onClick={() => setStatusFilter(s)}
            >
              {s}
            </button>
          ))}
        </div>
        <span className="result-tally">
          <strong>{filtered.length}</strong> automação{filtered.length !== 1 ? "ões" : ""}
        </span>
      </div>

      <div className="automation-list">
        {filtered.map((user) => (
          <article className="automation-list-card" key={user.id}>
            <div className="automation-list-main">
              <div className="company-avatar">{user.name[0].toUpperCase()}</div>
              <div>
                <strong>{user.name}</strong>
                <span>{user.behavior}</span>
              </div>
            </div>
            <div className="automation-list-info">
              <span>Sinal</span>
              <SignalBadge signal={user.signal} />
            </div>
            <div className="automation-list-info">
              <span>Status</span>
              <AutomationBadge automation={user.automation} />
            </div>
            <div className="automation-list-info">
              <span>Resultado</span>
              <strong>
                {user.automation.completed ? "Concluiu"
                  : user.automation.continued ? "Retomou jornada"
                  : user.automation.returned  ? "Retornou"
                  : "Aguardando"}
              </strong>
            </div>
            <button className="details-button" onClick={() => openAutomation(user)}>
              Acompanhar →
            </button>
          </article>
        ))}
        {filtered.length === 0 && (
          <div className="no-results">Nenhuma automação encontrada.</div>
        )}
      </div>
    </section>
  );
}

function ScoreRing({ score }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const fill = circ - (score / 100) * circ;
  const color = score >= 70 ? "#d85b5b" : score >= 40 ? "#d7a633" : "#8d9aad";
  return (
    <div style={{ position: "relative", width: 80, height: 80, flexShrink: 0 }}>
      <svg width="80" height="80" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="40" cy="40" r={r} fill="none" stroke="var(--border)" strokeWidth="6" />
        <circle cx="40" cy="40" r={r} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={circ} strokeDashoffset={fill} strokeLinecap="round" />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <strong style={{ fontSize: 20, lineHeight: 1 }}>{score}</strong>
        <small style={{ color: "var(--muted)", fontSize: 9 }}>/100</small>
      </div>
    </div>
  );
}

/* =========================================================
   STEPPER DE JORNADA (Necessidade → Análise → Proposta → Desfecho)
========================================================= */

function JourneySteps({ user }) {
  const types = user.events.map((e) => e.type);
  const abandoned = user.abandoned;
  const concluded = user.automation?.completed || types.includes("Conclusão");
  const atProposta = types.includes("Início de jornada") || types.includes("Abandono");
  const atAnalise = types.includes("Visualização") || types.includes("Busca") || types.includes("Download");

  let currentStep = 1;
  if (concluded) currentStep = 4;
  else if (atProposta) currentStep = 3;
  else if (atAnalise) currentStep = 2;

  const stepsData = [
    { num: 1, label: "Necessidade", role: "Contratante" },
    { num: 2, label: "Análise",     role: "Fornecedor"  },
    { num: 3, label: "Proposta",    role: "Fornecedor"  },
    { num: 4, label: "Desfecho",    role: "Contratante" },
  ];

  return (
    <div className="journey-steps">
      {stepsData.map((step, i) => {
        const isPast   = step.num < currentStep;
        const isActive = step.num === currentStep;
        const isStuck  = isActive && abandoned && !concluded;
        const isDone   = isPast || (isActive && concluded);
        let cls = "journey-step";
        if (isDone)  cls += " journey-step-done";
        if (isActive && !isStuck) cls += " journey-step-active";
        if (isStuck) cls += " journey-step-stuck";
        return (
          <div key={step.num} className="journey-step-wrap">
            <div className={cls}>
              <div className="journey-num">{isStuck ? "!" : step.num}</div>
              <strong className="journey-label">{step.label}</strong>
              <span className="journey-role">{step.role}</span>
            </div>
            {i < stepsData.length - 1 && (
              <div className={`journey-connector${isPast ? " journey-connector-done" : ""}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* =========================================================
   DETALHES DO USUÁRIO
========================================================= */

function UserDetails({
  user,
  onBack,
  openAutomation,
}) {
  if (!user) return null;

  return (
    <section className="page-section">
      <div className={`profile-header profile-header-${user.priority}`}>
        <div className="profile-main">
          <div className={`company-avatar profile avatar-priority-${user.priority}`}>
            {user.name[0].toUpperCase()}
          </div>

          <div>
            <span className="eyebrow">ANÁLISE DO USUÁRIO</span>
            <h1>{user.name}</h1>
            <div className="profile-meta">
              <span>{user.type}</span>
              <span>•</span>
              <span>Último acesso: {user.lastAccess}</span>
            </div>
            <div className="profile-tags">
              <span className="profile-tag">{user.behavior}</span>
              <SignalBadge signal={user.signal} />
            </div>
          </div>
        </div>

        <div className="profile-priority">
          <span>Prioridade atual</span>
          <PriorityBadge priority={user.priority} />
          <div className="profile-score-ring">
            <ScoreRing score={user.score} />
          </div>
          <button
            className="export-btn"
            onClick={() => {
              const lines = [
                `Fornecedor: ${user.name}`,
                `Tipo: ${user.type}`,
                `Prioridade: ${user.priority}`,
                `Sinal: ${user.signal}`,
                `Comportamento: ${user.behavior}`,
                `Interações: ${user.interactions}`,
                `Último acesso: ${user.lastAccess}`,
                `Score comportamental: ${user.score}`,
                ``,
                `Histórico de eventos:`,
                ...user.events.map(e => `${e.time}  |  ${e.type}  |  ${e.detail}`),
              ];
              const blob = new Blob([lines.join("\n")], { type: "text/plain" });
              const a = document.createElement("a");
              a.href = URL.createObjectURL(blob);
              a.download = `${user.name.replace(/\s+/g,"_")}_ficha.txt`;
              a.click();
            }}
          >
            Exportar ficha
          </button>
        </div>
      </div>

      <JourneySteps user={user} />

      <div className="detail-stats">
        <div>
          <span>Interações</span>
          <strong>{user.interactions}</strong>
        </div>

        <div>
          <span>Buscas</span>
          <strong>{user.searches}</strong>
        </div>

        <div>
          <span>Visualizações</span>
          <strong>{user.views}</strong>
        </div>

        <div>
          <span>Downloads</span>
          <strong>{user.downloads}</strong>
        </div>
      </div>

      <div className="details-layout">
        <article className="detail-panel">
          <span className="eyebrow">
            JORNADA
          </span>

          <h2>Linha do tempo</h2>

          <div className="timeline">
            {user.events.map((event, index) => (
              <div
                className={`timeline-item ${
                  event.phase === "after"
                    ? "timeline-after"
                    : ""
                }`}
                key={`${event.time}-${index}`}
              >
                <div className="timeline-marker">
                  <span className={event.type === "Abandono" ? "marker-abandon" : ""} />
                </div>

                <div className="timeline-content">
                  <div className="timeline-event-row">
                    <span className="timeline-time">{event.time}</span>
                    <strong>{event.type}</strong>
                    {event.phase === "after" && (
                      <small className="after-tag">reengajamento</small>
                    )}
                  </div>
                  <span className="timeline-detail">{event.detail}</span>
                </div>
              </div>
            ))}
          </div>
        </article>

        <div className="details-column">
          <article className="detail-panel behavior-panel">
            <span className="eyebrow">
              COMPORTAMENTO
            </span>

            <h2>{user.behavior}</h2>

            <p>
              Classificação produzida automaticamente
              a partir dos eventos observados.
            </p>
          </article>

          <article className="detail-panel">
            <span className="eyebrow">
              POR QUE?
            </span>

            <h2>
              Motivos da classificação
            </h2>

            <div className="reason-list">
              {user.reasons.map((reason) => (
                <div
                  className="reason"
                  key={reason}
                >
                  <span>✓</span>
                  {reason}
                </div>
              ))}
            </div>
          </article>

          <article
            className={
              user.automation.active
                ? "automation-card active"
                : "automation-card"
            }
          >
            <span>MOTOR AUTOMÁTICO</span>

            {user.automation.active ? (
              <>
                <h2>
                  Reengajamento ativado
                </h2>

                <p>
                  O usuário atende automaticamente
                  aos critérios de reengajamento.
                </p>

                <div className="automation-status-line">
                  <span>Status atual</span>

                  <strong>
                    {user.automation.status}
                  </strong>
                </div>

                <button
                  onClick={() =>
                    openAutomation(user)
                  }
                >
                  Ver acompanhamento →
                </button>
              </>
            ) : (
              <>
                <h2>
                  Monitoramento ativo
                </h2>

                <p>
                  Nenhum acionamento é necessário
                  neste momento.
                </p>
              </>
            )}
          </article>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   ACOMPANHAMENTO INDIVIDUAL
========================================================= */

function Step({
  title,
  description,
  state,
}) {
  return (
    <div className={`flow-step flow-${state}`}>
      <div className="flow-icon">
        {state === "done"
          ? "✓"
          : state === "active"
            ? "●"
            : "○"}
      </div>

      <div>
        <strong>{title}</strong>
        <span>{description}</span>
      </div>
    </div>
  );
}

function AutomationPage({
  user,
  onBack,
  simulate,
  reset,
}) {
  if (!user) return null;

  const automation = user.automation;

  if (!automation.active) {
    return (
      <section className="empty-state">
        <span className="eyebrow">
          AUTOMAÇÃO
        </span>

        <h1>
          Nenhum reengajamento necessário.
        </h1>

        <p>
          Este usuário não atende aos critérios
          de acionamento automático.
        </p>

      </section>
    );
  }

  return (
    <section className="page-section">
      <div className="automation-hero">
        <div className="automation-orb">
          ◎
        </div>

        <span className="eyebrow">
          MOTOR DE REENGAJAMENTO
        </span>

        <h1>
          Acompanhamento automático
        </h1>

        <p>
          O sistema detectou o momento crítico e está acompanhando
          a jornada em tempo real.
        </p>
      </div>

      <JourneySteps user={user} />

      <div className="automation-layout">
        <article className="automation-main-card">
          <div className="automation-card-header">
            <div>
              <span>Usuário</span>
              <h2>{user.name}</h2>
            </div>

            <AutomationBadge
              automation={automation}
            />
          </div>

          <div className="automation-details">
            {/* Gatilho — full width com acento */}
            <div className="ad-gatilho">
              <span className="eyebrow">GATILHO DETECTADO</span>
              <strong>{automation.trigger}</strong>
            </div>

            {/* Chips: Etapa + Canal + Prazo */}
            <div className="ad-chips">
              {automation.abandonedAt && (
                <div className="ad-chip">
                  <span>Etapa de abandono</span>
                  <strong>{automation.abandonedAt}</strong>
                </div>
              )}
              <div className="ad-chip">
                <span>Canal recomendado</span>
                <strong>{automation.channel}</strong>
                <span className={`channel-level channel-level-${automation.channelLevel}`}>
                  {automation.channelLevel}
                </span>
              </div>
              {user.edital && (
                <div className={`ad-chip${user.prazoUrgente ? " ad-chip-urgent" : ""}`}>
                  <span>Prazo · edital {user.edital}</span>
                  <strong className={user.prazoUrgente ? "prazo-urgente" : ""}>
                    {user.prazo}
                  </strong>
                </div>
              )}
            </div>

            {/* Mensagem — full width */}
            <div className="ad-msg">
              <span className="eyebrow">MENSAGEM ENVIADA</span>
              <p>"{automation.execution}"</p>
            </div>
          </div>

          <div className="automation-divider" />

          <span className="eyebrow">PLANO DE CONTATO</span>
          <div className="contact-plan">
            {automation.steps.map((step, i) => (
              <div key={i} className={`contact-step${step.done ? " contact-step-done" : " contact-step-pending"}`}>
                <span className="contact-step-delay">{step.delay}</span>
                <div className="contact-step-dot" />
                <span className="contact-step-label">{step.label}</span>
                <span className="contact-step-status">{step.done ? "Enviado" : "Pendente"}</span>
              </div>
            ))}
          </div>

          <div className="automation-divider" />

          <span className="eyebrow">
            CICLO AUTOMÁTICO
          </span>

          <div className="flow">
            <Step
              title="Comportamento identificado"
              description={user.behavior}
              state="done"
            />

            <Step
              title="Usuário priorizado"
              description={`Prioridade ${user.priority} • Score ${user.score}`}
              state="done"
            />

            <Step
              title="Reengajamento gerado"
              description="Ação gerada automaticamente."
              state="done"
            />

            <Step
              title="Retorno ao Portal"
              description={
                automation.returned
                  ? "Novo login detectado automaticamente."
                  : "Aguardando novo acesso."
              }
              state={
                automation.returned
                  ? "done"
                  : "active"
              }
            />

            <Step
              title="Jornada retomada"
              description={
                automation.continued
                  ? "Retomada detectada."
                  : "Ainda não detectada."
              }
              state={
                automation.continued
                  ? "done"
                  : automation.returned
                    ? "active"
                    : "pending"
              }
            />

            <Step
              title="Conclusão"
              description={
                automation.completed
                  ? "Jornada concluída."
                  : "Aguardando conclusão."
              }
              state={
                automation.completed
                  ? "done"
                  : automation.continued
                    ? "active"
                    : "pending"
              }
            />
          </div>
        </article>

        <aside className="automation-side-card">
          <span className="eyebrow">
            RESULTADO
          </span>

          <h2>
            {automation.completed
              ? "Reengajamento bem-sucedido"
              : automation.returned
                ? "Usuário reengajado"
                : "Aguardando resposta"}
          </h2>

          <div className="result-checks">
            <div>
              <span>Retornou ao Portal</span>

              <strong>
                {automation.returned
                  ? "Sim"
                  : "Pendente"}
              </strong>
            </div>

            <div>
              <span>Retomou a jornada</span>

              <strong>
                {automation.continued
                  ? "Sim"
                  : "Pendente"}
              </strong>
            </div>

            <div>
              <span>Concluiu</span>

              <strong>
                {automation.completed
                  ? "Sim"
                  : "Pendente"}
              </strong>
            </div>
          </div>

          {!automation.returned ? (
            <button
              className="simulation-button"
              onClick={() => simulate(user)}
            >
              ▶ Simular novos eventos
            </button>
          ) : (
            <button
              className="secondary-button full"
              onClick={() => reset(user)}
            >
              Reiniciar demonstração
            </button>
          )}

          <p className="simulation-note">
            No MVP, o botão simula novos eventos
            chegando do Portal. Em produção, esses
            eventos chegariam automaticamente.
          </p>
        </aside>
      </div>
    </section>
  );
}

/* =========================================================
   APP
========================================================= */

function App() {
  const [route, setRoute] =
    useState(getRoute());

  const [theme, setTheme] = useState(() => {
    const saved =
      localStorage.getItem("petronect-theme");

    if (saved === "dark" || saved === "light") {
      return saved;
    }

    return "light";
  });

  const [simulatedEvents, setSimulatedEvents] =
    useState(() => {
      try {
        return (
          JSON.parse(
            localStorage.getItem(
              "petronect-simulated-events"
            )
          ) || {}
        );
      } catch {
        return {};
      }
    });

  useEffect(() => {
    localStorage.setItem(
      "petronect-theme",
      theme
    );
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(
      "petronect-simulated-events",
      JSON.stringify(simulatedEvents)
    );
  }, [simulatedEvents]);

  useEffect(() => {
    function syncRoute() {
      setRoute(getRoute());

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }

    if (!window.location.hash) {
      window.location.hash = "#/";
    }

    syncRoute();

    window.addEventListener(
      "hashchange",
      syncRoute
    );

    return () =>
      window.removeEventListener(
        "hashchange",
        syncRoute
      );
  }, []);

  const analyzedUsers = useMemo(() => {
    return baseUsers.map((baseUser) => {
      const extra =
        simulatedEvents[baseUser.id] || [];

      const user = {
        ...baseUser,
        events: [
          ...baseUser.events,
          ...extra,
        ],
      };

      return applyReengagementEngine(
        analyzeUser(user)
      );
    });
  }, [simulatedEvents]);

  const selectedUser = route.userId
    ? analyzedUsers.find(
        (user) => user.id === route.userId
      )
    : null;

  function toggleTheme() {
    setTheme((current) =>
      current === "light"
        ? "dark"
        : "light"
    );
  }

  function goHome() {
    window.location.hash = "#/";
  }

  function goUsers() {
    window.location.hash = "#/users";
  }

  function goAutomations() {
    window.location.hash = "#/automations";
  }

  function goConfig() {
    window.location.hash = "#/config";
  }

  function goBack() {
    window.history.back();
  }

  function openUser(user) {
    window.location.hash =
      `#/user/${encodeURIComponent(user.id)}`;
  }

  function openAutomation(user) {
    window.location.hash =
      `#/automation/${encodeURIComponent(user.id)}`;
  }

  const [toasts, setToasts] = useState([]);

  function addToast(title, message, type = "success") {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }

  function simulateFollowUp(user) {
    setSimulatedEvents((current) => ({
      ...current,
      [user.id]: user.followUpTemplate,
    }));
    addToast("Automação ativada", user.name, "success");
  }

  function resetFollowUp(user) {
    setSimulatedEvents((current) => {
      const copy = { ...current };
      delete copy[user.id];
      return copy;
    });
  }

  return (
    <div
      className="app"
      data-theme={theme}
    >
      <style>{`
        * {
          box-sizing: border-box;
        }

        html,
        body,
        #root {
          margin: 0;
          width: 100%;
          min-height: 100%;
        }

        body {
          min-width: 320px;
          overflow-x: hidden;
        }

        button,
        input,
        select {
          font: inherit;
        }

        button {
          cursor: pointer;
        }

        .app {
          --blue: #29488f;
          --blue-light: #5474c8;

          --green: #71bf44;
          --green-dark: #4f9130;

          --page: #f4f6f9;
          --surface: #ffffff;
          --surface-soft: #f7f9fc;
          --surface-hover: #f1f5f9;

          --text: #17284d;
          --text-secondary: #485872;
          --muted: #758197;

          --border: #e2e7ef;

          --shadow:
            0 14px 42px rgba(31,49,95,.07);

          min-height: 100vh;

          background:
            radial-gradient(
              circle at 88% 0%,
              rgba(113,191,68,.08),
              transparent 25%
            ),
            var(--page);

          color: var(--text);

          font-family:
            Inter,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            Arial,
            sans-serif;

          transition:
            background .25s ease,
            color .25s ease;
        }

        .app[data-theme="dark"] {
          --blue: #7897e8;
          --blue-light: #91aaf0;

          --green: #83d454;
          --green-dark: #9ee577;

          --page: #090e1a;
          --surface: #121928;
          --surface-soft: #171f31;
          --surface-hover: #1a2337;

          --text: #f5f7fb;
          --text-secondary: #c8d0df;
          --muted: #96a3b7;

          --border: #283249;

          --shadow:
            0 18px 50px rgba(0,0,0,.25);
        }

        h1,
        h2,
        h3,
        strong {
          color: var(--text);
        }

        .topbar {
          width: 100%;
          min-height: 82px;

          position: sticky;
          top: 0;
          z-index: 100;

          background: var(--surface);

          border-bottom:
            1px solid var(--border);
        }

        .topbar-content {
          width:
            min(
              1320px,
              calc(100% - 48px)
            );

          min-height: 82px;
          margin: 0 auto;

          display: grid;

          grid-template-columns:
            auto
            1fr
            auto;

          align-items: center;
          gap: 28px;
        }

        .brand {
          padding: 0;
          border: 0;
          background: none;

          display: flex;
          flex-direction: column;

          text-align: left;
        }

        .brand span {
          color: var(--green);

          font-size: 11px;
          font-weight: 800;
          letter-spacing: .16em;
        }

        .brand strong {
          color: var(--blue);

          font-size: 22px;
          letter-spacing: -.04em;
        }

        .main-nav {
          display: flex;
          justify-content: center;
          gap: 6px;
        }

        .main-nav button {
          padding: 9px 13px;

          border: 0;
          border-radius: 999px;

          background: transparent;
          color: var(--text-secondary);

          font-size: 13px;
          font-weight: 650;
        }

        .main-nav button:hover {
          background: var(--surface-hover);
        }

        .main-nav .nav-active {
          background: rgba(113,191,68,.14);
          color: var(--green-dark);
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .mvp-badge {
          display: flex;
          align-items: center;
          gap: 7px;

          padding: 9px 12px;

          border-radius: 999px;

          background: rgba(113,191,68,.14);
          color: var(--green-dark);

          font-size: 12px;
          font-weight: 750;
        }

        .status-dot {
          width: 7px;
          height: 7px;

          border-radius: 50%;
          background: var(--green);
        }

        .theme-toggle {
          min-height: 40px;

          padding: 8px 13px;

          border: 1px solid var(--border);
          border-radius: 999px;

          background: var(--surface);
          color: var(--text);

          display: flex;
          align-items: center;
          gap: 8px;

          font-size: 12px;
          font-weight: 700;
        }

        main {
          width:
            min(
              1320px,
              calc(100% - 48px)
            );

          margin: 0 auto;
          padding: 68px 0 85px;
        }

        .hero {
          max-width: 930px;

          margin: 0 auto 52px;

          text-align: center;
        }

        .hero-tag {
          display: inline-flex;

          padding: 9px 14px;
          margin-bottom: 24px;

          border-radius: 999px;

          background: rgba(113,191,68,.14);
          color: var(--green-dark);

          font-size: 13px;
          font-weight: 750;
        }

        .hero h1 {
          margin: 0;

          font-size:
            clamp(48px,5.5vw,76px);

          line-height: .98;
          letter-spacing: -.055em;
        }

        .hero h1 span {
          color: var(--green);
        }

        .hero p {
          max-width: 750px;

          margin: 26px auto 0;

          color: var(--text-secondary);

          font-size: 18px;
          font-weight: 500;
          line-height: 1.65;
        }

        .stats-grid {
          display: grid;

          grid-template-columns:
            repeat(4,minmax(0,1fr));

          gap: 16px;
          margin-bottom: 18px;
        }

        .stat-card,
        .main-panel,
        .chart-card,
        .user-card,
        .profile-header,
        .detail-panel,
        .automation-main-card,
        .automation-side-card,
        .automation-summary-grid > div,
        .automation-list-card {
          background: var(--surface);

          border: 1px solid var(--border);

          box-shadow: var(--shadow);
        }

        .stat-card {
          min-height: 140px;

          padding: 28px 26px 24px;

          border-radius: 26px;

          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;

          gap: 6px;

          position: relative;
          overflow: hidden;
        }

        .stat-card-accent {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          border-radius: 26px 26px 0 0;
        }

        .stat-card-accent-blue {
          background: var(--blue);
        }

        .stat-card-accent-green {
          background: var(--green);
        }

        .stat-value {
          display: block;

          font-size: 52px;
          font-weight: 750;
          letter-spacing: -.05em;
          line-height: 1;
        }

        .stat-label {
          display: block;

          margin-top: 4px;

          color: var(--text-secondary);

          font-size: 13px;
          font-weight: 550;
        }

        .results-strip {
          display: grid;

          grid-template-columns:
            repeat(4,1fr);

          margin-bottom: 30px;

          border: 1px solid var(--border);
          border-radius: 22px;

          overflow: hidden;

          background: var(--surface);
        }

        .results-strip > div {
          padding: 20px 24px;

          border-right:
            1px solid var(--border);
        }

        .results-strip > div:last-child {
          border-right: 0;
        }

        .results-strip span {
          display: block;

          color: var(--muted);

          font-size: 11px;
        }

        .results-strip strong {
          display: block;

          margin-top: 5px;

          font-size: 24px;
        }

        .charts-grid {
          display: grid;

          grid-template-columns:
            1fr
            1fr;

          gap: 18px;
          margin-bottom: 30px;
        }

        .chart-card {
          padding: 28px 30px;

          border-radius: 28px;
        }

        .chart-heading {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;

          gap: 20px;
        }

        .chart-heading h2 {
          margin: 7px 0 0;

          font-size: 25px;
        }

        .eyebrow {
          display: block;

          color: var(--green);

          font-size: 11px;
          font-weight: 850;
          letter-spacing: .14em;
        }

        .text-button {
          padding: 0;

          border: 0;
          background: none;

          color: var(--blue);

          font-weight: 750;
        }

        .bars-list {
          margin-top: 30px;

          display: flex;
          flex-direction: column;
          gap: 21px;
        }

        .mini-bar-heading {
          margin-bottom: 8px;

          display: flex;
          justify-content: space-between;
        }

        .mini-bar-heading span {
          color: var(--text-secondary);

          font-size: 13px;
        }

        .mini-bar-track {
          width: 100%;
          height: 9px;

          border-radius: 999px;

          background: var(--surface-soft);

          overflow: hidden;
        }

        .mini-bar-fill {
          height: 100%;

          border-radius: 999px;
        }

        .mini-red {
          background: #d85b5b;
        }

        .mini-yellow {
          background: #d7a633;
        }

        .mini-gray {
          background: #8d9aad;
        }

        .funnel {
          margin-top: 30px;

          display: grid;
          grid-template-columns:
            repeat(4,1fr);

          gap: 8px;
        }

        .funnel > div {
          padding: 18px 10px;

          border-radius: 18px;

          background: var(--surface-soft);

          text-align: center;
        }

        .funnel strong {
          display: block;

          font-size: 27px;
        }

        .funnel span {
          display: block;

          margin-top: 5px;

          color: var(--muted);

          font-size: 10px;
        }

        .main-panel {
          padding: 28px 30px;

          border-radius: 30px;
        }

        .panel-header {
          margin-bottom: 28px;

          display: flex;
          align-items: flex-start;
          justify-content: space-between;

          gap: 30px;
        }

        .panel-header h2 {
          margin: 8px 0 0;

          font-size: 30px;
        }

        .panel-header p {
          margin: 8px 0 0;

          color: var(--text-secondary);
        }

        .primary-button {
          padding: 13px 18px;

          border: 0;
          border-radius: 14px;

          background: #29488f;
          color: white;

          font-weight: 750;
        }

        .table-header,
        .user-row {
          display: grid;

          grid-template-columns:
            1.25fr
            1.6fr
            .55fr
            .65fr
            .85fr;

          align-items: center;

          gap: 20px;
        }

        .table-header {
          padding: 13px 14px;

          color: var(--muted);

          font-size: 11px;
          font-weight: 750;
          text-transform: uppercase;
        }

        .user-row {
          width: 100%;

          padding: 13px 14px;

          border: 0;
          border-top:
            1px solid var(--border);

          background: transparent;

          color: var(--text);

          text-align: left;
        }

        .user-row:hover {
          background: var(--surface-hover);
        }

        .company-info {
          display: flex;
          align-items: center;

          gap: 13px;
        }

        .company-avatar {
          width: 42px;
          height: 42px;

          flex: 0 0 42px;

          border-radius: 13px;

          display: flex;
          align-items: center;
          justify-content: center;

          background:
            linear-gradient(
              145deg,
              #29488f,
              #182e64
            );

          color: white;

          font-weight: 800;
        }

        .company-avatar.large {
          width: 50px;
          height: 50px;
        }

        .company-avatar.profile {
          width: 70px;
          height: 70px;

          border-radius: 21px;

          font-size: 25px;
        }

        .company-info strong,
        .company-info span {
          display: block;
        }

        .company-info span {
          margin-top: 4px;

          color: var(--muted);

          font-size: 12px;
        }

        .behavior-text {
          color: var(--text-secondary);

          font-size: 14px;
          font-weight: 550;

          text-align: left;
        }

        .score-cell {
          text-align: center;
        }

        .score-cell strong {
          font-size: 18px;
        }

        .score-cell span {
          color: var(--muted);

          font-size: 11px;
        }

        .table-header span:nth-child(3),
        .table-header span:nth-child(4),
        .table-header span:nth-child(5) {
          text-align: center;
        }

        .user-row > div:nth-child(3),
        .user-row > div:nth-child(4),
        .user-row > div:nth-child(5) {
          display: flex;
          justify-content: center;
        }

        .priority,
        .automation-badge {
          display: inline-flex;

          padding: 7px 11px;

          border-radius: 999px;

          font-size: 11px;
          font-weight: 800;

          white-space: nowrap;
        }

        /* ── Sinal de reengajamento ── */
        .signal-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 5px 11px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 750;
          white-space: nowrap;
        }

        .signal-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .signal-Critico {
          background: rgba(216,91,91,.12);
          color: #b53636;
        }

        .signal-Critico .signal-dot { background: #d85b5b; }

        .signal-Atencao {
          background: rgba(215,166,51,.12);
          color: #8e6200;
        }

        .signal-Atencao .signal-dot { background: #d7a633; }

        .signal-Monitoramento {
          background: rgba(141,154,173,.12);
          color: #536174;
        }

        .signal-Monitoramento .signal-dot { background: #8d9aad; }

        .user-card-signal {
          margin: 6px 0 12px;
        }

        .priority-Alta {
          background: #ffeaea;
          color: #b53636;
        }

        .priority-Média {
          background: #fff1bf;
          color: #8e6200;
        }

        .priority-Baixa {
          background: #e9eef4;
          color: #536174;
        }

        .app[data-theme="dark"] .priority-Alta {
          background: rgba(220,70,70,.18);
          color: #ffabab;
        }

        .app[data-theme="dark"] .priority-Média {
          background: rgba(210,157,31,.18);
          color: #ffd375;
        }

        .app[data-theme="dark"] .priority-Baixa {
          background: rgba(150,165,190,.15);
          color: #ccd4df;
        }

        .automation-active {
          background: rgba(226,157,37,.15);
          color: #a76c00;
        }

        .automation-progress {
          background: rgba(70,108,207,.14);
          color: var(--blue);
        }

        .automation-success {
          background: rgba(113,191,68,.16);
          color: var(--green-dark);
        }

        .automation-off {
          background: var(--surface-soft);
          color: var(--muted);
        }

        .engine-banner {
          margin-top: 24px;

          padding: 31px;

          border-radius: 28px;

          background:
            radial-gradient(
              circle at 90% 0%,
              rgba(113,191,68,.22),
              transparent 35%
            ),
            #29488f;

          color: white;

          display: grid;

          grid-template-columns:
            auto
            1fr
            auto;

          align-items: center;

          gap: 20px;
        }

        .engine-icon {
          width: 54px;
          height: 54px;

          border-radius: 17px;

          background: rgba(255,255,255,.12);

          display: flex;
          align-items: center;
          justify-content: center;

          font-size: 25px;
        }

        .engine-banner > div:nth-child(2) > span {
          color: #c5eca9;

          font-size: 10px;
          font-weight: 800;
          letter-spacing: .14em;
        }

        .engine-banner h3 {
          margin: 6px 0;

          color: white;

          font-size: 24px;
        }

        .engine-banner p {
          margin: 0;

          color: rgba(255,255,255,.82);
        }

        .engine-banner button {
          padding: 12px 16px;

          border: 0;
          border-radius: 13px;

          background: white;
          color: #29488f;

          font-weight: 800;
        }

        .back-button {
          padding: 0;

          margin-bottom: 38px;

          border: 0;
          background: none;

          color: var(--blue);

          font-weight: 750;
        }

        .page-heading {
          margin-bottom: 34px;

          display: flex;
          align-items: flex-end;
          justify-content: space-between;

          gap: 30px;
        }

        .page-heading h1 {
          margin: 7px 0 0;

          font-size:
            clamp(38px,5vw,60px);

          letter-spacing: -.05em;
        }

        .page-heading p {
          color: var(--text-secondary);

          line-height: 1.6;
        }

        .result-count {
          text-align: right;
        }

        .result-count strong {
          display: block;

          font-size: 31px;
        }

        .result-count span {
          color: var(--muted);

          font-size: 12px;
        }

        .filters {
          margin-bottom: 24px;

          display: grid;

          grid-template-columns:
            1fr
            190px;

          gap: 12px;
        }

        .filters input,
        .filters select {
          width: 100%;
          height: 50px;

          padding: 0 15px;

          border: 1px solid var(--border);
          border-radius: 15px;

          outline: none;

          background: var(--surface);
          color: var(--text);
        }

        .filters input::placeholder {
          color: var(--muted);
        }

        .users-grid {
          display: grid;

          grid-template-columns:
            repeat(3,minmax(0,1fr));

          gap: 16px;
        }

        .user-card {
          padding: 24px;

          border-radius: 26px;
        }

        .user-card-top {
          margin-bottom: 20px;

          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .user-card h3 {
          margin: 0;

          font-size: 22px;
        }

        .user-type-label {
          color: var(--muted);

          font-size: 12px;
        }

        .user-card-behavior {
          min-height: 42px;

          margin: 23px 0;

          color: var(--text-secondary);

          font-weight: 550;
        }

        .user-card-stats {
          padding: 16px 0;

          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);

          display: grid;

          grid-template-columns:
            1fr
            1fr;
        }

        .user-card-stats span,
        .user-card-automation > span {
          display: block;

          color: var(--muted);

          font-size: 11px;
        }

        .user-card-stats strong {
          display: block;

          margin-top: 4px;

          font-size: 20px;
        }

        .user-card-automation {
          padding-top: 16px;

          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 12px;
        }

        .card-button {
          width: 100%;

          padding: 14px 0 0;

          border: 0;
          background: none;

          color: var(--blue);

          font-weight: 750;

          text-align: left;
        }

        /* ── User card redesign ── */
        .user-card {
          display: flex;
          flex-direction: column;
          cursor: pointer;
          transition: transform .18s, box-shadow .18s;
        }

        .user-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 32px rgba(41,72,143,.13);
        }

        .user-card-score-bar {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 4px 0 16px;
        }

        .user-card-score-track {
          flex: 1;
          height: 5px;
          border-radius: 99px;
          background: var(--border);
          overflow: hidden;
        }

        .user-card-score-fill {
          height: 100%;
          border-radius: 99px;
          transition: width .4s;
        }

        .user-card-score-bar > span {
          font-size: 11px;
          color: var(--muted);
          white-space: nowrap;
        }

        .user-card-score-bar > span strong {
          color: var(--text-primary);
          font-size: 13px;
        }

        .user-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 14px;
          border-top: 1px solid var(--border);
          margin-top: auto;
          gap: 8px;
        }

        .user-card-stat span {
          display: block;
          font-size: 10px;
          color: var(--muted);
        }

        .user-card-stat strong {
          font-size: 18px;
          font-weight: 800;
        }

        .user-card-automation-inline {
          flex-shrink: 0;
        }

        .user-card-cta {
          margin-top: 14px;
          padding-top: 12px;
          border-top: 1px solid var(--border);
          font-size: 13px;
          font-weight: 750;
          color: var(--blue);
        }

        /* ── Journey Stepper ── */
        .journey-steps {
          display: flex;
          align-items: flex-start;
          padding: 22px 28px;
          margin-bottom: 28px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 20px;
          box-shadow: var(--shadow);
        }

        .journey-step-wrap {
          display: flex;
          align-items: center;
          flex: 1;
        }

        .journey-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 6px;
          min-width: 72px;
        }

        .journey-num {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 13px;
          background: var(--surface-soft);
          color: var(--muted);
          border: 2px solid var(--border);
          transition: background .2s, border-color .2s;
        }

        .journey-label {
          font-size: 12px;
          font-weight: 700;
          color: var(--muted);
        }

        .journey-role {
          font-size: 10px;
          color: var(--muted);
          opacity: .75;
        }

        .journey-connector {
          flex: 1;
          height: 2px;
          background: var(--border);
          margin: 0 4px;
          margin-bottom: 42px;
        }

        .journey-connector-done {
          background: var(--blue);
        }

        .journey-step-done .journey-num {
          background: var(--blue);
          border-color: var(--blue);
          color: white;
        }

        .journey-step-done .journey-label {
          color: var(--blue);
        }

        .journey-step-active .journey-num {
          background: var(--blue);
          border-color: var(--blue);
          color: white;
          box-shadow: 0 0 0 5px rgba(41,72,143,.15);
        }

        .journey-step-active .journey-label {
          color: var(--blue);
        }

        .journey-step-stuck .journey-num {
          background: #d85b5b;
          border-color: #d85b5b;
          color: white;
          box-shadow: 0 0 0 5px rgba(216,91,91,.18);
        }

        .journey-step-stuck .journey-label {
          color: #d85b5b;
        }

        .journey-step-stuck .journey-role {
          color: #d85b5b;
        }

        .automation-summary-grid {
          margin-bottom: 24px;

          display: grid;

          grid-template-columns:
            repeat(4,1fr);

          gap: 12px;
        }

        .automation-summary-grid > div {
          padding: 21px;

          border-radius: 21px;
        }

        .automation-summary-grid span {
          display: block;

          color: var(--muted);

          font-size: 11px;
        }

        .automation-summary-grid strong {
          display: block;

          margin-top: 7px;

          font-size: 30px;
        }

        .automation-list {
          display: flex;
          flex-direction: column;

          gap: 12px;
        }

        .automation-list-card {
          padding: 20px 24px;

          border-radius: 23px;

          display: grid;

          grid-template-columns:
            minmax(180px, 1.5fr)
            80px
            minmax(110px, .9fr)
            minmax(110px, .9fr)
            auto;

          align-items: center;

          gap: 16px;
        }

        .automation-list-main {
          display: flex;
          align-items: center;

          gap: 13px;
          min-width: 0;
        }

        .automation-list-main > div {
          min-width: 0;
        }

        .automation-list-main strong {
          display: block;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .automation-list-main strong,
        .automation-list-main span {
          display: block;
        }

        .automation-list-main span {
          margin-top: 4px;

          color: var(--text-secondary);

          font-size: 12px;
        }

        .automation-list-info > span {
          display: block;

          margin-bottom: 6px;

          color: var(--muted);

          font-size: 10px;
        }

        .automation-list-info > strong {
          font-size: 13px;
        }

        .details-button {
          border: 0;
          background: none;

          color: var(--blue);

          font-weight: 750;
        }

        .no-results {
          padding: 50px;

          text-align: center;

          color: var(--muted);
        }

        .profile-header {
          padding: 31px;

          margin-bottom: 18px;

          border-radius: 29px;

          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 30px;
        }

        .profile-header-Alta {
          background:
            radial-gradient(circle at 92% 50%, rgba(216,91,91,.10), transparent 50%),
            var(--surface);
          border-left: 4px solid #d85b5b;
        }

        .profile-header-Média {
          background:
            radial-gradient(circle at 92% 50%, rgba(215,166,51,.10), transparent 50%),
            var(--surface);
          border-left: 4px solid #d7a633;
        }

        .profile-header-Baixa {
          background:
            radial-gradient(circle at 92% 50%, rgba(41,72,143,.07), transparent 50%),
            var(--surface);
          border-left: 4px solid var(--blue-light);
        }

        .avatar-priority-Alta {
          background: linear-gradient(145deg, #c43c3c, #8a1f1f);
        }

        .avatar-priority-Média {
          background: linear-gradient(145deg, #b08000, #7a5800);
        }

        .profile-tags {
          display: flex;
          gap: 7px;
          margin-top: 10px;
          flex-wrap: wrap;
        }

        .profile-tag {
          display: inline-flex;
          padding: 4px 11px;
          border-radius: 999px;
          background: var(--surface-soft);
          border: 1px solid var(--border);
          color: var(--text-secondary);
          font-size: 12px;
          font-weight: 600;
        }

        .profile-score-ring {
          margin-top: 12px;
        }

        .profile-main {
          display: flex;
          align-items: center;

          gap: 20px;
        }

        .profile-main h1 {
          margin: 5px 0;

          font-size:
            clamp(31px,4vw,47px);

          letter-spacing: -.05em;
        }

        .profile-meta {
          display: flex;
          flex-wrap: wrap;

          gap: 7px;

          color: var(--text-secondary);

          font-size: 13px;
        }

        .profile-priority {
          display: flex;
          flex-direction: column;
          align-items: flex-end;

          gap: 8px;
        }

        .profile-priority > span {
          color: var(--muted);

          font-size: 11px;
        }

        .detail-stats {
          margin-bottom: 18px;

          display: grid;

          grid-template-columns:
            repeat(4,1fr);

          gap: 12px;
        }

        .detail-stats > div {
          padding: 21px;

          border-radius: 21px;

          background: var(--surface);

          border: 1px solid var(--border);
        }

        .detail-stats span {
          display: block;

          color: var(--muted);

          font-size: 11px;
        }

        .detail-stats strong {
          display: inline-block;

          margin-top: 7px;

          font-size: 31px;
        }

        .detail-stats small {
          color: var(--muted);
        }

        .details-layout {
          display: grid;

          grid-template-columns:
            1.2fr
            1fr;

          gap: 18px;

          align-items: start;
        }

        .details-column {
          display: flex;
          flex-direction: column;

          gap: 18px;
        }

        .detail-panel {
          padding: 29px;

          border-radius: 27px;
        }

        .detail-panel h2 {
          margin: 8px 0 0;

          font-size: 25px;
        }

        .detail-panel p {
          color: var(--text-secondary);

          line-height: 1.55;
        }

        .behavior-panel {
          background:
            linear-gradient(
              145deg,
              rgba(113,191,68,.13),
              var(--surface)
            );
        }

        .timeline {
          margin-top: 29px;
        }

        .timeline-item {
          min-height: 60px;

          display: grid;

          grid-template-columns:
            23px
            1fr;

          gap: 13px;
        }

        .timeline-event-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 3px;
        }

        .after-tag {
          display: inline-flex !important;
          padding: 2px 8px;
          border-radius: 999px;
          background: rgba(41,72,143,.12);
          color: var(--blue);
          font-size: 10px !important;
          font-weight: 750;
          margin-top: 0 !important;
        }

        .timeline-marker {
          position: relative;

          display: flex;
          justify-content: center;
        }

        .timeline-marker::after {
          content: "";

          width: 2px;

          position: absolute;

          top: 16px;
          bottom: -4px;

          background: var(--border);
        }

        .timeline-item:last-child
        .timeline-marker::after {
          display: none;
        }

        .timeline-marker span {
          z-index: 2;

          width: 11px;
          height: 11px;

          margin-top: 4px;

          border-radius: 50%;

          background: var(--green);

          box-shadow:
            0 0 0 4px
            rgba(113,191,68,.14);
        }

        .timeline-after
        .timeline-marker span {
          background: var(--blue);
        }

        .timeline-time {
          color: var(--muted);
          font-size: 11px;
          font-weight: 600;
          font-variant-numeric: tabular-nums;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .timeline-detail {
          display: block;
          margin-top: 3px;
          color: var(--text-secondary);
          font-size: 12px;
          text-align: left;
        }

        .timeline-content small {
          display: block;
          margin-top: 5px;
          color: var(--blue);
          font-size: 10px;
          font-weight: 750;
        }

        .reason-list {
          margin-top: 23px;

          display: flex;
          flex-direction: column;

          gap: 11px;
        }

        .reason {
          display: flex;
          align-items: center;

          gap: 11px;

          color: var(--text-secondary);

          font-size: 14px;
          font-weight: 550;
        }

        .reason span {
          width: 25px;
          height: 25px;

          flex: 0 0 25px;

          border-radius: 50%;

          display: flex;
          align-items: center;
          justify-content: center;

          background: rgba(113,191,68,.15);
          color: var(--green-dark);

          font-weight: 800;
        }

        .automation-card {
          padding: 29px;

          border-radius: 27px;

          background: var(--surface-soft);

          border: 1px solid var(--border);
        }

        .automation-card.active {
          background:
            radial-gradient(
              circle at 90% 0%,
              rgba(113,191,68,.25),
              transparent 38%
            ),
            #29488f;

          color: white;

          border: 0;
        }

        .automation-card > span {
          color: var(--green);

          font-size: 10px;
          font-weight: 800;
          letter-spacing: .15em;
        }

        .automation-card.active > span {
          color: #c5eca9;
        }

        .automation-card h2 {
          margin: 9px 0 10px;
        }

        .automation-card.active h2 {
          color: white;
        }

        .automation-card p {
          color: var(--text-secondary);

          line-height: 1.55;
        }

        .automation-card.active p {
          color: rgba(255,255,255,.82);
        }

        .automation-status-line {
          margin-top: 20px;

          padding: 15px;

          border-radius: 16px;

          background: rgba(255,255,255,.10);
        }

        .automation-status-line span,
        .automation-status-line strong {
          display: block;
        }

        .automation-status-line span {
          color: rgba(255,255,255,.65);

          font-size: 11px;
        }

        .automation-status-line strong {
          margin-top: 4px;

          color: white;
        }

        .automation-card button {
          margin-top: 18px;

          padding: 12px 16px;

          border: 0;
          border-radius: 13px;

          background: white;
          color: #29488f;

          font-weight: 800;
        }

        .automation-hero {
          max-width: 580px;

          margin: 0 auto 40px;
          padding-top: 28px;

          text-align: center;
        }

        .automation-orb {
          width: 66px;
          height: 66px;

          margin: 0 auto 20px;

          border-radius: 22px;

          display: flex;
          align-items: center;
          justify-content: center;

          background:
            linear-gradient(
              145deg,
              #29488f,
              #71bf44
            );

          color: white;

          font-size: 29px;
        }

        .automation-hero h1 {
          margin: 8px 0;

          font-size:
            clamp(32px,3.8vw,48px);

          letter-spacing: -.05em;
        }

        .automation-hero p {
          color: var(--text-secondary);

          font-size: 17px;
          line-height: 1.6;
        }

        .automation-layout {
          display: grid;

          grid-template-columns:
            1.5fr
            .7fr;

          gap: 18px;

          align-items: start;
        }

        .automation-main-card,
        .automation-side-card {
          padding: 30px;
          border-radius: 29px;
          text-align: left;
        }

        .automation-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 20px;
        }

        .automation-card-header span {
          color: var(--muted);

          font-size: 11px;
        }

        .automation-card-header h2 {
          margin: 5px 0 0;

          font-size: 31px;
        }

        .automation-details {
          margin-top: 27px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          text-align: left;
        }

        /* Gatilho — full width com acento esquerdo */
        .ad-gatilho {
          padding: 16px 20px;
          border-radius: 16px;
          background: var(--surface-soft);
          border: 1px solid var(--border);
          border-left: 4px solid var(--blue);
        }

        .ad-gatilho strong {
          display: block;
          margin-top: 6px;
          font-size: 14px;
          line-height: 1.5;
        }

        /* Chips: Etapa + Canal + Prazo */
        .ad-chips {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        .ad-chip {
          padding: 16px 18px;
          border-radius: 16px;
          background: var(--surface-soft);
          border: 1px solid var(--border);
          text-align: left;
        }

        .ad-chip > span:first-child {
          display: block;
          color: var(--muted);
          font-size: 10px;
          font-weight: 750;
          text-transform: uppercase;
          letter-spacing: .06em;
          margin-bottom: 7px;
        }

        .ad-chip > strong {
          display: block;
          font-size: 13px;
          line-height: 1.4;
          margin-bottom: 7px;
        }

        .ad-chip-urgent {
          border-color: rgba(216,91,91,.3);
          background: rgba(216,91,91,.04);
        }

        /* Mensagem — full width */
        .ad-msg {
          padding: 16px 20px;
          border-radius: 16px;
          background: var(--surface-soft);
          border: 1px solid var(--border);
        }

        .ad-msg p {
          margin: 6px 0 0;
          font-size: 13px;
          line-height: 1.7;
          font-style: italic;
          color: var(--text-secondary);
        }

        .automation-divider {
          height: 1px;

          margin: 30px 0;

          background: var(--border);
        }

        .flow {
          margin-top: 25px;

          display: flex;
          flex-direction: column;
        }

        .flow-step {
          min-height: 78px;

          position: relative;

          display: grid;

          grid-template-columns:
            38px
            1fr;

          gap: 15px;
        }

        .flow-step::after {
          content: "";

          position: absolute;

          left: 18px;
          top: 34px;
          bottom: -5px;

          width: 2px;

          background: var(--border);
        }

        .flow-step:last-child::after {
          display: none;
        }

        .flow-icon {
          width: 36px;
          height: 36px;

          z-index: 2;

          border-radius: 50%;

          display: flex;
          align-items: center;
          justify-content: center;

          font-weight: 800;
        }

        .flow-done .flow-icon {
          background: rgba(113,191,68,.17);
          color: var(--green-dark);
        }

        .flow-active .flow-icon {
          background: rgba(41,72,143,.13);
          color: var(--blue);
        }

        .flow-pending .flow-icon {
          background: var(--surface-soft);
          color: var(--muted);
        }

        .flow-step strong,
        .flow-step span {
          display: block;
        }

        .flow-step span {
          margin-top: 5px;

          color: var(--text-secondary);

          font-size: 12px;
        }

        .automation-side-card {
          position: sticky;

          top: 105px;
        }

        .automation-side-card h2 {
          margin: 8px 0 25px;

          font-size: 27px;
        }

        .result-checks {
          display: flex;
          flex-direction: column;
        }

        .result-checks > div {
          padding: 16px 0;

          border-bottom:
            1px solid var(--border);

          display: flex;
          justify-content: space-between;

          gap: 15px;
        }

        .result-checks span {
          color: var(--text-secondary);

          font-size: 12px;
        }

        .simulation-button {
          width: 100%;

          margin-top: 25px;

          padding: 14px 16px;

          border: 0;
          border-radius: 14px;

          background: #29488f;
          color: white;

          font-weight: 800;
        }

        .secondary-button {
          padding: 13px 18px;

          border: 1px solid var(--border);
          border-radius: 14px;

          background: var(--surface);
          color: var(--blue);

          font-weight: 750;
        }

        .secondary-button.full {
          width: 100%;

          margin-top: 25px;
        }

        .simulation-note {
          margin: 16px 0 0;

          color: var(--muted);

          font-size: 11px;
          line-height: 1.5;
        }

        .empty-state {
          padding: 80px 20px;

          text-align: center;
        }

        .empty-state p {
          color: var(--text-secondary);
        }

        .empty-state button {
          padding: 13px 18px;

          border: 0;
          border-radius: 14px;

          background: #29488f;
          color: white;
        }

        @media (max-width: 1050px) {
          .topbar-content {
            grid-template-columns:
              auto
              1fr
              auto;
          }

          .stats-grid,
          .automation-summary-grid {
            grid-template-columns:
              repeat(2,1fr);
          }

          .charts-grid {
            grid-template-columns: 1fr;
          }

          .table-header {
            display: none;
          }

          .user-row {
            grid-template-columns:
              1.3fr
              1.4fr
              .5fr
              .7fr;
          }

          .user-row > div:last-child {
            grid-column: 1 / -1;
          }

          .users-grid {
            grid-template-columns:
              repeat(2,1fr);
          }

          .automation-list-card {
            grid-template-columns:
              1fr
              .4fr
              .8fr
              1fr;

            gap: 14px;
          }

          .automation-list-card .details-button {
            grid-column: 1 / -1;

            text-align: left;
          }

          .detail-stats {
            grid-template-columns:
              repeat(2,1fr);
          }

          .automation-layout {
            grid-template-columns: 1fr;
          }

          .automation-side-card {
            position: static;
          }
        }

        @media (max-width: 760px) {
          .topbar-content,
          main {
            width: calc(100% - 28px);
          }

          .topbar-content {
            grid-template-columns:
              1fr
              auto;
          }

          .main-nav {
            grid-column: 1 / -1;
            grid-row: 2;

            width: 100%;

            padding-bottom: 10px;

            justify-content: flex-start;

            overflow-x: auto;
          }

          .topbar {
            min-height: auto;
          }

          .topbar-content {
            padding-top: 12px;
          }

          main {
            padding-top: 45px;
          }

          .mvp-badge {
            display: none;
          }

          .theme-label {
            display: none;
          }

          .theme-toggle {
            width: 40px;
            height: 40px;

            padding: 0;

            justify-content: center;
          }

          .hero h1 {
            font-size:
              clamp(42px,12vw,62px);
          }

          .hero p {
            font-size: 16px;
          }

          .stats-grid,
          .automation-summary-grid {
            grid-template-columns: 1fr;
          }

          .results-strip {
            grid-template-columns:
              repeat(2,1fr);
          }

          .results-strip > div:nth-child(2) {
            border-right: 0;
          }

          .results-strip > div:nth-child(-n+2) {
            border-bottom:
              1px solid var(--border);
          }

          .funnel {
            grid-template-columns:
              repeat(2,1fr);
          }

          .panel-header,
          .page-heading,
          .profile-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .primary-button {
            width: 100%;
          }

          .user-row {
            grid-template-columns: 1fr;

            gap: 11px;
          }

          .engine-banner {
            grid-template-columns:
              auto
              1fr;
          }

          .engine-banner button {
            grid-column: 1 / -1;
          }

          .filters,
          .users-grid,
          .details-layout {
            grid-template-columns: 1fr;
          }

          .automation-list-card {
            grid-template-columns: 1fr;

            gap: 15px;
          }

          .profile-priority {
            align-items: flex-start;
          }

          .detail-stats {
            grid-template-columns:
              repeat(2,1fr);
          }

          .automation-details {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 430px) {
          .topbar-content,
          main {
            width: calc(100% - 20px);
          }

          .main-panel,
          .chart-card,
          .detail-panel,
          .profile-header,
          .automation-main-card,
          .automation-side-card {
            padding: 19px;
          }

          .results-strip {
            grid-template-columns: 1fr;
          }

          .results-strip > div {
            border-right: 0;
            border-bottom:
              1px solid var(--border);
          }

          .results-strip > div:last-child {
            border-bottom: 0;
          }
        }

        /* ── melhorias pontuais ── */

        .back-button {
          display: block;
          text-align: left;
          align-self: flex-start;
        }

        .page-heading {
          align-items: flex-start;
        }

        .page-heading h1 {
          font-size: clamp(26px, 3.5vw, 40px);
        }

        .page-heading > div:first-child {
          flex: 1;
          min-width: 0;
        }

        .result-count {
          flex-shrink: 0;
        }

        .automation-hero h1 {
          font-size: clamp(28px, 3.5vw, 44px);
        }

        .page-section {
          display: flex;
          flex-direction: column;
        }

        .profile-main {
          align-items: flex-start;
        }

        .profile-main h1 {
          font-size: clamp(22px, 3vw, 36px);
          line-height: 1.15;
        }

        .company-avatar.profile {
          margin-top: 4px;
          flex-shrink: 0;
        }

        .marker-abandon {
          background: #d85b5b !important;
          box-shadow: 0 0 0 4px rgba(216,91,91,.18) !important;
        }

        .user-card-priority-Alta {
          border-top: 3px solid #d85b5b;
        }

        .user-card-priority-Média {
          border-top: 3px solid #d7a633;
        }

        .user-card-priority-Baixa {
          border-top: 3px solid #8d9aad;
        }

        .automation-details > div:last-child {
          grid-column: 1 / -1;
        }

        .channel-level {
          display: inline-flex;
          margin-top: 6px;
          padding: 3px 9px;
          border-radius: 999px;
          font-size: 10px;
          font-weight: 800;
        }

        .channel-level-Urgente {
          background: #ffeaea;
          color: #b53636;
        }

        .channel-level-Alta {
          background: rgba(41,72,143,.12);
          color: var(--blue);
        }

        .channel-level-Média {
          background: #fff1bf;
          color: #8e6200;
        }

        .prazo-urgente {
          color: #b53636 !important;
        }

        .contact-plan {
          margin-top: 20px;
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .contact-step {
          display: grid;
          grid-template-columns: 48px 14px 1fr 68px;
          align-items: center;
          gap: 10px;
          padding: 11px 0;
          border-bottom: 1px solid var(--border);
          text-align: left;
        }

        .contact-step:last-child {
          border-bottom: 0;
        }

        .contact-step-delay {
          color: var(--muted);
          font-size: 11px;
          font-weight: 700;
          text-align: right;
          font-variant-numeric: tabular-nums;
        }

        .contact-step-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          margin: 0 auto;
          flex-shrink: 0;
        }

        .contact-step-done .contact-step-dot {
          background: var(--green);
          box-shadow: 0 0 0 3px rgba(113,191,68,.22);
        }

        .contact-step-pending .contact-step-dot {
          background: var(--border);
        }

        .contact-step-label {
          font-size: 13px;
          font-weight: 550;
          color: var(--text-secondary);
          text-align: left;
        }

        .contact-step-done .contact-step-label {
          color: var(--text);
          font-weight: 650;
        }

        .contact-step-status {
          font-size: 11px;
          font-weight: 750;
          white-space: nowrap;
          text-align: right;
        }

        .contact-step-done .contact-step-status {
          color: var(--green-dark);
        }

        .contact-step-pending .contact-step-status {
          color: var(--muted);
        }

        .search-wrap {
          position: relative;
          margin-bottom: 14px;
        }

        .search-icon-char {
          position: absolute;
          left: 17px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 20px;
          color: var(--muted);
          pointer-events: none;
          line-height: 1;
        }

        .search-wrap input {
          width: 100%;
          height: 52px;
          padding: 0 18px 0 46px;
          border: 1px solid var(--border);
          border-radius: 16px;
          outline: none;
          background: var(--surface);
          color: var(--text);
          font-size: 14px;
        }

        .search-wrap input::placeholder {
          color: var(--muted);
        }

        .filter-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 28px;
          flex-wrap: wrap;
        }

        .priority-pills {
          display: flex;
          gap: 7px;
          flex-wrap: wrap;
        }

        .priority-pill {
          padding: 9px 18px;
          border: 1px solid var(--border);
          border-radius: 999px;
          background: var(--surface);
          color: var(--text-secondary);
          font-size: 13px;
          font-weight: 650;
          transition: background .15s, color .15s, border-color .15s;
        }

        .priority-pill:hover {
          background: var(--surface-hover);
        }

        .priority-pill.pill-active {
          background: var(--blue);
          color: white;
          border-color: var(--blue);
        }

        .priority-pill-Alta.pill-active {
          background: #ffeaea;
          color: #b53636;
          border-color: #d85b5b;
        }

        .priority-pill-Média.pill-active {
          background: #fff1bf;
          color: #8e6200;
          border-color: #d7a633;
        }

        .priority-pill-Baixa.pill-active {
          background: #e9eef4;
          color: #536174;
          border-color: #8d9aad;
        }

        .result-tally {
          color: var(--muted);
          font-size: 13px;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .result-tally strong {
          color: var(--text);
          font-size: 15px;
        }

        .automations-band {
          margin-bottom: 32px;
          padding: 36px 28px 28px;
          border-radius: 28px;
          background:
            radial-gradient(
              circle at 80% 0%,
              rgba(41,72,143,.10),
              transparent 55%
            ),
            var(--surface);
          border: 1px solid var(--border);
          box-shadow: var(--shadow);
        }

        .automations-band .page-hero {
          margin-bottom: 28px;
        }

        .automations-band-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          border-top: 1px solid var(--border);
          padding-top: 22px;
        }

        .automations-band-stats > div {
          text-align: center;
        }

        .automations-band-stats strong {
          display: block;
          font-size: 28px;
          font-weight: 750;
          letter-spacing: -.04em;
        }

        .automations-band-stats span {
          display: block;
          margin-top: 3px;
          color: var(--muted);
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: .08em;
        }

        .chart-toggle {
          display: flex;
          gap: 3px;
          padding: 4px;
          border-radius: 12px;
          background: var(--surface-soft);
          border: 1px solid var(--border);
          flex-shrink: 0;
        }

        .chart-toggle button {
          width: 34px;
          height: 34px;
          border: 0;
          border-radius: 9px;
          background: transparent;
          color: var(--muted);
          font-size: 17px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background .15s, color .15s;
        }

        .chart-toggle-active {
          background: var(--surface) !important;
          color: var(--blue) !important;
          box-shadow: 0 1px 4px rgba(0,0,0,.10);
        }

        .page-hero {
          max-width: 680px;
          margin: 0 auto 40px;
          text-align: center;
        }

        .page-hero h1 {
          margin: 8px 0 0;
          font-size: clamp(36px, 5vw, 56px);
          letter-spacing: -.05em;
        }

        .page-hero p {
          margin: 14px 0 0;
          color: var(--text-secondary);
          font-size: 16px;
          line-height: 1.6;
        }

        /* ── Toast ── */
        .toast-container {
          position: fixed;
          bottom: 28px;
          right: 28px;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          gap: 10px;
          pointer-events: none;
        }
        .toast {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 14px 18px;
          border-radius: 14px;
          background: var(--surface);
          border: 1px solid var(--border);
          box-shadow: 0 8px 32px rgba(0,0,0,.14);
          min-width: 240px;
          max-width: 320px;
          animation: toastIn .25s ease;
        }
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(12px) scale(.97); }
          to   { opacity: 1; transform: none; }
        }
        .toast-dot {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          flex-shrink: 0;
          margin-top: 3px;
        }
        .toast-success .toast-dot { background: #71bf44; }
        .toast-alert   .toast-dot { background: #d85b5b; }
        .toast-body { display: flex; flex-direction: column; gap: 2px; }
        .toast-body strong { font-size: 13px; font-weight: 700; }
        .toast-body span   { font-size: 12px; color: var(--muted); }

        /* ── Seção "Requer ação manual" ── */
        .manual-section {
          margin-bottom: 32px;
        }
        .manual-section-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 16px;
        }
        .manual-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 12px;
          border-radius: 999px;
          background: rgba(216,91,91,.1);
          color: #b53636;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: .06em;
          margin-bottom: 8px;
        }
        .manual-badge-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #d85b5b;
          animation: pulseDot 1.6s ease-in-out infinite;
        }
        @keyframes pulseDot {
          0%,100% { opacity: 1; transform: scale(1); }
          50%      { opacity: .5; transform: scale(.7); }
        }
        .manual-title {
          margin: 0 0 4px;
          font-size: clamp(18px, 2.5vw, 24px);
          letter-spacing: -.03em;
        }
        .manual-subtitle {
          margin: 0;
          font-size: 13px;
          color: var(--text-secondary);
        }
        .manual-cards {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .manual-card {
          border-radius: 18px;
          border: 1px solid var(--border);
          background: var(--surface);
          box-shadow: var(--shadow);
          padding: 20px 24px;
          cursor: pointer;
          transition: box-shadow .2s, transform .15s;
        }
        .manual-card:hover {
          box-shadow: 0 18px 48px rgba(0,0,0,.12);
          transform: translateY(-1px);
        }
        .manual-card-critico {
          border-left: 4px solid #d85b5b;
        }
        .manual-card-atencao {
          border-left: 4px solid #d7a633;
        }
        .manual-card-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }
        .manual-card-identity {
          display: flex;
          align-items: center;
          gap: 13px;
        }
        .manual-card-name {
          display: block;
          font-size: 15px;
          font-weight: 700;
        }
        .manual-card-behavior {
          display: block;
          margin-top: 3px;
          font-size: 12px;
          color: var(--muted);
        }
        .manual-card-meta {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 6px;
          flex-shrink: 0;
        }
        .manual-prazo {
          font-size: 12px;
          color: var(--muted);
          font-weight: 600;
        }
        .manual-prazo-urgente {
          color: #b53636;
          font-weight: 750;
        }
        .manual-card-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          padding-top: 16px;
          border-top: 1px solid var(--border);
        }

        /* ── Botões de ação rápida ── */
        .aa-btn {
          padding: 9px 16px;
          border: none;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: opacity .15s, transform .1s;
          white-space: nowrap;
        }
        .aa-btn:hover  { opacity: .85; }
        .aa-btn:active { transform: scale(.97); }

        .aa-btn-primary   { background: var(--blue);  color: white; }
        .aa-btn-secondary { background: rgba(41,72,143,.1); color: var(--blue); }
        .aa-btn-danger    { background: rgba(216,91,91,.12); color: #b53636; }
        .aa-btn-ghost     { background: transparent; color: var(--muted); border: 1px solid var(--border); }

        .aa-btn-done {
          background: rgba(113,191,68,.15) !important;
          color: #4f9130 !important;
          pointer-events: none;
        }

        /* ── ROI Strip ── */
        .roi-strip {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: var(--shadow);
          margin-bottom: 28px;
        }
        .roi-item {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 20px 16px;
          text-align: center;
        }
        .roi-item strong {
          font-size: clamp(22px, 3vw, 32px);
          font-weight: 800;
          letter-spacing: -.04em;
          line-height: 1;
        }
        .roi-item span {
          font-size: 11px;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: .07em;
          font-weight: 600;
        }
        .roi-item-highlight strong { color: var(--blue); }
        .roi-divider {
          width: 1px;
          height: 44px;
          background: var(--border);
          flex-shrink: 0;
        }

        /* ── Live Feed ── */
        .live-feed-section {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 24px;
          padding: 24px 28px;
          box-shadow: var(--shadow);
          margin-bottom: 28px;
        }
        .live-feed-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        .live-indicator {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 999px;
          background: rgba(113,191,68,.12);
          color: #4f9130;
          font-size: 12px;
          font-weight: 700;
          flex-shrink: 0;
        }
        .live-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #71bf44;
          flex-shrink: 0;
          animation: pulseDot 1.4s ease-in-out infinite;
        }
        .live-feed-list {
          display: flex;
          flex-direction: column;
          gap: 0;
        }
        .feed-item {
          display: grid;
          grid-template-columns: 64px 12px 1fr;
          align-items: center;
          gap: 12px;
          padding: 10px 0;
          border-bottom: 1px solid var(--border);
          animation: feedSlide .35s ease;
        }
        .feed-item:last-child { border-bottom: 0; }
        @keyframes feedSlide {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: none; }
        }
        .feed-time {
          font-size: 11px;
          color: var(--muted);
          font-weight: 600;
          text-align: right;
          white-space: nowrap;
        }
        .feed-type-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
          background: var(--border);
        }
        .feed-type-dot.feed-type-Login          { background: #29488f; }
        .feed-type-dot.feed-type-Busca          { background: #71bf44; }
        .feed-type-dot.feed-type-Visualização   { background: #5474c8; }
        .feed-type-dot.feed-type-Download       { background: #d7a633; }
        .feed-type-dot.feed-type-InícioDeJornada { background: #d7a633; }
        .feed-type-dot.feed-type-Abandono       { background: #d85b5b; }
        .feed-type-dot.feed-type-Conclusão      { background: #71bf44; }
        .feed-type-dot.feed-type-Detecção       { background: #d85b5b; }
        .feed-type-dot.feed-type-Automação      { background: #8d9aad; }
        .feed-type-dot.feed-type-Retorno        { background: #71bf44; }
        .feed-type-dot.feed-type-SalaDeColaboração { background: #5474c8; }
        .feed-item-sys .feed-time { color: var(--blue); }
        .feed-content {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
        }
        .feed-content strong {
          font-size: 13px;
          font-weight: 650;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .feed-content span {
          font-size: 12px;
          color: var(--muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* ── Exportar ── */
        .export-btn {
          margin-top: 8px;
          padding: 8px 14px;
          border: 1px solid var(--border);
          border-radius: 10px;
          background: var(--surface-soft);
          color: var(--text-secondary);
          font-size: 12px;
          font-weight: 650;
          cursor: pointer;
          transition: background .15s, color .15s;
          white-space: nowrap;
        }
        .export-btn:hover {
          background: var(--surface-hover);
          color: var(--text);
        }

        /* ── Config Page ── */
        .config-page {
          display: flex;
          flex-direction: column;
          gap: 28px;
        }
        .config-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
          padding-top: 8px;
        }
        .config-title {
          margin: 6px 0 4px;
          font-size: clamp(22px, 3vw, 32px);
          letter-spacing: -.03em;
        }
        .config-subtitle {
          margin: 0;
          font-size: 14px;
          color: var(--text-secondary);
        }
        .config-status-badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 8px 16px;
          border-radius: 999px;
          border: 1px solid var(--border);
          background: var(--surface);
          font-size: 13px;
          font-weight: 650;
          color: #4f9130;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .config-flow {
          display: flex;
          align-items: center;
          gap: 0;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 28px 32px;
          box-shadow: var(--shadow);
          overflow-x: auto;
        }
        .config-flow-node {
          display: flex;
          flex-direction: column;
          gap: 5px;
          padding: 16px 24px;
          border-radius: 14px;
          text-align: center;
          min-width: 160px;
          flex-shrink: 0;
        }
        .config-flow-node strong {
          font-size: 14px;
          font-weight: 750;
        }
        .config-flow-node span {
          font-size: 12px;
          color: var(--muted);
        }
        .config-flow-node-portal  { background: rgba(41,72,143,.08); border: 1px solid rgba(41,72,143,.18); }
        .config-flow-node-engine  { background: rgba(113,191,68,.08); border: 1px solid rgba(113,191,68,.22); }
        .config-flow-node-channels { background: rgba(215,166,51,.08); border: 1px solid rgba(215,166,51,.22); }
        .config-flow-arrow {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          min-width: 60px;
        }
        .config-arrow-label {
          font-size: 10px;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: .08em;
          font-weight: 700;
        }
        .config-arrow-line {
          width: 100%;
          height: 2px;
          background: linear-gradient(90deg, var(--border), var(--border) 60%, transparent);
          position: relative;
        }
        .config-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .config-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 24px;
          box-shadow: var(--shadow);
        }
        .config-card-full {
          grid-column: 1 / -1;
        }
        .config-card-title {
          margin: 6px 0 18px;
          font-size: 17px;
          letter-spacing: -.02em;
        }
        .config-modules { display: flex; flex-direction: column; gap: 14px; }
        .config-module-row {
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding-bottom: 14px;
          border-bottom: 1px solid var(--border);
        }
        .config-module-row:last-child { border-bottom: 0; padding-bottom: 0; }
        .config-module-info {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .config-module-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #71bf44;
          flex-shrink: 0;
        }
        .config-module-info strong { font-size: 13px; font-weight: 700; }
        .config-module-events { display: flex; gap: 6px; flex-wrap: wrap; }
        .config-event-tag {
          padding: 3px 10px;
          border-radius: 999px;
          background: var(--surface-soft);
          border: 1px solid var(--border);
          font-size: 11px;
          color: var(--text-secondary);
          font-weight: 600;
        }
        .config-channels { display: flex; flex-direction: column; gap: 12px; }
        .config-channel-row {
          display: grid;
          grid-template-columns: 52px 1fr;
          gap: 12px;
          align-items: center;
        }
        .config-channel-delay {
          font-size: 11px;
          font-weight: 750;
          color: var(--muted);
          text-align: right;
        }
        .config-channel-bar strong { display: block; font-size: 13px; font-weight: 700; }
        .config-channel-bar span   { font-size: 11px; color: var(--muted); }
        .config-score-factors { display: flex; flex-direction: column; gap: 10px; margin-bottom: 14px; }
        .config-factor-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          padding: 10px 14px;
          border-radius: 10px;
          background: var(--surface-soft);
        }
        .config-factor-name { font-size: 13px; font-weight: 600; }
        .config-factor-peso { font-size: 12px; color: var(--blue); font-weight: 700; white-space: nowrap; }
        .config-score-note {
          margin: 0;
          font-size: 12px;
          color: var(--muted);
          line-height: 1.5;
        }
        @media (max-width: 768px) {
          .roi-strip { flex-direction: column; }
          .roi-divider { width: 100%; height: 1px; }
          .config-grid { grid-template-columns: 1fr; }
          .config-card-full { grid-column: 1; }
          .config-flow { flex-direction: column; gap: 12px; align-items: stretch; }
          .config-flow-arrow { flex-direction: row; }
          .config-arrow-line { height: 2px; width: 40px; }
        }

        /* ── AtencaoPage ── */
        .atencao-page {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .atencao-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
          padding-top: 8px;
        }

        .atencao-title {
          margin: 0 0 6px;
          font-size: clamp(22px, 3vw, 30px);
          letter-spacing: -.03em;
        }

        .atencao-subtitle {
          margin: 0;
          color: var(--text-secondary);
          font-size: 14px;
        }

        .atencao-period {
          padding: 8px 16px;
          border: 1px solid var(--border);
          border-radius: 10px;
          background: var(--surface);
          color: var(--text-secondary);
          font-size: 13px;
          font-weight: 600;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .atencao-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: var(--shadow);
        }

        .atencao-stat {
          padding: 22px 28px;
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .atencao-stat-mid {
          border-left: 1px solid var(--border);
          border-right: 1px solid var(--border);
        }

        .atencao-stat strong {
          font-size: 28px;
          font-weight: 800;
          letter-spacing: -.04em;
          line-height: 1;
        }

        .atencao-stat strong em {
          font-style: normal;
          font-size: 14px;
          font-weight: 600;
          color: var(--muted);
          margin-left: 6px;
        }

        .atencao-stat span {
          font-size: 12px;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: .07em;
          font-weight: 600;
        }

        .atencao-filters {
          display: flex;
          align-items: center;
          gap: 14px;
          flex-wrap: wrap;
        }

        .atencao-pills {
          display: flex;
          gap: 7px;
          flex-wrap: wrap;
        }

        .atencao-table-wrap {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: var(--shadow);
        }

        .atencao-table-head {
          display: grid;
          grid-template-columns: 2fr 1fr 2.5fr 1fr 1.2fr;
          gap: 12px;
          padding: 12px 24px;
          border-bottom: 1px solid var(--border);
          background: var(--surface-soft);
        }

        .atencao-table-head span {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: .07em;
          color: var(--muted);
        }

        .atencao-row {
          display: grid;
          grid-template-columns: 2fr 1fr 2.5fr 1fr 1.2fr;
          gap: 12px;
          align-items: center;
          padding: 14px 24px;
          border-bottom: 1px solid var(--border);
          cursor: pointer;
          transition: background .15s;
        }

        .atencao-row:last-child { border-bottom: 0; }

        .atencao-row:hover { background: var(--surface-hover); }

        .atencao-cell-user {
          display: flex;
          align-items: center;
          gap: 11px;
          min-width: 0;
        }

        .atencao-cell-user > div {
          display: flex;
          flex-direction: column;
          gap: 3px;
          min-width: 0;
        }

        .atencao-cell-user strong {
          font-size: 14px;
          font-weight: 650;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .atencao-cell-user span {
          font-size: 11px;
          color: var(--muted);
        }

        .atencao-sinais {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .atencao-sinal {
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .atencao-sinal-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .atencao-sinal span:last-child {
          font-size: 12px;
          color: var(--text-secondary);
          font-weight: 550;
        }

        .atencao-cell-date {
          font-size: 13px;
          color: var(--muted);
          white-space: nowrap;
        }

        .atencao-btn {
          padding: 9px 16px;
          border: none;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 700;
          white-space: nowrap;
          cursor: pointer;
          transition: opacity .15s;
        }

        .atencao-btn:hover { opacity: .85; }

        .atencao-btn-alta {
          background: var(--blue);
          color: white;
        }

        .atencao-btn-media {
          background: rgba(41,72,143,.1);
          color: var(--blue);
        }

        .atencao-btn-baixa {
          background: var(--surface-soft);
          color: var(--muted);
          border: 1px solid var(--border);
        }

        .atencao-empty {
          padding: 48px;
          text-align: center;
          color: var(--muted);
          font-size: 14px;
        }

        @media (max-width: 768px) {
          .atencao-stats { grid-template-columns: 1fr; }
          .atencao-stat-mid { border-left: 0; border-right: 0; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
          .atencao-table-head { display: none; }
          .atencao-row { grid-template-columns: 1fr; gap: 10px; }
        }
      `}</style>

      <Header
        goHome={goHome}
        goUsers={goUsers}
        goAutomations={goAutomations}
        goConfig={goConfig}
        page={route.page}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      <main>
        {route.page === "dashboard" && (
          <Dashboard
            users={analyzedUsers}
            onSeeAll={goUsers}
            onSelectUser={openUser}
            openAutomations={goAutomations}
          />
        )}

        {route.page === "config" && <ConfigPage />}

        {route.page === "users" && (
          <UsersPage
            users={analyzedUsers}
            onBack={goBack}
            onSelectUser={openUser}
          />
        )}

        {route.page === "automations" && (
          <AutomationsPage
            users={analyzedUsers}
            onBack={goBack}
            openAutomation={openAutomation}
            addToast={addToast}
          />
        )}

        {route.page === "details" && (
          <UserDetails
            user={selectedUser}
            onBack={goBack}
            openAutomation={openAutomation}
          />
        )}

        {route.page === "automation" && (
          <AutomationPage
            user={selectedUser}
            onBack={goBack}
            simulate={simulateFollowUp}
            reset={resetFollowUp}
          />
        )}
      </main>
      <ToastContainer toasts={toasts} />
    </div>
  );
}

export default App;