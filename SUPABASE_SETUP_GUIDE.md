# 🚀 دليل إعداد Supabase - قاعدة بيانات مجانية وآمنة

## 🎯 لماذا Supabase؟

### المشكلة:
- قاعدة البيانات المحلية (SQLite) تضيع عند رفع التطبيق على منصات سحابية
- البيانات غير محمية من إعادة التشغيل أو المشاكل التقنية

### الحل:
**Supabase** - قاعدة بيانات PostgreSQL مجانية في السحابة تحل جميع المشاكل!

## ✨ مزايا Supabase

| الميزة | التفاصيل |
|--------|----------|
| 🆓 **مجاني تماماً** | 500MB مساحة، 50,000 مستخدم شهرياً |
| 🛡️ **آمن 100%** | لا تضيع البيانات أبداً |
| ⚡ **سريع** | أسرع من SQLite في ب��ض الحالات |
| 🌐 **سحابي** | يعمل من أي مكان في العالم |
| 📊 **لوحة تحكم** | إدارة البيانات بصرياً |
| 🔄 **نسخ احتياطي** | تلقائي ومتعدد المواقع |

## 📋 خطوات الإعداد

### الخطوة 1: إنشاء مشروع Supabase

1. **اذهب إلى**: [supabase.com](https://supabase.com)
2. **اضغط**: "Start your project"
3. **قم بالتسجيل**: بحساب GitHub أو بريد إلكتروني
4. **اضغط**: "New project"

### الخطوة 2: إعداد المشروع

```
اسم المشروع: investment-app
المنظمة: اختر منظمتك أو أنشئ جديدة
كلمة مرور قاعدة البيانات: كلمة مرور قوية (احفظها!)
المنطقة: اختر أقرب منطقة لك
```

### الخطوة 3: انتظار الإنشاء
- ⏱️ **الوقت**: 2-3 دقائق
- 🔄 **الحالة**: ستظهر "Setting up project..."
- ✅ **الانتهاء**: ستظهر لوحة التحكم

### الخطوة 4: الحصول على المفاتيح

1. **اذهب لـ**: Settings → API
2. **انسخ**:
   ```
   Project URL: https://your-project-id.supabase.co
   anon public: your-anon-key-here
   ```

### الخطوة 5: إعداد التطبيق

1. **أنشئ ملف `.env`** في جذر المشروع:
```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

2. **أعد تشغيل التطبيق**:
```bash
npm run dev
```

## 🔧 إنشاء الجداول

### طريقة 1: تلقائياً (مستحسن)
```sql
-- يتم تنفيذ هذا تلقائياً عند تشغيل التطبيق
-- لا تحتاج لفعل شيء!
```

### طريقة 2: يدوياً (اختياري)
اذهب لـ SQL Editor في Supabase وانسخ:

```sql
-- Create investors table
CREATE TABLE IF NOT EXISTS investors (
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
CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  amount REAL NOT NULL,
  date TEXT,
  notes TEXT,
  added_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create revenues table
CREATE TABLE IF NOT EXISTS revenues (
  id TEXT PRIMARY KEY,
  amount REAL NOT NULL,
  date TEXT,
  description TEXT,
  added_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create withdrawals table
CREATE TABLE IF NOT EXISTS withdrawals (
  id TEXT PRIMARY KEY,
  investor_name TEXT NOT NULL,
  amount REAL NOT NULL,
  date TEXT,
  notes TEXT,
  approved_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  role TEXT,
  password TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create operations log table
CREATE TABLE IF NOT EXISTS operations_log (
  id TEXT PRIMARY KEY,
  operation_type TEXT,
  details TEXT,
  date TEXT,
  performed_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## ✅ التحقق من النجاح

### 1. في التطبيق:
- اذهب لصفحة الإعدادات
- ابحث عن "قاعدة البيانات السحابية"
- يجب أن ترى "متصل بـ Supabase"

### 2. في Supabase:
- اذهب لـ Table Editor
- يجب أن ترى 7 جداول
- يجب أن ترى البيانات التجريبية

### 3. اختبار البيانات:
- أضف مستثمر جديد في ا��تطبيق
- تحقق من ظهوره في Supabase

## 🛠️ استكشاف الأخطاء

### ❌ خطأ: "Invalid JWT"
```
السبب: مفاتيح خاطئة
الحل: تحقق من SUPABASE_URL و SUPABASE_ANON_KEY
```

### ❌ خطأ: "Table doesn't exist"
```
السبب: الجداول لم يتم إنشاؤها
الحل: أعد تشغيل التطبيق أو أنشئ الجداول يدوياً
```

### ❌ خطأ: "Network error"
```
السبب: مشكلة في الإنترنت أو رابط خاطئ
الحل: تحقق من الاتصال والرابط
```

### ⚠️ تحذير: "Using SQLite"
```
السبب: متغيرات البيئة غير محددة
الحل: تأكد من وجود ملف .env بالقيم الصحيحة
```

## 📊 إدارة البيانات

### لوحة التحكم:
```
رابط لوحة التحكم: https://your-project.supabase.co
قسم الجداول: Table Editor
قسم المستخدمين: Authentication
قسم التقارير: Logs
```

### البحث والتصفية:
```sql
-- البحث عن مستثمر معين
SELECT * FROM investors WHERE name LIKE '%أحمد%';

-- المصاريف في شهر معين
SELECT * FROM expenses WHERE date LIKE '%01/2024%';

-- إجمالي الإيرادات
SELECT SUM(amount) FROM revenues;
```

## 🔄 النقل من SQLite

إذا كانت لديك بيانات في SQLite:

1. **اذهب للإعدادات**
2. **اضغط "نقل إلى Supabase"**
3. **انتظر رسالة النجاح**
4. **تحقق من البيانات في لوحة Supabase**

## 💰 التكلفة والحدود

### المجاني (إلى الأبد):
- ✅ 500MB مساحة تخزين
- ✅ 50,000 مستخدم نشط شهرياً
- ✅ 50,000 طلب API شهرياً
- ✅ نسخ احتياطي لـ 7 أيام
- ✅ دعم المجتمع

### المدفوع (اختياري):
- 🚀 $25/شهر للمزيد من المساحة
- 🚀 مزيد من الطلبات
- 🚀 نسخ احتياطي أطول
- 🚀 دعم فني

## 🎉 النتيجة النهائية

بعد إعداد Supabase:
- ✅ بياناتك محمية 100% من الضياع
- ✅ يمكن رفع التطبيق على أي منصة
- ✅ سرعة ممتازة في الوصول للبيانات  
- ✅ لوحة تحكم لإدارة البيانات
- ✅ نسخ احتياطي تلقائي
- ✅ مجاني تماماً!

---

**🚀 الآن تطبيقك جاهز للإنتاج مع حماية كاملة للبيانات!**

## 📞 الدعم

إذا واجهت أي مشاكل:
1. راجع [وثائق Supabase](https://supabase.com/docs)
2. تحقق من [حالة الخدمة](https://status.supabase.com/)
3. ابحث في [مجتمع Supabase](https://github.com/supabase/supabase/discussions)
