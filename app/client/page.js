'use client'
import { useState } from 'react'

export default function ClientPage() {
  const [paso, setPaso] = useState('BUSCAR') // Estados: BUSCAR, PRECIO, SOLICITANDO
  const [destino, setDestino] = useState('')

  return (
    <div className="relative h-screen w-full bg-black overflow-hidden">
      
      {/* 1. Capa de Mapa (Aquí cargaría tu componente MapaTaxMad) */}
      <div className="absolute inset-0 z-0 bg-zinc-950 flex items-center justify-center">
        <p className="text-zinc-700 font-black tracking-widest">MAPA CARGANDO...</p>
      </div>

      {/* 2. Tarjeta Flotante Inferior (UI Premium) */}
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-black/90 backdrop-blur-2xl rounded-t-[32px] border-t border-white/10 p-6 shadow-2xl animate-in slide-in-from-bottom-10">
        
        {paso === 'BUSCAR' && (
          <div className="space-y-4">
            <h2 className="text-xl font-black italic text-[#39FF14]">¿A dónde vamos?</h2>
            <input 
              type="text" 
              placeholder="Origen: Madrid, España" 
              className="w-full bg-zinc-900 border border-white/10 p-4 rounded-xl text-white outline-none"
            />
            <input 
              type="text" 
              value={destino}
              onChange={(e) => setDestino(e.target.value)}
              placeholder="¿Cuál es tu destino?" 
              className="w-full bg-zinc-900 border border-white/10 p-4 rounded-xl text-white outline-none focus:border-[#39FF14]"
            />
            <button 
              onClick={() => setPaso('PRECIO')}
              className="w-full py-4 bg-white text-black font-black rounded-xl uppercase tracking-widest hover:bg-[#39FF14] transition-colors"
            >
              Buscar Vehículo
            </button>
          </div>
        )}

        {paso === 'PRECIO' && (
          <div className="space-y-4 animate-in fade-in duration-500">
            <div className="flex justify-between items-center p-4 bg-zinc-900 rounded-2xl border border-white/5">
              <span className="text-white font-black uppercase">Premium Black</span>
              <span className="text-2xl font-black text-[#39FF14]">18.50€</span>
            </div>
            <button 
              onClick={() => setPaso('SOLICITANDO')}
              className="w-full py-4 bg-[#39FF14] text-black font-black rounded-xl uppercase"
            >
              Confirmar Reserva
            </button>
            <button onClick={() => setPaso('BUSCAR')} className="w-full text-xs text-zinc-500 font-bold uppercase">Cancelar</button>
          </div>
        )}

        {paso === 'SOLICITANDO' && (
          <div className="text-center py-6">
            <div className="w-12 h-12 border-4 border-[#39FF14] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="font-black text-lg">Buscando conductores...</h3>
          </div>
        )}
      </div>
    </div>
  )
}
