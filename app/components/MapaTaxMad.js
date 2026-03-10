'use client'
import { useEffect, useRef } from 'react'

export default function MapaTaxMad({ lat, lng, zoom = 15 }) {
  const mapRef = useRef(null);
  const googleMap = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.google && mapRef.current) {

      if (!googleMap.current) {
        googleMap.current = new window.google.maps.Map(mapRef.current, {
          center: { lat: parseFloat(lat), lng: parseFloat(lng) },
          zoom: zoom,
          disableDefaultUI: true,
          mapId: '90f00b7104e38e6a', // ✅ Usando solo mapId (estilos en Google Console)
          // ⚠️ ELIMINADO: el array 'styles' es incompatible con 'mapId' y causaba error en runtime
        });
      } else {
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
