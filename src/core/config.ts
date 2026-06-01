import * as dotenv from 'dotenv';

// This will load the .env file and make the variables available in process.env
dotenv.config();

// Export the configuration object that can be used throughout the application to access environment variables related to Supabase
export const config = {
  supabase: {
    url: process.env.SUPABASE_URL || '',
    key: process.env.SUPABASE_ANON_KEY || '',
  }
};