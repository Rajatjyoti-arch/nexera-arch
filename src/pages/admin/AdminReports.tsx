import { useState } from "react";
import AdminLayout from "@/components/layouts/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AlertTriangle, MessageCircle, Check, X, Eye } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Report {
  id: string;
  type: "message" | "user";
  reason: string;
  reportedBy: string;
  reportedItem: string;
  status: "pending" | "resolved" | "dismissed";
  createdAt: string;
  content?: string;
}

const mockReports: Report[] = [
  { id: "1", type: "message", reason: "Inappropriate content", reportedBy: "Priyanshu Sharma", reportedItem: "Message in CSE Group", status: "pending", createdAt: "2 hours ago", content: "This is the reported message content that was flagged by the user." },
  { id: "2", type: "user", reason: "Harassment", reportedBy: "Aisha Khan", reportedItem: "User: troublemaker99", status: "pending", createdAt: "1 day ago" },
  { id: "3", type: "message", reason: "Spam", reportedBy: "Rahul Verma", reportedItem: "Direct Message", status: "resolved", createdAt: "3 days ago" },
];

export default function AdminReports() {
  const [reports] = useState<Report[]>(mockReports);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-warning/10 text-warning";
      case "resolved": return "bg-success/10 text-success";
      case "dismissed": return "bg-muted text-muted-foreground";
      default: return "";
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-display font-bold mb-1">Reports & Moderation</h1>
          <p className="text-foreground/70">Review reported content and take action</p>
        </div>

        <Card className="p-4 mb-6 border-warning/50 bg-warning/5">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-warning shrink-0" />
            <p className="text-sm">
              <strong className="text-warning">Moderation Policy:</strong> Only review content that has been explicitly reported.
              Do not read private messages unless flagged by users.
            </p>
          </div>
        </Card>

        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending">Pending ({reports.filter(r => r.status === "pending").length})</TabsTrigger>
            <TabsTrigger value="all">All Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-6">
            <div className="space-y-4">
              {reports.filter(r => r.status === "pending").map((report) => (
                <Card key={report.id} className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center shrink-0">
                      {report.type === "message" ? (
                        <MessageCircle className="w-5 h-5 text-warning" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-warning" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{report.reason}</h3>
                            <Badge variant="outline" className="capitalize">{report.type}</Badge>
                          </div>
                          <p className="text-sm text-foreground/70 mt-1">
                            Reported by {report.reportedBy} • {report.createdAt}
                          </p>
                          <p className="text-sm mt-2">{report.reportedItem}</p>
                        </div>
                        <Badge className={getStatusColor(report.status)}>{report.status}</Badge>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button size="sm" variant="outline" onClick={() => setSelectedReport(report)}>
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                        </Button>
                        <Button size="sm" variant="outline" className="text-success">
                          <Check className="w-4 h-4 mr-1" />
                          Take Action
                        </Button>
                        <Button size="sm" variant="ghost">
                          <X className="w-4 h-4 mr-1" />
                          Dismiss
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
              {reports.filter(r => r.status === "pending").length === 0 && (
                <Card className="p-8 text-center">
                  <p className="text-foreground/70">No pending reports 🎉</p>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="all" className="mt-6">
            <Card>
              <div className="divide-y divide-border">
                {reports.map((report) => (
                  <div key={report.id} className="p-4 flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      {report.type === "message" ? (
                        <MessageCircle className="w-4 h-4" />
                      ) : (
                        <AlertTriangle className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{report.reason}</p>
                      <p className="text-sm text-foreground/70">{report.reportedItem}</p>
                    </div>
                    <Badge className={getStatusColor(report.status)}>{report.status}</Badge>
                    <span className="text-xs text-foreground/70">{report.createdAt}</span>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Report Details Dialog */}
        <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Report Details</DialogTitle>
            </DialogHeader>
            {selectedReport && (
              <div className="space-y-4 mt-4">
                <div>
                  <p className="text-sm text-foreground/70">Reason</p>
                  <p className="font-medium">{selectedReport.reason}</p>
                </div>
                <div>
                  <p className="text-sm text-foreground/70">Reported By</p>
                  <p>{selectedReport.reportedBy}</p>
                </div>
                {selectedReport.content && (
                  <div>
                    <p className="text-sm text-foreground/70">Reported Content</p>
                    <Card className="p-3 mt-1 bg-muted">
                      <p className="text-sm">{selectedReport.content}</p>
                    </Card>
                  </div>
                )}
                <div className="flex gap-2 pt-4">
                  <Button className="flex-1" variant="outline">Warn User</Button>
                  <Button className="flex-1" variant="outline">Mute User</Button>
                  <Button className="flex-1" variant="destructive">Suspend</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
