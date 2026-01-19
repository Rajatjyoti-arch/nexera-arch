-- Create posts table for the social feed
CREATE TABLE public.posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'post' CHECK (type IN ('post', 'project', 'certificate')),
  project_id UUID REFERENCES public.user_projects(id) ON DELETE SET NULL,
  certificate_id UUID REFERENCES public.user_certificates(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create post_likes table
CREATE TABLE public.post_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Create post_comments table
CREATE TABLE public.post_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create saved_posts table for bookmarks
CREATE TABLE public.saved_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Enable RLS on all tables
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_posts ENABLE ROW LEVEL SECURITY;

-- Enable realtime for posts and interactions
ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.post_likes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.post_comments;

-- Posts policies: Everyone can view, users can create/update/delete their own
CREATE POLICY "Anyone can view posts" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Users can create their own posts" ON public.posts FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own posts" ON public.posts FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete their own posts" ON public.posts FOR DELETE USING (user_id = auth.uid());

-- Likes policies
CREATE POLICY "Anyone can view likes" ON public.post_likes FOR SELECT USING (true);
CREATE POLICY "Users can like posts" ON public.post_likes FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can unlike posts" ON public.post_likes FOR DELETE USING (user_id = auth.uid());

-- Comments policies
CREATE POLICY "Anyone can view comments" ON public.post_comments FOR SELECT USING (true);
CREATE POLICY "Users can create comments" ON public.post_comments FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own comments" ON public.post_comments FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete their own comments" ON public.post_comments FOR DELETE USING (user_id = auth.uid());

-- Saved posts policies
CREATE POLICY "Users can view their saved posts" ON public.saved_posts FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can save posts" ON public.saved_posts FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can unsave posts" ON public.saved_posts FOR DELETE USING (user_id = auth.uid());

-- Update user_projects to allow viewing projects in feed (for linked posts)
CREATE POLICY "Everyone can view projects linked to posts" ON public.user_projects FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.posts WHERE posts.project_id = user_projects.id)
  OR user_id = auth.uid()
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Update user_certificates to allow viewing certificates in feed
CREATE POLICY "Everyone can view certificates linked to posts" ON public.user_certificates FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.posts WHERE posts.certificate_id = user_certificates.id)
  OR user_id = auth.uid()
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Create indexes for performance
CREATE INDEX idx_posts_user_id ON public.posts(user_id);
CREATE INDEX idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX idx_post_likes_post_id ON public.post_likes(post_id);
CREATE INDEX idx_post_likes_user_id ON public.post_likes(user_id);
CREATE INDEX idx_post_comments_post_id ON public.post_comments(post_id);
CREATE INDEX idx_saved_posts_user_id ON public.saved_posts(user_id);