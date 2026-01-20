import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  ArrowLeftRight,
  Coffee,
  GraduationCap,
  Ticket,
  BookOpen,
  Plus,
  Wallet
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, isToday, isYesterday } from "date-fns";
import { Transaction } from "@/hooks/useWallet";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TransactionHistoryProps {
  transactions: Transaction[];
  isLoading?: boolean;
}

const categoryIcons: Record<string, React.ElementType> = {
  cafeteria: Coffee,
  fees: GraduationCap,
  events: Ticket,
  library: BookOpen,
  add_money: Plus,
  transfer: ArrowLeftRight,
  general: Wallet,
};

const categoryColors: Record<string, string> = {
  cafeteria: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  fees: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  events: "bg-pink-500/10 text-pink-600 dark:text-pink-400",
  library: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  add_money: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  transfer: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
  general: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
};

function formatTransactionDate(dateString: string): string {
  const date = new Date(dateString);
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "MMM d, yyyy");
}

function groupTransactionsByDate(transactions: Transaction[]) {
  const groups: Record<string, Transaction[]> = {};
  
  transactions.forEach((tx) => {
    const dateKey = formatTransactionDate(tx.created_at);
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(tx);
  });

  return groups;
}

export function TransactionHistory({ transactions, isLoading }: TransactionHistoryProps) {
  const groupedTransactions = groupTransactionsByDate(transactions);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 animate-pulse">
            <div className="h-10 w-10 rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 rounded bg-muted" />
              <div className="h-3 w-24 rounded bg-muted" />
            </div>
            <div className="h-5 w-16 rounded bg-muted" />
          </div>
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
          <Wallet className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-foreground">No transactions yet</p>
        <p className="text-xs text-muted-foreground mt-1">Your transaction history will appear here</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px] pr-4">
      <div className="space-y-6">
        <AnimatePresence mode="popLayout">
          {Object.entries(groupedTransactions).map(([date, txs]) => (
            <motion.div
              key={date}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-2"
            >
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-1">
                {date}
              </h4>
              <div className="space-y-2">
                {txs.map((tx, index) => {
                  const Icon = categoryIcons[tx.category] || Wallet;
                  const isCredit = tx.type === "credit";
                  
                  return (
                    <motion.div
                      key={tx.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className={cn(
                        "flex items-center gap-3 rounded-xl p-3",
                        "bg-card border border-border",
                        "transition-colors hover:bg-accent/50"
                      )}
                    >
                      <div className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-full",
                        categoryColors[tx.category]
                      )}>
                        <Icon className="h-5 w-5" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {tx.description}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-muted-foreground capitalize">
                            {tx.category.replace("_", " ")}
                          </span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(tx.created_at), "h:mm a")}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {isCredit ? (
                          <ArrowDownLeft className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <ArrowUpRight className="h-4 w-4 text-rose-500" />
                        )}
                        <span className={cn(
                          "text-sm font-semibold",
                          isCredit ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                        )}>
                          {isCredit ? "+" : "-"}₹{tx.amount.toFixed(2)}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ScrollArea>
  );
}
