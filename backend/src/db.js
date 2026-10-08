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
    updated_at TEXT
  )`);
  const cols = await all('PRAGMA table_info(Tickets)');
  if (!cols.some((c) => c.name === 'updated_at')) {
    await run('ALTER TABLE Tickets ADD COLUMN updated_at TEXT');
  }
  await run(`CREATE TABLE IF NOT EXISTS Users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role TEXT NOT NULL UNIQUE
  )`);
  await run(`INSERT OR IGNORE INTO Users (role) VALUES ('Operator'), ('Manager')`);
}

module.exports = { db, run, get, all, init };
