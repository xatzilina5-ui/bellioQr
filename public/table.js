const status = document.getElementById('status');
const brand = document.getElementById('brand');

const tableId = location.pathname.split('/t/')[1] || '0';

document.querySelectorAll('button[data-action]').forEach(btn => {
  btn.addEventListener('click', async () => {
    const type = btn.dataset.action;
    btn.disabled = true;
    status.textContent = 'Στέλνουμε ειδοποίηση…';
    try {
      const res = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableId, type }),
      });
      const json = await res.json();
      if (json.ok) {
        status.textContent = 'Ο σερβιτόρος ειδοποιήθηκε!';
      } else {
        status.textContent = 'Προέκυψε σφάλμα. Δοκιμάστε ξανά.';
      }
    } catch (e) {
      status.textContent = 'Προέκυψε σφάλμα δικτύου.';
    } finally {
      btn.disabled = false;
    }
  });
});
