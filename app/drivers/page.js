'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

// --- CONFIGURACIÓN SEGURA ---
// Usamos funciones para inicializar solo cuando sea necesario y evitar errores de build
const getSupabase = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

export default function DriverTerminal() {
  const [supabase, setSupabase] = useState(null)
  const [driver, setDriver] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [view, setView] = useState('login')

  // 1. Inicializar Supabase y Sesión solo en el cliente
  useEffect(() => {
    const client = getSupabase()
    setSupabase(client)

    const saved = localStorage.getItem('txmd_driver')
    if (saved) {
      try {
        setDriver(JSON.parse(saved))
        setView('panel')
      } catch (e) {
        localStorage.removeItem('txmd_driver')
      }
    }
  }, [])

  // 2. Lógica de Login
  const handleLogin = async (e) => {
    e.preventDefault()
    if (!supabase) return alert("Configuración de base de datos no detectada.")

    const user = e.target.user.value
    const pass = e.target.pass.value

    const { data, error } = await supabase
      .from('drivers')
      .select('*')
      .eq('usuario', user)
      .single()

    if (data && data.password === pass) {
      setDriver(data)
      setView('panel')
      localStorage.setItem('txmd_driver', JSON.stringify(data))
    } else {
      alert("Credenciales incorrectas")
    }
  }

  // 3. Toggle Online/Offline
  const toggleStatus = async () => {
    if (!driver || !supabase) return
    const nextStatus = !isConnected
    
    const { error } = await supabase
      .from('drivers')
      .update({ estado: nextStatus ? 'activo' : 'inactivo' })
      .eq('id', driver.id)

    if (!error) setIsConnected(nextStatus)
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 font-sans selection:bg-[#39FF14] selection:text-black">
      {view === 'login' ? (
        <div className="max-w-md mx-auto pt-20 text-center">
          <h1 className="text-6xl font-black italic tracking-tighter mb-2">
            TAX<span className="text-[#39FF14]">MAD</span>
          </h1>
          <p className="text-[10px] tracking-[6px] text-zinc-500 uppercase mb-12">Driver Terminal</p>
          
          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <input name="user" className="w-full bg-zinc-900 border border-zinc-800 p-5 rounded-2xl focus:border-[#39FF14] outline-none transition-all" placeholder="Usuario ID" required />
            <input name="pass" type="password" className="w-full bg-zinc-900 border border-zinc-800 p-5 rounded-2xl focus:border-[#39FF14] outline-none transition-all" placeholder="Contraseña" required />
            <button type="submit" className="w-full bg-[#39FF14] text-black py-5 rounded-2xl font-black shadow-[0_0_25px_rgba(57,255,20,0.2)] active:scale-95 transition-transform">
              ENTRAR AL SISTEMA
            </button>
          </form>
        </div>
      ) : (
        <div className="max-w-md mx-auto h-[90vh] flex flex-col">
          <header className="flex justify-between items-center py-6 border-b border-zinc-900">
            <div>
              <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Unidad Activa</p>
              <h2 className="text-xl font-black italic uppercase text-[#39FF14]">{driver?.nombre}</h2>
            </div>
            <button 
              onClick={toggleStatus}
              className={`px-6 py-2 rounded-full font-black text-[10px] transition-all duration-500 ${
                isConnected ? 'bg-[#39FF14] text-black shadow-[0_0_20px_#39FF14]' : 'bg-zinc-800 text-zinc-500'
              }`}
            >
              {isConnected ? '• ONLINE' : 'OFFLINE'}
            </button>
          </header>

          <main className="flex-1 flex flex-col justify-center items-center">
             <div className="relative mb-10">
                <div className={`w-32 h-32 rounded-full border-2 border-[#39FF14] flex items-center justify-center ${isConnected ? 'animate-ping opacity-20' : 'opacity-10'}`}></div>
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className={`w-5 h-5 rounded-full bg-[#39FF14] ${isConnected ? 'shadow-[0_0_20px_#39FF14]' : 'grayscale opacity-30'}`}></div>
                </div>
             </div>
             <p className="text-[11px] font-bold tracking-[5px] text-zinc-500 uppercase animate-pulse">
               {isConnected ? 'Escaneando Servicios...' : 'GPS en pausa'}
             </p>
          </main>
          
          <footer className="pb-10">
             <button onClick={() => { localStorage.removeItem('txmd_driver'); setView('login'); }} className="text-[9px] text-zinc-700 font-bold uppercase tracking-widest hover:text-red-500 transition-colors">
               Desconectar terminal
             </button>
          </footer>
        </div>
      )}
    </div>
  )
}
