const CACHE_NAME = 'taxmad-v3'; // Subimos a v3
const ASSETS_TO_CACHE = [
  '/',
  '/manifest.json',
  '/logo.png',
  // Next.js maneja sus propios archivos JS, por lo que cacheamos la raíz
];

// Instalación
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activación: Limpieza
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
  self.clients.claim();
});

// Estrategia Inteligente: Red primero, si falla usar Caché
self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  // NO CACHEAR NUNCA: APIs (Supabase, Google Maps, Next Auth)
  if (
    url.includes('supabase.co') || 
    url.includes('googleapis.com') || 
    url.includes('maps.gstatic.com') ||
    url.includes('_next/data') // Datos dinámicos de Next.js
  ) {
    return; 
  }

  event.respondWith(
    fetch(event.request)
      .catch(() => caches.match(event.request))
  );
});
