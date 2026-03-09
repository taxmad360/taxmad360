'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function ClientApp() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  
  // ... mantén aquí tus otros estados (viajeActivo, mensajes, etc.)

  // Verificar si hay sesión activa al cargar
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    const { error } = isLogin 
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });
    
    if (error) alert(error.message);
  };

  // SI NO HAY USUARIO, MOSTRAR LOGIN
  if (!user) {
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

  // SI YA HAY USUARIO, MOSTRAR TU APP (el código que ya tenías)
  return (
    <div className="...">
       {/* ... Aquí pones todo tu código de pedir taxi que tenías antes ... */}
       <button onClick={() => supabase.auth.signOut()} className="text-[10px] text-red-500 mt-10">Cerrar Sesión</button>
    </div>
  );
}
