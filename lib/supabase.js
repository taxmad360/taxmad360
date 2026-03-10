import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log("DEBUG - URL detectada:", supabaseUrl)
console.log("DEBUG - KEY detectada:", supabaseAnonKey)

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("¡ERROR FATAL! Las variables de entorno de Supabase no están configuradas.")
}

export const supabase = createClient(supabaseUrl || 'https://placeholder.com', supabaseAnonKey || 'placeholder-key')
