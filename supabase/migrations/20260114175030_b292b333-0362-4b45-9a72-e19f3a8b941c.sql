-- Create notice_reads table to track read state per user
CREATE TABLE public.notice_reads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  notice_id UUID NOT NULL REFERENCES public.notices(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(notice_id, user_id)
);

-- Enable RLS
ALTER TABLE public.notice_reads ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own read states
CREATE POLICY "Users can view their own notice reads"
ON public.notice_reads
FOR SELECT
USING (user_id = auth.uid());

-- Policy: Users can insert their own read states
CREATE POLICY "Users can mark notices as read"
ON public.notice_reads
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Policy: Users can delete their own read states (if needed for re-reading)
CREATE POLICY "Users can delete their own notice reads"
ON public.notice_reads
FOR DELETE
USING (user_id = auth.uid());

-- Add UPDATE policy to chat_participants so users can mark messages as read
CREATE POLICY "Users can update their own chat participation"
ON public.chat_participants
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Create index for faster queries
CREATE INDEX idx_notice_reads_user_id ON public.notice_reads(user_id);
CREATE INDEX idx_notice_reads_notice_id ON public.notice_reads(notice_id);

-- Enable realtime for notice_reads
ALTER PUBLICATION supabase_realtime ADD TABLE public.notice_reads;