import { useState, useCallback } from "react";
import StudentLayout from "@/components/layouts/StudentLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  MessageCircle,
  UserPlus,
  MapPin,
  GraduationCap,
  Globe,
  MoreHorizontal,
  Heart,
  MessageSquare,
  Share2,
  Send,
  Image,
  Briefcase,
  Award,
  Bookmark,
  TrendingUp,
  Users,
  Loader2
} from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { 
  usePosts, 
  useCreatePost, 
  useToggleLike, 
  useToggleSave, 
  useNetworkStudents,
  useRealtimePosts,
  usePostComments,
  useAddComment,
  Post
} from "@/hooks/useNetwork";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";

const colorClasses = ["card-indigo", "card-teal", "card-violet", "card-amber", "card-rose", "card-emerald"];

export default function StudentNetwork() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("feed");
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [isAddingCertificate, setIsAddingCertificate] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [newProject, setNewProject] = useState({ title: "", description: "", technologies: "", link: "" });
  const [newCertificate, setNewCertificate] = useState({ title: "", issuer: "", date: "" });
  const [selectedPostForComments, setSelectedPostForComments] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");

  // Data hooks
  const { data: posts, isLoading: postsLoading, refetch: refetchPosts } = usePosts();
  const { data: students, isLoading: studentsLoading } = useNetworkStudents();
  const createPost = useCreatePost();
  const toggleLike = useToggleLike();
  const toggleSave = useToggleSave();
  const { data: comments, isLoading: commentsLoading } = usePostComments(selectedPostForComments);
  const addComment = useAddComment();

  // Realtime updates
  const handleRealtimeUpdate = useCallback(() => {
    refetchPosts();
  }, [refetchPosts]);
  useRealtimePosts(handleRealtimeUpdate);

  const handleLike = (post: Post) => {
    toggleLike.mutate({ postId: post.id, isLiked: post.is_liked });
  };

  const handleSave = (post: Post) => {
    toggleSave.mutate({ postId: post.id, isSaved: post.is_saved });
  };

  const handleCreatePost = async (type: "post" | "project" | "certificate") => {
    if (!newPostContent.trim()) {
      toast.error("Please enter some content");
      return;
    }

    try {
      await createPost.mutateAsync({
        content: newPostContent,
        type,
        projectData: type === "project" ? newProject : undefined,
        certificateData: type === "certificate" ? newCertificate : undefined,
      });
      
      setNewPostContent("");
      setNewProject({ title: "", description: "", technologies: "", link: "" });
      setNewCertificate({ title: "", issuer: "", date: "" });
      setIsCreatingPost(false);
      setIsAddingProject(false);
      setIsAddingCertificate(false);
      toast.success("Post created!");
    } catch (error) {
      toast.error("Failed to create post");
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedPostForComments) return;
    
    try {
      await addComment.mutateAsync({
        postId: selectedPostForComments,
        content: newComment,
      });
      setNewComment("");
      toast.success("Comment added!");
    } catch {
      toast.error("Failed to add comment");
    }
  };

  const formatTime = (dateStr: string) => {
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
    } catch {
      return dateStr;
    }
  };

  const filteredStudents = (students || []).filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.skills?.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <StudentLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <div className="flex items-center gap-2 text-teal-500">
              <Globe className="w-4 h-4" />
              <p className="text-xs font-bold uppercase tracking-[0.2em]">Community</p>
            </div>
            <h1 className="text-4xl font-semibold tracking-tight">Campus Network</h1>
            <p className="text-foreground/70 mt-2 font-medium">Orchestrate your connections and collaborate across the ecosystem.</p>
          </motion.div>

          <div className="flex gap-3">
            <Button variant="outline" className="rounded-xl h-11 px-6 border-border hover:bg-secondary/50 text-[10px] font-bold uppercase tracking-widest btn-press">
              <Users className="w-3.5 h-3.5 mr-2" />
              My Network
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <section className="rounded-3xl border border-border bg-secondary/10 p-4 md:p-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="bg-secondary/20 border border-border p-1.5 rounded-2xl w-full justify-start overflow-x-auto no-scrollbar">
              <TabsTrigger value="feed" className="rounded-xl px-6 py-3 text-xs font-bold uppercase tracking-widest data-[state=active]:bg-teal-500 data-[state=active]:text-black">
                <TrendingUp className="w-4 h-4 mr-2" />
                Feed
              </TabsTrigger>
              <TabsTrigger value="people" className="rounded-xl px-6 py-3 text-xs font-bold uppercase tracking-widest data-[state=active]:bg-teal-500 data-[state=active]:text-black">
                <Users className="w-4 h-4 mr-2" />
                People
              </TabsTrigger>
            </TabsList>

            {/* Feed Tab */}
            <TabsContent value="feed" className="space-y-6">
              {/* Create Post Card */}
              <div className="premium-card card-teal p-6">
                <div className="flex gap-4">
                  <Avatar className="h-12 w-12 border-2 border-border/50">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback className="bg-teal-500/30 text-foreground font-bold">
                      {user?.name?.charAt(0) || "S"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-4">
                    <Dialog open={isCreatingPost} onOpenChange={setIsCreatingPost}>
                      <DialogTrigger asChild>
                        <button className="w-full text-left px-5 py-4 rounded-2xl bg-secondary/20 border border-border text-foreground/70 text-sm font-medium hover:bg-secondary/30 hover:border-border/80 transition-all">
                          What's on your mind? Share a post, project, or achievement...
                        </button>
                      </DialogTrigger>
                      <DialogContent className="bg-card border-border max-w-xl">
                        <DialogHeader>
                          <DialogTitle className="text-lg font-bold">Create a Post</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                          <Textarea
                            placeholder="Share your thoughts, achievements, or ideas..."
                            value={newPostContent}
                            onChange={(e) => setNewPostContent(e.target.value)}
                            className="min-h-[150px] bg-secondary/10 border-border"
                          />
                          <div className="flex gap-2">
                            <Button 
                              onClick={() => handleCreatePost("post")} 
                              disabled={createPost.isPending}
                              className="flex-1 bg-teal-500 hover:bg-teal-600 text-black"
                            >
                              {createPost.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                              Post
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <div className="flex gap-2">
                      <Dialog open={isAddingProject} onOpenChange={setIsAddingProject}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" className="flex-1 rounded-xl h-10 text-[10px] font-bold uppercase tracking-widest border border-border hover:bg-secondary/20">
                            <Briefcase className="w-4 h-4 mr-2 text-violet-500" />
                            Project
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-card border-border max-w-xl">
                          <DialogHeader>
                            <DialogTitle className="text-lg font-bold flex items-center gap-2">
                              <Briefcase className="w-5 h-5 text-violet-500" />
                              Share a Project
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 pt-4">
                            <Input
                              placeholder="Project Title"
                              value={newProject.title}
                              onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                              className="bg-secondary/10 border-border"
                            />
                            <Textarea
                              placeholder="Describe your project..."
                              value={newProject.description}
                              onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                              className="bg-secondary/10 border-border"
                            />
                            <Input
                              placeholder="Technologies (comma separated)"
                              value={newProject.technologies}
                              onChange={(e) => setNewProject({ ...newProject, technologies: e.target.value })}
                              className="bg-secondary/10 border-border"
                            />
                            <Input
                              placeholder="Project Link (optional)"
                              value={newProject.link}
                              onChange={(e) => setNewProject({ ...newProject, link: e.target.value })}
                              className="bg-secondary/10 border-border"
                            />
                            <Textarea
                              placeholder="Say something about this project..."
                              value={newPostContent}
                              onChange={(e) => setNewPostContent(e.target.value)}
                              className="bg-secondary/10 border-border"
                            />
                            <Button 
                              onClick={() => handleCreatePost("project")} 
                              disabled={createPost.isPending || !newProject.title}
                              className="w-full bg-violet-500 hover:bg-violet-600 text-black"
                            >
                              {createPost.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                              Share Project
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Dialog open={isAddingCertificate} onOpenChange={setIsAddingCertificate}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" className="flex-1 rounded-xl h-10 text-[10px] font-bold uppercase tracking-widest border border-border hover:bg-secondary/20">
                            <Award className="w-4 h-4 mr-2 text-emerald-500" />
                            Certificate
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-card border-border max-w-xl">
                          <DialogHeader>
                            <DialogTitle className="text-lg font-bold flex items-center gap-2">
                              <Award className="w-5 h-5 text-emerald-500" />
                              Share a Certificate
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 pt-4">
                            <Input
                              placeholder="Certificate Title"
                              value={newCertificate.title}
                              onChange={(e) => setNewCertificate({ ...newCertificate, title: e.target.value })}
                              className="bg-secondary/10 border-border"
                            />
                            <Input
                              placeholder="Issuing Organization"
                              value={newCertificate.issuer}
                              onChange={(e) => setNewCertificate({ ...newCertificate, issuer: e.target.value })}
                              className="bg-secondary/10 border-border"
                            />
                            <Input
                              placeholder="Issue Date (e.g., Jan 2026)"
                              value={newCertificate.date}
                              onChange={(e) => setNewCertificate({ ...newCertificate, date: e.target.value })}
                              className="bg-secondary/10 border-border"
                            />
                            <Textarea
                              placeholder="Say something about this achievement..."
                              value={newPostContent}
                              onChange={(e) => setNewPostContent(e.target.value)}
                              className="bg-secondary/10 border-border"
                            />
                            <Button 
                              onClick={() => handleCreatePost("certificate")} 
                              disabled={createPost.isPending || !newCertificate.title}
                              className="w-full bg-emerald-500 hover:bg-emerald-600 text-black"
                            >
                              {createPost.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                              Share Certificate
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Button variant="ghost" className="flex-1 rounded-xl h-10 text-[10px] font-bold uppercase tracking-widest border border-border hover:bg-secondary/20">
                        <Image className="w-4 h-4 mr-2 text-amber-500" />
                        Media
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Posts Feed */}
              <div className="space-y-6">
                {postsLoading ? (
                  // Loading skeletons
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="premium-card card-indigo p-6 space-y-4">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                      <Skeleton className="h-20 w-full" />
                      <div className="flex gap-4">
                        <Skeleton className="h-8 w-16" />
                        <Skeleton className="h-8 w-16" />
                        <Skeleton className="h-8 w-16" />
                      </div>
                    </div>
                  ))
                ) : !posts?.length ? (
                  <div className="premium-card card-teal p-12 text-center">
                    <TrendingUp className="w-12 h-12 mx-auto text-foreground/30 mb-4" />
                    <h3 className="text-lg font-bold text-foreground/70 mb-2">No posts yet</h3>
                    <p className="text-sm text-foreground/50">Be the first to share something with the network!</p>
                  </div>
                ) : (
                  <AnimatePresence>
                    {posts.map((post, i) => (
                      <motion.div
                        key={post.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={cn(
                          "premium-card p-6",
                          post.type === "project" ? "card-violet" : post.type === "certificate" ? "card-emerald" : "card-indigo"
                        )}
                      >
                        {/* Post Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12 border-2 border-border/50">
                              <AvatarImage src={post.author?.avatar_url || undefined} />
                              <AvatarFallback className="bg-secondary/20 text-foreground font-bold">
                                {post.author?.name?.split(" ").map(n => n[0]).join("") || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="text-sm font-bold text-foreground/90">{post.author?.name || "Unknown User"}</h3>
                              <p className="text-[10px] text-foreground/70">
                                {post.author?.course} • {post.author?.college}
                              </p>
                              <p className="text-[10px] text-foreground/70">{formatTime(post.created_at)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {post.type !== "post" && (
                              <span className={cn(
                                "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest",
                                post.type === "project" ? "bg-violet-500/20 text-violet-500" : "bg-emerald-500/20 text-emerald-500"
                              )}>
                                {post.type === "project" ? "Project" : "Certificate"}
                              </span>
                            )}
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-foreground/70 hover:text-foreground">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Post Content */}
                        <p className="text-sm text-foreground/80 leading-relaxed mb-4">{post.content}</p>

                        {/* Project Card */}
                        {post.type === "project" && post.project && (
                          <div className="p-4 rounded-xl bg-secondary/10 border border-border mb-4">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="p-2 rounded-lg bg-violet-500/20">
                                <Briefcase className="w-5 h-5 text-violet-500" />
                              </div>
                              <div>
                                <h4 className="text-sm font-bold text-foreground/90">{post.project.title}</h4>
                                <p className="text-[10px] text-foreground/70">{post.project.description}</p>
                              </div>
                            </div>
                            {post.project.tech_stack?.length ? (
                              <div className="flex flex-wrap gap-2">
                                {post.project.tech_stack.map(tech => (
                                  <span key={tech} className="px-2 py-1 rounded-md bg-violet-500/10 text-[9px] font-bold text-violet-500">
                                    {tech}
                                  </span>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        )}

                        {/* Certificate Card */}
                        {post.type === "certificate" && post.certificate && (
                          <div className="p-4 rounded-xl bg-secondary/10 border border-border mb-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-emerald-500/20">
                                <Award className="w-5 h-5 text-emerald-500" />
                              </div>
                              <div>
                                <h4 className="text-sm font-bold text-foreground/90">{post.certificate.title}</h4>
                                <p className="text-[10px] text-foreground/70">{post.certificate.issuer}</p>
                                {post.certificate.issue_date && (
                                  <p className="text-[9px] text-foreground/70">Issued {post.certificate.issue_date}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Post Actions */}
                        <div className="flex items-center justify-between pt-4 border-t border-border">
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              onClick={() => handleLike(post)}
                              disabled={toggleLike.isPending}
                              className={cn(
                                "rounded-xl h-9 px-4 text-[10px] font-bold uppercase tracking-widest",
                                post.is_liked ? "text-rose-500 bg-rose-500/10" : "text-foreground/60 hover:text-foreground/80"
                              )}
                            >
                              <Heart className={cn("w-4 h-4 mr-2", post.is_liked && "fill-current")} />
                              {post.likes_count}
                            </Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  onClick={() => setSelectedPostForComments(post.id)}
                                  className="rounded-xl h-9 px-4 text-[10px] font-bold uppercase tracking-widest text-foreground/70 hover:text-foreground/80"
                                >
                                  <MessageSquare className="w-4 h-4 mr-2" />
                                  {post.comments_count}
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="bg-card border-border max-w-lg">
                                <DialogHeader>
                                  <DialogTitle className="text-lg font-bold flex items-center gap-2">
                                    <MessageSquare className="w-5 h-5" />
                                    Comments
                                  </DialogTitle>
                                </DialogHeader>
                                <ScrollArea className="max-h-[400px]">
                                  <div className="space-y-4 py-4">
                                    {commentsLoading ? (
                                      <div className="flex justify-center py-8">
                                        <Loader2 className="w-6 h-6 animate-spin text-foreground/50" />
                                      </div>
                                    ) : !comments?.length ? (
                                      <p className="text-sm text-foreground/50 text-center py-8">No comments yet. Be the first!</p>
                                    ) : (
                                      comments.map(comment => (
                                        <div key={comment.id} className="flex gap-3">
                                          <Avatar className="h-8 w-8">
                                            <AvatarImage src={comment.author?.avatar_url || undefined} />
                                            <AvatarFallback className="text-xs">
                                              {comment.author?.name?.charAt(0) || "U"}
                                            </AvatarFallback>
                                          </Avatar>
                                          <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                              <span className="text-sm font-bold">{comment.author?.name || "User"}</span>
                                              <span className="text-[10px] text-foreground/50">{formatTime(comment.created_at)}</span>
                                            </div>
                                            <p className="text-sm text-foreground/80">{comment.content}</p>
                                          </div>
                                        </div>
                                      ))
                                    )}
                                  </div>
                                </ScrollArea>
                                <div className="flex gap-2 pt-4 border-t border-border">
                                  <Input
                                    placeholder="Write a comment..."
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                                    className="flex-1 bg-secondary/10"
                                  />
                                  <Button 
                                    onClick={handleAddComment} 
                                    disabled={addComment.isPending || !newComment.trim()}
                                    size="icon"
                                    className="bg-teal-500 hover:bg-teal-600 text-black"
                                  >
                                    {addComment.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Button variant="ghost" className="rounded-xl h-9 px-4 text-[10px] font-bold uppercase tracking-widest text-foreground/70 hover:text-foreground/80">
                              <Share2 className="w-4 h-4 mr-2" />
                              Share
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleSave(post)}
                            disabled={toggleSave.isPending}
                            className={cn(
                              "h-9 w-9 rounded-xl",
                              post.is_saved ? "text-amber-500" : "text-foreground/70 hover:text-foreground/80"
                            )}
                          >
                            <Bookmark className={cn("w-4 h-4", post.is_saved && "fill-current")} />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </TabsContent>

            {/* People Tab */}
            <TabsContent value="people" className="space-y-6">
              {/* Search */}
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/70 group-focus-within:text-teal-500 transition-colors" />
                <input
                  placeholder="Search people by name or skills..."
                  className="w-full h-12 pl-12 pr-4 bg-secondary/10 border border-border rounded-xl text-xs outline-none focus:border-teal-500/30 transition-all placeholder:text-foreground/70 font-medium"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* People Grid */}
              {studentsLoading ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="premium-card card-indigo p-6 space-y-4">
                      <Skeleton className="h-16 w-16 rounded-full" />
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                      <div className="flex gap-2">
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-6 w-16" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : !filteredStudents.length ? (
                <div className="premium-card card-teal p-12 text-center">
                  <Users className="w-12 h-12 mx-auto text-foreground/30 mb-4" />
                  <h3 className="text-lg font-bold text-foreground/70 mb-2">No students found</h3>
                  <p className="text-sm text-foreground/50">Try adjusting your search criteria</p>
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredStudents.map((student, i) => (
                    <motion.div
                      key={student.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className={cn("premium-card p-6 group", colorClasses[i % colorClasses.length])}
                    >
                      <div className="flex items-start justify-between mb-6">
                        <div className="relative">
                          <Avatar className="h-16 w-16 border-2 border-border/50">
                            <AvatarImage src={student.avatar_url || undefined} />
                            <AvatarFallback className="bg-secondary/20 text-foreground text-xl font-bold">
                              {student.name.split(" ").map(n => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg bg-secondary/20 text-foreground/70">
                          {student.year || "Student"}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-foreground/90 mb-1">{student.name}</h3>
                      <p className="text-[10px] text-foreground/70 mb-4">@{student.username}</p>

                      <div className="space-y-2 mb-6 text-[11px] text-foreground/70">
                        <p className="flex items-center gap-2">
                          <GraduationCap className="w-3.5 h-3.5" /> {student.course || "Course not specified"}
                        </p>
                        <p className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5" /> {student.college || "College not specified"}
                        </p>
                      </div>

                      {student.skills?.length ? (
                        <div className="flex flex-wrap gap-1.5 mb-6">
                          {student.skills.slice(0, 3).map(skill => (
                            <span key={skill} className="px-2 py-1 rounded-md bg-secondary/20 text-[9px] font-bold text-foreground/70">
                              {skill}
                            </span>
                          ))}
                        </div>
                      ) : null}

                      <div className="flex gap-2">
                        <Button className="flex-1 rounded-xl h-10 text-[10px] font-bold uppercase tracking-widest bg-teal-500 hover:bg-teal-600 text-black btn-press">
                          <UserPlus className="w-4 h-4 mr-2" />
                          Connect
                        </Button>
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl border border-border">
                          <MessageCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </section>
      </div>
    </StudentLayout>
  );
}
