import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import CounselorLayout from "@/components/layouts/CounselorLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { 
  Users, 
  MessageCircle, 
  Calendar, 
  Clock, 
  UserCheck,
  ArrowRight,
  HeartHandshake
} from "lucide-react";

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
  };
}

export default function CounselorHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<AssignedStudent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
        // Fetch student profiles
        const studentIds = data.map(a => a.student_id);
        const { data: profiles } = await supabase
          .from('student_profiles')
          .select('user_id, name, email, avatar_url, course, year')
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

  const stats = [
    { 
      label: "Assigned Students", 
      value: assignments.length, 
      icon: Users, 
      color: "text-blue-400",
      bgColor: "bg-blue-500/10" 
    },
    { 
      label: "Active Sessions", 
      value: 0, 
      icon: MessageCircle, 
      color: "text-green-400",
      bgColor: "bg-green-500/10" 
    },
    { 
      label: "This Week", 
      value: 0, 
      icon: Calendar, 
      color: "text-purple-400",
      bgColor: "bg-purple-500/10" 
    },
    { 
      label: "Avg. Session", 
      value: "45m", 
      icon: Clock, 
      color: "text-amber-400",
      bgColor: "bg-amber-500/10" 
    },
  ];

  return (
    <CounselorLayout>
      <div className="min-h-screen p-4 md:p-6 pb-24 md:pb-6 space-y-6">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center">
              <HeartHandshake className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                Welcome, {user?.name?.split(' ')[0] || 'Counselor'}!
              </h1>
              <p className="text-muted-foreground">
                Here's your counseling dashboard overview
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="glass-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                      <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Assigned Students */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-primary" />
                Your Assigned Students
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/counselor/students')}
              >
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : assignments.length === 0 ? (
                <div className="text-center py-8 space-y-2">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto" />
                  <p className="text-muted-foreground">No students assigned yet</p>
                  <p className="text-sm text-muted-foreground">
                    Students will appear here once assigned by an administrator
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {assignments.slice(0, 5).map((assignment) => (
                    <motion.div
                      key={assignment.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer"
                      onClick={() => navigate('/counselor/chats', { state: { studentId: assignment.student_id } })}
                      whileHover={{ x: 4 }}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={assignment.student_profile?.avatar_url || undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {assignment.student_profile?.name?.charAt(0) || 'S'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {assignment.student_profile?.name || 'Unknown Student'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {assignment.student_profile?.course} • {assignment.student_profile?.year}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="capitalize">
                          {assignment.assignment_type}
                        </Badge>
                        <Button variant="ghost" size="icon">
                          <MessageCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </CounselorLayout>
  );
}