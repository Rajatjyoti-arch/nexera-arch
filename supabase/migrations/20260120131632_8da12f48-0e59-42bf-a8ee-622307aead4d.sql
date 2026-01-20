-- Update existing pending students to active
UPDATE public.student_profiles SET status = 'active' WHERE status = 'pending';

-- Update existing pending faculty to active
UPDATE public.faculty_profiles SET status = 'active' WHERE status = 'pending';

-- Change default for future records
ALTER TABLE public.student_profiles ALTER COLUMN status SET DEFAULT 'active';
ALTER TABLE public.faculty_profiles ALTER COLUMN status SET DEFAULT 'active';