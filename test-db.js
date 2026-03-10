async function probarConexion() {
  const { data, error } = await supabase
    .from('clientes')
    .insert([{ nombre: 'Prueba', apellido: 'Usuario', usuario: 'test01' }])
    .select();

  if (error) console.error("Error al insertar:", error);
  else console.log("¡Cliente insertado con éxito!", data);
}
import { supabase } from '../lib/utils/supabase'; // Asegura que la ruta sea correcta

console.log("¿Qué es supabase?", supabase); // Si esto imprime 'undefined' o 'null', el problema está en la exportación// ¡Añade esto debajo!
probarConexion();
