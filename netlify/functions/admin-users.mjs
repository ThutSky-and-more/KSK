import { getUser, admin } from '@netlify/identity';

const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
});

export default async (req) => {
  const actor = await getUser();
  if (!actor) return json({ error: 'Nöd iigloggt.' }, 401);
  if (!Array.isArray(actor.roles) || !actor.roles.includes('admin')) return json({ error: 'Nur Admins.' }, 403);

  try {
    if (req.method === 'GET') {
      const users = await admin.listUsers({ perPage: 200 });
      return json({ users: users.map((u) => ({
        id: u.id,
        email: u.email || '',
        name: u.name || u.userMetadata?.full_name || u.userMetadata?.name || '',
        roles: Array.isArray(u.roles) ? u.roles : Array.isArray(u.appMetadata?.roles) ? u.appMetadata.roles : [],
        createdAt: u.createdAt || '',
        lastSignInAt: u.lastSignInAt || '',
      })) });
    }

    if (req.method === 'PATCH' || req.method === 'POST') {
      const body = await req.json().catch(() => ({}));
      const id = String(body.id || '');
      const role = String(body.role || '');
      if (!id || !['student', 'admin'].includes(role)) return json({ error: 'Ungültigi Rolle.' }, 400);
      if (id === actor.id && role !== 'admin') return json({ error: 'Du chasch dini eigeti Admin-Rolle nöd entferne.' }, 400);

      const target = await admin.getUser(id);
      const appMetadata = { ...(target.appMetadata || {}), roles: [role] };
      const updated = await admin.updateUser(id, { app_metadata: appMetadata });
      return json({
        ok: true,
        user: {
          id: updated.id,
          email: updated.email || '',
          roles: Array.isArray(updated.roles) ? updated.roles : [role],
        },
        note: 'D Rolle gilt spätestens nach em nächste Login oder Token-Refresh.'
      });
    }

    return json({ error: 'Methode nöd erlaubt.' }, 405);
  } catch (error) {
    console.error(error);
    return json({ error: error?.message || 'Identity-Fehler.' }, 500);
  }
};
