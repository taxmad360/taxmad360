'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

// --- CONFIGURACIÓN DE CONEXIÓN SEGURA ---
// Estas variables se configuran en el panel de Vercel (Environment Variables)
const S_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wdxtnvblolhqipscpxer.supabase.co';
const S_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_zOMBuq-XNjESL-0p03fafQ_2hDT6Cni'; 
const supabase = createClient(S_URL, S_KEY);

export default function DriverTerminal() {
  const [driver, setDriver] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [view, setView] = useState('login');
  const [trips, setTrips] = useState([]);

  // --- PERSISTENCIA DE SESIÓN ---
  useEffect(() => {
    const savedDriver = localStorage.getItem('txmd_driver');
    if (savedDriver) {
      setDriver(JSON.parse(savedDriver));
      setView('panel');
    }
  }, []);

  // --- LÓGICA DE LOGIN ---
  const intentarLogin = async (e) => {
    e.preventDefault();
    const u = e.target.user.value;
    const p = e.target.pass.value;

    const { data: d, error } = await supabase
      .from('drivers')
      .select('*')
      .eq('usuario', u)
      .single();

    if (d && d.password === p) {
      if (d.acceso_bloqueado) {
        alert("⚠️ TERMINAL BLOQUEADA: Contacta con administración.");
        return;
      }
      setDriver(d);
      setView('panel');
      localStorage.setItem('txmd_driver', JSON.stringify(d));
    } else {
      alert("Credenciales inválidas o error de conexión");
    }
  };

  // --- ACTUALIZACIÓN DE ESTADO (ONLINE/OFFLINE) ---
  const toggleStatus = async () => {
    if (!driver) return;
    const newStatus = !isConnected;
    
    const { error } = await supabase
      .from('drivers')
      .update({ 
        estado: newStatus ? 'activo' : 'inactivo',
        ultima_conexion: new Date().toISOString() 
      })
      .eq('id', driver.id);

    if (!error) setIsConnected(newStatus);
  };

  const logout = () => {
    localStorage.removeItem('txmd_driver');
    setDriver(null);
    setView('login');
    setIsConnected(false);
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#39FF14] selection:text-black">
      
      {/* PANTALLA LOGIN CONDUCTOR */}
      {view === 'login' && (
        <div className="p-8 text-center flex flex-col justify-center min-h-screen max-w-md mx-auto">
          <h1 className="text-5xl font-black mb-1 italic tracking-tighter">
            TAX<span className="text-[#39FF14]">MAD</span>
          </h1>
          <p className="text-[10px] font-bold tracking-[6px] text-zinc-500 mb-12 uppercase">Driver Terminal</p>
          
          <form onSubmit={intentarLogin} className="text-left space-y-5">
            <div>
              <label className="text-[10px] font-extrabold text-zinc-500 ml-2 uppercase tracking-widest">Identificación</label>
              <input name="user" type="text" className="w-full bg-zinc-900 border border-zinc-800 p-4 rounded-2xl mt-1 focus:border-[#39FF14] outline-none transition-all" placeholder="Usuario" required />
            </div>
            <div>
              <label className="text-[10px] font-extrabold text-zinc-500 ml-2 uppercase tracking-widest">Contraseña</label>
              <input name="pass" type="password" className="w-full bg-zinc-900 border border-zinc-800 p-4 rounded-2xl mt-1 focus:border-[#39FF14] outline-none transition-all" placeholder="••••••••" required />
            </div>
            
            <button type="submit" className="w-full bg-[#39FF14] text-black py-5 rounded-2xl font-black text-sm mt-4 hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_20px_rgba(57,255,20,0.2)]">
              CONECTAR AL SISTEMA
            </button>
          </form>
        </div>
      )}

      {/* TERMINAL ACTIVA */}
      {driver && view !== 'login' && (
        <div className="flex flex-col h-screen max-w-md mx-auto border-x border-zinc-900 bg-black">
          <header className="p-5 flex justify-between items-center bg-zinc-950/50 backdrop-blur-md border-b border-zinc-900 sticky top-0 z-50">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center font-bold text-[#39FF14] shadow-inner">
                {driver.nombre[0]}
              </div>
              <div>
                <p className="text-[9px] text-zinc-500 font-black uppercase tracking-tighter">Driver Oficial</p>
                <p className="text-sm font-black">{driver.nombre}</p>
              </div>
            </div>
            <button 
              onClick={toggleStatus}
              className={`px-5 py-2.5 rounded-full font-black text-[10px] transition-all duration-500 ${
                isConnected 
                ? 'bg-[#39FF14] text-black shadow-[0_0_20px_rgba(57,255,20,0.4)]' 
                : 'bg-zinc-800 text-zinc-500'
              }`}
            >
              {isConnected ? 'ONLINE' : 'OFFLINE'}
            </button>
          </header>

          <main className="flex-1 overflow-y-auto pb-32">
            {view === 'panel' && (
              <div className="animate-in fade-in duration-700">
                <div className="h-[300px] bg-zinc-900 relative flex items-center justify-center">
                   <div className={`absolute w-32 h-32 rounded-full border-2 border-[#39FF14]/20 ${isConnected ? 'animate-ping' : ''}`}></div>
                   <p className="text-[10px] font-black uppercase tracking-[4px] text-zinc-600 relative z-10">
                     {isConnected ? 'Escaneando Área...' : 'GPS Desactivado'}
                   </p>
                </div>
                
                <div className="p-6">
                   <div className="flex justify-between items-center mb-6">
                      <h3 className="text-[11px] font-black text-zinc-500 uppercase tracking-widest">Servicios Cercanos</h3>
                      <span className="text-[9px] bg-zinc-900 px-2 py-1 rounded text-[#39FF14] font-bold">RADAR ACTIVO</span>
                   </div>
                   
                   <div className="space-y-4">
                      {trips.length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed border-zinc-900 rounded-3xl">
                          <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                            {isConnected 
                              ? "Esperando solicitudes\nde clientes..." 
                              : "Conéctate para empezar\na recibir viajes"}
                          </p>
                        </div>
                      ) : (
                        <p>Lista de viajes aquí...</p>
                      )}
                   </div>
                </div>
              </div>
            )}
            
            {view === 'perfil' && (
              <div className="p-8 space-y-6">
                <div className="bg-zinc-900/50 p-6 rounded-3xl border border-zinc-800">
                  <p className="text-xs text-zinc-500 font-bold uppercase mb-1">Vehículo</p>
                  <p className="text-lg font-black">{driver.marca_v} <span className="text-[#39FF14]">{driver.color_v}</span></p>
                  <p className="text-sm text-zinc-400 font-mono mt-1">{driver.matricula}</p>
                </div>
                <button onClick={logout} className="w-full p-4 text-red-500 font-black text-xs uppercase tracking-widest border border-red-500/20 rounded-2xl">
                  Cerrar Sesión
                </button>
              </div>
            )}
          </main>

          {/* MENÚ INFERIOR */}
          <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm h-20 bg-zinc-950/80 backdrop-blur-xl flex justify-around items-center border border-zinc-800 px-6 rounded-3xl shadow-2xl z-50">
            <button onClick={() => setView('panel')} className={`flex flex-col items-center transition-all ${view === 'panel' ? 'text-[#39FF14] scale-110' : 'text-zinc-600'}`}>
              <i className="fa-solid fa-tower-broadcast text-xl"></i>
              <span className="text-[8px] font-black mt-1 uppercase">Radar</span>
            </button>
            <button onClick={() => setView('viajes')} className={`flex flex-col items-center transition-all ${view === 'viajes' ? 'text-[#39FF14] scale-110' : 'text-zinc-600'}`}>
              <i className="fa-solid fa-route text-xl"></i>
              <span className="text-[8px] font-black mt-1 uppercase">Viajes</span>
            </button>
            <button onClick={() => setView('perfil')} className={`flex flex-col items-center transition-all ${view === 'perfil' ? 'text-[#39FF14] scale-110' : 'text-zinc-600'}`}>
              <i className="fa-solid fa-user-gear text-xl"></i>
              <span className="text-[8px] font-black mt-1 uppercase">Perfil</span>
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}
