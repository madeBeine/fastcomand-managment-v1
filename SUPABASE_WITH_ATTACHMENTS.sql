-- ========================================
-- SQL محدث مع إضافة حقول المرفقات
-- قم بتشغيل هذا النص في SQL Editor
-- ========================================

-- إضافة حقل المرفقات للجداول الموجودة
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS attachment_urls TEXT;
ALTER TABLE public.revenues ADD COLUMN IF NOT EXISTS attachment_urls TEXT;
ALTER TABLE public.withdrawals ADD COLUMN IF NOT EXISTS attachment_urls TEXT;

-- التحقق من إضافة الحقول بنجاح
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name IN ('expenses', 'revenues', 'withdrawals') 
  AND column_name = 'attachment_urls'
  AND table_schema = 'public';

-- ========================================
-- إذا كنت تريد إنشاء الجداول من جديد (إختياري)
-- ========================================

/*
-- حذف الجداول الموجودة أولاً (إذا كانت موجودة)
DROP TABLE IF EXISTS public.operations_log;
DROP TABLE IF EXISTS public.settings;
DROP TABLE IF EXISTS public.users;
DROP TABLE IF EXISTS public.withdrawals;
DROP TABLE IF EXISTS public.revenues;
DROP TABLE IF EXISTS public.expenses;
DROP TABLE IF EXISTS public.investors;

-- 1. إنشاء جدول المستثمرين
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

-- 2. إنشاء جدول المصاريف مع حقل المرفقات
CREATE TABLE public.expenses (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  amount REAL NOT NULL,
  date TEXT,
  notes TEXT,
  added_by TEXT,
  attachment_urls TEXT, -- JSON string containing array of attachment URLs
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. إنشاء جدول الإيرادات مع حقل المرفقات
CREATE TABLE public.revenues (
  id TEXT PRIMARY KEY,
  amount REAL NOT NULL,
  date TEXT,
  description TEXT,
  added_by TEXT,
  attachment_urls TEXT, -- JSON string containing array of attachment URLs
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. إنشاء جدول السحوبات مع حقل المرفقات
CREATE TABLE public.withdrawals (
  id TEXT PRIMARY KEY,
  investor_name TEXT NOT NULL,
  amount REAL NOT NULL,
  date TEXT,
  notes TEXT,
  approved_by TEXT,
  attachment_urls TEXT, -- JSON string containing array of attachment URLs
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. إنشاء جدول المستخدمين
CREATE TABLE public.users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  role TEXT DEFAULT 'Investor',
  password TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. إنشاء جدول الإعدادات
CREATE TABLE public.settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. إنشاء جدول سجل العمليات
CREATE TABLE public.operations_log (
  id TEXT PRIMARY KEY,
  operation_type TEXT,
  details TEXT,
  date TEXT,
  performed_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
*/

-- رسالة نجاح
SELECT 'تم إضافة حقول المرفقات بنجاح! ✅' as success_message;
