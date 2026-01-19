-- Fix chat_participants infinite recursion by using a simpler policy
DROP POLICY IF EXISTS "Users can view participants of their chats" ON chat_participants;

-- Users can view their own participation and all participants in chats they belong to
-- Using a security definer function approach to avoid recursion
CREATE OR REPLACE FUNCTION public.user_is_chat_participant(_user_id uuid, _chat_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM chat_participants
    WHERE user_id = _user_id
      AND chat_id = _chat_id
  )
$$;

-- Create new policy using the function
CREATE POLICY "Users can view participants of their chats" 
ON chat_participants FOR SELECT 
USING (
  user_id = auth.uid() 
  OR public.user_is_chat_participant(auth.uid(), chat_id)
);

-- Allow faculty and admin to view all student profiles for chat functionality
CREATE POLICY "Faculty can view all student profiles"
ON student_profiles FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'faculty') 
  OR public.has_role(auth.uid(), 'admin')
);