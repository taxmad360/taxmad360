'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

// Conexión usando variables de entorno
const S_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const S_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(S_URL, S_KEY);

export default function AdminPanel() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [tab, setTab] = useState('drivers');
  const [drivers, setDrivers] = useState([]);
  
  // Estado para los campos del nuevo conductor (solo para la creación)
  const [nombreForm, setNombreForm] = useState('');
  const [userForm, setUserForm] = useState('');
  const [passForm, setPassForm] = useState('');

  // 1. LOGIN DE ADMINISTRADOR (Lee directamente del formulario para evitar bloqueos)
  const loginAdmin = (e) => {
    e.preventDefault();
    const u = e.target.user.value;
    const p = e.target.pass.value;
    
    if (u === 'superadmin' && p === 'madrid2026') {
      setIsAdmin(true);
      fetchDrivers();
    } else {
      alert("Acceso Denegado: Usuario o Clave incorrectos.");
    }
  };

  // 2. CARGAR LISTA DE CONDUCTORES
  const fetchDrivers = async () => {
    const { data, error } = await supabase.from('drivers').select('*').order('created_at', { ascending: false });
    if (!error) setDrivers(data || []);
  };

  // 3. REGISTRAR NUEVO CONDUCTOR
  const handleCreateDriver = async (e) => {
    e.preventDefault();
    if (!nombreForm || !userForm || !passForm) return alert("Completa todos los campos");
    
    const { error } = await supabase.from('drivers').insert([
      { nombre: nombreForm, usuario: userForm, password: passForm, comision_pendiente_10: 0 }
    ]);
    
    if (error) {
      alert("Error: " + error.message);
    } else {
      alert("Conductor registrado con éxito");
      setNombreForm(''); setUserForm(''); setPassForm('');
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
    if(!confirm("¿Saldar la deuda de este conductor?")) return;
    await supabase.from('drivers').update({ comision_pendiente_10: 0 }).eq('id', id);
    fetchDrivers();
  };

  // PANTALLA DE LOGIN (Si no es Admin)
  if (!isAdmin) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#001229] p-6 text-white z-[9999] overflow-y-auto">
        <div className="bg-[#0a2551] w-full max-w-md p-10 rounded-3xl text-center shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10">
          <h1 className="text-4xl font-black mb-2 italic tracking-tighter">Tax<span className="text-sky-400">Mad</span></h1>
          <p className="text-[10px] tracking-[5px] text-sky-400/50 mb-10 uppercase font-black">Control Central</p>
          
          <form onSubmit={loginAdmin} className="space-y-5 text-left">
            <div>
              <label className="text-[9px] font-bold text-gray-400 uppercase ml-2">ID Administrador</label>
              <input 
                name="user" 
                type="text" 
                className="lm-input-admin w-full mt-1" 
                placeholder="Ingresa usuario..."
                required 
              />
            </div>
            <div>
              <label className="text-[9px] font-bold text-gray-400 uppercase ml-2">Clave Maestra</label>
              <input 
                name="pass" 
                type="password" 
                className="lm-input-admin w-full mt-1" 
                placeholder="••••••••"
                required 
              />
            </div>
            <button type="submit" className="w-full bg-sky-500 py-4 rounded-2xl font-black text-[#001229] uppercase mt-6 hover:bg-sky-400 active:scale-95 transition-all shadow-lg shadow-sky-500/20">
              ACCEDER AL COMANDO
            </button>
          </form>
        </div>
      </div>
    )
  }

  // PANEL PRINCIPAL (Si ya es Admin)
  return (
    <div className="min-h-screen bg-[#001229] p-4 md:p-8 text-white font-['Montserrat']">
      <header className="max-w-6xl mx-auto flex justify-between items-center mb-10 bg-[#0a2551] p-6 rounded-3xl border border-white/5 shadow-xl">
        <div>
          <h1 className="text-2xl font-black italic tracking-tighter uppercase">DASHBOARD <span className="text-sky-400">MASTER</span></h1>
          <p className="text-[9px] font-bold text-green-500 uppercase tracking-widest">Sistema En Línea</p>
        </div>
        <button onClick={() => location.reload()} className="bg-rose-500/10 text-rose-500 px-5 py-2 rounded-xl font-bold text-[10px] uppercase border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all">Cerrar Sesión</button>
      </header>

      <div className="max-w-6xl mx-auto">
        {/* TABS NAVEGACIÓN */}
        <div className="flex gap-8 mb-10 border-b border-white/5">
          {['drivers', 'servicios', 'clientes'].map(t => (
            <button 
              key={t}
              onClick={() => setTab(t)}
              className={`pb-4 px-2 font-black text-[10px] uppercase tracking-[3px] transition-all ${tab === t ? 'text-sky-400 border-b-2 border-sky-400' : 'text-gray-500 hover:text-gray-300'}`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === 'drivers' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 animate-in fade-in slide-in-from-bottom-2">
            {/* Formulario Registro */}
            <div className="bg-[#0a2551] p-8 rounded-3xl h-fit border border-white/5 shadow-2xl">
               <h3 className="text-sky-400 font-black mb-8 uppercase text-xs tracking-widest">Alta de Unidad</h3>
               <form onSubmit={handleCreateDriver} className="space-y-4">
                 <input type="text" placeholder="Nombre" className="lm-input-admin" value={nombreForm} onChange={(e) => setNombreForm(e.target.value)} />
                 <input type="text" placeholder="Usuario" className="lm-input-admin" value={userForm} onChange={(e) => setUserForm(e.target.value)} />
                 <input type="password" placeholder="Clave" className="lm-input-admin" value={passForm} onChange={(e) => setPassForm(e.target.value)} />
                 <button className="w-full bg-green-500 py-4 rounded-2xl font-black text-black uppercase mt-4 text-[10px] tracking-widest shadow-lg shadow-green-500/20">Registrar</button>
               </form>
            </div>

            {/* Lista de Drivers */}
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              {drivers.map(d => (
                <div key={d.id} className={`bg-[#0a2551] p-6 rounded-3xl border border-white/5 transition-all ${d.baneado ? 'opacity-40 grayscale' : 'hover:border-sky-400/30'}`}>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h4 className="font-black text-base uppercase leading-tight">{d.nombre}</h4>
                      <p className="text-[9px] text-sky-400 font-bold mt-1 uppercase tracking-tighter">User: {d.usuario}</p>
                    </div>
                    <button 
                      onClick={() => toggleBloqueo(d.id, d.baneado)}
                      className={`text-[8px] font-black uppercase px-3 py-1.5 rounded-lg border ${d.baneado ? 'text-green-400 border-green-400/20 bg-green-400/5' : 'text-rose-500 border-rose-500/20 bg-rose-500/5'}`}
                    >
                      {d.baneado ? 'Desbloquear' : 'Bloquear'}
                    </button>
                  </div>
                  
                  <div className="flex justify-between items-end border-t border-white/5 pt-6">
                    <div>
                      <p className="text-[8px] text-gray-500 uppercase font-black tracking-widest mb-1">Comisión Pendiente</p>
                      <p className={`text-2xl font-black ${d.comision_pendiente_10 > 0 ? 'text-orange-400' : 'text-zinc-700'}`}>
                        {d.comision_pendiente_10?.toFixed(2) || "0.00"}€
                      </p>
                    </div>
                    <button onClick={() => resetDeuda(d.id)} className="bg-sky-500 text-[#001229] px-5 py-2 rounded-xl font-black text-[9px] uppercase shadow-lg shadow-sky-500/10">Cobrado</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .lm-input-admin {
          background: #000c1d;
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 15px;
          padding: 16px;
          color: white;
          width: 100%;
          outline: none;
          font-size: 14px;
          transition: all 0.3s;
        }
        .lm-input-admin:focus {
          border-color: #38bdf8;
          background: #001229;
          box-shadow: 0 0 20px rgba(56, 189, 248, 0.1);
        }
      `}</style>
    </div>
  )
}
