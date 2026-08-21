(function(){
  const isGuard=Boolean(localStorage.getItem('guard_token'))&&!localStorage.getItem('token');
  const storageKey='patrolsync_guard_theme';
  const saved=localStorage.getItem(storageKey);
  document.documentElement.dataset.theme=saved||'dark';

  const pages={
    'my_shifts.html':['My Shifts','Schedule'],
    'my_timesheets.html':['My Timesheets','Hours & approvals'],
    'availability.html':['Availability & Leave','Work preferences'],
    'shift_marketplace.html':['Open Shifts & Swaps','Shift marketplace'],
    'my_patrols.html':['My Patrols','Assigned rounds'],
    'handover.html':['Shift Handover','Continuity log'],
    'my_notifications.html':['My Notifications','Operational updates'],
    'team_messages.html':['Team Messages','Company communication'],
    'my_safety.html':['My Safety','Lone-worker check-in'],
    'my_dispatches.html':['My Dispatches','Assigned response jobs'],
    'my_equipment.html':['My Equipment','Keys & issued assets'],
    'my_inspections.html':['My Inspections','Quality assignments'],
    'my_training.html':['My Training','Policies & learning']
  };
  const file=()=>location.pathname.split('/').pop()||'guard.html';
  const esc=v=>String(v||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  function themeControl(button){
    function draw(){const dark=document.documentElement.dataset.theme==='dark';button.innerHTML=dark?'☀ <span>Light</span>':'☾ <span>Dark</span>';button.setAttribute('aria-label',dark?'Use light theme':'Use dark theme')}
    button.addEventListener('click',()=>{document.documentElement.dataset.theme=document.documentElement.dataset.theme==='dark'?'light':'dark';localStorage.setItem(storageKey,document.documentElement.dataset.theme);draw()});draw();
  }

  function initGuardHome(){
    document.body.classList.add('ps-guard-app');
    const header=document.getElementById('header');
    const login=document.getElementById('loginScreen');
    [header,login].filter(Boolean).forEach((target,index)=>{
      const button=document.createElement('button');button.type='button';button.className='pg-theme'+(index?' pg-theme-login':'');target.appendChild(button);themeControl(button);
    });
  }

  function initSecondary(){
    if(!isGuard&&['team_messages.html','availability.html'].includes(file()))return;
    document.body.classList.remove('ps-module-shell');
    document.body.classList.add('ps-guard-page');
    const current=file(),meta=pages[current]||[(document.querySelector('h1,h2')||{}).textContent||document.title,'Field operations'];
    const header=document.createElement('header');header.className='pg-topbar';header.innerHTML='<a class="pg-brand" href="guard.html"><span>✓</span><div><strong>PatrolSync</strong><small>Field Operations</small></div></a><div class="pg-page-title"><strong>'+esc(meta[0])+'</strong><small>'+esc(meta[1])+'</small></div><button class="pg-theme" type="button"></button>';
    const main=document.createElement('main');main.className='pg-main';
    Array.from(document.body.childNodes).filter(n=>n.nodeName!=='SCRIPT').forEach(n=>main.appendChild(n));
    const bottom=document.createElement('nav');bottom.className='pg-bottom-nav';bottom.setAttribute('aria-label','Guard navigation');bottom.innerHTML=[
      ['guard.html','⌂','Home'],['my_shifts.html','▣','Shifts'],['my_patrols.html','⌖','Patrols'],['my_notifications.html','●','Alerts'],['guard.html#services','•••','More']
    ].map(x=>'<a href="'+x[0]+'" class="'+(x[0]===current?'active':'')+'"><span>'+x[1]+'</span>'+x[2]+'</a>').join('');
    document.body.prepend(header);document.body.appendChild(main);document.body.appendChild(bottom);themeControl(header.querySelector('.pg-theme'));
    const oldBack=main.querySelector(':scope>p:first-child');if(oldBack&&oldBack.querySelector('a[href*="guard"]'))oldBack.classList.add('pg-old-back');
  }

  function init(){file()==='guard.html'?initGuardHome():initSecondary()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
