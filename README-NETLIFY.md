# نظام إدارة الاستثمار - جاهز للنشر على Netlify

## معلومات مهمة

هذا التطبيق تم تحديثه ليعمل مع **Supabase فقط** كقاعدة بيانات. تم إزالة جميع الملفات والاعتمادات المتعلقة بـ Google Sheets.

## بيانات تسجيل الدخول

- **رقم الهاتف:** 32768057
- **كلمة المرور:** 27562254

## إعدادات Supabase

التطبيق مُعد للعمل مع قاعدة البيانات التالية:

- **Project URL:** https://jdaqprwsmkkgkzjmkbox.supabase.co
- **Anon Key:** eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkYXFwcndzbWtrZ2t6am1rYm94Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3Mzg2MDMsImV4cCI6MjA2OTMxNDYwM30.1NhbPHzwaFb61dJdT6n0EnsBZ1wlcjvIM8ReGA0q5Ek

## خطوات النشر على Netlify

### الطريقة الأولى: رفع مجلد dist/spa مباشرة

1. اذهب إلى [Netlify](https://netlify.com)
2. قم بتسجيل الدخول أو إنشاء حساب جديد
3. اضغط على "Add new site" > "Deploy manually"
4. ارفع مجلد `dist/spa` فقط (وليس المشروع كاملاً)
5. انتظر حتى يكتمل النشر

### الطريقة الثانية: ربط مع Git Repository

1. ارفع المشروع إلى GitHub/GitLab
2. في Netlify، اضغط على "Add new site" > "Import from Git"
3. اختر المستودع الخاص بك
4. استخدم الإعدادات التالية:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist/spa`
   - **Node version:** 20

### متغيرات البيئة المطلوبة

في إعدادات Netlify، أضف المتغيرات التالية:

```
SUPABASE_URL=https://jdaqprwsmkkgkzjmkbox.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkYXFwcndzbWtrZ2t6am1rYm94Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3Mzg2MDMsImV4cCI6MjA2OTMxNDYwM30.1NhbPHzwaFb61dJdT6n0EnsBZ1wlcjvIM8ReGA0q5Ek
```

## ملاحظات مهمة

1. **تم إزالة Google Sheets:** لا يوجد أي اعتماد على Google Sheets في هذا الإصدار
2. **قاعدة البيانات:** يعتمد التطبيق بالكامل على Supabase
3. **المصادقة:** تتم المصادقة عبر قاعدة بيانات Supabase
4. **الملفات المحذوفة:** تم حذف جميع الملفات المتعلقة بـ Google Sheets

## هيكل المشروع

```
├── client/          # ملفات الواجهة الأمامية (React)
├── server/          # ملفات الخادم (Express)
├── shared/          # الملفات المشتركة
├── dist/            # الملفات المبنية للإنتاج
│   ├── spa/         # الواجهة الأمامية المبنية (للنشر على Netlify)
│   └── server/      # الخادم المبني
└── package.json     # اعتمادات المشروع
```

## الدعم الفني

في حالة وجود أي مشاكل، تواصل مع المطور على الرقم: 32768057

