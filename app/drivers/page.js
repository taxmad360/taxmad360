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

  // Escuchar viajes nuevos (Radar)
  useEffect(() => {
    if (!supabase || !isConnected) return;
    const channel = supabase.channel('radar-driver')
      .on('postgres_changes', { event: 'INSERT', table: 'viajes', filter: 'estado_viaje=eq.pendiente' }, 
        (payload) => { setCurrentTrip(payload.new); }
      ).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [isConnected]);

  // Escuchar mensajes en tiempo real
  useEffect(() => {
    if (!supabase || !currentTrip) return;
    const msgChannel = supabase.channel(`chat-${currentTrip.id}`)
      .on('postgres_changes', { event: 'INSERT', table: 'mensajes', filter: `viaje_id=eq.${currentTrip.id}` }, 
        (payload) => { setMensajes((prev) => [...prev, payload.new]); }
      ).subscribe();
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
    <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center w-full max-w-[414px] mx-auto">
      <header className="w-full flex justify-between items-center py-6">
        <h1 className="header-gradient text-2xl italic tracking-tighter">TAXMAD DRIVER</h1>
        <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-neon-green shadow-[0_0_10px_#39FF14]' : 'bg-red-600'}`}></div>
      </header>

      <button 
        onClick={() => setIsConnected(!isConnected)}
        className={`btn-main mb-10 ${!isConnected ? '!bg-zinc-800 !text-zinc-500 !shadow-none' : ''}`}
      >
        {isConnected ? '• Unidad Online' : 'Ir Online'}
      </button>

      {isConnected ? (
        <div className="w-full space-y-6">
          {!currentTrip ? (
            <div className="card-txmd text-center py-20">
              <div className="w-16 h-16 border-4 border-neon-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest">Escaneando Servicios...</p>
            </div>
          ) : (
            <div className="card-txmd animate-in fade-in zoom-in duration-500 border-neon-green">
              <span className="text-neon-green text-[9px] font-black uppercase tracking-widest">Nuevo Viaje Disponible</span>
              <h3 className="text-xl font-bold mt-2">{currentTrip.origen}</h3>
              <p className="text-zinc-500 text-xs mb-6">Hacia: {currentTrip.destino}</p>
              
              <div className="flex gap-2">
                <button onClick={() => setShowChat(true)} className="flex-1 bg-white text-black py-3 rounded-xl font-bold text-xs">CHAT CLIENTE 💬</button>
                <button className="flex-1 bg-neon-blue text-black py-3 rounded-xl font-bold text-xs">MAPA 📍</button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className="text-zinc-700 font-bold uppercase text-xs tracking-[4px] mt-20">GPS en Pausa</p>
      )}

      {/* MODAL DE CHAT PREMIUM */}
      {showChat && (
        <div className="fixed inset-0 bg-black z-[5000] p-6 flex flex-col animate-in slide-in-from-bottom duration-300">
          <div className="flex justify-between items-center mb-8">
            <h2 className="header-gradient text-xl">Mensajes Directos</h2>
            <button onClick={() => setShowChat(false)} className="text-white text-xs font-bold uppercase opacity-50">Cerrar</button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 no-scrollbar">
            {mensajes.map((m, i) => (
              <div key={i} className={`flex ${m.remitente === 'driver' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-4 rounded-2xl max-w-[85%] text-sm font-bold ${m.remitente === 'driver' ? 'bg-neon-green text-black' : 'bg-zinc-900 text-white border border-zinc-800'}`}>
                  {m.contenido}
                </div>
              </div>
            ))}
          </div>

          {/* MENSAJES PREDEFINIDOS */}
          <div className="grid grid-cols-2 gap-2 py-4">
            {["Ya estoy aquí", "5 min más", "Ok", "En la puerta"].map(t => (
              <button key={t} onClick={() => enviarMensaje(t)} className="bg-zinc-900 border border-zinc-800 py-3 rounded-xl text-[10px] font-bold text-neon-blue">{t}</button>
            ))}
          </div>

          <div className="flex gap-2 mt-2">
            <input 
              value={nuevoMsj} 
              onChange={(e) => setNuevoMsj(e.target.value)} 
              placeholder="Escribe un mensaje..." 
              className="input-auth flex-1 !mb-0" 
            />
            <button onClick={() => enviarMensaje(nuevoMsj)} className="bg-neon-blue text-black px-6 rounded-xl font-black text-xs uppercase">Enviar</button>
          </div>
        </div>
      )}
    </div>
  )
}
