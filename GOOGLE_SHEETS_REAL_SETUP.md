# دليل إعداد Google Sheets الحقيقي

هذا الدليل يوضح كيفية ربط التطبيق بـ Google Sheets الحقيقي باستخدام مفاتيح الخدمة.

## خطوات الإعداد

### 1. إنشاء مشروع في Google Cloud Console

1. اذهب إلى [Google Cloud Console](https://console.cloud.google.com/)
2. أنشئ مشروع جديد أو اختر مشروع موجود
3. فعّل Google Sheets API:
   - اذهب إلى "APIs & Services" > "Library"
   - ابحث عن "Google Sheets API"
   - اضغط "Enable"

### 2. إنشاء Service Account

1. اذهب إلى "APIs & Services" > "Credentials"
2. اضغط "Create Credentials" > "Service Account"
3. اطل إلى Service Account اسم مثل "sheets-service"
4. اضغط "Create and Continue"
5. اختر الدور "Editor" أو "Owner"
6. اضغط "Done"

### 3. إنشاء مفتاح JSON

1. اضغط على Service Account المنشأ
2. اذهب إلى تبويب "Keys"
3. اضغط "Add Key" > "Create New Key"
4. اختر نوع "JSON"
5. سيتم تحميل ملف JSON

### 4. إعداد المفاتيح في التطبيق

#### الطريقة الأولى: متغيرات البيئة
```bash
export GOOGLE_PROJECT_ID="your-project-id"
export GOOGLE_PRIVATE_KEY_ID="your-private-key-id"
export GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
export GOOGLE_CLIENT_EMAIL="your-service-account@your-project.iam.gserviceaccount.com"
export GOOGLE_CLIENT_ID="your-client-id"
```

#### الطريقة الثانية: ملف credentials.json
استبدل محتوى `server/credentials.json` بمحتوى الملف المحمل:

```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "your-private-key-id",
  "private_key": "-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n",
  "client_email": "your-service-account@your-project.iam.gserviceaccount.com",
  "client_id": "your-client-id",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/your-service-account%40your-project.iam.gserviceaccount.com"
}
```

### 5. مشاركة Google Sheet

1. افتح Google Sheet الذي تريد استخدامه (ID: 1qU6wQ7KN3LoU_1atvbxSDLshYXZZ_DixgCBDcAcTfJA)
2. اضغط "Share" في الركن الأيمن العلوي
3. أضف email الـ Service Account مع صلاحية "Editor"
4. اضغط "Send"

### 6. اختبار الاتصال

1. أعد تشغيل الخادم
2. اذهب إلى صفحة الإعدادات في التطبيق
3. اضغط "اختبار الاتصال"
4. إذا نجح الاختبار، اضغط "تهيئة البيانات التجريبية"

## البيانات التجريبية المنشأة

عند التهيئة، سيتم إنشاء الأوراق التالية:

### Investors
- 5 مستثمرين بنسب مختلفة
- معرفات مرتبة (INV001-INV005)
- بيانات الاستثمار والأرباح

### Expenses  
- 5 مصاريف بفئات مختلفة
- معرفات مرتبة (EXP001-EXP005)
- تواريخ وملاحظات

### Revenues
- 5 إيرادات بمصادر مختلفة
- معرفات مرتبة (REV001-REV005)
- وصف وتواريخ

### Withdrawals
- 3 سحوبات للمستثمرين
- معرفات مرتبة (WIT001-WIT003)
- تفاصيل الموافقة

### Users
- 4 مستخدمين بأدوار مختلفة
- معرفات مرتبة (USER001-USER004)
- Admin, Assistant, Investor roles

### Settings
- إعدادات التطبيق
- نسبة المشروع 15%
- إعدادات العملة والتحليل

### Operations_Log
- سجل العمليات
- تتبع جميع الأنشطة
- التوقيت والمسؤول

## الحالة الحالية

حالياً يعمل التطبيق بنظام محاكاة يعرض:
- ✅ اختبار الاتصال ناجح
- ✅ عرض البيانات التجريبية
- ✅ واجهة مستخدم كاملة
- ⏳ في انتظار المفاتيح الحقيقية للربط الفعلي

عند توفير المفاتيح الحقيقية، سيتم الربط التلقائي مع Google Sheets الفعلي.
