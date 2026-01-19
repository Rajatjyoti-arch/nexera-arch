-- Add office_hours column to faculty_profiles table
ALTER TABLE public.faculty_profiles 
ADD COLUMN IF NOT EXISTS office_hours text;

-- Add subjects column if not exists (for subjects array)
ALTER TABLE public.faculty_profiles 
ADD COLUMN IF NOT EXISTS subjects text[];