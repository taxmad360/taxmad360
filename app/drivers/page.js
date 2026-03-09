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

  // FETCH INICIAL: Buscar viajes pendientes al entrar o al conectar
  useEffect(() => {
    if (!isConnected) return;

    const fetchViajesPendientes = async () => {
      const { data, error } = await supabase
        .from('viajes')
        .select('*')
        .eq('estado_viaje', 'pendiente')
        .single(); // Trae el primero que encuentre

      if (!error && data) {
        setCurrentTrip(data);
      }
    };

    fetchViajesPendientes();
  }, [isConnected]);

  // Escuchar viajes nuevos (Radar en tiempo real)
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
    // ... (Tu código de UI sigue siendo igual)
    <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center w-full max-w-[414px] mx-auto">
      {/* Tu estructura de UI se mantiene exactamente como la tenías */}
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
    </div>
  )
}
