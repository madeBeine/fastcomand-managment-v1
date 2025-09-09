-- ========================================
-- SQL محدث ومُصحح لإنشاء جميع الجداول في Supabase
-- قم بتشغيل هذا النص في SQL Editor
-- ========================================

-- حذف الجداول الموجودة أولاً (إذا كانت موجودة)
DROP TABLE IF EXISTS public.operations_log;
DROP TABLE IF EXISTS public.settings;
DROP TABLE IF EXISTS public.users;
DROP TABLE IF EXISTS public.withdrawals;
DROP TABLE IF EXISTS public.revenues;
DROP TABLE IF EXISTS public.expenses;
DROP TABLE IF EXISTS public.investors;

-- ========================================
-- 1. إنشاء جدول المستثمرين
-- ========================================
CREATE TABLE public.investors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  share_percentage REAL DEFAULT 0,
  total_invested REAL DEFAULT 0,
  total_profit REAL DEFAULT 0,
  total_withdrawn REAL DEFAULT 0,
  current_balance REAL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 2. إنشاء جدول المصاريف
-- ========================================
CREATE TABLE public.expenses (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  amount REAL NOT NULL,
  date TEXT,
  notes TEXT,
  added_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 3. إنشاء جدول الإيرادات
-- ========================================
CREATE TABLE public.revenues (
  id TEXT PRIMARY KEY,
  amount REAL NOT NULL,
  date TEXT,
  description TEXT,
  added_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 4. إنشاء جدول السحوبات
-- ========================================
CREATE TABLE public.withdrawals (
  id TEXT PRIMARY KEY,
  investor_name TEXT NOT NULL,
  amount REAL NOT NULL,
  date TEXT,
  notes TEXT,
  approved_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 5. إنشاء جدول المستخدمين
-- ========================================
CREATE TABLE public.users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  role TEXT DEFAULT 'Investor',
  password TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 6. إنشاء جدول الإعدادات
-- ========================================
CREATE TABLE public.settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 7. إنشاء جدول سجل العمليات
-- ========================================
CREATE TABLE public.operations_log (
  id TEXT PRIMARY KEY,
  operation_type TEXT,
  details TEXT,
  date TEXT,
  performed_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- إدخال البيانات الأولية
-- ========================================

-- بيانات المستثمرين
INSERT INTO public.investors (id, name, phone, share_percentage, total_invested, total_profit, total_withdrawn, current_balance) VALUES
('INV001', 'أحمد محمد الشيخ', '+222 12345678', 25, 50000, 12500, 5000, 7500),
('INV002', 'فاطمة علي بنت محمد', '+222 23456789', 20, 40000, 10000, 3000, 7000),
('INV003', 'محمد عبد الله ولد أحمد', '+222 34567890', 30, 60000, 15000, 8000, 7000),
('INV004', 'خديجة إبراهيم بنت محمد', '+222 45678901', 15, 30000, 7500, 2000, 5500),
('INV005', 'عمر حسن ولد علي', '+222 56789012', 10, 20000, 5000, 1500, 3500);

-- بيانات المصاريف
INSERT INTO public.expenses (id, category, amount, date, notes, added_by) VALUES
('EXP001', 'مواد خام', 15000, '15/01/2024', 'شراء مواد خام للإنتاج الشهري', 'أحمد الإدارة'),
('EXP002', 'رواتب', 25000, '01/01/2024', 'رواتب الموظفين لشهر يناير 2024', 'أحمد الإدارة'),
('EXP003', 'إيجار', 8000, '01/01/2024', 'إيجار المكتب والمصنع الشهري', 'أحمد الإدارة'),
('EXP004', 'كهرباء', 3500, '10/01/2024', 'فاتورة الكهرباء للشهر الماضي', 'فاطمة المحاسبة'),
('EXP005', 'نقل ومواصلات', 2000, '20/01/2024', 'تكاليف النقل والتوصيل للعملاء', 'محمد العمليات'),
('EXP006', 'صيانة', 4500, '22/01/2024', 'صيانة الآلات والمعدات', 'محمد العمليات'),
('EXP007', 'اتصالات', 1200, '25/01/2024', 'فواتير الهاتف والإنترنت', 'فاطمة المحاسبة');

-- بيانات الإيرادات
INSERT INTO public.revenues (id, amount, date, description, added_by) VALUES
('REV001', 75000, '25/01/2024', 'مبيعات المنتج الأساسي للشهر', 'أحمد الإدارة'),
('REV002', 45000, '20/01/2024', 'عقد خدمات استشارية مع شركة كبرى', 'فاطمة المبيعات'),
('REV003', 30000, '15/01/2024', 'مبيعات منتجات ثانوية ومواد إضافية', 'محمد المبيعات'),
('REV004', 20000, '10/01/2024', 'إيرادات تأجير معدات ومساحات', 'أحمد الإدارة'),
('REV005', 15000, '05/01/2024', 'عمولات وسائر إيرادات متنوعة', 'فاطمة المحاسبة'),
('REV006', 35000, '28/01/2024', 'عقد جديد مع عميل رئيسي', 'أحمد الإدارة');

-- بيانات السحوبات
INSERT INTO public.withdrawals (id, investor_name, amount, date, notes, approved_by) VALUES
('WIT001', 'أحمد محمد الشيخ', 5000, '28/01/2024', 'سحب جزئي من ا��أرباح المتراكمة', 'أحمد الإدارة'),
('WIT002', 'فاطمة علي بنت محمد', 3000, '25/01/2024', 'سحب للاحتياجات الشخصية العاجلة', 'أحمد الإدارة'),
('WIT003', 'محمد عبد الله ولد أحمد', 8000, '22/01/2024', 'سحب نصف الأرباح المتراكمة', 'أحمد الإدارة'),
('WIT004', 'خديجة إبراهيم بنت محمد', 2000, '20/01/2024', 'سحب للاستثمار في مشروع آخر', 'أحمد الإدارة');

-- بيانات المستخدمين
INSERT INTO public.users (id, name, phone, role, password) VALUES
('USER001', 'أحمد الإدارة المالية', '+222 11111111', 'Admin', 'admin123'),
('USER002', 'فاطمة المحاسبة الرئيسية', '+222 22222222', 'Assistant', 'assistant123'),
('USER003', 'محمد المستثمر الرئيسي', '+222 33333333', 'Investor', 'investor123'),
('USER004', 'خديجة المستثمرة المؤسسة', '+222 44444444', 'Investor', 'investor123'),
('USER005', 'عمر مدير العمليات', '+222 55555555', 'Assistant', 'operations123');

-- بيانات الإعدادات
INSERT INTO public.settings (key, value) VALUES
('Project_Percentage', '15'),
('Currency', 'MRU'),
('AI_Sync_Interval_Days', '2'),
('Last_AI_Analysis', '2025-01-28'),
('Enable_Google_Drive_Link', 'false'),
('Database_Type', 'Supabase'),
('Data_Source', 'Cloud_Database');

-- بيانات سجل العمليات
INSERT INTO public.operations_log (id, operation_type, details, date, performed_by) VALUES
('LOG001', 'تهيئة النظام', 'تم إنشاء قاعدة البيانات Supabase وتهيئة البيانات الأولية بنجاح', NOW()::text, 'النظام التلقائي'),
('LOG002', 'إعداد المستثمرين', 'تم إدخال بيانات 5 مستثمرين أساسيين مع تفاصيل استثماراتهم', NOW()::text, 'النظام التلقائي'),
('LOG003', 'إعداد البيانات المالية', 'تم إدخال المصاريف والإيرادات والسحوبات للشهر الحالي', NOW()::text, 'النظام التلقائي'),
('LOG004', 'تفعيل قاعدة البيانات', 'تم تفعيل قاعدة البيانات السحابية Supabase بالكامل', NOW()::text, 'النظام التلقائي');

-- ========================================
-- تأكيد النجاح
-- ========================================

-- رسالة نجاح
SELECT 'تم إنشاء جميع الجداول والبيانات بنجاح! ✅' as success_message;

-- عرض تفاصيل الجداول المُ��شأة
SELECT 
  'investors' as table_name, 
  COUNT(*) as records,
  'جدول المستثمرين تم إنشاؤه' as status
FROM public.investors
UNION ALL
SELECT 
  'expenses' as table_name, 
  COUNT(*) as records,
  'جدول المصاريف تم إنشاؤه' as status
FROM public.expenses
UNION ALL
SELECT 
  'revenues' as table_name, 
  COUNT(*) as records,
  'جدول الإيرادات تم إنشاؤه' as status
FROM public.revenues
UNION ALL
SELECT 
  'withdrawals' as table_name, 
  COUNT(*) as records,
  'جدول السحوبات تم إنشاؤه' as status
FROM public.withdrawals
UNION ALL
SELECT 
  'users' as table_name, 
  COUNT(*) as records,
  'جدول المستخدمين تم إنشاؤه' as status
FROM public.users
UNION ALL
SELECT 
  'settings' as table_name, 
  COUNT(*) as records,
  'جدول الإعدادات تم إنشاؤه' as status
FROM public.settings
UNION ALL
SELECT 
  'operations_log' as table_name, 
  COUNT(*) as records,
  'جدول سجل العمليات تم إنشاؤه' as status
FROM public.operations_log;
