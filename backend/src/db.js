const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

const dataDir = path.join(__dirname, '..', 'data');
fs.mkdirSync(dataDir, { recursive: true });

const db = new sqlite3.Database(path.join(dataDir, 'app.db'));

const run = (sql, params = []) =>
  new Promise((resolve, reject) =>
    db.run(sql, params, function (err) {
      err ? reject(err) : resolve({ lastID: this.lastID, changes: this.changes });
    })
  );
const get = (sql, params = []) =>
  new Promise((resolve, reject) => db.get(sql, params, (err, row) => (err ? reject(err) : resolve(row))));
const all = (sql, params = []) =>
  new Promise((resolve, reject) => db.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows))));

async function init() {
  await run(`CREATE TABLE IF NOT EXISTS Tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    photo_id TEXT NOT NULL,
    style TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'Normal',
    partner TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT,
    image_url TEXT
  )`);
  const cols = await all('PRAGMA table_info(Tickets)');
  for (const col of ['updated_at', 'image_url']) {
    if (!cols.some((c) => c.name === col)) {
      await run(`ALTER TABLE Tickets ADD COLUMN ${col} TEXT`);
    }
  }
  await run(`CREATE TABLE IF NOT EXISTS Users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role TEXT NOT NULL UNIQUE
  )`);
  await run(`INSERT OR IGNORE INTO Users (role) VALUES ('Operator'), ('Manager')`);
  await seedTickets();
}

// Sample tickets taken from recolour-case/Ticket 1-4 (primary 001 view of each style).
const SEED_TICKETS = [
  ['15377489', 'Granita solid; Fuchsia Fedora with AOP Block Libre', 'Normal', 'FastRetouch', 'Pending', '15377489_5081878_001.jpg'],
  ['15377486', 'Night Sky AOP White Dots; Hedge Green solid; Navy Blazer solid', 'High', 'PixelCraft', 'Sent', '15377486_5078866_001.jpg'],
  ['15377488', 'Hedge Green solid; Navy Blazer solid; Night Sky AOP White Dots', 'Normal', 'FastRetouch', 'Completed', '15377488_5078869_001.jpg'],
  ['15377522', 'Granita solid; Fuchsia Fedora with AOP Block Libre', 'Urgent', 'ColorLab', 'Approved', '15377522_5081887_001.jpg'],
];

async function seedTickets() {
  const { n } = await get('SELECT COUNT(*) AS n FROM Tickets');
  if (n > 0) return;
  for (const [photo_id, style, priority, partner, status, file] of SEED_TICKETS) {
    await run(
      `INSERT INTO Tickets (photo_id, style, priority, partner, status, image_url, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, CASE WHEN ? = 'Approved' THEN CURRENT_TIMESTAMP END)`,
      [photo_id, style, priority, partner, status, `/static/images/${file}`, status]
    );
  }
}

module.exports = { db, run, get, all, init };
