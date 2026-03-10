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
  return out.sort((a, b) => b.date.localeCompare(a.date));
}

function renderList(items) {
  const root = document.getElementById('appList');
  if (!items.length) {
    root.innerHTML = '<div class="item"><div class="meta">No items for this filter.</div></div>';
    return;
  }

  root.innerHTML = items.map(app => `
    <article class="item">
      <img class="icon" src="${app.icon || ''}" alt="${app.name}" onerror="this.style.visibility='hidden'" />
      <div class="meta">
        <div class="title">
          ${app.link ? `<a class="app-link" href="${app.link}" target="_blank" rel="noreferrer">${app.name}</a>` : app.name}
          ${app.winner ? '<span class="badge">Winner</span>' : ''}
        </div>
        <div class="row">Date: ${app.date}</div>
        <div class="row">Revenue: ${app.revenue}</div>
      </div>
    </article>
  `).join('');
}

loadData().then(rows => {
  const allItems = flatten(rows);
  const filterEl = document.getElementById('viewFilter');

  function applyFilter() {
    const mode = filterEl?.value || 'all';
    const filtered = mode === 'winners' ? allItems.filter(x => x.winner) : allItems;
    renderList(filtered);
  }

  filterEl?.addEventListener('change', applyFilter);
  applyFilter();
});
