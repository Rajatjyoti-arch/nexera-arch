import { motion } from "framer-motion";
import { Wallet, Eye, EyeOff, Copy, Check } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface WalletBalanceProps {
  balance: number;
  upiId: string;
  isActive: boolean;
}

export function WalletBalance({ balance, upiId, isActive }: WalletBalanceProps) {
  const [showBalance, setShowBalance] = useState(true);
  const [copied, setCopied] = useState(false);

  const copyUpiId = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    toast.success("UPI ID copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const formatBalance = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative overflow-hidden rounded-2xl p-6",
        "bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600",
        "shadow-xl shadow-violet-500/20"
      )}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/30" />
        <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/20" />
        <div className="absolute right-1/4 top-1/2 h-20 w-20 rounded-full bg-white/10" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <Wallet className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-white/80">Campus Wallet</h3>
              <div className={cn(
                "mt-0.5 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium",
                isActive ? "bg-emerald-400/20 text-emerald-200" : "bg-red-400/20 text-red-200"
              )}>
                <span className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  isActive ? "bg-emerald-400" : "bg-red-400"
                )} />
                {isActive ? "Active" : "Inactive"}
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowBalance(!showBalance)}
            className="rounded-lg p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
          >
            {showBalance ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
          </button>
        </div>

        {/* Balance */}
        <div className="mb-6">
          <p className="text-sm text-white/70 mb-1">Available Balance</p>
          <motion.p
            key={showBalance ? "visible" : "hidden"}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-4xl font-bold text-white tracking-tight"
          >
            {showBalance ? formatBalance(balance) : "₹ ••••••"}
          </motion.p>
        </div>

        {/* UPI ID */}
        <div className="flex items-center justify-between rounded-xl bg-white/10 backdrop-blur-sm px-4 py-3">
          <div>
            <p className="text-xs text-white/60 mb-0.5">UPI ID</p>
            <p className="text-sm font-medium text-white">{upiId}</p>
          </div>
          <button
            onClick={copyUpiId}
            className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white/20"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                Copy
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
