import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Check, CheckCheck, X, Loader2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useNotices, useMarkNoticeAsRead, useMarkAllNoticesAsRead, useRealtimeNotices, Notice } from "@/hooks/useNotices";
import { formatDistanceToNow } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface NoticesPanelProps {
  className?: string;
}

export function NoticesPanel({ className }: NoticesPanelProps) {
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const { data: notices, isLoading, refetch } = useNotices();
  const markAsRead = useMarkNoticeAsRead();
  const markAllAsRead = useMarkAllNoticesAsRead();

  // Realtime subscription
  useRealtimeNotices(useCallback(() => {
    refetch();
  }, [refetch]));

  const unreadCount = notices?.filter(n => !n.isRead).length || 0;

  const handleNoticeClick = (notice: Notice) => {
    setSelectedNotice(notice);
    if (!notice.isRead) {
      markAsRead.mutate(notice.id);
    }
  };

  const handleMarkAllRead = () => {
    const unreadIds = (notices || []).filter(n => !n.isRead).map(n => n.id);
    if (unreadIds.length > 0) {
      markAllAsRead.mutate(unreadIds);
    }
  };

  const formatTime = (dateStr: string) => {
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
    } catch {
      return '';
    }
  };

  if (isLoading) {
    return (
      <div className={cn("premium-card p-6 card-amber", className)}>
        <div className="flex items-center gap-3 mb-4">
          <div className="icon-box">
            <Bell className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold">Notices</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={cn("premium-card p-6 card-amber", className)}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="icon-box relative">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 flex items-center justify-center bg-amber-500 text-black text-[9px] font-black rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold">Notices</h3>
              <p className="text-[10px] text-foreground/60 font-medium uppercase tracking-wider">
                {notices?.length || 0} total
              </p>
            </div>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllRead}
              disabled={markAllAsRead.isPending}
              className="text-[10px] font-bold uppercase tracking-widest text-amber-600 hover:text-amber-700 hover:bg-amber-500/10"
            >
              {markAllAsRead.isPending ? (
                <Loader2 className="w-3 h-3 animate-spin mr-1" />
              ) : (
                <CheckCheck className="w-3 h-3 mr-1" />
              )}
              Mark all read
            </Button>
          )}
        </div>

        <ScrollArea className="h-[300px] -mx-2 px-2">
          {!notices?.length ? (
            <div className="text-center py-8">
              <Bell className="w-10 h-10 mx-auto text-foreground/30 mb-3" />
              <p className="text-sm text-foreground/60 font-medium">No notices yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notices.map((notice) => (
                <motion.button
                  key={notice.id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => handleNoticeClick(notice)}
                  className={cn(
                    "w-full text-left p-4 rounded-xl transition-all duration-200 group relative",
                    notice.isRead
                      ? "bg-secondary/20 hover:bg-secondary/30"
                      : "bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/15"
                  )}
                >
                  {!notice.isRead && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-amber-500 rounded-r-full" />
                  )}
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                      notice.isRead ? "bg-secondary/50" : "bg-amber-500/20"
                    )}>
                      <Bell className={cn(
                        "w-4 h-4",
                        notice.isRead ? "text-foreground/50" : "text-amber-600"
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h4 className={cn(
                          "text-sm font-bold truncate",
                          notice.isRead ? "text-foreground/70" : "text-foreground"
                        )}>
                          {notice.title}
                        </h4>
                        {notice.isRead && (
                          <Check className="w-3.5 h-3.5 text-green-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-foreground/60 line-clamp-2 font-medium mb-2">
                        {notice.content}
                      </p>
                      <div className="flex items-center gap-1 text-[10px] text-foreground/50 font-medium">
                        <Clock className="w-3 h-3" />
                        {formatTime(notice.createdAt)}
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Notice Detail Dialog */}
      <Dialog open={!!selectedNotice} onOpenChange={() => setSelectedNotice(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{selectedNotice?.title}</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
              {selectedNotice?.content}
            </p>
            <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs text-foreground/50">
                <Clock className="w-3.5 h-3.5" />
                {selectedNotice && formatTime(selectedNotice.createdAt)}
              </div>
              <div className="flex items-center gap-1 text-xs text-green-500">
                <Check className="w-3.5 h-3.5" />
                Read
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
