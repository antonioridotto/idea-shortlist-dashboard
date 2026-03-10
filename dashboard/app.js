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

function getBuildSent(key, fallback = false) {
  const local = localStorage.getItem(`buildSent::${key}`);
  if (local === '1') return true;
  return !!fallback;
}

function setBuildSent(key) {
  localStorage.setItem(`buildSent::${key}`, '1');
}

function inferCategory(name = '') {
  const n = name.toLowerCase();
  if (n.includes('weather') || n.includes('tornado')) return 'weather';
  if (n.includes('health') || n.includes('glp') || n.includes('tracker')) return 'health';
  return 'productivity';
}

function generateProjectName(appName = '') {
  const cleaned = appName
    .replace(/cursor|cloudflare|claude|openai/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  const base = cleaned || 'Focus App';
  const candidate = `${base} Build`;
  return candidate.slice(0, 30);
}

async function sendToBuild(app) {
  const payload = {
    name: generateProjectName(app.name),
    concept: app.prd || `Build an MVP inspired by ${app.name}`,
    category: inferCategory(app.name),
    pipeline_mode: 'build',
    reference_photos: [],
    reference_apps: app.link ? [app.link] : []
  };

  const urls = [
    'https://mac.forest-beardie.ts.net/api/v1/projects',
    'https://mac.forest-beardie.ts.net/api/projects'
  ];

  for (let i = 0; i < urls.length; i++) {
    try {
      const res = await fetch(urls[i], {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) return { ok: true };
      if (res.status === 404 && i === 0) continue;
      const txt = await res.text();
      return { ok: false, error: `HTTP ${res.status}: ${txt.slice(0, 120)}` };
    } catch (e) {
      if (i === 0) continue;
      return { ok: false, error: e.message || 'network error' };
    }
  }
  return { ok: false, error: 'unknown error' };
}

function flatten(rows) {
  const out = [];
  for (const day of rows) {
    const date = day.date || '—';
    for (const app of day.selected3 || []) {
      const name = app?.name || 'Unknown app';
      const key = `${date}::${slug(name)}`;
      out.push({
        date,
        name,
        key,
        link: app?.link || '',
        icon: app?.icon || '',
        revenue: app?.revenue || 'N/A',
        prd: app?.prd || '',
        winner: day.winner === name,
        buildSent: getBuildSent(key, !!app?.build_sent)
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
          ${app.buildSent ? '<span class="badge building">Building</span>' : ''}
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
      ${app.buildSent ? '' : '<button class="build-btn" data-build-key="' + app.key + '">Send</button>'}
    </article>
  `
    )
    .join('');

  const byKey = Object.fromEntries(items.map((i) => [i.key, i]));

  root.querySelectorAll('.prd-btn').forEach((btn) => {
    btn.addEventListener('click', () => openPrdModal(byKey[btn.dataset.key]));
  });

  root.querySelectorAll('.build-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const app = byKey[btn.dataset.buildKey];
      btn.disabled = true;
      btn.textContent = 'Sending...';
      const res = await sendToBuild(app);
      if (res.ok) {
        setBuildSent(app.key);
        app.buildSent = true;
        renderList(items);
      } else {
        btn.disabled = false;
        btn.textContent = 'Retry';
        alert(`Build send failed: ${res.error || 'unknown error'}`);
      }
    });
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
