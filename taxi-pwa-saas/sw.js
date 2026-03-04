const CACHE_NAME = 'taxmad-v2'; // Cambiamos a v2 para forzar actualización
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/drivers.html',
  '/manifest.json',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&display=swap'
];

// Instalación: Guardar archivos estáticos
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('TaxMad: Archivos estáticos en caché');
        return cache.addAll(ASSETS_TO_CACHE);
      })
  );
  self.skipWaiting();
});

// Activación: Limpiar cachés viejas
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

// Estrategia: Red primero, si falla usar Caché (Solo para archivos de diseño)
self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  // EXCEPCIÓN: No cachear API de Supabase ni Google Maps
  if (url.includes('supabase.co') || url.includes('googleapis.com') || url.includes('maps.gstatic.com')) {
    return event.respondWith(fetch(event.request));
  }

  // Para el resto de archivos (HTML, CSS, JS locales)
  event.respondWith(
    fetch(event.request)
      .catch(() => caches.match(event.request))
  );
});
