-- Allow faculty to delete attendance records they marked (for updating)
CREATE POLICY "Faculty can delete attendance they marked"
ON public.attendance
FOR DELETE
USING (auth.uid() = marked_by);