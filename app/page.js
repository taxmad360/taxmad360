'use client'
import { useState } from 'react'
import { calcularTarifaTaxMad } from '@/lib/utils/tarifa'

export default function TaxMadApp() {
  const [form, setForm] = useState({ origen: '', destino: '' });
  const [precio, setPrecio] = useState(null);

  const calcular = (e) => {
    e.preventDefault();
    const esAeropuerto = form.destino.toLowerCase().includes('aeropuerto') || form.origen.toLowerCase().includes('aeropuerto');
    
    const total = calcularTarifaTaxMad({
      esAeropuerto,
      esDentroM30: true, // Aquí deberías integrar tu lógica de geolocalización
      esEstacionIfema: false,
      distanciaKm: 12, // Valor obtenido de Google Maps API
      fechaHora: new Date(),
      esPrecontratado: true
    });
    setPrecio(total);
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center">
      <h1 className="text-4xl font-black italic text-neon-green mb-8">TAXMAD</h1>
      
      <form onSubmit={calcular} className="w-full max-w-sm space-y-4">
        <input 
          placeholder="Origen" 
          className="w-full bg-zinc-900 p-4 rounded-xl border border-white/10"
          onChange={(e) => setForm({...form, origen: e.target.value})}
        />
        <input 
          placeholder="Destino" 
          className="w-full bg-zinc-900 p-4 rounded-xl border border-white/10"
          onChange={(e) => setForm({...form, destino: e.target.value})}
        />
        <button className="w-full bg-white text-black py-4 rounded-xl font-black uppercase">
          Calcular Precio
        </button>
      </form>

      {precio && (
        <div className="mt-8 p-6 bg-zinc-900 rounded-3xl border border-neon-green text-center">
          <p className="text-xs text-zinc-500 uppercase font-bold">Tarifa Total</p>
          <h2 className="text-4xl font-black">{precio}€</h2>
        </div>
      )}
    </div>
  );
}
