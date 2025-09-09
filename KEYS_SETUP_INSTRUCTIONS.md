# 🔑 تعليمات إعداد مفاتيح Google Sheets

## المطلوب لإنشاء البيانات الحقيقية

### 1. الحصول على مفاتيح الخدمة

تحتاج إلى الحصول على ملف JSON من Google Cloud Console يحتوي على:
- `private_key_id`
- `private_key` 
- `client_id`

### 2. إعداد المفاتيح

**الطريقة الأولى: متغيرات البيئة (موصى بها)**
```bash
export GOOGLE_PRIVATE_KEY_ID="your-private-key-id-here"
export GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key-Here\n-----END PRIVATE KEY-----\n"
export GOOGLE_CLIENT_ID="your-client-id-here"
```

**الطريقة الثانية: تحديث ملف credentials.json**
استبدل القيم ف�� `server/credentials.json`:
- `REPLACE_WITH_REAL_PRIVATE_KEY_ID` → المفتاح الحقيقي
- `REPLACE_WITH_REAL_PRIVATE_KEY` → المفتاح الخاص الحقيقي  
- `REPLACE_WITH_REAL_CLIENT_ID` → معرف العميل الحقيقي

### 3. التحقق من الأذونات

تأكد من أن `fastcomand-sheets-servis@fastcomand-sheets-integration.iam.gserviceaccount.com` له صلاحية **Editor** في الشيت:
1. افتح الشيت: https://docs.google.com/spreadsheets/d/1qU6wQ7KN3LoU_1atvbxSDLshYXZZ_DixgCBDcAcTfJA/edit
2. اضغط "Share" 
3. أضف البريد مع صلاحية Editor
4. اضغط Send

### 4. تشغيل النظام

1. أعد تشغيل الخادم
2. اذهب للإعدادات في التطبيق
3. اضغط "اختبار الاتصال الحقيقي"
4. إذا نجح، اضغط "إنشاء البيانات الحقيقية"

## الحالة الحالية

✅ **يعمل الآن**: نظام المحاكاة الكامل
⏳ **في انتظار**: المفاتيح الحقيقية من Google Cloud
🎯 **الهدف**: إنشاء البيانات الحقيقية في Google Sheets

## البيانات التي سيتم إنشاؤها

عند توفر المفاتيح، سيتم إنشاء:

### 📊 Investors (5 مستثمرين)
- INV001: أحمد محمد (25%)
- INV002: فاطمة علي (20%)  
- INV003: محمد عبد الله (30%)
- INV004: خديجة إبراهيم (15%)
- INV005: عمر حسن (10%)

### 💰 Expenses (5 مصاريف)
- مواد خام: 15,000 MRU
- رواتب: 25,000 MRU
- إيجار: 8,000 MRU
- كهرباء: 3,500 MRU
- نقل: 2,000 MRU

### 📈 Revenues (5 إيرادات)  
- مبيعات أساسية: 75,000 MRU
- خدمات استشارية: 45,000 MRU
- منتجات ثانوية: 30,000 MRU
- تأجير معدات: 20,000 MRU
- عمولات: 15,000 MRU

### 💸 Withdrawals (3 سحوبات)
- أحمد محمد: 5,000 MRU
- فاطمة علي: 3,000 MRU  
- محمد عبد الله: 8,000 MRU

### 👥 Users (4 مستخدمين)
- أحمد الإدارة (Admin)
- فاطمة المحاسبة (Assistant)
- محمد المستثمر (Investor)
- خديجة المستثمرة (Investor)

### ⚙️ Settings + Operations_Log
- إعدادات النظام (نسبة 15%)
- سجل العمليات التلقائي

---

💡 **ملاحظة**: يمكنك استخدام النظام كاملاً بنظام المحاكاة حالياً، وعندما تصبح المفاتيح جاهزة سيتم الربط التلقائي مع Google Sheets الحقيقي.
