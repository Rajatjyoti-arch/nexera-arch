import { useMemo } from "react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Transaction } from "@/hooks/useWallet";
import { format, subDays, startOfDay, isAfter } from "date-fns";

interface WalletAnalyticsProps {
  transactions: Transaction[];
  balance: number;
}

const categoryColors: Record<string, string> = {
  cafeteria: "#f97316",
  fees: "#3b82f6",
  events: "#ec4899",
  library: "#10b981",
  add_money: "#8b5cf6",
  transfer: "#6366f1",
  general: "#64748b",
};

const categoryLabels: Record<string, string> = {
  cafeteria: "Cafeteria",
  fees: "Fees",
  events: "Events",
  library: "Library",
  add_money: "Added",
  transfer: "Transfers",
  general: "General",
};

export function WalletAnalytics({ transactions, balance }: WalletAnalyticsProps) {
  const analytics = useMemo(() => {
    const last7Days = subDays(new Date(), 7);
    const recentTransactions = transactions.filter((tx) => 
      isAfter(new Date(tx.created_at), startOfDay(last7Days))
    );

    // Calculate totals
    const totalSpent = recentTransactions
      .filter((tx) => tx.type === "debit" || (tx.type === "transfer" && tx.category === "transfer"))
      .reduce((sum, tx) => sum + tx.amount, 0);

    const totalReceived = recentTransactions
      .filter((tx) => tx.type === "credit")
      .reduce((sum, tx) => sum + tx.amount, 0);

    // Category breakdown (expenses only)
    const categoryData = recentTransactions
      .filter((tx) => tx.type === "debit")
      .reduce((acc, tx) => {
        acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
        return acc;
      }, {} as Record<string, number>);

    const pieData = Object.entries(categoryData)
      .map(([category, amount]) => ({
        name: categoryLabels[category] || category,
        value: amount,
        color: categoryColors[category] || "#64748b",
      }))
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value);

    // Daily spending for last 7 days
    const dailyData: { day: string; spent: number; received: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dayStart = startOfDay(date);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const dayTransactions = recentTransactions.filter((tx) => {
        const txDate = new Date(tx.created_at);
        return txDate >= dayStart && txDate < dayEnd;
      });

      dailyData.push({
        day: format(date, "EEE"),
        spent: dayTransactions
          .filter((tx) => tx.type === "debit")
          .reduce((sum, tx) => sum + tx.amount, 0),
        received: dayTransactions
          .filter((tx) => tx.type === "credit")
          .reduce((sum, tx) => sum + tx.amount, 0),
      });
    }

    return {
      totalSpent,
      totalReceived,
      pieData,
      dailyData,
      transactionCount: recentTransactions.length,
    };
  }, [transactions]);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-border bg-card p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="h-4 w-4 text-violet-500" />
            <span className="text-xs text-muted-foreground">Balance</span>
          </div>
          <p className="text-lg font-bold text-foreground">₹{balance.toFixed(0)}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-xl border border-border bg-card p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <ArrowUpRight className="h-4 w-4 text-rose-500" />
            <span className="text-xs text-muted-foreground">Spent</span>
          </div>
          <p className="text-lg font-bold text-rose-600 dark:text-rose-400">₹{analytics.totalSpent.toFixed(0)}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-border bg-card p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <ArrowDownLeft className="h-4 w-4 text-emerald-500" />
            <span className="text-xs text-muted-foreground">Received</span>
          </div>
          <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">₹{analytics.totalReceived.toFixed(0)}</p>
        </motion.div>
      </div>

      {/* Spending by Category */}
      {analytics.pieData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-xl border border-border bg-card p-4"
        >
          <h4 className="text-sm font-semibold text-foreground mb-4">Spending by Category</h4>
          <div className="flex items-center gap-4">
            <div className="w-32 h-32">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={25}
                    outerRadius={50}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {analytics.pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2">
              {analytics.pieData.slice(0, 4).map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-foreground">{item.name}</span>
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">
                    ₹{item.value.toFixed(0)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Daily Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-xl border border-border bg-card p-4"
      >
        <h4 className="text-sm font-semibold text-foreground mb-4">Last 7 Days Activity</h4>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics.dailyData} barGap={2}>
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false}
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis 
                hide 
                domain={[0, 'auto']}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                formatter={(value: number, name: string) => [
                  `₹${value.toFixed(0)}`,
                  name === 'spent' ? 'Spent' : 'Received'
                ]}
              />
              <Bar 
                dataKey="spent" 
                fill="hsl(346, 77%, 50%)" 
                radius={[4, 4, 0, 0]}
                maxBarSize={24}
              />
              <Bar 
                dataKey="received" 
                fill="hsl(142, 76%, 36%)" 
                radius={[4, 4, 0, 0]}
                maxBarSize={24}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-6 mt-3">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-rose-500" />
            <span className="text-xs text-muted-foreground">Spent</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-emerald-500" />
            <span className="text-xs text-muted-foreground">Received</span>
          </div>
        </div>
      </motion.div>

      {/* Insights */}
      {analytics.totalSpent > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className={cn(
            "rounded-xl p-4",
            analytics.totalReceived > analytics.totalSpent 
              ? "bg-emerald-500/10 border border-emerald-500/20" 
              : "bg-amber-500/10 border border-amber-500/20"
          )}
        >
          <div className="flex items-start gap-3">
            {analytics.totalReceived > analytics.totalSpent ? (
              <TrendingUp className="h-5 w-5 text-emerald-600 mt-0.5" />
            ) : (
              <TrendingDown className="h-5 w-5 text-amber-600 mt-0.5" />
            )}
            <div>
              <p className="text-sm font-medium text-foreground">
                {analytics.totalReceived > analytics.totalSpent 
                  ? "You're saving well!" 
                  : "Watch your spending"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {analytics.totalReceived > analytics.totalSpent 
                  ? `You received ₹${(analytics.totalReceived - analytics.totalSpent).toFixed(0)} more than you spent this week.`
                  : `You spent ₹${(analytics.totalSpent - analytics.totalReceived).toFixed(0)} more than you received this week.`}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
