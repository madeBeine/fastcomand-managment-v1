-- Clear all test/demo data from Supabase tables
-- Run this in your Supabase SQL editor to remove test data

-- Clear all data from tables
DELETE FROM operations_log;
DELETE FROM withdrawals;
DELETE FROM revenues;
DELETE FROM expenses;
DELETE FROM investors;
DELETE FROM users WHERE role != 'Admin';  -- Keep admin users only

-- Verify tables are empty
SELECT 'investors' as table_name, COUNT(*) as record_count FROM investors
UNION ALL
SELECT 'expenses' as table_name, COUNT(*) as record_count FROM expenses
UNION ALL
SELECT 'revenues' as table_name, COUNT(*) as record_count FROM revenues
UNION ALL
SELECT 'withdrawals' as table_name, COUNT(*) as record_count FROM withdrawals
UNION ALL
SELECT 'operations_log' as table_name, COUNT(*) as record_count FROM operations_log
UNION ALL
SELECT 'users' as table_name, COUNT(*) as record_count FROM users;

-- Reset any sequences/auto-increment if needed
-- (Most Supabase tables use UUID/TEXT primary keys, so this might not be needed)
