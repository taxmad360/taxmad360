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
  const [distanciaEstimada, setDistanciaEstimada] = useState(0);
  const [mostrandoPrecio, setMostrandoPrecio] = useState(false);
  const [formDatos, setFormDatos] = useState({ origen: '', destino: '' });

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

  const handleDictado = (campo) => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Dictado no soportado");
    
    const recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.start();
    setIsListening(campo);
    recognition.onresult = (e) => {
      const texto = e.results[0][0].transcript;
      setFormDatos(prev => ({ ...prev, [campo]: texto }));
    };
    recognition.onend = () => setIsListening(null);
  };

  const revisarTarifa = async (e) => {
    e.preventDefault();
    if (!formDatos.origen || !formDatos.destino) return;
    const km = await obtenerDistanciaGoogle(formDatos.origen, formDatos.destino);
    setDistanciaEstimada(km || 10);
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

  const enviarMensaje = async (e) => {
    e.preventDefault();
    if (!nuevoMsj.trim() || !viajeActivo) return;
    await supabase.from('mensajes').insert([{ 
      viaje_id: viajeActivo.id, remitente: 'cliente', contenido: nuevoMsj.trim() 
    }]);
    setNuevoMsj('');
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center w-full max-w-[414px] mx-auto font-sans">
      <header className="py-8">
        <h1 className="text-4xl italic font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-[#39FF14] to-white">TAXMAD</h1>
      </header>

      {!viajeActivo ? (
        <div className="w-full space-y-4">
          <form onSubmit={revisarTarifa} className="w-full space-y-4">
            <div className="bg-zinc-900/50 p-6 rounded-[32px] border border-white/5 space-y-6">
              <p className="text-[10px] text-[#39FF14] font-black tracking-widest uppercase">Reserva 2026</p>
              {['origen', 'destino'].map(campo => (
                <div key={campo} className="relative">
                  <label className="text-[9px] font-bold text-zinc-500 uppercase ml-1">{campo}</label>
                  <div className="flex gap-2 border-b border-zinc-800 focus-within:border-[#39FF14]">
                    <input 
                      value={formDatos[campo]}
                      onChange={(e) => setFormDatos({...formDatos, [campo]: e.target.value})}
                      required 
                      className="flex-1 bg-transparent p-3 outline-none font-bold text-sm" 
                      placeholder={`¿Dirección de ${campo}?`} 
                    />
                    <button type="button" onClick={() => handleDictado(campo)} className={isListening === campo ? 'text-red-500 animate-pulse' : 'text-zinc-600'}>🎤</button>
                  </div>
                </div>
              ))}
            </div>
            <button type="submit" className="w-full bg-white text-black py-5 rounded-2xl font-black uppercase text-xs tracking-widest">Ver Precio</button>
          </form>

          {mostrandoPrecio && (
            <div className="fixed bottom-10 left-6 right-6 z-50 bg-zinc-900 border border-[#39FF14]/30 p-6 rounded-[32px] shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <p className="text-[#39FF14] text-[10px] font-black uppercase tracking-widest">Cerrado</p>
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
              <div className="flex gap-4">
                <button onClick={() => setMostrando
