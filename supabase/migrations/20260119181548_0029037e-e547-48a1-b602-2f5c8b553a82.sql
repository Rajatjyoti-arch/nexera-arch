-- Add status column to faculty_profiles
ALTER TABLE public.faculty_profiles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';

-- Add code column to departments
ALTER TABLE public.departments ADD COLUMN IF NOT EXISTS code TEXT;
ALTER TABLE public.departments ADD COLUMN IF NOT EXISTS description TEXT;

-- Add department_id column to courses
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES public.departments(id);
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS duration_years INTEGER DEFAULT 4;

-- Add admin_notes and resolved columns to reports
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS resolved_by UUID;
ALTER TABLE public.reports ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMP WITH TIME ZONE;