# Bellio QR – Σύστημα ειδοποιήσεων με QR για καφετέριες

## Γρήγορη εκκίνηση
1) Εγκατάσταση:
```bash
npm install
```

2) (Προαιρετικό αλλά συνιστάται) Δημιουργία VAPID keys για push notifications:
```bash
npm run vapid
# Κάντε export τα παρακάτω:
export VAPID_PUBLIC_KEY="..."
export VAPID_PRIVATE_KEY="..."
```

3) Εκκίνηση server:
```bash
npm run start
```
Ανοίξτε: `http://localhost:3000/waiter` για το dashboard σερβιτόρου.
Τα QR ανοίγουν σελίδες όπως `http://localhost:3000/t/1`.

4) Δημιουργία QR για τα τραπέζια (εκτυπώσιμα PNG):
- Ρυθμίστε στο `config/index.js` το `publicBaseUrl` στο domain σας (π.χ. https://example.com).
- Ορίστε πόσα τραπέζια έχετε με `tableCount`.
```bash
npm run qr
```
Τα αρχεία θα δημιουργηθούν στον φάκελο `qrcodes/`.

## Τι περιλαμβάνει
- Σελίδα πελάτη με κουμπιά:
  - «Κάλεσε τον σερβιτόρο»
  - «Θέλω να παραγγείλω»
  - «Θέλω να πληρώσω με μετρητά»
  - «Θέλω να πληρώσω με κάρτα»
- Πίνακας σερβιτόρου σε live χρόνο (Socket.IO), με ήχο σε κάθε νέα ειδοποίηση και κουμπί «Ολοκληρώθηκε».
- Web Push notifications μέσω Service Worker: ειδοποίηση στην οθόνη του κινητού ακόμη κι όταν ο περιηγητής είναι στο background (όπου το υποστηρίζει το OS/Browser).
- Χώρος για logo (αρχείο `public/assets/logo.png`).

## Παρατηρήσεις
- Ο προσαρμοσμένος ήχος κατά τη λήψη ειδοποίησης λειτουργεί σίγουρα όταν η σελίδα σερβιτόρου είναι ενεργή. Σε background/κλειστή οθόνη, τα mobile browsers εμφανίζουν native push ειδοποίηση χωρίς εγγύηση για custom ήχο (εξαρτάται από OS/Browser). Για 100% έλεγχο ήχου στο background απαιτείται native app.
- Για παραγωγή, βάλτε το domain σας στο `PUBLIC_BASE_URL` και σε reverse proxy ρυθμίστε HTTPS ώστε να δουλέψουν τα Push (χρειάζεται Secure Context).
