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

  // 🔔 Sonido de alerta para nuevos viajes
  const playAlert = () => {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2505/2505-preview.mp3');
    audio.play().catch(() => console.log("Audio esperando interacción"));
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
    if (!supabase || !currentTrip) return;
    const msgChannel = supabase.channel(`chat-${currentTrip.id}`)
      .on('postgres_changes', { event: 'INSERT', table: 'mensajes', filter: `viaje_id=eq.${currentTrip.id}` }, 
        (payload) => setMensajes((prev) => [...prev, payload.new])
      ).subscribe();
    return () => { supabase.removeChannel(msgChannel); };
  }, [currentTrip]);

  const aceptarViaje = async () => {
    const { data, error } = await supabase.from('viajes').update({ estado_viaje: 'aceptado' }).eq('id', currentTrip.id).select().single();
    if (!error) setCurrentTrip(data);
  };

  const finalizarViaje = async () => {
    await supabase.from('viajes').update({ estado_viaje: 'finalizado' }).eq('id', currentTrip.id);
    setCurrentTrip(null);
    setMensajes([]);
  };

  const enviarMensaje = async (texto) => {
    const msg = texto || nuevoMsj;
    if (!msg.trim()) return;
    await supabase.from('mensajes').insert([{ viaje_id: currentTrip.id, remitente: 'driver', contenido: msg }]);
    setNuevoMsj('');
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center w-full max-w-[414px] mx-auto font-sans">
      <header className="w-full flex justify-between items-center py-6">
        <h1 className="text-2xl font-black italic tracking-tighter text-white">TAXMAD <span className="text-[#39FF14]">DRIVER</span></h1>
        <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-[#39FF14] animate-pulse shadow-[0_0_15px_#39FF14]' : 'bg-red-600'}`}></div>
      </header>

      <button onClick={() => setIsConnected(!isConnected)} className={`w-full py-5 rounded-[24px] font-black uppercase tracking-[4px] text-[10px] transition-all ${isConnected ? 'bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/30' : 'bg-zinc-900 text-zinc-500'}`}>
        {isConnected ? '• ONLINE' : 'IR A TRABAJAR'}
      </button>

      <div className="w-full mt-8">
        {!currentTrip ? (
          <div className="text-center py-20 opacity-40">
            <div className="w-12 h-12 border-2 border-[#39FF14] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[9px] tracking-[4px] font-bold">BUSCANDO SERVICIOS...</p>
          </div>
        ) : (
          <div className="bg-zinc-900 border border-[#39FF14] p-6 rounded-[32px] animate-in zoom-in">
            <div className="flex justify-between items-center mb-6">
              <span className="text-[10px] font-black text-[#39FF14] uppercase tracking-widest">Viaje Entrante</span>
              <span className="text-xl font-black">{currentTrip.precio}€</span>
            </div>
            <div className="space-y-4 mb-6">
              <div><p className="text-[9px] text-zinc-500 uppercase">Desde</p><h3 className="font-bold">{currentTrip.origen}</h3></div>
              <div><p className="text-[9px] text-zinc-500 uppercase">Hacia</p><h3 className="font-bold text-zinc-300">{currentTrip.destino}</h3></div>
            </div>
            {currentTrip.estado_viaje === 'pendiente' ? (
              <button onClick={aceptarViaje} className="w-full bg-[#39FF14] text-black py-4 rounded-xl font-black uppercase text-xs">Aceptar</button>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => setShowChat(true)} className="flex-1 bg-white text-black py-4 rounded-xl font-black text-[10px] uppercase">Chat</button>
                <button onClick={finalizarViaje} className="flex-1 bg-red-600 text-white py-4 rounded-xl font-black text-[10px] uppercase">Cerrar</button>
              </div>
            )}
          </div>
        )}
      </div>

      {showChat && (
        <div className="fixed inset-0 bg-black z-[5000] p-6 flex flex-col">
          <button onClick={() => setShowChat(false)} className="self-end text-[10px] font-bold text-zinc-500 mb-6">CERRAR</button>
          <div className="flex-1 overflow-y-auto space-y-4">
            {mensajes.map((m, i) => (
              <div key={i} className={`flex ${m.remitente === 'driver' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-4 rounded-2xl max-w-[80%] text-sm ${m.remitente === 'driver' ? 'bg-[#39FF14] text-black' : 'bg-zinc-900 text-white border border-white/10'}`}>
                  {m.contenido}
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {["Estoy llegando", "5 min", "Ok"].map(t => <button key={t} onClick={() => enviarMensaje(t)} className="bg-zinc-900 text-[10px] p-3 rounded-lg font-bold border border-white/5">{t}</button>)}
          </div>
        </div>
      )}
    </div>
  )
}
