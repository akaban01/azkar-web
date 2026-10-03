/* Azkar PWA service worker.
   Two caches, deliberately separate:
     SHELL_CACHE  — versioned, replaced on every deploy.
     AUDIO_CACHE  — unversioned and never purged on activate, so the ~20 MB of
                    downloaded recitations survive app updates. */

const VERSION = 'v5';
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

self.addEventListener('install', (event) => {
  // Take over immediately, BEFORE any slow work. Calling this only after a
  // large precache meant a slow or interrupted install never activated, leaving
  // the previous worker in control and serving stale assets indefinitely.
  self.skipWaiting();

  event.waitUntil((async () => {
    const shell = await caches.open(SHELL_CACHE);
    // addAll is atomic — one 404 would abort the install, so add individually.
    // `reload` skips the browser HTTP cache, which the host lets hold JS for
    // hours — otherwise a new worker can install the previous deploy's files.
    await Promise.all(SHELL.map((u) => shell.add(new Request(u, { cache: 'reload' })).catch(() => {})));
  })());

  // Audio is deliberately NOT precached here. It is tens of megabytes, which
  // makes install slow and failure-prone; the page caches it via healPrecache()
  // once it is running, and retries on every later visit.
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

  // ---- Everything else (JS/CSS/icons): network-first, cache fallback. ----
  // Stale-while-revalidate would be faster, but it can pair a freshly deployed
  // index.html with a stale app.js for one load. These files are small, and
  // the cache still covers the offline case.
  // The host sends max-age=14400 for JS, which kept the old data.js on screen
  // for hours after a deploy. `no-cache` revalidates instead of trusting the HTTP
  // cache, and revalidating() stops the page's in-memory cache reusing the file.
  event.respondWith((async () => {
    const cache = await caches.open(SHELL_CACHE);
    try {
      const fresh = revalidating(await fetch(req, { cache: 'no-cache' }));
      if (fresh.ok) cache.put(req, fresh.clone());
      return fresh;
    } catch {
      return (await cache.match(req)) || Response.error();
    }
  })());
});

/** Copy of `res` marked Cache-Control: no-cache. Browsers keep subresources in
 *  memory across reloads while the response says they are fresh, never asking
 *  this worker again — so the host's long max-age would outlive a deploy. */
function revalidating(res) {
  if (res.type !== 'basic' && res.type !== 'default') return res;
  const headers = new Headers(res.headers);
  headers.set('Cache-Control', 'no-cache');
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
}

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
