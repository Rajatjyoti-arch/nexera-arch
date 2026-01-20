-- Add attachment columns to messages table
ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS attachment_url TEXT,
ADD COLUMN IF NOT EXISTS attachment_type TEXT,
ADD COLUMN IF NOT EXISTS attachment_name TEXT;

-- Create storage bucket for chat attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-attachments', 'chat-attachments', false)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for chat attachments bucket
-- Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload chat attachments"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'chat-attachments' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to view attachments from chats they're in
CREATE POLICY "Users can view chat attachments they have access to"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'chat-attachments'
  AND (
    -- User can see their own uploads
    auth.uid()::text = (storage.foldername(name))[1]
    OR
    -- User is a participant in the chat (folder structure: user_id/chat_id/filename)
    EXISTS (
      SELECT 1 FROM public.chat_participants cp
      WHERE cp.user_id = auth.uid()
      AND cp.chat_id::text = (storage.foldername(name))[2]
    )
  )
);

-- Allow users to delete their own attachments
CREATE POLICY "Users can delete their own chat attachments"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'chat-attachments'
  AND auth.uid()::text = (storage.foldername(name))[1]
);