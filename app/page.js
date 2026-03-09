'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

// --- CONEXIÓN SEGURA ---
const S_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/^Url\.\s*/i, '').trim();
const S_KEY = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();
const supabase = (S_URL.startsWith('http')) ? createClient(S_URL, S_KEY) : null;

export default function DriverTerminal() {
  const [driver, setDriver] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [view, setView] = useState('login');
  const [activeTrip, setActiveTrip] = useState(null); // El que sale en el radar
  const [currentTrip, setCurrentTrip] = useState(null); // El aceptado
  const [mensajes, setMensajes] = useState([]);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('txmd_driver');
    if (saved) { setDriver(JSON.parse(saved)); setView('panel'); }
  }, []);

  // REALTIME: Escucha de Viajes y Chat
  useEffect(() => {
    if (!supabase || !isConnected || !driver) return;

    // Canal para nuevos viajes
    const tripChannel = supabase.channel('radar')
      .on('postgres_changes', { event: 'INSERT', table: 'viajes', filter: 'estado_viaje=eq.pendiente' }, 
      (payload) => { setActiveTrip(payload.new); })
      .subscribe();

    // Canal para mensajes (solo si hay viaje activo)
    let msgChannel;
    if (currentTrip) {
      msgChannel = supabase.channel('chat')
        .on('postgres_changes', { event: 'INSERT', table: 'mensajes', filter: `viaje_id=eq.${currentTrip.id}` }, 
        (payload) => { setMensajes(prev => [...prev, payload.new]); })
        .subscribe();
    }

    return () => { 
      supabase.removeChannel(tripChannel); 
      if (msgChannel) supabase.removeChannel(msgChannel);
    };
  }, [isConnected, driver, currentTrip]);

  const intentarLogin = async (e) => {
    e.preventDefault();
    const { data } = await supabase.from('drivers').select('*').eq('usuario', e.target.user.value).single();
    if (data && data.password === e.target.pass.value) {
      setDriver(data); setView('panel');
      localStorage.setItem('txmd_driver', JSON.stringify(data));
    } else { alert("Error de acceso"); }
  };

  const aceptarViaje = async () => {
    const { error } = await supabase.from('viajes').update({ estado_viaje: 'aceptado', driver_id: driver.id }).eq('id', activeTrip.id);
    if (!error) { setCurrentTrip(activeTrip); setActiveTrip(null); }
  };

  const enviarMsjRapido = async (txt) => {
    await supabase.from('mensajes').insert([{ viaje_id: currentTrip.id, remitente: 'driver', contenido: txt }]);
  };

  if (view === 'login') return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <form onSubmit={intentarLogin} className="w-full max-w-xs space-y-4">
        <h1 className="text-[#39FF14] text-4xl font-black italic text-center mb-10">DRIVERS</h1>
        <input name="user" placeholder="Usuario" className="w-full bg-zinc-900 p-4 rounded-xl outline-none" />
        <input name="pass" type="password" placeholder="Clave" className="w-full bg-zinc-900 p-4 rounded-xl outline-none" />
        <button className="w-full bg-[#39FF14] text-black py-4 rounded-xl font-black">ENTRAR</button>
      </form>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <header className="flex justify-between items-center mb-10">
        <h2 className="text-[#39FF14] font-black italic">TAX<span className="text-white">MAD</span></h2>
        <button onClick={() => setIsConnected(!isConnected)} className={`px-4 py-2 rounded-full text-[10px] font-bold ${isConnected ? 'bg-[#39FF14] text-black shadow-[0_0_15px_#39FF14]' : 'bg-zinc-800'}`}>
          {isConnected ? 'ONLINE' : 'OFFLINE'}
        </button>
      </header>

      {currentTrip ? (
        <div className="space-y-6 animate-in slide-in-from-bottom-5 duration-500">
          <div className="bg-zinc-900 p-8 rounded-[35px] border border-[#39FF14]">
            <p className="text-[10px] text-[#39FF14] font-bold uppercase mb-4">Viaje en curso</p>
            <h3 className="text-2xl font-black">{currentTrip.origen}</h3>
            <div className="flex gap-2 mt-6">
              <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(currentTrip.origen)}`} target="_blank" className="flex-1 bg-white text-black py-4 rounded-xl font-bold text-center text-xs">ABRIR GPS 📍</a>
              <button onClick={() => setShowChat(true)} className="w-14 bg-zinc-800 rounded-xl flex items-center justify-center text-xl">💬</button>
            </div>
          </div>
          <button onClick={() => setCurrentTrip(null)} className="w-full py-4 text-zinc-600 font-bold text-[10px] uppercase tracking-widest">Finalizar Servicio</button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <div className={`w-24 h-24 rounded-full border-2 border-[#39FF14] flex items-center justify-center ${isConnected ? 'animate-ping' : 'opacity-20'}`}>
            <div className="w-4 h-4 bg-[#39FF14] rounded-full"></div>
          </div>
          <p className="mt-8 text-[10px] font-bold tracking-[4px] text-zinc-500 uppercase">{isConnected ? 'Buscando Clientes...' : 'GPS Pausado'}</p>
        </div>
      )}

      {/* ALERT DE NUEVO VIAJE */}
      {activeTrip && !currentTrip && (
        <div className="fixed inset-x-6 bottom-10 bg-zinc-900 border-2 border-[#39FF14] p-8 rounded-[35px] shadow-2xl z-50">
          <div className="flex justify-between items-start mb-4">
            <span className="bg-[#39FF14] text-black px-2 py-1 rounded text-[9px] font-black uppercase">Nuevo viaje</span>
            <span className="text-2xl font-black">{activeTrip.precio}€</span>
          </div>
          <p className="font-bold text-sm mb-6">{activeTrip.origen}</p>
          <button onClick={aceptarViaje} className="w-full bg-[#39FF14] text-black py-4 rounded-xl font-black">ACEPTAR</button>
        </div>
      )}

      {/* VENTANA DE CHAT */}
      {showChat && (
        <div className="fixed inset-0 bg-black z-[100] p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[#39FF14] font-black">CHAT CON CLIENTE</h3>
            <button onClick={() => setShowChat(false)} className="text-xs font-bold">CERRAR X</button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-4 mb-6">
            {mensajes.map((m, i) => (
              <div key={i} className={`flex ${m.remitente === 'driver' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-4 rounded-2xl max-w-[80%] text-sm font-bold ${m.remitente === 'driver' ? 'bg-[#39FF14] text-black' : 'bg-zinc-800 text-white'}`}>{m.contenido}</div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {["Ya estoy aquí", "5 min más", "Ok", "En la puerta"].map(t => (
              <button key={t} onClick={() => enviarMsjRapido(t)} className="bg-zinc-900 py-3 rounded-lg text-[10px] font-bold border border-zinc-800">{t}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
