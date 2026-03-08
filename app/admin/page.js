'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const S_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
const S_KEY = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();
const supabase = (S_URL.startsWith('http')) ? createClient(S_URL, S_KEY) : null;

export default function AdminPage() {
  const [viajes, setViajes] = useState([]);
  const [stats, setStats] = useState({ total: 0, activos: 0 });

  useEffect(() => {
    if (!supabase) return;

    const fetchViajes = async () => {
      const { data } = await supabase.from('viajes').select('*').order('created_at', { ascending: false }).limit(10);
      if (data) setViajes(data);
    };

    fetchViajes();

    const channel = supabase.channel('admin-dashboard')
      .on('postgres_changes', { event: '*', table: 'viajes' }, () => fetchViajes())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    const total = viajes.reduce((acc, v) => acc + (parseFloat(v.precio) || 0), 0);
    const activos = viajes.filter(v => v.estado_viaje === 'aceptado' || v.estado_viaje === 'pendiente').length;
    setStats({ total, activos });
  }, [viajes]);

  return (
    <div className="min-h-screen bg-black text-white p-6 font-sans">
      <header className="mb-10 flex justify-between items-end">
        <div>
          <p className="text-[#39FF14] text-[10px] font-black uppercase tracking-[4px]">Comando Central</p>
          <h1 className="text-4xl font-black italic">TAX<span className="text-[#39FF14]">MAD</span></h1>
        </div>
        <div className="text-right">
          <p className="text-zinc-500 text-[9px] font-bold uppercase">Recaudación Hoy</p>
          <p className="text-2xl font-black text-white">{stats.total.toFixed(2)}€</p>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-4 mb-10">
        <div className="bg-zinc-900 p-6 rounded-[32px] border border-white/5">
          <p className="text-zinc-500 text-[9px] font-bold uppercase mb-1">Servicios Activos</p>
          <p className="text-3xl font-black text-[#39FF14]">{stats.activos}</p>
        </div>
        <div className="bg-zinc-900 p-6 rounded-[32px] border border-white/5 text-right">
          <p className="text-zinc-500 text-[9px] font-bold uppercase mb-1">Unidades</p>
          <p className="text-3xl font-black text-[#00D1FF]">PRO</p>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-4">Registro de Actividad</h2>
        {viajes.map((v) => (
          <div key={v.id} className="bg-zinc-900/50 border border-white/5 p-5 rounded-3xl flex justify-between items-center animate-in slide-in-from-right">
            <div className="flex gap-4 items-center">
              <div className={`w-2 h-2 rounded-full ${v.estado_viaje === 'aceptado' ? 'bg-[#39FF14]' : v.estado_viaje === 'pendiente' ? 'bg-yellow-500 animate-pulse' : 'bg-zinc-700'}`}></div>
              <div>
                <p className="text-xs font-bold text-white truncate w-32">{v.destino}</p>
                <p className="text-[10px] text-zinc-500 uppercase">{v.estado_viaje}</p>
              </div>
            </div>
            <p className="font-black text-sm">{v.precio}€</p>
          </div>
        ))}
      </div>
    </div>
  );
}
