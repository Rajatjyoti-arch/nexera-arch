import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import CounselorLayout from "@/components/layouts/CounselorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { 
  Search, 
  MessageCircle, 
  Users,
  GraduationCap,
  Calendar,
  ArrowRight
} from "lucide-react";
import { format } from "date-fns";

interface AssignedStudent {
  id: string;
  student_id: string;
  assignment_type: string;
  notes: string | null;
  assigned_at: string;
  student_profile?: {
    name: string;
    email: string;
    avatar_url: string | null;
    course: string | null;
    year: string | null;
    college: string | null;
  };
}

export default function CounselorStudents() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<AssignedStudent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchAssignments = async () => {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from('counselor_assignments')
        .select('*')
        .eq('counselor_id', user.id)
        .eq('is_active', true)
        .order('assigned_at', { ascending: false });

      if (!error && data) {
        const studentIds = data.map(a => a.student_id);
        const { data: profiles } = await supabase
          .from('student_profiles')
          .select('user_id, name, email, avatar_url, course, year, college')
          .in('user_id', studentIds);

        const assignmentsWithProfiles = data.map(assignment => ({
          ...assignment,
          student_profile: profiles?.find(p => p.user_id === assignment.student_id)
        }));

        setAssignments(assignmentsWithProfiles);
      }
      setIsLoading(false);
    };

    fetchAssignments();
  }, [user?.id]);

  const filteredAssignments = assignments.filter(a =>
    a.student_profile?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.student_profile?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.assignment_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedByType = filteredAssignments.reduce((acc, assignment) => {
    const type = assignment.assignment_type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(assignment);
    return acc;
  }, {} as Record<string, AssignedStudent[]>);

  return (
    <CounselorLayout>
      <div className="min-h-screen p-4 md:p-6 pb-24 md:pb-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              <Users className="w-7 h-7" />
              My Students
            </h1>
            <p className="text-muted-foreground">
              {assignments.length} student{assignments.length !== 1 ? 's' : ''} assigned to you
            </p>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </motion.div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : assignments.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="py-12 text-center space-y-4">
              <Users className="w-16 h-16 text-muted-foreground mx-auto" />
              <h3 className="text-xl font-semibold">No Students Assigned</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Students will appear here once assigned by an administrator. 
                Check back later or contact the admin office.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedByType).map(([type, students], groupIndex) => (
              <motion.div
                key={type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: groupIndex * 0.1 }}
              >
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 capitalize">
                      <Badge variant="outline" className="text-sm px-3 py-1">
                        {type}
                      </Badge>
                      <span className="text-muted-foreground text-sm font-normal">
                        ({students.length} student{students.length !== 1 ? 's' : ''})
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {students.map((assignment, i) => (
                        <motion.div
                          key={assignment.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.05 }}
                          className="p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-all border border-border/50 hover:border-primary/30 cursor-pointer group"
                          onClick={() => navigate('/counselor/chats', { state: { studentId: assignment.student_id } })}
                        >
                          <div className="flex items-start gap-3">
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={assignment.student_profile?.avatar_url || undefined} />
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {assignment.student_profile?.name?.charAt(0) || 'S'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold truncate group-hover:text-primary transition-colors">
                                {assignment.student_profile?.name || 'Unknown Student'}
                              </h4>
                              <p className="text-sm text-muted-foreground truncate">
                                {assignment.student_profile?.email}
                              </p>
                            </div>
                          </div>

                          <div className="mt-3 space-y-2">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <GraduationCap className="w-4 h-4" />
                              <span className="truncate">
                                {assignment.student_profile?.course || 'N/A'} • {assignment.student_profile?.year || 'N/A'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="w-4 h-4" />
                              <span>
                                Assigned {format(new Date(assignment.assigned_at), 'MMM d, yyyy')}
                              </span>
                            </div>
                          </div>

                          {assignment.notes && (
                            <p className="mt-3 text-sm text-muted-foreground bg-background/50 p-2 rounded-lg">
                              {assignment.notes}
                            </p>
                          )}

                          <div className="mt-4 flex items-center justify-between">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate('/counselor/chats', { state: { studentId: assignment.student_id } });
                              }}
                            >
                              <MessageCircle className="w-4 h-4" />
                              Message
                            </Button>
                            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </CounselorLayout>
  );
}