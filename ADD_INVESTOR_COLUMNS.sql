-- إضافة أعمدة رقم الهوية ورقم التحويل البنكي لجدول المستثمرين
-- Add national ID and bank transfer number columns to investors table

-- التحقق من وجود جدول المستثمرين أولاً
-- Check if investors table exists first
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE  table_schema = 'public'
   AND    table_name   = 'investors'
);

-- إضافة عمود رقم الهوية إذا لم يكن موجوداً
-- Add national ID column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='investors' AND column_name='national_id') THEN
        ALTER TABLE public.investors ADD COLUMN national_id TEXT;
        COMMENT ON COLUMN public.investors.national_id IS 'رقم الهوية الوطنية للمستثمر';
    END IF;
END $$;

-- إضافة عمود رقم التحويل البنكي إذا لم يكن موجوداً
-- Add bank transfer number column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='investors' AND column_name='bank_transfer_number') THEN
        ALTER TABLE public.investors ADD COLUMN bank_transfer_number TEXT;
        COMMENT ON COLUMN public.investors.bank_transfer_number IS 'رقم التحويل البنكي للمستثمر';
    END IF;
END $$;

-- التحقق من إضافة الأعمدة بنجاح
-- Verify columns were added successfully
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'investors' 
AND column_name IN ('national_id', 'bank_transfer_number')
ORDER BY column_name;
