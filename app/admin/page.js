'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const S_URL = 'https://wdxtnvblolhqipscpxer.supabase.co';
const S_KEY = 'TU_LLAVE_AQUI'; 
const supabase = createClient(S_URL, S_KEY);

export default function AdminPanel() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [tab, setTab] = useState('drivers');
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Formulario Nuevo Conductor
  const [newDriver, setNewDriver] = useState({
    nombre: '', usuario: '', password: '', modelo_coche: '', matricula: '', num_licencia: '', imei: ''
  });

  // 1. LOGIN DE ADMINISTRADOR
  const loginAdmin = (e) => {
    e.preventDefault();
    const u = e.target.user.value;
    const p = e.target.pass.value;
    if (u === 'superadmin' && p === 'madrid2026') {
      setIsAdmin(true);
      fetchDrivers();
    } else {
      alert("Acceso Denegado");
    }
  };

  // 2. CARGAR LISTA DE CONDUCTORES
  const fetchDrivers = async () => {
    const { data } = await supabase.from('drivers').select('*');
    setDrivers(data || []);
  };

  // 3. BLOQUEO / DESBLOQUEO
  const toggleBloqueo = async (id, statusActual) => {
    if(!confirm("¿Confirmar cambio de estado de acceso?")) return;
    await supabase.from('drivers').update({ baneado: !statusActual }).eq('id', id);
    fetchDrivers();
  };

  // 4. SALDAR DEUDA
  const resetDeuda = async (id) => {
    await supabase.from('drivers').update({ comision_pendiente_10: 0 }).eq('id', id);
    fetchDrivers();
  };

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#001229] p-6 text-white">
        <div className="bg-[#0a2551] w-full max-w-md p-8 rounded-2xl text-center shadow-2xl border border-white/5">
          <h1 className="text-3xl font-black mb-2">Tax<span className="text-sky-400">Mad</span></h1>
          <p className="text-[10px] tracking-[4px] text-gray-400 mb-8 uppercase font-bold">Panel de Control Maestro</p>
          <form onSubmit={loginAdmin} className="space-y-4 text-left">
            <input name="user" type="text" placeholder="Usuario Administrador" className="lm-input-admin w-full" />
            <input name="pass" type="password" placeholder="Contraseña Maestra" className="lm-input-admin w-full" />
            <button className="w-full bg-sky-500 py-4 rounded-xl font-black text-black uppercase mt-4">ACCEDER AL COMANDO</button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#001229] p-4 md:p-8 text-white font-['Montserrat']">
      <header className="max-w-6xl mx-auto flex justify-between items-center mb-8 bg-[#0a2551] p-6 rounded-2xl border border-white/5">
        <div>
          <h1 className="text-2xl font-black italic">COMANDO <span className="text-sky-400">CENTRAL</span></h1>
          <p className="text-[9px] font-bold text-gray-500 uppercase">Estado: <span className="text-green-500">Online</span></p>
        </div>
        <button onClick={() => location.reload()} className="bg-rose-500/10 text-rose-500 px-4 py-2 rounded-lg font-bold text-xs uppercase border border-rose-500/20">Salir</button>
      </header>

      <div className="max-w-6xl mx-auto">
        {/* NAVEGACIÓN TAB */}
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

        {/* CONTENIDO: CONDUCTORES */}
        {tab === 'drivers' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
            {/* Formulario Alta */}
            <div className="bg-[#0a2551] p-6 rounded-2xl h-fit border border-white/5">
               <h3 className="text-sky-400 font-black mb-6 uppercase text-xs tracking-tighter">Nuevo Registro</h3>
               <div className="space-y-3">
                 <input type="text" placeholder="Nombre" className="lm-input-admin" />
                 <input type="text" placeholder="Usuario" className="lm-input-admin" />
                 <input type="password" placeholder="Pass" className="lm-input-admin" />
                 <button className="w-full bg-green-500 py-3 rounded-xl font-black text-black uppercase mt-4 text-xs">Registrar Conductor</button>
               </div>
            </div>

            {/* Lista Drivers */}
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              {drivers.map(d => (
                <div key={d.id} className={`bg-[#0a2551] p-5 rounded-2xl border border-white/5 ${d.baneado ? 'border-l-4 border-l-rose-500 opacity-60' : ''}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-black text-sm uppercase">{d.nombre}</h4>
                      <p className="text-[8px] text-gray-500 font-mono">ID: {d.id.substring(0,8)}</p>
                    </div>
                    <button 
                      onClick={() => toggleBloqueo(d.id, d.baneado)}
                      className={`text-[10px] font-bold uppercase ${d.baneado ? 'text-green-400' : 'text-rose-500'}`}
                    >
                      {d.baneado ? 'Activar' : 'Bloquear'}
                    </button>
                  </div>
                  <div className="flex justify-between items-end border-t border-white/5 pt-4">
                    <div>
                      <p className="text-[8px] text-gray-500 uppercase font-bold">Deuda Pendiente</p>
                      <p className={`text-xl font-black ${d.comision_pendiente_10 > 0 ? 'text-orange-400' : 'text-zinc-600'}`}>
                        {d.comision_pendiente_10?.toFixed(2)}€
                      </p>
                    </div>
                    <button onClick={() => resetDeuda(d.id)} className="bg-sky-500 text-black px-3 py-1 rounded-lg font-black text-[9px] uppercase">Cobrado</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CONTENIDO: SERVICIOS MANUALES */}
        {tab === 'servicios' && (
          <div className="max-w-xl mx-auto bg-[#0a2551] p-8 rounded-2xl border border-white/5 animate-in slide-in-from-bottom-4 duration-500">
             <h2 className="text-xl font-black mb-6 italic text-sky-400 uppercase tracking-tighter">Asignación Manual</h2>
             <div className="space-y-4">
                <input type="text" placeholder="Origen" className="lm-input-admin" />
                <input type="text" placeholder="Destino" className="lm-input-admin" />
                <input type="number" placeholder="Importe €" className="lm-input-admin" />
                <input type="text" placeholder="ID Conductor" className="lm-input-admin" />
                <button className="w-full bg-sky-500 py-4 rounded-xl font-black text-black uppercase shadow-lg shadow-sky-500/20">Despachar Servicio</button>
             </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .lm-input-admin {
          background: rgba(0,0,0,0.3);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          padding: 12px 16px;
          color: white;
          width: 100%;
          outline: none;
          font-size: 13px;
          transition: 0.3s;
        }
        .lm-input-admin:focus {
          border-color: #00B5FF;
          background: rgba(0,0,0,0.5);
        }
      `}</style>
    </div>
  )
}
