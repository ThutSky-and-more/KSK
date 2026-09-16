# Kanti Ziitkapsle – FINAL v5

Dunkli, mobile-optimierti Kanti-Erinnerigssite mit Decap CMS, Netlify Identity und Rollen.

## Was isch drin?

- Startsite **ohni vorinstallierti Beiträg** – d Ziitkapsle startet leer.
- Schüler mit Identity-Rolle `student` chönd über `/schreiben/` iiträge:
  - Erinnerige (Text + optional Bild)
  - Lehrer-Sprüch (Lehrperson + Spruch + Kontext + optional Bild)
  - Memes (Bild + Caption)
  - Fotos (Bild + Beschriibig)
  - Kalender-Iiträg (Datum + Text + optional Bild)
  - Kanti-Lore (Text + optional Bild)
- Alli Schüler-Iiträg starte automatisch als `pending`.
- Admins chönd im Admin-CMS `/admin/cms/`:
  - Iiträg bearbeite
  - `pending / approved / rejected` setze
  - Iiträg **lösche**
  - Flashback markieren
  - Site- und Countdown-Iistellige ändere
- Admin-Dashboard `/admin/`:
  - Identity-Benutzer aazeige
  - Rolle `student` / `admin` ändere
  - Direktlinks zu allne Content-Sammlige
  - Direktlink zu de Countdown-Iistellige
- Schuelstart isch **10.08.2026**.
- De genaue letschti Schueltag / Schuelschluss isch absichtlich no leer. En Admin legt s Datum im Juli via Admin-CMS fest.
- Countdown und «Schueltäg no» sind grösser und uf em Handy besser lesbar.
- Flashback Friday, Roulette, Erinnerigs-Kalender, Suche, Filter und einzelni Beitragsseite.

## GitHub hochlade

De **Inhalt vo däm Projektordner** i d Root vom GitHub-Repository lade. `dist/` nöd selber erstelle oder hochlade – Netlify baut dä Ordner automatisch.

Root vom Repository:

```text
content/
netlify/
src/
build.mjs
netlify.toml
package.json
README.md
```

## Netlify

1. Repository mit Netlify verbinde.
2. Netlify liest `netlify.toml` automatisch.
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Deploy starte.

## Identity einrichte

1. Netlify → Project configuration → **Identity** → Enable Identity.
2. Für e Klass am beste **Invite only** verwände.
3. **Git Gateway** aktiviere, will Decap CMS darüber i s GitHub-Repo schribt.
4. De **erscht Admin** muesch einmal in Netlify Identity manuell uf d Rolle `admin` setze. Das isch nötig, damit überhaupt öpper s geschützte Admin-Dashboard öffne cha.
5. Neui Benutzer bechömed über `netlify/functions/identity-signup.js` automatisch d Rolle `student`.
6. Nachher chasch als Admin unter `/admin/` d Rolle vo Benutzer zwüsche `student` und `admin` ändere.

> Identity-Rollenänderige sind nöd zwingend im bereits laufende JWT sofort sichtbar. De betroffen Benutzer söll sich neu iilogge bzw. d Session erneuere.

## Inhalt freigäh

Schüler → `/schreiben/` → Iitrag erfasse → `pending`

Admin → `/admin/` → «Beiträg prüefe & lösche» → Iitrag öffne → Status `approved` → Save

Nach em Commit baut Netlify neu. Nur Iiträg mit `approved` werde öffentlich i `/data/posts.json` verwendet.

## Beitrag lösche

Admin → `/admin/cms/` → Sammlig öffne → Iitrag öffne → **Delete entry**.

Das löscht d Content-Datei im Git-Repository. Nach em nächste Netlify-Deploy verschwindet de Iitrag vo de Site.

## Schuelschluss setze

Admin → `/admin/` → «Schuelschluss festlege» oder im CMS `Site-Iistellige` → `Allgemein & Countdown`.

- `school_start_date` = `2026-08-10`
- `graduation_date` = genaue letschti Schueltag im Juli (von Admin festlege)
- `school_free_days` = Ferie / freii Täg, wo bi de Schueltäg abzooge werde söled

## Ordner

```text
content/
  erinnerungen/
  lehrer-sprueche/
  memes/
  fotos/
  kalender/
  kanti-lore/
  settings/site.json
netlify/functions/
  admin-users.mjs
  identity-signup.js
src/
  admin/
    index.html       # Admin-Dashboard
    admin.js
    cms/             # Admin-Decap-CMS
  schreiben/         # Schüler-Decap-CMS
  uploads/
  ... öffentliche Site
```

## Wichtig

`/admin/*` wird auf Netlify nur für d Identity-Rolle `admin` usglieferet. `/schreiben/*` und `/schueler/*` sind für `student` und `admin` freigegeh.

S Identity-Rollenmanagement funktioniert über e Netlify Function und `@netlify/identity`. Das cha lokal nöd vollständig mit echte Netlify-Benutzer getestet werde; dä Teil mues uf em deployte Netlify-Projekt getestet werde.
