-- SQL لإضافة أعمدة المرفقات في Supabase
-- انسخ والصق هذا في SQL Editor في Supabase

ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS attachment_urls TEXT;
ALTER TABLE public.revenues ADD COLUMN IF NOT EXISTS attachment_urls TEXT;
ALTER TABLE public.withdrawals ADD COLUMN IF NOT EXISTS attachment_urls TEXT;

-- التحقق من إضافة الأعمدة بنجاح
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name IN ('expenses', 'revenues', 'withdrawals') 
  AND column_name = 'attachment_urls'
  AND table_schema = 'public'
ORDER BY table_name;

-- رسالة النجاح
SELECT 'تم إضافة أعمدة المرفقات بنجاح! ✅' as success_message;
