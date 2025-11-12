const list = document.getElementById('list');
const ding = document.getElementById('ding');
const pushStatus = document.getElementById('pushStatus');

// Register service worker & subscribe for push
async function setupPush(){
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    pushStatus.textContent = 'Ο περιηγητής δεν υποστηρίζει push notifications.';
    return;
  }
  const reg = await navigator.serviceWorker.register('/sw.js');
  // Get VAPID public key from server (via subscribe endpoint)
  const sub = await reg.pushManager.getSubscription();
  if (!sub) {
    const resp = await fetch('/subscribe', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({}) });
    const json = await resp.json();
    if (!json.publicKey) {
      pushStatus.textContent = 'Οι ειδοποιήσεις push είναι ανενεργές στον server.';
      return;
    }
    const vapidKey = urlBase64ToUint8Array(json.publicKey);
    const newSub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: vapidKey });
    await fetch('/subscribe', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(newSub) });
    pushStatus.textContent = 'Οι ειδοποιήσεις push ενεργοποιήθηκαν.';
  } else {
    // ensure server has it
    await fetch('/subscribe', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(sub) });
    pushStatus.textContent = 'Οι ειδοποιήσεις push ενεργοποιήθηκαν.';
  }
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

setupPush().catch(console.error);

// Real-time dashboard
const socket = io();
socket.on('new-request', (payload) => {
  addItem(payload);
  // Try to play sound when in foreground
  ding.currentTime = 0;
  ding.play().catch(()=>{});
});
socket.on('request-completed', ({time}) => {
  const item = document.querySelector(`[data-time="${time}"]`);
  if (item) item.remove();
});

function addItem({ tableId, type, time }) {
  const li = document.createElement('li');
  li.className = 'item';
  li.dataset.time = time;

  const reason = {
    'call': 'Κάλεσε τον σερβιτόρο',
    'order': 'Θέλει να παραγγείλει',
    'cash': 'Θέλει να πληρώσει με μετρητά',
    'card': 'Θέλει να πληρώσει με κάρτα'
  }[type] || type;

  li.innerHTML = \`
    <div>
      <div><strong>Τραπέζι \${tableId}</strong> <span class="pill">\${reason}</span></div>
      <div class="muted">\${new Date(time).toLocaleTimeString()}</div>
    </div>
    <button class="complete">Ολοκληρώθηκε</button>
  \`;

  li.querySelector('.complete').addEventListener('click', () => {
    socket.emit('complete-request', { tableId, type, time });
    li.remove();
  });

  list.prepend(li);
}
