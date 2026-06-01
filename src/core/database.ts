import { createClient } from '@supabase/supabase-js';
import { config } from './config.js';

// 1. Validación de variables de entorno para Supabase (usando la Service Role Key)
if (!config.supabase.url || !config.supabase.serviceRoleKey) {
  throw new Error("No están configuradas las credenciales de Supabase (SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY)");
}


// 2. Creación de la conexión con privilegios de administrador
export const supabase = createClient(
  config.supabase.url, 
  config.supabase.serviceRoleKey
);