import { ReactNode, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    LogOut,
    Menu,
    X,
    ChevronLeft,
    ChevronRight,
    Settings,
    Bell,
    User as UserIcon,
    Sparkles,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GeminiChat } from "@/components/ui/GeminiChat";
import { NavItem } from "@/config/navigation";
import { hasFeature } from "@/config/features";
import SettingsPanel from "@/components/settings/SettingsPanel";


interface DashboardLayoutProps {
    children: ReactNode;
    navItems: NavItem[];
    role: "student" | "faculty" | "admin";
}

export default function DashboardLayout({ children, navItems, role }: DashboardLayoutProps) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    const roleColors = {
        student: "from-violet-500 to-indigo-500",
        faculty: "from-blue-500 to-cyan-500",
        admin: "from-rose-500 to-amber-500",
    };

    const roleLabel = {
        student: "Student",
        faculty: "Faculty",
        admin: "Administrator",
    };

    const activeColorClass = (item: NavItem) => {
        if (role === 'student') return item.colorClass;
        if (role === 'faculty') return "bg-faculty text-black shadow-glow-sm";
        if (role === 'admin') return "bg-admin text-black shadow-glow-sm";
        return "bg-primary text-black";
    }

    return (
        <div className="min-h-screen text-foreground selection:bg-primary/30">
            {/* Sidebar - Desktop */}
            <aside
                className={cn(
                    "hidden lg:flex fixed left-0 top-0 h-full flex-col z-50 transition-all duration-300 ease-in-out",
                    "bg-card backdrop-blur-2xl",
                    "border-r border-border",
                    isSidebarCollapsed ? "w-24" : "w-80"
                )}
            >
                {/* Decorative gradient overlay */}
                <div className={cn("absolute inset-0 bg-gradient-to-br opacity-[0.03] pointer-events-none", roleColors[role])} />

                {/* Toggle Button */}
                <button
                    onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                    className={cn(
                        "absolute -right-3 top-10 w-6 h-6 bg-gradient-to-r rounded-full flex items-center justify-center text-black shadow-lg transition-all z-[60] hover:scale-110",
                        roleColors[role],
                        `shadow-${role === 'student' ? 'violet' : role === 'faculty' ? 'blue' : 'rose'}-500/30`
                    )}
                >
                    {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </button>

                {/* Logo */}
                <div className={cn(
                    "p-6 mb-6 transition-all duration-300 relative",
                    isSidebarCollapsed ? "flex justify-center" : ""
                )}>
                    <Logo size={isSidebarCollapsed ? "sm" : "md"} showText={!isSidebarCollapsed} />
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 space-y-2 relative">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={item.path === `/${role}`} // Exact match for root dashboard path
                                className={cn(
                                    "flex items-center gap-4 px-4 py-4 rounded-2xl text-[13px] font-bold transition-all duration-300 group relative overflow-hidden",
                                    isActive
                                        ? cn("text-black shadow-lg border-white/10", activeColorClass(item))
                                        : "text-foreground/70 hover:text-foreground/80 hover:bg-secondary border border-transparent hover:border-border/50",
                                    isSidebarCollapsed ? "justify-center px-0" : ""
                                )}
                            >
                                {/* Active indicator bar (Student only for now to match original design, or enable for all) */}
                                {isActive && role === 'student' && (
                                    <motion.div
                                        layoutId="active-nav"
                                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-foreground rounded-r-full shadow-lg"
                                    />
                                )}

                                {/* Icon container */}
                                <div className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 shrink-0",
                                    isActive
                                        ? "bg-foreground/20 shadow-inner"
                                        : "bg-secondary group-hover:bg-secondary/80 border border-border/50 group-hover:border-border"
                                )}>
                                    <item.icon className={cn(
                                        "w-5 h-5 transition-all duration-300",
                                        isActive ? "text-black scale-110" : "text-foreground/70 group-hover:text-foreground group-hover:scale-110"
                                    )} />
                                </div>

                                {/* Label */}
                                {!isSidebarCollapsed && (
                                    <motion.span
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        className="flex-1"
                                    >
                                        {item.label}
                                    </motion.span>
                                )}
                            </NavLink>
                        );
                    })}
                </nav>

                {/* User Profile Section */}
                <div className="p-4 mt-auto border-t border-border">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className={cn(
                                "w-full flex items-center gap-4 p-3 rounded-2xl transition-all group btn-press",
                                "bg-secondary/50",
                                "border border-border hover:border-border/80",
                                "hover:bg-secondary",
                                "hover:shadow-md",
                                isSidebarCollapsed ? "justify-center p-2" : ""
                            )}>
                                <div className="relative shrink-0">
                                    <div className={cn("absolute -inset-1 bg-gradient-to-r rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity", roleColors[role])} />
                                    <Avatar className="h-11 w-11 border-2 border-foreground/10 transition-transform group-hover:scale-105 relative">
                                        <AvatarImage src={user?.avatar} />
                                        <AvatarFallback className={cn("bg-gradient-to-br text-black text-xs font-bold", roleColors[role])}>
                                            {user?.name?.charAt(0) || role.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-card shadow-lg shadow-emerald-500/30" />
                                </div>
                                {!isSidebarCollapsed && (
                                    <div className="flex-1 text-left overflow-hidden">
                                        <p className="text-sm font-bold truncate text-foreground/90 group-hover:text-foreground transition-colors">{user?.name}</p>
                                        <p className="text-[10px] text-foreground/70 font-bold uppercase tracking-widest truncate">{user?.designation || roleLabel[role]}</p>
                                    </div>
                                )}
                                {!isSidebarCollapsed && (
                                    <ChevronRight className="w-4 h-4 text-foreground/70 group-hover:text-foreground/80 transition-colors" />
                                )}
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" side={isSidebarCollapsed ? "right" : "top"} className="w-64 bg-card backdrop-blur-2xl border-border p-2 rounded-2xl shadow-2xl">
                            <div className="px-3 py-2 mb-2">
                                <p className="text-[10px] font-black text-foreground/70 uppercase tracking-[0.2em]">Account</p>
                            </div>
                            <DropdownMenuItem onClick={() => navigate(`/${role}/profile`)} className="rounded-xl py-3 text-xs font-semibold cursor-pointer focus:bg-secondary gap-3">
                                <UserIcon className="w-4 h-4 text-foreground/70" /> Profile Settings
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setIsSettingsOpen(true)} className="rounded-xl py-3 text-xs font-semibold cursor-pointer focus:bg-secondary gap-3">
                                <Settings className="w-4 h-4 text-foreground/70" /> Preferences
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-border my-2" />
                            <DropdownMenuItem onClick={handleLogout} className="rounded-xl py-3 text-xs font-semibold text-rose-500 focus:text-rose-600 focus:bg-rose-50 cursor-pointer gap-3">
                                <LogOut className="w-4 h-4" /> Sign Out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </aside>

            {/* Main Content Area */}
            <main
                className={cn(
                    "min-h-screen relative transition-all duration-300 ease-in-out",
                    isSidebarCollapsed ? "lg:ml-24" : "lg:ml-80"
                )}
            >
                {/* Top Header */}
                <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4 lg:hidden">
                        <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)} className="rounded-xl btn-press">
                            <Menu className="w-5 h-5" />
                        </Button>
                        <Logo size="sm" showText={false} />
                    </div>

                    <div className="hidden md:block" />

                    <div className="flex items-center gap-6">
                        <div className="hidden sm:flex flex-col items-end">
                            {hasFeature(role, 'premiumBadge') && (
                                <div className="flex items-center gap-2 text-primary">
                                    <Sparkles className="w-3 h-3" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Premium</span>
                                </div>
                            )}
                            <span className="text-[10px] font-bold text-foreground/70 uppercase tracking-widest mt-0.5">{roleLabel[role]} Portal</span>
                        </div>
                        <div className="h-6 w-[1px] bg-border" />
                        <button className="relative p-2.5 text-foreground/70 hover:text-foreground hover:bg-secondary rounded-xl transition-all btn-press border border-transparent hover:border-border">
                            <Bell className="w-4.5 h-4.5" />
                            <span className={cn("absolute top-2 right-2 w-2.5 h-2.5 rounded-full border-2 border-background shadow-lg animate-pulse", role === 'student' ? 'bg-violet-500 shadow-violet-500/30' : role === 'faculty' ? 'bg-blue-500 shadow-blue-500/30' : 'bg-rose-500 shadow-rose-500/30')} />
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <div className="p-4 md:p-8 lg:p-12 max-w-7xl mx-auto w-full">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                        {children}
                    </motion.div>
                </div>
            </main>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60] lg:hidden"
                        />
                        <motion.div
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed left-0 top-0 h-full w-80 bg-gradient-to-b from-card to-background border-r border-border z-[70] lg:hidden p-8 flex flex-col"
                        >
                            <div className="flex items-center justify-between mb-12">
                                <Logo size="md" />
                                <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)} className="rounded-xl btn-press">
                                    <X className="w-6 h-6" />
                                </Button>
                            </div>
                            <nav className="space-y-2">
                                {navItems.map((item) => {
                                    const isActive = location.pathname === item.path;
                                    return (
                                        <NavLink
                                            key={item.path}
                                            to={item.path}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className={cn(
                                                "flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold transition-all btn-press border",
                                                isActive
                                                    ? cn("text-black shadow-lg border-foreground/10", activeColorClass(item))
                                                    : "text-foreground/70 hover:bg-secondary border-transparent hover:border-border/50"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-10 h-10 rounded-xl flex items-center justify-center",
                                                isActive ? "bg-foreground/20" : "bg-secondary/20 border border-border"
                                            )}>
                                                <item.icon className="w-5 h-5" />
                                            </div>
                                            {item.label}
                                        </NavLink>
                                    );
                                })}
                            </nav>

                            {/* Mobile User Profile & Logout */}
                            <div className="mt-auto pt-6 border-t border-border">
                                <div className="flex items-center gap-4 mb-4 px-2">
                                    <Avatar className="h-12 w-12 border-2 border-foreground/10">
                                        <AvatarImage src={user?.avatar} />
                                        <AvatarFallback className={cn("bg-gradient-to-br text-black text-sm font-bold", roleColors[role])}>
                                            {user?.name?.charAt(0) || role.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 overflow-hidden">
                                        <p className="text-sm font-bold truncate">{user?.name}</p>
                                        <p className="text-[10px] text-foreground/70 font-medium uppercase tracking-wider">{roleLabel[role]}</p>
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setIsMobileMenuOpen(false);
                                        handleLogout();
                                    }}
                                    className="w-full rounded-xl py-6 text-rose-500 hover:text-rose-600 hover:bg-rose-50 border-rose-200 hover:border-rose-300 font-semibold gap-3"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Sign Out
                                </Button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
            {hasFeature(role, 'geminiChat') && <GeminiChat />}
            
            {/* Settings Panel */}
            <AnimatePresence>
                {isSettingsOpen && (
                    <SettingsPanel onClose={() => setIsSettingsOpen(false)} />
                )}
            </AnimatePresence>
        </div>
    );
}
