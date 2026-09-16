# Kanti Ziitkapsle – FINAL v6

Die Version behebt speziell zwei Probleme aus v5:

1. **Home** wird in Netlify explizit auf `index.html` geroutet. Zusätzlich existiert `/home/` als Fallback.
2. **Schüler-Iiträg sind sichtbar.** Neue Schüler-Iiträg werden direkt mit `status: approved` gespeichert. Alte `pending`-Iiträg werden ebenfalls angezeigt. Nur `rejected` wird öffentlich versteckt.

## Wichtig: Decap + Netlify ist Git-basiert
Nach `Speichern` schreibt Decap die Datei ins GitHub-Repository. Danach startet Netlify den neuen Deploy. Darum kann es je nach Netlify ungefähr **10–60 Sekunden** dauern, bis ein neuer/gelöschter/geänderter Iitrag auf der normalen Website sichtbar ist. Das ist kein Browser-Hänger.

Die Site deaktiviert für `app.js`, `auth.js` und `/data/*` Browser-Caching, damit nach einem Deploy nicht versehentlich alte Daten angezeigt werden.

## Upload nach GitHub
Den **Inhalt dieses Ordners** ins Repository laden. `dist/` nicht hochladen; Netlify erstellt ihn durch:

```bash
npm run build
```

Netlify:
- Build command: `npm run build`
- Publish directory: `dist`
- Identity aktivieren
- Git Gateway aktivieren
- Rollen: `student` und `admin`

## Inhalte
Schüler können in `/schreiben/` erstellen:
- Erinnerige
- Lehrer-Sprüch
- Memes mit Bild
- Fotos
- Kalender-Iiträg
- Kanti-Lore

Admin kann unter `/admin/cms/` Inhalte bearbeiten, ablehnen und löschen. Unter `/admin/` können Identity-Rollen verwaltet werden.
