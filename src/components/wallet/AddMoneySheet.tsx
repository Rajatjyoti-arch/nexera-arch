import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, CreditCard, Building2, Smartphone } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface AddMoneySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddMoney: (amount: number) => void;
  isLoading?: boolean;
}

const quickAmounts = [100, 200, 500, 1000, 2000, 5000];

const paymentMethods = [
  { id: "upi", icon: Smartphone, label: "UPI", description: "Pay using any UPI app" },
  { id: "card", icon: CreditCard, label: "Card", description: "Debit or Credit Card" },
  { id: "bank", icon: Building2, label: "Net Banking", description: "All major banks" },
];

export function AddMoneySheet({ open, onOpenChange, onAddMoney, isLoading }: AddMoneySheetProps) {
  const [amount, setAmount] = useState<string>("");
  const [selectedMethod, setSelectedMethod] = useState<string>("upi");

  const handleSubmit = () => {
    const numAmount = parseFloat(amount);
    if (numAmount > 0) {
      onAddMoney(numAmount);
      setAmount("");
      onOpenChange(false);
    }
  };

  const handleQuickAmount = (value: number) => {
    setAmount(value.toString());
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-500/10">
              <Plus className="h-4 w-4 text-violet-600" />
            </div>
            Add Money to Wallet
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-6 pb-8">
          {/* Amount Input */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">Enter Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-foreground">
                ₹
              </span>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="h-16 pl-10 text-3xl font-bold text-center"
              />
            </div>
          </div>

          {/* Quick Amounts */}
          <div className="grid grid-cols-3 gap-2">
            {quickAmounts.map((value) => (
              <motion.button
                key={value}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleQuickAmount(value)}
                className={cn(
                  "rounded-xl border border-border py-3 text-sm font-medium",
                  "transition-colors hover:bg-accent",
                  amount === value.toString() && "bg-violet-500/10 border-violet-500 text-violet-600"
                )}
              >
                ₹{value.toLocaleString()}
              </motion.button>
            ))}
          </div>

          {/* Payment Methods */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">Payment Method</label>
            <div className="space-y-2">
              {paymentMethods.map((method) => (
                <motion.button
                  key={method.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedMethod(method.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl border p-4",
                    "transition-colors",
                    selectedMethod === method.id
                      ? "border-violet-500 bg-violet-500/5"
                      : "border-border hover:bg-accent"
                  )}
                >
                  <div className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full",
                    selectedMethod === method.id
                      ? "bg-violet-500/10 text-violet-600"
                      : "bg-muted text-muted-foreground"
                  )}>
                    <method.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-foreground">{method.label}</p>
                    <p className="text-xs text-muted-foreground">{method.description}</p>
                  </div>
                  <div className={cn(
                    "h-5 w-5 rounded-full border-2",
                    selectedMethod === method.id
                      ? "border-violet-500 bg-violet-500"
                      : "border-muted-foreground/30"
                  )}>
                    {selectedMethod === method.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="h-full w-full flex items-center justify-center"
                      >
                        <div className="h-2 w-2 rounded-full bg-white" />
                      </motion.div>
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Add Button */}
          <Button
            onClick={handleSubmit}
            disabled={!amount || parseFloat(amount) <= 0 || isLoading}
            className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600"
          >
            {isLoading ? "Processing..." : `Add ₹${amount || "0"}`}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            This is a demo wallet. No real money will be charged.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
