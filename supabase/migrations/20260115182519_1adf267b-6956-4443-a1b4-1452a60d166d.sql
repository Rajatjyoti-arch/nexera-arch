-- Create attendance table for tracking student attendance per class session
CREATE TABLE public.attendance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
  marked_by UUID NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  -- Prevent duplicate attendance records for same student/class/date
  UNIQUE(student_id, class_id, date)
);

-- Enable RLS
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- RLS Policies for attendance table

-- Students can view their own attendance
CREATE POLICY "Students can view their own attendance"
ON public.attendance
FOR SELECT
USING (student_id = auth.uid());

-- Faculty can view attendance for classes they teach
CREATE POLICY "Faculty can view attendance for their classes"
ON public.attendance
FOR SELECT
USING (is_teaching_class(auth.uid(), class_id));

-- Faculty can insert attendance for their classes
CREATE POLICY "Faculty can mark attendance for their classes"
ON public.attendance
FOR INSERT
WITH CHECK (is_teaching_class(auth.uid(), class_id) AND marked_by = auth.uid());

-- Faculty can update attendance for their classes
CREATE POLICY "Faculty can update attendance for their classes"
ON public.attendance
FOR UPDATE
USING (is_teaching_class(auth.uid(), class_id))
WITH CHECK (is_teaching_class(auth.uid(), class_id));

-- Admins have full access
CREATE POLICY "Admins have full access to attendance"
ON public.attendance
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create indexes for efficient querying
CREATE INDEX idx_attendance_student_id ON public.attendance(student_id);
CREATE INDEX idx_attendance_class_id ON public.attendance(class_id);
CREATE INDEX idx_attendance_date ON public.attendance(date);
CREATE INDEX idx_attendance_student_class ON public.attendance(student_id, class_id);

-- Create trigger for updated_at
CREATE TRIGGER update_attendance_updated_at
BEFORE UPDATE ON public.attendance
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();