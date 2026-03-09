'use client'
import { useState } from 'react'
import { calcularTarifaTaxMad } from '@/lib/utils/tarifa'

export default function TaxMadCliente() {
  const [form, setForm] = useState({ origen: '', destino: '' });
  const [precio, setPrecio] = useState(null);
  const [notificacion, setNotificacion] = useState('');

  const manejarReserva = (e) => {
    e.preventDefault();
    // Aquí recuperamos la lógica de "Buscando conductor" de tu index.html
    setNotificacion('¡Buscando conductor cercano!...');
    
    const total = calcularTarifaTaxMad({
      esAeropuerto: form.destino.toLowerCase().includes('aeropuerto'),
      distanciaKm: 12, 
      fechaHora: new Date(),
      esPrecontratado: true
    });
    
    setPrecio(total);
    setTimeout(() => setNotificacion(''), 3000);
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-white min-h-screen">
      {notificacion && <div className="fixed top-4 bg-green-500 text-white p-3 rounded">{notificacion}</div>}
      
      <h1 className="text-2xl font-bold mb-6">TaxMad — App Móvil</h1>
      
      <form onSubmit={manejarReserva} className="space-y-4">
        <input className="input-auth" placeholder="Origen" onChange={(e) => setForm({...form, origen: e.target.value})} />
        <input className="input-auth" placeholder="Destino" onChange={(e) => setForm({...form, destino: e.target.value})} />
        <button id="btnReservar" className="btn-main">Reservar</button>
      </form>
    </div>
  );
}
