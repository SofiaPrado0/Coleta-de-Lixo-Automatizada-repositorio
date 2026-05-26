/* =========================================
   EcoBot Dashboard — Application Logic
   Static data · SVG icons · No emojis
   ========================================= */

// ── SVG Icon Library ──
const icons = {
  recycle: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M7 19H4.815a1.83 1.83 0 0 1-1.57-.881 1.785 1.785 0 0 1-.004-1.784L7.196 9.5"/>
    <path d="M11 19h8.203a1.83 1.83 0 0 0 1.556-.89 1.784 1.784 0 0 0 0-1.775l-1.226-2.12"/>
    <path d="m14 16-3 3 3 3"/>
    <path d="M8.293 13.596 4.875 7.97a1.826 1.826 0 0 1 3.13-.002l2.46 4.258"/>
    <path d="M15.7 13.6 19.13 8a1.83 1.83 0 0 0-1.57-2.74H12.4"/>
    <path d="m14 4-3 3h6"/>
  </svg>`,
  trash: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M3 6h18"/>
    <path d="M8 6V4h8v2"/>
    <path d="M5 6l1 14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-14"/>
    <path d="M10 11v6"/><path d="M14 11v6"/>
  </svg>`,
  check: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>`,
  sensor: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M12 1v2"/><path d="M12 21v2"/>
    <path d="M4.22 4.22l1.42 1.42"/><path d="M18.36 18.36l1.42 1.42"/>
    <path d="M1 12h2"/><path d="M21 12h2"/>
    <path d="M4.22 19.78l1.42-1.42"/><path d="M18.36 5.64l1.42-1.42"/>
  </svg>`,
  collect: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M21 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v3"/>
    <path d="M21 16v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3"/>
    <path d="M4 12h16"/>
  </svg>`,
  route: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>`,
  binLarge: `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M3 6h18"/>
    <path d="M8 6V4h8v2"/>
    <path d="M5 6l1 14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-14"/>
    <path d="M10 11v6"/><path d="M14 11v6"/>
  </svg>`,
  binSmall: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M3 6h18"/>
    <path d="M8 6V4h8v2"/>
    <path d="M5 6l1 14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-14"/>
  </svg>`,
};

// ── Data ──

const centroBins = [
  { id: 'centro-rec',     label: 'Reciclável',      color: '#67e8f9', count: 8,  size: 'large' },
  { id: 'centro-nao-rec', label: 'Não Reciclável',   color: '#a78bfa', count: 4,  size: 'large' },
];

const casinhaBins = [
  { id: 'casa-1', label: 'Casa 1', color: '#f9a8d4', count: 2, size: 'small' },
  { id: 'casa-2', label: 'Casa 2', color: '#f9a8d4', count: 3, size: 'small' },
  { id: 'casa-3', label: 'Casa 3', color: '#f9a8d4', count: 1, size: 'small' },
  { id: 'casa-4', label: 'Casa 4', color: '#f9a8d4', count: 0, size: 'small' },
];

const trashTypes = [
  { id: 'reciclavel',     label: 'Reciclável',     color: '#67e8f9', detail: 'Papel, plástico, vidro, metal', count: 8, icon: icons.recycle },
  { id: 'nao-reciclavel', label: 'Não Reciclável',  color: '#a78bfa', detail: 'Orgânico, rejeito',            count: 4, icon: icons.trash },
];

const activityLog = [
  { type: 'sort',    message: 'Lixo separado — Reciclável',                   time: '23:54', icon: icons.check },
  { type: 'detect',  message: 'Cor detectada — identificado como Reciclável',  time: '23:54', icon: icons.sensor },
  { type: 'collect', message: 'Lixo coletado na Casa 3',                      time: '23:53', icon: icons.collect },
  { type: 'route',   message: 'Seguindo linha — trecho Casa 2 → Casa 3',      time: '23:52', icon: icons.route },
  { type: 'sort',    message: 'Lixo separado — Não Reciclável',               time: '23:50', icon: icons.check },
  { type: 'detect',  message: 'Cor detectada — identificado como Não Reciclável', time: '23:50', icon: icons.sensor },
  { type: 'collect', message: 'Lixo coletado na Casa 2',                      time: '23:49', icon: icons.collect },
  { type: 'route',   message: 'Seguindo linha — trecho Casa 1 → Casa 2',      time: '23:48', icon: icons.route },
  { type: 'sort',    message: 'Lixo separado — Reciclável',                   time: '23:45', icon: icons.check },
  { type: 'collect', message: 'Lixo coletado na Casa 1',                      time: '23:44', icon: icons.collect },
  { type: 'route',   message: 'Iniciou rota de coleta',                       time: '23:40', icon: icons.route },
];

// ── DOM Helpers ──
const $ = (sel) => document.querySelector(sel);

// ── Render: Bins ──
function renderBins() {
  // Centro de Lixo — 2 large bins
  const centroContainer = document.getElementById('bins-centro');
  centroContainer.innerHTML = centroBins.map(bin => `
    <div class="bin-card" id="bin-${bin.id}">
      <div class="bin-visual large" style="color: ${bin.color}; background: ${bin.color}12;">
        ${icons.binLarge}
      </div>
      <span class="bin-label">${bin.label}</span>
      <span class="bin-count" style="color: ${bin.color}">${bin.count}</span>
      <span class="bin-size-tag">Grande</span>
    </div>
  `).join('');

  // Casinhas — 4 small bins
  const casasContainer = document.getElementById('bins-casinhas');
  casasContainer.innerHTML = casinhaBins.map(bin => `
    <div class="bin-card" id="bin-${bin.id}">
      <div class="bin-visual small" style="color: ${bin.color}; background: ${bin.color}12;">
        ${icons.binSmall}
      </div>
      <span class="bin-label">${bin.label}</span>
      <span class="bin-count" style="color: ${bin.color}">${bin.count}</span>
      <span class="bin-size-tag">Pequena</span>
    </div>
  `).join('');
}

// ── Render: Trash Stats ──
function renderTrashStats() {
  const container = $('#trash-stats');
  const total = trashTypes.reduce((s, t) => s + t.count, 0);

  container.innerHTML = trashTypes.map(t => `
    <div class="trash-row" id="trash-row-${t.id}">
      <div class="trash-icon-wrapper" style="background: ${t.color}15; color: ${t.color}">
        ${t.icon}
      </div>
      <div class="trash-info">
        <span class="trash-type">${t.label}</span>
        <span class="trash-detail">${t.detail}</span>
      </div>
      <span class="trash-count" style="color: ${t.color}">${t.count}</span>
    </div>
  `).join('');

  $('#total-trash').textContent = `${total} itens`;
}

// ── Render: Activity Log ──
function renderActivityLog() {
  const container = $('#activity-log');

  container.innerHTML = activityLog.map((entry, i) => `
    <div class="log-entry" id="log-entry-${i}">
      <div class="log-icon ${entry.type}">
        ${entry.icon}
      </div>
      <div class="log-content">
        <div class="log-message">${entry.message}</div>
        <div class="log-time">${entry.time}</div>
      </div>
    </div>
  `).join('');
}

// ── Bottom Nav ──
function initNav() {
  const navBtns = document.querySelectorAll('.nav-btn');

  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      navBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const target = document.getElementById(btn.dataset.section);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  const sections = ['status-section', 'maquete-section', 'trash-section', 'log-section'];
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navBtns.forEach(b => b.classList.remove('active'));
        const match = document.querySelector(`.nav-btn[data-section="${entry.target.id}"]`);
        if (match) match.classList.add('active');
      }
    });
  }, { rootMargin: '-30% 0px -60% 0px' });

  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el) observer.observe(el);
  });
}

// ── Init ──
function init() {
  renderBins();
  renderTrashStats();
  renderActivityLog();
  initNav();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
