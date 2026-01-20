-- Allow all authenticated users to view student profiles for chat purposes
CREATE POLICY "Authenticated users can view student profiles for chat" 
ON public.student_profiles 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Allow all authenticated users to view faculty profiles for chat purposes
CREATE POLICY "Authenticated users can view faculty profiles for chat" 
ON public.faculty_profiles 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Allow all authenticated users to view admin profiles for chat purposes
CREATE POLICY "Authenticated users can view admin profiles for chat" 
ON public.admin_profiles 
FOR SELECT 
USING (auth.uid() IS NOT NULL);