import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Coffee, 
  GraduationCap, 
  Ticket, 
  BookOpen,
  Shield,
  AlertCircle
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Transaction } from "@/hooks/useWallet";

interface PaymentSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: string;
  balance: number;
  onPay: (data: { amount: number; description: string; category: Transaction["category"] }) => void;
  isLoading?: boolean;
}

const categoryConfig: Record<string, { icon: React.ElementType; label: string; color: string; suggestions: { label: string; amount: number }[] }> = {
  cafeteria: {
    icon: Coffee,
    label: "Cafeteria",
    color: "from-orange-400 to-amber-500",
    suggestions: [
      { label: "Coffee", amount: 30 },
      { label: "Snacks", amount: 50 },
      { label: "Lunch", amount: 120 },
      { label: "Combo", amount: 180 },
    ],
  },
  fees: {
    icon: GraduationCap,
    label: "Fees",
    color: "from-blue-400 to-indigo-500",
    suggestions: [
      { label: "Lab Fee", amount: 500 },
      { label: "Exam Fee", amount: 1000 },
      { label: "Course Fee", amount: 5000 },
      { label: "Semester Fee", amount: 25000 },
    ],
  },
  events: {
    icon: Ticket,
    label: "Events",
    color: "from-pink-400 to-rose-500",
    suggestions: [
      { label: "Workshop", amount: 200 },
      { label: "Seminar", amount: 100 },
      { label: "Fest Pass", amount: 500 },
      { label: "Concert", amount: 800 },
    ],
  },
  library: {
    icon: BookOpen,
    label: "Library",
    color: "from-emerald-400 to-teal-500",
    suggestions: [
      { label: "Late Fine", amount: 10 },
      { label: "Lost Card", amount: 50 },
      { label: "Damage Fee", amount: 100 },
      { label: "New Card", amount: 75 },
    ],
  },
};

export function PaymentSheet({ open, onOpenChange, category, balance, onPay, isLoading }: PaymentSheetProps) {
  const [amount, setAmount] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  const config = categoryConfig[category] || categoryConfig.cafeteria;
  const Icon = config.icon;
  const numAmount = parseFloat(amount) || 0;
  const insufficientBalance = numAmount > balance;

  const handleSubmit = () => {
    if (numAmount > 0 && !insufficientBalance) {
      onPay({
        amount: numAmount,
        description: description || `${config.label} payment`,
        category: category as Transaction["category"],
      });
      setAmount("");
      setDescription("");
      onOpenChange(false);
    }
  };

  const handleSuggestion = (suggestion: { label: string; amount: number }) => {
    setAmount(suggestion.amount.toString());
    setDescription(suggestion.label);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[80vh] rounded-t-3xl">
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center gap-2">
            <div className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br text-white",
              config.color
            )}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="text-left">
              <span className="block">{config.label} Payment</span>
              <span className="text-xs font-normal text-muted-foreground">
                Balance: ₹{balance.toFixed(2)}
              </span>
            </div>
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-6 pb-8">
          {/* Amount Input */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-foreground">
                ₹
              </span>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className={cn(
                  "h-16 pl-10 text-3xl font-bold text-center",
                  insufficientBalance && "border-destructive focus-visible:ring-destructive"
                )}
              />
            </div>
            {insufficientBalance && (
              <p className="flex items-center gap-1.5 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                Insufficient balance
              </p>
            )}
          </div>

          {/* Quick Suggestions */}
          <div className="grid grid-cols-2 gap-2">
            {config.suggestions.map((suggestion) => (
              <motion.button
                key={suggestion.label}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSuggestion(suggestion)}
                className={cn(
                  "flex items-center justify-between rounded-xl border border-border p-3",
                  "transition-colors hover:bg-accent",
                  amount === suggestion.amount.toString() && "border-violet-500 bg-violet-500/10"
                )}
              >
                <span className="text-sm font-medium">{suggestion.label}</span>
                <span className="text-sm text-muted-foreground">₹{suggestion.amount}</span>
              </motion.button>
            ))}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Description (Optional)</label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={`${config.label} payment`}
              className="h-12"
            />
          </div>

          {/* Pay Button */}
          <Button
            onClick={handleSubmit}
            disabled={!amount || numAmount <= 0 || insufficientBalance || isLoading}
            className={cn(
              "w-full h-14 text-lg font-semibold bg-gradient-to-r",
              config.color
            )}
          >
            <Shield className="h-5 w-5 mr-2" />
            {isLoading ? "Processing..." : `Pay ₹${amount || "0"}`}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Secured by NexEra Campus Wallet
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
