'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

// --- LIMPIEZA AUTOMÁTICA DE URL ---
const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const S_URL = rawUrl.replace('Url. ', '').trim();
const S_KEY = rawKey.trim();

const supabase = (S_URL.startsWith('http')) ? createClient(S_URL, S_KEY) : null;

export default function DriverTerminal() {
  const [driver, setDriver] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [view, setView] = useState('login');
  const [activeTrip, setActiveTrip] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('txmd_driver');
    if (saved) {
      try {
        setDriver(JSON.parse(saved));
        setView('panel');
      } catch (e) { localStorage.removeItem('txmd_driver'); }
    }
  }, []);

  // Escucha de viajes en tiempo real
  useEffect(() => {
    if (!supabase || !isConnected || !driver) return;

    const channel = supabase
      .channel('nuevos-viajes')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'viajes', filter: `estado_viaje=eq.pendiente` }, 
        (payload) => {
          if (navigator.vibrate) navigator.vibrate([500, 200, 500]);
          // Sonido opcional
          const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');
          audio.play().catch(() => {});
          setActiveTrip(payload.new);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [isConnected, driver]);

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
      alert("Credenciales incorrectas");
    }
  };

  const toggleStatus = async () => {
    if (!driver || !supabase) return;
    const newStatus = !isConnected;
    await supabase.from('drivers').update({ estado: newStatus ? 'activo' : 'inactivo' }).eq('id', driver.id);
    setIsConnected(newStatus);
  };

  // --- FUNCIÓN PARA ACEPTAR EL SERVICIO ---
  const aceptarViaje = async () => {
    if (!activeTrip || !driver || !supabase) return;
    setIsAccepting(true);

    try {
      const { error } = await supabase
        .from('viajes')
        .update({ 
          estado_viaje: 'aceptado', 
          driver_id: driver.id 
        })
        .eq('id', activeTrip.id)
        .eq('estado_viaje', 'pendiente'); // Doble check para evitar que otro lo acepte a la vez

      if (error) throw error;

      alert("✅ ¡VIAJE ACEPTADO! Dirígete al punto de recogida.");
      setActiveTrip(null); 
      
    } catch (err) {
      console.error(err);
      alert("Lo sentimos, este viaje ya no está disponible.");
      setActiveTrip(null);
    } finally {
      setIsAccepting(false);
    }
  };

  if (!mounted) return <div className="min-h-screen bg-black" />;

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-[#39FF14] selection:text-black">
      {view === 'login' ? (
        <div className="max-w-md mx-auto pt-32 px-6 text-center">
          <h1 className="text-6xl font-black italic tracking-tighter mb-2">
            TAX<span className="text-[#39FF14]">MAD</span>
          </h1>
          <p className="text-[10px] tracking-[5px] text-zinc-500 uppercase mb-12">Driver Terminal</p>
          
          <form onSubmit={intentarLogin} className="space-y-4">
            <input name="user" className="w-full bg-zinc-900 border border-zinc-800 p-5 rounded-2xl focus:border-[#39FF14] outline-none transition-all text-white" placeholder="ID Usuario" required />
            <input name="pass" type="password" className="w-full bg-zinc-900 border border-zinc-800 p-5 rounded-2xl focus:border-[#39FF14] outline-none transition-all text-white" placeholder="Contraseña" required />
            <button type="submit" className="w-full bg-[#39FF14] text-black py-5 rounded-2xl font-black shadow-[0_0_20px_rgba(57,255,20,0.3)] active:scale-95 transition-all">
              ENTRAR AL SISTEMA
            </button>
          </form>
        </div>
      ) : (
        <div className="max-w-md mx-auto h-screen flex flex-col p-6">
          <header className="flex justify-between items-center py-6 border-b border-zinc-900">
            <div>
              <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Unidad Activa</p>
              <h2 className="text-xl font-black italic uppercase text-[#39FF14]">{driver?.nombre || 'Admin'}</h2>
            </div>
            <button 
              onClick={toggleStatus}
              className={`px-6 py-2 rounded-full font-black text-[10px] transition-all duration-500 ${
                isConnected ? 'bg-[#39FF14] text-black shadow-[0_0_20px_#39FF14]' : 'bg-zinc-800 text-zinc-500'
              }`}
            >
              {isConnected ? '• ONLINE' : 'OFFLINE'}
            </button>
          </header>

          <main className="flex-1 flex flex-col justify-center items-center">
             <div className="relative mb-10">
                <div className={`w-32 h-32 rounded-full border-2 border-[#39FF14] flex items-center justify-center ${isConnected ? 'animate-ping opacity-20' : 'opacity-10'}`}></div>
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className={`w-5 h-5 rounded-full bg-[#39FF14] ${isConnected ? 'shadow-[0_0_20px_#39FF14]' : 'grayscale opacity-30'}`}></div>
                </div>
             </div>
             <p className="text-[11px] font-bold tracking-[5px] text-zinc-500 uppercase animate-pulse">
               {isConnected ? 'Escaneando Servicios...' : 'GPS en pausa'}
             </p>
          </main>

          {/* TARJETA DE VIAJE EN TIEMPO REAL */}
          {activeTrip && (
            <div className="fixed inset-x-6 bottom-10 bg-zinc-900 border-2 border-[#39FF14] rounded-[35px] p-8 shadow-[0_0_50px_rgba(57,255,20,0.4)] animate-in slide-in-from-bottom-full duration-500 z-50">
               <div className="flex justify-between items-start mb-6">
                  <span className="bg-[#39FF14] text-black text-[10px] font-black px-3 py-1 rounded-full uppercase">Nuevo Viaje</span>
                  <span className="text-2xl font-black text-white">{activeTrip.precio}€</span>
               </div>
               
               <div className="space-y-3 mb-8">
                  <div>
                    <p className="text-[9px] text-zinc-500 font-bold uppercase">Recogida</p>
                    <p className="text-sm font-bold text-white">{activeTrip.origen}</p>
                  </div>
                  <div className="border-l-2 border-dashed border-zinc-800 h-4 ml-1"></div>
                  <div>
                    <p className="text-[9px] text-zinc-500 font-bold uppercase">Destino</p>
                    <p className="text-sm font-bold text-zinc-300">{activeTrip.destino}</p>
                  </div>
               </div>

               <button 
                onClick={aceptarViaje}
                disabled={isAccepting}
                className="w-full bg-[#39FF14] text-black py-5 rounded-2xl font-black text-lg active:scale-95 transition-all disabled:opacity-50"
               >
                 {isAccepting ? 'PROCESANDO...' : 'ACEPTAR SERVICIO'}
               </button>
               <button 
                 onClick={() => setActiveTrip(null)} 
                 disabled={isAccepting}
                 className="w-full mt-4 text-[9px] text-zinc-600 font-bold uppercase tracking-widest"
               >
                 Ignorar
               </button>
            </div>
          )}
          
          <footer className="pb-6 flex justify-center">
             <button 
               onClick={() => { localStorage.removeItem('txmd_driver'); setView('login'); }}
               className="text-[9px] text-zinc-700 font-bold uppercase tracking-widest hover:text-red-500 transition-colors"
             >
               Cerrar Sesión
             </button>
          </footer>
        </div>
      )}
    </div>
  );
}
