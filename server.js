const path = require('path');
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const { Server } = require('socket.io');
const webpush = require('web-push');
const CONFIG = require('./config');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Store waiter push subscriptions (simple file store for demo)
const SUBS_FILE = path.join(__dirname, 'data', 'subscriptions.json');
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(SUBS_FILE)) fs.writeFileSync(SUBS_FILE, '[]');

const loadSubs = () => JSON.parse(fs.readFileSync(SUBS_FILE, 'utf-8'));
const saveSubs = (subs) => fs.writeFileSync(SUBS_FILE, JSON.stringify(subs, null, 2));

// VAPID keys (generate via `npm run vapid` and set environment variables)
const VAPID_PUBLIC = process.env.VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY || '';

if (VAPID_PUBLIC && VAPID_PRIVATE) {
  webpush.setVapidDetails(
    'mailto:admin@example.com',
    VAPID_PUBLIC,
    VAPID_PRIVATE
  );
}

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Serve customer table page
app.get('/t/:tableId', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'table.html'));
});

// Serve waiter dashboard
app.get('/waiter', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'waiter.html'));
});

// Push subscription endpoint (waiter registers)
app.post('/subscribe', (req, res) => {
  const subscription = req.body;
  if (!subscription || !subscription.endpoint) {
    return res.status(400).json({ ok: false, error: 'Invalid subscription' });
  }
  const subs = loadSubs();
  const exists = subs.find((s) => s.endpoint === subscription.endpoint);
  if (!exists) {
    subs.push(subscription);
    saveSubs(subs);
  }
  res.json({ ok: true, publicKey: VAPID_PUBLIC });
});

// Waiter unsubscribes
app.post('/unsubscribe', (req, res) => {
  const { endpoint } = req.body || {};
  const subs = loadSubs().filter((s) => s.endpoint !== endpoint);
  saveSubs(subs);
  res.json({ ok: true });
});

// Handle a customer request (notify)
app.post('/api/notify', async (req, res) => {
  const { tableId, type } = req.body || {};
  if (!tableId || !type) return res.status(400).json({ ok: false, error: 'Missing fields' });

  const payload = {
    tableId,
    type,
    time: Date.now(),
  };

  // Emit real-time to waiter dashboard
  io.emit('new-request', payload);

  // Send push notifications if keys configured
  if (VAPID_PUBLIC && VAPID_PRIVATE) {
    const subs = loadSubs();
    const notificationPayload = JSON.stringify({
      title: `${CONFIG.brandName}: Τραπέζι ${tableId}`,
      body: humanize(type),
      icon: CONFIG.logoPath,
      badge: CONFIG.logoPath,
      data: payload
    });
    for (const sub of subs) {
      try {
        await webpush.sendNotification(sub, notificationPayload);
      } catch (e) {
        // Remove invalid subs
        if (e.statusCode === 410 || e.statusCode === 404) {
          saveSubs(subs.filter(s => s.endpoint !== sub.endpoint));
        }
      }
    }
  }

  res.json({ ok: true });
});

// Socket to mark complete (from waiter)
io.on('connection', (socket) => {
  socket.on('complete-request', (payload) => {
    // Broadcast to all waiters to remove the item
    io.emit('request-completed', payload);
  });
});

function humanize(type) {
  switch (type) {
    case 'call': return 'Κάλεσε τον σερβιτόρο';
    case 'order': return 'Θέλει να παραγγείλει';
    case 'cash': return 'Θέλει να πληρώσει με μετρητά';
    case 'card': return 'Θέλει να πληρώσει με κάρτα';
    default: return type;
  }
}

const port = CONFIG.port;
server.listen(port, () => {
  console.log(`Bellio QR server running on http://localhost:${port}`);
  if (!VAPID_PUBLIC || !VAPID_PRIVATE) {
    console.log('⚠️  Web Push disabled. Run `npm run vapid` to generate keys and set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY env vars.');
  }
});
