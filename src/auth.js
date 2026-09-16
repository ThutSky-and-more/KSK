(function () {
  const IDENTITY_SRC = 'https://identity.netlify.com/v1/netlify-identity-widget.js';

  function loadIdentityScript() {
    if (window.netlifyIdentity) return Promise.resolve(window.netlifyIdentity);
    const existing = document.querySelector(`script[src="${IDENTITY_SRC}"]`);
    if (existing) {
      return new Promise((resolve) => existing.addEventListener('load', () => resolve(window.netlifyIdentity), { once: true }));
    }
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = IDENTITY_SRC;
      script.async = true;
      script.onload = () => resolve(window.netlifyIdentity);
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function rolesOf(user) {
    return Array.isArray(user?.app_metadata?.roles) ? user.app_metadata.roles : [];
  }

  function displayName(user) {
    return user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Schüeler:in';
  }

  function initials(user) {
    return displayName(user).split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'K';
  }

  function syncUserUI(user) {
    document.querySelectorAll('[data-user-name]').forEach((el) => { el.textContent = user ? displayName(user) : 'Login'; });
    document.querySelectorAll('[data-user-role]').forEach((el) => {
      const roles = rolesOf(user);
      el.textContent = roles.includes('admin') ? 'Admin' : roles.includes('student') ? 'Student' : user ? 'Eingeloggt' : 'Gast';
    });
    document.querySelectorAll('[data-user-avatar]').forEach((el) => { el.textContent = user ? initials(user) : '↗'; });
    document.querySelectorAll('[data-admin-only]').forEach((el) => { el.hidden = !rolesOf(user).includes('admin'); });
    document.querySelectorAll('[data-auth-only]').forEach((el) => { el.hidden = !user; });
    document.querySelectorAll('[data-guest-only]').forEach((el) => { el.hidden = !!user; });
    window.dispatchEvent(new CustomEvent('kanti:auth', { detail: { user } }));
  }

  async function initIdentity() {
    try {
      const identity = await loadIdentityScript();
      if (!identity) return;
      identity.setLocale?.('de');
      identity.on('init', syncUserUI);
      identity.on('login', async (user) => {
        syncUserUI(user);
        try { await identity.refresh(); } catch (_) {}
        identity.close();
        const next = new URLSearchParams(location.search).get('next');
        if (document.body.dataset.page === 'login') location.href = next || '/schueler/';
      });
      identity.on('logout', () => {
        syncUserUI(null);
        if (['schueler', 'admin', 'schreiben'].includes(document.body.dataset.page)) location.href = '/';
      });
      identity.init();
    } catch (error) {
      console.warn('Netlify Identity konnte nicht geladen werden:', error);
    }
  }

  window.KantiAuth = {
    init: initIdentity,
    login() { window.netlifyIdentity?.open('login'); },
    logout() { window.netlifyIdentity?.logout(); },
    user() { return window.netlifyIdentity?.currentUser?.() || null; },
    roles() { return rolesOf(window.netlifyIdentity?.currentUser?.()); },
    displayName,
    rolesOf,
  };
})();
