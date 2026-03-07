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
  const [isListening, setIsListening] = useState(null); // 'origen' o 'destino'

  // --- LÓGICA DE DICTADO POR VOZ ---
  const handleDictado = (campo) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Tu navegador no soporta dictado por voz.");

    const recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.start();
    setIsListening(campo);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      document.getElementsByName(campo)[0].value = transcript;
      setIsListening(null);
    };

    recognition.onerror = () => setIsListening(null);
    recognition.onend = () => setIsListening(null);
  };

  // --- ESCUCHA EN TIEMPO REAL ---
  useEffect(() => {
    if (!supabase || !viajeActivo) return;
    const channel = supabase
      .channel(`seguimiento-${viajeActivo.id}`)
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'viajes', filter: `id=eq.${viajeActivo.id}` }, 
        async (payload) => {
          if (payload.new.estado_viaje === 'aceptado') {
            const { data: d } = await supabase.from('drivers').select('nombre').eq('id', payload.new.driver_id).single();
            setDriverAsignado(d?.nombre || 'TaxMad Driver');
            setViajeActivo(payload.new);
          }
          if (payload.new.estado_viaje === 'finalizado') {
            alert("¡Has llegado!");
            setViajeActivo(null); setDriverAsignado(null);
          }
        }
      ).subscribe();
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
    if (!error) setViajeActivo(data);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center font-sans">
      <h1 className="text-4xl font-black italic mt-10 mb-2 tracking-tighter">TAX<span className="text-[#39FF14]">MAD</span></h1>
      
      {!viajeActivo ? (
        <>
          <p className="text-[10px] tracking-[4px] text-zinc-500 uppercase mb-12 italic font-bold">Reserva Premium</p>
          <form onSubmit={pedirTaxi} className="w-full max-w-md space-y-4">
            <div className="bg-zinc-900 p-8 rounded-[35px] border border-zinc-800 shadow-2xl space-y-8">
              {/* CAMPO ORIGEN */}
              <div className="relative">
                <label className="text-[9px] font-black text-[#39FF14] uppercase tracking-widest ml-1">Recogida</label>
                <div className="flex items-center gap-2">
                  <input name="origen" required className="flex-1 bg-transparent border-b border-zinc-800 p-3 outline-none focus:border-[#39FF14] transition-all font-bold" placeholder="¿Dónde estás?" />
                  <button type="button" onClick={() => handleDictado('origen')} className={`p-3 rounded-full ${isListening === 'origen' ? 'bg-red-500 animate-pulse' : 'bg-zinc-800 text-[#39FF14]'}`}>
                    🎤
                  </button>
                </div>
              </div>
              {/* CAMPO DESTINO */}
              <div className="relative">
                <label className="text-[9px] font-black text-[#39FF14] uppercase tracking-widest ml-1">Destino</label>
                <div className="flex items-center gap-2">
                  <input name="destino" required className="flex-1 bg-transparent border-b border-zinc-800 p-3 outline-none focus:border-[#39FF14] transition-all font-bold" placeholder="¿A dónde vamos?" />
                  <button type="button" onClick={() => handleDictado('destino')} className={`p-3 rounded-full ${isListening === 'destino' ? 'bg-red-500 animate-pulse' : 'bg-zinc-800 text-[#39FF14]'}`}>
                    🎤
                  </button>
                </div>
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-[#39FF14] text-black py-6 rounded-[25px] font-black text-lg shadow-[0_10px_40px_rgba(57,255,20,0.2)]">
              {loading ? 'SOLICITANDO...' : 'SOLICITAR TAXMAD'}
            </button>
          </form>
        </>
      ) : (
        /* ... (Mantenemos la vista de Conductor Asignado igual que antes) ... */
        <div className="w-full max-w-md mt-10 text-center animate-in zoom-in duration-500">
           <div className="bg-zinc-900 border-2 border-[#39FF14] rounded-[40px] p-10">
              <div className="text-5xl mb-6">{driverAsignado ? '🚕' : '📡'}</div>
              <h2 className="text-2xl font-black mb-2 italic uppercase">{driverAsignado ? '¡En camino!' : 'Buscando...'}</h2>
              <p className="text-zinc-500 text-sm mb-6">{driverAsignado ? `${driverAsignado} está llegando.` : 'Notificando unidades...'}</p>
              <div className="bg-black/50 p-4 rounded-2xl border border-zinc-800 mb-6 font-bold text-xs uppercase tracking-widest">
                {viajeActivo.origen} → {viajeActivo.destino}
              </div>
              <button onClick={() => setViajeActivo(null)} className="text-[9px] text-zinc-700 font-bold uppercase tracking-widest">Cancelar</button>
           </div>
        </div>
      )}
    </div>
  );
}
