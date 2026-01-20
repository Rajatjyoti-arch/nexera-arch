import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Heart,
  MessageSquare,
  Share2,
  Bookmark,
  MoreHorizontal,
  Briefcase,
  Award,
  Send,
  Loader2,
  ExternalLink,
  Flag,
  UserMinus,
  Copy,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { Post, PostComment } from "@/hooks/useNetwork";
import { toast } from "sonner";

interface PostCardProps {
  post: Post;
  index: number;
  onLike: (post: Post) => void;
  onSave: (post: Post) => void;
  isLikePending: boolean;
  isSavePending: boolean;
  comments: PostComment[] | undefined;
  commentsLoading: boolean;
  onSelectPost: (postId: string) => void;
  onAddComment: (postId: string, content: string) => Promise<void>;
  isAddingComment: boolean;
}

export function PostCard({
  post,
  index,
  onLike,
  onSave,
  isLikePending,
  isSavePending,
  comments,
  commentsLoading,
  onSelectPost,
  onAddComment,
  isAddingComment,
}: PostCardProps) {
  const [newComment, setNewComment] = useState("");
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);

  const formatTime = (dateStr: string) => {
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
    } catch {
      return dateStr;
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    await onAddComment(post.id, newComment);
    setNewComment("");
  };

  const cardColor = post.type === "project" 
    ? "card-violet" 
    : post.type === "certificate" 
      ? "card-emerald" 
      : "card-indigo";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.3 }}
      className={cn("premium-card p-5 md:p-6", cardColor)}
    >
      {/* Post Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-11 w-11 md:h-12 md:w-12 border-2 border-border/50 ring-2 ring-secondary/20">
            <AvatarImage src={post.author?.avatar_url || undefined} />
            <AvatarFallback className="bg-gradient-to-br from-secondary/30 to-secondary/10 text-foreground font-bold">
              {post.author?.name?.split(" ").map(n => n[0]).join("") || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-sm font-bold text-foreground/90 hover:text-foreground cursor-pointer transition-colors">
              {post.author?.name || "Unknown User"}
            </h3>
            <p className="text-[10px] text-foreground/60 line-clamp-1">
              {post.author?.course} • {post.author?.college}
            </p>
            <p className="text-[10px] text-foreground/50">{formatTime(post.created_at)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {post.type !== "post" && (
            <span className={cn(
              "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest",
              post.type === "project" 
                ? "bg-gradient-to-r from-violet-500/20 to-purple-500/20 text-violet-500 border border-violet-500/20" 
                : "bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-500 border border-emerald-500/20"
            )}>
              {post.type === "project" ? "Project" : "Certificate"}
            </span>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-foreground/50 hover:text-foreground">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleShare}>
                <Copy className="w-4 h-4 mr-2" />
                Copy Link
              </DropdownMenuItem>
              <DropdownMenuItem>
                <UserMinus className="w-4 h-4 mr-2" />
                Unfollow User
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
                <Flag className="w-4 h-4 mr-2" />
                Report Post
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Post Content */}
      <p className="text-sm text-foreground/80 leading-relaxed mb-4 whitespace-pre-wrap">{post.content}</p>

      {/* Project Card */}
      {post.type === "project" && post.project && (
        <div className="p-4 rounded-xl bg-gradient-to-br from-violet-500/5 to-purple-500/5 border border-violet-500/20 mb-4 group hover:border-violet-500/30 transition-all duration-300">
          <div className="flex items-start gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 shrink-0">
              <Briefcase className="w-5 h-5 text-violet-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-foreground/90 truncate">{post.project.title}</h4>
                {post.project.project_url && (
                  <a 
                    href={post.project.project_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-violet-500 hover:text-violet-400 transition-colors shrink-0"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
              <p className="text-[11px] text-foreground/60 mt-1 line-clamp-2">{post.project.description}</p>
            </div>
          </div>
          {post.project.tech_stack?.length ? (
            <div className="flex flex-wrap gap-1.5">
              {post.project.tech_stack.map(tech => (
                <span 
                  key={tech} 
                  className="px-2.5 py-1 rounded-md bg-violet-500/10 text-[9px] font-bold text-violet-500 border border-violet-500/10"
                >
                  {tech}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      )}

      {/* Certificate Card */}
      {post.type === "certificate" && post.certificate && (
        <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/5 to-green-500/5 border border-emerald-500/20 mb-4 group hover:border-emerald-500/30 transition-all duration-300">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 shrink-0">
              <Award className="w-5 h-5 text-emerald-500" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-foreground/90 truncate">{post.certificate.title}</h4>
              <p className="text-[11px] text-foreground/60">{post.certificate.issuer}</p>
              {post.certificate.issue_date && (
                <p className="text-[10px] text-foreground/50 mt-0.5">Issued {post.certificate.issue_date}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Post Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-border/50">
        <div className="flex gap-1">
          <Button
            variant="ghost"
            onClick={() => onLike(post)}
            disabled={isLikePending}
            className={cn(
              "rounded-xl h-9 px-3 md:px-4 text-[10px] font-bold uppercase tracking-widest transition-all duration-200",
              post.is_liked 
                ? "text-rose-500 bg-rose-500/10 hover:bg-rose-500/20" 
                : "text-foreground/60 hover:text-rose-500 hover:bg-rose-500/10"
            )}
          >
            <Heart className={cn("w-4 h-4 mr-1.5", post.is_liked && "fill-current")} />
            {post.likes_count > 0 && post.likes_count}
          </Button>
          
          <Dialog open={isCommentsOpen} onOpenChange={(open) => {
            setIsCommentsOpen(open);
            if (open) onSelectPost(post.id);
          }}>
            <DialogTrigger asChild>
              <Button 
                variant="ghost" 
                className="rounded-xl h-9 px-3 md:px-4 text-[10px] font-bold uppercase tracking-widest text-foreground/60 hover:text-teal-500 hover:bg-teal-500/10 transition-all duration-200"
              >
                <MessageSquare className="w-4 h-4 mr-1.5" />
                {post.comments_count > 0 && post.comments_count}
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border max-w-lg max-h-[80vh]">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-teal-500" />
                  Comments
                </DialogTitle>
              </DialogHeader>
              <ScrollArea className="max-h-[400px] pr-4">
                <div className="space-y-4 py-4">
                  {commentsLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-foreground/50" />
                    </div>
                  ) : !comments?.length ? (
                    <p className="text-sm text-foreground/50 text-center py-8">No comments yet. Be the first to comment!</p>
                  ) : (
                    comments.map(comment => (
                      <div key={comment.id} className="flex gap-3 group">
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarImage src={comment.author?.avatar_url || undefined} />
                          <AvatarFallback className="text-xs bg-secondary/20">
                            {comment.author?.name?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-bold truncate">{comment.author?.name || "User"}</span>
                            <span className="text-[10px] text-foreground/50 shrink-0">{formatTime(comment.created_at)}</span>
                          </div>
                          <p className="text-sm text-foreground/80 break-words">{comment.content}</p>
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
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleAddComment()}
                  className="flex-1 bg-secondary/10 border-border focus:border-teal-500/30"
                />
                <Button 
                  onClick={handleAddComment} 
                  disabled={isAddingComment || !newComment.trim()}
                  size="icon"
                  className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-black shrink-0"
                >
                  {isAddingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button 
            variant="ghost" 
            onClick={handleShare}
            className="rounded-xl h-9 px-3 md:px-4 text-[10px] font-bold uppercase tracking-widest text-foreground/60 hover:text-foreground/80 hover:bg-secondary/20 transition-all duration-200"
          >
            <Share2 className="w-4 h-4 mr-1.5" />
            <span className="hidden sm:inline">Share</span>
          </Button>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onSave(post)}
          disabled={isSavePending}
          className={cn(
            "h-9 w-9 rounded-xl transition-all duration-200",
            post.is_saved 
              ? "text-amber-500 bg-amber-500/10 hover:bg-amber-500/20" 
              : "text-foreground/60 hover:text-amber-500 hover:bg-amber-500/10"
          )}
        >
          <Bookmark className={cn("w-4 h-4", post.is_saved && "fill-current")} />
        </Button>
      </div>
    </motion.div>
  );
}
