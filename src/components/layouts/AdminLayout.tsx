import { ReactNode } from "react";
import DashboardLayout from "./DashboardLayout";
import { adminNavItems } from "@/config/navigation";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <DashboardLayout role="admin" navItems={adminNavItems}>
      {children}
    </DashboardLayout>
  );
}
