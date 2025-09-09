# دليل النشر - نظام إدارة الاستثمار

## نظرة عامة على النشر

يمكن نشر تطبيق Zenith Oasis بعدة طرق حسب احتياجاتك:

1. **النشر المحلي**: للاختبار والتطوير
2. **النشر السحابي**: للإنتاج والاستخدام الفعلي
3. **النشر المختلط**: عميل سحابي + خادم محلي

## 1. النشر المحلي (للاختبار)

### المتطلبات
- Node.js 18+
- npm أو yarn
- Git

### خطوات التشغيل

```bash
# 1. تحميل المشروع
git clone [repository-url]
cd zenith-oasis

# 2. تثبيت التبعيات
npm install

# 3. إعداد متغيرات البيئة
cp .env.example .env
# تحرير ملف .env بالقيم الصحيحة

# 4. تشغيل التطبيق
npm run dev
```

### الوصول للتطبيق
- العميل: http://localhost:8080
- الخادم: http://localhost:3000
- API: http://localhost:3000/api

## 2. النشر على Netlify (العميل فقط)

### الإعداد المطلوب

1. **بناء العميل**:
```bash
npm run build:client
```

2. **رفع إلى Netlify**:
   - اذهب إلى [netlify.com](https://netlify.com)
   - اسحب مجلد `dist/spa` إلى Netlify
   - أو اربط مع GitHub للنشر التلقائي

3. **إعدادات البناء في Netlify**:
```
Build command: npm run build:client
Publish directory: dist/spa
```

4. **متغيرات البيئة في Netlify**:
```
VITE_SUPABASE_URL=https://jdaqprwsmkkgkzjmkbox.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### ملاحظات مهمة
- Netlify يدعم العميل فقط (Static Site)
- ستحتاج لخادم منفصل لـ API
- استخدم Netlify Functions للوظائف البسيطة

## 3. النشر على Vercel (التطبيق الكامل)

### الإعداد

1. **تثبيت Vercel CLI**:
```bash
npm i -g vercel
```

2. **إعداد ملف vercel.json**:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "client/**/*",
      "use": "@vercel/static"
    },
    {
      "src": "server/index.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server/index.ts"
    },
    {
      "src": "/(.*)",
      "dest": "/client/$1"
    }
  ]
}
```

3. **النشر**:
```bash
vercel --prod
```

## 4. النشر على Heroku

### الإعداد

1. **إنشاء ملف Procfile**:
```
web: npm start
```

2. **إعداد package.json**:
```json
{
  "scripts": {
    "start": "node dist/server/node-build.mjs",
    "build": "npm run build:client && npm run build:server",
    "heroku-postbuild": "npm run build"
  }
}
```

3. **النشر**:
```bash
# تسجيل الدخول لـ Heroku
heroku login

# إنشاء تطبيق جديد
heroku create zenith-oasis-app

# إضافة متغيرات البيئة
heroku config:set VITE_SUPABASE_URL=https://jdaqprwsmkkgkzjmkbox.supabase.co
heroku config:set VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# نشر التطبيق
git push heroku main
```

## 5. النشر على VPS (خادم خاص)

### متطلبات الخادم
- Ubuntu 20.04+ أو CentOS 8+
- Node.js 18+
- Nginx (للبروكسي)
- PM2 (لإدارة العمليات)
- SSL Certificate

### خطوات الإعداد

#### 1. إعداد الخادم
```bash
# تحديث النظام
sudo apt update && sudo apt upgrade -y

# تثبيت Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# تثبيت PM2
sudo npm install -g pm2

# تثبيت Nginx
sudo apt install nginx -y
```

#### 2. رفع التطبيق
```bash
# استنساخ المشروع
git clone [repository-url] /var/www/zenith-oasis
cd /var/www/zenith-oasis

# تثبيت التبعيات
npm install

# بناء التطبيق
npm run build:client
npm run build:server
```

#### 3. إعداد PM2
```bash
# إنشاء ملف ecosystem.config.js
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'zenith-oasis',
    script: 'dist/server/node-build.mjs',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
EOF

# تشغيل التطبيق
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### 4. إعداد Nginx
```bash
# إنشاء ملف إعداد Nginx
sudo cat > /etc/nginx/sites-available/zenith-oasis << EOF
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# تفعيل الموقع
sudo ln -s /etc/nginx/sites-available/zenith-oasis /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 5. إعداد SSL (Let's Encrypt)
```bash
# تثبيت Certbot
sudo apt install certbot python3-certbot-nginx -y

# الحصول على شهادة SSL
sudo certbot --nginx -d your-domain.com

# تجديد تلقائي
sudo crontab -e
# إضافة السطر التالي:
# 0 12 * * * /usr/bin/certbot renew --quiet
```

## 6. إعداد قاعدة البيانات (Supabase)

### معلومات الاتصال الحالية
```
URL: https://jdaqprwsmkkgkzjmkbox.supabase.co
Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkYXFwcndzbWtrZ2t6am1rYm94Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3Mzg2MDMsImV4cCI6MjA2OTMxNDYwM30.1NhbPHzwaFb61dJdT6n0EnsBZ1wlcjvIM8ReGA0q5Ek
```

### الجداول المطلوبة
التطبيق ينشئ الجداول تلقائياً عند التشغيل الأول:
- `users` - المستخدمين
- `investors` - المستثمرين
- `expenses` - المصاريف
- `revenues` - الإيرادات
- `withdrawals` - السحوبات
- `operations_log` - سجل العمليات
- `settings` - الإعدادات

## 7. مراقبة التطبيق

### استخدام PM2 للمراقبة
```bash
# عرض حالة التطبيقات
pm2 status

# عرض السجلات
pm2 logs zenith-oasis

# إعادة تشغيل
pm2 restart zenith-oasis

# مراقبة الأداء
pm2 monit
```

### مراقبة Nginx
```bash
# فحص حالة Nginx
sudo systemctl status nginx

# عرض سجلات الوصول
sudo tail -f /var/log/nginx/access.log

# عرض سجلات الأخطاء
sudo tail -f /var/log/nginx/error.log
```

## 8. النسخ الاحتياطي

### نسخ احتياطي لقاعدة البيانات
```bash
# تصدير البيانات من Supabase
# استخدم لوحة تحكم Supabase أو API
```

### نسخ احتياطي للملفات
```bash
# إنشاء نسخة احتياطية
tar -czf zenith-oasis-backup-$(date +%Y%m%d).tar.gz /var/www/zenith-oasis

# جدولة النسخ الاحتياطي
sudo crontab -e
# إضافة:
# 0 2 * * * tar -czf /backups/zenith-oasis-backup-$(date +\%Y\%m\%d).tar.gz /var/www/zenith-oasis
```

## 9. استكشاف أخطاء النشر

### مشاكل شائعة

#### 1. خطأ في بناء التطبيق
```bash
# فحص سجلات البناء
npm run build:client 2>&1 | tee build.log
npm run build:server 2>&1 | tee build-server.log
```

#### 2. خطأ في الاتصال بقاعدة البيانات
```bash
# فحص متغيرات البيئة
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY

# اختبار الاتصال
curl -H "apikey: $VITE_SUPABASE_ANON_KEY" $VITE_SUPABASE_URL/rest/v1/
```

#### 3. مشاكل الصلاحيات
```bash
# إصلاح صلاحيات الملفات
sudo chown -R www-data:www-data /var/www/zenith-oasis
sudo chmod -R 755 /var/www/zenith-oasis
```

## 10. تحديث التطبيق

### تحديث على الخادم
```bash
# الانتقال لمجلد التطبيق
cd /var/www/zenith-oasis

# سحب آخر التحديثات
git pull origin main

# تثبيت التبعيات الجديدة
npm install

# بناء التطبيق
npm run build:client
npm run build:server

# إعادة تشغيل التطبيق
pm2 restart zenith-oasis
```

### تحديث قاعدة البيانات
```bash
# تشغيل سكريبت التحديث (إذا وجد)
npm run migrate

# أو تشغيل التطبيق لتحديث الجداول تلقائياً
npm start
```

---

**ملاحظة**: تأكد من اختبار جميع الوظائف بعد النشر والتحقق من عمل جميع الصفحات والصلاحيات بشكل صحيح.

