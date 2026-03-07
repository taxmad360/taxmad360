'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const S_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/^Url\.\s*/i, '').trim();
const S_KEY = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();
const supabase = (S_URL.startsWith('http')) ? createClient(S_URL, S_KEY) : null;

export default function DriverApp() {
  const [isConnected, setIsConnected] = useState(false);
  const [currentTrip, setCurrentTrip] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMsj, setNuevoMsj] = useState('');
  const [showChat, setShowChat] = useState(false);

  // 📡 Escuchar viajes nuevos y mensajes
  useEffect(() => {
    if (!supabase || !isConnected) return;

    const channel = supabase.channel('driver-room')
      .on('postgres_changes', { event: 'INSERT', table: 'viajes', filter: 'estado_viaje=eq.pendiente' }, 
        (payload) => { setCurrentTrip(payload.new); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [isConnected]);

  // 💬 Escuchar mensajes del viaje actual
  useEffect(() => {
    if (!supabase || !currentTrip) return;

    const msgChannel = supabase.channel(`chat-${currentTrip.id}`)
      .on('postgres_changes', { event: 'INSERT', table: 'mensajes', filter: `viaje_id=eq.${currentTrip.id}` }, 
        (payload) => { setMensajes((prev) => [...prev, payload.new]); }
      )
      .subscribe();

    return () => { supabase.removeChannel(msgChannel); };
  }, [currentTrip]);

  const enviarMensaje = async (texto) => {
    if (!texto.trim()) return;
    await supabase.from('mensajes').insert([{ 
      viaje_id: currentTrip.id, 
      remitente: 'driver', 
      contenido: texto 
    }]);
    setNuevoMsj('');
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center">
      <h1 className="text-2xl font-black mb-4">UNIDAD ACTIVA</h1>
      <h2 className="text-4xl font-black text-[#39FF14] mb-8">Administrador TaxMad</h2>

      <button 
        onClick={() => setIsConnected(!isConnected)}
        className={`px-8 py-4 rounded-xl font-bold mb-6 ${isConnected ? 'bg-[#39FF14] text-black' : 'bg-zinc-800 text-white'}`}
      >
        {isConnected ? '• ONLINE' : 'OFFLINE'}
      </button>

      {isConnected ? (
        <div className="text-center">
          <p className="animate-pulse text-zinc-400">Escaneando Servicios...</p>
          
          {currentTrip && (
            <div className="mt-10 bg-zinc-900 p-6 rounded-3xl border border-[#39FF14] animate-bounce">
              <p className="text-xs font-bold text-[#39FF14] mb-2">¡NUEVO VIAJE!</p>
              <p className="font-bold">{currentTrip.origen} → {currentTrip.destino}</p>
              <button onClick={() => setShowChat(true)} className="mt-4 bg-white text-black px-6 py-2 rounded-lg font-black text-xs">
                CHAT CON CLIENTE 💬
              </button>
            </div>
          )}
        </div>
      ) : (
        <p className="text-zinc-600">GPS en pausa</p>
      )}

      {/* --- INTERFAZ DE CHAT PARA EL CONDUCTOR --- */}
      {showChat && (
        <div className="fixed inset-0 bg-black z-[100] p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6 border-b border-zinc-800 pb-4">
            <span className="text-[#39FF14] font-black">CHAT CLIENTE</span>
            <button onClick={() => setShowChat(false)} className="text-white font-bold">X</button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4">
            {mensajes.map((m, i) => (
              <div key={i} className={`flex ${m.remitente === 'driver' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-3 rounded-xl max-w-[80%] text-sm ${m.remitente === 'driver' ? 'bg-[#39FF14] text-black' : 'bg-zinc-800'}`}>
                  {m.contenido}
                </div>
              </div>
            ))}
          </div>

          {/* MENSAJES PREDEFINIDOS PARA EL CONDUCTOR (Botones rápidos) */}
          <div className="grid grid-cols-2 gap-2 my-4">
            {["Ya estoy aquí", "5 min", "Ok!", "En la puerta"].map(txt => (
              <button key={txt} onClick={() => enviarMensaje(txt)} className="bg-zinc-900 border border-zinc-700 py-2 rounded-lg text-[10px] font-bold">
                {txt}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <input value={nuevoMsj} onChange={(e) => setNuevoMsj(e.target.value)} className="flex-1 bg-zinc-900 p-4 rounded-xl outline-none" placeholder="Escribe..." />
            <button onClick={() => enviarMensaje(nuevoMsj)} className="bg-[#39FF14] text-black px-6 rounded-xl font-black">ENVIAR</button>
          </div>
        </div>
      )}
    </div>
  )
}
