// Liten service worker så att telefonen godkänner sidan som app.
// Sparar bara appens skal (ram + ikoner). All data hämtas alltid färsk från Google.
var CACHE = 'fordon-app-v2';
var SKAL = ['app.html', 'manifest.webmanifest', 'ikon-mork-192.png', 'ikon-mork-512.png', 'ikon-mork-180.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(SKAL); }));
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (k) {
    return Promise.all(k.filter(function (n) { return n !== CACHE; }).map(function (n) { return caches.delete(n); }));
  }));
  self.clients.claim();
});

// Nätet först, cachen bara om telefonen saknar nät.
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    fetch(e.request).then(function (svar) {
      var kopia = svar.clone();
      caches.open(CACHE).then(function (c) { c.put(e.request, kopia); });
      return svar;
    }).catch(function () { return caches.match(e.request); })
  );
});
