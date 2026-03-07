'use client'
import { useState } from 'react'

export default function AdminPage() {
  const [isOnline, setIsOnline] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white p-6 font-sans flex flex-col items-center">
      <div className="w-full max-w-md">
        <header className="mb-10 text-center">
          <p className="text-[#39FF14] text-[10px] uppercase tracking-[4px] mb-2 font-bold">Comando Central</p>
          <h1 className="text-4xl font-black italic tracking-tighter">TAX<span className="text-[#39FF14]">MAD</span></h1>
        </header>
        
        <div className="bg-[#0f0f0f] border border-white/10 p-8 rounded-[40px] shadow-2xl">
          <div className="flex justify-between items-center mb-8">
            <span className="text-sm font-bold text-zinc-400">Estado de Red</span>
            <button 
              onClick={() => setIsOnline(!isOnline)}
              className={`px-6 py-2 rounded-full font-black text-[10px] border transition-all duration-500 ${isOnline ? 'bg-[#39FF14]/20 text-[#39FF14] border-[#39FF14] shadow-[0_0_15px_rgba(57,255,20,0.3)]' : 'bg-zinc-800 text-zinc-500 border-zinc-700'}`}
            >
              {isOnline ? '● ONLINE' : 'OFFLINE'}
            </button>
          </div>

          <div className="space-y-6">
            <div className="text-center py-10 border-y border-white/5">
              <p className="text-2xl font-light text-zinc-300">
                {isOnline ? 'Escaneando servicios...' : 'GPS en pausa'}
              </p>
            </div>
            
            <button className="w-full bg-white text-black py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-[#39FF14] transition-all active:scale-95">
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
