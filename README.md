# KSK Ziitkapsle – Netlify + Decap CMS

Mehrseitige statische Website (keine SPA) mit getrennten Schüler- und Admin-Logins.

## Rollen
- `student`: Zugriff auf `/schueler/` und das Einreichformular.
- `admin`: Zugriff auf `/schueler/` und `/admin/` (Decap CMS).

## Netlify Setup
1. Repo auf GitHub anlegen und mit Netlify verbinden. Build: `npm run build`, Publish: `dist`.
2. Netlify Identity aktivieren, Registrierung auf **Invite only** stellen.
3. Git Gateway aktivieren (für Decap CMS).
4. Benutzer einladen. In Identity bei jedem Schüler die Rolle `student`, bei Admins `admin` setzen.
5. Schüler reichen Erinnerungen über das Netlify-Formular ein. Admins prüfen die Form Submissions und veröffentlichen freigegebene Erinnerungen über `/admin/`.

## Seiten
`/`, `/erinnerungen/`, `/kalender/`, `/flashback/`, `/login/`, `/schueler/`, `/admin/`.

Wichtig: Der Admin-Pfad wird serverseitig am Netlify-CDN per Rolle geschützt, nicht nur per JavaScript.
