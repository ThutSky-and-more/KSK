import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dist = path.join(root, 'dist');
const src = path.join(root, 'src');
const settingsFile = path.join(root, 'content', 'settings', 'site.json');

const contentTypes = [
  { folder: 'erinnerungen', category: 'erinnerig' },
  { folder: 'lehrer-sprueche', category: 'lehrer-spruch' },
  { folder: 'memes', category: 'meme' },
  { folder: 'fotos', category: 'foto' },
  { folder: 'kalender', category: 'kalender' },
  { folder: 'kanti-lore', category: 'kanti-lore' },
];

function fail(message) {
  console.error(`\n✗ ${message}`);
  process.exit(1);
}

function readJSON(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch (error) { fail(`${path.relative(root, file)} isch kei gültigs JSON: ${error.message}`); }
}

function cleanText(value = '') { return String(value ?? '').trim(); }

function normalize(raw, category, id) {
  const author = cleanText(raw.author) || 'Anonym';
  const date = raw.date || raw.event_date || new Date().toISOString();
  const common = {
    id: `${category}:${id}`,
    source_id: id,
    category,
    status: raw.status || 'pending',
    author,
    date,
    image: raw.image || '',
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    featured: Boolean(raw.featured),
    flashback: Boolean(raw.flashback),
  };

  if (category === 'lehrer-spruch') {
    const teacher = cleanText(raw.teacher) || 'Lehrperson';
    const quote = cleanText(raw.quote);
    return { ...common, title: raw.title || `${teacher}: «${quote.slice(0, 70)}${quote.length > 70 ? '…' : ''}»`, excerpt: raw.context || quote, body: `> ${quote}${raw.context ? `\n\n${raw.context}` : ''}`, teacher, quote };
  }
  if (category === 'meme') {
    return { ...common, title: raw.title || 'Meme', excerpt: raw.caption || '', body: raw.caption || '' };
  }
  if (category === 'foto') {
    return { ...common, title: raw.title || 'Foto', excerpt: raw.caption || '', body: raw.caption || '' };
  }
  if (category === 'kalender') {
    return { ...common, title: raw.title || 'Kalender-Iitrag', excerpt: raw.description || '', body: raw.description || '', location: raw.location || '' };
  }
  return {
    ...common,
    title: raw.title || 'Ohni Titel',
    excerpt: raw.excerpt || '',
    body: raw.body || raw.description || '',
  };
}

if (!fs.existsSync(src)) fail('src/ fehlt.');
if (!fs.existsSync(path.join(src, 'index.html'))) fail('src/index.html fehlt.');
if (!fs.existsSync(settingsFile)) fail('content/settings/site.json fehlt.');

if (fs.existsSync(dist)) fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });
fs.cpSync(src, dist, { recursive: true });

const dataDir = path.join(dist, 'data');
fs.mkdirSync(dataDir, { recursive: true });
const settings = readJSON(settingsFile);
fs.writeFileSync(path.join(dataDir, 'settings.json'), JSON.stringify(settings, null, 2));

const posts = [];
for (const type of contentTypes) {
  const dir = path.join(root, 'content', type.folder);
  if (!fs.existsSync(dir)) continue;
  const files = fs.readdirSync(dir).filter((name) => name.endsWith('.json')).sort();
  for (const file of files) {
    const raw = readJSON(path.join(dir, file));
    posts.push(normalize(raw, type.category, path.basename(file, '.json')));
  }
}

posts.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
fs.writeFileSync(path.join(dataDir, 'posts.json'), JSON.stringify(posts, null, 2));

const requiredPages = [
  'index.html', 'login/index.html', 'schueler/index.html',
  'schreiben/index.html', 'schreiben/config.yml',
  'admin/index.html', 'admin/admin.js',
  'admin/cms/index.html', 'admin/cms/config.yml',
  'erinnerungen/index.html', 'kalender/index.html', 'flashback/index.html',
  'roulette/index.html', 'beitrag/index.html', 'lehrer-sprueche/index.html',
  'memes/index.html', 'fotos/index.html', 'kanti-lore/index.html'
];
for (const rel of requiredPages) {
  if (!fs.existsSync(path.join(dist, rel))) fail(`Build unvollständig: dist/${rel} fehlt.`);
}

console.log('✓ Kanti Ziitkapsle gebaut');
console.log(`✓ ${posts.length} öffentliche/pending Content-Datei(en) verarbeitet`);
console.log('✓ Startsite, Schüler-CMS, Admin-Dashboard und Admin-CMS vorhanden');
