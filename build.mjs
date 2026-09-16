import fs from "node:fs";
import path from "node:path";

const distDir = "dist";

// Alten dist-Ordner entfernen
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, {
    recursive: true,
    force: true,
  });
}

// Neuen dist-Ordner erstellen
fs.mkdirSync(distDir, {
  recursive: true,
});

// Ordner, die in dist kopiert werden sollen
const folders = [
  "assets",
  "css",
  "js",
  "admin",
  "schueler",
  "login",
  "erinnerungen",
  "kalender",
];

// Ordner kopieren – aber nur, wenn sie existieren
for (const folder of folders) {
  if (fs.existsSync(folder)) {
    fs.cpSync(folder, path.join(distDir, folder), {
      recursive: true,
    });

    console.log(`✓ ${folder}/ kopiert`);
  } else {
    console.log(`– ${folder}/ existiert nicht, wird übersprungen`);
  }
}

// Dateien aus dem Hauptverzeichnis kopieren
const files = [
  "index.html",
  "_redirects",
  "robots.txt",
  "favicon.ico",
];

for (const file of files) {
  if (fs.existsSync(file)) {
    fs.copyFileSync(file, path.join(distDir, file));
    console.log(`✓ ${file} kopiert`);
  }
}

console.log("");
console.log("✓ Kanti Ziitkapsle erfolgreich gebaut!");
console.log(`✓ Ausgabe: ${distDir}/`);
