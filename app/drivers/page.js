'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

// --- LIMPIEZA DE VARIABLES ---
const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Quitamos posibles espacios o textos extraños como "Url. "
const S_URL = rawUrl.replace('Url. ', '').trim();
const S_KEY = rawKey.trim();

// Solo inicializamos si la URL empieza por http
const supabase = (S_URL.startsWith('http')) ? createClient(S_URL, S_KEY) : null;

export default function DriverTerminal() {
  const [driver, setDriver] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [view, setView] = useState('login');
  const [activeTrip, setActiveTrip] = useState(null);
  const [mounted, setMounted] = useState(false);

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

  // Escucha en tiempo real (Realtime)
  useEffect(() => {
    if (!supabase || !isConnected || !driver) return;

    const channel = supabase
      .channel('nuevos-viajes')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'viajes', filter: `estado_viaje=eq.pendiente` }, 
        (payload) => {
          if (navigator.vibrate) navigator.vibrate([500, 200, 500]);
          setActiveTrip(payload.new);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [isConnected, driver]);

  const intentarLogin = async (e) => {
    e.preventDefault();
    if (!supabase) return alert("Error: URL de base de datos inválida.");
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

  if (!mounted) return <div className="min-h-screen bg-black" />;
  if (!supabase) return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-10 text-center">
      <h1 className="text-[#39FF14] font-black text-2xl mb-4">ERROR DE CONEXIÓN</h1>
      <p className="text-zinc-500 text-sm">La URL de Supabase es incorrecta o contiene texto extra como "Url. ". Corrígelo en Vercel Settings.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white p-6 font-sans">
      {view === 'login' ? (
        <div className="max-w-md mx-auto pt-24 text-center">
          <h1 className="text-5xl font-black italic mb-2">TAX<span className="text-[#39FF14]">MAD</span></h1>
          <form onSubmit={intentarLogin} className="space-y-4 text-left">
            <input name="user" className="w-full bg-zinc-900 border border-zinc-800 p-5 rounded-2xl" placeholder="Usuario" required />
            <input name="pass" type="password" className="w-full bg-zinc-900 border border-zinc-800 p-5 rounded-2xl" placeholder="Password" required />
            <button type="submit" className="w-full bg-[#39FF14] text-black py-5 rounded-2xl font-black">ENTRAR</button>
          </form>
        </div>
      ) : (
        <div className="max-w-md mx-auto flex flex-col h-screen">
          <header className="flex justify-between items-center py-6">
            <h2 className="text-xl font-black italic">{driver?.nombre}</h2>
            <button onClick={() => setIsConnected(!isConnected)} className={`px-6 py-2 rounded-full font-black text-[10px] ${isConnected ? 'bg-[#39FF14] text-black shadow-[0_0_20px_#39FF14]' : 'bg-zinc-800'}`}>
              {isConnected ? '• ONLINE' : 'OFFLINE'}
            </button>
          </header>
          <main className="flex-1 flex flex-col justify-center items-center">
             <div className={`w-24 h-24 rounded-full border-2 border-[#39FF14] ${isConnected ? 'animate-ping' : 'opacity-20'}`} />
             <p className="mt-8 text-[10px] tracking-[4px] text-zinc-500 uppercase">{isConnected ? 'Escaneando...' : 'GPS Pausado'}</p>
          </main>

          {activeTrip && (
            <div className="fixed inset-x-6 bottom-10 bg-zinc-900 border-2 border-[#39FF14] rounded-[30px] p-8 animate-bounce">
              <p className="text-[#39FF14] font-black text-xs mb-2 italic">¡NUEVO VIAJE!</p>
              <p className="text-xl font-bold mb-4">{activeTrip.origen} → {activeTrip.destino}</p>
              <button onClick={() => setActiveTrip(null)} className="w-full bg-[#39FF14] text-black py-4 rounded-xl font-black">ACEPTAR {activeTrip.precio}€</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
