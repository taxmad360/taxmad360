'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { calcularTarifaTaxMad, obtenerDistanciaGoogle } from '@/lib/utils/tarifa'

const S_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
const S_KEY = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();
const supabase = (S_URL.startsWith('http')) ? createClient(S_URL, S_KEY) : null;

export default function ClientApp() {
  const [viajeActivo, setViajeActivo] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMsj, setNuevoMsj] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [isListening, setIsListening] = useState(null);
  
  // Estados para el cálculo de precio
  const [distanciaEstimada, setDistanciaEstimada] = useState(0);
  const [mostrandoPrecio, setMostrandoPrecio] = useState(false);
  const [formDatos, setFormDatos] = useState({ origen: '', destino: '' });

  // 📡 Realtime: Sincronización
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

  // 🎙️ Dictado por Voz Mejorado
  const handleDictado = (campo) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Dictado no soportado");
    const recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.start();
    setIsListening(campo);
    recognition.onresult = (e) => {
      const texto = e.results[0][0].transcript;
      setFormDatos(prev => ({ ...prev, [campo]: texto }));
      setIsListening(null);
    };
    recognition.onend = () => setIsListening(null);
  };

  // 💰 Lógica de Pre-Visualización de Tarifa
  const revisarTarifa = async (e) => {
    e.preventDefault();
    if (!formDatos.origen || !formDatos.destino) return;
    
    // Llamamos a Google Maps (integrado en tarifa.js)
    const km = await obtenerDistanciaGoogle(formDatos.origen, formDatos.destino);
    setDistanciaEstimada(km || 10); // 10km fallback si falla Maps
    setMostrandoPrecio(true);
  };

  const confirmarPedido = async () => {
    const precioFinal = calcularTarifaTaxMad({
      esAeropuerto: formDatos.destino.toLowerCase().includes('aeropuerto'),
      esDentroM30: true,
      distanciaKm: distanciaEstimada,
      fechaHora: new Date(),
      esPrecontratado: true
    });

    const { data, error } = await supabase.from('viajes').insert([{
      origen: formDatos.origen,
      destino: formDatos.destino,
      precio: precioFinal,
      estado_viaje: 'pendiente'
    }]).select().single();
    
    if (!error) {
      setViajeActivo(data);
      setMostrandoPrecio(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center w-full max-w-[414px] mx-auto font-sans">
      <header className="py-8">
        <h1 className="text-4xl italic font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-neon-green to-white">TAXMAD</h1>
      </header>

      {!viajeActivo ? (
        <div className="w-full space-y-4">
          <form onSubmit={revisarTarifa} className="w-full space-y-4 animate-in fade-in duration-500">
            <div className="bg-zinc-900/50 p-6 rounded-[32px] border border-white/5 space-y-6">
              <p className="text-[10px] text-neon-green font-black tracking-widest uppercase">Reserva Premium 2026</p>
              {['origen', 'destino'].map(campo => (
                <div key={campo} className="relative">
                  <label className="text-[9px] font-bold text-zinc-500 uppercase ml-1">{campo}</label>
                  <div className="flex gap-2 border-b border-zinc-800 focus-within:border-neon-green transition-all">
                    <input 
                      value={formDatos[campo]}
                      onChange={(e) => setFormDatos({...formDatos, [campo]: e.target.value})}
                      required 
                      className="flex-1 bg-transparent p-3 outline-none font-bold text-sm" 
                      placeholder={`¿Dónde estás?`} 
                    />
                    <button type="button" onClick={() => handleDictado(campo)} className={`p-2 ${isListening === campo ? 'text-red-500 animate-pulse' : 'text-zinc-600'}`}>🎤</button>
                  </div>
                </div>
              ))}
            </div>
            <button type="submit" className="w-full bg-white text-black py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-neon-green transition-all">
              Ver Precio
            </button>
          </form>

          {/* CUADRO DE PRECIO (PRICE CARD) */}
          {mostrandoPrecio && (
            <div className="fixed bottom-10 left-6 right-6 z-50 animate-in slide-in-from-bottom-10">
              <div className="bg-zinc-900 border border-neon-green/30 p-6 rounded-[32px] shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <p className="text-neon-green text-[10px] font-black uppercase tracking-widest">Tarifa Cerrada</p>
                    <h3 className="font-bold text-lg">Premium Black</h3>
                  </div>
                  <div className="text-3xl font-black">
                    {calcularTarifaTaxMad({
                      esAeropuerto: formDatos.destino.toLowerCase().includes('aeropuerto'),
                      esDentroM30: true,
                      distanciaKm: distanciaEstimada,
                      fechaHora: new Date(),
                      esPrecontratado: true
                    })}€
                  </div>
                </div>
                <div className="flex gap-4 mb-6">
                   <button onClick={() => setMostrandoPrecio(false)} className="flex-1 py-4 text-xs font-bold text-zinc-500 uppercase">Cancelar</button>
                   <button onClick={confirmarPedido} className="flex-[2] bg-neon-green text-black py-4 rounded-xl font-black uppercase text-xs shadow-[0_0_20px_rgba(57,255,20,0.3)]">Confirmar</button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ESTADO DE VIAJE ACTIVO */
        <div className="w-full space-y-6 animate-in zoom-in duration-300">
          <div className="bg-zinc-900 border-2 border-neon-green p-8 rounded-[40px] text-center">
            <div className="text-5xl mb-6">{viajeActivo.estado_viaje === 'aceptado' ? '🚕' : '📡'}</div>
            <h2 className="text-2xl font-black uppercase italic tracking-tighter">
              {viajeActivo.estado_viaje === 'aceptado' ? 'Unidad en camino' : 'Buscando unidad...'}
            </h2>
            <p className="text-zinc-500 text-xs mt-2 font-bold uppercase tracking-widest">{viajeActivo.destino}</p>
            
            <button onClick={() => setShowChat(true)} className="w-full bg-white/5 border border-white/10 text-neon-green py-4 rounded-2xl mt-8 font-black text-xs tracking-widest">
              CHAT CON CONDUCTOR 💬
            </button>
          </div>
        </div>
      )}

      {/* CHAT MODAL */}
      {showChat && (
        <div className="fixed inset-0 bg-black z-[5000] p-6 flex flex-col animate-in slide-in-from-bottom">
          <div className="flex justify-between items-center mb-8">
            <span className="font-black italic text-xl tracking-tighter">CHAT <span className="text-neon-green">TXMD</span></span>
            <button onClick={() => setShowChat(false)} className="text-zinc-500 font-bold uppercase text-[10px] bg-white/5 px-4 py-2 rounded-full">Cerrar</button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-4 no-scrollbar">
            {mensajes.map((m, i) => (
              <div key={i} className={`flex ${m.remitente === 'cliente' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-4 rounded-2xl max-w-[85%] text-sm font-bold ${m.remitente === 'cliente' ? 'bg-neon-green text-black' : 'bg-zinc-900 text-white border border-white/5'}`}>
                  {m.contenido}
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={enviarMensaje} className="mt-6 flex gap-2">
            <input value={nuevoMsj} onChange={(e) => setNuevoMsj(e.target.value)} placeholder="Mensaje..." className="flex-1 bg-zinc-900 border border-white/10 p-4 rounded-2xl outline-none focus:border-neon-green transition-all" />
            <button type="submit" className="bg-neon-green text-black px-6 rounded-2xl font-black">ENVIAR</button>
          </form>
        </div>
      )}
    </div>
  );
}.
