const Kanti = (() => {
  const meta = {
    'erinnerig': { label:'Erinnerig', icon:'●', href:'/erinnerungen/', create:'/schreiben/#/collections/erinnerungen/new', color:'#45d8f3' },
    'lehrer-spruch': { label:'Lehrer-Sprüch', icon:'“', href:'/lehrer-sprueche/', create:'/schreiben/#/collections/lehrer_sprueche/new', color:'#b77cff' },
    'meme': { label:'Memes', icon:'☺', href:'/memes/', create:'/schreiben/#/collections/memes/new', color:'#ff6fb1' },
    'foto': { label:'Fotos', icon:'▧', href:'/fotos/', create:'/schreiben/#/collections/fotos/new', color:'#ffae67' },
    'kalender': { label:'Kalender', icon:'□', href:'/kalender/', create:'/schreiben/#/collections/kalender/new', color:'#ffe16b' },
    'kanti-lore': { label:'Kanti-Lore', icon:'✦', href:'/kanti-lore/', create:'/schreiben/#/collections/kanti_lore/new', color:'#62dda3' },
  };
  let postsCache, settingsCache;

  const esc = (v='') => String(v).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');
  const validDate = (v) => { if (!v) return null; const d = new Date(v); return Number.isNaN(d.getTime()) ? null : d; };
  const fmt = (v, time=false) => { const d=validDate(v); if(!d)return''; return new Intl.DateTimeFormat('de-CH',{day:'2-digit',month:'2-digit',year:'numeric',...(time?{hour:'2-digit',minute:'2-digit'}:{})}).format(d); };
  const relative = (v) => { const d=validDate(v); if(!d)return''; const n=Math.floor((Date.now()-d.getTime())/86400000); if(n<=0)return'hüt'; if(n===1)return'geschter'; if(n<7)return`vor ${n} Täg`; return fmt(v); };
  const pad2 = (n) => String(n).padStart(2,'0');
  const isoDay = (d) => `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;

  function markdown(input='') {
    let s = esc(input).replace(/\r\n/g,'\n')
      .replace(/^### (.+)$/gm,'<h3>$1</h3>').replace(/^## (.+)$/gm,'<h2>$1</h2>').replace(/^# (.+)$/gm,'<h1>$1</h1>')
      .replace(/^> (.+)$/gm,'<blockquote>$1</blockquote>').replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/\*(.+?)\*/g,'<em>$1</em>')
      .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,'<a href="$2" target="_blank" rel="noopener">$1</a>');
    const lines=s.split('\n'); let out='', list=false;
    for(const line of lines){
      if(line.startsWith('- ')){ if(!list){out+='<ul>';list=true;} out+=`<li>${line.slice(2)}</li>`; }
      else { if(list){out+='</ul>';list=false;} if(/^<(h[1-3]|blockquote)>/.test(line))out+=line; else if(line.trim())out+=`<p>${line}</p>`; }
    }
    if(list)out+='</ul>'; return out;
  }

  async function fetchJSON(url,fallback){ try{const r=await fetch(url,{cache:'no-store'});if(!r.ok)throw new Error(String(r.status));return await r.json();}catch(e){console.warn('Lade-Fehler',url,e);return fallback;} }
  async function settings(){ if(!settingsCache)settingsCache=await fetchJSON('/data/settings.json',{}); return settingsCache; }
  async function allPosts(){ if(!postsCache)postsCache=await fetchJSON('/data/posts.json',[]); return postsCache; }
  async function publicPosts(){ return (await allPosts()).filter(p=>p.status!=='rejected'); }

  function postCard(p){
    const m=meta[p.category]||meta.erinnerig;
    const image=p.image?`<img src="${esc(p.image)}" alt="${esc(p.title)}" loading="lazy">`:'<span class="placeholder-orb" aria-hidden="true"></span>';
    return `<article class="post-card fade-up"><a href="/beitrag/?id=${encodeURIComponent(p.id)}"><div class="post-media">${image}</div><div class="post-body"><span class="tag" style="border-color:${m.color}44;color:${m.color}">${esc(m.label)}</span><h3>${esc(p.title)}</h3><p>${esc(p.excerpt||'')}</p><div class="post-meta"><span>vo ${esc(p.author||'Anonym')}</span><span>${relative(p.date)}</span></div></div></a></article>`;
  }

  function nav(){
    const page=document.body.dataset.page||'home';
    const items=[['home','⌂','Start','/start/'],['erinnerungen','◉','Erinnerige','/erinnerungen/'],['kalender','□','Kalender','/kalender/'],['lehrer-sprueche','“','Lehrer-Sprüch','/lehrer-sprueche/'],['memes','☺','Memes','/memes/'],['fotos','▧','Fotos','/fotos/'],['kanti-lore','✦','Kanti-Lore','/kanti-lore/'],['flashback','◁','Flashback','/flashback/'],['roulette','⊛','Roulette','/roulette/']];
    const adminAttr=page==='admin'?'':'data-admin-only hidden';
    return `<aside class="sidebar"><a class="brand" href="/start/"><span class="brand-mark">◇</span><span><strong>KANTI<br>ZIITKAPSLE</strong><small>EUSE STORY. FÜR IMMER.</small></span></a><nav class="nav-list">${items.map(([k,i,l,h])=>`<a class="nav-item ${page===k?'active':''}" href="${h}"><span class="nav-icon">${i}</span>${l}</a>`).join('')}</nav><div class="sidebar-sep"></div><nav class="nav-list"><a class="nav-item ${page==='schueler'?'active':''}" href="/schueler/"><span class="nav-icon">♙</span>Schülerbereich</a><a class="nav-item ${page==='schreiben'?'active':''}" href="/schreiben/"><span class="nav-icon">✎</span>Öppis iiträge</a><a class="nav-item ${page==='admin'?'active':''}" href="/admin/" ${adminAttr}><span class="nav-icon">⚙</span>Admin</a></nav><div class="sidebar-foot">Für d Klass. Für später. Für all die Momänt, wo mer susch vergisst.</div></aside><div class="mobile-overlay" data-nav-close></div>`;
  }
  function topbar(){return `<header class="topbar"><button class="icon-btn mobile-nav-toggle" type="button" data-nav-toggle aria-label="Menü öffne">☰</button><label class="search-wrap"><span>⌕</span><input data-global-search placeholder="Suech Erinnerige, Sprüch, Memes …"></label><div class="top-actions"><button class="user-chip" type="button" data-user-action><span class="avatar" data-user-avatar>↗</span><span class="user-meta"><strong data-user-name>Login</strong><small data-user-role>Gast</small></span></button></div></header>`;}
  function mountShell(){
    const shell=document.querySelector('[data-shell]'); if(!shell)return; shell.insertAdjacentHTML('afterbegin',nav()); const main=shell.querySelector('.main'); if(main)main.insertAdjacentHTML('afterbegin',topbar());
    document.querySelector('[data-nav-toggle]')?.addEventListener('click',()=>document.body.classList.toggle('nav-open')); document.querySelector('[data-nav-close]')?.addEventListener('click',()=>document.body.classList.remove('nav-open'));
    document.querySelectorAll('.nav-item').forEach(a=>a.addEventListener('click',()=>document.body.classList.remove('nav-open')));
    document.querySelector('[data-global-search]')?.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.currentTarget.value.trim())location.href=`/erinnerungen/?q=${encodeURIComponent(e.currentTarget.value.trim())}`;});
    document.querySelector('[data-user-action]')?.addEventListener('click',()=>window.KantiAuth?.user()?location.href='/schueler/':window.KantiAuth?.login());
  }

  function startCountdown(site){
    const target=validDate(site.graduation_date); const start=validDate(site.school_start_date); const free=new Set(site.school_free_days||[]);
    const school=document.querySelector('[data-school-days]'); const since=document.querySelector('[data-school-since]'); const setup=document.querySelector('[data-countdown-setup]');
    if(start&&since){const days=Math.max(0,Math.floor((Date.now()-start.getTime())/86400000)); since.textContent=`Schuelstart: ${fmt(start)} · ${days} Täg sit em Start`;}
    const setDigits=(vals)=>Object.entries(vals).forEach(([k,v])=>{const el=document.querySelector(`[data-count-${k}]`);if(el)el.textContent=v;});
    if(!target){setDigits({days:'—',hours:'—',minutes:'—',seconds:'—'});if(school)school.innerHTML='<strong>Offe</strong><span>De genaue Schuelschluss im Juli wird vom Admin festgleit.</span>';if(setup)setup.hidden=false;return;}
    if(setup)setup.hidden=true;
    const schoolDays=()=>{let n=0,d=new Date();d.setHours(0,0,0,0);const end=new Date(target);end.setHours(0,0,0,0);while(d<end){d.setDate(d.getDate()+1);if(d.getDay()!==0&&d.getDay()!==6&&!free.has(isoDay(d)))n++;}return n;};
    const tick=()=>{const diff=Math.max(0,target.getTime()-Date.now());setDigits({days:String(Math.floor(diff/86400000)),hours:pad2(Math.floor(diff/3600000)%24),minutes:pad2(Math.floor(diff/60000)%60),seconds:pad2(Math.floor(diff/1000)%60)});};
    tick();setInterval(tick,1000);if(school)school.innerHTML=`<strong>${schoolDays()}</strong><span>Schueltäg no (Wuchenänd & iitreiti freii Täg abzoge)</span>`;
  }

  function lastFriday(now=new Date()){const d=new Date(now);d.setHours(12,0,0,0);d.setDate(d.getDate()-((d.getDay()-5+7)%7));return d;}
  function chooseFlashback(list){if(!list.length)return null;const pref=list.filter(p=>p.flashback);const pool=pref.length?pref:list;const d=lastFriday(),key=`${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;let h=0;for(const c of key)h=((h<<5)-h+c.charCodeAt(0))|0;return pool[Math.abs(h)%pool.length];}

  async function renderHome(){
    const site=await settings(),list=await publicPosts();
    const map={'[data-hero-kicker]':site.hero_kicker,'[data-hero-1]':site.hero_title_1,'[data-hero-2]':site.hero_title_2,'[data-hero-text]':site.hero_text,'[data-quote]':site.quote};
    for(const [sel,val] of Object.entries(map)){const el=document.querySelector(sel);if(el&&val)el.textContent=val;}
    startCountdown(site);
    const recent=document.querySelector('[data-recent-posts]'); if(recent)recent.innerHTML=list.length?list.slice(0,6).map(postCard).join(''):'<div class="empty-state">No kei Iiträg da. Mach de erscht! ✨</div>';
    const fb=chooseFlashback(list);const mount=document.querySelector('[data-home-flashback]');if(mount&&fb)mount.innerHTML=`<span class="tag">Freitigs-Flashback</span><h3>${esc(fb.title)}</h3><p style="color:var(--muted);line-height:1.6">${esc(fb.excerpt||'')}</p><a href="/beitrag/?id=${encodeURIComponent(fb.id)}">Aaluege →</a>`;
  }

  async function renderCollection(category){
    const list=(await publicPosts()).filter(p=>!category||p.category===category);const mount=document.querySelector('[data-post-list]');if(!mount)return;
    const q=(new URLSearchParams(location.search).get('q')||'').trim().toLowerCase();
    const search=document.querySelector('[data-page-search]');if(search)search.value=q;
    const apply=()=>{const term=(search?.value||q).trim().toLowerCase();const filtered=list.filter(p=>!term||`${p.title} ${p.excerpt} ${p.body} ${p.author} ${(p.tags||[]).join(' ')}`.toLowerCase().includes(term));mount.innerHTML=filtered.length?filtered.map(postCard).join(''):'<div class="empty-state">Nüt gfunde. Oder no nüt iitreit. 🙂</div>';};
    search?.addEventListener('input',apply);apply();
  }

  async function renderCalendar(){
    const list=await publicPosts(); let cursor=new Date(); cursor.setDate(1); const grid=document.querySelector('[data-calendar-grid]'),title=document.querySelector('[data-calendar-title]'),dayList=document.querySelector('[data-calendar-day-list]'); if(!grid)return;
    let selected=isoDay(new Date());
    const renderDayList=()=>{const items=list.filter(p=>{const d=validDate(p.date);return d&&isoDay(d)===selected;});const d=new Date(`${selected}T12:00:00`);dayList.innerHTML=`<h3>${fmt(d)}</h3><div class="mini-list">${items.length?items.map(p=>`<a class="mini-item" href="/beitrag/?id=${encodeURIComponent(p.id)}"><strong>${esc(p.title)}</strong><small>${esc((meta[p.category]||{}).label||'Iitrag')} · ${esc(p.author||'Anonym')}</small></a>`).join(''):'<div class="empty-state">A dem Tag isch no nüt drin.</div>'}</div>`;};
    const draw=()=>{const y=cursor.getFullYear(),m=cursor.getMonth();title.textContent=new Intl.DateTimeFormat('de-CH',{month:'long',year:'numeric'}).format(cursor);const first=new Date(y,m,1),start=(first.getDay()+6)%7,days=new Date(y,m+1,0).getDate();let html='';for(let i=0;i<start;i++){html+='<div class="day out"></div>';}for(let n=1;n<=days;n++){const d=new Date(y,m,n),key=isoDay(d),items=list.filter(p=>{const pd=validDate(p.date);return pd&&isoDay(pd)===key;});html+=`<button class="day ${key===selected?'selected':''} ${key===isoDay(new Date())?'today':''}" data-day="${key}" type="button"><span class="day-num">${n}</span><span class="day-dots">${items.slice(0,6).map(()=>'<i class="day-dot"></i>').join('')}</span></button>`;}grid.innerHTML=html;grid.querySelectorAll('[data-day]').forEach(b=>b.addEventListener('click',()=>{selected=b.dataset.day;draw();renderDayList();}));};
    document.querySelector('[data-cal-prev]')?.addEventListener('click',()=>{cursor.setMonth(cursor.getMonth()-1);draw();});document.querySelector('[data-cal-next]')?.addEventListener('click',()=>{cursor.setMonth(cursor.getMonth()+1);draw();});draw();renderDayList();
  }

  async function renderFlashback(){const list=await publicPosts(),p=chooseFlashback(list),mount=document.querySelector('[data-flashback]');if(!mount)return;mount.innerHTML=p?postCard(p):'<div class="empty-state">Für en Flashback bruchts zerscht mindestens en Iitrag.</div>';}
  async function renderRoulette(){const list=await publicPosts(),mount=document.querySelector('[data-roulette]');if(!mount)return;const pick=()=>{mount.innerHTML=list.length?postCard(list[Math.floor(Math.random()*list.length)]):'<div class="empty-state">S Roulette isch no leer.</div>';};document.querySelector('[data-roulette-button]')?.addEventListener('click',pick);pick();}
  async function renderDetail(){const id=new URLSearchParams(location.search).get('id'),p=(await publicPosts()).find(x=>x.id===id),mount=document.querySelector('[data-detail]');if(!mount)return;if(!p){mount.innerHTML='<div class="empty-state">Dä Iitrag gits nöd oder er isch entfernt worde.</div>';return;}const m=meta[p.category]||meta.erinnerig;mount.innerHTML=`<article class="glass article"><span class="tag" style="color:${m.color};border-color:${m.color}44">${esc(m.label)}</span><h1>${esc(p.title)}</h1><div class="article-meta">${fmt(p.date,true)} · vo ${esc(p.author||'Anonym')}</div>${p.image?`<div class="article-image"><img src="${esc(p.image)}" alt="${esc(p.title)}"></div>`:''}<div class="article-content">${markdown(p.body||p.excerpt||'')}</div></article><aside class="glass glass-pad"><h3>Zurück</h3><p style="color:var(--muted);line-height:1.6">No meh us de Kanti-Ziitkapsle.</p><a class="btn btn-ghost" href="${m.href}">← ${esc(m.label)}</a></aside>`;}

  async function renderStudent(){
    const mount=document.querySelector('[data-student-cards]');if(!mount)return;mount.innerHTML=Object.entries(meta).map(([key,m])=>`<a class="glass dash-card" href="${m.create}"><span class="tag" style="color:${m.color};border-color:${m.color}44">${m.label}</span><h3>${m.icon} Neue ${m.label}</h3><p>Direkt im Decap CMS erfasse${['meme','foto'].includes(key)?' und Bild ufelade':''}.</p></a>`).join('');
    const recent=document.querySelector('[data-student-recent]');const list=await publicPosts();if(recent)recent.innerHTML=list.length?list.slice(0,6).map(postCard).join(''):'<div class="empty-state">No kei Iiträg. Fang mit em erschte aa.</div>';
  }

  async function renderAdminStats(){const list=await allPosts();const visible=list.filter(p=>p.status!=='rejected');const pending=list.filter(p=>p.status==='pending');const stats=document.querySelector('[data-admin-stats]');if(stats)stats.innerHTML=[['Alli',list.length],['Sichtbar',visible.length],['Pending',pending.length],['Bilder',list.filter(p=>p.image).length]].map(([l,n])=>`<div class="stat"><strong>${n}</strong><span>${l}</span></div>`).join('');}

  function initPage(){
    mountShell(); window.KantiAuth?.init();
    const page=document.body.dataset.page||'';
    if(page==='home')renderHome();
    else if(page==='erinnerungen')renderCollection();
    else if(page==='lehrer-sprueche')renderCollection('lehrer-spruch');
    else if(page==='memes')renderCollection('meme');
    else if(page==='fotos')renderCollection('foto');
    else if(page==='kanti-lore')renderCollection('kanti-lore');
    else if(page==='kalender')renderCalendar();
    else if(page==='flashback')renderFlashback();
    else if(page==='roulette')renderRoulette();
    else if(page==='beitrag')renderDetail();
    else if(page==='schueler')renderStudent();
    else if(page==='admin')renderAdminStats();
    document.querySelector('[data-login-button]')?.addEventListener('click',()=>window.KantiAuth?.login());
    document.querySelector('[data-logout]')?.addEventListener('click',()=>window.KantiAuth?.logout());
  }
  return { initPage, meta };
})();

document.addEventListener('DOMContentLoaded',()=>Kanti.initPage());
