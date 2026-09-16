import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dist = path.join(root, 'dist');
const src = path.join(root, 'src');
const postsDir = path.join(root, 'content', 'posts');
const settingsFile = path.join(root, 'content', 'settings', 'site.json');

function fail(message) {
  console.error(`\n✗ ${message}`);
  process.exit(1);
}

if (!fs.existsSync(src)) fail('src/ fehlt.');
if (!fs.existsSync(path.join(src, 'index.html'))) fail('src/index.html fehlt.');
if (!fs.existsSync(settingsFile)) fail('content/settings/site.json fehlt.');

if (fs.existsSync(dist)) fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });
fs.cpSync(src, dist, { recursive: true });

const dataDir = path.join(dist, 'data');
fs.mkdirSync(dataDir, { recursive: true });

let settings;
try {
  settings = JSON.parse(fs.readFileSync(settingsFile, 'utf8'));
} catch (error) {
  fail(`site.json ist kein gültiges JSON: ${error.message}`);
}
fs.writeFileSync(path.join(dataDir, 'settings.json'), JSON.stringify(settings, null, 2));

const posts = [];
if (fs.existsSync(postsDir)) {
  const files = fs.readdirSync(postsDir).filter((name) => name.endsWith('.json')).sort();
  for (const file of files) {
    const full = path.join(postsDir, file);
    try {
      const raw = JSON.parse(fs.readFileSync(full, 'utf8'));
      const id = path.basename(file, '.json');
      posts.push({ id, ...raw });
    } catch (error) {
      fail(`Ungültiges JSON in content/posts/${file}: ${error.message}`);
    }
  }
}

posts.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
fs.writeFileSync(path.join(dataDir, 'posts.json'), JSON.stringify(posts, null, 2));

const requiredPages = [
  'index.html',
  'login/index.html',
  'schueler/index.html',
  'schreiben/index.html',
  'schreiben/config.yml',
  'admin/index.html',
  'admin/config.yml',
  'erinnerungen/index.html',
  'kalender/index.html',
  'flashback/index.html',
  'roulette/index.html',
  'beitrag/index.html'
];

for (const rel of requiredPages) {
  if (!fs.existsSync(path.join(dist, rel))) fail(`Build unvollständig: dist/${rel} fehlt.`);
}

console.log('✓ Kanti Ziitkapsle gebaut');
console.log(`✓ ${posts.length} Content-Datei(en) eingelesen`);
console.log('✓ dist/index.html vorhanden');
console.log('✓ Schüler-CMS und Admin-CMS vorhanden');
