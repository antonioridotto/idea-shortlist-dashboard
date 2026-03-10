async function loadData() {
  try {
    const res = await fetch('./data.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('data.json not found');
    return await res.json();
  } catch (e) {
    console.error(e);
    return [];
  }
}

function render(rows) {
  const tbody = document.querySelector('#tbl tbody');
  tbody.innerHTML = '';

  const useful = rows.filter(r => (r.selected3 && r.selected3.length) || r.winner);
  if (!useful.length) {
    tbody.innerHTML = `<tr><td colspan="3">No shortlist data yet.</td></tr>`;
    return;
  }

  for (const r of useful) {
    const tr = document.createElement('tr');
    const selected3 = (r.selected3 || []).map(x => `<span class="chip">${x}</span>`).join('');
    const winnerHtml = r.winner
      ? (r.winner_link
          ? `<span class="star">⭐</span> <a href="${r.winner_link}" target="_blank" rel="noreferrer">${r.winner}</a>`
          : `<span class="star">⭐</span> ${r.winner}`)
      : '—';

    tr.innerHTML = `
      <td>${r.date || '—'}</td>
      <td><div class="chips">${selected3 || '—'}</div></td>
      <td>${winnerHtml}</td>
    `;
    tbody.appendChild(tr);
  }
}

loadData().then(render);
