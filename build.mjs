import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const dist = path.join(root, 'dist');
fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });
function copyIfExists(source, destination) {
  const src = path.join(root, source);
  const dest = path.join(dist, destination);
  if (!fs.existsSync(src)) { console.log(`– ${source} existiert nicht, wird übersprungen`); return; }
  fs.cpSync(src, dest, { recursive: true });
  console.log(`✓ ${source} kopiert`);
}
copyIfExists('src', '.');
copyIfExists('admin', 'admin');
copyIfExists('assets', 'assets');
const memoriesDir = path.join(root, 'content', 'memories');
const memories = fs.existsSync(memoriesDir) ? fs.readdirSync(memoriesDir).filter((file) => file.endsWith('.json')).map((file) => JSON.parse(fs.readFileSync(path.join(memoriesDir, file), 'utf8'))) : [];
const settingsPath = path.join(root, 'content', 'settings', 'site.json');
const settings = fs.existsSync(settingsPath) ? JSON.parse(fs.readFileSync(settingsPath, 'utf8')) : {};
fs.mkdirSync(path.join(dist, 'data'), { recursive: true });
fs.writeFileSync(path.join(dist, 'data', 'memories.json'), JSON.stringify(memories, null, 2));
fs.writeFileSync(path.join(dist, 'data', 'settings.json'), JSON.stringify(settings, null, 2));
const indexPath = path.join(dist, 'index.html');
if (!fs.existsSync(indexPath)) { console.error('✗ dist/index.html fehlt. Prüfe, ob src/index.html vorhanden ist.'); process.exit(1); }
console.log('✓ Build erfolgreich: dist/index.html ist vorhanden.');
