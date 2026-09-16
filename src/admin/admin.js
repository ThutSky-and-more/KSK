(() => {
  const list = () => document.querySelector('[data-users-list]');
  const message = () => document.querySelector('[data-admin-message]');

  function showMessage(text, kind = 'ok') {
    const el = message(); if (!el) return;
    el.hidden = false; el.textContent = text; el.dataset.kind = kind;
    clearTimeout(showMessage.timer);
    showMessage.timer = setTimeout(() => { el.hidden = true; }, 6000);
  }

  async function authHeaders() {
    const user = window.KantiAuth?.user();
    if (!user) throw new Error('Du bisch nöd iigloggt.');
    const token = await user.jwt();
    return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
  }

  async function api(method = 'GET', body) {
    const headers = await authHeaders();
    const res = await fetch('/.netlify/functions/admin-users', {
      method, headers, cache: 'no-store',
      ...(body ? { body: JSON.stringify(body) } : {})
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `Fehler ${res.status}`);
    return data;
  }

  function escapeHtml(value = '') {
    return String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');
  }

  function renderUsers(users) {
    const mount = list(); if (!mount) return;
    if (!users.length) { mount.innerHTML = '<div class="empty-state">No kei Identity-Benutzer gfunde.</div>'; return; }
    mount.innerHTML = users.map((u) => {
      const role = u.roles?.includes('admin') ? 'admin' : 'student';
      const title = u.name || u.email || 'Ohni Name';
      return `<div class="user-row" data-user-id="${escapeHtml(u.id)}">
        <div class="user-row-main"><span class="avatar">${escapeHtml((title[0] || 'K').toUpperCase())}</span><span><strong>${escapeHtml(title)}</strong><small>${escapeHtml(u.email || '')}</small></span></div>
        <div class="user-role-controls">
          <select class="select compact" data-role-select aria-label="Rolle für ${escapeHtml(title)}"><option value="student" ${role==='student'?'selected':''}>student</option><option value="admin" ${role==='admin'?'selected':''}>admin</option></select>
          <button class="btn btn-primary compact-btn" type="button" data-save-role>Speichere</button>
        </div>
      </div>`;
    }).join('');

    mount.querySelectorAll('[data-save-role]').forEach((button) => button.addEventListener('click', async () => {
      const row = button.closest('[data-user-id]');
      const id = row.dataset.userId;
      const role = row.querySelector('[data-role-select]').value;
      button.disabled = true; button.textContent = '…';
      try {
        const data = await api('PATCH', { id, role });
        showMessage(`Rolle uf «${role}» gsetzt. ${data.note || ''}`);
      } catch (error) { showMessage(error.message, 'error'); }
      finally { button.disabled = false; button.textContent = 'Speichere'; }
    }));
  }

  async function loadUsers() {
    const mount = list(); if (mount) mount.innerHTML = '<div class="empty-state">Benutzer werde glade …</div>';
    try { const data = await api(); renderUsers(data.users || []); }
    catch (error) { if (mount) mount.innerHTML = `<div class="empty-state">${escapeHtml(error.message)}</div>`; showMessage(error.message, 'error'); }
  }

  function init() {
    document.querySelector('[data-users-reload]')?.addEventListener('click', loadUsers);
    document.querySelector('[data-logout]')?.addEventListener('click', () => window.KantiAuth?.logout());
    window.addEventListener('kanti:auth', (event) => {
      const roles = window.KantiAuth?.rolesOf(event.detail.user) || [];
      if (roles.includes('admin')) loadUsers();
    });
    setTimeout(() => { if (window.KantiAuth?.roles().includes('admin')) loadUsers(); }, 1100);
  }
  document.addEventListener('DOMContentLoaded', init);
})();
