import { useState } from "react";
import FacultyLayout from "@/components/layouts/FacultyLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Bell, Plus, Send, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Notice {
  id: string;
  title: string;
  content: string;
  target: string;
  createdAt: string;
}

const mockNotices: Notice[] = [
  { id: "1", title: "Assignment Deadline Extended", content: "The deadline for Assignment 3 has been extended to next Friday.", target: "CSE 2024 - Section A", createdAt: "2 hours ago" },
  { id: "2", title: "Lab Session Tomorrow", content: "Reminder: Lab session at 10 AM in Computer Lab 3.", target: "CSE 2023 - Section B", createdAt: "1 day ago" },
  { id: "3", title: "Project Guidelines Updated", content: "Please check the updated project guidelines on the portal.", target: "Department - CSE", createdAt: "3 days ago" },
];

export default function FacultyNotices() {
  const [notices] = useState<Notice[]>(mockNotices);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <FacultyLayout>
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-display font-bold mb-1">Notices</h1>
            <p className="text-foreground/70">Post announcements to your classes</p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Notice
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Notice</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Title</Label>
                  <Input placeholder="Notice title" className="mt-1" />
                </div>
                <div>
                  <Label>Send To</Label>
                  <Select>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select target" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cse-a">CSE 2024 - Section A</SelectItem>
                      <SelectItem value="cse-b">CSE 2023 - Section B</SelectItem>
                      <SelectItem value="dept">Department - CSE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Content</Label>
                  <Textarea placeholder="Write your notice..." className="mt-1" rows={4} />
                </div>
                <Button className="w-full" onClick={() => setIsOpen(false)}>
                  <Send className="w-4 h-4 mr-2" />
                  Post Notice
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-4">
          {notices.map((notice) => (
            <Card key={notice.id} className="p-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-faculty/10 flex items-center justify-center shrink-0">
                  <Bell className="w-5 h-5 text-faculty" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold">{notice.title}</h3>
                      <Badge variant="outline" className="mt-1">{notice.target}</Badge>
                    </div>
                    <span className="text-xs text-foreground/70 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {notice.createdAt}
                    </span>
                  </div>
                  <p className="text-foreground/70 mt-3">{notice.content}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </FacultyLayout>
  );
}
