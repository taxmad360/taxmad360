'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'

// --- CONFIGURACIÓN DE SUPABASE ---
const S_URL = 'https://wdxtnvblolhqipscpxer.supabase.co';
const S_KEY = 'TU_ANON_KEY_REAL'; // ⚠️ REEMPLAZA ESTO CON TU KEY REAL
const supabase = createClient(S_URL, S_KEY);

export default function DriverTerminal() {
  const [driver, setDriver] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [view, setView] = useState('login');
  const [trips, setTrips] = useState([]);
  const mapRef = useRef(null);

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
        alert("⚠️ TERMINAL BLOQUEADA: Contacta con administración para pagar tu cuota.");
        return;
      }
      setDriver(d);
      setView('panel');
      localStorage.setItem('txmd_driver', JSON.stringify(d));
    } else {
      alert("Credenciales inválidas");
    }
  };

  // --- ACTUALIZACIÓN DE ESTADO (ONLINE/OFFLINE) ---
  const toggleStatus = async () => {
    if (!driver) return;
    const newStatus = !isConnected;
    setIsConnected(newStatus);
    
    await supabase
      .from('drivers')
      .update({ estado: newStatus ? 'activo' : 'inactivo' })
      .eq('id', driver.id);
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      
      {/* PANTALLA LOGIN CONDUCTOR */}
      {view === 'login' && (
        <div className="p-10 text-center flex flex-col justify-center h-screen">
          <h1 className="text-4xl font-black mb-1 italic tracking-tighter">
            TAX<span className="text-[#ffb000]">MAD</span>
          </h1>
          <p className="text-[9px] font-bold tracking-[5px] text-zinc-500 mb-12 uppercase">Driver Terminal</p>
          
          <form onSubmit={intentarLogin} className="text-left space-y-4">
            <div>
              <label className="text-[10px] font-extrabold text-zinc-600 ml-2 uppercase tracking-widest">Identificación</label>
              <input name="user" type="text" className="w-full bg-zinc-900 border border-zinc-800 p-4 rounded-xl mt-1 text-white" placeholder="Usuario" required />
            </div>
            <div>
              <label className="text-[10px] font-extrabold text-zinc-600 ml-2 uppercase tracking-widest">Acceso</label>
              <input name="pass" type="password" className="w-full bg-zinc-900 border border-zinc-800 p-4 rounded-xl mt-1 text-white" placeholder="••••••••" required />
            </div>
            
            <button type="submit" className="w-full bg-white text-black py-5 rounded-xl font-black text-sm mt-6 hover:bg-[#ffb000] transition-colors">
              CONECTAR AL SISTEMA
            </button>
          </form>
        </div>
      )}

      {/* TERMINAL ACTIVA */}
      {driver && view !== 'login' && (
        <div className="flex flex-col h-screen">
          <header className="p-5 flex justify-between items-center bg-black border-b border-zinc-900">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center font-bold text-[#ffb000]">
                {driver.nombre ? driver.nombre[0] : 'D'}
              </div>
              <div>
                <p className="text-[8px] text-zinc-500 font-black uppercase">Servicio Oficial</p>
                <p className="text-sm font-extrabold">{driver.nombre}</p>
              </div>
            </div>
            <button 
              onClick={toggleStatus}
              className={`px-4 py-2 rounded-full font-black text-[10px] transition-all ${
                isConnected ? 'bg-[#ffb000] text-black shadow-[0_0_15px_rgba(255,176,0,0.4)]' : 'bg-zinc-800 text-zinc-500'
              }`}
            >
              {isConnected ? 'CONECTADO' : 'OFFLINE'}
            </button>
          </header>

          <main className="flex-1 overflow-y-auto pb-24">
            {view === 'panel' && (
              <>
                <div id="map" className="h-[280px] bg-zinc-900 border-b border-zinc-800 flex items-center justify-center text-zinc-700">
                   {/* Aquí se renderizará el mapa de Google */}
                   <p className="text-xs italic uppercase tracking-widest">Mapa GPS Activo</p>
                </div>
                <div className="p-6">
                   <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4">Radar de Servicios</h3>
                   <div className="opacity-40 text-center py-10 text-[10px] uppercase font-bold tracking-widest border-2 border-dashed border-zinc-800 rounded-2xl">
                      {isConnected ? 'Buscando servicios cercanos...' : 'Conéctate para recibir viajes'}
                   </div>
                </div>
              </>
            )}
            
            {view === 'viajes' && (
              <div className="p-6 text-center text-zinc-500 italic text-sm">Historial de viajes vacío</div>
            )}
          </main>

          {/* MENÚ INFERIOR */}
          <nav className="fixed bottom-0 w-full h-20 bg-black flex justify-around items-center border-t border-zinc-900 px-6">
            <button onClick={() => setView('panel')} className={`flex flex-col items-center ${view === 'panel' ? 'text-[#ffb000]' : 'text-zinc-600'}`}>
              <span className="text-xs font-black">RADAR</span>
            </button>
            <button onClick={() => setView('viajes')} className={`flex flex-col items-center ${view === 'viajes' ? 'text-[#ffb000]' : 'text-zinc-600'}`}>
              <span className="text-xs font-black">VIAJES</span>
            </button>
            <button onClick={() => setView('perfil')} className={`flex flex-col items-center ${view === 'perfil' ? 'text-[#ffb000]' : 'text-zinc-600'}`}>
              <span className="text-xs font-black">PERFIL</span>
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}
