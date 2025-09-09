-- Run these commands in Supabase SQL Editor
-- Go to: https://jdaqprwsmkkgkzjmkbox.supabase.co
-- Navigate to: SQL Editor

-- Create investors table
CREATE TABLE IF NOT EXISTS public.investors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  share_percentage REAL,
  total_invested REAL,
  total_profit REAL,
  total_withdrawn REAL,
  current_balance REAL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create expenses table
CREATE TABLE IF NOT EXISTS public.expenses (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  amount REAL NOT NULL,
  date TEXT,
  notes TEXT,
  added_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create revenues table
CREATE TABLE IF NOT EXISTS public.revenues (
  id TEXT PRIMARY KEY,
  amount REAL NOT NULL,
  date TEXT,
  description TEXT,
  added_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create withdrawals table
CREATE TABLE IF NOT EXISTS public.withdrawals (
  id TEXT PRIMARY KEY,
  investor_name TEXT NOT NULL,
  amount REAL NOT NULL,
  date TEXT,
  notes TEXT,
  approved_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  role TEXT,
  password TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create settings table
CREATE TABLE IF NOT EXISTS public.settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create operations log table
CREATE TABLE IF NOT EXISTS public.operations_log (
  id TEXT PRIMARY KEY,
  operation_type TEXT,
  details TEXT,
  date TEXT,
  performed_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial data
INSERT INTO public.investors (id, name, phone, share_percentage, total_invested, total_profit, total_withdrawn, current_balance) VALUES
('INV001', 'أحمد محمد الشيخ', '+222 12345678', 25, 50000, 12500, 5000, 7500),
('INV002', 'فاطمة علي بنت محمد', '+222 23456789', 20, 40000, 10000, 3000, 7000),
('INV003', 'محمد عبد الله ولد أحمد', '+222 34567890', 30, 60000, 15000, 8000, 7000),
('INV004', 'خديجة إبراهيم بنت محمد', '+222 45678901', 15, 30000, 7500, 2000, 5500),
('INV005', 'عمر حسن ولد علي', '+222 56789012', 10, 20000, 5000, 1500, 3500)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.expenses (id, category, amount, date, notes, added_by) VALUES
('EXP001', 'مواد خام', 15000, '15/01/2024', 'شراء مواد خام للإنتاج الشهري', 'أحمد الإدارة'),
('EXP002', 'رواتب', 25000, '01/01/2024', 'رواتب الموظفين لشهر يناير 2024', 'أحمد الإدارة'),
('EXP003', 'إيجار', 8000, '01/01/2024', 'إيجار المكتب والمصنع الشهري', 'أحمد الإدارة')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.revenues (id, amount, date, description, added_by) VALUES
('REV001', 75000, '25/01/2024', 'مبيعات المنتج الأساسي للشهر', 'أحمد الإدارة'),
('REV002', 45000, '20/01/2024', 'عقد خدمات استشارية مع شركة كبرى', 'فاطمة المبيعات')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.users (id, name, phone, role, password) VALUES
('USER001', 'أحمد الإدارة المالية', '+222 11111111', 'Admin', 'admin123'),
('USER002', 'فاطمة المحاسبة الرئيسية', '+222 22222222', 'Assistant', 'assistant123')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.settings (key, value) VALUES
('Project_Percentage', '15'),
('Currency', 'MRU'),
('Database_Type', 'Supabase'),
('Data_Source', 'Cloud_Database')
ON CONFLICT (key) DO NOTHING;
