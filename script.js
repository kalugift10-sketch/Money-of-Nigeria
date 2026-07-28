'use strict';

/* The Money of Nigeria — renders entirely from nigerian-currency-directory.json.
   No content is hard-coded here beyond labels of the UI chrome itself. */

const DATA_URL = 'nigerian-currency-directory.json';
const SITE_TITLE = 'The Money of Nigeria';

const state = {
  data: null,
  sort: 'currency', // 'currency' | 'year' | 'era'
  query: ''
};

const app = document.getElementById('app');

/* ------------------------------------------------------------------
   Helpers
------------------------------------------------------------------ */

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[ch]));
}

/* Numeric sort key from a loose date string.
   ISO dates get month/day fractions; "pre-" pushes an entry far earlier
   so undocumented origins sort before documented years. */
function sortKey(dateStr) {
  if (!dateStr) return Infinity;
  const s = String(dateStr);
  const m = s.match(/\d{3,4}/);
  if (!m) return Infinity;
  let key = parseInt(m[0], 10);
  if (/pre[\s-]/i.test(s) || /^pre/i.test(s)) key -= 1000;
  const iso = s.match(/^(\d{4})-(\d{2})(?:-(\d{2}))?/);
  if (iso) key += (parseInt(iso[2], 10) || 0) / 12 + (parseInt(iso[3], 10) || 0) / 372;
  return key;
}

/* Earliest documented moment for a currency: min of first_used and all
   changelog dates (proposals have first_used: null). */
function currencyKey(c) {
  const keys = (c.changelog || []).map(ch => sortKey(ch.date));
  keys.push(sortKey(c.first_used));
  return Math.min(...keys);
}

/* Display label for the oversized year: "1973", "1700s", "pre-1700", "post-1999". */
function displayYear(dateStr) {
  if (!dateStr) return '—';
  const m = String(dateStr).match(/(pre-|post-)?\d{3,4}s?/i);
  return m ? m[0] : String(dateStr);
}

function eraOf(id) {
  return state.data.meta.eras.find(e => e.id === id) || { label: id, period: '', blurb: '' };
}

function statusLabel(s) {
  return String(s || '').replace(/-/g, ' ');
}

/* Glyph for the grey-100 placeholder plate. */
function symbolFor(c) {
  if (c.name.includes('₦')) return '₦';
  if (/pound|£/i.test(c.name)) return '£';
  if (/kobo/i.test(c.name)) return 'k';
  if (c.category === 'digital') return '₦';
  return c.name.trim().charAt(0);
}

function coverImage(c) {
  return (c.images || []).find(im => im.change_ref === null || im.change_ref === undefined);
}

function plateHTML(c, img, extraClass) {
  const image = img
    ? `<img src="${esc(img.src)}" alt="${esc(img.alt)}" loading="lazy" onerror="this.remove()">`
    : '';
  return `<div class="plate ${extraClass || ''}">
    <span class="ph serif" aria-hidden="true">${esc(symbolFor(c))}</span>${image}
  </div>`;
}

function hostname(url) {
  try { return new URL(url).hostname.replace(/^www\./, ''); }
  catch { return url; }
}

/* ------------------------------------------------------------------
   Search
------------------------------------------------------------------ */

function currencyHaystack(c) {
  if (!c._hay) {
    const parts = [c.name, c.summary];
    for (const ch of c.changelog || []) {
      parts.push(ch.title, ch.what_changed, ...(ch.people || []));
    }
    c._hay = parts.join(' ').toLowerCase();
  }
  return c._hay;
}

function matchesCurrency(c, q) {
  return !q || currencyHaystack(c).includes(q);
}

function matchesEntry(c, ch, q) {
  if (!q) return true;
  return [c.name, ch.title, ch.what_changed, ...(ch.people || [])]
    .join(' ').toLowerCase().includes(q);
}

/* ------------------------------------------------------------------
   Catalog (home) — currency / year / era views
------------------------------------------------------------------ */

function cardHTML(c) {
  const era = eraOf(c.era_group);
  return `<a class="card" href="#/c/${esc(c.slug)}">
    ${plateHTML(c, coverImage(c))}
    <h3 class="card-name">${esc(c.name)}</h3>
    <p class="card-meta">${esc(era.label)} · ${esc(statusLabel(c.status))}</p>
  </a>`;
}

function currencyViewHTML(q) {
  const list = [...state.data.currencies]
    .sort((a, b) => currencyKey(a) - currencyKey(b))
    .filter(c => matchesCurrency(c, q));
  if (!list.length) return `<p class="empty-note">Nothing matches your search.</p>`;
  return `<div class="grid">${list.map(cardHTML).join('')}</div>`;
}

function yearViewHTML(q) {
  const entries = [];
  for (const c of state.data.currencies) {
    for (const ch of c.changelog || []) entries.push({ c, ch });
  }
  entries.sort((a, b) => sortKey(a.ch.date) - sortKey(b.ch.date));
  const rows = entries.filter(({ c, ch }) => matchesEntry(c, ch, q));
  if (!rows.length) return `<p class="empty-note">Nothing matches your search.</p>`;
  return `<div class="year-list">${rows.map(({ c, ch }) => `
    <article class="year-row">
      <div class="year-big serif">${esc(displayYear(ch.date))}</div>
      <div>
        <h3 class="year-entry-title">${esc(ch.title)}</h3>
        <a class="year-entry-currency" href="#/c/${esc(c.slug)}">${esc(c.name)} →</a>
      </div>
    </article>`).join('')}</div>`;
}

function eraViewHTML(q) {
  const sections = state.data.meta.eras.map(era => {
    const list = state.data.currencies
      .filter(c => c.era_group === era.id)
      .sort((a, b) => currencyKey(a) - currencyKey(b))
      .filter(c => matchesCurrency(c, q));
    if (!list.length) return '';
    return `<section class="era-section">
      <header class="era-head">
        <h2 class="era-label">${esc(era.label)}</h2>
        <p class="era-period">${esc(era.period)}</p>
        <p class="era-blurb">${esc(era.blurb)}</p>
      </header>
      <div class="grid">${list.map(cardHTML).join('')}</div>
    </section>`;
  }).filter(Boolean);
  if (!sections.length) return `<p class="empty-note">Nothing matches your search.</p>`;
  return sections.join('');
}

function updateView() {
  const view = document.getElementById('view');
  if (!view) return;
  const q = state.query.trim().toLowerCase();
  view.innerHTML = state.sort === 'year' ? yearViewHTML(q)
    : state.sort === 'era' ? eraViewHTML(q)
    : currencyViewHTML(q);
}

/* ------------------------------------------------------------------
   Site chrome — rendered once into #chrome, never re-rendered, so the
   playlist survives navigation between pages.
------------------------------------------------------------------ */

/* The track behind the header player. */
const PLAYLIST_VIDEO_ID = 'fv4elyxEnmA';

/* 2πr for the progress ring, r = 20 in the button's 44-unit viewBox. */
const RING_LENGTH = 2 * Math.PI * 20;

function chromeHTML() {
  return `<header class="site-header">
    <a class="brand" href="#">
      <span class="brand-tile" aria-hidden="true"><span>₦</span></span>
      <span class="brand-name">The Money Of Nigeria</span>
    </a>
    <nav class="site-nav">
      <button class="player-btn" id="player-btn" type="button"
              data-playing="false" data-loading="true"
              aria-label="Play the money playlist">
        <svg class="player-ring" viewBox="0 0 44 44" aria-hidden="true">
          <circle class="ring-track" cx="22" cy="22" r="20"></circle>
          <circle class="ring-progress" id="ring-progress" cx="22" cy="22" r="20"></circle>
        </svg>
        <span class="player-icon" aria-hidden="true">
          <svg class="icon-volume" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 10v4a1 1 0 0 0 1 1h2.5l4 3.2A.5.5 0 0 0 11 17.8V6.2a.5.5 0 0 0-.8-.4L6.2 9H4a1 1 0 0 0-1 1Z"/>
            <path d="M15.5 8.5a5 5 0 0 1 0 7"/>
            <path d="M18.5 5.5a9 9 0 0 1 0 13"/>
          </svg>
          <svg class="icon-pause" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="2" stroke-linecap="round">
            <path d="M9 5v14"/><path d="M15 5v14"/>
          </svg>
        </span>
      </button>
      <a href="#">Money playlist</a>
      <a href="#">About</a>
    </nav>
  </header>
  <div class="yt-audio"><div id="yt-audio"></div></div>`;
}

/* --- Playlist player ---------------------------------------------
   A hidden YouTube iframe supplies the audio; the visible control is
   our own button, and the ring around it tracks playback position. */

let ytPlayer = null;
let ytReady = false;
let ringTimer = null;

function setRing(fraction) {
  const ring = document.getElementById('ring-progress');
  if (!ring) return;
  const f = Math.min(Math.max(fraction || 0, 0), 1);
  ring.style.strokeDashoffset = String(RING_LENGTH * (1 - f));
  /* A round cap still paints a dot at zero length, so hide the arc
     entirely until there is actually some progress to show. */
  ring.style.opacity = f > 0.001 ? '1' : '0';
}

function setPlaying(playing) {
  const btn = document.getElementById('player-btn');
  if (!btn) return;
  btn.dataset.playing = String(playing);
  btn.setAttribute('aria-label',
    playing ? 'Pause the money playlist' : 'Play the money playlist');
}

function trackRing() {
  clearInterval(ringTimer);
  ringTimer = setInterval(() => {
    if (!ytPlayer || typeof ytPlayer.getDuration !== 'function') return;
    const total = ytPlayer.getDuration();
    if (total > 0) setRing(ytPlayer.getCurrentTime() / total);
  }, 250);
}

function stopTrackingRing() {
  clearInterval(ringTimer);
  ringTimer = null;
}

/* Loaded on boot rather than on click: the API is async, and calling
   playVideo() after an await would fall outside the user gesture that
   browsers require before audio may start. */
function mountPlayer() {
  if (document.getElementById('yt-api')) return;
  window.onYouTubeIframeAPIReady = () => {
    ytPlayer = new YT.Player('yt-audio', {
      videoId: PLAYLIST_VIDEO_ID,
      playerVars: { controls: 0, disablekb: 1, playsinline: 1, rel: 0 },
      events: {
        onReady: () => {
          ytReady = true;
          const btn = document.getElementById('player-btn');
          if (btn) btn.dataset.loading = 'false';
        },
        onStateChange: e => {
          if (e.data === YT.PlayerState.PLAYING) { setPlaying(true); trackRing(); }
          else if (e.data === YT.PlayerState.ENDED) {
            setPlaying(false); stopTrackingRing(); setRing(0);
          } else { setPlaying(false); stopTrackingRing(); }
        }
      }
    });
  };
  const s = document.createElement('script');
  s.id = 'yt-api';
  s.src = 'https://www.youtube.com/iframe_api';
  document.head.append(s);
}

function renderChrome() {
  const chrome = document.getElementById('chrome');
  if (!chrome) return;
  chrome.innerHTML = chromeHTML();
  setRing(0);

  document.getElementById('player-btn').addEventListener('click', () => {
    if (!ytReady || !ytPlayer) return;
    if (ytPlayer.getPlayerState() === YT.PlayerState.PLAYING) ytPlayer.pauseVideo();
    else ytPlayer.playVideo();
  });

  mountPlayer();
}

function footerHTML(meta) {
  const sources = (meta.primary_sources || []).map(url =>
    `<li><a href="${esc(url)}" target="_blank" rel="noopener">${esc(hostname(url))}</a></li>`
  ).join('');
  const year = new Date().getFullYear();
  return `<footer class="site-footer">
    <div class="footer-links">
      <details class="footer-disclosure">
        <summary>About</summary>
        <p>${esc(meta.description)}</p>
      </details>
      <details class="footer-disclosure">
        <summary>Sources</summary>
        <ul class="footer-source-list">${sources}</ul>
      </details>
      <a class="footer-link" href="#">Money Playlist ↗</a>
    </div>
    <p class="footer-policy">${esc(meta.source_policy)}</p>
    <p class="footer-credit">Designed by Gift Kalu · © ${year} The Money of Nigeria</p>
  </footer>`;
}

function renderCatalog() {
  document.documentElement.classList.remove('snap-mode');
  document.title = SITE_TITLE;
  const meta = state.data.meta;
  const oneLiner = meta.description.split(/(?<=\.)\s/)[0];
  const sorts = [['currency', 'Currency'], ['year', 'Year'], ['era', 'Era']];

  app.innerHTML = `
    <header class="hero">
      <h1 class="site-title">${esc(SITE_TITLE)}</h1>
      <p class="site-desc">${esc(oneLiner)}</p>
      <div class="controls">
        <div class="sort-toggle" role="group" aria-label="Sort catalog by">
          ${sorts.map(([id, label]) =>
            `<button type="button" data-sort="${id}" aria-pressed="${state.sort === id}">${label}</button>`
          ).join('')}
        </div>
        <input class="search" id="search" type="search"
          placeholder="Search currencies, changes, people…"
          value="${esc(state.query)}" aria-label="Search">
      </div>
    </header>
    <main class="view" id="view"></main>
    ${footerHTML(meta)}`;

  app.querySelectorAll('[data-sort]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.sort = btn.dataset.sort;
      app.querySelectorAll('[data-sort]').forEach(b =>
        b.setAttribute('aria-pressed', String(b === btn)));
      updateView();
    });
  });

  document.getElementById('search').addEventListener('input', e => {
    state.query = e.target.value;
    updateView();
  });

  updateView();
  window.scrollTo(0, 0);
}

/* ------------------------------------------------------------------
   Currency detail page — scroll-snapped changelog slides
------------------------------------------------------------------ */

function factsHTML(c) {
  const facts = [];
  const join = a => a.join(' · ');
  if (c.denominations) facts.push(['Denominations', join(c.denominations)]);
  if (c.denominations_notes) facts.push(['Notes', join(c.denominations_notes)]);
  if (c.denominations_coins) facts.push(['Coins', join(c.denominations_coins)]);
  if (c.known_types) facts.push(['Known types', c.known_types.join(', ')]);
  if (c.counting_system) {
    const cs = c.counting_system;
    facts.push(['Counting', ['string', 'head', 'bag']
      .filter(k => cs[k]).map(k => `1 ${k} = ${cs[k]}`).join(' · ')]);
  }
  if (!facts.length) return '';
  return `<div class="detail-facts">${facts.map(([label, value]) =>
    `<p class="fact"><span class="fact-label">${esc(label)}</span> — ${esc(value)}</p>`
  ).join('')}</div>`;
}

function disagreementHTML(d) {
  if (!d) return '';
  return `<details class="disagree">
    <summary>Sources differ</summary>
    <p>${esc(d.according_to_cbn)}</p>
    <p>${esc(d.according_to_wikipedia)}</p>
  </details>`;
}

function slideHTML(c, ch, index) {
  const img = (c.images || []).find(im => im.change_ref === ch.change_no);
  const figure = img ? `<figure class="slide-figure">
      ${plateHTML(c, img)}
      ${img.caption || img.credit ? `<figcaption>${esc(img.caption || '')}${img.caption && img.credit ? ' · ' : ''}${esc(img.credit || '')}</figcaption>` : ''}
    </figure>` : '';
  const people = (ch.people || []).length
    ? `<p class="slide-people"><span class="slide-label">People</span>${esc(ch.people.join(' · '))}</p>`
    : '';
  const sources = (ch.sources || []).length
    ? `<div class="slide-sources">${ch.sources.map(url =>
        `<a href="${esc(url)}" target="_blank" rel="noopener">${esc(hostname(url))}</a>`).join('')}</div>`
    : '';
  return `<section class="slide ${index % 2 === 1 ? 'invert' : ''}">
    <div class="slide-inner">
      <div class="slide-year serif">${esc(displayYear(ch.date))}</div>
      <div class="slide-body">
        <p class="slide-kicker">Change ${esc(ch.change_no)} of ${c.changelog.length}</p>
        <h2 class="slide-title">${esc(ch.title)}</h2>
        ${figure}
        <p class="slide-what">${esc(ch.what_changed)}</p>
        ${ch.why ? `<p class="slide-why"><span class="slide-label">Why</span>${esc(ch.why)}</p>` : ''}
        ${people}
        ${disagreementHTML(ch.source_disagreement)}
        ${sources}
      </div>
    </div>
  </section>`;
}

function renderDetail(slug) {
  const ordered = [...state.data.currencies].sort((a, b) => currencyKey(a) - currencyKey(b));
  const i = ordered.findIndex(c => c.slug === slug);
  if (i === -1) { location.hash = ''; return; }
  const c = ordered[i];
  const prev = ordered[(i - 1 + ordered.length) % ordered.length];
  const next = ordered[(i + 1) % ordered.length];

  document.documentElement.classList.add('snap-mode');
  document.title = `${c.name} — ${SITE_TITLE}`;

  const era = eraOf(c.era_group);
  const metaLine = [
    era.label,
    c.issuer,
    c.first_used ? `First used ${c.first_used}` : null,
    statusLabel(c.status)
  ].filter(Boolean).join(' · ');

  const slides = [...(c.changelog || [])]
    .sort((a, b) => a.change_no - b.change_no)
    .map((ch, idx) => slideHTML(c, ch, idx))
    .join('');

  app.innerHTML = `
    <header class="detail-hero">
      <a class="back-link" href="#">← ${esc(SITE_TITLE)}</a>
      ${plateHTML(c, coverImage(c), 'detail-cover')}
      <h1 class="detail-title">${esc(c.name)}</h1>
      <p class="detail-summary">${esc(c.summary)}</p>
      <p class="detail-meta">${esc(metaLine)}</p>
      ${factsHTML(c)}
      <p class="scroll-hint">Scroll — ${c.changelog.length} changes</p>
    </header>
    ${slides}
    <footer class="detail-nav">
      <a class="nav-prev" href="#/c/${esc(prev.slug)}">
        <span class="nav-dir">← Previous</span>
        <span class="nav-name">${esc(prev.name)}</span>
      </a>
      <a class="nav-next" href="#/c/${esc(next.slug)}">
        <span class="nav-dir">Next →</span>
        <span class="nav-name">${esc(next.name)}</span>
      </a>
    </footer>`;

  window.scrollTo(0, 0);
}

/* ------------------------------------------------------------------
   Router / boot
------------------------------------------------------------------ */

function route() {
  if (!state.data) return;
  const m = location.hash.match(/^#\/c\/([\w-]+)/);
  if (m) renderDetail(m[1]);
  else renderCatalog();
}

window.addEventListener('hashchange', route);

fetch(DATA_URL)
  .then(r => {
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  })
  .then(data => {
    state.data = data;
    renderChrome();
    route();
  })
  .catch(err => {
    app.innerHTML = `<div class="hero"><h1 class="site-title">${esc(SITE_TITLE)}</h1>
      <p class="site-desc">Could not load the currency directory (${esc(err.message)}). Please try again.</p></div>`;
  });
