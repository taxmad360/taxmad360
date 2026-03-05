'use client' // Esto le dice a Next.js que es una app interactiva
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

// Tus claves de Supabase que ya tenías
const S_URL = 'https://wdxtnvblolhqipscpxer.supabase.co';
const S_KEY = 'tu_clave_aqui';
const supabase = createClient(S_URL, S_KEY);

export default function HomePage() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('login'); // login, register, home, hucha

  // Aquí irán todas tus funciones: intentarAcceso, registrarUsuario, etc.
  // Adaptadas a React (te las iré pasando si quieres una por una)

  return (
    <div className="mobile-container">
      {/* HEADER */}
      {user && (
        <header className="user-header">
           <div className="flex items-center gap-3">
             <img src={user.foto} className="w-11 h-11 rounded-full border-2 border-[#BC00FF]" />
             <div>
               <p className="text-[8px] font-black text-[#BC00FF]">Premium User</p>
               <h2 className="text-sm font-bold text-white">{user.nombre}</h2>
             </div>
           </div>
           <img src="/logo.png" className="app-logo" />
        </header>
      )}

      {/* PANTALLA DE LOGIN/AUTH */}
      {!user && (
        <div id="auth-screen">
            {/* Aquí pegas el contenido de tu div auth-content */}
            {/* Pero cambiando class por className */}
        </div>
      )}

      {/* NAVEGACIÓN INFERIOR */}
      {user && (
        <nav>
          <div onClick={() => setView('home')} className={view === 'home' ? 'nav-btn active' : 'nav-btn'}>
            <i className="fa-solid fa-compass"></i>
            <span>RESERVAR</span>
          </div>
          {/* ...otros botones de nav */}
        </nav>
      )}
    </div>
  )
}
