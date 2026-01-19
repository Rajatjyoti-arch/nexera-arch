
-- =============================================
-- NexEra Learn Core Schema - Tables & RLS
-- =============================================

-- 1️⃣ Create unified user_profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name text NOT NULL,
    username text UNIQUE NOT NULL,
    avatar_url text,
    bio text,
    university text,
    department_id uuid REFERENCES public.departments(id) ON DELETE SET NULL,
    course_id uuid REFERENCES public.courses(id) ON DELETE SET NULL,
    semester text,
    linkedin_url text,
    github_url text,
    portfolio_url text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2️⃣ Create classes table
CREATE TABLE IF NOT EXISTS public.classes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    faculty_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name text NOT NULL,
    room text,
    year text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- 3️⃣ Create class_schedules table
CREATE TABLE IF NOT EXISTS public.class_schedules (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    day_of_week text NOT NULL CHECK (day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
    start_time time NOT NULL,
    end_time time NOT NULL,
    CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- 4️⃣ Create student_enrollments table
CREATE TABLE IF NOT EXISTS public.student_enrollments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    enrolled_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (student_id, class_id)
);

-- 5️⃣ Create faculty_classes mapping table
CREATE TABLE IF NOT EXISTS public.faculty_classes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    faculty_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    UNIQUE (faculty_id, class_id)
);

-- =============================================
-- Enable RLS on all tables
-- =============================================
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty_classes ENABLE ROW LEVEL SECURITY;

-- =============================================
-- Security Definer Functions for RLS
-- =============================================

-- Check if user is enrolled in a class
CREATE OR REPLACE FUNCTION public.is_enrolled_in_class(_user_id uuid, _class_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.student_enrollments
    WHERE student_id = _user_id
      AND class_id = _class_id
  )
$$;

-- Check if faculty teaches a class
CREATE OR REPLACE FUNCTION public.is_teaching_class(_user_id uuid, _class_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.classes
    WHERE faculty_id = _user_id
      AND id = _class_id
  ) OR EXISTS (
    SELECT 1
    FROM public.faculty_classes
    WHERE faculty_id = _user_id
      AND class_id = _class_id
  )
$$;

-- =============================================
-- RLS Policies: user_profiles
-- =============================================
CREATE POLICY "Users can view their own profile"
ON public.user_profiles FOR SELECT
USING (id = auth.uid());

CREATE POLICY "Users can update their own profile"
ON public.user_profiles FOR UPDATE
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

CREATE POLICY "Users can insert their own profile"
ON public.user_profiles FOR INSERT
WITH CHECK (id = auth.uid());

CREATE POLICY "Admins can view all user profiles"
ON public.user_profiles FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all user profiles"
ON public.user_profiles FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- =============================================
-- RLS Policies: classes
-- =============================================
CREATE POLICY "Students can view enrolled classes"
ON public.classes FOR SELECT
USING (is_enrolled_in_class(auth.uid(), id));

CREATE POLICY "Faculty can view their classes"
ON public.classes FOR SELECT
USING (is_teaching_class(auth.uid(), id));

CREATE POLICY "Admins have full access to classes"
ON public.classes FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- =============================================
-- RLS Policies: class_schedules
-- =============================================
CREATE POLICY "Students can view schedules of enrolled classes"
ON public.class_schedules FOR SELECT
USING (is_enrolled_in_class(auth.uid(), class_id));

CREATE POLICY "Faculty can view schedules of their classes"
ON public.class_schedules FOR SELECT
USING (is_teaching_class(auth.uid(), class_id));

CREATE POLICY "Admins have full access to schedules"
ON public.class_schedules FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- =============================================
-- RLS Policies: student_enrollments
-- =============================================
CREATE POLICY "Students can view their own enrollments"
ON public.student_enrollments FOR SELECT
USING (student_id = auth.uid());

CREATE POLICY "Faculty can view enrollments for their classes"
ON public.student_enrollments FOR SELECT
USING (is_teaching_class(auth.uid(), class_id));

CREATE POLICY "Admins have full access to enrollments"
ON public.student_enrollments FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- =============================================
-- RLS Policies: faculty_classes
-- =============================================
CREATE POLICY "Faculty can view their class assignments"
ON public.faculty_classes FOR SELECT
USING (faculty_id = auth.uid());

CREATE POLICY "Admins have full access to faculty_classes"
ON public.faculty_classes FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- =============================================
-- Trigger for updated_at on user_profiles
-- =============================================
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
BEFORE UPDATE ON public.user_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
