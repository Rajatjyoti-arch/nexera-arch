-- Create user_settings table for preferences
CREATE TABLE public.user_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  theme TEXT NOT NULL DEFAULT 'system',
  notifications_notices BOOLEAN NOT NULL DEFAULT true,
  notifications_messages BOOLEAN NOT NULL DEFAULT true,
  notifications_reminders BOOLEAN NOT NULL DEFAULT true,
  sound_effects BOOLEAN NOT NULL DEFAULT true,
  language TEXT NOT NULL DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own settings"
ON public.user_settings FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own settings"
ON public.user_settings FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own settings"
ON public.user_settings FOR UPDATE
USING (user_id = auth.uid());

-- Create index
CREATE INDEX idx_user_settings_user ON public.user_settings(user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_user_settings_updated_at
BEFORE UPDATE ON public.user_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();