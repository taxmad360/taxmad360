export const FESTIVOS_MADRID_2026 = ["2026-01-01", "2026-01-06", "2026-05-01", "2026-12-25"];

export function calcularTarifaTaxMad({ esAeropuerto, esDentroM30, esEstacionIfema, distanciaKm, fechaHora, esPrecontratado }) {
  const hora = fechaHora.getHours();
  const diaSemana = fechaHora.getDay();
  const fechaISO = fechaHora.toISOString().split('T')[0];
  const aplicarTarifa2 = (hora >= 21 || hora < 7) || diaSemana === 0 || diaSemana === 6 || FESTIVOS_MADRID_2026.includes(fechaISO);

  if (esAeropuerto && esDentroM30) return 33.00 + (esPrecontratado ? 7.00 : 0);
  
  if (esEstacionIfema) {
    const inicioT7 = 8.00;
    const precioKmExtra = aplicarTarifa2 ? 1.60 : 1.40;
    const distanciaExtra = Math.max(0, distanciaKm - 1.45);
    return parseFloat((inicioT7 + (distanciaExtra * precioKmExtra) + (esPrecontratado ? 7.00 : 0)).toFixed(2));
  }

  const config = aplicarTarifa2 ? { b: 3.20, k: 1.60 } : { b: 2.55, k: 1.40 };
  let total = config.b + (distanciaKm * config.k);
  if (esPrecontratado) total += 7.00;
  return parseFloat(total.toFixed(2));
}

  return parseFloat(total.toFixed(2));
}
