import { AZKAR, ALL_AUDIO } from './data.js';

const APP_VERSION = '2';
const $ = (id) => document.getElementById(id);

/* =========================================================
   IndexedDB — user-imported audio blobs + playback positions
   ========================================================= */
const DB_NAME = 'azkar-db';
const STORE_AUDIO = 'audio';
const STORE_META = 'meta';

let dbPromise;
function db() {
  dbPromise ??= new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const d = req.result;
      if (!d.objectStoreNames.contains(STORE_AUDIO)) d.createObjectStore(STORE_AUDIO);
      if (!d.objectStoreNames.contains(STORE_META)) d.createObjectStore(STORE_META);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

async function idbGet(store, key) {
  const d = await db();
  return new Promise((res, rej) => {
    const r = d.transaction(store, 'readonly').objectStore(store).get(key);
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}
async function idbSet(store, key, val) {
  const d = await db();
  return new Promise((res, rej) => {
    const tx = d.transaction(store, 'readwrite');
    tx.objectStore(store).put(val, key);
    tx.oncomplete = () => res();
    tx.onerror = () => rej(tx.error);
  });
}
async function idbKeys(store) {
  const d = await db();
  return new Promise((res, rej) => {
    const r = d.transaction(store, 'readonly').objectStore(store).getAllKeys();
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}
async function idbClear(store) {
  const d = await db();
  return new Promise((res, rej) => {
    const tx = d.transaction(store, 'readwrite');
    tx.objectStore(store).clear();
    tx.oncomplete = () => res();
    tx.onerror = () => rej(tx.error);
  });
}

/* =========================================================
   State
   ========================================================= */
const state = {
  section: null,
  queue: [],
  index: 0,
  repeat: false,
  rate: 1,
  objectUrl: null,
  importedIds: new Set()
};

const audio = new Audio();
audio.preload = 'metadata';

/* =========================================================
   Helpers
   ========================================================= */
function fmtTime(sec) {
  if (!isFinite(sec) || sec < 0) sec = 0;
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  return h
    ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    : `${m}:${String(s).padStart(2, '0')}`;
}

function fmtBytes(bytes) {
  if (!bytes) return '0 MB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

let toastTimer;
function toast(msg) {
  const el = $('toast');
  el.textContent = msg;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.hidden = true; }, 2800);
}

/* =========================================================
   Home
   ========================================================= */
function renderHome() {
  const wrap = $('cards');
  wrap.innerHTML = '';
  for (const sec of AZKAR) {
    const btn = document.createElement('button');
    btn.className = `card accent-${sec.accent}`;
    btn.type = 'button';

    const n = sec.tracks.filter((t) => t.src).length;
    const badge = n
      ? `<span class="card-badge">${n > 1 ? n + ' tracks' : 'Audio'}</span>`
      : '<span class="card-badge pending">Text</span>';

    btn.innerHTML = `
      <span class="card-glyph">${sec.glyph}</span>
      <span class="card-body">
        <span class="card-title">${sec.title}</span><br>
        <span class="card-sub">${sec.subtitle}</span>
      </span>
      ${badge}`;
    btn.addEventListener('click', () => openSection(sec.id));
    wrap.appendChild(btn);
  }
}

/* =========================================================
   Detail
   ========================================================= */
function openSection(id) {
  const sec = AZKAR.find((s) => s.id === id);
  if (!sec) return;
  state.section = sec;

  $('detailGlyph').textContent = sec.glyph;
  $('viewDetail').className = `view accent-${sec.accent}`;
  $('detailTitle').textContent = sec.title;
  $('detailSub').textContent = sec.subtitle;
  $('topTitle').textContent = sec.title;

  const cw = $('counterWrap');
  if (sec.counter) {
    cw.hidden = false;
    $('counterTarget').textContent = `of ${sec.counter}`;
    loadCounter(sec.id);
  } else {
    cw.hidden = true;
  }

  const playable = sec.tracks.some((t) => t.src || state.importedIds.has(t.id));
  $('playAllBtn').disabled = !playable;
  $('catDownloadBtn').hidden = !sec.tracks.some((t) => t.src);

  renderTracks();
  renderText(sec);

  showView('detail');
  location.hash = '#/' + sec.id;
}

function renderTracks() {
  const sec = state.section;
  const list = $('trackList');
  list.innerHTML = '';

  sec.tracks.forEach((t, i) => {
    const li = document.createElement('li');
    const hasImport = state.importedIds.has(t.id);
    const playable = !!t.src || hasImport;

    const row = document.createElement('button');
    row.className = 'track';
    row.type = 'button';
    row.disabled = !playable;
    if (playable) row.addEventListener('click', () => playFrom(sec, i));

    const tag = hasImport
      ? '<span class="track-tag custom">Yours</span>'
      : (t.src ? (t.sub ? `<span class="track-tag">${t.sub}</span>` : '') : '<span class="track-tag">No audio</span>');

    row.innerHTML = `
      <span class="track-num">${i + 1}</span>
      <span class="track-title">${t.title}</span>
      ${tag}`;

    const imp = document.createElement('button');
    imp.className = 'track-import';
    imp.type = 'button';
    imp.textContent = hasImport ? 'Replace' : 'Add audio';
    imp.addEventListener('click', (e) => { e.stopPropagation(); pickFileFor(t.id); });

    li.appendChild(row);
    li.appendChild(imp);
    list.appendChild(li);
  });

  highlightActive();
}

function renderText(sec) {
  const note = $('textNote');
  if (sec.textNote) { note.textContent = sec.textNote; note.hidden = false; } else { note.hidden = true; }

  const list = $('textList');
  list.innerHTML = '';

  for (const item of sec.text) {
    const li = document.createElement('li');

    if (item.note) {
      const n = document.createElement('p');
      n.className = 'dhikr-note';
      n.textContent = item.note;
      li.appendChild(n);
    }

    if (item.body) {
      const ar = document.createElement('p');
      ar.className = 'dhikr-ar';
      ar.lang = 'ar';
      ar.dir = 'rtl';
      ar.textContent = item.body;
      li.appendChild(ar);
    } else {
      li.classList.add('note-only');
    }

    if (item.repeat) {
      const r = document.createElement('span');
      r.className = 'dhikr-repeat';
      r.textContent = `Repeat ${item.repeat}×`;
      li.appendChild(r);
    }

    list.appendChild(li);
  }
}

function highlightActive() {
  const rows = $('trackList').querySelectorAll('.track');
  rows.forEach((r, i) => {
    const isActive = state.section && state.queue[state.index]
      && state.section.tracks[i] === state.queue[state.index];
    r.classList.toggle('active', !!isActive);
  });
}

/* =========================================================
   Views / routing
   ========================================================= */
function showView(name) {
  $('viewHome').hidden = name !== 'home';
  $('viewDetail').hidden = name !== 'detail';
  $('viewSettings').hidden = name !== 'settings';
  $('backBtn').hidden = name === 'home';
  if (name === 'home') $('topTitle').textContent = 'Azkar';
  if (name === 'settings') $('topTitle').textContent = 'Settings';
  window.scrollTo(0, 0);
}

function route() {
  const h = location.hash.replace(/^#\/?/, '');
  if (h === 'settings') { showView('settings'); refreshSettings(); return; }
  const sec = AZKAR.find((s) => s.id === h);
  if (sec) { openSection(sec.id); return; }
  showView('home');
  refreshHomeCta();
}

/* =========================================================
   Playback
   ========================================================= */
async function resolveSrc(track) {
  if (state.objectUrl) { URL.revokeObjectURL(state.objectUrl); state.objectUrl = null; }
  const blob = await idbGet(STORE_AUDIO, track.id).catch(() => null);
  if (blob) {
    state.objectUrl = URL.createObjectURL(blob);
    return state.objectUrl;
  }
  return track.src;
}

async function playFrom(sec, index) {
  state.section = sec;
  state.queue = sec.tracks;
  state.index = index;
  await loadCurrent(true);
}

async function loadCurrent(autoplay) {
  const track = state.queue[state.index];
  if (!track) return;

  const src = await resolveSrc(track);
  if (!src) { toast('No audio for this track yet'); return; }

  audio.src = src;
  audio.playbackRate = state.rate;

  $('player').hidden = false;
  document.body.classList.add('player-open');
  $('pTitle').textContent = track.title;
  $('pSub').textContent = state.section?.subtitle ?? '';
  $('pPrev').disabled = state.queue.length < 2;
  $('pNext').disabled = state.queue.length < 2;

  const saved = await idbGet(STORE_META, 'pos:' + track.id).catch(() => null);
  const restore = typeof saved === 'number' && saved > 5 ? saved : 0;

  const start = () => {
    if (restore && isFinite(audio.duration) && restore < audio.duration - 5) audio.currentTime = restore;
    if (autoplay) audio.play().catch(() => {});
  };
  if (audio.readyState >= 1) start();
  else audio.addEventListener('loadedmetadata', start, { once: true });

  updateMediaSession(track);
  highlightActive();
}

function next() {
  if (state.index < state.queue.length - 1) { state.index++; loadCurrent(true); }
  else if (state.repeat) { state.index = 0; loadCurrent(true); }
}
function prev() {
  if (audio.currentTime > 3) { audio.currentTime = 0; return; }
  if (state.index > 0) { state.index--; loadCurrent(true); }
}

function updateMediaSession(track) {
  if (!('mediaSession' in navigator)) return;
  navigator.mediaSession.metadata = new MediaMetadata({
    title: track.title,
    artist: state.section?.subtitle ?? '',
    album: 'Azkar',
    artwork: [
      { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' }
    ]
  });
  const h = navigator.mediaSession.setActionHandler.bind(navigator.mediaSession);
  h('play', () => audio.play());
  h('pause', () => audio.pause());
  h('previoustrack', prev);
  h('nexttrack', next);
  h('seekbackward', (d) => { audio.currentTime = Math.max(0, audio.currentTime - (d.seekOffset || 10)); });
  h('seekforward', (d) => { audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + (d.seekOffset || 10)); });
}

let seeking = false;
let lastSave = 0;

audio.addEventListener('play', () => $('pPlay').classList.add('playing'));
audio.addEventListener('pause', () => $('pPlay').classList.remove('playing'));
audio.addEventListener('loadedmetadata', () => { $('tDur').textContent = fmtTime(audio.duration); });
audio.addEventListener('timeupdate', () => {
  if (!seeking && isFinite(audio.duration) && audio.duration > 0) {
    $('seek').value = String(Math.round((audio.currentTime / audio.duration) * 1000));
  }
  $('tCur').textContent = fmtTime(audio.currentTime);

  const now = Date.now();
  if (now - lastSave > 4000) {
    lastSave = now;
    const t = state.queue[state.index];
    if (t) idbSet(STORE_META, 'pos:' + t.id, audio.currentTime).catch(() => {});
  }
});
audio.addEventListener('ended', () => {
  const t = state.queue[state.index];
  if (t) idbSet(STORE_META, 'pos:' + t.id, 0).catch(() => {});
  if (state.repeat && state.queue.length === 1) { audio.currentTime = 0; audio.play(); return; }
  next();
});
audio.addEventListener('error', () => {
  if (audio.src) toast('Could not play this file');
});

/* =========================================================
   Offline caching
   ========================================================= */
const AUDIO_CACHE = 'azkar-audio-v1';

async function cachedCount() {
  if (!('caches' in window)) return 0;
  const c = await caches.open(AUDIO_CACHE);
  return (await c.keys()).length;
}

async function cachedBytes() {
  if (!('caches' in window)) return 0;
  const c = await caches.open(AUDIO_CACHE);
  let total = 0;
  for (const k of await c.keys()) {
    const r = await c.match(k);
    if (!r) continue;
    try { total += (await r.clone().blob()).size; } catch { /* ignore */ }
  }
  return total;
}

async function downloadAll(onProgress) {
  const cache = await caches.open(AUDIO_CACHE);
  let done = 0;
  for (const url of ALL_AUDIO) {
    try {
      if (!(await cache.match(url))) {
        const res = await fetch(url, { cache: 'reload' });
        if (res.ok) await cache.put(url, res.clone());
      }
    } catch { /* keep going; the count reflects reality afterwards */ }
    done++;
    onProgress?.(done, ALL_AUDIO.length);
  }
  return done;
}

async function refreshHomeCta() {
  const cta = $('storageCta');
  if (!('caches' in window)) { cta.hidden = true; return; }
  const n = await cachedCount();
  if (n >= ALL_AUDIO.length) { cta.hidden = true; return; }
  cta.hidden = false;
  $('storageCtaSub').textContent =
    n === 0 ? 'Nothing saved yet' : `${n} of ${ALL_AUDIO.length} saved`;
}

async function refreshSettings() {
  const n = await cachedCount();
  $('cacheStat').textContent = `${n} of ${ALL_AUDIO.length} files — ${fmtBytes(await cachedBytes())}`;

  if (navigator.storage?.persisted) {
    const p = await navigator.storage.persisted();
    $('persistStat').textContent = p ? 'Enabled' : 'Not enabled';
    $('persistBtn').disabled = p;
    $('persistBtn').textContent = p ? 'Already enabled' : 'Enable persistent storage';
  } else {
    $('persistStat').textContent = 'Not supported in this browser';
    $('persistBtn').disabled = true;
  }

  const keys = await idbKeys(STORE_AUDIO).catch(() => []);
  $('importStat').textContent = keys.length
    ? `${keys.length} file${keys.length > 1 ? 's' : ''}`
    : 'No imported audio';

  $('verFoot').textContent = `Version ${APP_VERSION}`;
}

/* =========================================================
   Import
   ========================================================= */
let pendingImportId = null;
function pickFileFor(trackId) {
  pendingImportId = trackId;
  $('filePick').click();
}

$('filePick').addEventListener('change', async (e) => {
  const file = e.target.files?.[0];
  e.target.value = '';
  if (!file || !pendingImportId) return;
  try {
    await idbSet(STORE_AUDIO, pendingImportId, file);
    state.importedIds.add(pendingImportId);
    toast('Saved to your device');
    if (state.section) { renderTracks(); $('playAllBtn').disabled = false; }
  } catch {
    toast('Could not save that file');
  }
  pendingImportId = null;
});

/* =========================================================
   Counter
   ========================================================= */
function loadCounter(secId) {
  paintCounter(+(localStorage.getItem('count:' + secId) || 0));
}
function paintCounter(v) {
  const target = state.section?.counter ?? 0;
  $('counterVal').textContent = String(v);
  $('counterBtn').classList.toggle('done', target > 0 && v >= target);
}
$('counterBtn').addEventListener('click', () => {
  const sec = state.section;
  if (!sec?.counter) return;
  const key = 'count:' + sec.id;
  let v = +(localStorage.getItem(key) || 0) + 1;
  if (v > sec.counter) v = 1;
  localStorage.setItem(key, String(v));
  paintCounter(v);
  if (v === sec.counter && navigator.vibrate) navigator.vibrate(60);
});
$('counterReset').addEventListener('click', () => {
  if (!state.section) return;
  localStorage.setItem('count:' + state.section.id, '0');
  paintCounter(0);
});

/* =========================================================
   Wiring
   ========================================================= */
$('backBtn').addEventListener('click', () => { location.hash = ''; });
$('settingsBtn').addEventListener('click', () => { location.hash = '#/settings'; });
$('playAllBtn').addEventListener('click', () => playFrom(state.section, 0));

$('catDownloadBtn').addEventListener('click', async (e) => {
  const btn = e.currentTarget;
  const old = btn.textContent;
  btn.disabled = true;
  btn.textContent = 'Saving…';
  const cache = await caches.open(AUDIO_CACHE);
  let fail = 0;
  for (const t of state.section.tracks) {
    if (!t.src) continue;
    try {
      if (!(await cache.match(t.src))) {
        const r = await fetch(t.src, { cache: 'reload' });
        if (r.ok) await cache.put(t.src, r.clone()); else fail++;
      }
    } catch { fail++; }
  }
  btn.textContent = old;
  btn.disabled = false;
  toast(fail ? `${fail} file${fail > 1 ? 's' : ''} could not be saved` : 'Saved for offline listening');
});

$('ctaDownload').addEventListener('click', () => {
  location.hash = '#/settings';
  setTimeout(() => $('downloadAllBtn').click(), 250);
});

$('downloadAllBtn').addEventListener('click', async () => {
  const btn = $('downloadAllBtn');
  btn.disabled = true;
  $('dlProgressWrap').hidden = false;
  await downloadAll((done, total) => { $('dlProgress').style.width = (done / total) * 100 + '%'; });
  btn.disabled = false;
  await refreshSettings();
  const n = await cachedCount();
  toast(n >= ALL_AUDIO.length ? 'All audio saved' : 'Some files failed — check your connection');
});

$('clearCacheBtn').addEventListener('click', async () => {
  await caches.delete(AUDIO_CACHE);
  $('dlProgress').style.width = '0%';
  await refreshSettings();
  toast('Saved audio deleted');
});

$('clearImportsBtn').addEventListener('click', async () => {
  await idbClear(STORE_AUDIO);
  state.importedIds.clear();
  await refreshSettings();
  if (state.section) renderTracks();
  toast('Imported audio deleted');
});

$('persistBtn').addEventListener('click', async () => {
  const granted = await navigator.storage.persist();
  toast(granted ? 'Persistent storage enabled' : 'Browser declined — try installing the app');
  await refreshSettings();
});

$('pPlay').addEventListener('click', () => { audio.paused ? audio.play() : audio.pause(); });
$('pNext').addEventListener('click', next);
$('pPrev').addEventListener('click', prev);
$('pClose').addEventListener('click', () => {
  audio.pause();
  $('player').hidden = true;
  document.body.classList.remove('player-open');
});
$('pRepeat').addEventListener('click', (e) => {
  state.repeat = !state.repeat;
  e.currentTarget.setAttribute('aria-pressed', String(state.repeat));
});
$('pRate').addEventListener('click', (e) => {
  const rates = [1, 1.25, 1.5, 0.75];
  state.rate = rates[(rates.indexOf(state.rate) + 1) % rates.length];
  audio.playbackRate = state.rate;
  e.currentTarget.textContent = state.rate + '×';
});

const seek = $('seek');
seek.addEventListener('input', () => { seeking = true; });
seek.addEventListener('change', () => {
  if (isFinite(audio.duration)) audio.currentTime = (seek.value / 1000) * audio.duration;
  seeking = false;
});

document.addEventListener('keydown', (e) => {
  if (e.target.matches('input, textarea')) return;
  if (e.code === 'Space' && !$('player').hidden) { e.preventDefault(); audio.paused ? audio.play() : audio.pause(); }
  if (e.key === 'Escape' && $('viewHome').hidden) location.hash = '';
});

function syncOnline() { $('offlineBar').hidden = navigator.onLine; }
window.addEventListener('online', syncOnline);
window.addEventListener('offline', syncOnline);
window.addEventListener('hashchange', route);

/* =========================================================
   Boot
   ========================================================= */
(async function boot() {
  try { state.importedIds = new Set(await idbKeys(STORE_AUDIO)); } catch { /* no IDB */ }

  renderHome();
  syncOnline();
  route();

  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('sw.js');
      if (navigator.storage?.persist && !(await navigator.storage.persisted())) {
        navigator.storage.persist().catch(() => {});
      }
      // The worker precaches during install; waiting avoids both sides racing
      // to fetch the same files.
      await navigator.serviceWorker.ready;
    } catch { /* SW unavailable — app still works online */ }
  }

  // The banner was painted before precaching finished, so re-evaluate.
  refreshHomeCta().catch(() => {});
})();
