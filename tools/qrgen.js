const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');
const CONFIG = require('../config');

async function main() {
  const outDir = path.join(__dirname, '..', 'qrcodes');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);
  const base = CONFIG.publicBaseUrl.replace(/\/$/, '');
  for (let i=1; i<=CONFIG.tableCount; i++){
    const url = `${base}/t/${i}`;
    const file = path.join(outDir, `table-${i}.png`);
    await QRCode.toFile(file, url, { width: 800, margin: 1 });
    console.log('Generated', file, '->', url);
  }
}
main();
