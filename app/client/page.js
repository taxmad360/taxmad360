'use client'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const S_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('Url. ', '').trim();
const S_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
const supabase = (S_URL && S_KEY) ? createClient(S_URL, S_KEY) : null;

export default function ClientApp() {
  const [loading, setLoading] = useState(false);
  const [orderSent, setOrderSent] = useState(false);

  const pedirTaxi = async (e) => {
    e.preventDefault();
    setLoading(true);

    const nuevoViaje = {
      origen: e.target.origen.value,
      destino: e.target.destino.value,
      precio: (Math.random() * (35 - 15) + 15).toFixed(2), // Simulación de precio
      estado_viaje: 'pendiente',
      cliente_nombre: 'Usuario Demo'
    };

    const { error } = await supabase.from('viajes').insert([nuevoViaje]);

    if (!error) {
      setOrderSent(true);
      setTimeout(() => setOrderSent(false), 5000);
      e.target.reset();
    } else {
      alert("Error al pedir taxi");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center">
      <h1 className="text-4xl font-black italic mt-10 mb-2">TAX<span className="text-[#39FF14]">MAD</span></h1>
      <p className="text-[10px] tracking-[4px] text-zinc-500 uppercase mb-12">Solicitar Vehículo</p>

      {!orderSent ? (
        <form onSubmit={pedirTaxi} className="w-full max-w-md space-y-4">
          <div className="bg-zinc-900 p-6 rounded-[30px] border border-zinc-800 shadow-xl">
            <div className="mb-6">
              <label className="text-[9px] font-bold text-[#39FF14] uppercase ml-2">Punto de Recogida</label>
              <input name="origen" required className="w-full bg-transparent border-b border-zinc-700 p-2 outline-none focus:border-[#39FF14] transition-all" placeholder="¿Dónde te recogemos?" />
            </div>
            <div>
              <label className="text-[9px] font-bold text-[#39FF14] uppercase ml-2">Destino Final</label>
              <input name="destino" required className="w-full bg-transparent border-b border-zinc-700 p-2 outline-none focus:border-[#39FF14] transition-all" placeholder="¿A dónde vas?" />
            </div>
          </div>
          
          <button type="submit" disabled={loading} className="w-full bg-[#39FF14] text-black py-5 rounded-2xl font-black text-lg shadow-[0_0_30px_rgba(57,255,20,0.2)]">
            {loading ? 'BUSCANDO CONDUCTOR...' : 'PEDIR TAXI AHORA'}
          </button>
        </form>
      ) : (
        <div className="text-center animate-bounce mt-20">
          <div className="text-6xl mb-4">🚀</div>
          <h2 className="text-2xl font-black text-[#39FF14]">¡VIAJE SOLICITADO!</h2>
          <p className="text-zinc-500 text-sm mt-2">Esperando que un conductor acepte...</p>
        </div>
      )}
    </div>
  );
}
