-- Ensure chats.created_by is always set to the authenticated user on insert
CREATE OR REPLACE FUNCTION public.set_chat_created_by()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.created_by IS NULL THEN
    NEW.created_by := auth.uid();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_chats_created_by ON public.chats;
CREATE TRIGGER set_chats_created_by
BEFORE INSERT ON public.chats
FOR EACH ROW
EXECUTE FUNCTION public.set_chat_created_by();

-- Keep chats.updated_at in sync
DROP TRIGGER IF EXISTS update_chats_updated_at ON public.chats;
CREATE TRIGGER update_chats_updated_at
BEFORE UPDATE ON public.chats
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();