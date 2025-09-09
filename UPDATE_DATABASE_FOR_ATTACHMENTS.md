# تحديث قاعدة البيانات لدعم المرفقات

لتفعيل نظام المرفقات الجديد، يجب تنفيذ الأمر SQL التالي في Supabase:

## الطريقة الأولى: تحديث الجداول الموجودة

انسخ والصق الكود التالي في SQL Editor في Supabase:

```sql
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
```

## الطريقة الثانية: إنشاء الجداول من جديد (إختياري)

إذا كنت تريد إنشاء الجداول من جديد مع الحقول الجديدة، استخدم ملف `SUPABASE_WITH_ATTACHMENTS.sql`.

## ما تم تحديثه:

✅ **الترتيب**: المصاريف والإيرادات والسحوبات الآن مرتبة حسب آخر إضافة في الأعلى (استخدام `created_at`)

✅ **المرفقات**: إضافة إمكانية رفع وحفظ الصور والفواتير مع كل عملية

✅ **العرض**: زر عرض المرفقات مع عدد المرفقات، وعرض الصور الحقيقية بدلاً من placeholder

✅ **جميع الصفحات**: تم تطبيق التحديثات على:
- صفحة المصاريف
- صفحة الإيرادات 
- صفحة السحوبات

## كيفية استخدام النظام الجديد:

1. **إضافة المرفقات**: عند إضافة مصروف/إيراد/سحب جديد، يمكن رفع حتى 3 ملفات (5MB لكل ملف)

2. **عرض المرفقات**: انقر على زر العين لعرض جميع المرفقات المحفوظة

3. **أنواع الملفات المدعومة**: 
   - الصور: يتم عرضها مباشرة
   - الملفات الأخرى (PDF, Word, Excel): يمكن تحميلها

4. **الترتيب الجديد**: آخر إضافة ستظهر في الأعلى تلقائياً

## ملاحظة مهمة:
الملفات يتم حفظها كـ Base64 في قاعدة البيانات. هذا يعمل بشكل ممتاز للتطبيقات الصغيرة والمتوسطة. للتطبيقات الكبيرة، يُنصح باستخدام Supabase Storage لاحقاً.
