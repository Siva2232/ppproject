-- ============================================
-- DROP ALL SCRIPT
-- WARNING: THIS WILL DELETE ALL DATA
-- ============================================

DROP TRIGGER IF EXISTS on_transaction_added ON public.wallet_transactions;
DROP FUNCTION IF EXISTS public.update_wallet_balance();
DROP FUNCTION IF EXISTS public.create_booking_transaction(text, text, text, text, timestamptz, booking_category, text, numeric, numeric, numeric, numeric, booking_status, uuid);
DROP FUNCTION IF EXISTS public.reverse_booking_transaction(text, uuid);
DROP FUNCTION IF EXISTS public.confirm_booking_transaction(text, uuid);
DROP FUNCTION IF EXISTS public.create_expense_transaction(uuid, uuid, text, numeric, text, timestamptz, text, text, text, text, boolean, jsonb);
DROP FUNCTION IF EXISTS public.delete_expense_transaction(uuid, uuid);
DROP VIEW IF EXISTS public.bookings_with_profit;

DROP TABLE IF EXISTS public.wallet_transactions CASCADE;
DROP TABLE IF EXISTS public.bookings CASCADE;
DROP TABLE IF EXISTS public.expenses CASCADE;
DROP TABLE IF EXISTS public.wallets CASCADE;

DROP TYPE IF EXISTS booking_status;
DROP TYPE IF EXISTS booking_category;
