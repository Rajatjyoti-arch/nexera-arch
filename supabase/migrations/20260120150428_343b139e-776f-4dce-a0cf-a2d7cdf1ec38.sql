-- Create counselor_appointments table for booking sessions
CREATE TABLE public.counselor_appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  counselor_id UUID NOT NULL REFERENCES counselor_profiles(user_id) ON DELETE CASCADE,
  appointment_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  reason TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.counselor_appointments ENABLE ROW LEVEL SECURITY;

-- Students can view their own appointments
CREATE POLICY "Students can view their own appointments"
ON public.counselor_appointments
FOR SELECT
USING (auth.uid() = student_id);

-- Students can create appointments for themselves
CREATE POLICY "Students can create their own appointments"
ON public.counselor_appointments
FOR INSERT
WITH CHECK (auth.uid() = student_id);

-- Students can cancel their own pending appointments
CREATE POLICY "Students can update their own appointments"
ON public.counselor_appointments
FOR UPDATE
USING (auth.uid() = student_id);

-- Counselors can view appointments assigned to them
CREATE POLICY "Counselors can view their appointments"
ON public.counselor_appointments
FOR SELECT
USING (auth.uid() = counselor_id);

-- Counselors can update appointments assigned to them
CREATE POLICY "Counselors can update their appointments"
ON public.counselor_appointments
FOR UPDATE
USING (auth.uid() = counselor_id);

-- Add trigger for updated_at
CREATE TRIGGER update_counselor_appointments_updated_at
BEFORE UPDATE ON public.counselor_appointments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for appointments
ALTER PUBLICATION supabase_realtime ADD TABLE public.counselor_appointments;