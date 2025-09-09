# إضافة رقم الهوية ورقم التحويل البنكي للمستثمرين
# Adding National ID and Bank Transfer Number to Investors

## نظرة عامة / Overview

تم تحديث النظام لإضافة حقلين جديدين للمستثمرين:
- **رقم الهوية الوطنية** (National ID)
- **رقم التحويل البنكي** (Bank Transfer Number)

The system has been updated to add two new fields for investors:
- **National ID**
- **Bank Transfer Number**

## التحديثات المطلوبة / Required Updates

### 1. قا��دة البيانات المحلية SQLite / Local SQLite Database

✅ **تم التحديث بالفعل** - يتم إضافة الأعمدة الجديدة تلقائياً عند بدء تشغيل الخادم.

✅ **Already Updated** - New columns are automatically added when the server starts.

### 2. قاعدة بيانات Supabase / Supabase Database

⚠️ **يتطلب تحديث يدوي** - تحتاج إلى تشغيل الكود التالي في Supabase SQL Editor:

⚠️ **Requires Manual Update** - You need to run the following code in Supabase SQL Editor:

#### خطوات التحديث / Update Steps:

1. **افتح لوحة التحكم في Supabase**
   Open your Supabase Dashboard

2. **اذهب إلى SQL Editor**
   Go to SQL Editor

3. **قم بتشغيل الكود التالي:**
   Run the following code:

```sql
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
```

4. **تحقق من النتيجة:**
   Verify the results:

```sql
-- عرض هيكل الجدول المحدث
-- Display updated table structure
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'investors'
ORDER BY ordinal_position;
```

## الميزات الجديدة / New Features

### في واجهة المستخدم / In User Interface:

1. **نموذج إضافة/تعديل مستثمر:**
   - حقل رقم الهوية (اختياري)
   - حقل رقم التحويل البنكي (اختياري)

2. **قائمة المستثمرين:**
   - عرض رقم الهوية مع أيقونة بطاقة الهوية
   - عرض رقم التحويل البنكي مع أيقونة البنك

### In User Interface:

1. **Add/Edit Investor Form:**
   - National ID field (optional)
   - Bank Transfer Number field (optional)

2. **Investors List:**
   - Display National ID with ID card icon
   - Display Bank Transfer Number with bank icon

## الملفات المحدثة / Updated Files

- `shared/types.ts` - تحديث نموذج البيانات
- `client/pages/Investors.tsx` - تحديث واجهة المستخدم
- `server/services/sqliteDatabase.ts` - تحديث قاعدة البيانات المحلية
- `server/services/supabaseDatabase.ts` - تحديث خدمة Supabase

## التحقق من التحديث / Verification

بعد تشغيل كود SQL في Supabase، يجب أن تشاهد:

After running the SQL code in Supabase, you should see:

1. ✅ الحقول الجديدة في نموذج إضافة المستثمرين
2. ✅ عرض الحقول في قائمة المستثمرين (عند وجود بيانات)
3. ✅ حفظ واسترجاع البيانات بشكل صحيح

1. ✅ New fields in the add investor form
2. ✅ Fields displayed in investors list (when data exists)
3. ✅ Proper saving and retrieval of data

## ملاحظات مهمة / Important Notes

- 📝 الحقلان اختياريان ولا يؤثران على الوظائف الأساسية
- 🔒 البيانات الموجودة لن تتأثر بالتحديث
- 💾 يتم حفظ البيانات في كلا قاعدتي البيانات (SQLite و Supabase)

- 📝 Both fields are optional and don't affect core functionality
- 🔒 Existing data will not be affected by the update
- 💾 Data is saved in both databases (SQLite and Supabase)

## المساعدة / Support

إذا واجهت أي مشاكل، تأكد من:
1. أن لديك صلاحية كتابة في قاعدة بيانات Supabase
2. أن الاتصال بـ Supabase يعمل بشكل صحيح
3. إعادة تشغيل الخادم بعد التحديث

If you encounter any issues, make sure:
1. You have write permissions in Supabase database
2. Supabase connection is working properly
3. Restart the server after the update
