import { motion } from "framer-motion";
import { 
  Send, 
  QrCode, 
  Plus, 
  ArrowDownLeft,
  Coffee,
  GraduationCap,
  Ticket,
  BookOpen
} from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickActionsProps {
  onAddMoney: () => void;
  onPay: (category: string) => void;
  onScan: () => void;
}

const mainActions = [
  { icon: QrCode, label: "Scan & Pay", action: "scan", color: "bg-violet-500/10 text-violet-600 dark:text-violet-400" },
  { icon: Send, label: "Send", action: "send", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  { icon: ArrowDownLeft, label: "Request", action: "request", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  { icon: Plus, label: "Add Money", action: "add", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
];

const quickPayOptions = [
  { icon: Coffee, label: "Cafeteria", category: "cafeteria", color: "from-orange-400 to-amber-500" },
  { icon: GraduationCap, label: "Fees", category: "fees", color: "from-blue-400 to-indigo-500" },
  { icon: Ticket, label: "Events", category: "events", color: "from-pink-400 to-rose-500" },
  { icon: BookOpen, label: "Library", category: "library", color: "from-emerald-400 to-teal-500" },
];

export function QuickActions({ onAddMoney, onPay, onScan }: QuickActionsProps) {
  const handleMainAction = (action: string) => {
    switch (action) {
      case "add":
        onAddMoney();
        break;
      case "scan":
        onScan();
        break;
      default:
        break;
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Actions */}
      <div className="grid grid-cols-4 gap-3">
        {mainActions.map((item, index) => (
          <motion.button
            key={item.action}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => handleMainAction(item.action)}
            className={cn(
              "flex flex-col items-center gap-2 rounded-xl p-4",
              "bg-card border border-border",
              "transition-all hover:shadow-md hover:-translate-y-0.5"
            )}
          >
            <div className={cn("flex h-12 w-12 items-center justify-center rounded-full", item.color)}>
              <item.icon className="h-5 w-5" />
            </div>
            <span className="text-xs font-medium text-foreground">{item.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Quick Pay */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Quick Pay</h3>
        <div className="grid grid-cols-4 gap-3">
          {quickPayOptions.map((item, index) => (
            <motion.button
              key={item.category}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + index * 0.05 }}
              onClick={() => onPay(item.category)}
              className={cn(
                "flex flex-col items-center gap-2 rounded-xl p-4",
                "bg-gradient-to-br shadow-sm",
                item.color,
                "text-white transition-all hover:shadow-lg hover:-translate-y-0.5"
              )}
            >
              <item.icon className="h-6 w-6" />
              <span className="text-xs font-medium">{item.label}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
