import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  UserPlus,
  MessageCircle,
  GraduationCap,
  MapPin,
  Users,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const colorClasses = ["card-indigo", "card-teal", "card-violet", "card-amber", "card-rose", "card-emerald"];

interface Student {
  id: string;
  name: string;
  username: string | null;
  avatar_url: string | null;
  college: string | null;
  course: string | null;
  year: string | null;
  skills: string[];
  bio: string | null;
}

interface PeopleGridProps {
  students: Student[];
  isLoading: boolean;
  searchQuery: string;
  onStartChat?: (studentId: string) => void;
}

export function PeopleGrid({ students, isLoading, searchQuery, onStartChat }: PeopleGridProps) {
  const navigate = useNavigate();

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.skills?.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
    student.course?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.college?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="premium-card card-indigo p-6 space-y-4">
            <div className="flex items-start justify-between">
              <Skeleton className="h-14 w-14 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-lg" />
            </div>
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-24" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-6 w-14" />
              <Skeleton className="h-6 w-14" />
              <Skeleton className="h-6 w-14" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-10" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!filteredStudents.length) {
    return (
      <div className="premium-card card-teal p-12 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-teal-500/20 to-emerald-500/20 flex items-center justify-center">
          <Users className="w-8 h-8 text-teal-500/50" />
        </div>
        <h3 className="text-lg font-bold text-foreground/70 mb-2">
          {searchQuery ? "No matches found" : "No students yet"}
        </h3>
        <p className="text-sm text-foreground/50 max-w-sm mx-auto">
          {searchQuery 
            ? "Try adjusting your search criteria or use different keywords" 
            : "Be patient! Students will start appearing soon."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {filteredStudents.map((student, i) => (
        <motion.div
          key={student.id}
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: i * 0.04, duration: 0.3 }}
          className={cn(
            "premium-card p-5 md:p-6 group hover:scale-[1.02] transition-all duration-300",
            colorClasses[i % colorClasses.length]
          )}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-5">
            <div className="relative">
              <Avatar className="h-14 w-14 border-2 border-border/50 ring-2 ring-secondary/10 group-hover:ring-teal-500/20 transition-all duration-300">
                <AvatarImage src={student.avatar_url || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-secondary/30 to-secondary/10 text-foreground text-lg font-bold">
                  {student.name.split(" ").map(n => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-card" />
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-lg bg-secondary/20 text-foreground/60 border border-border/50">
              {student.year || "Student"}
            </span>
          </div>

          {/* Info */}
          <h3 className="text-base font-bold text-foreground/90 mb-0.5 group-hover:text-foreground transition-colors">
            {student.name}
          </h3>
          {student.username && (
            <p className="text-[10px] text-foreground/50 mb-4">@{student.username}</p>
          )}

          <div className="space-y-1.5 mb-5 text-[11px] text-foreground/60">
            <p className="flex items-center gap-2">
              <GraduationCap className="w-3.5 h-3.5 text-teal-500/70" />
              <span className="truncate">{student.course || "Course not specified"}</span>
            </p>
            <p className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-rose-500/70" />
              <span className="truncate">{student.college || "College not specified"}</span>
            </p>
          </div>

          {/* Skills */}
          {student.skills?.length ? (
            <div className="flex flex-wrap gap-1.5 mb-5">
              {student.skills.slice(0, 4).map(skill => (
                <span 
                  key={skill} 
                  className="px-2 py-1 rounded-md bg-secondary/20 text-[9px] font-bold text-foreground/60 border border-border/30"
                >
                  {skill}
                </span>
              ))}
              {student.skills.length > 4 && (
                <span className="px-2 py-1 rounded-md bg-teal-500/10 text-[9px] font-bold text-teal-500">
                  +{student.skills.length - 4}
                </span>
              )}
            </div>
          ) : null}

          {/* Actions */}
          <div className="flex gap-2">
            <Button className="flex-1 rounded-xl h-10 text-[10px] font-bold uppercase tracking-widest bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-black transition-all duration-300 group/btn">
              <UserPlus className="w-4 h-4 mr-2 group-hover/btn:scale-110 transition-transform" />
              Connect
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onStartChat?.(student.id)}
              className="h-10 w-10 rounded-xl border border-border hover:border-teal-500/30 hover:bg-teal-500/10 hover:text-teal-500 transition-all duration-300"
            >
              <MessageCircle className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
