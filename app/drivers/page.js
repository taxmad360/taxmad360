'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const S_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wdxtnvblohqipscpxer.supabase.co';
const S_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkeHRudmJsb2xocWlwc2NweGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0NzQxNzIsImV4cCI6MjA4ODA1MDE3Mn0.xO19SVN8gowDATLWDEpyakcZXbdGg2Iex8C-ZEWL2dM'; 
const supabase = createClient(S_URL, S_KEY);

export default function DriverTerminal() {
  const [driver, setDriver] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [view, setView] = useState('login');
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    const savedDriver = localStorage.getItem('txmd_driver');
    if (savedDriver) {
      try {
        setDriver(JSON.parse(savedDriver));
        setView('panel');
      } catch (e) {
        localStorage.removeItem('txmd_driver');
      }
    }
  }, []);

  const intentarLogin = async (e) => {
    e.preventDefault();
    const u = e.target.user.value;
    const p = e.target.pass.value;

    const { data: d, error } = await supabase
      .from('drivers')
      .select('*')
      .eq('usuario', u)
      .single();

    if (d && d.password === p) {
      if (d.acceso_bloqueado) {
        alert("⚠️ TERMINAL BLOQUEADA");
        return;
      }
      setDriver(d);
      setView('panel');
      localStorage.setItem('txmd_driver', JSON.stringify(d));
    } else {
      alert("Credenciales inválidas");
    }
  };

  const toggleStatus = async () => {
    if (!driver) return;
    const newStatus = !isConnected;
    const { error } = await supabase
      .from('drivers')
      .update({ estado: newStatus ? 'activo' : 'inactivo' })
      .eq('id', driver.id);
    if (!error) setIsConnected(newStatus);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {view === 'login' ? (
        <div className="p-8 text-center flex flex-col justify-center min-h-screen">
          <h1 className="text-4xl font-black italic">TAX<span className="text-[#39FF14]">MAD</span></h1>
          <form onSubmit={intentarLogin} className="mt-8 space-y-4">
            <input name="user" type="text" className="w-full bg-zinc-900 p-4 rounded-xl" placeholder="Usuario" required />
            <input name="pass" type="password" className="w-full bg-zinc-900 p-4 rounded-xl" placeholder="••••" required />
            <button type="submit" className="w-full bg-[#39FF14] text-black py-4 rounded-xl font-black">ENTRAR</button>
          </form>
        </div>
      ) : (
        <div className="flex flex-col h-screen">
          <header className="p-5 flex justify-between border-b border-zinc-900">
            <p className="font-bold">{driver?.nombre}</p>
            <button onClick={toggleStatus} className={`px-4 py-1 rounded-full text-[10px] font-bold ${isConnected ? 'bg-[#39FF14] text-black' : 'bg-zinc-800 text-zinc-500'}`}>
              {isConnected ? 'ONLINE' : 'OFFLINE'}
            </button>
          </header>
          <main className="flex-1 p-6">
            <div className="h-48 bg-zinc-900 rounded-3xl flex items-center justify-center border border-zinc-800">
               <p className="text-zinc-600 font-bold uppercase tracking-widest text-[10px]">Mapa GPS Activo</p>
            </div>
          </main>
        </div>
      )}
    </div>
  );
}
