// lib/db.js
// SQLite database initialization using better-sqlite3
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Ensure data directory exists
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'masjid.db');

// Singleton: reuse across hot-reloads in dev
let db;
if (process.env.NODE_ENV === 'production') {
  db = new Database(dbPath);
} else {
  // In dev, attach to global to survive hot-reload
  if (!global.__masjidDb) {
    global.__masjidDb = new Database(dbPath);
  }
  db = global.__masjidDb;
}

// Enable WAL mode for better concurrent read performance
db.pragma('journal_mode = WAL');

// ── CREATE TABLES ──────────────────────────────────────────────────────────────

db.exec(`
  CREATE TABLE IF NOT EXISTS campaigns (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    goalAmount REAL DEFAULT 0,
    raisedAmount REAL DEFAULT 0,
    donorCount INTEGER DEFAULT 0,
    category TEXT DEFAULT 'general',
    endDate TEXT DEFAULT '',
    imageUrl TEXT DEFAULT '',
    active INTEGER DEFAULT 1,
    createdAt TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS donations (
    id TEXT PRIMARY KEY,
    donorName TEXT DEFAULT 'Anonymous',
    email TEXT DEFAULT '',
    phone TEXT DEFAULT '',
    amount REAL NOT NULL,
    campaignId TEXT DEFAULT '',
    category TEXT DEFAULT 'general',
    donationType TEXT DEFAULT 'one-time',
    paymentMethod TEXT DEFAULT 'card',
    message TEXT DEFAULT '',
    anonymous INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending',
    approvedBy TEXT DEFAULT '',
    approvedAt TEXT DEFAULT '',
    createdAt TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS contacts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT DEFAULT '',
    subject TEXT DEFAULT 'General Enquiry',
    message TEXT NOT NULL,
    read INTEGER DEFAULT 0,
    ip TEXT DEFAULT 'unknown',
    createdAt TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS volunteers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT DEFAULT '',
    roles TEXT DEFAULT '[]',
    availability TEXT DEFAULT '[]',
    skills TEXT DEFAULT '[]',
    message TEXT DEFAULT '',
    status TEXT DEFAULT 'pending',
    createdAt TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS newsletter (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    active INTEGER DEFAULT 1,
    createdAt TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS admin_users (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin',
    displayName TEXT DEFAULT '',
    email TEXT DEFAULT '',
    createdAt TEXT DEFAULT (datetime('now'))
  );
`);

// ── MIGRATE: add columns if missing (for existing databases) ─────────────────
try { db.exec(`ALTER TABLE donations ADD COLUMN approvedBy TEXT DEFAULT ''`); } catch (_) { /* already exists */ }
try { db.exec(`ALTER TABLE donations ADD COLUMN approvedAt TEXT DEFAULT ''`); } catch (_) { /* already exists */ }

// ── SEED DEFAULT ADMIN USERS ─────────────────────────────────────────────────
const existingAdmins = db.prepare('SELECT COUNT(*) as count FROM admin_users').get();
if (existingAdmins.count === 0) {
  const seedAdmins = db.prepare(`
    INSERT OR IGNORE INTO admin_users (id, username, password, role, displayName, email, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
  `);
  seedAdmins.run(crypto.randomUUID(), 'superadmin', 'super123', 'super_admin', 'Super Admin', '', );
  seedAdmins.run(crypto.randomUUID(), 'admin', 'admin123', 'admin', 'Admin', '', );
}

module.exports = db;
