ALTER TABLE public.department_expenses
ADD COLUMN IF NOT EXISTS participants uuid[] DEFAULT NULL;

COMMENT ON COLUMN public.department_expenses.participants IS 'IDs de los usuarios entre quienes se divide el gasto (incluye al pagador si participa). NULL = se divide entre todos los miembros del departamento (comportamiento anterior).';
