-- Add 'counselor' to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'counselor';

-- Create counselor_profiles table with full professional profile
CREATE TABLE public.counselor_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  department TEXT,
  designation TEXT DEFAULT 'Counselor',
  specialization TEXT,
  qualifications TEXT,
  office_hours TEXT,
  availability_status TEXT DEFAULT 'available',
  years_of_experience INTEGER,
  languages_spoken TEXT[],
  bio TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create counselor_assignments table for flexible assignments
CREATE TABLE public.counselor_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  counselor_id UUID NOT NULL REFERENCES public.counselor_profiles(user_id) ON DELETE CASCADE,
  student_id UUID NOT NULL,
  assigned_by UUID NOT NULL,
  assignment_type TEXT DEFAULT 'general',
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(counselor_id, student_id, assignment_type)
);

-- Enable RLS
ALTER TABLE public.counselor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.counselor_assignments ENABLE ROW LEVEL SECURITY;

-- Counselor profile policies
CREATE POLICY "Counselors can view their own profile" ON public.counselor_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Counselors can update their own profile" ON public.counselor_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Counselors can insert their own profile" ON public.counselor_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can view counselor profiles for chat" ON public.counselor_profiles
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage all counselor profiles" ON public.counselor_profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role = 'admin'
    )
  );

-- Assignment policies
CREATE POLICY "Admins can manage assignments" ON public.counselor_assignments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role = 'admin'
    )
  );

CREATE POLICY "Counselors can view their assignments" ON public.counselor_assignments
  FOR SELECT USING (auth.uid() = counselor_id);

CREATE POLICY "Students can view their counselor assignments" ON public.counselor_assignments
  FOR SELECT USING (auth.uid() = student_id);

-- Update trigger for updated_at
CREATE TRIGGER update_counselor_profiles_updated_at
  BEFORE UPDATE ON public.counselor_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_counselor_assignments_updated_at
  BEFORE UPDATE ON public.counselor_assignments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();