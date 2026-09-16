(() => {
  function loadWidget() {
    if (window.netlifyIdentity) return Promise.resolve(window.netlifyIdentity);
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://identity.netlify.com/v1/netlify-identity-widget.js';
      script.async = true;
      script.onload = () => resolve(window.netlifyIdentity);
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  const rolesOf = (user) => Array.isArray(user?.app_metadata?.roles) ? user.app_metadata.roles : [];
  const displayName = (user) => user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Schüeler:in';
  const initials = (user) => displayName(user).split(/\s+/).filter(Boolean).slice(0,2).map(p => p[0]).join('').toUpperCase() || 'K';

  function sync(user) {
    const roles = rolesOf(user);
    document.querySelectorAll('[data-user-name]').forEach(el => el.textContent = user ? displayName(user) : 'Login');
    document.querySelectorAll('[data-user-role]').forEach(el => el.textContent = roles.includes('admin') ? 'Admin' : roles.includes('student') ? 'Student' : user ? 'Iigloggt' : 'Gast');
    document.querySelectorAll('[data-user-avatar]').forEach(el => el.textContent = user ? initials(user) : '↗');
    document.querySelectorAll('[data-admin-only]').forEach(el => el.hidden = !roles.includes('admin'));
    document.querySelectorAll('[data-auth-only]').forEach(el => el.hidden = !user);
    document.querySelectorAll('[data-guest-only]').forEach(el => el.hidden = !!user);
    window.dispatchEvent(new CustomEvent('kanti:auth', { detail: { user } }));
  }

  async function init() {
    try {
      const identity = await loadWidget();
      if (!identity) return;
      identity.setLocale?.('de');
      identity.on('init', sync);
      identity.on('login', async (user) => {
        sync(user);
        try { await identity.refresh(); } catch (_) {}
        identity.close();
        const next = new URLSearchParams(location.search).get('next');
        if (document.body.dataset.page === 'login') location.href = next || '/schueler/';
      });
      identity.on('logout', () => {
        sync(null);
        if (['schueler','admin','schreiben'].includes(document.body.dataset.page)) location.href = '/';
      });
      identity.init();
    } catch (error) {
      console.warn('Netlify Identity konnte nöd glade werde:', error);
    }
  }

  window.KantiAuth = {
    init,
    login() { window.netlifyIdentity?.open('login'); },
    logout() { window.netlifyIdentity?.logout(); },
    user() { return window.netlifyIdentity?.currentUser?.() || null; },
    roles() { return rolesOf(window.netlifyIdentity?.currentUser?.()); },
    rolesOf,
    displayName,
  };
})();
