'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function DriverApp() {
  const [isConnected, setIsConnected] = useState(false);
  const [currentTrip, setCurrentTrip] = useState(null);

  useEffect(() => {
    if (!isConnected) return;
    const channel = supabase.channel('radar').on('postgres_changes', { event: 'INSERT', table: 'viajes', filter: 'estado_viaje=eq.pendiente' }, 
      (payload) => { setCurrentTrip(payload.new); new Audio('https://assets.mixkit.co/active_storage/sfx/2505/2505-preview.mp3').play(); }
    ).subscribe();
    return () => supabase.removeChannel(channel);
  }, [isConnected]);

  return (
    <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center">
      <button onClick={() => setIsConnected(!isConnected)} className={`py-5 px-10 rounded-full font-black ${isConnected ? 'bg-green-500' : 'bg-zinc-800'}`}>
        {isConnected ? 'ONLINE' : 'OFFLINE'}
      </button>
      {currentTrip && <div className="mt-10 border border-green-500 p-6 rounded-2xl">{currentTrip.origen} → {currentTrip.destino}</div>}
    </div>
  )
}
