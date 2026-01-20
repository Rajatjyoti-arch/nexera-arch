import { useState, useEffect, useRef, useCallback } from "react";
import StudentLayout from "@/components/layouts/StudentLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Search,
  Send,
  Phone,
  Video,
  MoreVertical,
  Plus,
  ChevronLeft,
  MessageCircle,
  CheckCheck,
  Smile,
  Mic,
  Users,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { useChatsWithUnread, useMarkChatAsRead, useRealtimeMessages, useRealtimeChatMessages, ChatPreview } from "@/hooks/useMessages";
import { useChatMessages, useSendMessage } from "@/hooks/useChat";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { NewChatDialog } from "@/components/chat/NewChatDialog";
import { useChatPresence, useGlobalPresence } from "@/hooks/useChatPresence";
import { useChatAttachments } from "@/hooks/useChatAttachments";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { OnlineIndicator } from "@/components/chat/OnlineIndicator";
import { MessageAttachment } from "@/components/chat/MessageAttachment";
import { AttachmentButton } from "@/components/chat/AttachmentButton";

const getTypeColor = (type: string) => {
  switch (type) {
    case "direct": return "card-indigo";
    case "group": return "card-violet";
    default: return "card-indigo";
  }
};


export default function StudentChats() {
  const { user } = useAuth();
  const [selectedChat, setSelectedChat] = useState<ChatPreview | null>(null);
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch chats with unread counts
  const { data: chats, isLoading: chatsLoading, refetch: refetchChats } = useChatsWithUnread();
  
  // Fetch messages for selected chat
  const { data: messages, isLoading: messagesLoading, refetch: refetchMessages } = useChatMessages(selectedChat?.id || null);
  
  // Mutations
  const markAsRead = useMarkChatAsRead();
  const sendMessage = useSendMessage();

  // Presence & typing indicators
  const { onlineUsers: globalOnline, isUserOnline: isGlobalOnline } = useGlobalPresence();
  const { getTypingIndicator, sendTypingStatus, isUserOnline } = useChatPresence(selectedChat?.id || null);
  const typingIndicator = getTypingIndicator();

  // Attachments
  const { handleFileSelect, sendMessageWithAttachment, isUploading } = useChatAttachments(selectedChat?.id || null);

  // Realtime: subscribe to all message inserts for chat list updates
  const handleChatListUpdate = useCallback(() => {
    refetchChats();
  }, [refetchChats]);
  
  useRealtimeMessages(handleChatListUpdate);

  // Realtime: subscribe to selected chat messages for instant updates
  const handleNewChatMessage = useCallback(() => {
    if (selectedChat) {
      refetchMessages();
      // Also mark as read since we're viewing the chat
      markAsRead.mutate(selectedChat.id);
    }
  }, [selectedChat, refetchMessages, markAsRead]);
  
  useRealtimeChatMessages(selectedChat?.id || null, handleNewChatMessage);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current && messages?.length) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Mark chat as read when selected
  useEffect(() => {
    if (selectedChat && selectedChat.unreadCount > 0) {
      markAsRead.mutate(selectedChat.id);
    }
  }, [selectedChat?.id]);

  const handleSend = async () => {
    if ((!message.trim() && !pendingFile) || !selectedChat || sendMessage.isPending || isUploading) return;
    
    const messageText = message.trim();
    setMessage(""); // Clear immediately for better UX
    sendTypingStatus(false);

    try {
      if (pendingFile) {
        // Upload file and send with attachment
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
        await sendMessage.mutateAsync({ chatId: selectedChat.id, content: messageText });
      }
    } catch {
      // Restore message if send failed
      setMessage(messageText);
    }
  };

  // Handle typing
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

  const filteredChats = (chats || []).filter(chat =>
    (chat.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.participants.some(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleChatCreated = (chatId: string) => {
    // Refetch chats and select the new one
    refetchChats().then(() => {
      const newChat = chats?.find(c => c.id === chatId);
      if (newChat) {
        setSelectedChat(newChat);
      }
    });
  };

  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return '';
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: false });
    } catch {
      return '';
    }
  };

  return (
    <StudentLayout>
      <div className="max-w-7xl mx-auto h-[calc(100vh-8rem)]">
        <div className="h-full flex lg:gap-6">
          {/* Chat List Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={cn(
              "flex flex-col premium-card card-indigo overflow-hidden h-full",
              "w-full lg:w-96",
              selectedChat ? "hidden lg:flex" : "flex"
            )}
          >
            {/* Header */}
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="icon-box">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold tracking-tight">Messages</h1>
                    <p className="text-[10px] text-foreground font-bold uppercase tracking-widest">
                      {chats?.length || 0} conversations
                    </p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-10 w-10 rounded-xl hover:bg-secondary btn-press border border-border"
                  onClick={() => setNewChatOpen(true)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/70 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-12 pl-12 pr-4 bg-secondary/20 border border-border rounded-xl text-xs outline-none focus:border-indigo-500/30 transition-all placeholder:text-foreground/70 font-medium"
                />
              </div>
            </div>

            {/* Chat List */}
            <ScrollArea className="flex-1">
              <div className="p-3 space-y-1">
                {chatsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : filteredChats.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageCircle className="w-12 h-12 mx-auto text-foreground/30 mb-4" />
                    <p className="text-sm text-foreground/60 font-medium">No conversations yet</p>
                    <p className="text-xs text-foreground/40 mt-1">Start a new chat to connect</p>
                  </div>
                ) : (
                  <>
                    <p className="text-[9px] font-black text-foreground/70 uppercase tracking-widest px-3 mb-2">All Messages</p>
                    {filteredChats.map((chat) => (
                      <ChatItem 
                        key={chat.id} 
                        chat={chat} 
                        selected={selectedChat?.id === chat.id} 
                        onClick={() => setSelectedChat(chat)}
                        formatTime={formatTime}
                      />
                    ))}
                  </>
                )}
              </div>
            </ScrollArea>
          </motion.div>

          {/* Chat View */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "flex-1 flex flex-col premium-card overflow-hidden h-full",
              !selectedChat ? "hidden lg:flex" : "flex",
              selectedChat ? getTypeColor(selectedChat.type) : "card-teal"
            )}
          >
            {selectedChat ? (
              <>
                {/* Chat Header */}
                <div className="h-20 px-8 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" className="lg:hidden h-10 w-10 rounded-xl" onClick={() => setSelectedChat(null)}>
                      <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <div className="relative">
                      <Avatar className="h-12 w-12 border-2 border-border transition-transform hover:scale-105">
                        <AvatarImage src={selectedChat.participants[0]?.avatarUrl || undefined} />
                        <AvatarFallback className="bg-secondary text-foreground text-sm font-bold">
                          {(selectedChat.name || selectedChat.participants[0]?.name || 'U').split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      {selectedChat.type === 'direct' && selectedChat.participants[0] && (
                        <div className="absolute -bottom-0.5 -right-0.5 p-0.5 bg-background rounded-full">
                          <OnlineIndicator isOnline={isUserOnline(selectedChat.participants[0].userId)} size="md" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-foreground/90 flex items-center gap-2">
                        {selectedChat.name || selectedChat.participants[0]?.name || 'Unknown'}
                      </h2>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/60">
                        {selectedChat.type === 'group' 
                          ? `${selectedChat.participants.length} members` 
                          : isUserOnline(selectedChat.participants[0]?.userId || '') ? 'Online' : 'Direct message'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-secondary btn-press border border-border">
                      <Phone className="w-4 h-4 text-foreground/70" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-secondary btn-press border border-border">
                      <Video className="w-4 h-4 text-foreground/70" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-secondary btn-press border border-border">
                      <MoreVertical className="w-4 h-4 text-foreground/70" />
                    </Button>
                  </div>
                </div>

                {/* Messages Area */}
                <ScrollArea className="flex-1 p-8">
                  <div className="space-y-6 max-w-3xl mx-auto">
                    {messagesLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      </div>
                    ) : !messages?.length ? (
                      <div className="text-center py-12">
                        <MessageCircle className="w-12 h-12 mx-auto text-foreground/30 mb-4" />
                        <p className="text-sm text-foreground/60 font-medium">No messages yet</p>
                        <p className="text-xs text-foreground/40 mt-1">Send a message to start the conversation</p>
                      </div>
                    ) : (
                      messages.map((msg) => {
                        const isOwn = msg.sender_id === user?.id;
                        const senderName = msg.sender?.name || 'Unknown';
                        const msgTime = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        const hasAttachment = !!(msg as any).attachment_url;
                        
                        return (
                          <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, x: isOwn ? 20 : -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={cn("flex gap-3", isOwn ? "justify-end" : "")}
                          >
                            {!isOwn && (
                              <Avatar className="h-8 w-8 border border-border shrink-0">
                                <AvatarFallback className="bg-secondary text-foreground text-[10px] font-bold">
                                  {senderName.split(" ").map(n => n[0]).join("")}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            <div className={cn(
                              "px-5 py-4 max-w-[75%] rounded-2xl",
                              isOwn 
                                ? "bg-indigo-500 rounded-tr-sm shadow-lg shadow-indigo-500/20" 
                                : "premium-card card-indigo rounded-tl-sm"
                            )}>
                              <p className={cn(
                                "text-sm leading-relaxed font-medium",
                                isOwn ? "text-black" : "text-foreground/80"
                              )}>
                                {msg.content}
                              </p>
                              {hasAttachment && (
                                <MessageAttachment
                                  url={(msg as any).attachment_url}
                                  type={(msg as any).attachment_type}
                                  name={(msg as any).attachment_name}
                                  isOwn={isOwn}
                                />
                              )}
                              <div className="flex items-center justify-end gap-1.5 mt-2">
                                <span className={cn(
                                  "text-[10px] font-medium",
                                  isOwn ? "text-black" : "text-foreground/70"
                                )}>
                                  {msgTime}
                                </span>
                                {isOwn && <CheckCheck className="w-3.5 h-3.5 text-black" />}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })
                    )}
                    {/* Typing indicator */}
                    <AnimatePresence>
                      {typingIndicator && (
                        <TypingIndicator message={typingIndicator} />
                      )}
                    </AnimatePresence>
                    <div ref={scrollRef} />
                  </div>
                </ScrollArea>

                {/* Input Area */}
                <div className="p-6 border-t border-border relative">
                  <div className="max-w-3xl mx-auto flex items-end gap-4">
                    <div className="flex gap-1 relative">
                      <AttachmentButton
                        onFileSelect={handleFileSelectWrapper}
                        isUploading={isUploading}
                        pendingFile={pendingFile}
                        onClearPending={() => setPendingFile(null)}
                      />
                    </div>

                    <div className="flex-1 relative group">
                      <textarea
                        placeholder="Type a message..."
                        value={message}
                        onChange={(e) => handleTyping(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                          }
                        }}
                        className="w-full bg-secondary/20 border border-border rounded-2xl px-5 py-4 text-sm outline-none focus:border-indigo-500/30 focus:ring-4 focus:ring-indigo-500/5 transition-all resize-none min-h-[56px] max-h-32 placeholder:text-foreground/70 font-medium pr-24"
                        rows={1}
                      />
                      <div className="absolute right-4 bottom-4 flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-foreground/70 hover:text-foreground/80 btn-press">
                          <Smile className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-foreground/70 hover:text-foreground/80 btn-press">
                          <Mic className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSend}
                      disabled={sendMessage.isPending || isUploading || (!message.trim() && !pendingFile)}
                      className="h-14 w-14 shrink-0 rounded-2xl bg-indigo-500 hover:bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 transition-all group text-black disabled:opacity-50"
                    >
                      {sendMessage.isPending || isUploading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      )}
                    </motion.button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-6">
                <div className="w-24 h-24 rounded-[2.5rem] bg-secondary/20 border border-border flex items-center justify-center">
                  <MessageCircle className="w-12 h-12 text-foreground/60" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-foreground/80">Select a conversation</h3>
                  <p className="text-sm text-foreground/80 max-w-[280px] font-medium leading-relaxed">
                    Choose a chat from the list to start messaging.
                  </p>
                </div>
                <Button 
                  className="rounded-xl bg-indigo-500 hover:bg-indigo-600 h-12 px-8 text-xs font-bold uppercase tracking-widest btn-press shadow-lg shadow-indigo-500/20 text-black"
                  onClick={() => setNewChatOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Message
                </Button>
              </div>
            )}
          </motion.div>
        </div>

        {/* New Chat Dialog */}
        <NewChatDialog 
          open={newChatOpen} 
          onOpenChange={setNewChatOpen}
          onChatCreated={handleChatCreated}
        />
      </div>
    </StudentLayout>
  );
}

// Chat Item Component
function ChatItem({ 
  chat, 
  selected, 
  onClick,
  formatTime 
}: { 
  chat: ChatPreview; 
  selected: boolean; 
  onClick: () => void;
  formatTime: (date: string | null) => string;
}) {
  const displayName = chat.name || chat.participants[0]?.name || 'Unknown';

  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-200 group relative overflow-hidden",
        selected
          ? "bg-secondary/50 shadow-lg border border-border"
          : "hover:bg-secondary/20"
      )}
    >
      {chat.unreadCount > 0 && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 bg-indigo-500 rounded-r-full" />
      )}
      <div className="relative shrink-0">
        <Avatar className="h-12 w-12 border-2 border-border transition-transform group-hover:scale-105">
          <AvatarImage src={chat.participants[0]?.avatarUrl || undefined} />
          <AvatarFallback className={cn(
            "text-foreground text-xs font-bold",
            chat.type === "group" ? "bg-violet-500/30" : "bg-indigo-500/30"
          )}>
            {displayName.split(" ").map(n => n[0]).join("")}
          </AvatarFallback>
        </Avatar>
      </div>
      <div className="flex-1 text-left min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-bold truncate group-hover:text-foreground transition-colors flex items-center gap-2">
            {displayName}
            {chat.type === 'group' && <Users className="w-3 h-3 text-violet-500" />}
          </span>
          <span className="text-[10px] text-foreground/70 font-medium shrink-0">
            {formatTime(chat.lastMessageAt)}
          </span>
        </div>
        <p className="text-xs text-foreground/70 truncate font-medium">
          {chat.lastMessage || 'No messages yet'}
        </p>
      </div>
      {chat.unreadCount > 0 && (
        <span className="h-5 min-w-[20px] px-1.5 flex items-center justify-center bg-indigo-500 text-black text-[10px] font-black rounded-full shadow-lg shadow-indigo-500/30">
          {chat.unreadCount}
        </span>
      )}
    </motion.button>
  );
}
