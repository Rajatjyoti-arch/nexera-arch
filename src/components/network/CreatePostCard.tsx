import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Send,
  Image,
  Briefcase,
  Award,
  Loader2,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";

interface CreatePostCardProps {
  user: { name?: string; avatar?: string } | null;
  onCreatePost: (data: {
    content: string;
    type: "post" | "project" | "certificate";
    projectData?: { title: string; description: string; technologies: string; link: string };
    certificateData?: { title: string; issuer: string; date: string };
  }) => Promise<void>;
  isPending: boolean;
}

export function CreatePostCard({ user, onCreatePost, isPending }: CreatePostCardProps) {
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [isAddingCertificate, setIsAddingCertificate] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [newProject, setNewProject] = useState({ title: "", description: "", technologies: "", link: "" });
  const [newCertificate, setNewCertificate] = useState({ title: "", issuer: "", date: "" });

  const handleSubmit = async (type: "post" | "project" | "certificate") => {
    try {
      await onCreatePost({
        content: newPostContent,
        type,
        projectData: type === "project" ? newProject : undefined,
        certificateData: type === "certificate" ? newCertificate : undefined,
      });
      resetForm();
    } catch {
      // Error handled in parent
    }
  };

  const resetForm = () => {
    setNewPostContent("");
    setNewProject({ title: "", description: "", technologies: "", link: "" });
    setNewCertificate({ title: "", issuer: "", date: "" });
    setIsCreatingPost(false);
    setIsAddingProject(false);
    setIsAddingCertificate(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="premium-card card-teal p-5 md:p-6"
    >
      <div className="flex gap-4">
        <Avatar className="h-11 w-11 md:h-12 md:w-12 border-2 border-teal-500/30 ring-2 ring-teal-500/10">
          <AvatarImage src={user?.avatar} />
          <AvatarFallback className="bg-gradient-to-br from-teal-500/30 to-emerald-500/30 text-foreground font-bold">
            {user?.name?.charAt(0) || "S"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-4">
          {/* Main Post Dialog */}
          <Dialog open={isCreatingPost} onOpenChange={setIsCreatingPost}>
            <DialogTrigger asChild>
              <button className="w-full text-left px-5 py-4 rounded-2xl bg-secondary/20 border border-border text-foreground/60 text-sm font-medium hover:bg-secondary/30 hover:border-teal-500/20 transition-all duration-300 group">
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-teal-500/50 group-hover:text-teal-500 transition-colors" />
                  Share your thoughts, projects, or achievements...
                </span>
              </button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border max-w-xl">
              <DialogHeader>
                <DialogTitle className="text-lg font-bold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-teal-500" />
                  Create a Post
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Textarea
                  placeholder="What's on your mind? Share updates, ideas, or ask questions..."
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  className="min-h-[150px] bg-secondary/10 border-border focus:border-teal-500/30 resize-none"
                />
                <Button 
                  onClick={() => handleSubmit("post")} 
                  disabled={isPending || !newPostContent.trim()}
                  className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-black font-bold"
                >
                  {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                  Post
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {/* Project Dialog */}
            <Dialog open={isAddingProject} onOpenChange={setIsAddingProject}>
              <DialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="flex-1 rounded-xl h-10 text-[10px] font-bold uppercase tracking-widest border border-border hover:bg-violet-500/10 hover:border-violet-500/30 hover:text-violet-500 transition-all duration-300"
                >
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
                    placeholder="Project Title *"
                    value={newProject.title}
                    onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                    className="bg-secondary/10 border-border focus:border-violet-500/30"
                  />
                  <Textarea
                    placeholder="Describe your project..."
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    className="bg-secondary/10 border-border focus:border-violet-500/30 min-h-[80px] resize-none"
                  />
                  <Input
                    placeholder="Technologies (comma separated)"
                    value={newProject.technologies}
                    onChange={(e) => setNewProject({ ...newProject, technologies: e.target.value })}
                    className="bg-secondary/10 border-border focus:border-violet-500/30"
                  />
                  <Input
                    placeholder="Project Link (optional)"
                    value={newProject.link}
                    onChange={(e) => setNewProject({ ...newProject, link: e.target.value })}
                    className="bg-secondary/10 border-border focus:border-violet-500/30"
                  />
                  <Textarea
                    placeholder="Say something about this project..."
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    className="bg-secondary/10 border-border focus:border-violet-500/30 min-h-[60px] resize-none"
                  />
                  <Button 
                    onClick={() => handleSubmit("project")} 
                    disabled={isPending || !newProject.title || !newPostContent.trim()}
                    className="w-full bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white font-bold"
                  >
                    {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                    Share Project
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Certificate Dialog */}
            <Dialog open={isAddingCertificate} onOpenChange={setIsAddingCertificate}>
              <DialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="flex-1 rounded-xl h-10 text-[10px] font-bold uppercase tracking-widest border border-border hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:text-emerald-500 transition-all duration-300"
                >
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
                    placeholder="Certificate Title *"
                    value={newCertificate.title}
                    onChange={(e) => setNewCertificate({ ...newCertificate, title: e.target.value })}
                    className="bg-secondary/10 border-border focus:border-emerald-500/30"
                  />
                  <Input
                    placeholder="Issuing Organization *"
                    value={newCertificate.issuer}
                    onChange={(e) => setNewCertificate({ ...newCertificate, issuer: e.target.value })}
                    className="bg-secondary/10 border-border focus:border-emerald-500/30"
                  />
                  <Input
                    placeholder="Issue Date (e.g., Jan 2026)"
                    value={newCertificate.date}
                    onChange={(e) => setNewCertificate({ ...newCertificate, date: e.target.value })}
                    className="bg-secondary/10 border-border focus:border-emerald-500/30"
                  />
                  <Textarea
                    placeholder="Say something about this achievement..."
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    className="bg-secondary/10 border-border focus:border-emerald-500/30 min-h-[60px] resize-none"
                  />
                  <Button 
                    onClick={() => handleSubmit("certificate")} 
                    disabled={isPending || !newCertificate.title || !newPostContent.trim()}
                    className="w-full bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-black font-bold"
                  >
                    {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                    Share Certificate
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Media Button */}
            <Button 
              variant="ghost" 
              className="flex-1 rounded-xl h-10 text-[10px] font-bold uppercase tracking-widest border border-border hover:bg-amber-500/10 hover:border-amber-500/30 hover:text-amber-500 transition-all duration-300"
            >
              <Image className="w-4 h-4 mr-2 text-amber-500" />
              Media
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
