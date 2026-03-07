'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '');

export default function AdminPage() {
  const [isOnline, setIsOnline] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white p-6 font-sans">
      <div className="max-w-md mx-auto">
        <p className="text-neon-green text-[10px] uppercase tracking-widest mb-1">Unidad Activa</p>
        <h1 className="text-3xl font-black italic mb-6">Administrador <span className="text-neon-green">TaxMad</span></h1>
        
        <div className="bg-zinc-900/50 p-6 rounded-3xl border border-white/5 shadow-2xl">
          <button 
            onClick={() => setIsOnline(!isOnline)}
            className={`px-6 py-2 rounded-full font-bold text-xs border transition-all ${isOnline ? 'bg-neon-green/10 text-neon-green border-neon-green' : 'bg-zinc-800 text-zinc-500 border-zinc-700'}`}
          >
            {isOnline ? '• ONLINE' : 'OFFLINE'}
          </button>
          
          <div className="mt-8 space-y-4">
            <p className="text-sm font-medium text-zinc-400">
              {isOnline ? 'Escaneando Servicios...' : 'GPS en pausa'}
            </p>
            <button className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase text-xs hover:bg-neon-green transition-colors">
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
