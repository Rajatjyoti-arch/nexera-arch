import { ReactNode } from "react";
import DashboardLayout from "./DashboardLayout";
import { facultyNavItems } from "@/config/navigation";

interface FacultyLayoutProps {
  children: ReactNode;
}

export default function FacultyLayout({ children }: FacultyLayoutProps) {
  return (
    <DashboardLayout role="faculty" navItems={facultyNavItems}>
      {children}
    </DashboardLayout>
  );
}
