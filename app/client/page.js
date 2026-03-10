'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { obtenerDistanciaGoogle, calcularTarifaTaxMad } from '@/lib/utils/tarifa'

export default function ClientApp() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  
  const [viajeActivo, setViajeActivo] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMsj, setNuevoMsj] = useState('');
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
    const { data } = supabase.auth.onAuthStateChange((_, session) => setUser(session?.user ?? null));
    return () => data.subscription.unsubscribe();
  }, []);

  // 1. TELEMETRÍA: Envío de ubicación cada 3 min
  useEffect(() => {
    if (!user) return;

    const enviarUbicacion = () => {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;
        await supabase.from('ubicaciones').upsert({
          user_id: user.id,
          latitud: latitude,
          longitud: longitude,
          updated_at: new Date().toISOString()
        });
      }, (err) => console.error("Error GPS:", err));
    };

    enviarUbicacion();
    const interval = setInterval(enviarUbicacion, 180000); // 3 minutos
    return () => clearInterval(interval);
  }, [user]);

  // 2. REALTIME: Sincronización de Viajes y Chat
  useEffect(() => {
    if (!viajeActivo?.id) return;
    const channel = supabase.channel(`viaje-${viajeActivo.id}`)
      .on('postgres_changes', { event: 'INSERT', table: 'mensajes', filter: `viaje_id=eq.${viajeActivo.id}` }, 
        (payload) => setMensajes((prev) => [...prev, payload.new])
      )
      .on('postgres_changes', { event: 'UPDATE', table: 'viajes', filter: `id=eq.${viajeActivo.id}` }, 
        (payload) => setViajeActivo(payload.new)
      ).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [viajeActivo]);

  const handleAuth = async (e) => {
    e.preventDefault();
    const { error } = isLogin 
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });
    if (error) alert(error.message);
  };

  const pedirTaxi = async (e) => {
    e.preventDefault();
    const origen = e.target.origen.value;
    const destino = e.target.destino.value;

    const km = await obtenerDistanciaGoogle(origen, destino);
    const precio = calcularTarifaTaxMad({ distanciaKm: km, fechaHora: new Date() });

    const { data, error } = await supabase.from('viajes').insert([{
      origen,
      destino,
      km,
      precio,
      estado_viaje: 'pendiente',
      user_id: user.id
    }]).select().single();

    if (!error) setViajeActivo(data);
    else alert("Error al solicitar: " + error.message);
  };

  const enviarMensaje = async (e) => {
    e.preventDefault();
    if (!nuevoMsj.trim()) return;
    await supabase.from('mensajes').insert([{ viaje_id: viajeActivo.id, remitente: 'cliente', contenido: nuevoMsj }]);
    setNuevoMsj('');
  };

  if (!user) {
    // ... (Tu UI de Login que ya tenías)
    return (
      <div className="min-h-screen bg-black text-white p-8 flex flex-col justify-center max-w-[414px] mx-auto">
        <h1 className="text-4xl italic font-black mb-10 header-gradient">TAXMAD {isLogin ? 'LOGIN' : 'REGISTRO'}</h1>
        <form onSubmit={handleAuth} className="space-y-4">
          <input type="email" placeholder="Email" className="input-auth" onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="Contraseña" className="input-auth" onChange={(e) => setPassword(e.target.value)} />
          <button className="btn-main w-full">{isLogin ? 'Entrar' : 'Crear Cuenta'}</button>
        </form>
        <button onClick={() => setIsLogin(!isLogin)} className="text-zinc-500 text-xs mt-4 underline">
          {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center w-full max-w-[414px] mx-auto">
      <header className="py-8 flex justify-between w-full">
        <h1 className="header-gradient text-4xl italic tracking-tighter">TAXMAD</h1>
        <button onClick={() => supabase.auth.signOut()} className="text-[10px] text-zinc-600">Salir</button>
      </header>

      {!viajeActivo ? (
        <form onSubmit={pedirTaxi} className="w-full space-y-4">
          <div className="card-txmd space-y-6">
            {['origen', 'destino'].map(campo => (
              <input key={campo} name={campo} required className="w-full bg-transparent border-b border-zinc-800 p-3 outline-none" placeholder={`¿${campo}?`} />
            ))}
          </div>
          <button type="submit" className="btn-main mt-4">Solicitar TaxMad</button>
        </form>
      ) : (
        <div className="w-full card-txmd text-center border-neon-blue">
          <h2 className="text-xl font-bold">{viajeActivo.estado_viaje === 'aceptado' ? '🚕 Conductor en camino' : '📡 Buscando...'}</h2>
          <p className="text-sm text-neon-green mt-2">Precio estimado: {viajeActivo.precio}€</p>
          <button onClick={() => setShowChat(true)} className="btn-main mt-4">Chat Directo 💬</button>
        </div>
      )}

      {showChat && (
        <div className="fixed inset-0 bg-black z-[5000] p-6 flex flex-col">
          <button onClick={() => setShowChat(false)} className="text-left text-zinc-500">Cerrar</button>
          <div className="flex-1 overflow-y-auto space-y-2 mt-4">
            {mensajes.map((m, i) => <div key={i} className="p-2 bg-zinc-900 rounded text-sm">{m.contenido}</div>)}
          </div>
          <form onSubmit={enviarMensaje} className="flex gap-2 mt-4">
            <input value={nuevoMsj} onChange={(e) => setNuevoMsj(e.target.value)} className="input-auth flex-1" placeholder="Mensaje..." />
            <button className="bg-neon-green text-black px-4 rounded font-bold text-xs uppercase">Enviar</button>
          </form>
        </div>
      )}
    </div>
  );
}
