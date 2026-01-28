# 🚀 Self-Hosted VPN Support System Setup Guide

## Server Requirements
- **OS**: Ubuntu/Debian Linux
- **RAM**: 1GB minimum
- **Storage**: 10GB
- **Node.js**: v18 or higher

---

## Step 1: Install Node.js (if not installed)

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v18.x.x
npm --version
```

---

## Step 2: Upload Files to Server

Upload the `server` folder to your server. You can use:
- **SCP**: `scp -r server/ user@your-server:/home/user/aurora-support/`
- **SFTP**: Use FileZilla or similar
- **Git**: Clone from your repo

---

## Step 3: Build the React Frontend

On your **local machine** (where you have the Lovable project):

```bash
# In the Lovable project root
npm run build

# This creates a 'dist' folder
```

Upload the contents of `dist/` to `server/public/` on your server.

---

## Step 4: Server Setup

```bash
# SSH into your server
ssh user@your-server

# Navigate to project
cd /home/user/aurora-support/server

# Install dependencies
npm install

# Create environment file
cp .env.example .env
nano .env  # Edit JWT_SECRET!

# Initialize database
npm run init-db

# Start server (for testing)
npm start
```

---

## Step 5: Run as a Service (Production)

### Option A: Using PM2 (Recommended)

```bash
# Install PM2
sudo npm install -g pm2

# Start the app
pm2 start index.js --name aurora-support

# Auto-start on reboot
pm2 startup
pm2 save

# View logs
pm2 logs aurora-support
```

### Option B: Using systemd

```bash
# Create service file
sudo nano /etc/systemd/system/aurora-support.service
```

Paste this content:
```ini
[Unit]
Description=Aurora VPN Support System
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/home/user/aurora-support/server
ExecStart=/usr/bin/node index.js
Restart=on-failure
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Then:
```bash
sudo systemctl daemon-reload
sudo systemctl enable aurora-support
sudo systemctl start aurora-support
sudo systemctl status aurora-support
```

---

## Step 6: Setup Nginx Reverse Proxy (Optional but Recommended)

```bash
sudo apt install nginx -y
sudo nano /etc/nginx/sites-available/aurora-support
```

Paste:
```nginx
server {
    listen 80;
    server_name yourdomain.com;  # Or your server IP

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable and restart:
```bash
sudo ln -s /etc/nginx/sites-available/aurora-support /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## Step 7: SSL Certificate (HTTPS)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal is automatic
```

---

## 🔐 Security Checklist

- [ ] Change default admin password
- [ ] Change JWT_SECRET in .env
- [ ] Enable firewall: `sudo ufw allow 22,80,443/tcp && sudo ufw enable`
- [ ] Keep system updated: `sudo apt update && sudo apt upgrade`

---

## 📱 Adding Telegram Notifications (Optional)

1. Create a Telegram bot via @BotFather
2. Get your chat ID via @userinfobot
3. Add to `.env`:
   ```
   TELEGRAM_BOT_TOKEN=your-bot-token
   TELEGRAM_CHAT_ID=your-chat-id
   ```
4. Uncomment the Telegram code in `index.js`

---

## 🔧 Useful Commands

```bash
# View logs
pm2 logs aurora-support

# Restart server
pm2 restart aurora-support

# Check status
pm2 status

# View database
sqlite3 data/support.db ".tables"
sqlite3 data/support.db "SELECT * FROM tickets;"
```

---

## 📂 File Structure

```
server/
├── data/
│   └── support.db      # SQLite database (auto-created)
├── public/             # React build files go here
│   ├── index.html
│   └── assets/
├── .env                # Your configuration
├── index.js            # Main server
├── init-db.js          # Database setup
└── package.json
```

---

## Default Credentials

| Username | Password | Role |
|----------|----------|------|
| admin    | admin123 | Admin |

⚠️ **CHANGE THE PASSWORD IMMEDIATELY AFTER FIRST LOGIN!**

To change password, run in SQLite:
```bash
sqlite3 data/support.db
```
```sql
-- Generate a new hash (use Node.js):
-- const bcrypt = require('bcryptjs');
-- console.log(bcrypt.hashSync('your-new-password', 10));

UPDATE staff SET password_hash = 'new-hash-here' WHERE username = 'admin';
```
