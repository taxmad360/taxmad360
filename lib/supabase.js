import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Si las variables no están, exportamos un cliente simulado o lanzamos un error claro
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("ERROR: Variables de entorno de Supabase no encontradas.")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
