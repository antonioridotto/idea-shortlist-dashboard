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

function ensureModal() {
  let modal = document.getElementById('prdModal');
  if (modal) return modal;
  const html = `
    <div id="prdModal" class="modal">
      <div class="modal-card">
        <div class="modal-head">
          <h3 id="prdTitle">PRD</h3>
          <button id="closePrdBtn" class="ghost">✕</button>
        </div>
        <textarea id="prdText" placeholder="PRD content..."></textarea>
        <div class="modal-actions">
          <button id="savePrdBtn">Save</button>
          <button id="copyPrdBtn" class="ghost">Copy</button>
        </div>
      </div>
    </div>`;
  document.body.insertAdjacentHTML('beforeend', html);
  return document.getElementById('prdModal');
}

function openPrdModal(app) {
  const modal = ensureModal();
  const title = document.getElementById('prdTitle');
  const textarea = document.getElementById('prdText');
  const saveBtn = document.getElementById('savePrdBtn');
  const copyBtn = document.getElementById('copyPrdBtn');
  const closeBtn = document.getElementById('closePrdBtn');
  if (!modal || !title || !textarea || !saveBtn || !copyBtn || !closeBtn) return;

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
      <button class="prd-btn" data-key="${app.key}" title="Open PRD" aria-label="Open PRD">
        <svg class="prd-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M14 3v5h5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M9 13h6M9 17h6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        </svg>
      </button>
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
