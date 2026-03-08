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

  // 🔔 Función para sonido de alerta
  const playAlert = () => {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2505/2505-preview.mp3');
    audio.play().catch(() => console.log("Esperando interacción para audio"));
  };

  // 📡 Escuchar viajes nuevos (Radar)
  useEffect(() => {
    if (!supabase || !isConnected) return;
    
    const channel = supabase.channel('radar-driver')
      .on('postgres_changes', { 
        event: 'INSERT', 
        table: 'viajes', 
        filter: 'estado_viaje=eq.pendiente' 
      }, (payload) => { 
        setCurrentTrip(payload.new);
        playAlert(); // Suena cuando entra un servicio
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [isConnected]);

  // 💬 Escuchar mensajes en tiempo real
  useEffect(() => {
    if (!supabase || !currentTrip) return;
    const msgChannel = supabase.channel(`chat-${currentTrip.id}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        table: 'mensajes', 
        filter: `viaje_id=eq.${currentTrip.id}` 
      }, (payload) => { 
        setMensajes((prev) => [...prev, payload.new]);
      }).subscribe();

    return () => { supabase.removeChannel(msgChannel); };
  }, [currentTrip]);

  const aceptarViaje = async () => {
    const { data, error } = await supabase
      .from('viajes')
      .update({ estado_viaje: 'aceptado' })
      .eq('id', currentTrip.id)
      .select()
      .single();
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
    await supabase.from('mensajes').insert([{ 
      viaje_id: currentTrip.id, 
      remitente: 'driver', 
      contenido: msg 
    }]);
    setNuevoMsj('');
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center w-full max-w-[414px] mx-auto font-sans">
      <header className="w-full flex justify-between items-center py-6">
        <h1 className="text-2xl italic font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-[#39FF14] to-white">TAXMAD <span className="text-[10px] not-italic align-top border border-[#39FF14] px-1 rounded">DRIVER</span></h1>
        <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-[#39FF14] animate-pulse shadow-[0_0_15px_#39FF14]' : 'bg-red-600'}`}></div>
      </header>

      <button 
        onClick={() => setIsConnected(!isConnected)}
        className={`w-full py-5 rounded-[24px] font-black uppercase tracking-[4px] text-[10px] transition-all duration-500 ${isConnected ? 'bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/30' : 'bg-zinc-900 text-zinc-500 border border-white/5 shadow-none'}`}
      >
        {isConnected ? '• UNIDAD EN SERVICIO' : 'IR AL TRABAJO'}
      </button>

      <div className="w-full mt-10">
        {isConnected ? (
          <div className="w-full">
            {!currentTrip ? (
              <div className="bg-zinc-900/30 border border-white/5 rounded-[40px] text-center py-24">
                <div className="relative w-20 h-20 mx-auto mb-6">
                   <div className="absolute inset-0 border-4 border-[#39FF14]/20 rounded-full"></div>
                   <div className="absolute inset-0 border-4 border-[#39FF14] border-t-transparent rounded-full animate-spin"></div>
                </div>
                <p className="text-zinc-500 font-bold uppercase text-[9px] tracking-[5px] animate-pulse">Buscando Clientes</p>
              </div>
            ) : (
              <div className="bg-[#0f0f0f] border-2 border-[#39FF14] p-8 rounded-[40px] animate-in zoom-in duration-300">
                <div className="flex justify-between items-start mb-6">
                  <span className="bg-[#39FF14] text-black text-[9px] font-black px-3 py-1 rounded-full uppercase">Servicio Disponible</span>
                  <span className="text-2xl font-black text-white">{currentTrip.precio}€</span>
                </div>
                
                <div className="space-y-4 mb-8">
                  <div>
                    <p className="text-[9px] text-zinc-500 uppercase font-black">Recogida</p>
                    <h3 className="text-lg font-bold leading-tight">{currentTrip.origen}</h3>
                  </div>
                  <div className="border-l-2 border-dashed border-zinc-800 ml-1 py-1 h-4"></div>
                  <div>
                    <p className="text-[9px] text-zinc-500 uppercase font-black">Destino</p>
                    <h3 className="text-lg font-bold text-zinc-300">{currentTrip.destino}</h3>
                  </div>
                </div>

                {currentTrip.estado_viaje === 'pendiente' ? (
                  <button onClick={aceptarViaje} className="w-full bg-[#39FF14] text-black py-5 rounded-[20px] font-black uppercase text-xs shadow-[0_10px_30px_rgba(57,255,20,0.2)]">ACEPTAR VIAJE</button>
                ) : (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <button onClick={() => setShowChat(true)} className="flex-1 bg-zinc-800 text-white py-4 rounded-xl font-bold text-[10px] uppercase">CHAT 💬</button>
                      <button className="flex-1 bg-[#00D1FF] text-black py-4 rounded-xl font-bold text-[10px] uppercase">Waze / Maps 📍</button>
                    </div>
                    <button onClick={finalizarViaje} className="w-full bg-white text-black py-4 rounded-xl font-black uppercase text-[10px]">FINALIZAR SERVICIO</button>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-20">
             <p className="text-zinc-700 font-black uppercase text-xs tracking-[8px]">FUERA DE LÍNEA</p>
          </div>
        )}
      </div>

      {/* CHAT MODAL DRIVER */}
      {showChat && (
        <div className="fixed inset-0 bg-black z-[5000] p-6 flex flex-col animate-in slide-in-from-bottom">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-black italic">COMUNICACIÓN <span className="text-[#39FF14]">CLIENTE</span></h2>
            <button onClick={() => setShowChat(false)} className="bg-white/5 px-4 py-2 rounded-full text-[9px] font-black uppercase">Cerrar</button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 no-scrollbar pb-4">
            {mensajes.map((m, i) => (
              <div key={i} className={`flex ${m.remitente === 'driver' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-4 rounded-[20px] max-w-[85%] text-sm font-bold ${m.remitente === 'driver' ? 'bg-[#39FF14] text-black' : 'bg-zinc-900 text-white border border-white/5'}`}>
                  {m.contenido}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2 mb-4">
            {["Estoy llegando", "5 minutos", "Ok recibido", "En el punto"].map(t => (
              <button key={t} onClick={() => enviarMensaje(t)} className="bg-zinc-900 border border-white/5 py-3 rounded-xl text-[9px] font-bold text-[#00D1FF] uppercase">{t}</button>
            ))}
          </div>

          <div className="flex gap-2">
            <input 
              value={nuevoMsj} 
              onChange={(e) => setNuevoMsj(e.target.value)} 
              placeholder="Escribe al cliente..." 
              className="flex-1 bg-zinc-900 border border-white/10 p-4 rounded-xl outline-none focus:border-[#39FF14] text-sm" 
            />
            <button onClick={() => enviarMensaje()} className="bg-[#00D1FF] text-black px-6 rounded-xl font-black uppercase text-[10px]">OK</button>
          </div>
        </div>
      )}
    </div>
  )
}
