const K = (() => {
  const categoryMeta = {
    'erinnerig': { label: 'Erinnerig', icon: '●', href: '/erinnerungen/', color: '#38d7f2' },
    'lehrer-spruch': { label: 'Lehrer-Sprüch', icon: '“', href: '/lehrer-sprueche/', color: '#b67cff' },
    'meme': { label: 'Memes', icon: '☺', href: '/memes/', color: '#ff6fae' },
    'foto': { label: 'Fotos', icon: '▧', href: '/fotos/', color: '#f6a55b' },
    'kanti-lore': { label: 'Kanti-Lore', icon: '✦', href: '/kanti-lore/', color: '#55d99a' },
  };

  let postsCache;
  let settingsCache;

  const esc = (value = '') => String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  function markdown(input = '') {
    let s = esc(input).replace(/\r\n/g, '\n');
    s = s.replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

    const lines = s.split('\n');
    let out = '';
    let inList = false;
    for (const line of lines) {
      if (/^- /.test(line)) {
        if (!inList) { out += '<ul>'; inList = true; }
        out += `<li>${line.slice(2)}</li>`;
      } else {
        if (inList) { out += '</ul>'; inList = false; }
        if (/^<h[1-3]>/.test(line)) out += line;
        else if (line.trim()) out += `<p>${line}</p>`;
      }
    }
    if (inList) out += '</ul>';
    return out;
  }

  async function fetchJSON(url, fallback) {
    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) throw new Error(`${res.status}`);
      return await res.json();
    } catch (error) {
      console.warn(`Konnte ${url} nicht laden`, error);
      return fallback;
    }
  }

  async function settings() {
    if (!settingsCache) settingsCache = await fetchJSON('/data/settings.json', {});
    return settingsCache;
  }

  async function posts({ includePending = false } = {}) {
    if (!postsCache) postsCache = await fetchJSON('/data/posts.json', []);
    return includePending ? postsCache : postsCache.filter((p) => p.status === 'approved');
  }

  function formatDate(value, withTime = false) {
    if (!value) return '';
    const d = new Date(value);
    return new Intl.DateTimeFormat('de-CH', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
    }).format(d);
  }

  function relativeDate(value) {
    const d = new Date(value);
    const days = Math.floor((Date.now() - d.getTime()) / 86400000);
    if (days <= 0) return 'hüt';
    if (days === 1) return 'geschter';
    if (days < 7) return `vor ${days} Täg`;
    return formatDate(value);
  }

  function postCard(post) {
    const meta = categoryMeta[post.category] || categoryMeta.erinnerig;
    const media = post.image
      ? `<img src="${esc(post.image)}" alt="${esc(post.title)}" loading="lazy">`
      : '<span class="placeholder-orb" aria-hidden="true"></span>';
    return `
      <article class="post-card fade-up">
        <a href="/beitrag/?id=${encodeURIComponent(post.id)}" aria-label="${esc(post.title)}">
          <div class="post-media">${media}</div>
          <div class="post-body">
            <span class="tag" style="border-color:${meta.color}33;color:${meta.color}">${esc(meta.label)}</span>
            <h3>${esc(post.title)}</h3>
            <p>${esc(post.excerpt || '')}</p>
            <div class="post-meta"><span>vo ${esc(post.author || 'Anonym')}</span><span>${relativeDate(post.date)}</span></div>
          </div>
        </a>
      </article>`;
  }

  function nav() {
    const page = document.body.dataset.page || 'home';
    const items = [
      ['home','⌂','Home','/'],
      ['erinnerungen','◉','Erinnerige','/erinnerungen/'],
      ['kalender','□','Kalender','/kalender/'],
      ['lehrer-sprueche','“','Lehrer-Sprüch','/lehrer-sprueche/'],
      ['memes','☺','Memes','/memes/'],
      ['fotos','▧','Fotos','/fotos/'],
      ['kanti-lore','✦','Kanti-Lore','/kanti-lore/'],
      ['flashback','◁','Flashback','/flashback/'],
      ['roulette','⊛','Roulette','/roulette/'],
    ];
    return `
      <aside class="sidebar">
        <a class="brand" href="/">
          <span class="brand-mark">◇</span>
          <span><strong>KANTI<br>ZIITKAPSLE</strong><small>EUSE STORY. FÜR IMMER.</small></span>
        </a>
        <nav class="nav-list">
          ${items.map(([key,icon,label,href]) => `<a class="nav-item ${page===key?'active':''}" href="${href}"><span class="nav-icon">${icon}</span>${label}</a>`).join('')}
        </nav>
        <div class="sidebar-sep"></div>
        <nav class="nav-list">
          <a class="nav-item ${page==='schueler'?'active':''}" href="/schueler/"><span class="nav-icon">♙</span>Schülerbereich</a>
          <a class="nav-item ${page==='schreiben'?'active':''}" href="/schreiben/"><span class="nav-icon">✎</span>Beitrag schriibe</a>
          <a class="nav-item" href="/admin/" data-admin-only hidden><span class="nav-icon">⚙</span>Admin CMS</a>
        </nav>
        <div class="sidebar-foot">Für d Klass. Für später. Für all die Momänt, wo mer susch vergisst.</div>
      </aside>
      <div class="mobile-overlay" data-nav-close></div>`;
  }

  function topbar() {
    return `
      <header class="topbar">
        <button class="icon-btn mobile-nav-toggle" type="button" data-nav-toggle aria-label="Menü öffne">☰</button>
        <label class="search-wrap"><span>⌕</span><input data-global-search placeholder="Suech nach Erinnerige, Sprüch, Memes …"></label>
        <div class="top-actions">
          <button class="user-chip" type="button" data-user-action>
            <span class="avatar" data-user-avatar>↗</span>
            <span class="user-meta"><strong data-user-name>Login</strong><small data-user-role>Gast</small></span>
          </button>
        </div>
      </header>`;
  }

  function mountShell() {
    const mount = document.querySelector('[data-shell]');
    if (!mount) return;
    mount.insertAdjacentHTML('afterbegin', nav());
    const main = mount.querySelector('.main');
    if (main) main.insertAdjacentHTML('afterbegin', topbar());

    document.querySelector('[data-nav-toggle]')?.addEventListener('click', () => document.body.classList.toggle('nav-open'));
    document.querySelector('[data-nav-close]')?.addEventListener('click', () => document.body.classList.remove('nav-open'));
    document.querySelectorAll('.nav-item').forEach((item) => item.addEventListener('click', () => document.body.classList.remove('nav-open')));
    document.querySelector('[data-global-search]')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.currentTarget.value.trim()) location.href = `/erinnerungen/?q=${encodeURIComponent(e.currentTarget.value.trim())}`;
    });
    document.querySelector('[data-user-action]')?.addEventListener('click', () => {
      const user = window.KantiAuth?.user();
      if (user) location.href = '/schueler/'; else window.KantiAuth?.login();
    });
  }

  function startCountdown(settingsData) {
    const target = new Date(settingsData.graduation_date);
    const free = new Set(settingsData.school_free_days || []);
    const fmt = (n) => String(Math.max(0, n)).padStart(2, '0');
    const schoolDays = () => {
      let count = 0;
      const d = new Date();
      d.setHours(0,0,0,0);
      const end = new Date(target); end.setHours(0,0,0,0);
      while (d < end) {
        d.setDate(d.getDate() + 1);
        const iso = `${d.getFullYear()}-${fmt(d.getMonth()+1)}-${fmt(d.getDate())}`;
        if (d.getDay() !== 0 && d.getDay() !== 6 && !free.has(iso)) count++;
      }
      return count;
    };

    const tick = () => {
      const diff = Math.max(0, target.getTime() - Date.now());
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor(diff / 3600000) % 24;
      const mins = Math.floor(diff / 60000) % 60;
      const secs = Math.floor(diff / 1000) % 60;
      [['days',days],['hours',hours],['minutes',mins],['seconds',secs]].forEach(([key,val]) => {
        const el = document.querySelector(`[data-count-${key}]`); if (el) el.textContent = fmt(val);
      });
    };
    tick(); setInterval(tick, 1000);
    const school = document.querySelector('[data-school-days]');
    if (school) school.textContent = `${schoolDays()} Schueltäg (Wuchenänd & iitreiti freii Täg abzoge)`;
  }

  function lastFriday(now = new Date()) {
    const d = new Date(now); d.setHours(12,0,0,0);
    const delta = (d.getDay() - 5 + 7) % 7;
    d.setDate(d.getDate() - delta);
    return d;
  }

  function selectFlashback(list) {
    if (!list.length) return null;
    const preferred = list.filter((p) => p.flashback);
    const pool = preferred.length ? preferred : list;
    const friday = lastFriday();
    const key = `${friday.getFullYear()}-${friday.getMonth()+1}-${friday.getDate()}`;
    let hash = 0; for (const ch of key) hash = ((hash << 5) - hash + ch.charCodeAt(0)) | 0;
    return pool[Math.abs(hash) % pool.length];
  }

  async function home() {
    const [site, list] = await Promise.all([settings(), posts()]);
    document.querySelector('[data-hero-kicker]').textContent = site.hero_kicker || '';
    document.querySelector('[data-hero-1]').textContent = site.hero_title_1 || 'Eusi Kanti.';
    document.querySelector('[data-hero-2]').textContent = site.hero_title_2 || 'Eusi Gschichte.';
    document.querySelector('[data-hero-text]').textContent = site.hero_text || '';
    document.querySelector('[data-quote]').textContent = `„${site.quote || ''}“`;
    startCountdown(site);
    const recent = document.querySelector('[data-recent-posts]');
    if (recent) recent.innerHTML = list.slice(0, 6).map(postCard).join('') || '<div class="glass empty-state">No kei Erinnerige – schriib die erschti.</div>';
    const fb = selectFlashback(list);
    if (fb) {
      const el = document.querySelector('[data-home-flashback]');
      if (el) el.innerHTML = `<span class="tag">Freitigs-Flashback</span><h3>${esc(fb.title)}</h3><p>${esc(fb.excerpt || '')}</p><a class="btn btn-ghost" href="/beitrag/?id=${encodeURIComponent(fb.id)}">Zum Flashback →</a>`;
    }
  }

  async function listing(category = null) {
    const list = await posts();
    const params = new URLSearchParams(location.search);
    const qInput = document.querySelector('[data-filter-q]');
    const catInput = document.querySelector('[data-filter-category]');
    if (qInput && params.get('q')) qInput.value = params.get('q');
    if (catInput && category) catInput.value = category;

    const render = () => {
      const q = (qInput?.value || '').trim().toLowerCase();
      const selected = category || catInput?.value || 'all';
      const filtered = list.filter((p) => {
        const matchCat = selected === 'all' || p.category === selected;
        const hay = `${p.title} ${p.author} ${p.excerpt} ${(p.tags||[]).join(' ')}`.toLowerCase();
        return matchCat && (!q || hay.includes(q));
      });
      const grid = document.querySelector('[data-listing]');
      grid.innerHTML = filtered.length ? filtered.map(postCard).join('') : '<div class="glass empty-state">Nüt gfunde. Probier en andere Begriff.</div>';
      const count = document.querySelector('[data-result-count]'); if (count) count.textContent = `${filtered.length} Beiträg`;
    };
    qInput?.addEventListener('input', render); catInput?.addEventListener('change', render); render();
  }

  async function calendar() {
    const list = await posts();
    let cursor = new Date(); cursor.setDate(1);
    const grid = document.querySelector('[data-calendar-grid]');
    const title = document.querySelector('[data-calendar-title]');
    const render = () => {
      const year = cursor.getFullYear(); const month = cursor.getMonth();
      title.textContent = new Intl.DateTimeFormat('de-CH', { month:'long', year:'numeric' }).format(cursor);
      const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
      const start = new Date(year, month, 1 - firstWeekday);
      const cells = [];
      for (let i=0;i<42;i++) {
        const d = new Date(start); d.setDate(start.getDate()+i);
        const dayPosts = list.filter((p) => {
          const pd = new Date(p.date);
          return pd.getFullYear()===d.getFullYear() && pd.getMonth()===d.getMonth() && pd.getDate()===d.getDate();
        });
        const today = new Date();
        const isToday = today.toDateString()===d.toDateString();
        const muted = d.getMonth()!==month;
        cells.push(`<a class="calendar-day ${muted?'muted':''} ${isToday?'today':''}" ${dayPosts[0]?`href="/beitrag/?id=${encodeURIComponent(dayPosts[0].id)}"`:''}>
          <span class="day-number">${d.getDate()}</span>
          <div class="day-dots">${dayPosts.slice(0,5).map(() => '<span class="day-dot"></span>').join('')}</div>
          <div class="day-preview">${dayPosts[0] ? esc(dayPosts[0].title) : ''}</div>
        </a>`);
      }
      grid.innerHTML = cells.join('');
    };
    document.querySelector('[data-cal-prev]')?.addEventListener('click', () => { cursor.setMonth(cursor.getMonth()-1); render(); });
    document.querySelector('[data-cal-next]')?.addEventListener('click', () => { cursor.setMonth(cursor.getMonth()+1); render(); });
    render();
  }

  async function flashback() {
    const list = await posts();
    const chosen = selectFlashback(list);
    const mount = document.querySelector('[data-flashback-card]');
    if (!chosen) { mount.innerHTML = '<div class="empty-state">No kei Flashback verfügbar.</div>'; return; }
    mount.innerHTML = `<div class="article"><span class="tag">Freitigs-Flashback</span><h1>${esc(chosen.title)}</h1><p class="hero-text">${esc(chosen.excerpt || '')}</p>${chosen.image?`<div class="article-cover"><img src="${esc(chosen.image)}" alt=""></div>`:''}<div class="article-body">${markdown(chosen.body || '')}</div><div class="post-meta"><span>vo ${esc(chosen.author||'Anonym')}</span><span>${formatDate(chosen.date)}</span></div></div>`;
  }

  async function roulette() {
    const list = await posts();
    const stage = document.querySelector('[data-roulette-stage]');
    const pick = () => {
      if (!list.length) { stage.innerHTML = '<div class="empty-state">No kei Beiträg für d Roulette.</div>'; return; }
      const p = list[Math.floor(Math.random()*list.length)];
      stage.innerHTML = `<div><div class="emoji">✦</div><span class="tag">Memory Roulette</span><h2>${esc(p.title)}</h2><p class="hero-text">${esc(p.excerpt||'')}</p><div class="actions" style="justify-content:center"><a class="btn btn-primary" href="/beitrag/?id=${encodeURIComponent(p.id)}">Erinnerig öffne →</a><button class="btn btn-ghost" type="button" data-again>Nochmal</button></div></div>`;
      stage.querySelector('[data-again]')?.addEventListener('click', pick);
    };
    pick();
  }

  async function detail() {
    const id = new URLSearchParams(location.search).get('id');
    const list = await posts();
    const p = list.find((post) => post.id === id);
    const mount = document.querySelector('[data-article]');
    if (!p) { mount.innerHTML = '<div class="glass empty-state">Dä Beitrag git’s nöd oder er isch no nöd freigegeh.</div>'; return; }
    const meta = categoryMeta[p.category] || categoryMeta.erinnerig;
    document.title = `${p.title} · Kanti Ziitkapsle`;
    mount.innerHTML = `
      <article class="glass article">
        <span class="tag" style="color:${meta.color}">${esc(meta.label)}</span>
        <h1>${esc(p.title)}</h1>
        <p class="hero-text">${esc(p.excerpt||'')}</p>
        <div class="post-meta"><span>vo ${esc(p.author||'Anonym')}</span><span>${formatDate(p.date,true)}</span></div>
        ${p.image?`<div class="article-cover"><img src="${esc(p.image)}" alt="${esc(p.title)}"></div>`:''}
        <div class="article-body">${markdown(p.body||'')}</div>
      </article>
      <aside class="glass article-aside">
        <h3>Weisch no?</h3><p style="color:var(--muted);line-height:1.6">Dä Beitrag isch Teil vo eurer Ziitkapsle. In es paar Jahr fühlt sich genau so öppis komplett anders aa.</p>
        <button class="btn btn-ghost" type="button" data-fav>♡ Für mich merke</button>
      </aside>`;
    const key = `fav:${p.id}`;
    const btn = mount.querySelector('[data-fav]');
    const sync = () => { btn.textContent = localStorage.getItem(key) ? '♥ Gmerkt' : '♡ Für mich merke'; };
    btn.addEventListener('click', () => { localStorage.getItem(key) ? localStorage.removeItem(key) : localStorage.setItem(key,'1'); sync(); }); sync();
  }

  function loginPage() {
    document.querySelector('[data-login-btn]')?.addEventListener('click', () => window.KantiAuth?.login());
  }

  function studentPage() {
    const refresh = () => {
      const user = window.KantiAuth?.user();
      if (!user) return;
      document.querySelector('[data-dashboard-name]').textContent = window.KantiAuth.displayName(user);
      const roles = window.KantiAuth.rolesOf(user);
      document.querySelector('[data-dashboard-role]').textContent = roles.includes('admin') ? 'admin' : roles.includes('student') ? 'student' : 'ohni Rolle';
      document.querySelector('[data-admin-card]')?.toggleAttribute('hidden', !roles.includes('admin'));
    };
    window.addEventListener('kanti:auth', refresh);
    setTimeout(refresh, 800);
    document.querySelector('[data-logout]')?.addEventListener('click', () => window.KantiAuth?.logout());
  }

  async function init() {
    mountShell();
    window.KantiAuth?.init();
    const page = document.body.dataset.page;
    if (page === 'home') await home();
    else if (page === 'erinnerungen') await listing();
    else if (['lehrer-sprueche','memes','fotos','kanti-lore'].includes(page)) {
      const map = { 'lehrer-sprueche':'lehrer-spruch', memes:'meme', fotos:'foto', 'kanti-lore':'kanti-lore' };
      await listing(map[page]);
    }
    else if (page === 'kalender') await calendar();
    else if (page === 'flashback') await flashback();
    else if (page === 'roulette') await roulette();
    else if (page === 'beitrag') await detail();
    else if (page === 'login') loginPage();
    else if (page === 'schueler') studentPage();
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', () => K.init());
