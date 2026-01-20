import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import StudentLayout from "@/components/layouts/StudentLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Camera,
  Linkedin,
  Github,
  Edit2,
  Save,
  X,
  Globe,
  Mail,
  GraduationCap,
  BookOpen,
  Calendar,
  Sparkles,
  User as UserIcon,
  Shield,
  Plus,
  Briefcase,
  Award,
  ExternalLink,
  Trash2,
  Building,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  useStudentFullProfile,
  useUpdateStudentProfile,
  useUploadAvatar,
  useAddSkill,
  useDeleteSkill,
  useAddProject,
  useDeleteProject,
  useAddCertificate,
  useDeleteCertificate,
  validateAvatarFile,
} from "@/hooks/useProfile";
import { Progress } from "@/components/ui/progress";

const universities = [
  "NexEra Global University",
  "IIT Delhi",
  "IIT Bombay",
  "NIT Trichy",
  "BITS Pilani",
  "VIT Vellore",
  "SRM Institute",
  "Other"
];

const courses = [
  "B.Tech Computer Science",
  "B.Tech Information Technology",
  "B.Tech Electronics",
  "B.Tech Mechanical",
  "B.Tech Civil",
  "B.Sc Data Science",
  "BCA",
  "MCA",
  "M.Tech",
  "Other"
];

const semesters = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"];

const suggestedSkills = [
  "JavaScript", "TypeScript", "React", "Node.js", "Python", "Java", "C++",
  "Machine Learning", "Data Science", "UI/UX Design", "Figma", "AWS",
  "Docker", "Git", "MongoDB", "PostgreSQL", "Next.js", "Vue.js", "Angular"
];

export default function StudentProfile() {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [isAddingCertificate, setIsAddingCertificate] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // DB hooks
  const { data: profileData, isLoading } = useStudentFullProfile();
  const updateProfile = useUpdateStudentProfile();
  const uploadAvatar = useUploadAvatar();
  const addSkillMutation = useAddSkill();
  const deleteSkillMutation = useDeleteSkill();
  const addProjectMutation = useAddProject();
  const deleteProjectMutation = useDeleteProject();
  const addCertificateMutation = useAddCertificate();
  const deleteCertificateMutation = useDeleteCertificate();

  // Local edit state
  const [editProfile, setEditProfile] = useState({
    name: "",
    username: "",
    avatar_url: "",
    bio: "",
    college: "",
    course: "",
    semester: "",
    linkedin_url: "",
    github_url: "",
    portfolio_url: "",
  });

  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    technologies: [] as string[],
    link: ""
  });

  const [newCertificate, setNewCertificate] = useState({
    title: "",
    issuer: "",
    date: "",
    link: ""
  });

  // Sync DB data to local edit state when data loads or editing starts
  useEffect(() => {
    if (profileData?.profile) {
      const p = profileData.profile;
      setEditProfile({
        name: p.name || "",
        username: p.username || "",
        avatar_url: p.avatar_url || "",
        bio: p.bio || "",
        college: p.college || "",
        course: p.course || "",
        semester: p.semester || "",
        linkedin_url: p.linkedin_url || "",
        github_url: p.github_url || "",
        portfolio_url: p.portfolio_url || "",
      });
    }
  }, [profileData?.profile]);

  const handleAvatarClick = () => {
    if (!isUploading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file first
    const validation = validateAvatarFile(file);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }
    
    // Upload to storage
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      await uploadAvatar.mutateAsync({
        file,
        onProgress: (progress) => setUploadProgress(progress),
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSave = async () => {
    await updateProfile.mutateAsync({
      name: editProfile.name,
      username: editProfile.username,
      avatar_url: editProfile.avatar_url || null,
      bio: editProfile.bio || null,
      college: editProfile.college || null,
      course: editProfile.course || null,
      semester: editProfile.semester || null,
      linkedin_url: editProfile.linkedin_url || null,
      github_url: editProfile.github_url || null,
      portfolio_url: editProfile.portfolio_url || null,
    });
    setIsEditing(false);
  };

  const handleAddSkill = async (skill: string) => {
    if (skill && !profileData?.skills.find(s => s.skill === skill)) {
      await addSkillMutation.mutateAsync(skill);
      setNewSkill("");
    }
  };

  const handleDeleteSkill = async (skillId: string) => {
    await deleteSkillMutation.mutateAsync(skillId);
  };

  const handleAddProject = async () => {
    if (newProject.title && newProject.description) {
      await addProjectMutation.mutateAsync({
        title: newProject.title,
        description: newProject.description,
        tech_stack: newProject.technologies,
        project_url: newProject.link || undefined,
      });
      setNewProject({ title: "", description: "", technologies: [], link: "" });
      setIsAddingProject(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    await deleteProjectMutation.mutateAsync(projectId);
  };

  const handleAddCertificate = async () => {
    if (newCertificate.title && newCertificate.issuer) {
      await addCertificateMutation.mutateAsync({
        title: newCertificate.title,
        issuer: newCertificate.issuer,
        issue_date: newCertificate.date || undefined,
        credential_url: newCertificate.link || undefined,
      });
      setNewCertificate({ title: "", issuer: "", date: "", link: "" });
      setIsAddingCertificate(false);
    }
  };

  const handleDeleteCertificate = async (certId: string) => {
    await deleteCertificateMutation.mutateAsync(certId);
  };

  // Get display values from DB or fallback
  const profile = profileData?.profile;
  const skills = profileData?.skills || [];
  const projects = profileData?.projects || [];
  const certificates = profileData?.certificates || [];

  if (isLoading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="max-w-5xl mx-auto space-y-10 pb-20">
        {/* Profile Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="premium-card card-violet p-8 md:p-10 group"
        >
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Avatar Section */}
            <div className="relative">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/jpeg,image/png,image/gif,image/webp"
                className="hidden"
                disabled={isUploading}
              />
              <div
                className={cn(
                  "relative h-32 w-32 rounded-full p-1 bg-gradient-to-tr from-violet-500/30 to-transparent transition-all duration-300",
                  !isUploading && "cursor-pointer hover:from-violet-500/50"
                )}
                onClick={handleAvatarClick}
              >
                <Avatar className="h-full w-full border-4 border-card">
                  <AvatarImage src={profile?.avatar_url || ""} />
                  <AvatarFallback className="bg-secondary text-foreground text-3xl font-bold">
                    {(profile?.name || "S").split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                {/* Upload overlay */}
                <div className={cn(
                  "absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center transition-opacity",
                  isUploading ? "opacity-100" : "opacity-0 hover:opacity-100"
                )}>
                  {isUploading ? (
                    <div className="flex flex-col items-center gap-2 px-4 w-full">
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                      <Progress value={uploadProgress} className="w-full h-1.5" />
                      <span className="text-[10px] text-white font-bold">{uploadProgress}%</span>
                    </div>
                  ) : (
                    <>
                      <Camera className="w-6 h-6 text-white" />
                      <span className="text-[10px] text-white font-bold mt-1">Change</span>
                    </>
                  )}
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-online rounded-full border-4 border-card shadow-sm" />
            </div>

            {/* Info Section */}
            <div className="flex-1 text-center md:text-left space-y-4">
              <div className="flex items-center justify-center md:justify-start gap-2 text-violet-500">
                <Shield className="w-3.5 h-3.5" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Verified Student</span>
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <Input
                    value={editProfile.name}
                    onChange={(e) => setEditProfile({ ...editProfile, name: e.target.value })}
                    placeholder="Full Name"
                    className="text-2xl font-bold bg-secondary/10 border-border h-14"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-foreground/60">@</span>
                    <Input
                      value={editProfile.username}
                      onChange={(e) => setEditProfile({ ...editProfile, username: e.target.value })}
                      placeholder="username"
                      className="bg-secondary/10 border-border"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="text-4xl font-semibold tracking-tight text-foreground/90">
                    {profile?.name || "Student"}
                  </h1>
                  <p className="text-sm text-foreground/70 font-medium">@{profile?.username || "username"}</p>
                </>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              {!isEditing ? (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="rounded-xl h-11 px-6 bg-violet-500 hover:bg-violet-600 text-black text-[10px] font-bold uppercase tracking-widest btn-press"
                >
                  <Edit2 className="w-3.5 h-3.5 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    onClick={() => setIsEditing(false)}
                    variant="ghost"
                    className="rounded-xl h-11 px-6 text-[10px] font-bold uppercase tracking-widest btn-press"
                  >
                    <X className="w-3.5 h-3.5 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={updateProfile.isPending}
                    className="rounded-xl h-11 px-6 bg-emerald-500 hover:bg-emerald-600 text-black text-[10px] font-bold uppercase tracking-widest btn-press"
                  >
                    {updateProfile.isPending ? (
                      <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-3.5 h-3.5 mr-2" />
                    )}
                    Save
                  </Button>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        <section className="rounded-3xl border border-border bg-secondary/10 p-8">
          <div className="grid lg:grid-cols-12 gap-10">
            {/* Left Column */}
            <div className="lg:col-span-8 space-y-10">
              {/* About Section */}
              <section>
                <h2 className="text-[10px] font-black text-foreground/60 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                  <UserIcon className="w-4 h-4" />
                  About
                </h2>
                <div className="premium-card card-indigo p-6">
                  {isEditing ? (
                    <Textarea
                      value={editProfile.bio}
                      onChange={(e) => setEditProfile({ ...editProfile, bio: e.target.value })}
                      className="min-h-[120px] bg-secondary/10 border-border"
                      placeholder="Tell us about yourself..."
                    />
                  ) : (
                    <p className="text-sm text-foreground/80 leading-relaxed">
                      {profile?.bio || "No bio yet. Click Edit Profile to add one."}
                    </p>
                  )}
                </div>
              </section>

              {/* Education Section */}
              <section>
                <h2 className="text-[10px] font-black text-foreground/60 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                  <GraduationCap className="w-4 h-4" />
                  Education
                </h2>
                <div className="premium-card card-teal p-6 space-y-6">
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-foreground/60 uppercase tracking-widest flex items-center gap-2">
                        <Building className="w-3 h-3" /> University
                      </label>
                      {isEditing ? (
                        <Select value={editProfile.college} onValueChange={(v) => setEditProfile({ ...editProfile, college: v })}>
                          <SelectTrigger className="bg-secondary/10 border-border">
                            <SelectValue placeholder="Select university" />
                          </SelectTrigger>
                          <SelectContent className="bg-card border-border">
                            {universities.map(u => (
                              <SelectItem key={u} value={u}>{u}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="text-sm font-bold text-foreground/80">{profile?.college || "Not set"}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-foreground/60 uppercase tracking-widest flex items-center gap-2">
                        <BookOpen className="w-3 h-3" /> Course
                      </label>
                      {isEditing ? (
                        <Select value={editProfile.course} onValueChange={(v) => setEditProfile({ ...editProfile, course: v })}>
                          <SelectTrigger className="bg-secondary/10 border-border">
                            <SelectValue placeholder="Select course" />
                          </SelectTrigger>
                          <SelectContent className="bg-card border-border">
                            {courses.map(c => (
                              <SelectItem key={c} value={c}>{c}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="text-sm font-bold text-foreground/80">{profile?.course || "Not set"}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-foreground/60 uppercase tracking-widest flex items-center gap-2">
                        <Calendar className="w-3 h-3" /> Semester
                      </label>
                      {isEditing ? (
                        <Select value={editProfile.semester} onValueChange={(v) => setEditProfile({ ...editProfile, semester: v })}>
                          <SelectTrigger className="bg-secondary/10 border-border">
                            <SelectValue placeholder="Select semester" />
                          </SelectTrigger>
                          <SelectContent className="bg-card border-border">
                            {semesters.map(s => (
                              <SelectItem key={s} value={s}>{s} Semester</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="text-sm font-bold text-foreground/80">
                          {profile?.semester ? `${profile.semester} Semester` : "Not set"}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              {/* Skills Section */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-[10px] font-black text-foreground/60 uppercase tracking-[0.2em] flex items-center gap-3">
                    <Sparkles className="w-4 h-4" />
                    Skills
                  </h2>
                </div>
                <div className="premium-card card-amber p-6">
                  <div className="flex flex-wrap gap-2 mb-4">
                    <AnimatePresence>
                      {skills.map((skill) => (
                        <motion.span
                          key={skill.id}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="px-4 py-2 rounded-xl bg-secondary/10 border border-border text-xs font-bold text-foreground/80 flex items-center gap-2 group"
                        >
                          {skill.skill}
                          <button
                            onClick={() => handleDeleteSkill(skill.id)}
                            disabled={deleteSkillMutation.isPending}
                            className="text-foreground/60 hover:text-rose-500 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </motion.span>
                      ))}
                    </AnimatePresence>
                    {skills.length === 0 && (
                      <p className="text-sm text-foreground/60">No skills added yet. Add some below!</p>
                    )}
                  </div>
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        placeholder="Add a skill..."
                        className="bg-secondary/10 border-border"
                        onKeyDown={(e) => e.key === "Enter" && handleAddSkill(newSkill)}
                      />
                      <Button
                        onClick={() => handleAddSkill(newSkill)}
                        disabled={addSkillMutation.isPending}
                        className="bg-amber-500 hover:bg-amber-600 text-black btn-press"
                      >
                        {addSkillMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {suggestedSkills.filter(s => !skills.find(sk => sk.skill === s)).slice(0, 8).map(skill => (
                        <button
                          key={skill}
                          onClick={() => handleAddSkill(skill)}
                          className="px-3 py-1.5 rounded-lg bg-secondary/5 border border-dashed border-border text-[10px] font-bold text-foreground/60 hover:text-foreground/70 hover:border-foreground/20 transition-all"
                        >
                          + {skill}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Projects Section */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-[10px] font-black text-foreground/60 uppercase tracking-[0.2em] flex items-center gap-3">
                    <Briefcase className="w-4 h-4" />
                    Projects
                  </h2>
                  <Dialog open={isAddingProject} onOpenChange={setIsAddingProject}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" className="text-[10px] font-bold uppercase tracking-widest text-violet-500 hover:text-violet-600 btn-press">
                        <Plus className="w-3 h-3 mr-1" /> Add Project
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-card border-border max-w-lg">
                      <DialogHeader>
                        <DialogTitle className="text-lg font-bold">Add New Project</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <Input
                          placeholder="Project Title"
                          value={newProject.title}
                          onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                          className="bg-secondary/10 border-border"
                        />
                        <Textarea
                          placeholder="Project Description"
                          value={newProject.description}
                          onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                          className="bg-secondary/10 border-border"
                        />
                        <Input
                          placeholder="Technologies (comma separated)"
                          onChange={(e) => setNewProject({ ...newProject, technologies: e.target.value.split(",").map(t => t.trim()).filter(Boolean) })}
                          className="bg-secondary/10 border-border"
                        />
                        <Input
                          placeholder="Project Link (optional)"
                          value={newProject.link}
                          onChange={(e) => setNewProject({ ...newProject, link: e.target.value })}
                          className="bg-secondary/10 border-border"
                        />
                        <Button
                          onClick={handleAddProject}
                          disabled={addProjectMutation.isPending}
                          className="w-full bg-violet-500 hover:bg-violet-600 text-black"
                        >
                          {addProjectMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                          Add Project
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="space-y-4">
                  {projects.length === 0 && (
                    <p className="text-sm text-foreground/60">No projects yet. Add your first project!</p>
                  )}
                  {projects.map((project) => (
                    <div key={project.id} className="premium-card card-violet p-6 group">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="icon-box">
                            <Briefcase className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-base font-bold text-foreground/90">{project.title}</h3>
                            {project.project_url && (
                              <a href={project.project_url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-violet-500 hover:underline flex items-center gap-1">
                                <ExternalLink className="w-3 h-3" /> View Project
                              </a>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteProject(project.id)}
                          disabled={deleteProjectMutation.isPending}
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-foreground/60 hover:text-rose-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-foreground/60 mb-4">{project.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {(project.tech_stack || []).map(tech => (
                          <span key={tech} className="px-3 py-1 rounded-lg bg-violet-500/10 border border-violet-500/20 text-[10px] font-bold text-violet-500">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Certificates Section */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-[10px] font-black text-foreground/60 uppercase tracking-[0.2em] flex items-center gap-3">
                    <Award className="w-4 h-4" />
                    Certifications
                  </h2>
                  <Dialog open={isAddingCertificate} onOpenChange={setIsAddingCertificate}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 hover:text-emerald-600 btn-press">
                        <Plus className="w-3 h-3 mr-1" /> Add Certificate
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-card border-border max-w-lg">
                      <DialogHeader>
                        <DialogTitle className="text-lg font-bold">Add Certification</DialogTitle>
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
                          placeholder="Issue Date (e.g., Dec 2024)"
                          value={newCertificate.date}
                          onChange={(e) => setNewCertificate({ ...newCertificate, date: e.target.value })}
                          className="bg-secondary/10 border-border"
                        />
                        <Input
                          placeholder="Credential URL (optional)"
                          value={newCertificate.link}
                          onChange={(e) => setNewCertificate({ ...newCertificate, link: e.target.value })}
                          className="bg-secondary/10 border-border"
                        />
                        <Button
                          onClick={handleAddCertificate}
                          disabled={addCertificateMutation.isPending}
                          className="w-full bg-emerald-500 hover:bg-emerald-600 text-black"
                        >
                          {addCertificateMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                          Add Certificate
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="space-y-4">
                  {certificates.length === 0 && (
                    <p className="text-sm text-foreground/60">No certificates yet. Add your first certification!</p>
                  )}
                  {certificates.map((cert) => (
                    <div key={cert.id} className="premium-card card-emerald p-6 group">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className="icon-box">
                            <Award className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-base font-bold text-foreground/90">{cert.title}</h3>
                            <p className="text-xs text-foreground/60">{cert.issuer}</p>
                            {cert.issue_date && (
                              <p className="text-[10px] text-foreground/60 mt-1">Issued {cert.issue_date}</p>
                            )}
                            {cert.credential_url && (
                              <a href={cert.credential_url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-emerald-500 hover:underline flex items-center gap-1 mt-1">
                                <ExternalLink className="w-3 h-3" /> View Credential
                              </a>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteCertificate(cert.id)}
                          disabled={deleteCertificateMutation.isPending}
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-foreground/60 hover:text-rose-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-4 space-y-10">
              {/* Contact */}
              <section>
                <h2 className="text-[10px] font-black text-foreground/60 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                  <Mail className="w-4 h-4" />
                  Contact
                </h2>
                <div className="premium-card card-rose p-6 space-y-4">
                  <div>
                    <p className="text-[9px] font-black text-foreground/60 uppercase tracking-widest mb-1">Email</p>
                    <p className="text-sm font-bold text-foreground/60">{profile?.email || user?.email || "student@nexera.edu"}</p>
                  </div>
                </div>
              </section>

              {/* Social Links */}
              <section>
                <h2 className="text-[10px] font-black text-foreground/60 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                  <Globe className="w-4 h-4" />
                  Social Links
                </h2>
                <div className="space-y-3">
                  {[
                    { key: "linkedin_url", label: "LinkedIn", icon: Linkedin, colorClass: "card-indigo", hoverColor: "hover:text-indigo-500", placeholder: "linkedin.com/in/..." },
                    { key: "github_url", label: "GitHub", icon: Github, colorClass: "card-teal", hoverColor: "hover:text-teal-500", placeholder: "github.com/..." },
                    { key: "portfolio_url", label: "Portfolio", icon: Globe, colorClass: "card-amber", hoverColor: "hover:text-amber-500", placeholder: "yoursite.com" },
                  ].map((social) => {
                    const url = (profile as any)?.[social.key];
                    const formattedUrl = url ? (url.startsWith('http') ? url : `https://${url}`) : null;

                    return (
                      <div key={social.key} className={cn("premium-card p-4 group", social.colorClass)}>
                        <div className="flex items-center gap-3">
                          <div className="icon-box">
                            <social.icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <p className="text-[9px] font-black text-foreground/60 uppercase tracking-widest mb-1">{social.label}</p>
                            {isEditing ? (
                              <Input
                                value={(editProfile as any)[social.key] || ""}
                                onChange={(e) => setEditProfile({ ...editProfile, [social.key]: e.target.value })}
                                placeholder={social.placeholder}
                                className="h-8 text-xs bg-secondary/10 border-border"
                              />
                            ) : (
                              formattedUrl ? (
                                <a
                                  href={formattedUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={cn(
                                    "text-xs font-bold text-foreground/60 transition-colors flex items-center gap-1.5 group/link",
                                    social.hoverColor
                                  )}
                                >
                                  <span className="truncate max-w-[180px]">{url}</span>
                                  <ExternalLink className="w-3 h-3 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                                </a>
                              ) : (
                                <p className="text-xs font-bold text-foreground/40 italic">Not connected</p>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Quick Links */}
              <section>
                <h2 className="text-[10px] font-black text-foreground/60 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                  <Shield className="w-4 h-4" />
                  Quick Links
                </h2>
                <div
                  onClick={() => window.open("https://vani-arch.vercel.app/", "_blank")}
                  className="premium-card card-purple p-6 cursor-pointer group hover:border-purple-500/40 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="icon-box bg-purple-500/20">
                      <Shield className="w-5 h-5 text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-bold text-foreground/90 group-hover:text-purple-400 transition-colors">
                        VANI Platform
                      </h3>
                      <p className="text-[10px] text-foreground/60 mt-1">
                        Report grievances anonymously and securely
                      </p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-foreground/40 group-hover:text-purple-400 transition-colors" />
                  </div>
                </div>
              </section>
            </div>
          </div>
        </section>
      </div>
    </StudentLayout>
  );
}
