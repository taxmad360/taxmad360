'use client'
import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function AdminPage() {
  const [viajes, setViajes] = useState([])
  const [conductores, setConductores] = useState([])
  const supabase = createClientComponentClient()

  // 1. Carga inicial y Suscripción Realtime
  useEffect(() => {
    // Función para obtener viajes iniciales
    const fetchViajes = async () => {
      const { data, error } = await supabase
        .from('viajes')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (!error) setViajes(data || [])
    }

    fetchViajes()

    // 2. Suscripción a eventos en tiempo real (INSERT de nuevos viajes)
    const channel = supabase.channel('realtime:viajes')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'viajes' 
      }, (payload) => {
        // Añadimos el nuevo viaje al estado actual
        setViajes((prev) => [payload.new, ...prev])
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  return (
    <div className="p-8 min-h-screen bg-black text-white">
      <header className="mb-8 border-b border-white/10 pb-6">
        <h1 className="text-3xl font-black italic uppercase text-[#39FF14]">TaxMad Dashboard</h1>
        <p className="text-zinc-500 font-bold">Monitoreo de flota en tiempo real</p>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-zinc-900 p-6 rounded-2xl border border-white/5">
          <h3 className="text-zinc-400 uppercase text-xs font-bold">Viajes Recientes</h3>
          <p className="text-4xl font-black">{viajes.length}</p>
        </div>
        <div className="bg-zinc-900 p-6 rounded-2xl border border-white/5">
          <h3 className="text-zinc-400 uppercase text-xs font-bold">Estado</h3>
          <p className="text-xl font-black text-[#39FF14]">SISTEMA ACTIVO</p>
        </div>
      </div>

      {/* Tabla de Viajes */}
      <div className="bg-zinc-900 rounded-3xl p-6 border border-white/5">
        <h2 className="text-xl font-black mb-6">Solicitudes de Clientes</h2>
        <div className="space-y-4">
          {viajes.length === 0 ? (
            <p className="text-zinc-600 text-center py-10 font-bold">Esperando nuevas solicitudes...</p>
          ) : (
            viajes.map((viaje) => (
              <div key={viaje.id} className="flex justify-between items-center p-4 bg-zinc-950 rounded-xl border border-white/5">
                <div>
                  <p className="font-bold text-white">Viaje #{viaje.id.slice(0, 8)}</p>
                  <p className="text-xs text-zinc-500">{new Date(viaje.created_at).toLocaleTimeString()}</p>
                </div>
                <span className="px-3 py-1 bg-[#39FF14]/10 text-[#39FF14] text-xs font-black uppercase rounded-lg">
                  {viaje.status || 'PENDIENTE'}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
