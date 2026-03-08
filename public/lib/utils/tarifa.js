/**
 * Motor de cálculo de tarifas TaxMad 2026 con Integración Google Maps
 * Corregido para evitar errores de compilación en Vercel
 */

const FESTIVOS_MADRID_2026 = [
  "2026-01-01", "2026-01-06", "2026-04-02", "2026-04-03", 
  "2026-05-01", "2026-05-02", "2026-05-15", "2026-08-15", 
  "2026-10-12", "2026-11-02", "2026-11-09", "2026-12-07", 
  "2026-12-08", "2026-12-25"
];

// Función para obtener KM reales desde Google Maps
export async function obtenerDistanciaGoogle(origen, destino) {
  // PROTECCIÓN: Si no estamos en el navegador o Google no está cargado, devolvemos un estimado
  if (typeof window === 'undefined' || !window.google || !window.google.maps) {
    console.warn("Google Maps API no disponible en este entorno.");
    return 10; // Distancia por defecto para que la app no se rompa
  }

  try {
    const service = new window.google.maps.DistanceMatrixService();
    const response = await service.getDistanceMatrix({
      origins: [origen],
      destinations: [destino],
      travelMode: window.google.maps.TravelMode.DRIVING,
      unitSystem: window.google.maps.UnitSystem.METRIC,
    });

    if (response.rows[0].elements[0].status === "OK") {
      const distanciaMetros = response.rows[0].elements[0].distance.value;
      return distanciaMetros / 1000; // Retorna KM
    }
    return 10; // Fallback si la dirección no se encuentra
  } catch (error) {
    console.error("Error calculando distancia:", error);
    return 10;
  }
}

export function calcularTarifaTaxMad({
  esAeropuerto,
  esDentroM30,
  esEstacionIfema,
  distanciaKm,
  fechaHora,
  esPrecontratado
}) {
  // PROTECCIÓN: Validar que fechaHora sea un objeto Date válido
  const fecha = (fechaHora instanceof Date && !isNaN(fechaHora)) ? fechaHora : new Date();
  
  const hora = fecha.getHours();
  const diaSemana = fecha.getDay();
  const fechaISO = fecha.toISOString().split('T')[0];

  // 1. TARIFA PRECONTRATADA (Gestión)
  const TARIFA_PRECONTRATADO = 7.00;

  // 2. DETERMINAR TARIFA 2 (Nocturna/Festiva)
  const esFestivo = FESTIVOS_MADRID_2026.includes(fechaISO);
  const esFinDeSemana = (diaSemana === 0 || diaSemana === 6);
  const esNocturno = (hora >= 21 || hora < 7);
  const aplicarTarifa2 = esNocturno || esFinDeSemana || esFestivo;

  // 3. TARIFA 4: Aeropuerto <-> M-30 (33€ Fijo)
  if (esAeropuerto && esDentroM30) {
    let total = 33.00;
    if (esPrecontratado) total += TARIFA_PRECONTRATADO;
    return parseFloat(total.toFixed(2));
  }

  // 4. TARIFA 7: Estaciones / IFEMA (Mínimo 8€)
  if (esEstacionIfema) {
    const inicioT7 = 8.00;
    const metrosIncluidos = 1.450;
    const precioKmExtra = aplicarTarifa2 ? 1.60 : 1.40;
    const distanciaExtra = Math.max(0, (distanciaKm || 0) - (metrosIncluidos / 1000));
    
    let total = inicioT7 + (distanciaExtra * precioKmExtra);
    if (esPrecontratado) total += TARIFA_PRECONTRATADO;
    return parseFloat(total.toFixed(2));
  }

  // 5. TARIFA ESTÁNDAR (1 o 2)
  const config = aplicarTarifa2 
    ? { bajada: 3.20, km: 1.60 } 
    : { bajada: 2.55, km: 1.40 };

  let total = config.bajada + ((distanciaKm || 0) * config.km);

  // 6. SUPLEMENTOS ESPECIALES (Navidad)
  const esNocheEspecial = (fechaISO === "2026-12-24" || fechaISO === "2026-12-31") && esNocturno;
  if (esNocheEspecial) total += 7.00;

  if (esPrecontratado) total += TARIFA_PRECONTRATADO;

  return parseFloat(total.toFixed(2));
}
