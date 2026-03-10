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

function slug(s) {
  return (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
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
        key: `${date}::${slug(name)}`,
        link: app?.link || '',
        icon: app?.icon || '',
        revenue: app?.revenue || 'N/A',
        prd: app?.prd || '',
        winner: day.winner === name
      });
    }
  }
  return out.sort((a, b) => b.date.localeCompare(a.date));
}

function getStoredPrd(key) {
  return localStorage.getItem(`prd::${key}`) || '';
}

function setStoredPrd(key, value) {
  localStorage.setItem(`prd::${key}`, value || '');
}

function openPrdModal(app) {
  const modal = document.getElementById('prdModal');
  const title = document.getElementById('prdTitle');
  const textarea = document.getElementById('prdText');
  const saveBtn = document.getElementById('savePrdBtn');
  const copyBtn = document.getElementById('copyPrdBtn');
  const closeBtn = document.getElementById('closePrdBtn');

  title.textContent = `${app.name} — PRD`;
  textarea.value = getStoredPrd(app.key) || app.prd || '';
  modal.dataset.appKey = app.key;
  modal.classList.add('open');

  saveBtn.onclick = () => {
    setStoredPrd(app.key, textarea.value);
    saveBtn.textContent = 'Saved ✓';
    setTimeout(() => (saveBtn.textContent = 'Save'), 1200);
  };

  copyBtn.onclick = async () => {
    try {
      await navigator.clipboard.writeText(textarea.value || '');
      copyBtn.textContent = 'Copied ✓';
      setTimeout(() => (copyBtn.textContent = 'Copy'), 1200);
    } catch {
      copyBtn.textContent = 'Copy failed';
      setTimeout(() => (copyBtn.textContent = 'Copy'), 1200);
    }
  };

  const close = () => modal.classList.remove('open');
  closeBtn.onclick = close;
  modal.onclick = (e) => {
    if (e.target === modal) close();
  };
}

function renderList(items) {
  const root = document.getElementById('appList');
  if (!items.length) {
    root.innerHTML = '<div class="item"><div class="meta">No items for this filter.</div></div>';
    return;
  }

  root.innerHTML = items
    .map(
      (app) => `
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
      <button class="prd-btn" data-key="${app.key}">PRD</button>
    </article>
  `
    )
    .join('');

  const byKey = Object.fromEntries(items.map((i) => [i.key, i]));
  root.querySelectorAll('.prd-btn').forEach((btn) => {
    btn.addEventListener('click', () => openPrdModal(byKey[btn.dataset.key]));
  });
}

loadData().then((rows) => {
  const allItems = flatten(rows);
  const filterEl = document.getElementById('viewFilter');

  function applyFilter() {
    const mode = filterEl?.value || 'all';
    const filtered = mode === 'winners' ? allItems.filter((x) => x.winner) : allItems;
    renderList(filtered);
  }

  filterEl?.addEventListener('change', applyFilter);
  applyFilter();
});
