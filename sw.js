/* Azkar PWA service worker.
   Two caches, deliberately separate:
     SHELL_CACHE  — versioned, replaced on every deploy.
     AUDIO_CACHE  — unversioned and never purged on activate, so the ~20 MB of
                    downloaded recitations survive app updates. */

const VERSION = 'v1';
const SHELL_CACHE = `azkar-shell-${VERSION}`;
const AUDIO_CACHE = 'azkar-audio-v1';

const SHELL = [
  './',
  'index.html',
  'styles.css',
  'app.js',
  'data.js',
  'manifest.webmanifest',
  'icons/icon.svg',
  'icons/icon-192.png',
  'icons/icon-512.png'
];

const AUDIO = [
  'audio/eid-takbeerat.mp3',
  'audio/ayatul-kursi.mp3',
  'audio/azkar-sabah.mp3',
  'audio/azkar-masa.mp3'
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const shell = await caches.open(SHELL_CACHE);
    // addAll is atomic — one 404 would abort the install, so add individually.
    await Promise.all(SHELL.map((u) => shell.add(u).catch(() => {})));

    // Pre-cache audio on install so a fresh install is offline-ready.
    const audio = await caches.open(AUDIO_CACHE);
    await Promise.all(AUDIO.map(async (u) => {
      if (await audio.match(u)) return;
      try {
        const res = await fetch(u, { cache: 'reload' });
        if (res.ok) await audio.put(u, res);
      } catch { /* user can retry from Settings */ }
    }));

    self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(
      names
        .filter((n) => n.startsWith('azkar-shell-') && n !== SHELL_CACHE)
        .map((n) => caches.delete(n))
    );
    await self.clients.claim();
  })());
});

const isAudio = (url) => url.pathname.includes('/audio/');

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // ---- Audio: cache-first, and satisfy Range requests from the cached body. ----
  if (isAudio(url)) {
    event.respondWith(serveAudio(req, url));
    return;
  }

  // ---- Navigations: network-first, fall back to the cached shell. ----
  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(req);
        const c = await caches.open(SHELL_CACHE);
        c.put('index.html', fresh.clone());
        return fresh;
      } catch {
        const c = await caches.open(SHELL_CACHE);
        return (await c.match('index.html')) || (await c.match('./')) || Response.error();
      }
    })());
    return;
  }

  // ---- Everything else: stale-while-revalidate. ----
  event.respondWith((async () => {
    const cache = await caches.open(SHELL_CACHE);
    const hit = await cache.match(req);
    const net = fetch(req)
      .then((res) => { if (res.ok) cache.put(req, res.clone()); return res; })
      .catch(() => null);
    return hit || (await net) || Response.error();
  })());
});

/** Serve audio from cache, honouring HTTP Range so seeking works offline. */
async function serveAudio(req, url) {
  const cache = await caches.open(AUDIO_CACHE);
  // Both the page and this worker cache under the resolved absolute URL,
  // so a single lookup by href covers entries written from either side.
  let res = await cache.match(url.href);

  if (!res) {
    try {
      const fresh = await fetch(req.url, { cache: 'reload' });
      if (fresh.ok && fresh.status === 200) {
        await cache.put(url.href, fresh.clone());
        res = fresh;
      } else {
        return fresh;
      }
    } catch {
      return new Response('', { status: 504, statusText: 'Offline and not cached' });
    }
  }

  const range = req.headers.get('range');
  if (!range) return res;

  const buf = await res.clone().arrayBuffer();
  const m = /bytes=(\d*)-(\d*)/.exec(range);
  if (!m) return res;

  const total = buf.byteLength;
  const start = m[1] ? parseInt(m[1], 10) : 0;
  const end = m[2] ? parseInt(m[2], 10) : total - 1;

  if (start >= total || start > end) {
    return new Response(null, {
      status: 416,
      headers: { 'Content-Range': `bytes */${total}` }
    });
  }

  return new Response(buf.slice(start, end + 1), {
    status: 206,
    statusText: 'Partial Content',
    headers: {
      'Content-Type': res.headers.get('Content-Type') || 'audio/mpeg',
      'Content-Length': String(end - start + 1),
      'Content-Range': `bytes ${start}-${end}/${total}`,
      'Accept-Ranges': 'bytes'
    }
  });
}
