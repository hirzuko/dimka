const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

// Create data directory if it doesn't exist
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(path.join(dataDir, 'support.db'));

console.log('🔧 Initializing database...');

// Create tables
db.exec(`
  -- Staff table
  CREATE TABLE IF NOT EXISTS staff (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'operator',
    created_at TEXT NOT NULL
  );

  -- Tickets table
  CREATE TABLE IF NOT EXISTS tickets (
    id TEXT PRIMARY KEY,
    client_name TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  -- Messages table
  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    ticket_id TEXT NOT NULL,
    content TEXT NOT NULL,
    sender TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
  );

  -- Create indexes for performance
  CREATE INDEX IF NOT EXISTS idx_messages_ticket ON messages(ticket_id);
  CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
  CREATE INDEX IF NOT EXISTS idx_tickets_updated ON tickets(updated_at);
`);

console.log('✅ Tables created');

// Create default admin user
const adminUsername = 'admin';
const adminPassword = 'admin123'; // CHANGE THIS IN PRODUCTION!
const hashedPassword = bcrypt.hashSync(adminPassword, 10);

try {
  db.prepare(`
    INSERT OR REPLACE INTO staff (id, username, password_hash, role, created_at)
    VALUES (?, ?, ?, 'admin', ?)
  `).run('admin-001', adminUsername, hashedPassword, new Date().toISOString());
  
  console.log('✅ Admin user created');
  console.log('');
  console.log('╔════════════════════════════════════════╗');
  console.log('║       DEFAULT LOGIN CREDENTIALS        ║');
  console.log('╠════════════════════════════════════════╣');
  console.log('║  Username: admin                       ║');
  console.log('║  Password: admin123                    ║');
  console.log('║                                        ║');
  console.log('║  ⚠️  CHANGE THIS IN PRODUCTION!        ║');
  console.log('╚════════════════════════════════════════╝');
  console.log('');
} catch (err) {
  console.log('ℹ️  Admin user already exists');
}

console.log('🎉 Database initialization complete!');
console.log('');
console.log('Next steps:');
console.log('1. Run: npm start');
console.log('2. Open: http://localhost:3001');

db.close();
