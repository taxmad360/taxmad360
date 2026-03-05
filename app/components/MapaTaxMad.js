'use client'
import { useEffect, useRef } from 'react'

export default function MapaTaxMad({ lat, lng, zoom = 15 }) {
  const mapRef = useRef(null);
  const googleMap = useRef(null);

  useEffect(() => {
    // 1. Verificamos que Google Maps esté cargado en el navegador
    if (typeof window !== 'undefined' && window.google && mapRef.current) {
      
      // 2. Si el mapa no existe, lo creamos (evita cobros por re-renderizado)
      if (!googleMap.current) {
        googleMap.current = new window.google.maps.Map(mapRef.current, {
          center: { lat: parseFloat(lat), lng: parseFloat(lng) },
          zoom: zoom,
          disableDefaultUI: true, // Ahorra datos al no cargar botones de zoom/satélite
          mapId: '90f00b7104e38e6a', // Si tienes un ID de estilo en Google Console, ponlo aquí
          styles: [
            { "elementType": "geometry", "stylers": [{ "color": "#212121" }] },
            { "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
            { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#303030" }] },
            { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#000000" }] }
          ]
        });
      } else {
        // 3. Si ya existe, solo movemos el centro (Gratis: Google no cobra por panTo)
        googleMap.current.panTo({ lat: parseFloat(lat), lng: parseFloat(lng) });
      }
    }
  }, [lat, lng, zoom]);

  return (
    <div 
      ref={mapRef} 
      className="w-full h-full rounded-2xl border border-zinc-800"
      style={{ minHeight: '250px', background: '#111' }}
    />
  );
}
