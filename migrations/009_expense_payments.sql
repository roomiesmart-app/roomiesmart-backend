CREATE TABLE IF NOT EXISTS public.expense_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id uuid NOT NULL REFERENCES public.department_expenses(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id),
  amount numeric(10,2),
  paid_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (expense_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_expense_payments_expense
  ON public.expense_payments (expense_id);

COMMENT ON TABLE public.expense_payments IS 'Registro de pagos: cada fila indica que user_id ya pagó su parte del gasto expense_id al pagador original.';
COMMENT ON COLUMN public.expense_payments.amount IS 'Monto de la parte pagada (NULL en gastos legados sin lista de participantes).';
