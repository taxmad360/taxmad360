'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

// --- INICIALIZACIÓN SEGURA ---
const S_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const S_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = (S_URL && S_KEY) ? createClient(S_URL, S_KEY) : null;

export default function DriverTerminal() {
  const [driver, setDriver] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [view, setView] = useState('login');
  const [activeTrip, setActiveTrip] = useState(null); // Para la tarjeta de viaje nuevo

  // 1. PERSISTENCIA DE SESIÓN
  useEffect(() => {
    const saved = localStorage.getItem('txmd_driver');
    if (saved) {
      try {
        setDriver(JSON.parse(saved));
        setView('panel');
      } catch (e) {
        localStorage.removeItem('txmd_driver');
      }
    }
  }, []);

  // 2. ESCUCHA DE VIAJES EN TIEMPO REAL (REALTIME)
  useEffect(() => {
    if (!supabase || !isConnected || !driver) return;

    const channel = supabase
      .channel('nuevos-viajes')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'viajes', filter: `estado_viaje=eq.pendiente` }, 
        (payload) => {
          // Alertar al conductor
          if (navigator.vibrate) navigator.vibrate([500, 200, 500, 200, 500]);
          const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');
          audio.play().catch(() => console.log("Esperando interacción para sonido"));

          // Mostrar tarjeta de viaje
          setActiveTrip(payload.new);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [isConnected, driver]);

  // 3. LÓGICA DE LOGIN
  const intentarLogin = async (e) => {
    e.preventDefault();
    if (!supabase) return alert("Error de configuración");
    const u = e.target.user.value;
    const p = e.target.pass.value;

    const { data: d } = await supabase.from('drivers').select('*').eq('usuario', u).single();

    if (d && d.password === p) {
      setDriver(d);
      setView('panel');
      localStorage.setItem('txmd_driver', JSON.stringify(d));
    } else {
      alert("Acceso denegado");
    }
  };

  // 4. CAMBIAR ESTADO (ONLINE/OFFLINE)
  const toggleStatus = async () => {
    if (!driver || !supabase) return;
    const newStatus = !isConnected;
    await supabase.from('drivers').update({ estado: newStatus ? 'activo' : 'inactivo' }).eq('id', driver.id);
    setIsConnected(newStatus);
  };

  // 5. ACEPTAR VIAJE
  const aceptarViaje = async () => {
    if (!activeTrip || !supabase) return;
    
    const { error } = await supabase
      .from('viajes')
      .update({ 
        estado_viaje: 'aceptado', 
        driver_id: driver.id 
      })
      .eq('id', activeTrip.id);

    if (!error) {
      alert("✅ VIAJE ACEPTADO. Dirígete al origen.");
      setActiveTrip(null);
      // Aquí podrías redirigir a una vista de "Viaje en curso"
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 font-sans overflow-hidden">
      
      {/* LOGIN VIEW */}
      {view === 'login' ? (
        <div className="max-w-md mx-auto pt-24 text-center">
          <h1 className="text-5xl font-black italic tracking-tighter mb-2">TAX<span className="text-[#39FF14]">MAD</span></h1>
          <p className="text-[10px] tracking-[5px] text-zinc-500 mb-12 uppercase">Terminal Oficial</p>
          <form onSubmit={intentarLogin} className="space-y-4">
            <input name="user" className="w-full bg-zinc-900 border border-zinc-800 p-5 rounded-2xl focus:border-[#39FF14] outline-none" placeholder="ID Conductor" required />
            <input name="pass" type="password" className="w-full bg-zinc-900 border border-zinc-800 p-5 rounded-2xl focus:border-[#39FF14] outline-none" placeholder="Password" required />
            <button type="submit" className="w-full bg-[#39FF14] text-black py-5 rounded-2xl font-black">CONECTAR</button>
          </form>
        </div>
      ) : (
        /* PANEL VIEW */
        <div className="max-w-md mx-auto flex flex-col h-screen relative">
          <header className="flex justify-between items-center py-6 border-b border-zinc-900">
            <div>
              <p className="text-[9px] font-bold text-zinc-500 uppercase">Bienvenido</p>
              <h2 className="text-xl font-black italic text-[#39FF14]">{driver?.nombre}</h2>
            </div>
            <button onClick={toggleStatus} className={`px-6 py-2 rounded-full font-black text-[10px] transition-all ${isConnected ? 'bg-[#39FF14] text-black shadow-[0_0_20px_#39FF14]' : 'bg-zinc-800 text-zinc-500'}`}>
              {isConnected ? 'ONLINE' : 'OFFLINE'}
            </button>
          </header>

          <main className="flex-1 flex flex-col justify-center items-center">
             <div className="relative mb-8">
                <div className={`w-32 h-32 rounded-full border-2 border-[#39FF14] flex items-center justify-center ${isConnected ? 'animate-ping' : 'opacity-10'}`}></div>
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className={`w-4 h-4 rounded-full bg-[#39FF14] ${isConnected ? 'shadow-[0_0_20px_#39FF14]' : 'grayscale'}`}></div>
                </div>
             </div>
             <p className="text-[11px] font-bold tracking-[4px] text-zinc-500 uppercase">
               {isConnected ? 'Escaneando Madrid...' : 'GPS Desactivado'}
             </p>
          </main>

          {/* TARJETA DE VIAJE EMERGENTE (MODAL NEON) */}
          {activeTrip && (
            <div className="fixed inset-x-6 bottom-10 bg-zinc-900 border-2 border-[#39FF14] rounded-[35px] p-8 shadow-[0_0_50px_rgba(57,255,20,0.4)] animate-in slide-in-from-bottom-full duration-500 z-50">
               <div className="flex justify-between items-start mb-6">
                  <span className="bg-[#39FF14] text-black text-[10px] font-black px-3 py-1 rounded-full">NUEVO SERVICIO</span>
                  <span className="text-2xl font-black text-white">{activeTrip.precio}€</span>
               </div>
               
               <div className="space-y-4 mb-8">
                  <div>
                    <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Recogida</p>
                    <p className="text-sm font-bold text-white">{activeTrip.origen}</p>
                  </div>
                  <div className="border-l border-dashed border-zinc-700 h-4 ml-2"></div>
                  <div>
                    <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Destino</p>
                    <p className="text-sm font-bold text-zinc-300">{activeTrip.destino}</p>
                  </div>
               </div>

               <button 
                onClick={aceptarViaje}
                className="w-full bg-[#39FF14] text-black py-5 rounded-2xl font-black text-lg hover:scale-[1.02] active:scale-95 transition-all"
               >
                 ACEPTAR SERVICIO
               </button>
               <button onClick={() => setActiveTrip(null)} className="w-full mt-4 text-[10px] text-zinc-600 font-bold uppercase">Rechazar</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
