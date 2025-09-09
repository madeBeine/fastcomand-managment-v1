# نظام إدارة الاستثمار - Zenith Oasis

## نظرة عامة

نظام إدارة الاستثمار هو تطبيق ويب شامل مصمم لإدارة المستثمرين والمصاريف والإيرادات والسحوبات. يوفر النظام واجهة سهلة الاستخدام مع نظام صلاحيات متقدم وتسجيل شامل للعمليات.

## المميزات الرئيسية

### 🔐 نظام المصادقة والصلاحيات
- تسجيل دخول آمن للمستخدمين
- ثلاثة أنواع من الصلاحيات:
  - **المدير**: صلاحيات كاملة لجميع العمليات
  - **المساعد**: صلاحيات محدودة للعمليات اليومية
  - **المستثمر**: عرض البيانات الخاصة فقط

### 📊 إدارة البيانات
- إدارة المستثمرين مع حساب الأرباح التلقائي
- تتبع المصاريف والإيرادات
- إدارة سحوبات المستثمرين والمشروع
- لوحة تحكم تفاعلية مع الإحصائيات

### 📝 تسجيل العمليات
- سجل شامل لجميع العمليات في النظام
- تتبع من قام بكل عملية ومتى
- فلترة وبحث متقدم في السجل

### 🎨 واجهة المستخدم
- تصميم عصري ومتجاوب
- دعم كامل للغة العربية
- ألوان وهوية موحدة

## متطلبات النظام

### البرمجيات المطلوبة
- Node.js (الإصدار 18 أو أحدث)
- npm أو yarn
- Git

### قاعدة البيانات
- Supabase (قاعدة بيانات سحابية)

## إعداد التطبيق محلياً

### 1. تحميل المشروع

```bash
# استنساخ المشروع من GitHub
git clone [رابط المستودع]
cd zenith-oasis

# أو فك ضغط الملف المضغوط
unzip zenith-oasis-supabase-only-netlify-ready.zip
cd zenith-oasis-netlify-ready
```

### 2. تثبيت التبعيات

```bash
# تثبيت جميع التبعيات المطلوبة
npm install
```

### 3. إعداد متغيرات البيئة

قم بإنشاء ملف `.env` في المجلد الجذر وأضف المتغيرات التالية:

```env
# إعدادات Supabase
VITE_SUPABASE_URL=https://jdaqprwsmkkgkzjmkbox.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkYXFwcndzbWtrZ2t6am1rYm94Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3Mzg2MDMsImV4cCI6MjA2OTMxNDYwM30.1NhbPHzwaFb61dJdT6n0EnsBZ1wlcjvIM8ReGA0q5Ek

# إعدادات الخادم
PORT=3000
JWT_SECRET=your-secret-key-here
```

### 4. تشغيل التطبيق

#### تشغيل في وضع التطوير

```bash
# تشغيل العميل والخادم معاً
npm run dev

# أو تشغيلهما منفصلين
npm run dev:client  # العميل على المنفذ 8080
npm run dev:server  # الخادم على المنفذ 3000
```

#### بناء التطبيق للإنتاج

```bash
# بناء العميل
npm run build:client

# بناء الخادم
npm run build:server

# تشغيل الإنتاج
npm start
```

### 5. الوصول للتطبيق

- **وضع التطوير**: http://localhost:8080
- **وضع الإنتاج**: http://localhost:3000

## بيانات تسجيل الدخول الافتراضية

### حساب المدير
- **اسم المستخدم**: made beine
- **كلمة المرور**: 27562254
- **الصلاحيات**: مدير (صلاحيات كاملة)

### حسابات أخرى
- **المساعد**: jouma / 33445566
- **المستثمر**: doudou / 22334455

## هيكل المشروع

```
zenith-oasis/
├── client/                 # تطبيق React (العميل)
│   ├── components/         # مكونات React
│   ├── pages/             # صفحات التطبيق
│   ├── hooks/             # React Hooks مخصصة
│   ├── contexts/          # React Contexts
│   └── lib/               # مكتبات مساعدة
├── server/                # خادم Express.js
│   ├── routes/            # مسارات API
│   ├── services/          # خدمات قاعدة البيانات
│   └── middleware/        # وسطاء Express
├── shared/                # أنواع وواجهات مشتركة
├── dist/                  # ملفات البناء
└── docs/                  # التوثيق
```

## إعداد GitHub

### 1. إنشاء مستودع جديد

```bash
# إنشاء مستودع Git محلي
git init

# إضافة جميع الملفات
git add .

# إنشاء أول commit
git commit -m "Initial commit: Zenith Oasis Investment Management System"

# ربط بمستودع GitHub
git remote add origin https://github.com/[اسم-المستخدم]/zenith-oasis.git

# رفع الكود
git push -u origin main
```

### 2. إعداد GitHub Actions (اختياري)

قم بإنشاء ملف `.github/workflows/deploy.yml` للنشر التلقائي:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm install
      
    - name: Build application
      run: |
        npm run build:client
        npm run build:server
        
    - name: Deploy to server
      # إضافة خطوات النشر حسب الخادم المستخدم
```

## النشر على الإنتاج

### خيارات النشر المتاحة

1. **Netlify** (للعميل فقط)
2. **Vercel** (للتطبيق الكامل)
3. **Heroku** (للتطبيق الكامل)
4. **VPS خاص** (للتطبيق الكامل)

### نشر على Netlify

```bash
# بناء العميل
npm run build:client

# رفع مجلد dist/spa إلى Netlify
```

### نشر على Vercel

```bash
# تثبيت Vercel CLI
npm i -g vercel

# نشر التطبيق
vercel --prod
```

## استكشاف الأخطاء

### مشاكل شائعة وحلولها

#### 1. خطأ في الاتصال بقاعدة البيانات
```
Error: Failed to connect to Supabase
```
**الحل**: تحقق من صحة متغيرات البيئة VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY

#### 2. خطأ في تسجيل الدخول
```
Error: Invalid credentials
```
**الحل**: تأكد من استخدام بيانات تسجيل الدخول الصحيحة المذكورة أعلاه

#### 3. صفحة فارغة أو خطأ في التحميل
```
Error: Cannot GET /
```
**الحل**: تأكد من تشغيل كل من العميل والخادم، وتحقق من المنافذ المستخدمة

### سجلات الأخطاء

- **سجل العميل**: متاح في وحدة تحكم المتصفح (F12)
- **سجل الخادم**: متاح في terminal حيث يعمل الخادم

## الدعم والمساعدة

### معلومات الاتصال
- **المطور**: [اسم المطور]
- **البريد الإلكتروني**: [البريد الإلكتروني]
- **الهاتف**: [رقم الهاتف]

### الإبلاغ عن الأخطاء
يرجى إنشاء issue جديد في GitHub مع تفاصيل المشكلة وخطوات إعادة إنتاجها.

## الترخيص

هذا المشروع محمي بحقوق الطبع والنشر. جميع الحقوق محفوظة.

---

**آخر تحديث**: 31 يوليو 2025
**الإصدار**: 1.0.0

"# fastcomand-managment" 
