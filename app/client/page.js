'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const S_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('Url. ', '').trim();
const S_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
const supabase = (S_URL && S_KEY) ? createClient(S_URL, S_KEY) : null;

export default function ClientApp() {
  const [loading, setLoading] = useState(false);
  const [viajeActivo, setViajeActivo] = useState(null);
  const [driverAsignado, setDriverAsignado] = useState(null);

  // ESCUCHA EN TIEMPO REAL: ¿Han aceptado mi viaje?
  useEffect(() => {
    if (!supabase || !viajeActivo) return;

    const channel = supabase
      .channel(`seguimiento-${viajeActivo.id}`)
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'viajes', filter: `id=eq.${viajeActivo.id}` }, 
        async (payload) => {
          if (payload.new.estado_viaje === 'aceptado') {
            // Si lo aceptan, buscamos el nombre del conductor
            const { data: d } = await supabase
              .from('drivers')
              .select('nombre')
              .eq('id', payload.new.driver_id)
              .single();
            
            setDriverAsignado(d?.nombre || 'TaxMad Driver');
            setViajeActivo(payload.new);
            if (navigator.vibrate) navigator.vibrate(200);
          }
          if (payload.new.estado_viaje === 'finalizado') {
            alert("¡Has llegado a tu destino!");
            setViajeActivo(null);
            setDriverAsignado(null);
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [viajeActivo]);

  const pedirTaxi = async (e) => {
    e.preventDefault();
    setLoading(true);

    const nuevoViaje = {
      origen: e.target.origen.value,
      destino: e.target.destino.value,
      precio: (Math.random() * (35 - 15) + 15).toFixed(2),
      estado_viaje: 'pendiente',
      cliente_nombre: 'Usuario Demo'
    };

    const { data, error } = await supabase.from('viajes').insert([nuevoViaje]).select().single();

    if (!error) {
      setViajeActivo(data);
    } else {
      alert("Error al solicitar el servicio");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center font-sans">
      <h1 className="text-4xl font-black italic mt-10 mb-2 tracking-tighter">TAX<span className="text-[#39FF14]">MAD</span></h1>
      
      {!viajeActivo ? (
        <>
          <p className="text-[10px] tracking-[4px] text-zinc-500 uppercase mb-12 italic font-bold">Reserva Premium</p>
          <form onSubmit={pedirTaxi} className="w-full max-w-md space-y-4 animate-in fade-in duration-500">
            <div className="bg-zinc-900 p-8 rounded-[35px] border border-zinc-800 shadow-2xl space-y-6">
              <div>
                <label className="text-[9px] font-black text-[#39FF14] uppercase tracking-widest ml-1">Recogida</label>
                <input name="origen" required className="w-full bg-transparent border-b border-zinc-800 p-3 outline-none focus:border-[#39FF14] transition-all font-bold" placeholder="¿Dónde estás?" />
              </div>
              <div>
                <label className="text-[9px] font-black text-[#39FF14] uppercase tracking-widest ml-1">Destino</label>
                <input name="destino" required className="w-full bg-transparent border-b border-zinc-800 p-3 outline-none focus:border-[#39FF14] transition-all font-bold" placeholder="¿A dónde vamos?" />
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-[#39FF14] text-black py-6 rounded-[25px] font-black text-lg shadow-[0_10px_40px_rgba(57,255,20,0.2)] active:scale-95 transition-all">
              {loading ? 'SOLICITANDO...' : 'SOLICITAR TAXMAD'}
            </button>
          </form>
        </>
      ) : (
        <div className="w-full max-w-md mt-10 animate-in zoom-in duration-500">
          <div className="bg-zinc-900 border-2 border-[#39FF14] rounded-[40px] p-10 text-center relative overflow-hidden">
            {/* Animación de escaneo si no hay conductor */}
            {!driverAsignado && (
              <div className="absolute top-0 left-0 w-full h-1 bg-[#39FF14] animate-pulse opacity-50"></div>
            )}
            
            <div className="text-5xl mb-6">{driverAsignado ? '🚕' : '📡'}</div>
            
            <h2 className="text-2xl font-black mb-2 uppercase italic tracking-tighter">
              {driverAsignado ? '¡Conductor en camino!' : 'Buscando Vehículo...'}
            </h2>
            
            <p className="text-zinc-500 text-sm mb-8">
              {driverAsignado 
                ? `${driverAsignado} ha aceptado tu servicio y llegará en breve.` 
                : 'Estamos notificando a las unidades más cercanas a tu zona.'}
            </p>

            <div className="bg-black/50 rounded-3xl p-6 border border-zinc-800 inline-block w-full">
              <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-[3px] mb-2">Detalles del viaje</p>
              <p className="font-bold text-white text-sm">{viajeActivo.origen} → {viajeActivo.destino}</p>
              <p className="text-[#39FF14] font-black text-xl mt-3">{viajeActivo.precio}€</p>
            </div>

            {driverAsignado && (
              <button className="mt-8 w-full bg-white text-black py-4 rounded-2xl font-black text-xs uppercase tracking-widest">
                Contactar Conductor
              </button>
            )}
            
            <button 
              onClick={() => setViajeActivo(null)} 
              className="mt-6 text-[9px] text-zinc-700 font-bold uppercase tracking-widest hover:text-white transition-all"
            >
              Cancelar Solicitud
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
}
