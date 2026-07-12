

INSERT INTO public.department_members (department_id, user_id, role)
SELECT d.id, d.created_by, 'owner'
FROM public.departments d
WHERE d.created_by IS NOT NULL
ON CONFLICT (department_id, user_id) DO NOTHING;
