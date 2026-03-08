'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const S_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
const S_KEY = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();
const supabase = (S_URL.startsWith('http')) ? createClient(S_URL, S_KEY) : null;

export default function DriverApp() {
  const [isConnected, setIsConnected] = useState(false);
  const [currentTrip, setCurrentTrip] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMsj, setNuevoMsj] = useState('');
  const [showChat, setShowChat] = useState(false);

  // 🔔 FUNCIÓN CORREGIDA: Sonido de alerta con protección SSR
  const playAlert = () => {
    if (typeof window !== 'undefined') {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2505/2505-preview.mp3');
      audio.play().catch((err) => console.log("Audio bloqueado por el navegador hasta interacción del usuario"));
    }
  };

  // 📡 Escuchar viajes nuevos (Radar)
  useEffect(() => {
    if (!supabase || !isConnected) return;
    const channel = supabase.channel('radar-driver')
      .on('postgres_changes', { event: 'INSERT', table: 'viajes', filter: 'estado_viaje=eq.pendiente' }, 
        (payload) => { 
          setCurrentTrip(payload.new);
          playAlert(); 
        })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [isConnected]);

  // 💬 Escuchar chat
  useEffect(() => {
    if (!supabase || !currentTrip?.id) return;
    const msgChannel = supabase.channel(`chat-${currentTrip.id}`)
      .on('postgres_changes', { event: 'INSERT', table: 'mensajes', filter: `viaje_id=eq.${currentTrip.id}` }, 
        (payload) => setMensajes((prev) => [...prev, payload.new])
      ).subscribe();
    return () => { supabase.removeChannel(msgChannel); };
  }, [currentTrip]);

  const aceptarViaje = async () => {
    if (!currentTrip?.id) return;
    const { data, error } = await supabase
      .from('viajes')
      .update({ estado_viaje: 'aceptado' })
      .eq('id', currentTrip.id)
      .select()
      .single();
    if (!error) setCurrentTrip(data);
  };

  const finalizarViaje = async () => {
    if (!currentTrip?.id) return;
    await supabase.from('viajes').update({ estado_viaje: 'finalizado' }).eq('id', currentTrip.id);
    setCurrentTrip(null);
    setMensajes([]);
    setShowChat(false);
  };

  const enviarMensaje = async (texto) => {
    const msg = texto || nuevoMsj;
    if (!msg.trim() || !currentTrip?.id) return;
    await supabase.from('mensajes').insert([{ 
      viaje_id: currentTrip.id, 
      remitente: 'driver', 
      contenido: msg.trim() 
    }]);
    setNuevoMsj('');
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center w-full max-w-[414px] mx-auto font-sans">
      <header className="w-full flex justify-between items-center py-6">
        <h1 className="text-2xl font-black italic tracking-tighter text-white uppercase">
          TaxMad <span className="text-[#39FF14]">Driver</span>
        </h1>
        <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-[#39FF14] animate-pulse shadow-[0_0_15px_#39FF14]' : 'bg-red-600'}`}></div>
      </header>

      <button 
        onClick={() => setIsConnected(!isConnected)} 
        className={`w-full py-5 rounded-[24px] font-black uppercase tracking-[4px] text-[10px] transition-all duration-300 ${isConnected ? 'bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/30' : 'bg-zinc-900 text-zinc-500 border border-white/5'}`}
      >
        {isConnected ? '• Conductor Online' : 'Ir Online'}
      </button>

      <div className="w-full mt-8">
        {!currentTrip ? (
          <div className="text-center py-20 opacity-40">
            <div className="w-12 h-12 border-2 border-[#39FF14] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[9px] tracking-[4px] font-bold uppercase">Escaneando servicios...</p>
          </div>
        ) : (
          <div className="bg-zinc-900 border border-[#39FF14]/40 p-6 rounded-[32px] animate-in zoom-in duration-300 shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
            <div className="flex justify-between items-center mb-6">
              <span className="text-[10px] font-black text-[#39FF14] uppercase tracking-widest">Nuevo Viaje</span>
              <span className="text-2xl font-black text-white">{currentTrip.precio}€</span>
            </div>
            <div className="space-y-4 mb-8">
              <div>
                <p className="text-[9px] text-zinc-500 uppercase font-black">Recogida</p>
                <h3 className="font-bold text-sm">{currentTrip.origen}</h3>
              </div>
              <div className="h-[1px] bg-zinc-800 w-full"></div>
              <div>
                <p className="text-[9px] text-zinc-500 uppercase font-black">Destino</p>
                <h3 className="font-bold text-sm text-zinc-300">{currentTrip.destino}</h3>
              </div>
            </div>
            {currentTrip.estado_viaje === 'pendiente' ? (
              <button 
                onClick={aceptarViaje} 
                className="w-full bg-[#39FF14] text-black py-5 rounded-2xl font-black uppercase text-xs shadow-[0_10px_20px_rgba(57,255,20,0.2)]"
              >
                Aceptar Servicio
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => setShowChat(true)} className="flex-1 bg-white text-black py-4 rounded-xl font-black text-[10px] uppercase">Chat 💬</button>
                <button onClick={finalizarViaje} className="flex-1 bg-red-600 text-white py-4 rounded-xl font-black text-[10px] uppercase">Finalizar</button>
              </div>
            )}
          </div>
        )}
      </div>

      {showChat && (
        <div className="fixed inset-0 bg-black z-[5000] p-6 flex flex-col animate-in slide-in-from-bottom duration-300">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-black italic">MENSAJES</h2>
            <button onClick={() => setShowChat(false)} className="bg-white/10 px-4 py-2 rounded-full text-[10px] font-bold text-zinc-400">CERRAR</button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-4 no-scrollbar">
            {mensajes.map((m, i) => (
              <div key={i} className={`flex ${m.remitente === 'driver' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-4 rounded-2xl max-w-[80%] text-sm font-bold ${m.remitente === 'driver' ? 'bg-[#39FF14] text-black' : 'bg-zinc-900 text-white border border-white/10'}`}>
                  {m.contenido}
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {["Estoy llegando", "5 min", "Ok voy", "En el punto"].map(t => (
              <button key={t} onClick={() => enviarMensaje(t)} className="bg-zinc-900 text-[9px] p-3 rounded-xl font-black uppercase border border-white/5 text-[#00D1FF]">{t}</button>
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            <input 
              value={nuevoMsj} 
              onChange={(e) => setNuevoMsj(e.target.value)} 
              placeholder="Escribe..." 
              className="flex-1 bg-zinc-900 border border-white/10 p-4 rounded-xl outline-none focus:border-[#39FF14] text-white" 
            />
            <button onClick={() => enviarMensaje()} className="bg-[#39FF14] text-black px-6 rounded-xl font-black uppercase text-xs">OK</button>
          </div>
        </div>
      )}
    </div>
  )
}
