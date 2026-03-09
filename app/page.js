'use client'
import { useState } from 'react'
import { calcularTarifaTaxMad } from '@/lib/utils/tarifa'

export default function TaxMadApp() {
  const [form, setForm] = useState({ origen: '', destino: '' });
  const [precio, setPrecio] = useState(null);
  const [cargando, setCargando] = useState(false);

  const calcular = (e) => {
    e.preventDefault();
    setCargando(true);

    // Usamos el servicio de Distance Matrix de Google Maps
    const service = new google.maps.DistanceMatrixService();
    
    service.getDistanceMatrix(
      {
        origins: [form.origen],
        destinations: [form.destino],
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.METRIC,
      },
      (response, status) => {
        setCargando(false);
        if (status === 'OK' && response.rows[0].elements[0].status === 'OK') {
          const distanciaMetros = response.rows[0].elements[0].distance.value;
          const distanciaKm = distanciaMetros / 1000;

          const esAeropuerto = form.destino.toLowerCase().includes('aeropuerto') || form.origen.toLowerCase().includes('aeropuerto');
          const esEstacionIfema = form.destino.toLowerCase().includes('ifema') || form.origen.toLowerCase().includes('ifema');
          
          const total = calcularTarifaTaxMad({
            esAeropuerto,
            esDentroM30: true, 
            esEstacionIfema,
            distanciaKm: distanciaKm,
            fechaHora: new Date(),
            esPrecontratado: true
          });
          setPrecio(total);
        } else {
          alert('No se pudo calcular la ruta. Por favor verifica las direcciones.');
        }
      }
    );
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center">
      <h1 className="text-4xl font-black italic text-neon-green mb-8">TAXMAD</h1>
      
      <form onSubmit={calcular} className="w-full max-w-sm space-y-4">
        <input 
          placeholder="Origen (Ej: Paseo de la Castellana, 1)" 
          className="w-full bg-zinc-900 p-4 rounded-xl border border-white/10"
          onChange={(e) => setForm({...form, origen: e.target.value})}
          required
        />
        <input 
          placeholder="Destino (Ej: Aeropuerto T4)" 
          className="w-full bg-zinc-900 p-4 rounded-xl border border-white/10"
          onChange={(e) => setForm({...form, destino: e.target.value})}
          required
        />
        <button 
          disabled={cargando}
          className="w-full bg-white text-black py-4 rounded-xl font-black uppercase hover:bg-neon-green transition-colors disabled:opacity-50"
        >
          {cargando ? 'Calculando...' : 'Calcular Precio'}
        </button>
      </form>

      {precio && (
        <div className="mt-8 p-6 bg-zinc-900 rounded-3xl border border-neon-green text-center animate-in fade-in zoom-in duration-300">
          <p className="text-xs text-zinc-500 uppercase font-bold">Tarifa Total</p>
          <h2 className="text-4xl font-black">{precio.toFixed(2)}€</h2>
        </div>
      )}
    </div>
  );
}
