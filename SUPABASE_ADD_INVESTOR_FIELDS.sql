-- ملف SQL شامل لإضافة رقم الهوية ورقم التحويل البنكي لجدول المستثمرين في Supabase
-- Complete SQL file to add national ID and bank transfer number fields to investors table in Supabase

-- التحقق من وجود جدول المستثمرين
-- Check if investors table exists
SELECT 
    table_name,
    table_schema
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'investors';

-- إضافة رقم الهوية الوطنية
-- Add national ID column
ALTER TABLE public.investors 
ADD COLUMN IF NOT EXISTS national_id TEXT;

-- إضافة رقم التحويل البنكي
-- Add bank transfer number column  
ALTER TABLE public.investors 
ADD COLUMN IF NOT EXISTS bank_transfer_number TEXT;

-- إضافة تعليقات توضيحية للأعمدة الجديدة
-- Add comments to the new columns
COMMENT ON COLUMN public.investors.national_id IS 'رقم الهوية الوطنية للمستثمر - National ID of the investor';
COMMENT ON COLUMN public.investors.bank_transfer_number IS 'رقم التحويل البنكي للمستثمر - Bank transfer number of the investor';

-- التحقق من هيكل الجدول بعد التحديث
-- Verify table structure after update
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'investors'
ORDER BY ordinal_position;

-- عرض الجدول المحدث مع البيانات الموجودة
-- Display updated table with existing data
SELECT 
    id,
    name,
    phone,
    national_id,
    bank_transfer_number,
    share_percentage,
    total_invested,
    total_profit,
    total_withdrawn,
    current_balance,
    created_at
FROM public.investors 
ORDER BY share_percentage DESC;
