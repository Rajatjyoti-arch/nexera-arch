import {
    Home,
    MessageCircle,
    Users,
    Heart,
    User,
    LayoutDashboard,
    GraduationCap,
    Megaphone,
    AlertTriangle,
    Bell,
    ClipboardCheck,
    Wallet,
    LucideIcon
} from "lucide-react";

export interface NavItem {
    path: string;
    icon: LucideIcon;
    label: string;
    colorClass?: string;
}

export const studentNavItems: NavItem[] = [
    { path: "/student", icon: Home, label: "Dashboard", colorClass: "nav-violet" },
    { path: "/student/classes", icon: GraduationCap, label: "Classes", colorClass: "nav-cyan" },
    { path: "/student/wallet", icon: Wallet, label: "Wallet", colorClass: "nav-emerald" },
    { path: "/student/chats", icon: MessageCircle, label: "Messages", colorClass: "nav-indigo" },
    { path: "/student/network", icon: Users, label: "Network", colorClass: "nav-teal" },
    { path: "/student/wellness", icon: Heart, label: "Wellness", colorClass: "nav-rose" },
    { path: "/student/profile", icon: User, label: "Profile", colorClass: "nav-amber" },
];

export const facultyNavItems: NavItem[] = [
    { path: "/faculty", icon: Home, label: "Home", colorClass: "nav-blue" },
    { path: "/faculty/attendance", icon: ClipboardCheck, label: "Attendance", colorClass: "nav-emerald" },
    { path: "/faculty/classes", icon: GraduationCap, label: "Classes", colorClass: "nav-cyan" },
    { path: "/faculty/chats", icon: MessageCircle, label: "Chats", colorClass: "nav-indigo" },
    { path: "/faculty/notices", icon: Bell, label: "Notices", colorClass: "nav-amber" },
    { path: "/faculty/profile", icon: User, label: "Profile", colorClass: "nav-slate" },
];

export const adminNavItems: NavItem[] = [
    { path: "/admin", icon: LayoutDashboard, label: "Dashboard", colorClass: "nav-rose" },
    { path: "/admin/users", icon: Users, label: "Users", colorClass: "nav-violet" },
    { path: "/admin/academics", icon: GraduationCap, label: "Academics Setup", colorClass: "nav-amber" },
    { path: "/admin/announcements", icon: Megaphone, label: "Announcements", colorClass: "nav-orange" },
    { path: "/admin/reports", icon: AlertTriangle, label: "Reports", colorClass: "nav-red" },
];
