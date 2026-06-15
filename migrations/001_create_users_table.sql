-- pgvector extension is required for the ai_embedding column
CREATE EXTENSION IF NOT EXISTS vector;

-- Migration to create the users table with the specified columns and constraints
CREATE TABLE IF NOT EXISTS public.users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    preferences JSONB DEFAULT '{}'::jsonb,
    ai_embedding VECTOR(768),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


COMMENT ON TABLE public.users IS 'Migration to create the users table with the specified columns and constraints';
COMMENT ON COLUMN public.users.preferences IS 'For fast filtering';
COMMENT ON COLUMN public.users.ai_embedding IS 'pgvector (768) for Groq';