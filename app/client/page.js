'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { calcularTarifaTaxMad } from '@/lib/utils/tarifa'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function ClientApp() {
  const [form, setForm] = useState({ origen: '', destino: '' });
  const [precio, setPrecio] = useState(null);

  const revisarTarifa = (e) => {
    e.preventDefault();
    const total = calcularTarifaTaxMad({
      esAeropuerto: form.destino.toLowerCase().includes('aeropuerto'),
      esDentroM30: true,
      distanciaKm: 10,
      fechaHora: new Date(),
      esPrecontratado: true
    });
    setPrecio(total);
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center">
      <h1 className="text-4xl italic font-black text-neon-green mb-8">TAXMAD</h1>
      <form onSubmit={revisarTarifa} className="w-full max-w-sm space-y-4">
        <input className="w-full bg-zinc-900 p-4 rounded-xl border border-white/10" placeholder="Origen" onChange={e => setForm({...form, origen: e.target.value})} />
        <input className="w-full bg-zinc-900 p-4 rounded-xl border border-white/10" placeholder="Destino" onChange={e => setForm({...form, destino: e.target.value})} />
        <button className="w-full bg-white text-black py-4 rounded-xl font-black uppercase">Ver Precio</button>
      </form>
      {precio && <div className="mt-8 text-4xl font-black">{precio}€</div>}
    </div>
  )
}
