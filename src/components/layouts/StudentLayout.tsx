import { ReactNode } from "react";
import DashboardLayout from "./DashboardLayout";
import { studentNavItems } from "@/config/navigation";
import { useRealtimeAttendance } from "@/hooks/useStudentClasses";

interface StudentLayoutProps {
  children: ReactNode;
}

export default function StudentLayout({ children }: StudentLayoutProps) {
  // Enable real-time attendance notifications
  useRealtimeAttendance();
  
  return (
    <DashboardLayout role="student" navItems={studentNavItems}>
      {children}
    </DashboardLayout>
  );
}
