const state = document.querySelector('#authState');
const adminOnly = document.querySelectorAll('[data-admin-only]');

function getRoles(user) {
  return Array.isArray(user?.app_metadata?.roles) ? user.app_metadata.roles : [];
}

function isAdmin(user) {
  return getRoles(user).includes('admin');
}

function updateUi(user) {
  const roles = getRoles(user);
  if (state) {
    state.textContent = user
      ? `Igloggt als ${user.email}${isAdmin(user) ? ' · Admin' : ' · Schüler/in'}`
      : 'No nöd igloggt.';
  }
  document.querySelector('#logoutBtn')?.toggleAttribute('hidden', !user);
  adminOnly.forEach(el => el.toggleAttribute('hidden', !isAdmin(user)));
}

function routeAfterLogin(user) {
  if (!user) return;
  window.location.href = isAdmin(user) ? '/admin/' : '/schueler/';
}

if (window.netlifyIdentity) {
  window.netlifyIdentity.on('init', user => {
    updateUi(user);

    const path = window.location.pathname;
    if (path.startsWith('/login/')) return;

    if (!user && (path.startsWith('/schueler/') || path.startsWith('/admin/'))) {
      window.location.href = '/login/';
      return;
    }

    // Zweite Schutzschicht im Browser. Der eigentliche Schutz von /admin/
    // erfolgt zusätzlich serverseitig über die Netlify Role-Regel.
    if (path.startsWith('/admin/') && !isAdmin(user)) {
      window.location.href = '/schueler/';
    }
  });

  window.netlifyIdentity.on('login', user => {
    window.netlifyIdentity.close();
    updateUi(user);
    routeAfterLogin(user);
  });

  window.netlifyIdentity.on('logout', () => {
    updateUi(null);
    window.location.href = '/';
  });
}

document.querySelector('#loginBtn')?.addEventListener('click', () => window.netlifyIdentity?.open('login'));
document.querySelector('#logoutBtn')?.addEventListener('click', () => window.netlifyIdentity?.logout());
