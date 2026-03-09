'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient' // Ajusta según tu ruta

export default function AdminPage() {
  const [viajes, setViajes] = useState([])
  const [conductores, setConductores] = useState([])

  // Carga inicial de datos
  useEffect(() => {
    // Aquí cargarías la lista de viajes activos y conductores online
    console.log("Panel administrativo cargado: Monitoreando flota...")
  }, [])

  return (
    <div className="p-8 min-h-screen bg-zinc-950 text-white">
      <header className="mb-8">
        <h1 className="text-3xl font-black italic uppercase text-[#39FF14]">TaxMad Dashboard</h1>
        <p className="text-zinc-500 font-bold">Panel de control de operaciones</p>
      </header>

      {/* Grid de indicadores (KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-zinc-900 p-6 rounded-2xl border border-white/5">
          <h3 className="text-zinc-400 uppercase text-xs font-bold">Viajes Activos</h3>
          <p className="text-4xl font-black">12</p>
        </div>
        <div className="bg-zinc-900 p-6 rounded-2xl border border-white/5">
          <h3 className="text-zinc-400 uppercase text-xs font-bold">Conductores Online</h3>
          <p className="text-4xl font-black text-[#39FF14]">8</p>
        </div>
        <div className="bg-zinc-900 p-6 rounded-2xl border border-white/5">
          <h3 className="text-zinc-400 uppercase text-xs font-bold">Ganancia Total</h3>
          <p className="text-4xl font-black">240€</p>
        </div>
      </div>

      {/* Lista de Viajes */}
      <div className="bg-zinc-900 rounded-3xl p-6 border border-white/5">
        <h2 className="text-xl font-black mb-6">Últimos viajes</h2>
        <div className="space-y-4">
          {/* Aquí mapearías tus viajes: {viajes.map(...)} */}
          <div className="flex justify-between items-center p-4 bg-zinc-950 rounded-xl">
            <span className="font-bold">Cliente ID: #8821</span>
            <span className="text-[#39FF14] font-black">En curso</span>
          </div>
        </div>
      </div>
    </div>
  )
}
