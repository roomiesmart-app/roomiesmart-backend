ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS kinde_external_id VARCHAR(255) UNIQUE;

COMMENT ON COLUMN public.users.kinde_external_id IS 'Kinde user ID (sub claim from JWT)';
