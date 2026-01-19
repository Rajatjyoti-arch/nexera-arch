-- Fix the chats INSERT policy - change from RESTRICTIVE to PERMISSIVE
-- Drop and recreate with correct PERMISSIVE mode
DROP POLICY IF EXISTS "Users can create chats" ON chats;

CREATE POLICY "Users can create chats" 
ON chats FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = created_by);