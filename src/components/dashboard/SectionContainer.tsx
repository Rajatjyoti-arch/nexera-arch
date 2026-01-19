import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface SectionContainerProps {
    children: ReactNode;
    title?: string;
    icon?: LucideIcon;
    action?: ReactNode;
    className?: string;
}

export function SectionContainer({ children, title, icon: Icon, action, className }: SectionContainerProps) {
    return (
        <section className={cn("rounded-3xl border border-border bg-secondary/5 p-8", className)}>
            {(title || action) && (
                <div className="flex items-center justify-between mb-6">
                    {title && (
                        <h2 className="text-[10px] font-black text-foreground/70 uppercase tracking-[0.2em] flex items-center gap-3">
                            {Icon && <Icon className="w-4 h-4" />}
                            {title}
                        </h2>
                    )}
                    {action}
                </div>
            )}
            {children}
        </section>
    );
}
