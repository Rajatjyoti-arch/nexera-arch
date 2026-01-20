import { ReactNode, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import { counselorNavItems } from "@/config/navigation";
import { LogOut, Menu, X } from "lucide-react";

interface CounselorLayoutProps {
  children: ReactNode;
}

export default function CounselorLayout({ children }: CounselorLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="hidden md:flex w-72 border-r border-border/50 flex-col bg-card/30 backdrop-blur-sm">
        <div className="p-6 border-b border-border/50">
          <Logo />
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {counselorNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <motion.button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left",
                  isActive
                    ? "bg-gradient-to-r from-rose-500/20 to-pink-500/20 text-rose-400 border border-rose-500/30"
                    : "text-foreground/70 hover:text-foreground hover:bg-secondary/50"
                )}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </motion.button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border/50">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-destructive hover:text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </Button>
        </div>

        <div className="p-4 border-t border-border/50">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 border-2 border-rose-500/50">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback className="bg-rose-500/20 text-rose-400">
                {user?.name?.charAt(0) || "C"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{user?.name || "Counselor"}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="flex items-center justify-between p-4">
          <Logo size="sm" />
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 p-0">
              <div className="flex flex-col h-full">
                <div className="p-6 border-b border-border/50 flex items-center justify-between">
                  <Logo size="sm" />
                  <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                  {counselorNavItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <button
                        key={item.path}
                        onClick={() => {
                          navigate(item.path);
                          setMobileMenuOpen(false);
                        }}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left",
                          isActive
                            ? "bg-gradient-to-r from-rose-500/20 to-pink-500/20 text-rose-400"
                            : "text-foreground/70 hover:text-foreground hover:bg-secondary/50"
                        )}
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </button>
                    );
                  })}
                </nav>

                <div className="p-4 border-t border-border/50">
                  <Button variant="ghost" className="w-full justify-start gap-3 text-destructive" onClick={handleLogout}>
                    <LogOut className="w-5 h-5" />
                    Sign Out
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-t border-border/50">
        <div className="flex items-center justify-around py-2">
          {counselorNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button key={item.path} onClick={() => navigate(item.path)} className={cn("flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all", isActive ? "text-rose-400" : "text-foreground/50")}>
                <item.icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <main className="flex-1 overflow-auto md:h-screen pt-16 md:pt-0">
        <AnimatePresence mode="wait">
          <motion.div key={location.pathname} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="h-full">
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}