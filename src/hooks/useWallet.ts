import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useEffect } from "react";

export interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  upi_id: string;
  pin_hash: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  wallet_id: string;
  type: "credit" | "debit" | "transfer";
  amount: number;
  description: string;
  category: "fees" | "cafeteria" | "transfer" | "library" | "events" | "add_money" | "general";
  recipient_wallet_id: string | null;
  status: "pending" | "completed" | "failed";
  reference_id: string;
  created_at: string;
}

export function useWallet() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch or create wallet
  const { data: wallet, isLoading: walletLoading, error: walletError } = useQuery({
    queryKey: ["wallet", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      // Try to fetch existing wallet
      const { data: existingWallet, error: fetchError } = await supabase
        .from("student_wallets")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (fetchError) throw fetchError;
      
      if (existingWallet) return existingWallet as Wallet;

      // Create new wallet if not exists
      const { data: profile } = await supabase
        .from("student_profiles")
        .select("email, name")
        .eq("user_id", user.id)
        .single();

      const upiId = profile?.email 
        ? `${profile.email.split("@")[0]}@nexera.edu`
        : `student${user.id.slice(0, 8)}@nexera.edu`;

      const { data: newWallet, error: createError } = await supabase
        .from("student_wallets")
        .insert({
          user_id: user.id,
          upi_id: upiId,
          balance: 500.00, // Starting balance for demo
        })
        .select()
        .single();

      if (createError) throw createError;
      
      // Create welcome transaction
      await supabase.from("wallet_transactions").insert({
        wallet_id: newWallet.id,
        type: "credit",
        amount: 500.00,
        description: "Welcome bonus",
        category: "add_money",
        status: "completed",
      });

      return newWallet as Wallet;
    },
    enabled: !!user?.id,
  });

  // Fetch transactions
  const { data: transactions = [], isLoading: transactionsLoading } = useQuery({
    queryKey: ["wallet-transactions", wallet?.id],
    queryFn: async () => {
      if (!wallet?.id) return [];

      const { data, error } = await supabase
        .from("wallet_transactions")
        .select("*")
        .or(`wallet_id.eq.${wallet.id},recipient_wallet_id.eq.${wallet.id}`)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as Transaction[];
    },
    enabled: !!wallet?.id,
  });

  // Add money mutation
  const addMoneyMutation = useMutation({
    mutationFn: async (amount: number) => {
      if (!wallet?.id) throw new Error("Wallet not found");

      // Create transaction
      const { error: txError } = await supabase
        .from("wallet_transactions")
        .insert({
          wallet_id: wallet.id,
          type: "credit",
          amount,
          description: "Added money to wallet",
          category: "add_money",
          status: "completed",
        });

      if (txError) throw txError;

      // Update balance
      const { error: updateError } = await supabase
        .from("student_wallets")
        .update({ balance: wallet.balance + amount })
        .eq("id", wallet.id);

      if (updateError) throw updateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
      queryClient.invalidateQueries({ queryKey: ["wallet-transactions"] });
      toast.success("Money added successfully!");
    },
    onError: () => {
      toast.error("Failed to add money");
    },
  });

  // Pay mutation
  const payMutation = useMutation({
    mutationFn: async ({ amount, description, category }: { amount: number; description: string; category: Transaction["category"] }) => {
      if (!wallet?.id) throw new Error("Wallet not found");
      if (wallet.balance < amount) throw new Error("Insufficient balance");

      // Create transaction
      const { error: txError } = await supabase
        .from("wallet_transactions")
        .insert({
          wallet_id: wallet.id,
          type: "debit",
          amount,
          description,
          category,
          status: "completed",
        });

      if (txError) throw txError;

      // Update balance
      const { error: updateError } = await supabase
        .from("student_wallets")
        .update({ balance: wallet.balance - amount })
        .eq("id", wallet.id);

      if (updateError) throw updateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
      queryClient.invalidateQueries({ queryKey: ["wallet-transactions"] });
      toast.success("Payment successful!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Payment failed");
    },
  });

  // Real-time subscription
  useEffect(() => {
    if (!wallet?.id) return;

    const channel = supabase
      .channel(`wallet-${wallet.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "wallet_transactions",
          filter: `wallet_id=eq.${wallet.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["wallet-transactions", wallet.id] });
          queryClient.invalidateQueries({ queryKey: ["wallet", user?.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [wallet?.id, queryClient, user?.id]);

  return {
    wallet,
    transactions,
    isLoading: walletLoading || transactionsLoading,
    error: walletError,
    addMoney: addMoneyMutation.mutate,
    isAddingMoney: addMoneyMutation.isPending,
    pay: payMutation.mutate,
    isPaying: payMutation.isPending,
  };
}
