'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const S_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/^Url\.\s*/i, '').trim();
const S_KEY = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();
const supabase = (S_URL.startsWith('http')) ? createClient(S_URL, S_KEY) : null;

export default function ClientApp() {
  const [viajeActivo, setViajeActivo] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMsj, setNuevoMsj] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [isListening, setIsListening] = useState(null);

  // 🎙️ Dictado por Voz
  const handleDictado = (campo) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Dictado no soportado");
    const recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.start();
    setIsListening(campo);
    recognition.onresult = (e) => {
      document.getElementsByName(campo)[0].value = e.results[0][0].transcript;
      setIsListening(null);
    };
    recognition.onend = () => setIsListening(null);
  };

  // 📡 Realtime: Sincronización con Driver y Chat
  useEffect(() => {
    if (!supabase || !viajeActivo?.id) return;

    const channel = supabase.channel(`viaje-${viajeActivo.id}`)
      .on('postgres_changes', { event: 'INSERT', table: 'mensajes', filter: `viaje_id=eq.${viajeActivo.id}` }, 
        (payload) => setMensajes((prev) => [...prev, payload.new])
      )
      .on('postgres_changes', { event: 'UPDATE', table: 'viajes', filter: `id=eq.${viajeActivo.id}` }, 
        (payload) => setViajeActivo(payload.new)
      ).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [viajeActivo]);

  const pedirTaxi = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.from('viajes').insert([{
      origen: e.target.origen.value,
      destino: e.target.destino.value,
      estado_viaje: 'pendiente'
    }]).select().single();
    if (!error) setViajeActivo(data);
  };

  const enviarMensaje = async (e) => {
    e.preventDefault();
    if (!nuevoMsj.trim()) return;
    await supabase.from('mensajes').insert([{ viaje_id: viajeActivo.id, remitente: 'cliente', contenido: nuevoMsj }]);
    setNuevoMsj('');
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center w-full max-w-[414px] mx-auto">
      <header className="py-8">
        <h1 className="header-gradient text-4xl italic tracking-tighter">TAXMAD</h1>
      </header>

      {!viajeActivo ? (
        <form onSubmit={pedirTaxi} className="w-full space-y-4 animate-in fade-in duration-500">
          <div className="card-txmd space-y-6">
            <p className="text-[10px] text-neon-blue font-black tracking-widest uppercase">Reserva Premium</p>
            {['origen', 'destino'].map(campo => (
              <div key={campo} className="relative">
                <label className="text-[9px] font-bold text-zinc-500 uppercase ml-1">{campo}</label>
                <div className="flex gap-2 border-b border-zinc-800 focus-within:border-neon-green transition-all">
                  <input name={campo} required className="flex-1 bg-transparent p-3 outline-none font-bold" placeholder={`¿${campo}?`} />
                  <button type="button" onClick={() => handleDictado(campo)} className={`p-2 ${isListening === campo ? 'text-red-500 animate-pulse' : 'text-zinc-600'}`}>🎤</button>
                </div>
              </div>
            ))}
          </div>
          <button type="submit" className="btn-main mt-4">Solicitar TaxMad</button>
        </form>
      ) : (
        <div className="w-full space-y-6 animate-in zoom-in duration-300">
          <div className="card-txmd text-center border-neon-blue">
            <div className="text-4xl mb-4">{viajeActivo.estado_viaje === 'aceptado' ? '🚕' : '📡'}</div>
            <h2 className="text-xl font-bold uppercase tracking-tighter">
              {viajeActivo.estado_viaje === 'aceptado' ? 'Conductor en camino' : 'Buscando tu unidad...'}
            </h2>
            <button onClick={() => setShowChat(true)} className="btn-main !bg-zinc-900 !text-neon-green border border-zinc-800 mt-8 !py-3 text-xs">
              Chat Directo 💬
            </button>
          </div>
        </div>
      )}

      {/* CHAT MODAL CLIENTE */}
      {showChat && (
        <div className="fixed inset-0 bg-black z-[5000] p-6 flex flex-col animate-in slide-in-from-bottom">
          <div className="flex justify-between items-center mb-8">
            <span className="header-gradient text-xl">Tu Conductor</span>
            <button onClick={() => setShowChat(false)} className="text-zinc-500 font-bold uppercase text-[10px]">Cerrar</button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-4 no-scrollbar">
            {mensajes.map((m, i) => (
              <div key={i} className={`flex ${m.remitente === 'cliente' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-4 rounded-2xl max-w-[85%] text-sm font-bold ${m.remitente === 'cliente' ? 'bg-neon-blue text-black' : 'bg-zinc-900 text-white border border-zinc-800'}`}>
                  {m.contenido}
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={enviarMensaje} className="mt-6 flex gap-2">
            <input value={nuevoMsj} onChange={(e) => setNuevoMsj(e.target.value)} placeholder="Escribe..." className="input-auth flex-1 !mb-0" />
            <button type="submit" className="bg-neon-green text-black px-6 rounded-xl font-black">OK</button>
          </form>
        </div>
      )}
    </div>
  );
}
