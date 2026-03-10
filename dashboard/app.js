async function loadHistory() {
  const candidates = [
    '../reports/daily-idea-history.jsonl',
    './daily-idea-history.jsonl'
  ];
  for (const path of candidates) {
    try {
      const res = await fetch(path, { cache: 'no-store' });
      if (!res.ok) continue;
      const text = await res.text();
      return text.split('\n').filter(Boolean).map(line => JSON.parse(line));
    } catch (_) {}
  }
  return [];
}

function byDateDesc(a, b) {
  const da = (a.timestamp || '').slice(0, 10);
  const db = (b.timestamp || '').slice(0, 10);
  return db.localeCompare(da);
}

function render(rows) {
  const tbody = document.querySelector('#tbl tbody');
  tbody.innerHTML = '';
  if (!rows.length) {
    tbody.innerHTML = `<tr><td colspan="3">No data found.</td></tr>`;
    return;
  }

  const byDay = new Map();
  for (const r of rows.sort(byDateDesc)) {
    const d = (r.timestamp || '').slice(0, 10) || 'unknown';
    if (!byDay.has(d)) byDay.set(d, r);
  }

  for (const [day, r] of byDay.entries()) {
    const tr = document.createElement('tr');
    const selected3 = (r.selected3 || []).map(x => `<span class="chip">${x}</span>`).join('');
    const winnerName = r.winner || '—';
    const winnerLink = r.winner_link;
    const winnerHtml = winnerLink
      ? `<span class="star">⭐</span> <a href="${winnerLink}" target="_blank" rel="noreferrer">${winnerName}</a>`
      : `<span class="star">⭐</span> ${winnerName}`;

    tr.innerHTML = `
      <td>${day}</td>
      <td><div class="chips">${selected3 || '—'}</div></td>
      <td>${r.winner ? winnerHtml : '—'}</td>
    `;
    tbody.appendChild(tr);
  }
}

loadHistory().then(render);
