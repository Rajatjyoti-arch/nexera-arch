-- Create user_settings table
CREATE TABLE public.user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    theme TEXT DEFAULT 'system',
    notifications_notices BOOLEAN DEFAULT true,
    notifications_messages BOOLEAN DEFAULT true,
    notifications_reminders BOOLEAN DEFAULT true,
    sound_effects BOOLEAN DEFAULT true,
    language TEXT DEFAULT 'en',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own settings"
ON public.user_settings FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
ON public.user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
ON public.user_settings FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_user_settings_updated_at
BEFORE UPDATE ON public.user_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create chats table
CREATE TABLE public.chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL DEFAULT 'direct' CHECK (type IN ('direct', 'group')),
    name TEXT,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;

-- Create chat_participants table
CREATE TABLE public.chat_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID REFERENCES public.chats(id) ON DELETE CASCADE NOT NULL,
    user_id UUID NOT NULL,
    last_read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_participants ENABLE ROW LEVEL SECURITY;

-- Create messages table
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID REFERENCES public.chats(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- RLS policies for chats (users can view chats they participate in)
CREATE POLICY "Users can view chats they participate in"
ON public.chats FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.chat_participants
        WHERE chat_participants.chat_id = chats.id
        AND chat_participants.user_id = auth.uid()
    )
);

CREATE POLICY "Users can create chats"
ON public.chats FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their chats"
ON public.chats FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.chat_participants
        WHERE chat_participants.chat_id = chats.id
        AND chat_participants.user_id = auth.uid()
    )
);

-- RLS policies for chat_participants
CREATE POLICY "Users can view participants of their chats"
ON public.chat_participants FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.chat_participants cp
        WHERE cp.chat_id = chat_participants.chat_id
        AND cp.user_id = auth.uid()
    )
);

CREATE POLICY "Users can add participants to their chats"
ON public.chat_participants FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.chats
        WHERE chats.id = chat_id
        AND chats.created_by = auth.uid()
    )
    OR user_id = auth.uid()
);

CREATE POLICY "Users can update their own participation"
ON public.chat_participants FOR UPDATE
USING (user_id = auth.uid());

-- RLS policies for messages
CREATE POLICY "Users can view messages in their chats"
ON public.messages FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.chat_participants
        WHERE chat_participants.chat_id = messages.chat_id
        AND chat_participants.user_id = auth.uid()
    )
);

CREATE POLICY "Users can send messages to their chats"
ON public.messages FOR INSERT
WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
        SELECT 1 FROM public.chat_participants
        WHERE chat_participants.chat_id = messages.chat_id
        AND chat_participants.user_id = auth.uid()
    )
);

-- Create wellness_sessions table
CREATE TABLE public.wellness_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('focus', 'meditation', 'breathing')),
    duration_seconds INTEGER NOT NULL DEFAULT 0,
    focus_duration_seconds INTEGER,
    completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.wellness_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own wellness sessions"
ON public.wellness_sessions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wellness sessions"
ON public.wellness_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_chats_updated_at
BEFORE UPDATE ON public.chats
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();