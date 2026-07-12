import * as dotenv from 'dotenv';


dotenv.config();


export const config = {
  supabase: {
    url: process.env.SUPABASE_URL || '',
    key: process.env.SUPABASE_ANON_KEY || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  }
};