ALTER TABLE public.user_financial_preferences
ADD COLUMN IF NOT EXISTS expense_management VARCHAR(50),
ADD COLUMN IF NOT EXISTS shared_items TEXT[],
ADD COLUMN IF NOT EXISTS preferred_common_areas TEXT[];

COMMENT ON COLUMN public.user_financial_preferences.expense_management IS 'How roommates manage shared expenses: fondo-comun | division-digital | individual';
COMMENT ON COLUMN public.user_financial_preferences.shared_items IS 'Household items the user is willing to share with roommates';
COMMENT ON COLUMN public.user_financial_preferences.preferred_common_areas IS 'Common areas the user expects to share/use';
