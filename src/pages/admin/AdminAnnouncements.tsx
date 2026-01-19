import { useState } from "react";
import AdminLayout from "@/components/layouts/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Megaphone, Plus, AlertTriangle, Clock, Send } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: "normal" | "emergency";
  createdAt: string;
  active: boolean;
}

const mockAnnouncements: Announcement[] = [
  { id: "1", title: "Campus Closed Tomorrow", content: "Due to maintenance work, the campus will be closed tomorrow. Online classes will continue as scheduled.", type: "emergency", createdAt: "1 hour ago", active: true },
  { id: "2", title: "New Library Hours", content: "Starting next week, the library will be open from 8 AM to 10 PM on all days.", type: "normal", createdAt: "2 days ago", active: true },
  { id: "3", title: "Annual Sports Day", content: "Annual sports day will be held on December 15th. All students are encouraged to participate.", type: "normal", createdAt: "1 week ago", active: false },
];

export default function AdminAnnouncements() {
  const [announcements] = useState<Announcement[]>(mockAnnouncements);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEmergency, setIsEmergency] = useState(false);

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-display font-bold mb-1">Announcements</h1>
            <p className="text-foreground/70">Manage institute-wide announcements</p>
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Announcement
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Announcement</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Title</Label>
                  <Input placeholder="Announcement title" className="mt-1" />
                </div>
                <div>
                  <Label>Content</Label>
                  <Textarea placeholder="Write your announcement..." className="mt-1" rows={4} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Emergency Announcement</Label>
                    <p className="text-xs text-foreground/70">Shows as a banner across all pages</p>
                  </div>
                  <Switch checked={isEmergency} onCheckedChange={setIsEmergency} />
                </div>
                <Button className="w-full" onClick={() => setIsAddOpen(false)}>
                  <Send className="w-4 h-4 mr-2" />
                  Publish Announcement
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-4">
          {announcements.map((announcement) => (
            <Card key={announcement.id} className={`p-5 ${announcement.type === "emergency" && announcement.active ? "border-destructive/50 bg-destructive/5" : ""}`}>
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${announcement.type === "emergency" ? "bg-destructive/10" : "bg-admin/10"}`}>
                  {announcement.type === "emergency" ? (
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                  ) : (
                    <Megaphone className="w-5 h-5 text-admin" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{announcement.title}</h3>
                        {announcement.type === "emergency" && (
                          <Badge variant="destructive">Emergency</Badge>
                        )}
                      </div>
                      <p className="text-foreground/70 mt-2">{announcement.content}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-foreground/70 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {announcement.createdAt}
                      </span>
                      <Badge variant={announcement.active ? "default" : "secondary"} className="mt-2">
                        {announcement.active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
