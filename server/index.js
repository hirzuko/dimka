require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret-in-production';

// Database setup
const db = new Database(path.join(__dirname, 'data', 'support.db'));

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files (React build)
app.use(express.static(path.join(__dirname, 'public')));

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access denied' });
  }
  
  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid token' });
  }
};

// ==================== AUTH ROUTES ====================

// Staff login
app.post('/api/auth/login', (req, res) => {
  try {
    const { username, password } = req.body;
    
    const user = db.prepare('SELECT * FROM staff WHERE username = ?').get(username);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const validPassword = bcrypt.compareSync(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Verify token
app.get('/api/auth/verify', authenticateToken, (req, res) => {
  res.json({ valid: true, user: req.user });
});

// ==================== TICKET ROUTES ====================

// Create new ticket (public)
app.post('/api/tickets', (req, res) => {
  try {
    const { clientName } = req.body;
    const ticketId = uuidv4().split('-')[0].toUpperCase();
    const now = new Date().toISOString();
    
    db.prepare(`
      INSERT INTO tickets (id, client_name, status, created_at, updated_at)
      VALUES (?, ?, 'active', ?, ?)
    `).run(ticketId, clientName, now, now);
    
    res.json({ ticketId, clientName });
  } catch (err) {
    console.error('Create ticket error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get ticket by ID (public - for clients)
app.get('/api/tickets/:id', (req, res) => {
  try {
    const ticket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    const messages = db.prepare('SELECT * FROM messages WHERE ticket_id = ? ORDER BY created_at ASC').all(req.params.id);
    
    res.json({ ...ticket, messages });
  } catch (err) {
    console.error('Get ticket error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all tickets (staff only)
app.get('/api/tickets', authenticateToken, (req, res) => {
  try {
    const tickets = db.prepare('SELECT * FROM tickets ORDER BY updated_at DESC').all();
    
    // Get messages for each ticket
    const ticketsWithMessages = tickets.map(ticket => {
      const messages = db.prepare('SELECT * FROM messages WHERE ticket_id = ? ORDER BY created_at ASC').all(ticket.id);
      return { ...ticket, messages };
    });
    
    res.json(ticketsWithMessages);
  } catch (err) {
    console.error('Get tickets error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update ticket status (staff only)
app.patch('/api/tickets/:id', authenticateToken, (req, res) => {
  try {
    const { status } = req.body;
    const now = new Date().toISOString();
    
    db.prepare('UPDATE tickets SET status = ?, updated_at = ? WHERE id = ?')
      .run(status, now, req.params.id);
    
    res.json({ success: true });
  } catch (err) {
    console.error('Update ticket error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== MESSAGE ROUTES ====================

// Send message (public - for clients)
app.post('/api/tickets/:id/messages', (req, res) => {
  try {
    const { content, sender } = req.body;
    const messageId = uuidv4();
    const now = new Date().toISOString();
    
    db.prepare(`
      INSERT INTO messages (id, ticket_id, content, sender, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(messageId, req.params.id, content, sender, now);
    
    // Update ticket timestamp
    db.prepare('UPDATE tickets SET updated_at = ? WHERE id = ?')
      .run(now, req.params.id);
    
    // TODO: Send Telegram notification here
    // sendTelegramNotification(req.params.id, content, sender);
    
    res.json({ id: messageId, content, sender, created_at: now });
  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Staff reply (staff only)
app.post('/api/tickets/:id/reply', authenticateToken, (req, res) => {
  try {
    const { content } = req.body;
    const messageId = uuidv4();
    const now = new Date().toISOString();
    
    db.prepare(`
      INSERT INTO messages (id, ticket_id, content, sender, created_at)
      VALUES (?, ?, ?, 'support', ?)
    `).run(messageId, req.params.id, content, now);
    
    // Update ticket timestamp
    db.prepare('UPDATE tickets SET updated_at = ? WHERE id = ?')
      .run(now, req.params.id);
    
    res.json({ id: messageId, content, sender: 'support', created_at: now });
  } catch (err) {
    console.error('Reply error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Catch-all for React Router (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
