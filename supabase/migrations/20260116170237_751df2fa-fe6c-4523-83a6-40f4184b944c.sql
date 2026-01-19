-- Add UPDATE policy for chats table (to update updated_at when sending messages)
CREATE POLICY "Participants can update chat updated_at" 
ON public.chats 
FOR UPDATE 
USING (is_chat_participant(auth.uid(), id))
WITH CHECK (is_chat_participant(auth.uid(), id));