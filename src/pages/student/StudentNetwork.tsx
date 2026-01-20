import { useState, useCallback } from "react";
import StudentLayout from "@/components/layouts/StudentLayout";
import { motion } from "framer-motion";
import { Search, TrendingUp, Users, Sparkles, Filter } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
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
import { useNavigate } from "react-router-dom";

// Components
import { NetworkHeader } from "@/components/network/NetworkHeader";
import { CreatePostCard } from "@/components/network/CreatePostCard";
import { PostCard } from "@/components/network/PostCard";
import { PeopleGrid } from "@/components/network/PeopleGrid";
import { NetworkStats } from "@/components/network/NetworkStats";

export default function StudentNetwork() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("feed");
  const [selectedPostForComments, setSelectedPostForComments] = useState<string | null>(null);

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

  const handleCreatePost = async (data: {
    content: string;
    type: "post" | "project" | "certificate";
    projectData?: { title: string; description: string; technologies: string; link: string };
    certificateData?: { title: string; issuer: string; date: string };
  }) => {
    if (!data.content.trim()) {
      toast.error("Please enter some content");
      throw new Error("No content");
    }

    await createPost.mutateAsync(data);
    toast.success("Post created successfully!");
  };

  const handleAddComment = async (postId: string, content: string) => {
    await addComment.mutateAsync({ postId, content });
    toast.success("Comment added!");
  };

  const handleStartChat = (studentId: string) => {
    navigate(`/student/chats?start=${studentId}`);
  };

  // Stats calculation
  const projectsCount = posts?.filter(p => p.type === "project").length || 0;
  const certificatesCount = posts?.filter(p => p.type === "certificate").length || 0;

  return (
    <StudentLayout>
      <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
        {/* Header */}
        <NetworkHeader totalConnections={students?.length || 0} />

        {/* Stats Overview */}
        <NetworkStats
          postsCount={posts?.length || 0}
          studentsCount={students?.length || 0}
          projectsCount={projectsCount}
          certificatesCount={certificatesCount}
        />

        {/* Main Content */}
        <section className="rounded-3xl border border-border bg-gradient-to-b from-secondary/5 to-transparent p-4 md:p-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            {/* Tab Navigation */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <TabsList className="bg-secondary/20 border border-border p-1.5 rounded-2xl">
                <TabsTrigger 
                  value="feed" 
                  className="rounded-xl px-5 md:px-6 py-2.5 md:py-3 text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-emerald-500 data-[state=active]:text-black transition-all duration-300"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Feed
                </TabsTrigger>
                <TabsTrigger 
                  value="people" 
                  className="rounded-xl px-5 md:px-6 py-2.5 md:py-3 text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-emerald-500 data-[state=active]:text-black transition-all duration-300"
                >
                  <Users className="w-4 h-4 mr-2" />
                  People
                </TabsTrigger>
              </TabsList>

              {activeTab === "people" && (
                <motion.div 
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="relative group w-full sm:w-auto"
                >
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/50 group-focus-within:text-teal-500 transition-colors" />
                  <input
                    placeholder="Search by name, skills, or college..."
                    className="w-full sm:w-72 h-11 pl-11 pr-4 bg-secondary/10 border border-border rounded-xl text-xs outline-none focus:border-teal-500/30 focus:ring-2 focus:ring-teal-500/10 transition-all placeholder:text-foreground/50 font-medium"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </motion.div>
              )}
            </div>

            {/* Feed Tab */}
            <TabsContent value="feed" className="space-y-5 mt-0">
              {/* Create Post Card */}
              <CreatePostCard 
                user={user}
                onCreatePost={handleCreatePost}
                isPending={createPost.isPending}
              />

              {/* Posts Feed */}
              <div className="space-y-5">
                {postsLoading ? (
                  // Loading skeletons
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="premium-card card-indigo p-6 space-y-4">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-48" />
                        </div>
                      </div>
                      <Skeleton className="h-16 w-full" />
                      <div className="flex gap-3 pt-4 border-t border-border/30">
                        <Skeleton className="h-9 w-20 rounded-xl" />
                        <Skeleton className="h-9 w-20 rounded-xl" />
                        <Skeleton className="h-9 w-20 rounded-xl" />
                      </div>
                    </div>
                  ))
                ) : !posts?.length ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="premium-card card-teal p-12 text-center"
                  >
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-teal-500/20 to-emerald-500/20 flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-teal-500/50" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground/70 mb-2">No posts yet</h3>
                    <p className="text-sm text-foreground/50 max-w-sm mx-auto">
                      Be the first to share something with the network! Post updates, showcase projects, or share your achievements.
                    </p>
                  </motion.div>
                ) : (
                  posts.map((post, i) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      index={i}
                      onLike={handleLike}
                      onSave={handleSave}
                      isLikePending={toggleLike.isPending}
                      isSavePending={toggleSave.isPending}
                      comments={comments}
                      commentsLoading={commentsLoading}
                      onSelectPost={setSelectedPostForComments}
                      onAddComment={handleAddComment}
                      isAddingComment={addComment.isPending}
                    />
                  ))
                )}
              </div>
            </TabsContent>

            {/* People Tab */}
            <TabsContent value="people" className="mt-0">
              <PeopleGrid 
                students={students || []}
                isLoading={studentsLoading}
                searchQuery={searchQuery}
                onStartChat={handleStartChat}
              />
            </TabsContent>
          </Tabs>
        </section>
      </div>
    </StudentLayout>
  );
}
