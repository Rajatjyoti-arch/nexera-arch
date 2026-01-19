import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import Index from "./pages/Index";
import StudentLogin from "./pages/student/StudentLogin";
import FacultyLogin from "./pages/faculty/FacultyLogin";
import AdminLogin from "./pages/admin/AdminLogin";
import StudentHome from "./pages/student/StudentHome";
import StudentClasses from "./pages/student/StudentClasses";
import StudentChats from "./pages/student/StudentChats";
import StudentNetwork from "./pages/student/StudentNetwork";
import StudentWellness from "./pages/student/StudentWellness";
import StudentProfile from "./pages/student/StudentProfile";
import FacultyHome from "./pages/faculty/FacultyHome";
import FacultyChats from "./pages/faculty/FacultyChats";
import FacultyClasses from "./pages/faculty/FacultyClasses";
import FacultyAttendance from "./pages/faculty/FacultyAttendance";
import FacultyNotices from "./pages/faculty/FacultyNotices";
import FacultyProfile from "./pages/faculty/FacultyProfile";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminAcademics from "./pages/admin/AdminAcademics";
import AdminAnnouncements from "./pages/admin/AdminAnnouncements";
import AdminReports from "./pages/admin/AdminReports";
import Portals from "./pages/Portals";
import About from "./pages/About";
import Team from "./pages/Team";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import CookiePolicy from "./pages/CookiePolicy";
import Security from "./pages/Security";
import Wellness from "./pages/Wellness";
import NotFound from "./pages/NotFound";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "@/components/ui/Logo";

const queryClient = new QueryClient();

function ProtectedRoute({ children, allowedRole }: { children: React.ReactNode; allowedRole: string }) {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Logo size="xl" />
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (user?.role !== allowedRole) return <Navigate to={`/${user?.role}`} replace />;
  return <>{children}</>;
}

const AppRoutes = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <AnimatePresence mode="wait">
      <Routes>
        <Route path="/" element={isAuthenticated ? <Navigate to={`/${user?.role}`} replace /> : <Index />} />
        <Route path="/portals" element={isAuthenticated ? <Navigate to={`/${user?.role}`} replace /> : <Portals />} />

        {/* Auth Routes */}
        <Route path="/student/login" element={isAuthenticated ? <Navigate to="/student" replace /> : <StudentLogin />} />
        <Route path="/faculty/login" element={isAuthenticated ? <Navigate to="/faculty" replace /> : <FacultyLogin />} />
        <Route path="/admin/login" element={isAuthenticated ? <Navigate to="/admin" replace /> : <AdminLogin />} />

        {/* Informational Routes */}
        <Route path="/about" element={<About />} />
        <Route path="/team" element={<Team />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/cookies" element={<CookiePolicy />} />
        <Route path="/security" element={<Security />} />
        <Route path="/wellness" element={<Wellness />} />

        {/* Student Routes */}
        <Route path="/student" element={<ProtectedRoute allowedRole="student"><StudentHome /></ProtectedRoute>} />
        <Route path="/student/chats" element={<ProtectedRoute allowedRole="student"><StudentChats /></ProtectedRoute>} />
        <Route path="/student/classes" element={<ProtectedRoute allowedRole="student"><StudentClasses /></ProtectedRoute>} />
        <Route path="/student/network" element={<ProtectedRoute allowedRole="student"><StudentNetwork /></ProtectedRoute>} />
        <Route path="/student/wellness" element={<ProtectedRoute allowedRole="student"><StudentWellness /></ProtectedRoute>} />
        <Route path="/student/profile" element={<ProtectedRoute allowedRole="student"><StudentProfile /></ProtectedRoute>} />

        {/* Faculty Routes */}
        <Route path="/faculty" element={<ProtectedRoute allowedRole="faculty"><FacultyHome /></ProtectedRoute>} />
        <Route path="/faculty/attendance" element={<ProtectedRoute allowedRole="faculty"><FacultyAttendance /></ProtectedRoute>} />
        <Route path="/faculty/chats" element={<ProtectedRoute allowedRole="faculty"><FacultyChats /></ProtectedRoute>} />
        <Route path="/faculty/classes" element={<ProtectedRoute allowedRole="faculty"><FacultyClasses /></ProtectedRoute>} />
        <Route path="/faculty/notices" element={<ProtectedRoute allowedRole="faculty"><FacultyNotices /></ProtectedRoute>} />
        <Route path="/faculty/profile" element={<ProtectedRoute allowedRole="faculty"><FacultyProfile /></ProtectedRoute>} />

        {/* Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute allowedRole="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute allowedRole="admin"><AdminUsers /></ProtectedRoute>} />
        <Route path="/admin/academics" element={<ProtectedRoute allowedRole="admin"><AdminAcademics /></ProtectedRoute>} />
        <Route path="/admin/announcements" element={<ProtectedRoute allowedRole="admin"><AdminAnnouncements /></ProtectedRoute>} />
        <Route path="/admin/reports" element={<ProtectedRoute allowedRole="admin"><AdminReports /></ProtectedRoute>} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <SettingsProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner position="top-center" expand={false} richColors />
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </SettingsProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
