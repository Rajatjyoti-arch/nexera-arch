-- Create table for heart rate readings
CREATE TABLE public.heart_rate_readings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  bpm INTEGER NOT NULL,
  measurement_method TEXT NOT NULL DEFAULT 'webcam',
  signal_quality TEXT,
  notes TEXT,
  measured_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.heart_rate_readings ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own heart rate readings"
ON public.heart_rate_readings FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own heart rate readings"
ON public.heart_rate_readings FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Counselors can view assigned students heart rate readings"
ON public.heart_rate_readings FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM counselor_assignments ca
    WHERE ca.counselor_id = auth.uid()
    AND ca.student_id = heart_rate_readings.user_id
    AND ca.is_active = true
  )
);

CREATE POLICY "Admins can view all heart rate readings"
ON public.heart_rate_readings FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.heart_rate_readings;