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

function flatten(rows) {
  const out = [];
  for (const day of rows) {
    const date = day.date || '—';
    for (const app of (day.selected3 || [])) {
      const name = app?.name || 'Unknown app';
      out.push({
        date,
        name,
        link: app?.link || '',
        icon: app?.icon || '',
        revenue: app?.revenue || 'N/A',
        winner: day.winner === name
      });
    }
  }
  return out.sort((a,b) => b.date.localeCompare(a.date));
}

function render(rows) {
  const root = document.getElementById('appList');
  const items = flatten(rows);
  if (!items.length) {
    root.innerHTML = '<div class="item"><div class="meta">No shortlist data yet.</div></div>';
    return;
  }
  root.innerHTML = items.map(app => `
    <article class="item">
      <img class="icon" src="${app.icon || ''}" alt="${app.name}" onerror="this.style.visibility='hidden'" />
      <div class="meta">
        <div class="title">
          ${app.winner ? '<span class="star">⭐</span>' : ''}
          ${app.link ? `<a href="${app.link}" target="_blank" rel="noreferrer">${app.name}</a>` : app.name}
          ${app.winner ? '<span class="badge">Winner</span>' : ''}
        </div>
        <div class="row">Date: ${app.date}</div>
        <div class="row">Revenue: ${app.revenue}</div>
      </div>
    </article>
  `).join('');
}

loadData().then(render);
