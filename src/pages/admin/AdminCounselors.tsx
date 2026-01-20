import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import AdminLayout from "@/components/layouts/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  UserPlus, 
  HeartHandshake,
  Users,
  Link2,
  Trash2,
  Check,
  X,
  Loader2
} from "lucide-react";

interface Counselor {
  id: string;
  user_id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  specialization: string | null;
  status: string | null;
  availability_status: string;
}

interface Student {
  user_id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  course: string | null;
  year: string | null;
}

interface Assignment {
  id: string;
  counselor_id: string;
  student_id: string;
  assignment_type: string;
  notes: string | null;
  is_active: boolean;
  counselor_name?: string;
  student_name?: string;
}

export default function AdminCounselors() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [counselors, setCounselors] = useState<Counselor[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedCounselor, setSelectedCounselor] = useState<string>("");
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [assignmentType, setAssignmentType] = useState("general");
  const [assignmentNotes, setAssignmentNotes] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      // Fetch counselors
      const { data: counselorData } = await supabase
        .from('counselor_profiles')
        .select('*')
        .order('name');

      if (counselorData) setCounselors(counselorData);

      // Fetch students
      const { data: studentData } = await supabase
        .from('student_profiles')
        .select('user_id, name, email, avatar_url, course, year')
        .order('name');

      if (studentData) setStudents(studentData);

      // Fetch assignments
      const { data: assignmentData } = await supabase
        .from('counselor_assignments')
        .select('*')
        .eq('is_active', true)
        .order('assigned_at', { ascending: false });

      if (assignmentData) {
        const assignmentsWithNames = assignmentData.map(a => ({
          ...a,
          counselor_name: counselorData?.find(c => c.user_id === a.counselor_id)?.name,
          student_name: studentData?.find(s => s.user_id === a.student_id)?.name
        }));
        setAssignments(assignmentsWithNames);
      }

      setIsLoading(false);
    };

    fetchData();
  }, []);

  // Approve counselor
  const handleApproveCounselor = async (counselorUserId: string) => {
    const { error } = await supabase
      .from('counselor_profiles')
      .update({ status: 'active' })
      .eq('user_id', counselorUserId);

    if (error) {
      toast({ title: "Error", description: "Failed to approve counselor", variant: "destructive" });
    } else {
      setCounselors(prev => prev.map(c => 
        c.user_id === counselorUserId ? { ...c, status: 'active' } : c
      ));
      toast({ title: "Counselor Approved", description: "The counselor can now access the system" });
    }
  };

  // Create assignment
  const handleCreateAssignment = async () => {
    if (!selectedCounselor || !selectedStudent || !user?.id) return;

    setIsAssigning(true);
    const { data, error } = await supabase
      .from('counselor_assignments')
      .insert({
        counselor_id: selectedCounselor,
        student_id: selectedStudent,
        assignment_type: assignmentType,
        notes: assignmentNotes || null,
        assigned_by: user.id
      })
      .select()
      .single();

    if (error) {
      toast({ 
        title: "Error", 
        description: error.message.includes('duplicate') 
          ? "This student is already assigned to this counselor for this type" 
          : "Failed to create assignment", 
        variant: "destructive" 
      });
    } else {
      setAssignments(prev => [{
        ...data,
        counselor_name: counselors.find(c => c.user_id === selectedCounselor)?.name,
        student_name: students.find(s => s.user_id === selectedStudent)?.name
      }, ...prev]);
      
      toast({ title: "Assignment Created", description: "Student has been assigned to counselor" });
      setAssignDialogOpen(false);
      setSelectedCounselor("");
      setSelectedStudent("");
      setAssignmentType("general");
      setAssignmentNotes("");
    }
    setIsAssigning(false);
  };

  // Remove assignment
  const handleRemoveAssignment = async (assignmentId: string) => {
    const { error } = await supabase
      .from('counselor_assignments')
      .update({ is_active: false })
      .eq('id', assignmentId);

    if (error) {
      toast({ title: "Error", description: "Failed to remove assignment", variant: "destructive" });
    } else {
      setAssignments(prev => prev.filter(a => a.id !== assignmentId));
      toast({ title: "Assignment Removed" });
    }
  };

  const filteredCounselors = counselors.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingCounselors = filteredCounselors.filter(c => c.status === 'pending');
  const activeCounselors = filteredCounselors.filter(c => c.status === 'active');

  return (
    <AdminLayout>
      <div className="min-h-screen p-4 md:p-6 pb-24 md:pb-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              <HeartHandshake className="w-7 h-7" />
              Counselor Management
            </h1>
            <p className="text-muted-foreground">
              Manage counselors and student assignments
            </p>
          </div>

          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search counselors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64"
              />
            </div>

            <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Link2 className="w-4 h-4" />
                  Assign Student
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Assign Student to Counselor</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Select Counselor</Label>
                    <Select value={selectedCounselor} onValueChange={setSelectedCounselor}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a counselor" />
                      </SelectTrigger>
                      <SelectContent>
                        {activeCounselors.map(c => (
                          <SelectItem key={c.user_id} value={c.user_id}>
                            {c.name} - {c.specialization || 'General'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Select Student</Label>
                    <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a student" />
                      </SelectTrigger>
                      <SelectContent>
                        <ScrollArea className="h-60">
                          {students.map(s => (
                            <SelectItem key={s.user_id} value={s.user_id}>
                              {s.name} - {s.course || 'N/A'}
                            </SelectItem>
                          ))}
                        </ScrollArea>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Assignment Type</Label>
                    <Select value={assignmentType} onValueChange={setAssignmentType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="academic">Academic</SelectItem>
                        <SelectItem value="mental-health">Mental Health</SelectItem>
                        <SelectItem value="career">Career</SelectItem>
                        <SelectItem value="personal">Personal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Notes (Optional)</Label>
                    <Textarea
                      placeholder="Add any relevant notes about this assignment..."
                      value={assignmentNotes}
                      onChange={(e) => setAssignmentNotes(e.target.value)}
                    />
                  </div>

                  <Button 
                    className="w-full" 
                    onClick={handleCreateAssignment}
                    disabled={!selectedCounselor || !selectedStudent || isAssigning}
                  >
                    {isAssigning ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Assignment"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>

        <Tabs defaultValue="counselors" className="space-y-6">
          <TabsList>
            <TabsTrigger value="counselors" className="gap-2">
              <HeartHandshake className="w-4 h-4" />
              Counselors
              {pendingCounselors.length > 0 && (
                <Badge variant="destructive" className="ml-1">{pendingCounselors.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="assignments" className="gap-2">
              <Link2 className="w-4 h-4" />
              Assignments ({assignments.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="counselors" className="space-y-6">
            {/* Pending Approvals */}
            {pendingCounselors.length > 0 && (
              <Card className="glass-card border-amber-500/30">
                <CardHeader>
                  <CardTitle className="text-amber-400">Pending Approvals</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {pendingCounselors.map(counselor => (
                      <div key={counselor.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/30">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={counselor.avatar_url || undefined} />
                            <AvatarFallback>{counselor.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{counselor.name}</p>
                            <p className="text-sm text-muted-foreground">{counselor.email}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="gap-1"
                            onClick={() => handleApproveCounselor(counselor.user_id)}
                          >
                            <Check className="w-4 h-4" /> Approve
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Active Counselors */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Active Counselors ({activeCounselors.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : activeCounselors.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <HeartHandshake className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No active counselors</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {activeCounselors.map(counselor => (
                      <div key={counselor.id} className="p-4 rounded-xl bg-secondary/30 border border-border/50">
                        <div className="flex items-center gap-3 mb-3">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={counselor.avatar_url || undefined} />
                            <AvatarFallback className="bg-rose-500/20 text-rose-400">
                              {counselor.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold">{counselor.name}</p>
                            <p className="text-sm text-muted-foreground">{counselor.specialization || 'General'}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <Badge 
                            variant={counselor.availability_status === 'available' ? 'default' : 'secondary'}
                            className="capitalize"
                          >
                            {counselor.availability_status}
                          </Badge>
                          <p className="text-xs text-muted-foreground">
                            {assignments.filter(a => a.counselor_id === counselor.user_id).length} students
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assignments">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Active Assignments</CardTitle>
              </CardHeader>
              <CardContent>
                {assignments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Link2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No assignments yet</p>
                    <p className="text-sm">Use the "Assign Student" button to create assignments</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {assignments.map(assignment => (
                      <div 
                        key={assignment.id} 
                        className="flex items-center justify-between p-4 rounded-xl bg-secondary/30"
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <Users className="w-5 h-5 text-primary mx-auto" />
                            <p className="text-xs text-muted-foreground mt-1">Assignment</p>
                          </div>
                          <div>
                            <p className="font-medium">{assignment.student_name || 'Unknown Student'}</p>
                            <p className="text-sm text-muted-foreground">
                              → {assignment.counselor_name || 'Unknown Counselor'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="capitalize">
                            {assignment.assignment_type}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleRemoveAssignment(assignment.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}