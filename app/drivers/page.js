'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'

const S_URL = 'https://wdxtnvblolhqipscpxer.supabase.co';
const S_KEY = 'tu_llave_aqui'; // Usa la misma que en la app de cliente
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

    const { data: d, error } = await supabase.from('drivers').select('*').eq('usuario', u).single();

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
    const newStatus = !isConnected;
    setIsConnected(newStatus);
    
    await supabase.from('drivers').update({ 
      estado: newStatus ? 'activo' : 'inactivo' 
    }).eq('id', driver.id);
  };

  return (
    <div className="mobile-container" style={{'--gold': '#ffb000'}}>
      
      {/* PANTALLA LOGIN CONDUCTOR */}
      {view === 'login' && (
        <div className="p-10 text-center flex flex-col justify-center h-full">
          <h1 className="text-4xl font-black mb-1 italic tracking-tighter">TAX<span className="text-[#ffb000]">MAD</span></h1>
          <p className="text-[9px] font-bold tracking-[5px] text-zinc-500 mb-12 uppercase">Driver Terminal</p>
          
          <form onSubmit={intentarLogin} className="text-left">
            <label className="text-[10px] font-extrabold text-zinc-600 ml-2 uppercase tracking-widest">Identificación</label>
            <input name="user" type="text" className="lm-input" placeholder="Usuario de conductor" required />
            <label className="text-[10px] font-extrabold text-zinc-600 ml-2 uppercase tracking-widest">Acceso</label>
            <input name="pass" type="password" className="lm-input" placeholder="••••••••" required />
            
            <button type="submit" className="w-full bg-white text-black py-5 rounded-xl font-black text-sm mt-6">
              CONECTAR AL SISTEMA
            </button>
          </form>
        </div>
      )}

      {/* TERMINAL ACTIVA */}
      {driver && view !== 'login' && (
        <div className="flex flex-col h-full">
          <header className="p-5 flex justify-between items-center bg-black border-b border-zinc-900">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center font-bold text-[#ffb000]">
                {driver.nombre[0]}
              </div>
              <div>
                <p className="text-[8px] text-zinc-500 font-black uppercase">Servicio Oficial</p>
                <p className="text-sm font-extrabold">{driver.nombre}</p>
              </div>
            </div>
            <button 
              onClick={toggleStatus}
              className={`status-toggle ${isConnected ? 'status-on' : 'status-off'}`}
            >
              {isConnected ? 'CONECTADO' : 'OFFLINE'}
            </button>
          </header>

          <main className="flex-1 overflow-y-auto pb-24">
            {view === 'panel' && (
              <>
                <div id="map" className="h-[280px] bg-zinc-900"></div>
                <div className="p-6">
                   <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4">Radar de Servicios</h3>
                   {/* Aquí se cargarán los viajes dinámicamente */}
                   <div className="opacity-20 text-center py-10 text-[10px] uppercase font-bold tracking-widest">
                      {isConnected ? 'Buscando servicios...' : 'Conéctate para recibir viajes'}
                   </div>
                </div>
              </>
            )}
          </main>

          {/* MENÚ INFERIOR DRIVER */}
          <nav className="absolute bottom-0 w-full h-20 bg-black flex justify-around items-center border-t border-zinc-900 px-6">
            <div onClick={() => setView('panel')} className={`nav-btn ${view === 'panel' ? 'active' : ''}`}>
              <i className="fa-solid fa-radar text-xl"></i>
              <p className="text-[9px] mt-1 font-bold">RADAR</p>
            </div>
            <div onClick={() => setView('viajes')} className={`nav-btn ${view === 'viajes' ? 'active' : ''}`}>
              <i className="fa-solid fa-history text-xl"></i>
              <p className="text-[9px] mt-1 font-bold">VIAJES</p>
            </div>
            <div onClick={() => setView('perfil')} className={`nav-btn ${view === 'perfil' ? 'active' : ''}`}>
              <i className="fa-solid fa-user-circle text-xl"></i>
              <p className="text-[9px] mt-1 font-bold">PERFIL</p>
            </div>
          </nav>
        </div>
      )}
    </div>
  )
}
