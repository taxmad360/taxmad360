'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase';

const S_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/^Url\.\s*/i, '').trim();
const S_KEY = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();
const supabase = (S_URL.startsWith('http')) ? createClient(S_URL, S_KEY) : null;

export default function DriverApp() {
  const [isConnected, setIsConnected] = useState(false);
  const [currentTrip, setCurrentTrip] = useState(null);
  const [user, setUser] = useState(null); // Estado para el usuario logueado

  // Obtener usuario al cargar
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUser(data.user);
    });
  }, []);

  // 1. TELEMETRÍA: Envío de ubicación cada 3 min
  useEffect(() => {
    if (!user) return;

    const enviarUbicacion = () => {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;
        await supabase.from('ubicaciones').upsert({
          user_id: user.id,
          latitud: latitude,
          longitud: longitude,
          updated_at: new Date().toISOString()
        });
      }, (err) => console.error("Error GPS:", err));
    };

    enviarUbicacion();
    const interval = setInterval(enviarUbicacion, 180000); // 3 minutos
    return () => clearInterval(interval);
  }, [user]);

  // 2. FETCH INICIAL: Buscar viajes pendientes
  useEffect(() => {
    if (!isConnected || !supabase) return;
    const fetchViajes = async () => {
      const { data } = await supabase.from('viajes').select('*').eq('estado_viaje', 'pendiente').single();
      if (data) setCurrentTrip(data);
    };
    fetchViajes();
  }, [isConnected]);

  // 3. ACEPTAR VIAJE
  const aceptarViaje = async () => {
    const { data, error } = await supabase
      .from('viajes')
      .update({ estado_viaje: 'aceptado', driver_id: user.id })
      .eq('id', currentTrip.id)
      .select()
      .single();

    if (!error) setCurrentTrip(data);
    else alert("Error al aceptar: " + error.message);
  };

  // 4. FINALIZAR VIAJE
  const finalizarViaje = async () => {
    const { error } = await supabase
      .from('viajes')
      .update({ 
        estado_viaje: 'finalizado',
        fecha_finalizado: new Date().toISOString()
      })
      .eq('id', currentTrip.id);

    if (!error) {
      setCurrentTrip(null);
      alert("Viaje finalizado con éxito.");
    }
  };

  // 5. Escuchar viajes nuevos
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
        <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-neon-green shadow-[0_0_10px_#39FF14]' : 'bg-red-600'}`}></div>
      </header>

      <button onClick={() => setIsConnected(!isConnected)} className="btn-main mb-10">
        {isConnected ? '• Unidad Online' : 'Ir Online'}
      </button>

      {isConnected && (
        <div className="w-full">
          {!currentTrip ? (
            <div className="card-txmd text-center py-20 text-zinc-500">Escaneando servicios...</div>
          ) : (
            <div className="card-txmd border-neon-green animate-in fade-in space-y-4">
              <h3 className="text-xl font-bold">{currentTrip.origen} ➔ {currentTrip.destino}</h3>
              
              <div className="flex gap-4">
                <div className="flex-1 bg-zinc-900 p-3 rounded-xl">
                  <p className="text-[9px] text-zinc-500 uppercase">Precio</p>
                  <p className="font-black text-neon-green">{currentTrip.precio} €</p>
                </div>
                <div className="flex-1 bg-zinc-900 p-3 rounded-xl">
                  <p className="text-[9px] text-zinc-500 uppercase">Distancia</p>
                  <p className="font-black text-white">{Number(currentTrip.km).toFixed(1)} km</p>
                </div>
              </div>

              {currentTrip.estado_viaje === 'pendiente' ? (
                <button onClick={aceptarViaje} className="w-full bg-neon-green text-black py-4 rounded-xl font-black uppercase">
                  Aceptar Viaje
                </button>
              ) : (
                <button onClick={finalizarViaje} className="w-full bg-neon-blue text-black py-4 rounded-xl font-black uppercase">
                  Finalizar Viaje
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
