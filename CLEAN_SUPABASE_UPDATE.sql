-- إضافة رقم الهوية الوطنية
ALTER TABLE public.investors 
ADD COLUMN IF NOT EXISTS national_id TEXT;

-- إضافة رقم التحويل البنكي
ALTER TABLE public.investors 
ADD COLUMN IF NOT EXISTS bank_transfer_number TEXT;

-- إضافة تعليقات توضيحية للأعمدة الجديدة
COMMENT ON COLUMN public.investors.national_id IS 'رقم الهوية الوطنية للمستثمر';
COMMENT ON COLUMN public.investors.bank_transfer_number IS 'رقم التحويل البنكي للمستثمر';

-- التحقق من هيكل الجدول بعد التحديث
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'investors'
ORDER BY ordinal_position;
