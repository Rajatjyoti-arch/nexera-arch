import { ReactNode } from "react";
import DashboardLayout from "./DashboardLayout";
import { studentNavItems } from "@/config/navigation";

interface StudentLayoutProps {
  children: ReactNode;
}

export default function StudentLayout({ children }: StudentLayoutProps) {
  return (
    <DashboardLayout role="student" navItems={studentNavItems}>
      {children}
    </DashboardLayout>
  );
}
