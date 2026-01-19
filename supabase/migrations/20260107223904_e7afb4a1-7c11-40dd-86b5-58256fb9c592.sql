-- ==========================================
-- NexEra Learn - Complete Backend Schema
-- ==========================================

-- 1. Create custom types
CREATE TYPE public.app_role AS ENUM ('student', 'faculty', 'admin');
CREATE TYPE public.user_status AS ENUM ('pending', 'active', 'suspended');
CREATE TYPE public.chat_type AS ENUM ('direct', 'group');
CREATE TYPE public.report_status AS ENUM ('pending', 'reviewed', 'resolved', 'dismissed');
CREATE TYPE public.announcement_type AS ENUM ('normal', 'emergency');

-- ==========================================
-- 2. User Roles Table (SECURITY CRITICAL)
-- ==========================================
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checks
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to get user's role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id LIMIT 1
$$;

-- RLS for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- ==========================================
-- 3. Profiles Tables
-- ==========================================

-- Student Profiles
CREATE TABLE public.student_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    username TEXT NOT NULL UNIQUE,
    avatar_url TEXT,
    bio TEXT,
    college TEXT,
    course TEXT,
    year TEXT,
    semester TEXT,
    skills TEXT[] DEFAULT '{}',
    linkedin_url TEXT,
    github_url TEXT,
    portfolio_url TEXT,
    status user_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;

-- Faculty Profiles
CREATE TABLE public.faculty_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    avatar_url TEXT,
    department TEXT,
    designation TEXT,
    subjects TEXT[] DEFAULT '{}',
    office_hours TEXT,
    status user_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.faculty_profiles ENABLE ROW LEVEL SECURITY;

-- Admin Profiles
CREATE TABLE public.admin_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    avatar_url TEXT,
    department TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;

-- RLS for student_profiles
CREATE POLICY "Students can view all active student profiles"
ON public.student_profiles FOR SELECT
TO authenticated
USING (status = 'active' OR user_id = auth.uid() OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'faculty'));

CREATE POLICY "Students can update their own profile"
ON public.student_profiles FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Students can insert their own profile"
ON public.student_profiles FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all student profiles"
ON public.student_profiles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS for faculty_profiles
CREATE POLICY "Everyone can view active faculty profiles"
ON public.faculty_profiles FOR SELECT
TO authenticated
USING (status = 'active' OR user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Faculty can update their own profile"
ON public.faculty_profiles FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all faculty profiles"
ON public.faculty_profiles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS for admin_profiles
CREATE POLICY "Admins can view admin profiles"
ON public.admin_profiles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR user_id = auth.uid());

CREATE POLICY "Admins can update their own profile"
ON public.admin_profiles FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ==========================================
-- 4. Academic Structure Tables
-- ==========================================

-- Departments
CREATE TABLE public.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    code TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view departments"
ON public.departments FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage departments"
ON public.departments FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Courses
CREATE TABLE public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    duration_years INTEGER DEFAULT 4,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view courses"
ON public.courses FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage courses"
ON public.courses FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Batches
CREATE TABLE public.batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    year INTEGER NOT NULL,
    section TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view batches"
ON public.batches FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage batches"
ON public.batches FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- ==========================================
-- 5. Chat System
-- ==========================================

-- Chats (Conversations)
CREATE TABLE public.chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type chat_type NOT NULL DEFAULT 'direct',
    name TEXT, -- For group chats
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;

-- Chat Participants
CREATE TABLE public.chat_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID REFERENCES public.chats(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    last_read_at TIMESTAMP WITH TIME ZONE,
    UNIQUE (chat_id, user_id)
);

ALTER TABLE public.chat_participants ENABLE ROW LEVEL SECURITY;

-- Messages
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID REFERENCES public.chats(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Function to check chat membership
CREATE OR REPLACE FUNCTION public.is_chat_participant(_user_id UUID, _chat_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.chat_participants
    WHERE user_id = _user_id
      AND chat_id = _chat_id
  )
$$;

-- RLS for chats
CREATE POLICY "Users can view their chats"
ON public.chats FOR SELECT
TO authenticated
USING (public.is_chat_participant(auth.uid(), id));

CREATE POLICY "Users can create chats"
ON public.chats FOR INSERT
TO authenticated
WITH CHECK (created_by = auth.uid());

-- RLS for chat_participants
CREATE POLICY "Users can view participants of their chats"
ON public.chat_participants FOR SELECT
TO authenticated
USING (public.is_chat_participant(auth.uid(), chat_id));

CREATE POLICY "Users can add participants to chats they created"
ON public.chat_participants FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.chats
        WHERE id = chat_id AND created_by = auth.uid()
    )
    OR user_id = auth.uid()
);

-- RLS for messages
CREATE POLICY "Users can view messages in their chats"
ON public.messages FOR SELECT
TO authenticated
USING (public.is_chat_participant(auth.uid(), chat_id));

CREATE POLICY "Users can send messages to their chats"
ON public.messages FOR INSERT
TO authenticated
WITH CHECK (
    sender_id = auth.uid()
    AND public.is_chat_participant(auth.uid(), chat_id)
);

-- ==========================================
-- 6. Announcements & Notices
-- ==========================================

-- Institute Announcements (Admin)
CREATE TABLE public.announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type announcement_type NOT NULL DEFAULT 'normal',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view active announcements"
ON public.announcements FOR SELECT
TO authenticated
USING (is_active = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage announcements"
ON public.announcements FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Faculty Notices
CREATE TABLE public.notices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
    batch_id UUID REFERENCES public.batches(id) ON DELETE SET NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view active notices"
ON public.notices FOR SELECT
TO authenticated
USING (is_active = true OR created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Faculty can create notices"
ON public.notices FOR INSERT
TO authenticated
WITH CHECK (
    public.has_role(auth.uid(), 'faculty')
    AND created_by = auth.uid()
);

CREATE POLICY "Faculty can update their notices"
ON public.notices FOR UPDATE
TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Admins can manage all notices"
ON public.notices FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- ==========================================
-- 7. Wellness System
-- ==========================================

CREATE TABLE public.wellness_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    mood TEXT,
    stress_level INTEGER,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.wellness_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own wellness logs"
ON public.wellness_logs FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own wellness logs"
ON public.wellness_logs FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- ==========================================
-- 8. Reports & Moderation
-- ==========================================

CREATE TABLE public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reported_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    message_id UUID REFERENCES public.messages(id) ON DELETE SET NULL,
    reason TEXT NOT NULL,
    status report_status NOT NULL DEFAULT 'pending',
    admin_notes TEXT,
    resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create reports"
ON public.reports FOR INSERT
TO authenticated
WITH CHECK (reporter_id = auth.uid());

CREATE POLICY "Users can view their own reports"
ON public.reports FOR SELECT
TO authenticated
USING (reporter_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all reports"
ON public.reports FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- ==========================================
-- 9. Dashboard Stats Views
-- ==========================================

-- Function to get dashboard stats for admin
CREATE OR REPLACE FUNCTION public.get_admin_dashboard_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_students', (SELECT COUNT(*) FROM student_profiles),
        'active_students', (SELECT COUNT(*) FROM student_profiles WHERE status = 'active'),
        'pending_students', (SELECT COUNT(*) FROM student_profiles WHERE status = 'pending'),
        'total_faculty', (SELECT COUNT(*) FROM faculty_profiles),
        'total_departments', (SELECT COUNT(*) FROM departments),
        'total_courses', (SELECT COUNT(*) FROM courses),
        'pending_reports', (SELECT COUNT(*) FROM reports WHERE status = 'pending'),
        'active_announcements', (SELECT COUNT(*) FROM announcements WHERE is_active = true)
    ) INTO result;
    RETURN result;
END;
$$;

-- ==========================================
-- 10. Triggers for updated_at
-- ==========================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_student_profiles_updated_at
    BEFORE UPDATE ON public.student_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_faculty_profiles_updated_at
    BEFORE UPDATE ON public.faculty_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_admin_profiles_updated_at
    BEFORE UPDATE ON public.admin_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_chats_updated_at
    BEFORE UPDATE ON public.chats
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_messages_updated_at
    BEFORE UPDATE ON public.messages
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ==========================================
-- 11. Indexes for Performance
-- ==========================================

CREATE INDEX idx_student_profiles_user_id ON public.student_profiles(user_id);
CREATE INDEX idx_student_profiles_username ON public.student_profiles(username);
CREATE INDEX idx_student_profiles_status ON public.student_profiles(status);
CREATE INDEX idx_faculty_profiles_user_id ON public.faculty_profiles(user_id);
CREATE INDEX idx_messages_chat_id ON public.messages(chat_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX idx_chat_participants_user_id ON public.chat_participants(user_id);
CREATE INDEX idx_chat_participants_chat_id ON public.chat_participants(chat_id);
CREATE INDEX idx_reports_status ON public.reports(status);
CREATE INDEX idx_announcements_is_active ON public.announcements(is_active);
CREATE INDEX idx_notices_created_by ON public.notices(created_by);