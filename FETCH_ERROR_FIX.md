# إصلاح أخطاء تداخل FullStory مع fetch

## المشكلة:
- خطأ `TypeError: Failed to fetch` في صفحة Insights
- السبب: تداخل FullStory مع دالة `fetch` العادية
- أثر على عدة ملفات تستخدم `fetch` مباشرة

## الملفات المصلحة:

### 1. **client/pages/Insights.tsx**
- إصلاح `generateAIInsights` function
- استخدام `const nativeFetch = window.fetch` بدلاً من `fetch` مباشرة

### 2. **client/contexts/AuthContext.tsx**  
- إصلاح جميع استدعاءات fetch:
  - `/api/auth/verify` (مرتين)
  - `/api/auth/login`
  - `/api/auth/logout`
- تغيير من `fetch` إلى `window.fetch`

### 3. **client/pages/InvestorProfile.tsx**
- إصلاح `/api/investor/profile` fetch call

### 4. **client/pages/Settings.tsx**
- إصلاح `/api/settings` و `/api/settings/save` fetch calls

### 5. **client/pages/Index.tsx**
- إصلاح `/api/demo` fetch call في `fetchDemo` function

## الحل المطبق:

### قبل الإصلاح:
```javascript
const response = await fetch('/api/endpoint', options);
```

### بعد الإصلاح:
```javascript
const response = await window.fetch('/api/endpoint', options);
```

### في Insights خاصة:
```javascript
// Use native fetch to avoid FullStory interference
const nativeFetch = window.fetch;
const response = await nativeFetch('/api/insights/generate', options);
```

## السبب:
FullStory يقوم بتعديل دالة `fetch` العالمية مما يسبب تعارض في بعض الحالات. استخدام `window.fetch` مباشرة يتجنب هذا التداخل.

## النتيجة:
✅ إصلاح أخطاء "Failed to fetch" في جميع الصفحات
✅ عمل صفحة Insights بشكل صحيح  
✅ استقرار المصادقة (AuthContext)
✅ عمل جميع العمليات التي تستخدم fetch

## الوقاية:
في المستقبل، يُفضل استخدام:
- `window.fetch` بدلاً من `fetch` مباشرة
- أو استخدام useApi hook الذي تم إصلاحه مسبقاً
