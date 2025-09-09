-- فحص هيكل جدول المستثمرين في Supabase
-- Check investors table structure in Supabase

-- عرض هيكل الجدول
-- Display table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'investors'
ORDER BY ordinal_position;

-- عرض البيانات الحالية للمستثمرين
-- Display current investor data
SELECT 
    id,
    name,
    phone,
    national_id,
    bank_transfer_number,
    share_percentage,
    total_invested,
    created_at
FROM public.investors 
ORDER BY share_percentage DESC;

-- إذا كانت الأعمدة موجودة ولكن البيانات null، يمكن تحديثها كالتالي:
-- If columns exist but data is null, you can update them like this:

-- UPDATE public.investors 
-- SET 
--     national_id = 'رقم_الهوية_هنا',
--     bank_transfer_number = 'رقم_الحساب_البنكي_هنا'
-- WHERE id = 'معرف_المستثمر';

-- مثال للتحديث:
-- Example update:
-- UPDATE public.investors 
-- SET 
--     national_id = '1234567890',
--     bank_transfer_number = 'BT123456789'
-- WHERE name = 'أحمد محمد الشيخ';
