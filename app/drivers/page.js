"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

// conexión a Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function DriversPage() {

  const [user, setUser] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [gpsStatus, setGpsStatus] = useState("GPS en espera");

  // obtener usuario de sesión
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(data.user);
      }
    };

    getUser();
  }, []);

  // iniciar GPS
  useEffect(() => {

    if (!("geolocation" in navigator)) {
      setGpsStatus("GPS no disponible");
      return;
    }

    navigator.geolocation.watchPosition(
      (position) => {
        setGpsStatus("GPS activo");

        console.log("Lat:", position.coords.latitude);
        console.log("Lng:", position.coords.longitude);

      },
      (error) => {
        console.error(error);
        setGpsStatus("GPS bloqueado");
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 10000
      }
    );

  }, []);

  // cambiar estado online/offline
  const toggleOnlineStatus = async () => {

    if (!user) {
      console.log("Usuario no cargado");
      return;
    }

    const nuevoEstado = !isConnected;
    setIsConnected(nuevoEstado);

    const { error } = await supabase
      .from("conductores")
      .update({ online: nuevoEstado })
      .eq("id", user.id);

    if (error) {
      console.error("Error al actualizar estado:", error);
      setIsConnected(!nuevoEstado);
    } else {
      console.log(`Estado cambiado a: ${nuevoEstado ? "ONLINE" : "OFFLINE"}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">

      <h1 className="text-4xl font-black mb-8">
        TAX<span className="text-green-400">MAD</span>
      </h1>

      <div className="bg-[#0d1626] p-10 rounded-3xl shadow-lg text-center w-[320px]">

        <div className="flex justify-between mb-6">
          <span>Sistema</span>
          <span className={`px-3 py-1 rounded-full text-sm ${
            isConnected ? "bg-green-500 text-black" : "bg-gray-600"
          }`}>
            {isConnected ? "ONLINE" : "OFFLINE"}
          </span>
        </div>

        <p className="text-gray-400 mb-8">{gpsStatus}</p>

        <button
          onClick={toggleOnlineStatus}
          className={`w-full p-4 rounded-xl font-bold ${
            isConnected
              ? "bg-[#39FF14] text-black"
              : "bg-red-500 text-white"
          }`}
        >
          {isConnected ? "ONLINE" : "OFFLINE"}
        </button>

      </div>

    </div>
  );
}
