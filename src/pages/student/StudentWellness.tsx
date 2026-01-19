import { useState, useEffect, useRef } from "react";
import StudentLayout from "@/components/layouts/StudentLayout";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Smile,
  Meh,
  Frown,
  Send,
  AlertCircle,
  Brain,
  Sparkles,
  ShieldCheck,
  Activity,
  Wind,
  Moon,
  Target,
  Maximize2,
  Minimize2,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { streamWellnessChat } from "@/lib/wellness-ai";
import BreathingExercise from "@/components/wellness/BreathingExercise";
import MeditationTimer from "@/components/wellness/MeditationTimer";
import FocusTimer from "@/components/wellness/FocusTimer";
import WellnessProgress from "@/components/wellness/WellnessProgress";


type Mood = "great" | "okay" | "low" | null;

interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string;
}

const moodOptions = [
  { value: "great" as Mood, icon: Smile, label: "Great", colorClass: "card-emerald" },
  { value: "okay" as Mood, icon: Meh, label: "Okay", colorClass: "card-amber" },
  { value: "low" as Mood, icon: Frown, label: "Low", colorClass: "card-rose" },
];

export default function StudentWellness() {
  const [selectedMood, setSelectedMood] = useState<Mood>(null);
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isMaximized, setIsMaximized] = useState(false);
  const [activeExercise, setActiveExercise] = useState<'breathing' | 'meditation' | 'focus' | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize with welcome message if no messages exist
    if (chatMessages.length === 0) {
      const initialMsg: ChatMessage = {
        id: "1",
        content: "Hello. I'm here to listen. How are you feeling today?",
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages([initialMsg]);
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, isTyping]);

  const handleMoodSelect = async (mood: Mood) => {
    setSelectedMood(mood);

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      content: `I'm feeling ${mood} today`,
      isUser: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...chatMessages, userMsg];
    setChatMessages(newMessages);

    setIsTyping(true);

    // Create AI message placeholder
    const aiMsgId = (Date.now() + 1).toString();
    const aiMsg: ChatMessage = {
      id: aiMsgId,
      content: "",
      isUser: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setChatMessages(prev => [...prev, aiMsg]);

    const apiMessages = newMessages.map(msg => ({
      role: msg.isUser ? "user" as const : "assistant" as const,
      content: msg.content
    }));

    await streamWellnessChat({
      messages: apiMessages,
      onDelta: (delta) => {
        setChatMessages(prev =>
          prev.map(msg =>
            msg.id === aiMsgId ? { ...msg, content: msg.content + delta } : msg
          )
        );
      },
      onDone: () => {
        setIsTyping(false);
      },
      onError: (error) => {
        console.error("Wellness Chat Error:", error);
        setChatMessages(prev =>
          prev.map(msg =>
            msg.id === aiMsgId
              ? { ...msg, content: "I'm having trouble connecting right now. Please try again in a moment." }
              : msg
          )
        );
        setIsTyping(false);
      },
    });
  };

  const handleSend = async () => {
    if (!message.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      content: message,
      isUser: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...chatMessages, userMsg];
    setChatMessages(newMessages);
    setMessage("");

    setIsTyping(true);

    // Create AI message placeholder
    const aiMsgId = (Date.now() + 1).toString();
    const aiMsg: ChatMessage = {
      id: aiMsgId,
      content: "",
      isUser: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setChatMessages(prev => [...prev, aiMsg]);

    const apiMessages = newMessages.map(msg => ({
      role: msg.isUser ? "user" as const : "assistant" as const,
      content: msg.content
    }));

    await streamWellnessChat({
      messages: apiMessages,
      onDelta: (delta) => {
        setChatMessages(prev =>
          prev.map(msg =>
            msg.id === aiMsgId ? { ...msg, content: msg.content + delta } : msg
          )
        );
      },
      onDone: () => {
        setIsTyping(false);
      },
      onError: (error) => {
        console.error("Wellness Chat Error:", error);
        setChatMessages(prev =>
          prev.map(msg =>
            msg.id === aiMsgId
              ? { ...msg, content: "I'm having trouble connecting right now. Please try again in a moment." }
              : msg
          )
        );
        setIsTyping(false);
      },
    });
  };

  // Maximized Chat View
  if (isMaximized) {
    return (
      <StudentLayout>
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl">
          <div className="h-full flex flex-col max-w-5xl mx-auto p-6">
            {/* Maximized Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute -inset-2 bg-violet-500/30 rounded-full blur-xl animate-pulse" />
                  <div className="w-14 h-14 rounded-2xl bg-violet-500/20 flex items-center justify-center relative z-10 border border-violet-500/30">
                    <Sparkles className="w-7 h-7 text-violet-500" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-online rounded-full border-4 border-background z-20" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground/90">Nexera AI</h2>
                  <p className="text-xs text-foreground/80 font-bold uppercase tracking-widest">Wellness Companion • Anonymous Session</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMaximized(false)}
                  className="h-10 w-10 rounded-xl hover:bg-secondary"
                >
                  <Minimize2 className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Maximized Messages */}
            <ScrollArea className="flex-1 p-8">
              <div className="space-y-8 max-w-3xl mx-auto">
                <AnimatePresence initial={false}>
                  {chatMessages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className={cn(
                        "flex flex-col",
                        msg.isUser ? "items-end" : "items-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[75%] text-base leading-relaxed font-medium px-6 py-4 rounded-2xl",
                          msg.isUser
                            ? "bg-violet-500 text-black rounded-tr-none"
                            : "bg-secondary border border-border text-foreground rounded-tl-none"
                        )}
                      >
                        {msg.content}
                      </div>
                      <span className="text-[10px] text-foreground/70 mt-2.5 px-1 font-bold tracking-widest">
                        {msg.timestamp}
                      </span>
                    </motion.div>
                  ))}
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex gap-2 py-3"
                    >
                      <span className="w-2 h-2 bg-violet-500/50 rounded-full animate-bounce" />
                      <span className="w-2 h-2 bg-violet-500/50 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <span className="w-2 h-2 bg-violet-500/50 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </motion.div>
                  )}
                </AnimatePresence>
                <div ref={scrollRef} />
              </div>
            </ScrollArea>

            {/* Maximized Input */}
            <div className="p-6 border-t border-border">
              <div className="relative flex flex-col md:flex-row items-end gap-4 max-w-3xl mx-auto w-full">
                <div className="flex-1 relative">
                  <textarea
                    placeholder="Share your thoughts..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    className="w-full bg-secondary/30 border border-border rounded-2xl px-6 py-5 text-base outline-none focus:border-violet-500/30 focus:ring-4 focus:ring-violet-500/5 transition-all resize-none min-h-[70px] max-h-40 placeholder:text-foreground/70 font-medium"
                    rows={1}
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSend}
                  className="h-16 w-16 shrink-0 rounded-2xl bg-violet-500 hover:bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-500/20 transition-all"
                >
                  <Send className="w-6 h-6 text-black" />
                </motion.button>
              </div>
              <p className="text-[9px] text-center text-foreground/60 mt-6 uppercase tracking-[0.3em] font-black">
                Your conversation is private and not stored permanently
              </p>
            </div>
          </div>
        </div>
      </StudentLayout>
    );
  }

  // Normal View
  return (
    <StudentLayout>
      <div className="max-w-6xl mx-auto space-y-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <div className="flex items-center gap-2 text-rose-500">
              <Heart className="w-4 h-4" />
              <p className="text-xs font-bold uppercase tracking-[0.2em]">Sanctuary</p>
            </div>
            <h1 className="text-4xl font-semibold tracking-tight">Mindful Sanctuary</h1>
            <p className="text-foreground/80 mt-2 font-medium">A cognitive sanctuary designed for emotional resilience and mental clarity.</p>
          </motion.div>

          <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">End-to-end encrypted</span>
          </div>
        </div>

        <section className="rounded-3xl border border-border bg-secondary/10 p-4 md:p-8">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-16">
            {/* Left Column: Tools */}
            <div className="lg:col-span-4 space-y-12">
              <section>
                <h2 className="text-[10px] font-black text-foreground/80 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                  <Activity className="w-4 h-4" />
                  Daily Check-in
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {moodOptions.map((mood) => (
                    <motion.button
                      key={mood.value}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleMoodSelect(mood.value)}
                      className={cn(
                        "premium-card p-6 flex flex-col items-center gap-4 group btn-press",
                        mood.colorClass,
                        selectedMood === mood.value && "ring-2 ring-foreground/20"
                      )}
                    >
                      <div className="icon-box">
                        <mood.icon className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-foreground/70 group-hover:text-foreground/80 transition-colors">{mood.label}</span>
                    </motion.button>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-[10px] font-black text-foreground/80 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                  <Brain className="w-4 h-4" />
                  Mindfulness Tools
                </h2>
                <div className="space-y-3">
                  {[
                    { label: "Box Breathing", icon: Wind, duration: "Guided", colorClass: "card-indigo", key: 'breathing' as const },
                    { label: "Meditation", icon: Moon, duration: "Timer", colorClass: "card-violet", key: 'meditation' as const },
                    { label: "Focus Timer", icon: Target, duration: "Pomodoro", colorClass: "card-teal", key: 'focus' as const },
                  ].map((tool) => (
                    <button
                      key={tool.key}
                      onClick={() => setActiveExercise(tool.key)}
                      className={cn("w-full flex items-center justify-between p-5 premium-card group btn-press", tool.colorClass)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="icon-box">
                          <tool.icon className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-bold text-foreground/80 group-hover:text-foreground transition-colors">{tool.label}</p>
                          <p className="text-[9px] text-foreground/70 uppercase tracking-widest font-black mt-0.5">{tool.duration}</p>
                        </div>
                      </div>
                      <Sparkles className="w-3.5 h-3.5 text-foreground/60 group-hover:text-foreground/70 transition-colors" />
                    </button>
                  ))}
                </div>
              </section>

              {/* Progress Section */}
              <section>
                <h2 className="text-[10px] font-black text-foreground/80 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                  <TrendingUp className="w-4 h-4" />
                  Your Progress
                </h2>
                <WellnessProgress />
              </section>

              <div className="premium-card card-amber p-6">
                <div className="flex gap-4">
                  <div className="icon-box">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-amber-500 mb-2">Need immediate help?</p>
                    <p className="text-[11px] text-foreground/80 leading-relaxed mb-4 font-medium">
                      If you're in crisis, please reach out to professional services.
                    </p>
                    <button className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] hover:text-amber-600 transition-colors btn-press">
                      Emergency Contacts
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: AI Chat */}
            <div className="lg:col-span-8 flex flex-col h-[650px]">
              <div className="flex-1 overflow-hidden flex flex-col premium-card card-violet">
                <div className="p-6 border-b border-border flex items-center justify-between bg-secondary/10">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="absolute -inset-2 bg-violet-500/30 rounded-full blur-xl animate-pulse" />
                      <div className="w-12 h-12 rounded-2xl bg-violet-500/20 flex items-center justify-center relative z-10 border border-violet-500/30">
                        <Sparkles className="w-6 h-6 text-violet-500" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-online rounded-full border-4 border-card z-20 shadow-sm" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-foreground/90">NexEra Mind</h2>
                      <p className="text-[10px] text-foreground/70 font-black uppercase tracking-widest mt-0.5">Cognitive Wellness Guide</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-1.5 rounded-lg bg-secondary/20 border border-border text-[9px] font-black text-foreground/70 uppercase tracking-widest">
                      Anonymous Session
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsMaximized(true)}
                      className="h-9 w-9 rounded-xl hover:bg-secondary"
                      title="Maximize Chat"
                    >
                      <Maximize2 className="w-4 h-4 text-foreground/70 hover:text-foreground/80" />
                    </Button>
                  </div>
                </div>

                <ScrollArea className="flex-1 p-8">
                  <div className="space-y-10 max-w-2xl mx-auto">
                    <AnimatePresence initial={false}>
                      {chatMessages.map((msg) => (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 10, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          className={cn(
                            "flex flex-col",
                            msg.isUser ? "items-end" : "items-start"
                          )}
                        >
                          <div
                            className={cn(
                              "max-w-[85%] text-sm leading-relaxed font-medium px-5 py-3.5",
                              msg.isUser
                                ? "chat-bubble-sent"
                                : "chat-bubble-received"
                            )}
                          >
                            {msg.content}
                          </div>
                          <span className="text-[10px] text-foreground/60 mt-2.5 px-1 font-bold tracking-widest">
                            {msg.timestamp}
                          </span>
                        </motion.div>
                      ))}
                      {isTyping && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex gap-2 py-3"
                        >
                          <span className="w-1.5 h-1.5 bg-violet-500/50 rounded-full animate-bounce" />
                          <span className="w-1.5 h-1.5 bg-violet-500/50 rounded-full animate-bounce [animation-delay:0.2s]" />
                          <span className="w-1.5 h-1.5 bg-violet-500/50 rounded-full animate-bounce [animation-delay:0.4s]" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <div ref={scrollRef} />
                  </div>
                </ScrollArea>

                <div className="p-8 border-t border-border bg-secondary/5">
                  <div className="relative flex flex-col md:flex-row items-end gap-4 max-w-2xl mx-auto w-full">
                    <div className="flex-1 relative group">
                      <textarea
                        placeholder="Share your thoughts..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                          }
                        }}
                        className="w-full bg-secondary/10 border border-border rounded-2xl px-5 py-4 text-sm outline-none focus:border-violet-500/30 focus:ring-4 focus:ring-violet-500/5 transition-all resize-none min-h-[56px] max-h-32 placeholder:text-foreground/70 font-medium"
                        rows={1}
                      />
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSend}
                      className="h-14 w-14 shrink-0 rounded-2xl bg-violet-500 hover:bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-500/20 transition-all group"
                    >
                      <Send className="w-5 h-5 text-black group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </motion.button>
                  </div>
                  <p className="text-[9px] text-center text-foreground/60 mt-6 uppercase tracking-[0.3em] font-black">
                    Your conversation is private and not stored permanently
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      
      {/* Exercise Modals */}
      <AnimatePresence>
        {activeExercise === 'breathing' && (
          <BreathingExercise onClose={() => setActiveExercise(null)} />
        )}
        {activeExercise === 'meditation' && (
          <MeditationTimer onClose={() => setActiveExercise(null)} />
        )}
        {activeExercise === 'focus' && (
          <FocusTimer onClose={() => setActiveExercise(null)} />
        )}
      </AnimatePresence>
    </StudentLayout>
  );
}
