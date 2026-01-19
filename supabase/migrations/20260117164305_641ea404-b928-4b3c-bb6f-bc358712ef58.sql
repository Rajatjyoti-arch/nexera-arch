-- Create meditation_sessions table for tracking meditation practice
CREATE TABLE public.meditation_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  duration_seconds INTEGER NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  session_type TEXT NOT NULL DEFAULT 'meditation',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create focus_sessions table for tracking Pomodoro/focus sessions
CREATE TABLE public.focus_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  focus_duration_seconds INTEGER NOT NULL,
  break_duration_seconds INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  session_count INTEGER NOT NULL DEFAULT 1,
  task_label TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create breathing_sessions table for tracking breathing exercises  
CREATE TABLE public.breathing_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  duration_seconds INTEGER NOT NULL,
  pattern TEXT NOT NULL DEFAULT 'box',
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.meditation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.focus_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.breathing_sessions ENABLE ROW LEVEL SECURITY;

-- RLS policies for meditation_sessions
CREATE POLICY "Users can view their own meditation sessions"
ON public.meditation_sessions FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own meditation sessions"
ON public.meditation_sessions FOR INSERT
WITH CHECK (user_id = auth.uid());

-- RLS policies for focus_sessions
CREATE POLICY "Users can view their own focus sessions"
ON public.focus_sessions FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own focus sessions"
ON public.focus_sessions FOR INSERT
WITH CHECK (user_id = auth.uid());

-- RLS policies for breathing_sessions
CREATE POLICY "Users can view their own breathing sessions"
ON public.breathing_sessions FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own breathing sessions"
ON public.breathing_sessions FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Create indexes for performance
CREATE INDEX idx_meditation_sessions_user ON public.meditation_sessions(user_id, completed_at DESC);
CREATE INDEX idx_focus_sessions_user ON public.focus_sessions(user_id, completed_at DESC);
CREATE INDEX idx_breathing_sessions_user ON public.breathing_sessions(user_id, completed_at DESC);