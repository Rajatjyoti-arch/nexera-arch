import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Search, User, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface TransferMoneySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  senderWalletId: string;
  senderBalance: number;
}

interface RecipientInfo {
  wallet_id: string;
  upi_id: string;
  name: string;
  email: string;
}

export function TransferMoneySheet({ open, onOpenChange, senderWalletId, senderBalance }: TransferMoneySheetProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [upiId, setUpiId] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [recipient, setRecipient] = useState<RecipientInfo | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"search" | "confirm" | "success">("search");

  const numAmount = parseFloat(amount) || 0;
  const insufficientBalance = numAmount > senderBalance;

  const searchRecipient = async () => {
    if (!upiId.trim()) return;
    
    setIsSearching(true);
    setError("");
    setRecipient(null);

    try {
      // Find wallet by UPI ID
      const { data: wallet, error: walletError } = await supabase
        .from("student_wallets")
        .select("id, upi_id, user_id")
        .eq("upi_id", upiId.trim())
        .maybeSingle();

      if (walletError) throw walletError;

      if (!wallet) {
        setError("No wallet found with this UPI ID");
        return;
      }

      if (wallet.user_id === user?.id) {
        setError("You cannot transfer to yourself");
        return;
      }

      // Get recipient profile
      const { data: profile } = await supabase
        .from("student_profiles")
        .select("name, email")
        .eq("user_id", wallet.user_id)
        .maybeSingle();

      setRecipient({
        wallet_id: wallet.id,
        upi_id: wallet.upi_id,
        name: profile?.name || "Student",
        email: profile?.email || "",
      });
    } catch (err) {
      setError("Failed to search for recipient");
    } finally {
      setIsSearching(false);
    }
  };

  const handleTransfer = async () => {
    if (!recipient || numAmount <= 0 || insufficientBalance) return;

    setIsTransferring(true);

    try {
      // Create debit transaction for sender
      const { error: debitError } = await supabase
        .from("wallet_transactions")
        .insert({
          wallet_id: senderWalletId,
          type: "transfer",
          amount: numAmount,
          description: `Sent to ${recipient.name}`,
          category: "transfer",
          recipient_wallet_id: recipient.wallet_id,
          status: "completed",
        });

      if (debitError) throw debitError;

      // Create credit transaction for recipient
      const { error: creditError } = await supabase
        .from("wallet_transactions")
        .insert({
          wallet_id: recipient.wallet_id,
          type: "credit",
          amount: numAmount,
          description: `Received from transfer${note ? `: ${note}` : ""}`,
          category: "transfer",
          status: "completed",
        });

      if (creditError) throw creditError;

      // Update sender balance
      const { error: senderUpdateError } = await supabase
        .from("student_wallets")
        .update({ balance: senderBalance - numAmount })
        .eq("id", senderWalletId);

      if (senderUpdateError) throw senderUpdateError;

      // Update recipient balance
      const { data: recipientWallet } = await supabase
        .from("student_wallets")
        .select("balance")
        .eq("id", recipient.wallet_id)
        .single();

      if (recipientWallet) {
        await supabase
          .from("student_wallets")
          .update({ balance: recipientWallet.balance + numAmount })
          .eq("id", recipient.wallet_id);
      }

      setStep("success");
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
      queryClient.invalidateQueries({ queryKey: ["wallet-transactions"] });
    } catch (err) {
      toast.error("Transfer failed. Please try again.");
    } finally {
      setIsTransferring(false);
    }
  };

  const handleClose = () => {
    setStep("search");
    setUpiId("");
    setAmount("");
    setNote("");
    setRecipient(null);
    setError("");
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10">
              <Send className="h-4 w-4 text-blue-600" />
            </div>
            Send Money
          </SheetTitle>
        </SheetHeader>

        {step === "search" && (
          <div className="space-y-6 pb-8">
            {/* UPI ID Search */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">Recipient UPI ID</label>
              <div className="flex gap-2">
                <Input
                  value={upiId}
                  onChange={(e) => {
                    setUpiId(e.target.value);
                    setError("");
                    setRecipient(null);
                  }}
                  placeholder="e.g., student@nexera.edu"
                  className="flex-1"
                />
                <Button
                  onClick={searchRecipient}
                  disabled={!upiId.trim() || isSearching}
                  variant="outline"
                >
                  {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </Button>
              </div>
              {error && (
                <p className="flex items-center gap-1.5 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </p>
              )}
            </div>

            {/* Recipient Card */}
            {recipient && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
                    <User className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{recipient.name}</p>
                    <p className="text-sm text-muted-foreground">{recipient.upi_id}</p>
                  </div>
                  <CheckCircle2 className="ml-auto h-5 w-5 text-emerald-500" />
                </div>
              </motion.div>
            )}

            {/* Amount */}
            {recipient && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
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
                      insufficientBalance && "border-destructive"
                    )}
                  />
                </div>
                {insufficientBalance && (
                  <p className="flex items-center gap-1.5 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    Insufficient balance (₹{senderBalance.toFixed(2)} available)
                  </p>
                )}

                <Input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add a note (optional)"
                  className="h-12"
                />
              </motion.div>
            )}

            {/* Send Button */}
            {recipient && (
              <Button
                onClick={() => setStep("confirm")}
                disabled={numAmount <= 0 || insufficientBalance}
                className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-500 to-indigo-500"
              >
                Continue
              </Button>
            )}
          </div>
        )}

        {step === "confirm" && recipient && (
          <div className="space-y-6 pb-8">
            <div className="text-center py-6">
              <p className="text-sm text-muted-foreground mb-2">Sending to</p>
              <div className="flex justify-center mb-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/10">
                  <User className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <p className="text-lg font-semibold">{recipient.name}</p>
              <p className="text-sm text-muted-foreground">{recipient.upi_id}</p>
            </div>

            <div className="text-center py-4 rounded-xl bg-muted">
              <p className="text-4xl font-bold text-foreground">₹{numAmount.toFixed(2)}</p>
              {note && <p className="text-sm text-muted-foreground mt-2">"{note}"</p>}
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep("search")}
                className="flex-1 h-14"
              >
                Back
              </Button>
              <Button
                onClick={handleTransfer}
                disabled={isTransferring}
                className="flex-1 h-14 bg-gradient-to-r from-blue-500 to-indigo-500"
              >
                {isTransferring ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                Confirm & Send
              </Button>
            </div>
          </div>
        )}

        {step === "success" && recipient && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-12 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500 mb-6"
            >
              <CheckCircle2 className="h-10 w-10 text-white" />
            </motion.div>
            <h3 className="text-2xl font-bold text-foreground mb-2">Transfer Successful!</h3>
            <p className="text-muted-foreground mb-2">
              ₹{numAmount.toFixed(2)} sent to {recipient.name}
            </p>
            <p className="text-sm text-muted-foreground mb-8">{recipient.upi_id}</p>
            <Button onClick={handleClose} className="w-full max-w-xs h-12">
              Done
            </Button>
          </motion.div>
        )}
      </SheetContent>
    </Sheet>
  );
}
