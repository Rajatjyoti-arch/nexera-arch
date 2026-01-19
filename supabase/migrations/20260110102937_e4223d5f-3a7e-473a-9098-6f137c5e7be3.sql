-- Add unique constraint to prevent duplicate skills per user
ALTER TABLE public.user_skills 
ADD CONSTRAINT user_skills_user_id_skill_unique UNIQUE (user_id, skill);

-- Add index for faster lookups on user_id for all profile-related tables
CREATE INDEX IF NOT EXISTS idx_user_skills_user_id ON public.user_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_user_projects_user_id ON public.user_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_user_certificates_user_id ON public.user_certificates(user_id);