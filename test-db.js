// 1. IMPORTACIONES SIEMPRE AL PRINCIPIO
import { supabase } from '../lib/utils/supabase';

// 2. LOG PARA DEPURAR (Si esto imprime 'undefined', el problema es la ruta o el export)
console.log("¿Qué es supabase?", supabase); 

// 3. DEFINICIÓN DE LA FUNCIÓN
async function probarConexion() {
  if (!supabase) {
    console.error("Supabase no está inicializado. Revisa lib/utils/supabase.js");
    return;
  }

  const { data, error } = await supabase
    .from('clientes')
    .insert([{ nombre: 'Prueba', apellido: 'Usuario', usuario: 'test01' }])
    .select();

  if (error) console.error("Error al insertar:", error);
  else console.log("¡Cliente insertado con éxito!", data);
}

// 4. EJECUCIÓN
probarConexion();
