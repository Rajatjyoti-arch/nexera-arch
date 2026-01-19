-- Create notice_reads table
CREATE TABLE public.notice_reads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notice_id UUID REFERENCES public.notices(id) ON DELETE CASCADE NOT NULL,
    user_id UUID NOT NULL,
    read_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (notice_id, user_id)
);

ALTER TABLE public.notice_reads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own reads" ON public.notice_reads FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can mark notices as read" ON public.notice_reads FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create attendance table
CREATE TABLE public.attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT NOT NULL DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late', 'excused')),
    marked_by UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (student_id, class_id, date)
);

ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students can view own attendance" ON public.attendance FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Faculty can view class attendance" ON public.attendance FOR SELECT USING (true);
CREATE POLICY "Faculty can mark attendance" ON public.attendance FOR INSERT WITH CHECK (auth.uid() = marked_by);
CREATE POLICY "Faculty can update attendance" ON public.attendance FOR UPDATE USING (auth.uid() = marked_by);

-- Create announcements table
CREATE TABLE public.announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_by UUID NOT NULL,
    target_audience TEXT DEFAULT 'all' CHECK (target_audience IN ('all', 'students', 'faculty', 'admin')),
    is_active BOOLEAN DEFAULT true,
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Announcements are viewable" ON public.announcements FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can create announcements" ON public.announcements FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Admins can update announcements" ON public.announcements FOR UPDATE USING (auth.uid() = created_by);

-- Create reports table
CREATE TABLE public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    type TEXT DEFAULT 'general',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved', 'closed')),
    submitted_by UUID NOT NULL,
    assigned_to UUID,
    priority TEXT DEFAULT 'normal',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own reports" ON public.reports FOR SELECT USING (auth.uid() = submitted_by);
CREATE POLICY "Admins can view all reports" ON public.reports FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Users can submit reports" ON public.reports FOR INSERT WITH CHECK (auth.uid() = submitted_by);
CREATE POLICY "Users can update own reports" ON public.reports FOR UPDATE USING (auth.uid() = submitted_by);

-- Create wellness_logs table
CREATE TABLE public.wellness_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    mood TEXT,
    energy_level INTEGER,
    stress_level INTEGER,
    sleep_hours NUMERIC,
    notes TEXT,
    logged_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.wellness_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own wellness logs" ON public.wellness_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create wellness logs" ON public.wellness_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Add semester column to student_profiles if not exists
ALTER TABLE public.student_profiles ADD COLUMN IF NOT EXISTS semester TEXT;

-- Create triggers
CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON public.announcements FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON public.reports FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();