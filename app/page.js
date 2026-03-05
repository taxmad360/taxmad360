'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import BuscadorDirecciones from './components/BuscadorDirecciones'

// Configuración de Supabase
const S_URL = 'https://wdxtnvblolhqipscpxer.supabase.co';
const S_KEY = 'tu_llave_aqui'; // Asegúrate de poner tu llave completa aquí
const supabase = createClient(S_URL, S_KEY);

export default function HomePage() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('login'); 
  const [loading, setLoading] = useState(false);
  
  // Estados para el viaje
  const [origen, setOrigen] = useState('');
  const [destino, setDestino] = useState('');

  // Campos del formulario
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
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('usuario', loginForm.user)
      .single();

    if (data && data.password === loginForm.pass) {
      setUser(data);
      localStorage.setItem('txmd_user', JSON.stringify(data));
      setView('home');
    } else {
      alert("Credenciales incorrectas");
    }
    setLoading(false);
  };

  const calcularViaje = () => {
    if (!origen || !destino) return alert("Selecciona origen y destino");
    console.log("Calculando ruta desde:", origen, "hasta:", destino);
    // Aquí conectaremos con la Directions API para sacar los KM
  };

  return (
    <div className="mobile-container">
      {/* HEADER */}
      {user && view !== 'login' && (
        <header className="user-header">
          <div className="flex items-center gap-3">
            <img 
              src={user.foto || 'https://via.placeholder.com/150'} 
              className="w-11 h-11 rounded-full border-2 border-[#BC00FF] object-cover"
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

      {/* LOGIN/AUTH */}
      {!user && (
        <div id="auth-screen">
          <div className="mb-10 flex flex-col items-center">
            <img src="/logo.png" alt="TaxMad Logo" className="auth-logo" />
            <h1 className="text-3xl font-black italic header-gradient">TaxMad</h1>
            <p className="text-[10px] tracking-[4px] opacity-50 uppercase text-white mt-2">Black Mobility</p>
          </div>

          {view === 'login' ? (
            <div id="login-box">
              <input 
                type="text" 
                placeholder="Usuario" 
                className="input-auth"
                onChange={(e) => setLoginForm({...loginForm, user: e.target.value})}
              />
              <input 
                type="password" 
                placeholder="Contraseña" 
                className="input-auth"
                onChange={(e) => setLoginForm({...loginForm, pass: e.target.value})}
              />
              <button onClick={intentarAcceso} className="btn-main mt-4">
                {loading ? 'CARGANDO...' : 'ENTRAR'}
              </button>
              <p className="mt-6 text-sm text-gray-500">
                ¿Nuevo aquí? <span className="text-[#00D1FF] font-bold cursor-pointer" onClick={() => setView('register')}>Crea una cuenta</span>
              </p>
            </div>
          ) : (
            <div id="register-box">
               <button onClick={() => setView('login')} className="text-xs text-gray-500 mt-4">Volver al login</button>
            </div>
          )}
        </div>
      )}

      {/* HOME / RESERVAS */}
      {user && view === 'home' && (
        <div className="p-5 overflow-y-auto">
          <div className="taxcoin-card">
            <div>
              <p className="text-[10px] font-bold text-[#39FF14] mb-1">Taxcoins</p>
              <p className="text-2xl font-black text-white">
                {user.taxcoins?.toFixed(2) || '0.00'} <small className="text-xs text-gray-500">TC</small>
              </p>
            </div>
            <i className="fa-solid fa-crown text-3xl text-[#39FF14] opacity-40"></i>
          </div>
          
          <div className="space-y-4 mt-4">
            <div className="input-group">
              <label>Recogida</label>
              <BuscadorDirecciones 
                placeholder="¿Dónde te recogemos?" 
                onSelect={(dir) => setOrigen(dir)} 
              />
            </div>

            <div className="input-group">
              <label>Destino</label>
              <BuscadorDirecciones 
                placeholder="¿A dónde vas?" 
                onSelect={(dir) => setDestino(dir)} 
              />
            </div>

            <button onClick={calcularViaje} className="btn-main">
              CALCULAR PRECIO
            </button>
          </div>
        </div>
      )}

      {/* NAVEGACIÓN */}
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
