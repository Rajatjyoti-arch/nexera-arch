import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, BarChart3, History } from "lucide-react";
import StudentLayout from "@/components/layouts/StudentLayout";
import { WalletBalance } from "@/components/wallet/WalletBalance";
import { QuickActions } from "@/components/wallet/QuickActions";
import { TransactionHistory } from "@/components/wallet/TransactionHistory";
import { AddMoneySheet } from "@/components/wallet/AddMoneySheet";
import { PaymentSheet } from "@/components/wallet/PaymentSheet";
import { ScanPaySheet } from "@/components/wallet/ScanPaySheet";
import { TransferMoneySheet } from "@/components/wallet/TransferMoneySheet";
import { WalletAnalytics } from "@/components/wallet/WalletAnalytics";
import { useWallet } from "@/hooks/useWallet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function StudentWallet() {
  const { wallet, transactions, isLoading, addMoney, isAddingMoney, pay, isPaying } = useWallet();
  
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showScan, setShowScan] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("cafeteria");

  const handlePay = (category: string) => {
    setSelectedCategory(category);
    setShowPayment(true);
  };

  if (isLoading) {
    return (
      <StudentLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
            <p className="text-sm text-muted-foreground">Loading wallet...</p>
          </div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6 pb-20"
      >
        {/* Balance Card */}
        {wallet && (
          <WalletBalance
            balance={wallet.balance}
            upiId={wallet.upi_id}
            isActive={wallet.is_active}
          />
        )}

        {/* Quick Actions */}
        <QuickActions
          onAddMoney={() => setShowAddMoney(true)}
          onPay={handlePay}
          onScan={() => setShowScan(true)}
          onSend={() => setShowTransfer(true)}
        />

        {/* Tabs for History and Analytics */}
        <Tabs defaultValue="transactions" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="transactions" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Transactions
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="transactions">
            <div className="rounded-2xl border border-border bg-card p-4">
              <h3 className="text-lg font-semibold text-foreground mb-4">Recent Transactions</h3>
              <TransactionHistory transactions={transactions} isLoading={isLoading} />
            </div>
          </TabsContent>
          
          <TabsContent value="analytics">
            <WalletAnalytics transactions={transactions} balance={wallet?.balance || 0} />
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Sheets */}
      <AddMoneySheet
        open={showAddMoney}
        onOpenChange={setShowAddMoney}
        onAddMoney={addMoney}
        isLoading={isAddingMoney}
      />

      <PaymentSheet
        open={showPayment}
        onOpenChange={setShowPayment}
        category={selectedCategory}
        balance={wallet?.balance || 0}
        onPay={pay}
        isLoading={isPaying}
      />

      <ScanPaySheet
        open={showScan}
        onOpenChange={setShowScan}
      />

      {wallet && (
        <TransferMoneySheet
          open={showTransfer}
          onOpenChange={setShowTransfer}
          senderWalletId={wallet.id}
          senderBalance={wallet.balance}
        />
      )}
    </StudentLayout>
  );
}
