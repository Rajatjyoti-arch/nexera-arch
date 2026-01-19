import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Sparkles, Bot, User, Loader2, Maximize2, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { streamChat } from "@/lib/nexera-ai";

interface Message {
    role: "user" | "assistant";
    content: string;
}

type ChatSize = "normal" | "minimized" | "maximized";

export const GeminiChat = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [chatSize, setChatSize] = useState<ChatSize>("normal");
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<Message[]>([
        { role: "assistant", content: "Hello! I'm Nexera AI, your personal campus assistant. How can I help you today?" }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput("");
        const userMsg: Message = { role: "user", content: userMessage };
        setMessages(prev => [...prev, userMsg]);
        setIsLoading(true);

        let assistantContent = "";
        
        const updateAssistant = (chunk: string) => {
            assistantContent += chunk;
            setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant" && prev.length > 1 && prev[prev.length - 2]?.role === "user") {
                    return prev.map((m, i) => 
                        i === prev.length - 1 ? { ...m, content: assistantContent } : m
                    );
                }
                return [...prev, { role: "assistant", content: assistantContent }];
            });
        };

        try {
            await streamChat({
                messages: [...messages, userMsg],
                onDelta: updateAssistant,
                onDone: () => setIsLoading(false),
                onError: (error) => {
                    setMessages(prev => [...prev, {
                        role: "assistant",
                        content: `⚠️ ${error}`
                    }]);
                    setIsLoading(false);
                }
            });
        } catch (error: any) {
            console.error("Chat Error:", error);
            setMessages(prev => [...prev, {
                role: "assistant",
                content: `⚠️ ${error?.message || "Something went wrong. Please try again."}`
            }]);
            setIsLoading(false);
        }
    };

    const toggleSize = () => {
        setChatSize(chatSize === "maximized" ? "normal" : "maximized");
    };

    const getSizeClasses = () => {
        switch (chatSize) {
            case "minimized":
                return "w-[300px] h-20";
            case "maximized":
                return "w-[90vw] h-[90vh] max-w-6xl";
            default:
                return "w-[400px] h-[600px]";
        }
    };

    const getPosition = () => {
        if (chatSize === "maximized") {
            return "fixed inset-0 m-auto";
        }
        return "fixed bottom-6 right-6";
    };

    return (
        <>
            <AnimatePresence>
                {isOpen && chatSize === "maximized" && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-md z-[99]"
                        onClick={() => setChatSize("normal")}
                    />
                )}
            </AnimatePresence>

            <div className={cn("z-[100]", getPosition())}>
                <AnimatePresence>
                    {!isOpen && (
                        <motion.button
                            initial={{ scale: 0, rotate: -45 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0, rotate: 45 }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setIsOpen(true)}
                            className="w-16 h-16 rounded-2xl gradient-primary shadow-glow flex items-center justify-center text-black group relative overflow-hidden fixed bottom-6 right-6"
                        >
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                            <Sparkles className="w-8 h-8 relative z-10" />
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-online rounded-full border-2 border-background animate-pulse" />
                        </motion.button>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.95 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className={cn(
                                "glass-card rounded-[2rem] border-border shadow-2xl flex flex-col overflow-hidden transition-all duration-300",
                                getSizeClasses()
                            )}
                        >
                            {/* Header */}
                            <div className="p-4 border-b border-border flex items-center justify-between bg-secondary/50">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
                                        <Bot className="w-6 h-6 text-black" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm">Nexera AI</h3>
                                        <div className="flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 bg-online rounded-full animate-pulse" />
                                            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">AI Assistant</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className={cn(
                                            "h-8 w-8 rounded-lg hover:bg-secondary",
                                            chatSize === "maximized" && "bg-secondary"
                                        )}
                                        onClick={toggleSize}
                                        title={chatSize === "maximized" ? "Restore" : "Maximize"}
                                    >
                                        {chatSize === "maximized" ? (
                                            <Square className="w-4 h-4" />
                                        ) : (
                                            <Maximize2 className="w-4 h-4" />
                                        )}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 rounded-lg hover:bg-secondary text-destructive"
                                        onClick={() => {
                                            setIsOpen(false);
                                            setChatSize("normal");
                                        }}
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            {chatSize !== "minimized" && (
                                <>
                                    <ScrollArea className="flex-1 p-6">
                                        <div className={cn(
                                            "space-y-6",
                                            chatSize === "maximized" && "max-w-4xl mx-auto"
                                        )}>
                                            {messages.map((msg, i) => (
                                                <motion.div
                                                    key={i}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className={cn(
                                                        "flex gap-3",
                                                        msg.role === "user" ? "flex-row-reverse" : "flex-row"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "rounded-lg flex items-center justify-center flex-shrink-0",
                                                        chatSize === "maximized" ? "w-10 h-10" : "w-8 h-8",
                                                        msg.role === "user" ? "bg-primary/20" : "gradient-primary shadow-glow-sm"
                                                    )}>
                                                        {msg.role === "user" ? (
                                                            <User className={cn(chatSize === "maximized" ? "w-5 h-5" : "w-4 h-4")} />
                                                        ) : (
                                                            <Bot className={cn("text-black", chatSize === "maximized" ? "w-5 h-5" : "w-4 h-4")} />
                                                        )}
                                                    </div>
                                                    <div className={cn(
                                                        "max-w-[80%] p-4 rounded-2xl leading-relaxed whitespace-pre-wrap",
                                                        chatSize === "maximized" ? "text-base" : "text-sm",
                                                        msg.role === "user"
                                                            ? "bg-primary text-primary-foreground rounded-tr-none"
                                                            : "bg-secondary border border-border rounded-tl-none"
                                                    )}>
                                                        {msg.content}
                                                    </div>
                                                </motion.div>
                                            ))}
                                            {isLoading && messages[messages.length - 1]?.role === "user" && (
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    className="flex gap-3"
                                                >
                                                    <div className={cn(
                                                        "rounded-lg gradient-primary flex items-center justify-center flex-shrink-0",
                                                        chatSize === "maximized" ? "w-10 h-10" : "w-8 h-8"
                                                    )}>
                                                        <Bot className={cn("text-black", chatSize === "maximized" ? "w-5 h-5" : "w-4 h-4")} />
                                                    </div>
                                                    <div className="bg-secondary border border-border p-4 rounded-2xl rounded-tl-none">
                                                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                                    </div>
                                                </motion.div>
                                            )}
                                            <div ref={scrollRef} />
                                        </div>
                                    </ScrollArea>

                                    <div className="p-4 border-t border-border bg-secondary/20">
                                        <div className={cn(
                                            "flex gap-2",
                                            chatSize === "maximized" && "max-w-4xl mx-auto"
                                        )}>
                                            <Input
                                                placeholder="Ask Nexera AI anything..."
                                                value={input}
                                                onChange={(e) => setInput(e.target.value)}
                                                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                                className={cn(
                                                    "bg-secondary/50 border-border rounded-xl focus:border-primary/50 transition-all",
                                                    chatSize === "maximized" ? "h-14 text-base" : "h-12"
                                                )}
                                            />
                                            <Button
                                                onClick={handleSend}
                                                disabled={isLoading || !input.trim()}
                                                className={cn(
                                                    "rounded-xl gradient-primary border-0 shadow-glow flex-shrink-0",
                                                    chatSize === "maximized" ? "h-14 w-14" : "h-12 w-12"
                                                )}
                                            >
                                                <Send className={cn(chatSize === "maximized" ? "w-6 h-6" : "w-5 h-5")} />
                                            </Button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </>
    );
};
