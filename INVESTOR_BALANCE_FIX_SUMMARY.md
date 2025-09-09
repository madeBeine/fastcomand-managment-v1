# إصلاح شامل لحسابات رصيد المستثمر

## المشاكل التي تم حلها:

### 1. **الرصيد المتاح للتوزيع يظهر 0 في صفحة المستثمرين**
**السبب**: `getInvestorsWithEffectiveProfits()` لم تكن تحصل على الإعدادات الصحيحة

**الحل**:
- إضافة `loadSettings()` في `/api/investors` endpoint
- تمرير `currentSettings` إلى `getInvestorsWithEffectiveProfits()`

### 2. **رصيد المستثمر لا يساوي نسبته من الرصيد المتاح**
**السبب**: كان يُحسب كـ `totalProfit - totalWithdrawn` بدلاً من النسبة الصحيحة

**الحل**:
- **صفحة المستثمرين**: استخدام `investor.expectedEffectiveProfit`
- **Dashboard**: استخدام `investor.expectedEffectiveProfit`
- **InvestorProfile**: استخدام `investor.expectedEffectiveProfit`

### 3. **عدم تناسق البيانات بين الـ endpoints**
**السبب**: بعض endpoints تستخدم `getInvestors()` والأخرى `getInvestorsWithEffectiveProfits()`

**الحل**:
- `/api/dashboard` ← الآن يستخدم `getInvestorsWithEffectiveProfits()`
- `/api/investors` ← يستخدم `getInvestorsWithEffectiveProfits()` مع settings
- `/api/investor/profile` ← الآن يستخدم `getInvestorsWithEffectiveProfits()`

## الحساب الصحيح للرصيد:

### في الخادم:
```typescript
// في getInvestorsWithEffectiveProfits()
const effectiveSharePercentage = (investor.sharePercentage / totalOriginalShares) * stats.investorsPercentage;
const expectedEffectiveProfit = (stats.availableBalance * effectiveSharePercentage) / 100;
```

### في العميل:
```typescript
// رصيد المستثمر = نسبته من الرصيد المتاح للتوزيع
<Number value={investor.expectedEffectiveProfit || 0} currency />
```

## مثال حسابي:
- الرصيد المتاح للتوزيع: 850 MRU
- نسبة المستثمر: 15%
- رصيد المستثمر = 850 × 15% = 127.5 MRU

## النتيجة:
✅ **رصيد المستثمر = نسبته × الرصيد المتاح للتوزيع**
✅ **جميع الصفحات تعرض نفس القيم**
✅ **الحسابات متناسقة عبر جميع endpoints**
✅ **الرصيد المتاح للتوزيع متطابق في جميع الصفحات**
