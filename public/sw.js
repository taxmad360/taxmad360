const CACHE_NAME = 'taxmad-v3'; // Incrementamos a v3 para forzar la limpieza de caché antigua
const urlsToCache = [
  '/',
  '/manifest.json',
  '/logo.png'
];

// Instalación: Guardamos solo lo necesario
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// Activación: Borramos cualquier caché vieja para que no haya conflictos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Estrategia: Network First (Priorizamos datos frescos para que el conductor vea los viajes reales)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
