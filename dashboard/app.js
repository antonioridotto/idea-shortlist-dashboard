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

  const useful = rows.filter(r => (r.selected3 && r.selected3.length));
  if (!useful.length) {
    tbody.innerHTML = `<tr><td colspan="2">No shortlist data yet.</td></tr>`;
    return;
  }

  for (const r of useful) {
    const tr = document.createElement('tr');
    const selected3 = (r.selected3 || [])
      .map(item => {
        const name = item?.name || 'Unknown app';
        const link = item?.link || '';
        const revenue = item?.revenue || 'N/A';
        const star = (name === r.winner) ? '<span class="star">⭐</span> ' : '';
        const nameHtml = link
          ? `${star}<a class="app-link" href="${link}" target="_blank" rel="noreferrer">${name}</a>`
          : `${star}<span>${name}</span>`;
        return `<li class="app-item">${nameHtml}<div class="rev">Revenue: ${revenue}</div></li>`;
      })
      .join('');

    tr.innerHTML = `
      <td>${r.date || '—'}</td>
      <td><ul class="app-list">${selected3}</ul></td>
    `;
    tbody.appendChild(tr);
  }
}

loadData().then(render);
