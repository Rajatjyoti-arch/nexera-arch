import { useState } from "react";
import AdminLayout from "@/components/layouts/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, UserPlus, MoreVertical, Check, X, Filter } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface User {
  id: string;
  name: string;
  email: string;
  role: "student" | "faculty";
  status: "active" | "pending" | "suspended";
  department?: string;
  course?: string;
}

const mockUsers: User[] = [
  { id: "1", name: "Priyanshu Sharma", email: "priyanshu@dtu.ac.in", role: "student", status: "active", course: "B.Tech CSE" },
  { id: "2", name: "Aisha Khan", email: "aisha@dtu.ac.in", role: "student", status: "pending", course: "B.Tech CSE" },
  { id: "3", name: "Dr. Anjali Mehta", email: "anjali.mehta@dtu.ac.in", role: "faculty", status: "active", department: "Computer Science" },
  { id: "4", name: "Rahul Verma", email: "rahul@dtu.ac.in", role: "student", status: "suspended", course: "B.Tech Mechanical" },
  { id: "5", name: "Prof. Suresh Kumar", email: "suresh.k@dtu.ac.in", role: "faculty", status: "active", department: "Electronics" },
];

export default function AdminUsers() {
  const [users] = useState<User[]>(mockUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-success/10 text-success";
      case "pending": return "bg-warning/10 text-warning";
      case "suspended": return "bg-destructive/10 text-destructive";
      default: return "";
    }
  };

  return (
    <AdminLayout>
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-display font-bold mb-1">User Management</h1>
            <p className="text-foreground/70">Manage students and faculty accounts</p>
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="w-4 h-4 mr-2" />
                Add Faculty
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Faculty Member</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Full Name</Label>
                  <Input placeholder="Dr. John Doe" className="mt-1" />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input type="email" placeholder="john.doe@college.edu" className="mt-1" />
                </div>
                <div>
                  <Label>Department</Label>
                  <Select>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cse">Computer Science</SelectItem>
                      <SelectItem value="ece">Electronics</SelectItem>
                      <SelectItem value="mech">Mechanical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Designation</Label>
                  <Input placeholder="Associate Professor" className="mt-1" />
                </div>
                <Button className="w-full" onClick={() => setIsAddOpen(false)}>
                  Create Account
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/70" />
            <Input
              placeholder="Search users..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Users</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="faculty">Faculty</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <Card>
              <div className="divide-y divide-border">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="p-4 flex items-center gap-4">
                    <Avatar>
                      <AvatarFallback className={user.role === "faculty" ? "bg-faculty text-faculty-foreground" : "bg-student text-student-foreground"}>
                        {user.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{user.name}</p>
                        <Badge variant="outline" className="capitalize">{user.role}</Badge>
                      </div>
                      <p className="text-sm text-foreground/70 truncate">{user.email}</p>
                    </div>
                    <Badge className={getStatusColor(user.status)}>{user.status}</Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {user.status === "pending" && (
                          <DropdownMenuItem>
                            <Check className="w-4 h-4 mr-2" />
                            Approve
                          </DropdownMenuItem>
                        )}
                        {user.status !== "suspended" && (
                          <DropdownMenuItem className="text-destructive">
                            <X className="w-4 h-4 mr-2" />
                            Suspend
                          </DropdownMenuItem>
                        )}
                        {user.status === "suspended" && (
                          <DropdownMenuItem>
                            <Check className="w-4 h-4 mr-2" />
                            Reactivate
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="students" className="mt-6">
            <Card>
              <div className="divide-y divide-border">
                {filteredUsers.filter(u => u.role === "student").map((user) => (
                  <div key={user.id} className="p-4 flex items-center gap-4">
                    <Avatar>
                      <AvatarFallback className="bg-student text-student-foreground">
                        {user.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-foreground/70">{user.course}</p>
                    </div>
                    <Badge className={getStatusColor(user.status)}>{user.status}</Badge>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="faculty" className="mt-6">
            <Card>
              <div className="divide-y divide-border">
                {filteredUsers.filter(u => u.role === "faculty").map((user) => (
                  <div key={user.id} className="p-4 flex items-center gap-4">
                    <Avatar>
                      <AvatarFallback className="bg-faculty text-faculty-foreground">
                        {user.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-foreground/70">{user.department}</p>
                    </div>
                    <Badge className={getStatusColor(user.status)}>{user.status}</Badge>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="pending" className="mt-6">
            <Card>
              <div className="divide-y divide-border">
                {filteredUsers.filter(u => u.status === "pending").map((user) => (
                  <div key={user.id} className="p-4 flex items-center gap-4">
                    <Avatar>
                      <AvatarFallback className="bg-student text-student-foreground">
                        {user.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-foreground/70">{user.email}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" className="text-destructive">
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
