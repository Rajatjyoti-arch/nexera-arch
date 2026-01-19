-- Add missing social link columns to student_profiles
ALTER TABLE public.student_profiles 
ADD COLUMN IF NOT EXISTS linkedin_url text,
ADD COLUMN IF NOT EXISTS github_url text,
ADD COLUMN IF NOT EXISTS portfolio_url text;

-- Add credential_url to user_certificates
ALTER TABLE public.user_certificates
ADD COLUMN IF NOT EXISTS credential_url text;