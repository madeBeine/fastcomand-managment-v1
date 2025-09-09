# إعداد Google Sheets API

## 1. إنشاء مشروع Google Cloud

1. اذهب إلى [Google Cloud Console](https://console.cloud.google.com/)
2. أنشئ مشروعاً جديداً أو استخدم مشروعاً موجوداً
3. فعّل Google Sheets API:
   - اذهب إلى "APIs & Services" > "Library"
   - ابحث عن "Google Sheets API"
   - اضغط على "Enable"

## 2. إنشاء Service Account

1. اذهب إلى "APIs & Services" > "Credentials"
2. اضغط على "Create Credentials" > "Service Account"
3. أدخل اسم الحساب واختر دوراً (Editor أو Owner)
4. اضغط على "Done"

## 3. إنشاء مفتاح للـ Service Account

1. اضغط على Service Account الذي أنشأته
2. اذهب إلى تبويب "Keys"
3. اضغط على "Add Key" > "Create new key"
4. اختر نوع "JSON" واضغط "Create"
5. سيتم تحميل ملف credentials.json

## 4. إعداد التطبيق

### الطريقة الأولى: ملف Credentials
1. انسخ ملف `credentials.json` إلى مجلد `server/`
2. **تأكد من عدم رفعه إلى Git!** (يجب إضافته في .gitignore)

### الطريقة الثانية: متغيرات البيئة (موصى بها للإنتاج)
أضف هذه المتغيرات في ملف `.env`:

```
GOOGLE_PROJECT_ID=your-project-id
GOOGLE_PRIVATE_KEY_ID=your-private-key-id
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
GOOGLE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_CLIENT_ID=your-client-id
```

## 5. إنشاء Google Sheet وإعداد الصلاحيات

1. أنشئ Google Sheet جديداً أو استخدم الموجود
2. انسخ الـ Sheet ID من الرابط:
   `https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit`
3. شارك الـ Sheet مع Service Account email (الموجود في credentials.json)
4. أعط صلاحية "Editor" للـ Service Account

## 6. تحديث معرف الـ Sheet

في ملف `server/routes/sheets.ts`, حدث متغير `SHEET_ID`:

```typescript
const SHEET_ID = 'YOUR_ACTUAL_SHEET_ID_HERE';
```

## 7. اختبار الاتصال

1. شغّل التطبيق
2. سجل دخول كمدير
3. اذهب إلى صفحة الإعدادات
4. اضغط على "اختبار الاتصال"
5. إذا نجح، يمكنك الضغط على "تهيئة البيانات التجريبية"

## الأوراق المطلوبة في Google Sheet

سيتم إنشاء هذه الأوراق تلقائياً:

- **Investors**: بيانات المستثمرين
- **Expenses**: المصاريف  
- **Revenues**: الإيرادات
- **Withdrawals**: السحوبات
- **Operations_Log**: سجل العمليات
- **Settings**: إعدادات النظام
- **Users**: المستخدمين

## نصائح أمنية

⚠️ **مهم جداً:**
- لا ترفع ملف `credentials.json` إلى Git أبداً
- استخدم متغيرات البيئة في الإنتاج
- أعط أقل صلاحيات ممكنة للـ Service Account
- راجع صلاحيات الـ Sheet بانتظام

## استكشاف الأخطاء

### "No credentials found, using mock data"
- تأكد من وجود ملف credentials.json أو متغيرات البيئة

### "Failed to initialize Google Sheets service"
- تأكد من صحة بيانات credentials
- تأكد من تفعيل Google Sheets API

### "The caller does not have permission"
- تأكد من مشاركة الـ Sheet مع Service Account email
- تأكد من إعطاء صلاحية Editor أو Owner
