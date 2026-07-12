import { createClient } from '@supabase/supabase-js';
import { config } from './config.js';


if (!config.supabase.url || !config.supabase.serviceRoleKey) {
  throw new Error("No están configuradas las credenciales de Supabase (SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY)");
}




export const supabase = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey
);