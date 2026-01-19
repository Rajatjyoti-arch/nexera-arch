-- Create courses table
CREATE TABLE public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    description TEXT,
    credits INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public courses are viewable" ON public.courses FOR SELECT USING (true);

-- Create classes table
CREATE TABLE public.classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    room TEXT,
    year TEXT NOT NULL DEFAULT '1st Year',
    course_id UUID REFERENCES public.courses(id),
    faculty_id UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Classes are viewable" ON public.classes FOR SELECT USING (true);

-- Create class_schedules table
CREATE TABLE public.class_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
    day_of_week TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.class_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Schedules are viewable" ON public.class_schedules FOR SELECT USING (true);

-- Create faculty_classes junction table
CREATE TABLE public.faculty_classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    faculty_id UUID NOT NULL,
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (faculty_id, class_id)
);

ALTER TABLE public.faculty_classes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Faculty can view their class assignments" ON public.faculty_classes FOR SELECT USING (auth.uid() = faculty_id);

-- Create student_enrollments table
CREATE TABLE public.student_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
    enrolled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    status TEXT DEFAULT 'active',
    UNIQUE (student_id, class_id)
);

ALTER TABLE public.student_enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students can view their enrollments" ON public.student_enrollments FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "View class enrollment counts" ON public.student_enrollments FOR SELECT USING (true);

-- Create departments table
CREATE TABLE public.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Departments are viewable" ON public.departments FOR SELECT USING (true);

-- Create batches table
CREATE TABLE public.batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    department_id UUID REFERENCES public.departments(id),
    year TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Batches are viewable" ON public.batches FOR SELECT USING (true);

-- Create notices table
CREATE TABLE public.notices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_by UUID NOT NULL,
    department_id UUID REFERENCES public.departments(id),
    batch_id UUID REFERENCES public.batches(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Notices are viewable" ON public.notices FOR SELECT USING (is_active = true);
CREATE POLICY "Faculty can create notices" ON public.notices FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Faculty can update own notices" ON public.notices FOR UPDATE USING (auth.uid() = created_by);

-- Create posts table
CREATE TABLE public.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    content TEXT NOT NULL,
    type TEXT DEFAULT 'post' CHECK (type IN ('post', 'project', 'certificate')),
    project_id UUID,
    certificate_id UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Posts are viewable" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Users can create posts" ON public.posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts" ON public.posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts" ON public.posts FOR DELETE USING (auth.uid() = user_id);

-- Create user_projects table
CREATE TABLE public.user_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    tech_stack TEXT[],
    project_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Projects are viewable" ON public.user_projects FOR SELECT USING (true);
CREATE POLICY "Users can manage own projects" ON public.user_projects FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create user_certificates table
CREATE TABLE public.user_certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    title TEXT NOT NULL,
    issuer TEXT,
    issue_date TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_certificates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Certificates are viewable" ON public.user_certificates FOR SELECT USING (true);
CREATE POLICY "Users can manage own certificates" ON public.user_certificates FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create post_likes table
CREATE TABLE public.post_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (post_id, user_id)
);

ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Likes are viewable" ON public.post_likes FOR SELECT USING (true);
CREATE POLICY "Users can manage own likes" ON public.post_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own likes" ON public.post_likes FOR DELETE USING (auth.uid() = user_id);

-- Create post_comments table
CREATE TABLE public.post_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Comments are viewable" ON public.post_comments FOR SELECT USING (true);
CREATE POLICY "Users can create comments" ON public.post_comments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create saved_posts table
CREATE TABLE public.saved_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (post_id, user_id)
);

ALTER TABLE public.saved_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own saved posts" ON public.saved_posts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can save posts" ON public.saved_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unsave posts" ON public.saved_posts FOR DELETE USING (auth.uid() = user_id);

-- Create user_skills table
CREATE TABLE public.user_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    skill TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, skill)
);

ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Skills are viewable" ON public.user_skills FOR SELECT USING (true);
CREATE POLICY "Users can manage own skills" ON public.user_skills FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Add skills and bio columns to student_profiles
ALTER TABLE public.student_profiles ADD COLUMN IF NOT EXISTS skills TEXT[];
ALTER TABLE public.student_profiles ADD COLUMN IF NOT EXISTS bio TEXT;

-- Create wellness session tables
CREATE TABLE public.meditation_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    duration_seconds INTEGER NOT NULL DEFAULT 0,
    session_type TEXT DEFAULT 'meditation',
    notes TEXT,
    completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.meditation_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own meditation sessions" ON public.meditation_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create meditation sessions" ON public.meditation_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.focus_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    focus_duration_seconds INTEGER NOT NULL DEFAULT 0,
    break_duration_seconds INTEGER DEFAULT 0,
    session_count INTEGER DEFAULT 1,
    task_label TEXT,
    completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.focus_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own focus sessions" ON public.focus_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create focus sessions" ON public.focus_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.breathing_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    duration_seconds INTEGER NOT NULL DEFAULT 0,
    pattern TEXT DEFAULT 'box',
    completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.breathing_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own breathing sessions" ON public.breathing_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create breathing sessions" ON public.breathing_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON public.classes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_notices_updated_at BEFORE UPDATE ON public.notices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();