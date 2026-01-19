import { useState } from "react";
import AdminLayout from "@/components/layouts/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Building2, BookOpen, Users, Trash2, Edit2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Department {
  id: string;
  name: string;
  code: string;
  courses: number;
  faculty: number;
}

interface Course {
  id: string;
  name: string;
  code: string;
  department: string;
  duration: string;
}

const mockDepartments: Department[] = [
  { id: "1", name: "Computer Science", code: "CSE", courses: 3, faculty: 12 },
  { id: "2", name: "Electronics & Communication", code: "ECE", courses: 2, faculty: 8 },
  { id: "3", name: "Mechanical Engineering", code: "MECH", courses: 2, faculty: 10 },
  { id: "4", name: "Information Technology", code: "IT", courses: 2, faculty: 6 },
];

const mockCourses: Course[] = [
  { id: "1", name: "B.Tech Computer Science", code: "BTCS", department: "CSE", duration: "4 Years" },
  { id: "2", name: "M.Tech Computer Science", code: "MTCS", department: "CSE", duration: "2 Years" },
  { id: "3", name: "B.Tech Electronics", code: "BTEC", department: "ECE", duration: "4 Years" },
  { id: "4", name: "B.Tech Mechanical", code: "BTME", department: "MECH", duration: "4 Years" },
];

export default function AdminAcademics() {
  const [isAddDeptOpen, setIsAddDeptOpen] = useState(false);
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-display font-bold mb-1">Academic Setup</h1>
          <p className="text-foreground/70">Manage departments, courses, and academic structure</p>
        </div>

        <Tabs defaultValue="departments">
          <TabsList>
            <TabsTrigger value="departments">
              <Building2 className="w-4 h-4 mr-2" />
              Departments
            </TabsTrigger>
            <TabsTrigger value="courses">
              <BookOpen className="w-4 h-4 mr-2" />
              Courses
            </TabsTrigger>
            <TabsTrigger value="batches">
              <Users className="w-4 h-4 mr-2" />
              Batches
            </TabsTrigger>
          </TabsList>

          <TabsContent value="departments" className="mt-6">
            <div className="flex justify-end mb-4">
              <Dialog open={isAddDeptOpen} onOpenChange={setIsAddDeptOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Department
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Department</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label>Department Name</Label>
                      <Input placeholder="e.g. Computer Science" className="mt-1" />
                    </div>
                    <div>
                      <Label>Department Code</Label>
                      <Input placeholder="e.g. CSE" className="mt-1" />
                    </div>
                    <Button className="w-full" onClick={() => setIsAddDeptOpen(false)}>
                      Create Department
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {mockDepartments.map((dept) => (
                <Card key={dept.id} className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{dept.name}</h3>
                        <Badge variant="outline">{dept.code}</Badge>
                      </div>
                      <div className="flex gap-4 mt-2 text-sm text-foreground/70">
                        <span>{dept.courses} courses</span>
                        <span>{dept.faculty} faculty</span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="courses" className="mt-6">
            <div className="flex justify-end mb-4">
              <Dialog open={isAddCourseOpen} onOpenChange={setIsAddCourseOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Course
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Course</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label>Course Name</Label>
                      <Input placeholder="e.g. B.Tech Computer Science" className="mt-1" />
                    </div>
                    <div>
                      <Label>Course Code</Label>
                      <Input placeholder="e.g. BTCS" className="mt-1" />
                    </div>
                    <div>
                      <Label>Duration</Label>
                      <Input placeholder="e.g. 4 Years" className="mt-1" />
                    </div>
                    <Button className="w-full" onClick={() => setIsAddCourseOpen(false)}>
                      Create Course
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <div className="divide-y divide-border">
                {mockCourses.map((course) => (
                  <div key={course.id} className="p-4 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{course.name}</p>
                        <Badge variant="secondary">{course.code}</Badge>
                      </div>
                      <p className="text-sm text-foreground/70 mt-1">
                        {course.department} • {course.duration}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="batches" className="mt-6">
            <Card className="p-6">
              <p className="text-foreground/70 text-center">
                Batch management coming soon. Create and manage academic batches and sections.
              </p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
