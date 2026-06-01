import { createClient } from '@supabase/supabase-js';
import { config } from './config.js';

// 1. Validation of environment variables for Supabase credentials
if (!config.supabase.url || !config.supabase.key) {
  throw new Error("There are no Supabase credentials available (SUPABASE_URL o SUPABASE_ANON_KEY)");
}

// 2. Creation of the database connection
export const supabase = createClient(config.supabase.url, config.supabase.key);
