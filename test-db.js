async function probarConexion() {
  const { data, error } = await supabase
    .from('clientes')
    .insert([{ nombre: 'Prueba', apellido: 'Usuario', usuario: 'test01' }])
    .select();

  if (error) console.error("Error al insertar:", error);
  else console.log("¡Cliente insertado con éxito!", data);
}
