// Copies the primary (_001) product photo of each recolour-case ticket into public/images.
const fs = require('fs');
const path = require('path');

const caseDir = path.join(__dirname, '..', '..', 'recolour-case');
const outDir = path.join(__dirname, '..', 'public', 'images');
fs.mkdirSync(outDir, { recursive: true });

const ticketDirs = fs.readdirSync(caseDir).filter((d) => /^Ticket \d+$/.test(d));
for (const dir of ticketDirs) {
  for (const file of fs.readdirSync(path.join(caseDir, dir))) {
    if (/_001\.jpg$/i.test(file)) {
      fs.copyFileSync(path.join(caseDir, dir, file), path.join(outDir, file));
      console.log(`${dir}/${file} -> public/images/${file}`);
    }
  }
}
