// 🟢 Función para cambiar estado online/offline
const toggleOnlineStatus = async () => {
  const nuevoEstado = !isConnected;
  setIsConnected(nuevoEstado);

  // Actualizamos en Supabase
  const { error } = await supabase
    .from('conductores')
    .update({ online: nuevoEstado })
    .eq('id', user.id); // Asegúrate de tener el user.id de la sesión

  if (error) {
    console.error("Error al actualizar estado:", error);
    setIsConnected(!nuevoEstado); // Revertir si falla
  } else {
    console.log(`Estado cambiado a: ${nuevoEstado ? 'ONLINE' : 'OFFLINE'}`);
  }
};

// ... luego en tu JSX:
<button 
  onClick={toggleOnlineStatus}
  className={`p-6 rounded-full font-black ${isConnected ? 'bg-[#39FF14] text-black' : 'bg-red-500 text-white'}`}
>
  {isConnected ? 'ONLINE' : 'OFFLINE'}
</button>
