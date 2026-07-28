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

/* Where the track is linked if no audio file is present. */
const PLAYLIST_VIDEO_ID = 'fv4elyxEnmA';

/* 2πr for the progress ring, r = 15 in the button's 32-unit viewBox. */
const RING_LENGTH = 2 * Math.PI * 15;

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
        <svg class="player-ring" viewBox="0 0 32 32" aria-hidden="true">
          <circle class="ring-track" cx="16" cy="16" r="15"></circle>
          <circle class="ring-progress" id="ring-progress" cx="16" cy="16" r="15"></circle>
        </svg>
        <span class="player-icon" aria-hidden="true">
          <!-- Hugeicons free (MIT): volume-high and pause -->
          <svg class="icon-volume" viewBox="0 0 24 24" fill="none">
            <path d="M14 14.8135V9.18646C14 6.04126 14 4.46866 13.0747 4.0773C12.1494 3.68593 11.0603 4.79793 8.88232 7.02192C7.75439 8.17365 7.11085 8.42869 5.50604 8.42869C4.10257 8.42869 3.40084 8.42869 2.89675 8.77262C1.85035 9.48655 2.00852 10.882 2.00852 12C2.00852 13.118 1.85035 14.5134 2.89675 15.2274C3.40084 15.5713 4.10257 15.5713 5.50604 15.5713C7.11085 15.5713 7.75439 15.8264 8.88232 16.9781C11.0603 19.2021 12.1494 20.3141 13.0747 19.9227C14 19.5313 14 17.9587 14 14.8135Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/>
            <path d="M17 9C17.6254 9.81968 18 10.8634 18 12C18 13.1366 17.6254 14.1803 17 15" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/>
            <path d="M20 7C21.2508 8.36613 22 10.1057 22 12C22 13.8943 21.2508 15.6339 20 17" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/>
          </svg>
          <svg class="icon-pause" viewBox="0 0 24 24" fill="none">
            <path d="M4 7C4 5.58579 4 4.87868 4.43934 4.43934C4.87868 4 5.58579 4 7 4C8.41421 4 9.12132 4 9.56066 4.43934C10 4.87868 10 5.58579 10 7V17C10 18.4142 10 19.1213 9.56066 19.5607C9.12132 20 8.41421 20 7 20C5.58579 20 4.87868 20 4.43934 19.5607C4 19.1213 4 18.4142 4 17V7Z" stroke="currentColor" stroke-width="1.5"/>
            <path d="M14 7C14 5.58579 14 4.87868 14.4393 4.43934C14.8787 4 15.5858 4 17 4C18.4142 4 19.1213 4 19.5607 4.43934C20 4.87868 20 5.58579 20 7V17C20 18.4142 20 19.1213 19.5607 19.5607C19.1213 20 18.4142 20 17 20C15.5858 20 14.8787 20 14.4393 19.5607C14 19.1213 14 18.4142 14 17V7Z" stroke="currentColor" stroke-width="1.5"/>
          </svg>
        </span>
      </button>
      <a href="#">Money playlist</a>
      <a href="#">About</a>
    </nav>
  </header>
  <audio id="playlist-audio" preload="metadata" src="${PLAYLIST.src}"></audio>`;
}

/* --- Playlist player ---------------------------------------------
   Two possible sources, same button and same ring.

   'youtube' streams through the official embed API. For a commercial
   track that is the licensed way to play it — the platform carries the
   rights — and the API still exposes position, so our own ring works.
   It needs a served page: from a file:// URL the API cannot verify its
   postMessage handshake and never signals ready.

   'file' plays audio/… instead, for when you hold a licensed copy.
   That one works anywhere, including from a plain file. */

const PLAYLIST = {
  source: 'youtube',                       // 'youtube' | 'file'
  videoId: 'fv4elyxEnmA',
  src: 'audio/money-playlist.mp3',
  title: 'Billionaire — Stanley Okorie'
};

PLAYLIST.url = `https://youtu.be/${PLAYLIST.videoId}`;

let audioEl = null;
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
  btn.setAttribute('aria-label', `${playing ? 'Pause' : 'Play'} ${PLAYLIST.title}`);
}

function setReady() {
  const btn = document.getElementById('player-btn');
  if (btn) { btn.dataset.loading = 'false'; btn.dataset.error = 'false'; }
}

/* Never leave a dead control: fall back to opening the track. */
function failToLink(reason) {
  if (ytReady) return;
  const btn = document.getElementById('player-btn');
  if (!btn) return;
  btn.dataset.loading = 'false';
  btn.dataset.error = 'true';
  btn.setAttribute('aria-label', `Open ${PLAYLIST.title}`);
  btn.title = `In-page audio unavailable (${reason}). Opens the track instead.`;
}

/* --- file source ------------------------------------------------- */

function bindFileSource(btn) {
  audioEl = document.getElementById('playlist-audio');
  if (!audioEl) return;
  audioEl.src = PLAYLIST.src;

  audioEl.addEventListener('loadedmetadata', setReady);
  audioEl.addEventListener('timeupdate', () => {
    if (audioEl.duration > 0) setRing(audioEl.currentTime / audioEl.duration);
  });
  audioEl.addEventListener('play', () => setPlaying(true));
  audioEl.addEventListener('pause', () => setPlaying(false));
  audioEl.addEventListener('ended', () => { setPlaying(false); setRing(0); });
  audioEl.addEventListener('error', () => failToLink('file missing'));

  btn.addEventListener('click', () => {
    if (btn.dataset.error === 'true') return openTrack();
    if (audioEl.paused) audioEl.play().catch(() => failToLink('playback refused'));
    else audioEl.pause();
  });
}

/* --- youtube source ---------------------------------------------- */

function trackRing() {
  clearInterval(ringTimer);
  ringTimer = setInterval(() => {
    if (!ytPlayer || typeof ytPlayer.getDuration !== 'function') return;
    const total = ytPlayer.getDuration();
    if (total > 0) setRing(ytPlayer.getCurrentTime() / total);
  }, 250);
}

function bindYouTubeSource(btn) {
  const vars = { controls: 0, disablekb: 1, playsinline: 1, rel: 0 };
  if (location.protocol === 'http:' || location.protocol === 'https:') {
    vars.origin = location.origin;
  }

  window.onYouTubeIframeAPIReady = () => {
    ytPlayer = new YT.Player('yt-audio', {
      videoId: PLAYLIST.videoId,
      playerVars: vars,
      events: {
        onReady: () => { ytReady = true; setReady(); },
        onError: () => failToLink('track unavailable'),
        onStateChange: e => {
          if (e.data === YT.PlayerState.PLAYING) { setPlaying(true); trackRing(); }
          else if (e.data === YT.PlayerState.ENDED) {
            setPlaying(false); clearInterval(ringTimer); setRing(0);
          } else { setPlaying(false); clearInterval(ringTimer); }
        }
      }
    });
  };

  if (!document.getElementById('yt-api')) {
    const s = document.createElement('script');
    s.id = 'yt-api';
    s.src = 'https://www.youtube.com/iframe_api';
    s.onerror = () => failToLink('script blocked');
    document.head.append(s);
    setTimeout(() => failToLink('needs a served page, not file://'), 6000);
  }

  btn.addEventListener('click', () => {
    if (btn.dataset.error === 'true') return openTrack();
    if (!ytReady || !ytPlayer) return;
    if (ytPlayer.getPlayerState() === YT.PlayerState.PLAYING) ytPlayer.pauseVideo();
    else ytPlayer.playVideo();
  });
}

function openTrack() {
  window.open(PLAYLIST.url, '_blank', 'noopener');
}

function bindPlayer() {
  const btn = document.getElementById('player-btn');
  if (!btn) return;
  if (PLAYLIST.source === 'file') bindFileSource(btn);
  else bindYouTubeSource(btn);
}

function renderChrome() {
  const chrome = document.getElementById('chrome');
  if (!chrome) return;
  chrome.innerHTML = chromeHTML();
  setRing(0);

  bindPlayer();
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
