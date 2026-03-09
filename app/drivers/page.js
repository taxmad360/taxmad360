"use client";
import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function DriversPage() {
  const supabase = createClientComponentClient();
  const [user, setUser] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [gpsStatus, setGpsStatus] = useState("Iniciando GPS...");

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUser(user);
    };
    getUser();
  }, [supabase]);

  useEffect(() => {
    if (!user || !isConnected) return;

    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        setGpsStatus("Transmitiendo ubicación...");
        const { latitude: lat, longitude: lng } = position.coords;

        // ACTUALIZACIÓN CRÍTICA: Enviamos la posición a Supabase
        const { error } = await supabase
          .from("conductores")
          .update({ 
            last_lat: lat, 
            last_lng: lng, 
            last_update: new Date().toISOString() 
          })
          .eq("id", user.id);

        if (error) console.error("Error GPS Sync:", error.message);
      },
      (error) => setGpsStatus("Error de señal GPS"),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [user, isConnected, supabase]);

  const toggleOnlineStatus = async () => {
    if (!user) return alert("Debes iniciar sesión");
    const nuevoEstado = !isConnected;
    
    const { error } = await supabase
      .from("conductores")
      .update({ online: nuevoEstado })
      .eq("id", user.id);

    if (!error) setIsConnected(nuevoEstado);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-6">
      <h1 className="text-4xl font-black mb-8 italic text-[#39FF14]">TAX<span className="text-white">MAD</span></h1>
      <div className="bg-zinc-900 p-8 rounded-[2rem] border border-white/10 w-full max-w-sm text-center shadow-2xl">
        <div className="flex justify-between items-center mb-10">
          <span className="font-bold text-zinc-400">ESTADO</span>
          <div className={`h-3 w-3 rounded-full animate-pulse ${isConnected ? 'bg-[#39FF14]' : 'bg-red-500'}`} />
        </div>
        
        <p className="text-sm font-mono text-zinc-500 mb-10 uppercase tracking-widest">{gpsStatus}</p>

        <button
          onClick={toggleOnlineStatus}
          className={`w-full p-6 rounded-2xl font-black text-lg transition-all transform active:scale-95 ${
            isConnected ? "bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)]" : "bg-[#39FF14] text-black shadow-[0_0_20px_rgba(57,255,20,0.4)]"
          }`}
        >
          {isConnected ? "DESCONECTAR" : "INICIAR TURNO"}
        </button>
      </div>
    </div>
  );
}
