const FESTIVOS_MADRID_2026 = [
  "2026-01-01", "2026-01-06", "2026-04-02", "2026-04-03", "2026-05-01", 
  "2026-05-15", "2026-08-15", "2026-10-12", "2026-11-09", "2026-12-08", "2026-12-25"
];

export async function obtenerDistanciaGoogle(origen, destino) {
  // Verificación de entorno de ejecución
  if (typeof window === 'undefined' || !window.google?.maps) {
    return 10; // Fallback para Build de Vercel
  }

  try {
    const service = new window.google.maps.DistanceMatrixService();
    const response = await service.getDistanceMatrix({
      origins: [origen],
      destinations: [destino],
      travelMode: 'DRIVING',
    });

    if (response.rows[0].elements[0].status === "OK") {
      return response.rows[0].elements[0].distance.value / 1000;
    }
    return 10;
  } catch (e) { return 10; }
}

export function calcularTarifaTaxMad({ esAeropuerto, esDentroM30, distanciaKm, fechaHora, esPrecontratado }) {
  const fecha = fechaHora instanceof Date ? fechaHora : new Date();
  const hora = fecha.getHours();
  const esNocturno = (hora >= 21 || hora < 7);
  const esFestivo = FESTIVOS_MADRID_2026.includes(fecha.toISOString().split('T')[0]);
  
  let total = 0;
  const TARIFA_GESTION = 7.00;

  if (esAeropuerto && esDentroM30) {
    total = 33.00;
  } else {
    const base = esNocturno || esFestivo ? { bajada: 3.20, km: 1.60 } : { bajada: 2.55, km: 1.40 };
    total = base.bajada + (distanciaKm * base.km);
  }

  if (esPrecontratado) total += TARIFA_GESTION;
  return parseFloat(total.toFixed(2));
}
