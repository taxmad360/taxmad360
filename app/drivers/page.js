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

  // 1. FETCH INICIAL: Buscar viajes pendientes
  useEffect(() => {
    if (!isConnected || !supabase) return;
    const fetchViajes = async () => {
      const { data } = await supabase.from('viajes').select('*').eq('estado_viaje', 'pendiente').single();
      if (data) setCurrentTrip(data);
    };
    fetchViajes();
  }, [isConnected]);

  // 2. ACEPTAR VIAJE
  const aceptarViaje = async () => {
    const { data, error } = await supabase
      .from('viajes')
      .update({ estado_viaje: 'aceptado' }) // Aquí podrías añadir driver_id: auth.user().id
      .eq('id', currentTrip.id)
      .select()
      .single();

    if (!error) setCurrentTrip(data);
    else alert("Error al aceptar: " + error.message);
  };

  // 3. Escuchar viajes nuevos
  useEffect(() => {
    if (!supabase || !isConnected) return;
    const channel = supabase.channel('radar-driver')
      .on('postgres_changes', { event: 'INSERT', table: 'viajes', filter: 'estado_viaje=eq.pendiente' }, 
        (payload) => setCurrentTrip(payload.new)
      ).subscribe();
    return () => supabase.removeChannel(channel);
  }, [isConnected]);

  return (
    <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center w-full max-w-[414px] mx-auto">
      <header className="w-full flex justify-between items-center py-6">
        <h1 className="header-gradient text-2xl italic tracking-tighter">TAXMAD DRIVER</h1>
        <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-neon-green' : 'bg-red-600'}`}></div>
      </header>

      <button onClick={() => setIsConnected(!isConnected)} className="btn-main mb-10">
        {isConnected ? '• Unidad Online' : 'Ir Online'}
      </button>

      {isConnected && (
        <div className="w-full">
          {!currentTrip ? (
            <div className="card-txmd text-center py-20 text-zinc-500">Escaneando servicios...</div>
          ) : (
            <div className="card-txmd border-neon-green animate-in fade-in">
              <h3 className="text-xl font-bold">{currentTrip.origen} ➔ {currentTrip.destino}</h3>
              <p className="text-[10px] text-zinc-500 mb-6 uppercase">Estado: {currentTrip.estado_viaje}</p>
              
              {currentTrip.estado_viaje === 'pendiente' ? (
                <button onClick={aceptarViaje} className="w-full bg-neon-green text-black py-4 rounded-xl font-black uppercase">
                  Aceptar Viaje
                </button>
              ) : (
                <p className="text-neon-green font-bold text-center">Viaje en curso ✅</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
