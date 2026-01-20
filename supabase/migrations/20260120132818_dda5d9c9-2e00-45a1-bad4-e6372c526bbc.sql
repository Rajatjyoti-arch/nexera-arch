-- Create trigger to automatically set created_by to auth.uid() if not provided
CREATE OR REPLACE FUNCTION public.set_chat_created_by()
RETURNS TRIGGER AS $$
BEGIN
  -- Always set created_by to auth.uid() to ensure RLS policy passes
  NEW.created_by := auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create the trigger on chats table
CREATE TRIGGER set_chat_created_by_trigger
BEFORE INSERT ON public.chats
FOR EACH ROW
EXECUTE FUNCTION public.set_chat_created_by();