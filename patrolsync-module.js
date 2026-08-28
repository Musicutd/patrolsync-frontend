(function () {
  const THEME_KEY = 'patrolsync_theme';
  document.documentElement.dataset.theme = localStorage.getItem(THEME_KEY) || 'dark';
  const groups = [
    ['Command', [['dashboard.html','▦','Overview'],['live_map.html','⌖','Live Guard Map'],['qr_print.html','▧','QR Codes'],['attendance.html','◷','Attendance'],['dispatch_center.html','⌁','Dispatch Center'],['sos_monitor.html','△','SOS Monitor'],['incident_management.html','△','Incident Cases'],['incident_reconstruction.html','⌁','Incident Reconstruction'],['crisis_mode.html','⚠','Crisis Mode'],['reconstruction_crisis_readiness.html','✓','Crisis Readiness'],['notification_center.html','●','Notifications']]],
    ['Workspace', [['dashboard.html#company','⌂','Company & Sites'],['dashboard.html#workforce','◎','Workforce'],['dashboard.html#tools','▦','Operations Tools'],['dashboard.html#patrol','⌖','Patrol Setup'],['dashboard.html#reports','▥','Reports'],['dashboard.html#incidents','△','Incident Desk']]],
    ['Workforce', [['shift_scheduler.html','▣','Shift Scheduler'],['shift_operations.html','↔','Confirmations & Swaps'],['availability.html','◫','Availability'],['coverage_autopilot.html','✦','Coverage Autopilot'],['operations_risk.html','△','Operations Risk'],['site_risk_twin.html','◈','Site Risk Digital Twin'],['risk_scenarios.html','◇','Risk Scenario Simulator'],['site_risk_readiness.html','✓','Digital Twin Readiness'],['intelligence_readiness.html','✓','Intelligence Readiness'],['field_reliability.html','⇄','Field Reliability'],['visitor_management.html','◉','Visitors & On-Site Register'],['workforce_readiness.html','✓','Workforce Readiness'],['certificate_register.html','◈','Guard Certifications'],['competency_matrix.html','✦','Competency Matrix'],['compliance_readiness.html','✓','Compliance Readiness'],['timesheets.html','◫','Timesheets'],['leave_management.html','◇','Leave Management'],['training_compliance.html','◎','Training & Compliance']]],
    ['Field Operations', [['patrol_routes.html','⌖','Patrol Routes'],['patrol_runs.html','↻','Patrol Runs'],['checkpoint_manager.html','▦','Checkpoint Manager'],['patrol_alerts.html','△','Patrol Alerts'],['patrol_evidence.html','◇','Patrol Evidence'],['trustproof.html','◆','TrustProof Evidence'],['checkpoint_requirements.html','✓','Checkpoint Instructions'],['handover_management.html','↦','Shift Handovers'],['lone_worker.html','◉','Lone Worker'],['asset_management.html','▣','Equipment & Assets'],['quality_inspections.html','✓','Quality Inspections']]],
    ['Business', [['proofscore.html','◆','ProofScore Assurance'],['assurance_trends.html','⌁','ProofScore Trends'],['assurance_actions.html','✓','Improvement Plans'],['assurance_readiness.html','✓','Assurance Readiness'],['predictive_assurance.html','◔','Predictive Assurance'],['service_credit_autopilot.html','€','Service Credit Autopilot'],['commercial_readiness.html','✓','Commercial Readiness'],['client_retention_radar.html','◎','Client Retention Radar'],['tender_builder.html','▤','Tender & Proposal Builder'],['client_intelligence_readiness.html','✓','Client Intelligence Readiness'],['service_contracts.html','▤','Contracts & SLAs'],['sla_dashboard.html','◷','Live SLA'],['client_reports.html','▥','Client Reports'],['service_tickets.html','◇','Service Tickets'],['contract_renewals.html','↻','Contract Renewals'],['invoices.html','€','Billing & Invoices'],['analytics.html','⌁','Analytics'],['email_deliveries.html','✉','Email Deliveries']]],
    ['Administration', [['access_control.html','◈','Roles & Permissions'],['team_messages.html','◎','Team Messages'],['geofences.html','⌖','Site Geofences'],['identity_assurance.html','◇','Identity Assurance'],['integrations.html','⌁','API & Webhooks'],['audit_log.html','▥','Audit Log'],['system_health.html','♡','System Health'],['integrity_tests.html','✓','Integrity Tests'],['security_recovery.html','▣','Security & Recovery'],['mfa_settings.html','◇','Two-Step Verification'],['session_management.html','◉','Sessions & Devices']]]
  ];
  const allItems = groups.flatMap(([group, items]) => items.map(item => ({group,href:item[0],icon:item[1],label:item[2]})));
  const pageFile = () => location.pathname.split('/').pop() || 'dashboard.html';
  const hrefFile = href => href.split('#')[0];
  const esc = value => String(value || '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  function signOut() {
    ['token','tenant_id','user_email','user_id','admin_token','admin_tenant_id','admin_user_id','admin_email'].forEach(key => localStorage.removeItem(key));
    location.replace('login.html');
  }
  function init() {
    if (!localStorage.getItem('token') && localStorage.getItem('guard_token') && ['availability.html','team_messages.html'].includes(pageFile())) return;
    if (document.querySelector('.pm-sidebar')) return;
    document.body.classList.add('ps-module-shell');
    const current = pageFile();
    const heading = document.querySelector('h1,h2');
    const title = (heading && heading.textContent.trim()) || document.title || 'PatrolSync';
    const sidebar = document.createElement('aside');
    sidebar.className = 'pm-sidebar';
    sidebar.setAttribute('aria-label','Primary navigation');
    sidebar.innerHTML = `<button class="pm-sidebar-close" type="button" aria-label="Close navigation">×</button><div class="pm-brand"><div class="pm-mark">✓</div><div><strong>PatrolSync</strong><small>Operations Cloud</small></div></div>${groups.map(([group,items])=>`<div class="pm-nav-group"><div class="pm-nav-label">${esc(group)}</div><nav class="pm-nav">${items.map(([href,icon,label])=>`<a href="${href}" class="${hrefFile(href)===current?'active':''}"><span>${icon}</span>${esc(label)}</a>`).join('')}</nav></div>`).join('')}<div class="pm-sidebar-foot">Secure multi-tenant operations<br>PatrolSync Platform</div>`;
    const topbar = document.createElement('header');
    topbar.className = 'pm-topbar';
    topbar.innerHTML = `<div class="pm-title"><button class="pm-menu" type="button" aria-label="Open navigation">☰</button><div><strong>${esc(title)}</strong><small>Operations workspace</small></div></div><div class="pm-actions"><button class="pm-search-trigger" type="button" aria-label="Search PatrolSync modules"><span>⌕ Search modules</span><kbd>Ctrl K</kbd></button><button class="pm-theme" type="button" aria-label="Change color theme"></button><button class="pm-logout" type="button">Sign Out</button></div>`;
    const search = document.createElement('div');
    search.className = 'pm-search-dialog';
    search.setAttribute('aria-hidden','true');
    search.innerHTML = `<div class="pm-search-panel" role="dialog" aria-modal="true" aria-label="Search PatrolSync modules"><div class="pm-search-head"><input class="pm-search-input" type="search" placeholder="Search attendance, certificates, visitors, reports…" autocomplete="off"><button class="pm-search-close" type="button" aria-label="Close search">×</button></div><div class="pm-search-results"></div></div>`;
    const main = document.createElement('main');
    main.className = 'pm-main';
    Array.from(document.body.childNodes).filter(node => node.nodeName !== 'SCRIPT').forEach(node => main.appendChild(node));
    document.body.prepend(search); document.body.prepend(topbar); document.body.prepend(sidebar); document.body.appendChild(main);
    const themeButton = topbar.querySelector('.pm-theme');
    function drawTheme(){const dark=document.documentElement.dataset.theme==='dark';themeButton.innerHTML=dark?'☀ <span>Light</span>':'☾ <span>Dark</span>'}
    drawTheme();
    themeButton.addEventListener('click',()=>{const next=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=next;localStorage.setItem(THEME_KEY,next);drawTheme()});
    const input=search.querySelector('.pm-search-input'),results=search.querySelector('.pm-search-results');
    function renderResults(query){const words=query.trim().toLowerCase().split(/\s+/).filter(Boolean);const matches=allItems.filter(item=>words.every(word=>`${item.label} ${item.group}`.toLowerCase().includes(word))).slice(0,30);results.innerHTML=matches.length?matches.map(item=>`<a href="${item.href}"><span class="pm-search-icon">${item.icon}</span><span><strong>${esc(item.label)}</strong><small>${esc(item.group)}</small></span><b>→</b></a>`).join(''):'<p>No matching module found.</p>'}
    function openSearch(){renderResults('');search.classList.add('open');search.setAttribute('aria-hidden','false');setTimeout(()=>input.focus(),0)}
    function closeSearch(){search.classList.remove('open');search.setAttribute('aria-hidden','true');input.value=''}
    topbar.querySelector('.pm-menu').addEventListener('click',()=>document.body.classList.add('pm-nav-open'));
    sidebar.querySelector('.pm-sidebar-close').addEventListener('click',()=>document.body.classList.remove('pm-nav-open'));
    sidebar.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>document.body.classList.remove('pm-nav-open')));
    topbar.querySelector('.pm-search-trigger').addEventListener('click',openSearch);
    topbar.querySelector('.pm-logout').addEventListener('click',signOut);
    search.querySelector('.pm-search-close').addEventListener('click',closeSearch);
    search.addEventListener('click',event=>{if(event.target===search)closeSearch()});
    input.addEventListener('input',event=>renderResults(event.target.value));
    document.addEventListener('keydown',event=>{if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k'){event.preventDefault();openSearch()}if(event.key==='Escape'){closeSearch();document.body.classList.remove('pm-nav-open')}});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
