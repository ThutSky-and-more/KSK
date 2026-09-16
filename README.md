# Kanti Ziitkapsle – finale Multi-Page-Version

Dunkli, farbigi Erinnerigs-Site für e Klass – mit Netlify, Netlify Identity und Decap CMS.

## Was drin isch

- **Kei SPA**: Startsite, Erinnerige, Kalender, Flashback, Roulette, Kategorie-Site, Login, Schülerbereich und einzelne Beiträg hend eigeni URLs.
- **Netlify Identity** mit `student` und `admin` über `app_metadata.roles`.
- **Schüler-Decap unter `/schreiben/`**: Jede eingeladeni Person mit Rolle `student` oder `admin` cha Text schriibe und Bilder/Memes ufelade.
- **Admin-Decap unter `/admin/`**: Nur Rolle `admin`. Admins chönd `pending` → `approved` oder `rejected` setze und Site-Iistellige bearbeite.
- Nur **`approved`**-Beiträg sind öffentlich sichtbar.
- **Erinnerigs-Kalender** mit Beiträg pro Tag.
- **Flashback Friday**: pro Wuche wird deterministisch en freigegebne Beitrag usgwählt; Admin cha Beiträg als Flashback bevorzuge.
- **Memory Roulette**.
- **Countdown** bis zum Matura-/letzte-Schultag plus Wuchetag-Schätzung; iitreiti freii Täg werde abzoge.
- Suche + Kategorie-Filter.
- Handy-optimiert, Dark Glass / Neon, bewusst ruhige Hintergrundverläuf.
- Inhalt und UI-Texte grösstenteils Schwiizerdütsch.

## GitHub-Struktur

Im Repository muess direkt das da ligge:

```text
content/
src/
.gitignore
build.mjs
netlify.toml
package.json
README.md
```

**`dist/` nöd ufelade.** Dä Ordner wird bi jedem Netlify-Build neu erstellt.

## 1. Uf GitHub ufelade

ZIP entpacke und **de Inhalt** vom Projektordner i dis GitHub-Repository zieh. `package.json` und `netlify.toml` müend im Root vom Repo sii.

## 2. Mit Netlify verbinde

1. Netlify → **Add new project** → **Import an existing project** → GitHub.
2. Repository uswähle.
3. `netlify.toml` übernimmt automatisch:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Deploy starte.

De Build bricht bewusst ab, falls wichtige Dateien fehlen. Wenn er erfolgreich isch, existiert garantiert `dist/index.html`.

## 3. Netlify Identity iischalte

Netlify → **Integrations → Identity → Netlify Identity → Enable**.

Empfehlig für e Klass:

- Registration: **Invite only**
- Alli Schüler einzeln iilade.
- Jede Schüler:in bechunnt Rolle **`student`**.
- Admins bechömed Rolle **`admin`**.

D Site prüeft d Rolle über `app_metadata.roles`. D `netlify.toml` schützt d Pfad zusätzlich am Netlify-CDN:

- `/schueler/*`: `student` oder `admin`
- `/schreiben/*`: `student` oder `admin`
- `/admin/*`: nur `admin`

Nach ere Rollenänderig am beschte us- und wieder iilogge, damit en neue JWT mit de aktuelle Rolle usgstellt wird.

## 4. Git Gateway für Decap iischalte

Für de gewünschti Workflow, wo Schüler **ohni GitHub-Account** im Decap CMS schriibe, brucht das Projekt Git Gateway:

Netlify → Identity-Konfiguration → **Services / Git Gateway → Enable Git Gateway**.

Wenn Netlify im Git-Gateway-Bereich nach Rollen fragt, nur `student` und `admin` zuloh.

### Hinweis 2026

Netlify bezeichnet Git Gateway inzwischen als **deprecated**. Es funktioniert weiterhin, wird für komplett neue Setups aber nümme empfohlen. Für e Klass isch es trotzdem de direktischti Weg, wenn nöd jede Schüler:in en GitHub-Account mit Repository-Schreibrecht ha söll. Falls Git Gateway bi dim Netlify-Account nümme aktivierbar isch, müesst mer s Backend uf GitHub/Decap Turbo umstelle.

## 5. So funktioniert s Schriibe

1. Schüler:in gaht uf `/login/` und loggt sich ii.
2. Im `/schueler/` → **Neue Beitrag schriibe**.
3. `/schreiben/` öffnet Decap CMS.
4. Titel, Datum, Kategorie, Autor/Spitzname, Vorschau, Bericht und optional Bild/Meme erfasse.
5. Decap commitet de Beitrag als JSON i `content/posts/` und s Bild i `src/uploads/`.
6. Schüler-Beiträg händ automatisch `status: pending`.
7. Admin öffnet `/admin/`, prüeft de Beitrag und setzt `status` uf `approved`.
8. Netlify baut neu. Danach isch de Beitrag öffentlich.

### Wichtig zur Schüler-Sammlig

D Schüler-Decap-Ansicht isch uf `status: pending` gfilteret. Freigegebni Beiträg sind det nümme sichtbar. Decap bietet mit Git Gateway aber kei echte **pro-User-Dateiberechtigung** innerhalb derselbe Collection. Das heisst: Schüler chönd in de normalen Decap-Oberfläche au anderi noch offene `pending`-Beiträg gseh. Für e vertrauensvolli Klass isch das oft okay; für strikti Privatsphäre brücht s en eigete Submission-Backend statt reinem Decap.

## 6. Datum und Countdown ändere

Am eifachste als Admin:

`/admin/` → **Site-Iistellige → Allgemein**

Dort chasch de letzte Schultag/Maturadatum und freii Täg ändere.

Oder direkt in:

`content/settings/site.json`

## 7. Kategorien

- `erinnerig`
- `lehrer-spruch`
- `meme`
- `foto`
- `kanti-lore`

## 8. Lokal teste

```bash
npm run build
```

Danach chasch z. B. mit eme lokale Static-Server de Ordner `dist/` serviere. Netlify Identity und Git Gateway funktioniered vollständig erst uf de Netlify-Domain.

## Datenschutz

Ladet nur Bilder hoch, wo die abgebildete Persone mit de Veröffentlichung i eurer Klassensite okay sind. Vor em Abschluss lohnt sich au en Export/Backup vom Repository.
