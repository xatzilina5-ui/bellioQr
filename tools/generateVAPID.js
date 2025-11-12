const webpush = require('web-push');
const keys = webpush.generateVAPIDKeys();
console.log('\nSet these environment variables before running the server:');
console.log('export VAPID_PUBLIC_KEY="' + keys.publicKey + '"');
console.log('export VAPID_PRIVATE_KEY="' + keys.privateKey + '"\n');
console.log('Public key (paste into waiter page if needed):\n', keys.publicKey);
