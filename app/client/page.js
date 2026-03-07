'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

// Conexión limpia
const S_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/^Url\.\s*/i, '').trim();
const S_KEY = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();
const supabase = (S_URL.startsWith('http')) ? createClient(S_URL, S_KEY) : null;

export default function ClientApp() {
  const [viajeActivo, setViajeActivo] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMsj, setNuevoMsj] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [isListening, setIsListening] = useState(null);

  // 🎙️ Función de Dictado por Voz
  const handleDictado = (campo) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Dictado no soportado en este navegador");
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

  // 📡 Realtime: Escucha de mensajes y cambios en el viaje
  useEffect(() => {
    if (!supabase || !viajeActivo) return;

    const channel = supabase.channel(`viaje-${viajeActivo.id}`)
      .on('postgres_changes', { event: 'INSERT', table: 'mensajes', filter: `viaje_id=eq.${viajeActivo.id}` }, 
        (payload) => {
          setMensajes((prev) => [...prev, payload.new]);
          if (navigator.vibrate) navigator.vibrate(100);
        }
      )
      .on('postgres_changes', { event: 'UPDATE', table: 'viajes', filter: `id=eq.${viajeActivo.id}` }, 
        (payload) => { setViajeActivo(payload.new); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [viajeActivo]);

  const enviarMensaje = async (e) => {
    e.preventDefault();
    if (!nuevoMsj.trim()) return;
    await supabase.from('mensajes').insert([{ 
      viaje_id: viajeActivo.id, 
      remitente: 'cliente', 
      contenido: nuevoMsj 
    }]);
    setNuevoMsj('');
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center">
      <h1 className="text-4xl font-black italic mt-10 mb-8 tracking-tighter">TAX<span className="text-[#39FF14]">MAD</span></h1>

      {!viajeActivo ? (
        <div className="w-full max-w-md bg-zinc-900 p-8 rounded-[40px] border border-zinc-800">
           <p className="text-[10px] text-[#39FF14] font-black mb-6 uppercase tracking-widest text-center">Nueva Solicitud</p>
           <div className="space-y-6">
             {['origen', 'destino'].map(campo => (
               <div key={campo} className="relative">
                 <input name={campo} placeholder={campo.toUpperCase()} className="w-full bg-transparent border-b border-zinc-800 p-3 outline-none focus:border-[#39FF14] font-bold" />
                 <button onClick={() => handleDictado(campo)} className={`absolute right-0 top-2 p-2 rounded-full ${isListening === campo ? 'bg-red-500 animate-pulse' : 'text-zinc-500'}`}>🎤</button>
               </div>
             ))}
             <button onClick={() => setViajeActivo({id: 'temp-id', origen: 'Demo', destino: 'Demo', estado_viaje: 'pendiente'})} className="w-full bg-[#39FF14] text-black py-5 rounded-2xl font-black shadow-[0_10px_30px_rgba(57,255,20,0.2)]">SOLICITAR AHORA</button>
           </div>
        </div>
      ) : (
        <div className="w-full max-w-md animate-in zoom-in duration-300">
          <div className="bg-zinc-900 border-2 border-[#39FF14] rounded-[40px] p-8 text-center">
            <div className="text-5xl mb-4">🚕</div>
            <h2 className="text-xl font-black italic uppercase">Buscando tu unidad...</h2>
            <button onClick={() => setShowChat(true)} className="mt-8 w-full bg-zinc-800 py-4 rounded-2xl font-black text-[10px] tracking-widest uppercase">Abrir Chat de Mensajes</button>
          </div>
        </div>
      )}

      {/* --- MODAL DE CHAT --- */}
      <div className={`fixed inset-x-0 bottom-0 bg-zinc-900 border-t-2 border-[#39FF14] rounded-t-[40px] transition-all duration-500 z-[100] ${showChat ? 'h-[80vh]' : 'h-0 overflow-hidden'}`}>
        <div className="p-8 h-full flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <span className="text-[#39FF14] font-black italic">MENSAJES</span>
            <button onClick={() => setShowChat(false)} className="text-zinc-500 font-bold text-xs">CERRAR X</button>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {mensajes.map((m, i) => (
              <div key={i} className={`flex ${m.remitente === 'cliente' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-4 rounded-2xl max-w-[85%] font-bold text-sm ${m.remitente === 'cliente' ? 'bg-[#39FF14] text-black' : 'bg-zinc-800 text-white'}`}>
                  {m.contenido}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={enviarMensaje} className="mt-6 flex gap-2">
            <input value={nuevoMsj} onChange={(e) => setNuevoMsj(e.target.value)} placeholder="Escribe al conductor..." className="flex-1 bg-black p-4 rounded-2xl outline-none border border-zinc-800 focus:border-[#39FF14]" />
            <button type="submit" className="bg-[#39FF14] text-black px-6 rounded-2xl font-black">ENVIAR</button>
          </form>
        </div>
      </div>
    </div>
  );
}
