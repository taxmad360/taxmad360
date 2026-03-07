'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

// Conexión limpia usando tus variables de entorno
const S_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const S_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(S_URL, S_KEY);

export default function AdminPanel() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [tab, setTab] = useState('drivers');
  const [drivers, setDrivers] = useState([]);
  
  // Estado para el formulario de nuevo conductor
  const [newDriver, setNewDriver] = useState({
    nombre: '', usuario: '', password: '', comision_pendiente_10: 0
  });

  // 1. LOGIN DE ADMINISTRADOR
  const loginAdmin = (e) => {
    e.preventDefault();
    const u = e.target.user.value;
    const p = e.target.pass.value;
    // Credenciales maestras
    if (u === 'superadmin' && p === 'madrid2026') {
      setIsAdmin(true);
      fetchDrivers();
    } else {
      alert("Acceso Denegado");
    }
  };

  // 2. CARGAR LISTA DE CONDUCTORES
  const fetchDrivers = async () => {
    const { data } = await supabase.from('drivers').select('*').order('created_at', { ascending: false });
    setDrivers(data || []);
  };

  // 3. REGISTRAR NUEVO CONDUCTOR (Función añadida)
  const handleCreateDriver = async () => {
    if (!newDriver.nombre || !newDriver.usuario || !newDriver.password) {
      return alert("Rellena los campos básicos");
    }
    
    const { error } = await supabase.from('drivers').insert([newDriver]);
    
    if (error) {
      alert("Error al registrar: " + error.message);
    } else {
      alert("Conductor registrado con éxito");
      setNewDriver({ nombre: '', usuario: '', password: '', comision_pendiente_10: 0 });
      fetchDrivers();
    }
  };

  // 4. BLOQUEO / DESBLOQUEO
  const toggleBloqueo = async (id, statusActual) => {
    if(!confirm("¿Confirmar cambio de estado de acceso?")) return;
    await supabase.from('drivers').update({ baneado: !statusActual }).eq('id', id);
    fetchDrivers();
  };

  // 5. SALDAR DEUDA
  const resetDeuda = async (id) => {
    if(!confirm("¿Confirmar que el conductor ha pagado su comisión?")) return;
    await supabase.from('drivers').update({ comision_pendiente_10: 0 }).eq('id', id);
    fetchDrivers();
  };

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#001229] p-6 text-white font-['Montserrat']">
        <div className="bg-[#0a2551] w-full max-w-md p-8 rounded-2xl text-center shadow-2xl border border-white/5">
          <h1 className="text-3xl font-black mb-2 italic">Tax<span className="text-sky-400">Mad</span></h1>
          <p className="text-[10px] tracking-[4px] text-gray-400 mb-8 uppercase font-bold">Comando Central</p>
          <form onSubmit={loginAdmin} className="space-y-4 text-left">
            <input name="user" type="text" placeholder="ID Administrador" className="lm-input-admin w-full" />
            <input name="pass" type="password" placeholder="Clave Maestra" className="lm-input-admin w-full" />
            <button className="w-full bg-sky-500 py-4 rounded-xl font-black text-black uppercase mt-4 hover:bg-sky-400 transition-colors">ENTRAR AL SISTEMA</button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#001229] p-4 md:p-8 text-white font-['Montserrat']">
      <header className="max-w-6xl mx-auto flex justify-between items-center mb-8 bg-[#0a2551] p-6 rounded-2xl border border-white/5">
        <div>
          <h1 className="text-2xl font-black italic tracking-tighter uppercase">CONTROL <span className="text-sky-400">TOTAL</span></h1>
          <p className="text-[9px] font-bold text-gray-500 uppercase">Administrador: <span className="text-green-500 font-black">SUPERADMIN</span></p>
        </div>
        <button onClick={() => setIsAdmin(false)} className="bg-rose-500/10 text-rose-500 px-4 py-2 rounded-lg font-bold text-xs uppercase border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all">Desconectar</button>
      </header>

      <div className="max-w-6xl mx-auto">
        <div className="flex gap-6 mb-8 border-b border-white/5">
          {['drivers', 'servicios', 'clientes'].map(t => (
            <button 
              key={t}
              onClick={() => setTab(t)}
              className={`pb-4 px-2 font-bold text-xs uppercase tracking-widest transition-all ${tab === t ? 'text-sky-400 border-b-2 border-sky-400' : 'text-gray-500'}`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === 'drivers' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
            {/* Formulario Alta mejorado */}
            <div className="bg-[#0a2551] p-6 rounded-2xl h-fit border border-white/5">
               <h3 className="text-sky-400 font-black mb-6 uppercase text-[10px] tracking-widest">Registrar Nueva Unidad</h3>
               <div className="space-y-3">
                 <input 
                   type="text" 
                   placeholder="Nombre Completo" 
                   className="lm-input-admin" 
                   value={newDriver.nombre}
                   onChange={(e) => setNewDriver({...newDriver, nombre: e.target.value})}
                 />
                 <input 
                   type="text" 
                   placeholder="Usuario de Acceso" 
                   className="lm-input-admin" 
                   value={newDriver.usuario}
                   onChange={(e) => setNewDriver({...newDriver, usuario: e.target.value})}
                 />
                 <input 
                   type="password" 
                   placeholder="Contraseña" 
                   className="lm-input-admin" 
                   value={newDriver.password}
                   onChange={(e) => setNewDriver({...newDriver, password: e.target.value})}
                 />
                 <button 
                   onClick={handleCreateDriver}
                   className="w-full bg-green-500 py-3 rounded-xl font-black text-black uppercase mt-4 text-[10px] tracking-widest"
                 >
                   Dar de Alta Conductor
                 </button>
               </div>
            </div>

            {/* Lista Drivers */}
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              {drivers.length === 0 && <p className="text-gray-500 text-xs italic">No hay conductores registrados.</p>}
              {drivers.map(d => (
                <div key={d.id} className={`bg-[#0a2551] p-5 rounded-2xl border border-white/5 shadow-lg ${d.baneado ? 'border-l-4 border-l-rose-500 opacity-60' : ''}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-black text-sm uppercase text-white">{d.nombre}</h4>
                      <p className="text-[8px] text-gray-500 font-mono">USUARIO: {d.usuario}</p>
                    </div>
                    <button 
                      onClick={() => toggleBloqueo(d.id, d.baneado)}
                      className={`text-[9px] font-black uppercase px-2 py-1 rounded border ${d.baneado ? 'text-green-400 border-green-400/30' : 'text-rose-500 border-rose-500/30'}`}
                    >
                      {d.baneado ? 'ACTIVAR' : 'BLOQUEAR'}
                    </button>
                  </div>
                  <div className="flex justify-between items-end border-t border-white/5 pt-4">
                    <div>
                      <p className="text-[8px] text-gray-500 uppercase font-bold tracking-widest">Comisión 10%</p>
                      <p className={`text-xl font-black ${d.comision_pendiente_10 > 0 ? 'text-orange-400' : 'text-zinc-500'}`}>
                        {d.comision_pendiente_10?.toFixed(2) || "0.00"}€
                      </p>
                    </div>
                    <button 
                      onClick={() => resetDeuda(d.id)}
                      className="bg-sky-500 text-black px-4 py-2 rounded-lg font-black text-[9px] uppercase active:scale-95 transition-transform"
                    >
                      Saldar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .lm-input-admin {
          background: rgba(0,0,0,0.4);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 12px;
          padding: 14px 16px;
          color: white;
          width: 100%;
          outline: none;
          font-size: 12px;
          transition: all 0.3s ease;
        }
        .lm-input-admin:focus {
          border-color: #00B5FF;
          background: rgba(0,0,0,0.6);
          box-shadow: 0 0 15px rgba(0, 181, 255, 0.1);
        }
      `}</style>
    </div>
  )
}
