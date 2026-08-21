(function(){
  const saved=localStorage.getItem('patrolsync_theme');
  document.documentElement.dataset.theme=saved||'dark';
  const groups=[
    ['Command',[['dashboard.html','▦','Overview'],['attendance.html','◷','Attendance'],['dispatch_center.html','⌁','Dispatch Center'],['incident_management.html','△','Incident Cases'],['notification_center.html','●','Notifications']]],
    ['Workforce',[['shift_scheduler.html','▣','Shift Scheduler'],['shift_operations.html','↔','Confirmations & Swaps'],['availability.html','◫','Availability'],['timesheets.html','◫','Timesheets'],['leave_management.html','◇','Leave Management'],['training_compliance.html','◎','Training & Compliance']]],
    ['Field Operations',[['patrol_routes.html','⌖','Patrol Routes'],['patrol_runs.html','↻','Patrol Runs'],['patrol_alerts.html','△','Patrol Alerts'],['patrol_evidence.html','◇','Patrol Evidence'],['trustproof.html','◆','TrustProof'],['checkpoint_requirements.html','✓','Checkpoint Instructions'],['handover_management.html','↦','Shift Handovers'],['lone_worker.html','◉','Lone Worker'],['asset_management.html','▣','Equipment & Assets'],['quality_inspections.html','✓','Quality Inspections']]],
    ['Business',[['service_contracts.html','▤','Contracts & SLAs'],['sla_dashboard.html','◷','Live SLA'],['client_reports.html','▥','Client Reports'],['service_tickets.html','◇','Service Tickets'],['contract_renewals.html','↻','Contract Renewals'],['invoices.html','€','Billing & Invoices'],['analytics.html','⌁','Analytics'],['email_deliveries.html','✉','Email Deliveries']]],
    ['Administration',[['access_control.html','◈','Roles & Permissions'],['team_messages.html','◎','Team Messages'],['geofences.html','⌖','Site Geofences'],['integrations.html','⌁','API & Webhooks'],['audit_log.html','▥','Audit Log'],['system_health.html','♡','System Health'],['integrity_tests.html','✓','Integrity Tests'],['security_recovery.html','▣','Security & Recovery'],['mfa_settings.html','◇','Two-Step Verification'],['session_management.html','◉','Sessions & Devices']]]
  ];
  function file(){return location.pathname.split('/').pop()||'dashboard.html'}
  function esc(v){return String(v||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
  function init(){
    if(!localStorage.getItem('token')&&localStorage.getItem('guard_token')&&['availability.html','team_messages.html'].includes(file()))return;
    document.body.classList.add('ps-module-shell');
    const current=file(),title=(document.querySelector('h1,h2')||{}).textContent||document.title;
    const sidebar=document.createElement('aside');sidebar.className='pm-sidebar';sidebar.innerHTML='<button class="pm-sidebar-close" aria-label="Close navigation">×</button><div class="pm-brand"><div class="pm-mark">✓</div><div><strong>PatrolSync</strong><small>Operations Cloud</small></div></div>'+groups.map(g=>'<div class="pm-nav-group"><div class="pm-nav-label">'+esc(g[0])+'</div><nav class="pm-nav">'+g[1].map(x=>'<a href="'+x[0]+'" class="'+(x[0]===current?'active':'')+'"><span>'+x[1]+'</span>'+esc(x[2])+'</a>').join('')+'</nav></div>').join('');
    const top=document.createElement('header');top.className='pm-topbar';top.innerHTML='<div class="pm-title"><button class="pm-menu" aria-label="Open navigation">☰</button><div><strong>'+esc(title)+'</strong><small>Operations workspace</small></div></div><div class="pm-actions"><button class="pm-theme" type="button"></button></div>';
    const main=document.createElement('main');main.className='pm-main';Array.from(document.body.childNodes).filter(n=>n.nodeName!=='SCRIPT').forEach(n=>main.appendChild(n));
    document.body.prepend(top);document.body.prepend(sidebar);document.body.appendChild(main);
    const theme=top.querySelector('.pm-theme');function draw(){const dark=document.documentElement.dataset.theme==='dark';theme.innerHTML=dark?'☀ <span>Light</span>':'☾ <span>Dark</span>'}draw();theme.onclick=()=>{const next=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=next;localStorage.setItem('patrolsync_theme',next);draw()};
    top.querySelector('.pm-menu').onclick=()=>document.body.classList.add('pm-nav-open');sidebar.querySelector('.pm-sidebar-close').onclick=()=>document.body.classList.remove('pm-nav-open');sidebar.querySelectorAll('a').forEach(a=>a.onclick=()=>document.body.classList.remove('pm-nav-open'));
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
