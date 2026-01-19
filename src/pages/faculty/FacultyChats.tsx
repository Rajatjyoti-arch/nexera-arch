import { useState, useEffect, useRef } from "react";
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
  Image as ImageIcon,
  Smile,
  ChevronLeft,
  Sparkles,
  MessageCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";

interface Chat {
  id: string;
  name: string;
  type: "student" | "group";
  avatar?: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  timestamp: string;
  isMine: boolean;
}

const mockChats: Chat[] = [
  { id: "1", name: "Priyanshu Sharma", type: "student", lastMessage: "Thank you for the feedback!", time: "5m", unread: 0, online: true },
  { id: "2", name: "CSE 2024 - Section A", type: "group", lastMessage: "Assignment deadline extended", time: "1h", unread: 0, online: false },
  { id: "3", name: "Aisha Khan", type: "student", lastMessage: "Question about the project", time: "2h", unread: 1, online: true },
  { id: "4", name: "B.Tech CSE 3rd Year", type: "group", lastMessage: "Lab session tomorrow", time: "1d", unread: 0, online: false },
];

const initialMessages: Message[] = [
  { id: "1", content: "Hello Professor, I had a doubt regarding the last lecture.", senderId: "other", timestamp: "09:00 AM", isMine: false },
  { id: "2", content: "Sure, what specifically are you struggling with?", senderId: "me", timestamp: "09:05 AM", isMine: true },
  { id: "3", content: "The part about time complexity in recursive functions.", senderId: "other", timestamp: "09:10 AM", isMine: false },
  { id: "4", content: "I'll upload some extra resources on the portal today.", senderId: "me", timestamp: "09:15 AM", isMine: true },
  { id: "5", content: "Thank you for the feedback!", senderId: "other", timestamp: "09:20 AM", isMine: false },
];

export default function FacultyChats() {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [chats, setChats] = useState<Chat[]>(mockChats);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, selectedChat]);

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSend = () => {
    if (!message.trim()) return;

    const newMsg: Message = {
      id: Date.now().toString(),
      content: message,
      senderId: "me",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMine: true,
    };

    setMessages(prev => [...prev, newMsg]);
    setMessage("");

    if (selectedChat) {
      setChats(prev => prev.map(c =>
        c.id === selectedChat.id ? { ...c, lastMessage: "You: " + message, time: "Now", unread: 0 } : c
      ));
    }
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
              <Button variant="ghost" size="icon" className="rounded-xl bg-secondary">
                <Plus className="w-5 h-5" />
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/60" />
              <Input
                placeholder="Search students/groups..."
                className="h-12 pl-11 bg-secondary/20 border-border rounded-2xl focus:border-primary/50 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <ScrollArea className="flex-1">
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
                      <AvatarImage src={chat.avatar} />
                      <AvatarFallback className={cn(
                        "font-bold",
                        selectedChat?.id === chat.id ? "bg-white/20 text-black" : "bg-faculty text-black"
                      )}>
                        {chat.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    {chat.online && chat.type === "student" && (
                      <span className={cn(
                        "absolute bottom-0 right-0 w-4 h-4 rounded-full border-4",
                        selectedChat?.id === chat.id ? "bg-white border-faculty" : "bg-online border-card"
                      )} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold truncate">{chat.name}</span>
                      <span className={cn(
                        "text-[10px] font-medium uppercase tracking-wider",
                        selectedChat?.id === chat.id ? "text-black/90" : "text-foreground/60"
                      )}>{chat.time}</span>
                    </div>
                    <p className={cn(
                      "text-sm truncate",
                      selectedChat?.id === chat.id ? "text-black" : "text-foreground/60"
                    )}>{chat.lastMessage}</p>
                  </div>
                  {chat.unread > 0 && selectedChat?.id !== chat.id && (
                    <span className="min-w-6 h-6 rounded-full bg-faculty text-black text-[10px] font-black flex items-center justify-center shadow-glow-sm">
                      {chat.unread}
                    </span>
                  )}
                </button>
              ))}
            </div>
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
                      <AvatarImage src={selectedChat.avatar} />
                      <AvatarFallback className="bg-faculty text-black font-bold">
                        {selectedChat.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    {selectedChat.online && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-online rounded-full border-2 border-background" />
                    )}
                  </div>
                  <div>
                    <h2 className="font-bold flex items-center gap-2">
                      {selectedChat.name}
                      {selectedChat.type === "group" && <Sparkles className="w-3 h-3 text-faculty" />}
                    </h2>
                    <p className="text-xs text-foreground/60">
                      {selectedChat.online ? "Active now" : "Last seen 2h ago"}
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
                <div className="space-y-6">
                  <AnimatePresence initial={false}>
                    {messages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className={cn(
                          "flex",
                          msg.isMine ? "justify-end" : "justify-start"
                        )}
                      >
                        <div
                          className={cn(
                            "max-w-[70%] px-5 py-3.5 shadow-lg",
                            msg.isMine ? "chat-bubble-sent bg-faculty" : "chat-bubble-received"
                          )}
                        >
                          <p className="text-sm leading-relaxed">{msg.content}</p>
                          <p className={cn(
                            "text-[10px] mt-2 font-medium opacity-70",
                            msg.isMine ? "text-right" : "text-left"
                          )}>
                            {msg.timestamp}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  <div ref={scrollRef} />
                </div>
              </ScrollArea>

              {/* Input Area */}
              <div className="p-6 border-t border-border bg-secondary/10">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="rounded-xl hover:bg-secondary text-foreground/60"><Plus className="w-5 h-5" /></Button>
                    <Button variant="ghost" size="icon" className="rounded-xl hover:bg-secondary text-foreground/60"><ImageIcon className="w-5 h-5" /></Button>
                  </div>
                  <div className="flex-1 relative flex items-center">
                    <Input
                      placeholder="Type a message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSend()}
                      className="h-14 bg-secondary/20 border-border rounded-2xl px-5 pr-12 focus:border-faculty/50 transition-all"
                    />
                    <Button variant="ghost" size="icon" className="absolute right-2 text-foreground/60 hover:text-faculty">
                      <Smile className="w-5 h-5" />
                    </Button>
                  </div>
                  <Button
                    onClick={handleSend}
                    size="icon"
                    className="h-14 w-14 rounded-2xl bg-faculty hover:bg-faculty/90 border-0 shadow-glow group"
                  >
                    <Send className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform text-black" />
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
                Select a student or group conversation to start mentoring.
              </p>
            </div>
          )}
        </div>
      </div>
    </FacultyLayout>
  );
}
