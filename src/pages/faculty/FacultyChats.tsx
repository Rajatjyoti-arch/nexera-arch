import { useState, useEffect, useRef, useCallback } from "react";
import FacultyLayout from "@/components/layouts/FacultyLayout";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Search,
  Send,
  Phone,
  Video,
  MoreVertical,
  Plus,
  Smile,
  ChevronLeft,
  Sparkles,
  MessageCircle,
  Loader2,
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useChatsWithUnread, useRealtimeMessages, useRealtimeChatMessages, useMarkChatAsRead, ChatPreview } from "@/hooks/useMessages";
import { useChatMessages, useSendMessage, useFindOrCreateDirectChat } from "@/hooks/useChat";
import { useFacultyStudents } from "@/hooks/useFaculty";
import { useQueryClient } from "@tanstack/react-query";
import { format, isToday, isYesterday, parseISO } from "date-fns";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useChatPresence, useGlobalPresence } from "@/hooks/useChatPresence";
import { useChatAttachments } from "@/hooks/useChatAttachments";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { OnlineIndicator } from "@/components/chat/OnlineIndicator";
import { MessageAttachment } from "@/components/chat/MessageAttachment";
import { AttachmentButton } from "@/components/chat/AttachmentButton";

export default function FacultyChats() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedChat, setSelectedChat] = useState<ChatPreview | null>(null);
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [studentSearch, setStudentSearch] = useState("");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch chats with unread counts
  const { data: chats = [], isLoading: chatsLoading, refetch: refetchChats } = useChatsWithUnread();
  
  // Fetch messages for selected chat
  const { data: messages = [], isLoading: messagesLoading, refetch: refetchMessages } = useChatMessages(selectedChat?.id || null);
  
  // Mutations
  const sendMessage = useSendMessage();
  const markAsRead = useMarkChatAsRead();
  const findOrCreateChat = useFindOrCreateDirectChat();
  
  // Fetch students for new chat
  const { data: students = [] } = useFacultyStudents();

  // Presence & typing indicators
  const { getTypingIndicator, sendTypingStatus, isUserOnline } = useChatPresence(selectedChat?.id || null);
  const typingIndicator = getTypingIndicator();

  // Attachments
  const { handleFileSelect, sendMessageWithAttachment, isUploading } = useChatAttachments(selectedChat?.id || null);

  // Realtime subscriptions
  const handleGlobalMessageUpdate = useCallback(() => {
    refetchChats();
  }, [refetchChats]);

  const handleChatMessageUpdate = useCallback(() => {
    refetchMessages();
  }, [refetchMessages]);

  useRealtimeMessages(handleGlobalMessageUpdate);
  useRealtimeChatMessages(selectedChat?.id || null, handleChatMessageUpdate);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Mark chat as read when selected
  useEffect(() => {
    if (selectedChat?.id && selectedChat.unreadCount > 0) {
      markAsRead.mutate(selectedChat.id);
    }
  }, [selectedChat?.id]);

  const filteredChats = chats.filter(chat =>
    (chat.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.participants.some(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
    student.email.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const handleSend = async () => {
    if ((!message.trim() && !pendingFile) || !selectedChat?.id || isUploading) return;

    const messageText = message.trim();
    setMessage("");
    sendTypingStatus(false);

    try {
      if (pendingFile) {
        const attachment = await handleFileSelect(pendingFile);
        if (attachment) {
          await sendMessageWithAttachment.mutateAsync({
            content: messageText || `Sent ${attachment.type === 'image' ? 'an image' : 'a file'}`,
            attachmentUrl: attachment.url,
            attachmentType: attachment.type,
            attachmentName: attachment.name,
          });
        }
        setPendingFile(null);
      } else {
        await sendMessage.mutateAsync({
          chatId: selectedChat.id,
          content: messageText,
        });
      }
    } catch (error) {
      setMessage(messageText);
      toast.error("Failed to send message");
    }
  };

  const handleTyping = (value: string) => {
    setMessage(value);
    if (value.trim()) {
      sendTypingStatus(true);
    } else {
      sendTypingStatus(false);
    }
  };

  const handleFileSelectWrapper = (file: File) => {
    setPendingFile(file);
  };

  const handleStartChat = async (studentUserId: string) => {
    try {
      const chat = await findOrCreateChat.mutateAsync(studentUserId);
      setIsNewChatOpen(false);
      setStudentSearch("");
      // Refetch chats and select the new one
      await refetchChats();
      const newChat = chats.find(c => c.id === chat.id);
      if (newChat) {
        setSelectedChat(newChat);
      }
    } catch (error) {
      toast.error("Failed to start conversation");
    }
  };

  const formatTime = (dateString: string | null) => {
    if (!dateString) return '';
    const date = parseISO(dateString);
    if (isToday(date)) return format(date, 'h:mm a');
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMM d');
  };

  const formatMessageTime = (dateString: string) => {
    return format(parseISO(dateString), 'h:mm a');
  };

  const getChatDisplayName = (chat: ChatPreview) => {
    if (chat.name) return chat.name;
    if (chat.participants.length > 0) return chat.participants[0].name;
    return 'Unknown';
  };

  const getChatAvatar = (chat: ChatPreview) => {
    if (chat.participants.length > 0) return chat.participants[0].avatarUrl;
    return null;
  };

  return (
    <FacultyLayout>
      <div className="h-[calc(100vh-12rem)] glass-card border-border rounded-3xl overflow-hidden flex">
        {/* Chat List */}
        <div className={cn(
          "w-full md:w-80 lg:w-96 border-r border-border flex flex-col bg-secondary/5",
          selectedChat ? "hidden md:flex" : "flex"
        )}>
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-black tracking-tight">Messages</h1>
              <Dialog open={isNewChatOpen} onOpenChange={setIsNewChatOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-xl bg-secondary">
                    <Plus className="w-5 h-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card border-border">
                  <DialogHeader>
                    <DialogTitle>Start New Conversation</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <Input
                      placeholder="Search students..."
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      className="bg-secondary/20 border-border"
                    />
                    <ScrollArea className="h-64">
                      <div className="space-y-2">
                        {filteredStudents.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            No students found
                          </p>
                        ) : (
                          filteredStudents.map((student) => (
                            <button
                              key={student.user_id}
                              onClick={() => handleStartChat(student.user_id)}
                              disabled={findOrCreateChat.isPending}
                              className="w-full p-3 flex items-center gap-3 rounded-xl hover:bg-secondary transition-colors"
                            >
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={student.avatar_url || undefined} />
                                <AvatarFallback className="bg-primary text-primary-foreground">
                                  {student.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="text-left">
                                <p className="font-medium">{student.name}</p>
                                <p className="text-xs text-muted-foreground">{student.email}</p>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/60" />
              <Input
                placeholder="Search conversations..."
                className="h-12 pl-11 bg-secondary/20 border-border rounded-2xl focus:border-primary/50 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <ScrollArea className="flex-1">
            {chatsLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredChats.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                <MessageCircle className="w-10 h-10 text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground">
                  {searchQuery ? "No conversations found" : "No conversations yet"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Click + to start a new chat
                </p>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {filteredChats.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => setSelectedChat(chat)}
                    className={cn(
                      "w-full p-4 flex items-center gap-4 rounded-2xl transition-all duration-300 group",
                      selectedChat?.id === chat.id
                        ? "bg-faculty text-black shadow-glow-sm"
                        : "hover:bg-secondary"
                    )}
                  >
                    <div className="relative">
                      <Avatar className="h-14 w-14 border-2 border-border group-hover:border-border/80 transition-colors">
                        <AvatarImage src={getChatAvatar(chat) || undefined} />
                        <AvatarFallback className={cn(
                          "font-bold",
                          selectedChat?.id === chat.id ? "bg-white/20 text-black" : "bg-faculty text-black"
                        )}>
                          {chat.type === 'group' ? (
                            <Users className="w-5 h-5" />
                          ) : (
                            getChatDisplayName(chat).split(" ").map(n => n[0]).join("").slice(0, 2)
                          )}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold truncate flex items-center gap-2">
                          {getChatDisplayName(chat)}
                          {chat.type === 'group' && <Sparkles className="w-3 h-3 text-faculty" />}
                        </span>
                        <span className={cn(
                          "text-[10px] font-medium uppercase tracking-wider",
                          selectedChat?.id === chat.id ? "text-black/90" : "text-foreground/60"
                        )}>
                          {formatTime(chat.lastMessageAt)}
                        </span>
                      </div>
                      <p className={cn(
                        "text-sm truncate",
                        selectedChat?.id === chat.id ? "text-black" : "text-foreground/60"
                      )}>
                        {chat.lastMessage || "No messages yet"}
                      </p>
                    </div>
                    {chat.unreadCount > 0 && selectedChat?.id !== chat.id && (
                      <span className="min-w-6 h-6 rounded-full bg-faculty text-black text-[10px] font-black flex items-center justify-center shadow-glow-sm">
                        {chat.unreadCount}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Chat View */}
        <div className={cn(
          "flex-1 flex flex-col bg-secondary/5",
          !selectedChat ? "hidden md:flex items-center justify-center" : "flex"
        )}>
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="h-20 px-6 border-b border-border flex items-center justify-between bg-secondary/10">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden -ml-2"
                    onClick={() => setSelectedChat(null)}
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </Button>
                  <div className="relative">
                    <Avatar className="h-12 w-12 border-2 border-faculty/20">
                      <AvatarImage src={getChatAvatar(selectedChat) || undefined} />
                      <AvatarFallback className="bg-faculty text-black font-bold">
                        {selectedChat.type === 'group' ? (
                          <Users className="w-5 h-5" />
                        ) : (
                          getChatDisplayName(selectedChat).split(" ").map(n => n[0]).join("").slice(0, 2)
                        )}
                      </AvatarFallback>
                    </Avatar>
                    {selectedChat.type === 'direct' && selectedChat.participants[0] && (
                      <div className="absolute -bottom-0.5 -right-0.5 p-0.5 bg-background rounded-full">
                        <OnlineIndicator isOnline={isUserOnline(selectedChat.participants[0].userId)} size="md" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h2 className="font-bold flex items-center gap-2">
                      {getChatDisplayName(selectedChat)}
                      {selectedChat.type === "group" && <Sparkles className="w-3 h-3 text-faculty" />}
                    </h2>
                    <p className="text-xs text-foreground/60">
                      {selectedChat.type === 'group' 
                        ? `${selectedChat.participants.length + 1} members`
                        : isUserOnline(selectedChat.participants[0]?.userId || '') ? 'Online' : 'Direct message'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="rounded-xl hover:bg-secondary"><Phone className="w-5 h-5" /></Button>
                  <Button variant="ghost" size="icon" className="rounded-xl hover:bg-secondary"><Video className="w-5 h-5" /></Button>
                  <Button variant="ghost" size="icon" className="rounded-xl hover:bg-secondary"><MoreVertical className="w-5 h-5" /></Button>
                </div>
              </div>

              {/* Messages Area */}
              <ScrollArea className="flex-1 p-6">
                {messagesLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <MessageCircle className="w-12 h-12 text-muted-foreground/30 mb-3" />
                    <p className="text-muted-foreground">No messages yet</p>
                    <p className="text-sm text-muted-foreground/60">Send a message to start the conversation</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <AnimatePresence initial={false}>
                      {messages.map((msg) => {
                        const isMine = msg.sender_id === user?.id;
                        const hasAttachment = !!(msg as any).attachment_url;
                        return (
                          <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            className={cn(
                              "flex",
                              isMine ? "justify-end" : "justify-start"
                            )}
                          >
                            <div className="flex items-end gap-2 max-w-[70%]">
                              {!isMine && (
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={msg.sender?.avatar_url || undefined} />
                                  <AvatarFallback className="bg-secondary text-xs">
                                    {(msg.sender?.name || '?').split(" ").map(n => n[0]).join("").slice(0, 2)}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                              <div
                                className={cn(
                                  "px-5 py-3.5 shadow-lg",
                                  isMine ? "chat-bubble-sent bg-faculty" : "chat-bubble-received"
                                )}
                              >
                                {!isMine && msg.sender?.name && (
                                  <p className="text-[10px] font-bold text-foreground/60 mb-1">
                                    {msg.sender.name}
                                  </p>
                                )}
                                <p className="text-sm leading-relaxed">{msg.content}</p>
                                {hasAttachment && (
                                  <MessageAttachment
                                    url={(msg as any).attachment_url}
                                    type={(msg as any).attachment_type}
                                    name={(msg as any).attachment_name}
                                    isOwn={isMine}
                                  />
                                )}
                                <p className={cn(
                                  "text-[10px] mt-2 font-medium opacity-70",
                                  isMine ? "text-right" : "text-left"
                                )}>
                                  {formatMessageTime(msg.created_at)}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                    {/* Typing indicator */}
                    <AnimatePresence>
                      {typingIndicator && (
                        <TypingIndicator message={typingIndicator} />
                      )}
                    </AnimatePresence>
                    <div ref={scrollRef} />
                  </div>
                )}
              </ScrollArea>

              {/* Input Area */}
              <div className="p-6 border-t border-border bg-secondary/10 relative">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 relative">
                    <AttachmentButton
                      onFileSelect={handleFileSelectWrapper}
                      isUploading={isUploading}
                      pendingFile={pendingFile}
                      onClearPending={() => setPendingFile(null)}
                    />
                  </div>
                  <div className="flex-1 relative flex items-center">
                    <Input
                      placeholder="Type a message..."
                      value={message}
                      onChange={(e) => handleTyping(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                      className="h-14 bg-secondary/20 border-border rounded-2xl px-5 pr-12 focus:border-faculty/50 transition-all"
                    />
                    <Button variant="ghost" size="icon" className="absolute right-2 text-foreground/60 hover:text-faculty">
                      <Smile className="w-5 h-5" />
                    </Button>
                  </div>
                  <Button
                    onClick={handleSend}
                    disabled={(!message.trim() && !pendingFile) || sendMessage.isPending || isUploading}
                    size="icon"
                    className="h-14 w-14 rounded-2xl bg-faculty hover:bg-faculty/90 border-0 shadow-glow group disabled:opacity-50"
                  >
                    {sendMessage.isPending || isUploading ? (
                      <Loader2 className="w-6 h-6 animate-spin text-black" />
                    ) : (
                      <Send className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform text-black" />
                    )}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-10">
              <div className="w-24 h-24 rounded-3xl bg-faculty/20 flex items-center justify-center shadow-glow mb-8 opacity-20">
                <MessageCircle className="w-12 h-12 text-faculty" />
              </div>
              <h2 className="text-2xl font-black mb-2">Faculty Inbox</h2>
              <p className="text-foreground/60 max-w-xs">
                Select a conversation or start a new one with a student.
              </p>
            </div>
          )}
        </div>
      </div>
    </FacultyLayout>
  );
}
