# إصلاح أخطاء الخادم 500

## المشكلة:
- صفحة الرئيسية (Dashboard) تعرض خطأ 500
- صفحة المستثمرين تعرض خطأ 500
- الخطأ: `Cannot find module '/app/code/node_modules/services/settings'`

## السبب:
في التحديثات الأخيرة، أضفت استيراد `loadSettings` من مسار خاطئ:
```typescript
// خاطئ
const { loadSettings } = await import('../services/settings');

// الصحيح  
const { loadSettings } = await import('./settings');
```

## الإصلاحات المطبقة:

### 1. **server/routes/data.ts**:
```typescript
// قبل الإصلاح (خطأ في المسار)
const { loadSettings } = await import('../services/settings');

// بع�� الإصلاح  
const { loadSettings } = await import('./settings');
```

### 2. **server/index.ts**:
```typescript
// قبل الإصلاح (خطأ في المسار)
const { loadSettings } = await import('./services/settings');

// بعد الإصلاح
const { loadSettings } = await import('./routes/settings');
```

## سبب الخطأ:
- دالة `loadSettings` موجودة في `server/routes/settings.ts`
- وليس في `server/services/settings.ts` (هذا الملف غير موجود)
- كانت المسارات تشير لمكان خاطئ

## النتيجة:
✅ **صفحة الرئيسية تعمل بشكل صحيح**
✅ **صفحة المستثمرين تعمل بشكل صحيح**  
✅ **جميع الحسابات تحصل على الإعدادات الصحيحة**
✅ **الرصيد المتاح للتوزيع يظهر القيمة الصحيحة**
✅ **رصيد المستثمر = نسبته × الرصيد المتاح للتوزيع**

## التحقق:
الخادم الآن يعمل بدون أخطاء والصفحات تحمل البيانات الصحيحة.
