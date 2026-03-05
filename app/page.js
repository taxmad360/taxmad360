'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import BuscadorDirecciones from './components/BuscadorDirecciones'

const S_URL = 'https://wdxtnvblolhqipscpxer.supabase.co';
const S_KEY = 'TU_LLAVE_COMPLETA_AQUI'; 
const supabase = createClient(S_URL, S_KEY);

export default function HomePage() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('login'); 
  const [loading, setLoading] = useState(false);
  const [origen, setOrigen] = useState('');
  const [destino, setDestino] = useState('');
  const [loginForm, setLoginForm] = useState({ user: '', pass: '' });

  useEffect(() => {
    const savedUser = localStorage.getItem('txmd_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setView('home');
    }
  }, []);

  const intentarAcceso = async () => {
    setLoading(true);
    const { data } = await supabase.from('clientes').select('*').eq('usuario', loginForm.user).single();
    if (data && data.password === loginForm.pass) {
      setUser(data);
      localStorage.setItem('txmd_user', JSON.stringify(data));
      setView('home');
    } else {
      alert("Error de acceso");
    }
    setLoading(false);
  };

  const cerrarSesion = () => {
    localStorage.removeItem('txmd_user');
    setUser(null);
    setView('login');
  };

  return (
    <div className="mobile-container">
      {/* HEADER GLOBAL */}
      {user && view !== 'login' && (
        <header className="user-header">
          <div className="flex items-center gap-3">
            <img 
              src={user.foto || 'https://via.placeholder.com/150'} 
              className="w-11 h-11 rounded-full border-2 border-[#BC00FF] object-cover cursor-pointer"
              onClick={() => setView('perfil')}
            />
            <div>
              <p className="text-[8px] font-black text-[#BC00FF] uppercase tracking-widest">Premium User</p>
              <h2 className="text-sm font-bold text-white">{user.nombre}</h2>
            </div>
          </div>
          <img src="/logo.png" alt="TaxMad" className="app-logo" />
        </header>
      )}

      {/* 1. VISTA: LOGIN */}
      {!user && (
        <div id="auth-screen">
          <div className="mb-10 flex flex-col items-center">
            <img src="/logo.png" alt="TaxMad Logo" className="auth-logo" />
            <h1 className="text-3xl font-black italic header-gradient">TaxMad</h1>
            <p className="text-[10px] tracking-[4px] opacity-50 uppercase text-white mt-2">Black Mobility</p>
          </div>
          <input type="text" placeholder="Usuario" className="input-auth" onChange={(e) => setLoginForm({...loginForm, user: e.target.value})} />
          <input type="password" placeholder="Contraseña" className="input-auth" onChange={(e) => setLoginForm({...loginForm, pass: e.target.value})} />
          <button onClick={intentarAcceso} className="btn-main mt-4">{loading ? '...' : 'ENTRAR'}</button>
        </div>
      )}

      {/* 2. VISTA: HOME (RESERVAS) */}
      {user && view === 'home' && (
        <div className="p-5 overflow-y-auto animate-in fade-in duration-500">
          <div className="taxcoin-card">
            <div>
              <p className="text-[10px] font-bold text-[#39FF14] mb-1 uppercase">Mis Taxcoins</p>
              <p className="text-2xl font-black text-white">{user.taxcoins?.toFixed(2) || '0.00'} TC</p>
            </div>
            <i className="fa-solid fa-crown text-3xl text-[#39FF14] opacity-40"></i>
          </div>
          <div className="space-y-4 mt-4">
            <div className="input-group">
              <label>Recogida</label>
              <BuscadorDirecciones placeholder="¿Dónde estás?" onSelect={setOrigen} />
            </div>
            <div className="input-group">
              <label>Destino</label>
              <BuscadorDirecciones placeholder="¿A dónde vas?" onSelect={setDestino} />
            </div>
            <button className="btn-main">SOLICITAR TAXMAD</button>
          </div>
        </div>
      )}

      {/* 3. VISTA: HUCHA (HISTORIAL) */}
      {user && view === 'hucha' && (
        <div className="p-6 overflow-y-auto h-full">
          <h2 className="text-2xl font-black italic mb-6">Mis <span className="text-[#39FF14]">Viajes</span></h2>
          <div className="opacity-30 text-center py-20 text-[10px] font-bold uppercase tracking-[4px]">
            No hay viajes recientes
          </div>
        </div>
      )}

      {/* 4. VISTA: PERFIL */}
      {user && view === 'perfil' && (
        <div className="p-6 overflow-y-auto h-full text-center">
           <div className="photo-picker mb-6">
              <img src={user.foto || 'https://via.placeholder.com/150'} alt="Profile" />
           </div>
           <h2 className="text-xl font-black text-white mb-1">{user.nombre}</h2>
           <p className="text-xs text-zinc-500 mb-8">{user.usuario}</p>
           
           <div className="card-txmd text-left space-y-4 mb-8">
              <div className="flex justify-between border-b border-zinc-800 pb-2">
                <span className="text-zinc-500 text-[10px] font-bold uppercase">Estado</span>
                <span className="text-[#39FF14] text-[10px] font-bold">ACTIVO</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 text-[10px] font-bold uppercase">Miembro desde</span>
                <span className="text-white text-[10px] font-bold">2024</span>
              </div>
           </div>

           <button onClick={cerrarSesion} className="text-rose-500 text-[10px] font-black uppercase tracking-[3px] border border-rose-500/30 p-4 rounded-xl w-full">
              Cerrar Sesión Premium
           </button>
        </div>
      )}

      {/* NAV INFERIOR */}
      {user && (
        <nav>
          <div onClick={() => setView('home')} className={`nav-btn ${view === 'home' ? 'active' : ''}`}>
            <i className="fa-solid fa-compass text-xl block"></i>
            <span className="text-[9px] font-bold">RESERVAR</span>
          </div>
          <div onClick={() => setView('hucha')} className={`nav-btn ${view === 'hucha' ? 'active' : ''}`}>
            <i className="fa-solid fa-receipt text-xl block"></i>
            <span className="text-[9px] font-bold">VIAJES</span>
          </div>
          <div onClick={() => setView('perfil')} className={`nav-btn ${view === 'perfil' ? 'active' : ''}`}>
            <i className="fa-solid fa-user-gear text-xl block"></i>
            <span className="text-[9px] font-bold">PERFIL</span>
          </div>
        </nav>
      )}
    </div>
  )
}
