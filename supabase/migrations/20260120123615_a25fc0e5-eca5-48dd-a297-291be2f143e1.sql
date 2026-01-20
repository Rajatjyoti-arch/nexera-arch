-- Create student_wallets table
CREATE TABLE public.student_wallets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  balance DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  upi_id TEXT NOT NULL UNIQUE,
  pin_hash TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create wallet_transactions table
CREATE TABLE public.wallet_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_id UUID NOT NULL REFERENCES public.student_wallets(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('credit', 'debit', 'transfer')),
  amount DECIMAL(10,2) NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general' CHECK (category IN ('fees', 'cafeteria', 'transfer', 'library', 'events', 'add_money', 'general')),
  recipient_wallet_id UUID REFERENCES public.student_wallets(id),
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
  reference_id TEXT NOT NULL UNIQUE DEFAULT ('TXN' || upper(substring(gen_random_uuid()::text, 1, 8))),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.student_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

-- Wallet policies
CREATE POLICY "Users can view their own wallet"
ON public.student_wallets FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own wallet"
ON public.student_wallets FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wallet"
ON public.student_wallets FOR UPDATE
USING (auth.uid() = user_id);

-- Transaction policies
CREATE POLICY "Users can view their wallet transactions"
ON public.wallet_transactions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.student_wallets
    WHERE id = wallet_transactions.wallet_id AND user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.student_wallets
    WHERE id = wallet_transactions.recipient_wallet_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can create transactions for their wallet"
ON public.wallet_transactions FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.student_wallets
    WHERE id = wallet_transactions.wallet_id AND user_id = auth.uid()
  )
);

-- Trigger for updated_at
CREATE TRIGGER update_student_wallets_updated_at
BEFORE UPDATE ON public.student_wallets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for transactions
ALTER PUBLICATION supabase_realtime ADD TABLE public.wallet_transactions;