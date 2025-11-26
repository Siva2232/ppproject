-- ============================================
-- 1. ENUMS & TABLES
-- ============================================

DO $$ BEGIN
    CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE booking_category AS ENUM ('flight', 'bus', 'train', 'cab', 'hotel');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Wallets Table
CREATE TABLE IF NOT EXISTS public.wallets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL, -- 'AlHind', 'Akbar', 'Office-Funds'
    balance NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wallet Transactions Table
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    wallet_id UUID REFERENCES public.wallets(id) NOT NULL,
    booking_id TEXT,
    expense_id UUID,
    amount NUMERIC NOT NULL,
    description TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookings Table
CREATE TABLE IF NOT EXISTS public.bookings (
    id TEXT PRIMARY KEY,
    customer_name TEXT NOT NULL,
    email TEXT,
    contact_number TEXT,
    booking_date TIMESTAMPTZ NOT NULL, 
    category booking_category NOT NULL,
    platform TEXT NOT NULL,
    status booking_status NOT NULL DEFAULT 'pending',
    base_pay NUMERIC DEFAULT 0,
    commission_amount NUMERIC DEFAULT 0,
    markup_amount NUMERIC DEFAULT 0,
    total_revenue NUMERIC DEFAULT 0, 
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW() 
);

-- Expenses Table
CREATE TABLE IF NOT EXISTS public.expenses (
  id uuid primary key,
  user_id uuid not null,
  description text not null,
  amount numeric(12,2) not null check (amount > 0),
  category text not null default 'Other',
  payment_method text,
  vendor text,
  location text,
  notes text,
  is_recurring boolean not null default false,
  tags jsonb not null default '[]'::jsonb,
  attachment_url text,
  status text not null default 'logged',
  date timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- 2. SEED DATA
-- ============================================
INSERT INTO public.wallets (name, balance)
VALUES 
    ('AlHind', 1000),
    ('Akbar', 1000),
    ('Office-Funds', 1000)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 3. TRIGGERS (Auto-update Balance)
-- ============================================

CREATE OR REPLACE FUNCTION public.update_wallet_balance()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.wallets
    SET balance = balance + NEW.amount
    WHERE id = NEW.wallet_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 

DROP TRIGGER IF EXISTS on_transaction_added ON public.wallet_transactions;
CREATE TRIGGER on_transaction_added
AFTER INSERT ON public.wallet_transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_wallet_balance();

-- ============================================
-- 4. RLS POLICIES
-- ============================================

ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Wallets: Viewable by authenticated
DROP POLICY IF EXISTS "view_wallets" ON public.wallets;
CREATE POLICY "view_wallets" ON public.wallets FOR SELECT USING (auth.role() = 'authenticated');

-- Transactions: Viewable by authenticated
DROP POLICY IF EXISTS "view_transactions" ON public.wallet_transactions;
CREATE POLICY "view_transactions" ON public.wallet_transactions FOR SELECT USING (auth.role() = 'authenticated');

-- Transactions: Insertable by authenticated (for RPCs mostly, but good to have)
DROP POLICY IF EXISTS "insert_transactions" ON public.wallet_transactions;
CREATE POLICY "insert_transactions" ON public.wallet_transactions FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Bookings: Full access for authenticated
DROP POLICY IF EXISTS "bookings_all" ON public.bookings;
CREATE POLICY "bookings_all" ON public.bookings FOR ALL USING (auth.role() = 'authenticated');

-- Expenses: Full access for authenticated
DROP POLICY IF EXISTS "expenses_all" ON public.expenses;
CREATE POLICY "expenses_all" ON public.expenses FOR ALL USING (auth.role() = 'authenticated');


-- ============================================
-- 5. RPC FUNCTIONS
-- ============================================

-- A. Create Booking Transaction
CREATE OR REPLACE FUNCTION public.create_booking_transaction(
    p_booking_id TEXT,
    p_customer_name TEXT,
    p_email TEXT,
    p_contact_number TEXT,
    p_booking_date TIMESTAMPTZ,
    p_category booking_category,
    p_platform TEXT,
    p_base_pay NUMERIC,
    p_commission_amount NUMERIC,
    p_markup_amount NUMERIC,
    p_total_revenue NUMERIC,
    p_status booking_status,
    p_user_id UUID
)
RETURNS public.bookings
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    platform_wallet_id UUID;
    office_wallet_id UUID;
    v_new_booking public.bookings;
BEGIN
    -- Resolve Office Wallet ID
    SELECT id INTO office_wallet_id FROM public.wallets WHERE name = 'Office-Funds';
    IF office_wallet_id IS NULL THEN
        RAISE EXCEPTION 'Wallet "Office-Funds" not found.';
    END IF;

    -- 1. Insert the Booking Record
    INSERT INTO public.bookings (
        id, customer_name, email, contact_number, booking_date, category, platform, status, 
        base_pay, commission_amount, markup_amount, total_revenue, user_id, 
        created_at
    ) VALUES (
        p_booking_id, p_customer_name, p_email, p_contact_number, p_booking_date, p_category, p_platform, p_status, 
        p_base_pay, p_commission_amount, p_markup_amount, p_total_revenue, p_user_id, 
        NOW()
    )
    RETURNING * INTO v_new_booking;

    -- 2. Financials (Only if CONFIRMED)
    IF p_status = 'confirmed' THEN
        -- A. Handle Platform Transactions (AlHind/Akbar)
        IF p_platform IN ('AlHind', 'Akbar') THEN
            SELECT id INTO platform_wallet_id FROM public.wallets WHERE name = p_platform;
            IF platform_wallet_id IS NULL THEN
                RAISE EXCEPTION 'Platform wallet % not found.', p_platform;
            END IF;

            -- Deduct BasePay from Platform
            INSERT INTO public.wallet_transactions (wallet_id, amount, description, booking_id, created_by)
            VALUES (platform_wallet_id, -p_base_pay, 'BasePay deduction for Booking ' || p_booking_id, p_booking_id, p_user_id);
            
            -- Credit Commission to Platform
            IF p_commission_amount > 0 THEN
                INSERT INTO public.wallet_transactions (wallet_id, amount, description, booking_id, created_by)
                VALUES (platform_wallet_id, p_commission_amount, 'Commission credited for Booking ' || p_booking_id, p_booking_id, p_user_id);
            END IF;
        END IF;

        -- B. Handle Office Revenue (BasePay + Markup)
        -- Logic: 
        -- If Platform (AlHind/Akbar): Office gets BasePay + Markup? 
        -- Wait, if using Platform wallet, usually we pay Platform (BasePay) and keep Commission + Markup?
        -- User Request: "base pay + markup should be added to the 'Office-Funds' wallet."
        -- User Request (Direct): "if the booking is through direct fund then the office fund wallet will added by the basepay+markup"
        
        -- Let's stick to User Request strictly:
        -- ALWAYS add (BasePay + Markup) to Office Funds.
        INSERT INTO public.wallet_transactions (wallet_id, amount, description, booking_id, created_by)
        VALUES (office_wallet_id, p_base_pay + p_markup_amount, 'Total Revenue (BasePay + Markup) credited for Booking ' || p_booking_id, p_booking_id, p_user_id);
    END IF;

    RETURN v_new_booking;
END;
$$;

-- B. Reverse Booking Transaction (For Cancellation/Delete)
CREATE OR REPLACE FUNCTION public.reverse_booking_transaction(
    p_booking_id TEXT,
    p_user_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_booking public.bookings;
    platform_wallet_id UUID;
    office_wallet_id UUID;
    v_revenue_amount NUMERIC;
    v_last_desc TEXT;
BEGIN
    SELECT * INTO v_booking FROM public.bookings WHERE id = p_booking_id;
    IF v_booking IS NULL THEN RAISE EXCEPTION 'Booking % not found.', p_booking_id; END IF;

    -- Only reverse if it was CONFIRMED
    IF v_booking.status = 'confirmed' THEN
        
        -- SMART IDEMPOTENCY CHECK:
        -- Check the VERY LAST transaction for this booking.
        -- If it was already a REVERSAL, do not reverse again.
        SELECT description INTO v_last_desc 
        FROM public.wallet_transactions 
        WHERE booking_id = p_booking_id 
        ORDER BY created_at DESC 
        LIMIT 1;

        IF v_last_desc IS NOT NULL AND v_last_desc LIKE 'REVERSAL:%' THEN
            -- The last action was already a reversal. Don't do it again.
            RETURN;
        END IF;

        v_revenue_amount := v_booking.base_pay + v_booking.markup_amount;
        SELECT id INTO office_wallet_id FROM public.wallets WHERE name = 'Office-Funds';

        -- Reverse Office Revenue
        INSERT INTO public.wallet_transactions (wallet_id, amount, description, booking_id, created_by)
        VALUES (office_wallet_id, -v_revenue_amount, 'REVERSAL: Revenue deducted from Office Fund for Booking ' || p_booking_id, p_booking_id, p_user_id);
        
        -- Reverse Platform Transactions
        IF v_booking.platform IN ('AlHind', 'Akbar') THEN
            SELECT id INTO platform_wallet_id FROM public.wallets WHERE name = v_booking.platform;

            -- Refund BasePay to Platform
            INSERT INTO public.wallet_transactions (wallet_id, amount, description, booking_id, created_by)
            VALUES (platform_wallet_id, v_booking.base_pay, 'REVERSAL: BasePay refunded to platform ' || p_booking_id, p_booking_id, p_user_id);
            
            -- Remove Commission from Platform
            IF v_booking.commission_amount > 0 THEN
                INSERT INTO public.wallet_transactions (wallet_id, amount, description, booking_id, created_by)
                VALUES (platform_wallet_id, -v_booking.commission_amount, 'REVERSAL: Commission removed from platform for Booking ' || p_booking_id, p_booking_id, p_user_id);
            END IF;
        END IF;
    END IF;
END;
$$;

-- C. Confirm Booking Transaction (For Pending -> Confirmed)
CREATE OR REPLACE FUNCTION public.confirm_booking_transaction(
    p_booking_id TEXT,
    p_user_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_booking public.bookings;
    platform_wallet_id UUID;
    office_wallet_id UUID;
    v_last_desc TEXT;
BEGIN
    SELECT * INTO v_booking FROM public.bookings WHERE id = p_booking_id;
    IF v_booking IS NULL THEN RAISE EXCEPTION 'Booking % not found.', p_booking_id; END IF;
    
    -- SMART IDEMPOTENCY CHECK:
    -- Check the VERY LAST transaction for this booking.
    -- If it was NOT a reversal (meaning it was a normal credit/debit), do not apply again.
    SELECT description INTO v_last_desc 
    FROM public.wallet_transactions 
    WHERE booking_id = p_booking_id 
    ORDER BY created_at DESC 
    LIMIT 1;

    IF v_last_desc IS NOT NULL AND v_last_desc NOT LIKE 'REVERSAL:%' THEN
        -- The last action was a normal application. Don't do it again.
        RETURN;
    END IF;

    SELECT id INTO office_wallet_id FROM public.wallets WHERE name = 'Office-Funds';

    -- Handle Platform Transactions
    IF v_booking.platform IN ('AlHind', 'Akbar') THEN
        SELECT id INTO platform_wallet_id FROM public.wallets WHERE name = v_booking.platform;
        
        -- Deduct BasePay
        INSERT INTO public.wallet_transactions (wallet_id, amount, description, booking_id, created_by)
        VALUES (platform_wallet_id, -v_booking.base_pay, 'BasePay deduction for Booking ' || p_booking_id, p_booking_id, p_user_id);
        
        -- Credit Commission
        IF v_booking.commission_amount > 0 THEN
            INSERT INTO public.wallet_transactions (wallet_id, amount, description, booking_id, created_by)
            VALUES (platform_wallet_id, v_booking.commission_amount, 'Commission credited for Booking ' || p_booking_id, p_booking_id, p_user_id);
        END IF;
    END IF;

    -- Handle Office Revenue
    INSERT INTO public.wallet_transactions (wallet_id, amount, description, booking_id, created_by)
    VALUES (office_wallet_id, v_booking.base_pay + v_booking.markup_amount, 'Total Revenue (BasePay + Markup) credited for Booking ' || p_booking_id, p_booking_id, p_user_id);

END;
$$;

-- D. Create Expense Transaction
CREATE OR REPLACE FUNCTION public.create_expense_transaction(
    p_expense_id uuid,
    p_user_id uuid,
    p_description text,
    p_amount numeric,
    p_category text,
    p_date timestamptz,
    p_payment_method text default null,
    p_vendor text default null,
    p_location text default null,
    p_notes text default null,
    p_is_recurring boolean default false,
    p_tags jsonb default '[]'::jsonb
)
RETURNS public.expenses
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_office_wallet_id uuid;
    v_inserted public.expenses;
BEGIN
    IF p_amount <= 0 THEN RAISE EXCEPTION 'Amount must be > 0'; END IF;

    INSERT INTO public.expenses (
        id, user_id, description, amount, category, date,
        payment_method, vendor, location, notes,
        is_recurring, tags, status
    ) VALUES (
        p_expense_id, p_user_id, p_description, p_amount, coalesce(p_category, 'Other'), p_date,
        p_payment_method, p_vendor, p_location, p_notes,
        coalesce(p_is_recurring, false), coalesce(p_tags, '[]'::jsonb), 'logged'
    )
    RETURNING * INTO v_inserted;

    SELECT id INTO v_office_wallet_id FROM public.wallets WHERE name = 'Office-Funds';
    IF v_office_wallet_id IS NULL THEN RAISE EXCEPTION 'Office-Funds wallet not found'; END IF;

    -- Debit Expense from Office Funds
    INSERT INTO public.wallet_transactions (
        wallet_id, expense_id, amount, description, created_by
    ) VALUES (
        v_office_wallet_id, p_expense_id, -abs(p_amount),
        coalesce(p_description, 'Expense'), p_user_id
    );

    RETURN v_inserted;
END;
$$;

-- E. Delete Expense Transaction
CREATE OR REPLACE FUNCTION public.delete_expense_transaction(
    p_expense_id uuid,
    p_user_id uuid
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_amt numeric;
    v_desc text;
    v_office_wallet_id uuid;
BEGIN
    SELECT amount, description INTO v_amt, v_desc FROM public.expenses WHERE id = p_expense_id;
    IF v_amt IS NULL THEN RAISE EXCEPTION 'Expense not found'; END IF;

    DELETE FROM public.expenses WHERE id = p_expense_id;

    SELECT id INTO v_office_wallet_id FROM public.wallets WHERE name = 'Office-Funds';
    
    -- Refund Expense to Office Funds
    INSERT INTO public.wallet_transactions (
        wallet_id, expense_id, amount, description, created_by
    ) VALUES (
        v_office_wallet_id, p_expense_id, abs(v_amt),
        coalesce('Refund: ' || v_desc, 'Refund: Expense'), p_user_id
    );
END;
$$;

-- View for Profit Calculation
CREATE OR REPLACE VIEW public.bookings_with_profit AS
SELECT
    *,
    (
        CASE
            WHEN platform = 'Direct' THEN (base_pay + markup_amount)
            ELSE (commission_amount + markup_amount)
        END
    ) AS net_profit
FROM
    public.bookings;

