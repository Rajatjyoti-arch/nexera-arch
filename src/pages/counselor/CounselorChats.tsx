import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CounselorLayout from "@/components/layouts/CounselorLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useLocation } from "react-router-dom";
import { 
  Send, 
  Search,
  MessageCircle,
  ArrowLeft,
  Users
} from "lucide-react";
import { format } from "date-fns";

interface AssignedStudent {
  id: string;
  student_id: string;
  assignment_type: string;
  student_profile?: {
    name: string;
    email: string;
    avatar_url: string | null;
    user_id: string;
  };
}

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  attachment_url?: string;
  attachment_type?: string;
  attachment_name?: string;
}

interface Chat {
  id: string;
  participants: { user_id: string; name: string; avatar_url?: string }[];
  lastMessage?: Message;
}

export default function CounselorChats() {
  const { user } = useAuth();
  const location = useLocation();
  const [assignments, setAssignments] = useState<AssignedStudent[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<AssignedStudent | null>(null);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const fetchAssignments = async () => {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from('counselor_assignments')
        .select('*')
        .eq('counselor_id', user.id)
        .eq('is_active', true);

      if (!error && data) {
        const studentIds = data.map(a => a.student_id);
        const { data: profiles } = await supabase
          .from('student_profiles')
          .select('user_id, name, email, avatar_url')
          .in('user_id', studentIds);

        const assignmentsWithProfiles = data.map(assignment => ({
          ...assignment,
          student_profile: profiles?.find(p => p.user_id === assignment.student_id)
        }));

        setAssignments(assignmentsWithProfiles);

        const stateStudentId = (location.state as any)?.studentId;
        if (stateStudentId) {
          const student = assignmentsWithProfiles.find(a => a.student_id === stateStudentId);
          if (student) {
            handleSelectStudent(student);
          }
        }
      }
      setIsLoading(false);
    };

    fetchAssignments();
  }, [user?.id, location.state]);

  const handleSelectStudent = async (assignment: AssignedStudent) => {
    setSelectedStudent(assignment);
    if (!user?.id) return;

    const { data: existingChats } = await supabase
      .from('chats')
      .select(`id, chat_participants!inner(user_id)`)
      .eq('type', 'direct');

    let chat: Chat | null = null;
    
    for (const c of existingChats || []) {
      const participants = c.chat_participants.map((p: any) => p.user_id);
      if (participants.includes(user.id) && participants.includes(assignment.student_id)) {
        chat = { 
          id: c.id, 
          participants: [
            { user_id: user.id, name: user.name || 'Counselor' },
            { user_id: assignment.student_id, name: assignment.student_profile?.name || 'Student' }
          ]
        };
        break;
      }
    }

    if (!chat) {
      const { data: newChat, error } = await supabase
        .from('chats')
        .insert({ type: 'direct', created_by: user.id })
        .select()
        .single();

      if (!error && newChat) {
        await supabase.from('chat_participants').insert([
          { chat_id: newChat.id, user_id: user.id },
          { chat_id: newChat.id, user_id: assignment.student_id }
        ]);

        chat = { 
          id: newChat.id, 
          participants: [
            { user_id: user.id, name: user.name || 'Counselor' },
            { user_id: assignment.student_id, name: assignment.student_profile?.name || 'Student' }
          ]
        };
      }
    }

    if (chat) {
      setSelectedChat(chat);
      fetchMessages(chat.id);
    }
  };

  const fetchMessages = async (chatId: string) => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setMessages(data);
    }
  };

  useEffect(() => {
    if (!selectedChat?.id) return;

    const channel = supabase
      .channel(`messages:${selectedChat.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `chat_id=eq.${selectedChat.id}`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as Message]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedChat?.id]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat?.id || !user?.id || isSending) return;

    setIsSending(true);
    const { error } = await supabase.from('messages').insert({
      chat_id: selectedChat.id,
      sender_id: user.id,
      content: newMessage.trim()
    });

    if (!error) setNewMessage("");
    setIsSending(false);
  };

  const filteredAssignments = assignments.filter(a => 
    a.student_profile?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <CounselorLayout>
      <div className="h-screen flex flex-col md:flex-row p-4 md:p-0 pb-20 md:pb-0">
        <div className={`${selectedStudent ? 'hidden md:flex' : 'flex'} w-full md:w-80 flex-col border-r border-border/50`}>
          <div className="p-4 border-b border-border/50">
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
              <Users className="w-5 h-5" />
              My Students
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search students..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : filteredAssignments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No students assigned</p>
                </div>
              ) : (
                filteredAssignments.map((assignment) => (
                  <motion.button
                    key={assignment.id}
                    onClick={() => handleSelectStudent(assignment)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left ${selectedStudent?.id === assignment.id ? 'bg-primary/10 border border-primary/30' : 'hover:bg-secondary/50'}`}
                    whileHover={{ x: 4 }}
                  >
                    <Avatar>
                      <AvatarImage src={assignment.student_profile?.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary/10">{assignment.student_profile?.name?.charAt(0) || 'S'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{assignment.student_profile?.name || 'Unknown'}</p>
                      <Badge variant="secondary" className="text-xs capitalize">{assignment.assignment_type}</Badge>
                    </div>
                  </motion.button>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        <div className={`${selectedStudent ? 'flex' : 'hidden md:flex'} flex-1 flex-col`}>
          {selectedStudent && selectedChat ? (
            <>
              <div className="p-4 border-b border-border/50 flex items-center gap-3">
                <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSelectedStudent(null)}>
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <Avatar>
                  <AvatarImage src={selectedStudent.student_profile?.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary/10">{selectedStudent.student_profile?.name?.charAt(0) || 'S'}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{selectedStudent.student_profile?.name}</h3>
                  <p className="text-xs text-muted-foreground capitalize">{selectedStudent.assignment_type} Counseling</p>
                </div>
              </div>

              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  <AnimatePresence initial={false}>
                    {messages.map((message) => {
                      const isOwn = message.sender_id === user?.id;
                      return (
                        <motion.div key={message.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[70%]`}>
                            <div className={`px-4 py-2 rounded-2xl ${isOwn ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white' : 'bg-secondary'}`}>
                              <p>{message.content}</p>
                            </div>
                            <p className={`text-xs text-muted-foreground mt-1 ${isOwn ? 'text-right' : ''}`}>{format(new Date(message.created_at), 'HH:mm')}</p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              <div className="p-4 border-t border-border/50">
                <div className="flex items-center gap-2">
                  <Input placeholder="Type a message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()} className="flex-1" />
                  <Button size="icon" onClick={handleSendMessage} disabled={!newMessage.trim() || isSending} className="bg-gradient-to-r from-rose-500 to-pink-500">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-4">
                <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto" />
                <h3 className="text-xl font-semibold">Select a Student</h3>
                <p className="text-muted-foreground max-w-sm">Choose a student from your assigned list to start a counseling session</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </CounselorLayout>
  );
}