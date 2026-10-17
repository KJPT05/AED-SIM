const CACHE_NAME = 'aed-trainer-v4';
const ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/app.js',
  './manifest.json',
  './images/adult-chest.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
  './privacy.html',
  './audio/intro-safe.mp3',
  './audio/intro-danger.mp3',
  './audio/intro-no-response.mp3',
  './audio/intro-connecting.mp3',
  './audio/intro-gasping.mp3',
  './audio/intro-dont-wait.mp3',
  './audio/cpr-start-single.mp3',
  './audio/cpr-start-two.mp3',
  './audio/beat-single.mp3',
  './audio/beat-two.mp3',
  './audio/aed-arrived.mp3',
  './audio/aed-on.mp3',
  './audio/pads.mp3',
  './audio/clear-ask.mp3',
  './audio/clear-continue.mp3',
  './audio/clear-pads.mp3',
  './audio/analysing.mp3',
  './audio/shock-advised.mp3',
  './audio/shock-press.mp3',
  './audio/shock-delivered.mp3',
  './audio/no-shock.mp3',
  './audio/handover.mp3',
  './audio/continue.mp3',
  './audio/breaths.mp3',
  './audio/resume.mp3',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          if (response && response.status === 200 && response.type === 'basic') {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => cached);
    })
  );
});
