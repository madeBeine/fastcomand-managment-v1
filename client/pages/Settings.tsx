import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Settings as SettingsIcon,
  Save,
  DollarSign,
  Calculator,
  Building2,
  Percent,
  Plus,
  Trash2,
  Loader2,
  Shield,
  Bell,
  Palette,
  Clock,
  FileText,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface PercentageAllocation {
  id: string;
  name: string;
  percentage: number;
  description?: string;
}

interface AppSettings {
  // الإعدادات المالية
  projectPercentage: number;
  currency: string;
  customAllocations: PercentageAllocation[];
  
  // معلومات الشركة
  companyName: string;
  companyPhone: string;
  companyEmail: string;
  companyAddress: string;
  
  // الإعدادات العامة
  autoBackup: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  sessionTimeout: number;
  dataRetentionDays: number;
  
  // الإشعارات
  emailNotifications: boolean;
  smsNotifications: boolean;
  emailForReports: string;
  
  // المظهر والواجهة
  theme: 'light' | 'dark' | 'auto';
  language: 'ar' | 'en';
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
}

export default function Settings() {
  const { user, permissions } = useAuth();
  const [settings, setSettings] = useState<AppSettings>({
    // الإعدادات المالية
    projectPercentage: 15,
    currency: 'MRU',
    customAllocations: [],
    
    // معلومات الشركة
    companyName: 'Fast Command',
    companyPhone: '',
    companyEmail: '',
    companyAddress: '',
    
    // الإعدادات العامة
    autoBackup: true,
    backupFrequency: 'daily',
    sessionTimeout: 30,
    dataRetentionDays: 365,
    
    // الإشعارات
    emailNotifications: true,
    smsNotifications: false,
    emailForReports: '',
    
    // المظهر والواجهة
    theme: 'light',
    language: 'ar',
    dateFormat: 'DD/MM/YYYY'
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [newAllocationName, setNewAllocationName] = useState('');
  const [newAllocationPercentage, setNewAllocationPercentage] = useState(0);
  const [newAllocationDescription, setNewAllocationDescription] = useState('');
  
  // Calculate percentage distributions
  const totalCustomAllocations = settings.customAllocations.reduce((sum, allocation) => sum + allocation.percentage, 0);
  const remainingProjectPercentage = Math.max(0, settings.projectPercentage - totalCustomAllocations);
  const totalAllocatedPercentage = totalCustomAllocations + remainingProjectPercentage;
  const investorsPercentage = 100 - totalAllocatedPercentage;

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await window.fetch('/api/settings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSettings(prev => ({ ...prev, ...data.data }));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await window.fetch('/api/settings/save', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        setMessage('تم حفظ الإعدادات بنجاح');
        setTimeout(() => setMessage(''), 3000);
      } else {
        throw new Error('فشل في حفظ الإعدادات');
      }
    } catch (error) {
      setMessage('حدث خطأ في حفظ الإعدادات');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = (key: keyof AppSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const addCustomAllocation = () => {
    if (!newAllocationName.trim() || newAllocationPercentage <= 0) {
      setMessage('يرجى إدخال اسم صحيح ونسبة أكبر من الصفر');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    if (newAllocationPercentage > remainingProjectPercentage) {
      setMessage(`لا يمكن إضافة نسبة أكبر من ${remainingProjectPercentage}% (المتبقي من نسبة المشروع)`);
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    const newAllocation: PercentageAllocation = {
      id: Date.now().toString(),
      name: newAllocationName.trim(),
      percentage: newAllocationPercentage,
      description: newAllocationDescription.trim()
    };

    setSettings(prev => ({
      ...prev,
      customAllocations: [...prev.customAllocations, newAllocation]
    }));

    setNewAllocationName('');
    setNewAllocationPercentage(0);
    setNewAllocationDescription('');
    setMessage('');
  };

  const removeCustomAllocation = (id: string) => {
    setSettings(prev => ({
      ...prev,
      customAllocations: prev.customAllocations.filter(allocation => allocation.id !== id)
    }));
  };

  const updateCustomAllocation = (id: string, field: 'name' | 'percentage' | 'description', value: string | number) => {
    setSettings(prev => ({
      ...prev,
      customAllocations: prev.customAllocations.map(allocation =>
        allocation.id === id ? { ...allocation, [field]: value } : allocation
      )
    }));
  };

  if (!permissions?.canViewSettings) {
    return (
      <div className="p-6">
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-red-700">
            ليس لديك صلاحية لعرض الإعدادات
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <SettingsIcon className="h-8 w-8 text-investment-primary-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إعدادات النظام</h1>
          <p className="text-gray-600">إدارة إعدادات التطبيق والشركة</p>
        </div>
      </div>

      {/* Message Alert */}
      {message && (
        <Alert className={message.includes('خطأ') ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}>
          {message.includes('خطأ') ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
          <AlertDescription className={message.includes('خطأ') ? "text-red-700" : "text-green-700"}>
            {message}
          </AlertDescription>
        </Alert>
      )}

      {/* Company Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            معلومات الشركة
          </CardTitle>
          <CardDescription>
            البيانات الأساسية للشركة
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="companyName">اسم الشركة</Label>
              <Input
                id="companyName"
                value={settings.companyName}
                onChange={(e) => updateSetting('companyName', e.target.value)}
                placeholder="اسم الشركة"
              />
            </div>
            
            <div>
              <Label htmlFor="companyPhone">رقم الهاتف</Label>
              <Input
                id="companyPhone"
                value={settings.companyPhone}
                onChange={(e) => updateSetting('companyPhone', e.target.value)}
                placeholder="+222 xxxxxxxx"
              />
            </div>
            
            <div>
              <Label htmlFor="companyEmail">البريد الإلكتروني</Label>
              <Input
                id="companyEmail"
                type="email"
                value={settings.companyEmail}
                onChange={(e) => updateSetting('companyEmail', e.target.value)}
                placeholder="info@company.com"
              />
            </div>

            <div>
              <Label htmlFor="companyAddress">العنوان</Label>
              <Input
                id="companyAddress"
                value={settings.companyAddress}
                onChange={(e) => updateSetting('companyAddress', e.target.value)}
                placeholder="عنوان الشركة"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            الإعدادات المالية
          </CardTitle>
          <CardDescription>
            إعدادات العملة وتوزيع النسب المالية
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Currency and Base Project Percentage */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="projectPercentage">النسبة الأساسية للمشروع (%)</Label>
              <div className="flex items-center gap-2">
                <Calculator className="h-4 w-4 text-gray-500" />
                <Input
                  id="projectPercentage"
                  type="number"
                  min="0"
                  max="100"
                  value={settings.projectPercentage}
                  onChange={(e) => updateSetting('projectPercentage', Number(e.target.value))}
                />
              </div>
              <p className="text-xs text-gray-600 mt-1">
                النسبة الأساسية للمشروع من الأرباح
              </p>
            </div>
            
            <div>
              <Label htmlFor="currency">العملة</Label>
              <Select value={settings.currency} onValueChange={(value) => updateSetting('currency', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MRU">أوقية موريتانية (MRU)</SelectItem>
                  <SelectItem value="USD">دولار أمريكي (USD)</SelectItem>
                  <SelectItem value="EUR">يورو (EUR)</SelectItem>
                  <SelectItem value="SAR">ريال سعودي (SAR)</SelectItem>
                  <SelectItem value="AED">درهم إماراتي (AED)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Percentage Distribution Summary */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Percent className="h-4 w-4" />
              ملخص توزيع النسب
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-white p-3 rounded border">
                <div className="text-blue-600 font-bold text-lg">{remainingProjectPercentage}%</div>
                <div className="text-gray-600">المشروع (صافي)</div>
              </div>
              <div className="bg-white p-3 rounded border">
                <div className="text-purple-600 font-bold text-lg">{totalCustomAllocations}%</div>
                <div className="text-gray-600">التخصيصات الإضافية</div>
              </div>
              <div className="bg-white p-3 rounded border">
                <div className="text-green-600 font-bold text-lg">{investorsPercentage}%</div>
                <div className="text-gray-600">المستثمرون</div>
              </div>
            </div>
          </div>

          {/* Custom Allocations Management */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Plus className="h-4 w-4" />
              التخصيصات الإضافية (تبرعات، رسوم، إلخ)
            </h3>

            {/* Add New Allocation */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <Label className="text-sm font-medium mb-3 block">إضافة تخصيص جديد</Label>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <Input
                  placeholder="اسم التخصيص (مثل: تبرعات)"
                  value={newAllocationName}
                  onChange={(e) => setNewAllocationName(e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="النسبة %"
                  min="0"
                  max={remainingProjectPercentage}
                  value={newAllocationPercentage}
                  onChange={(e) => setNewAllocationPercentage(Number(e.target.value))}
                />
                <Input
                  placeholder="وصف (اختياري)"
                  value={newAllocationDescription}
                  onChange={(e) => setNewAllocationDescription(e.target.value)}
                />
                <Button onClick={addCustomAllocation} size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  إضافة
                </Button>
              </div>
            </div>

            {/* Custom Allocations List */}
            {settings.customAllocations.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">التخصيصات الحالية:</Label>
                {settings.customAllocations.map((allocation) => (
                  <div key={allocation.id} className="flex items-center gap-3 p-3 bg-white border rounded-lg">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
                      <Input
                        value={allocation.name}
                        onChange={(e) => updateCustomAllocation(allocation.id, 'name', e.target.value)}
                        className="font-medium"
                      />
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={allocation.percentage}
                          onChange={(e) => updateCustomAllocation(allocation.id, 'percentage', Number(e.target.value))}
                          min="0"
                          max={remainingProjectPercentage + allocation.percentage}
                        />
                        <span className="text-sm text-gray-500">%</span>
                      </div>
                      <Input
                        value={allocation.description || ''}
                        onChange={(e) => updateCustomAllocation(allocation.id, 'description', e.target.value)}
                        placeholder="وصف"
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeCustomAllocation(allocation.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {totalAllocatedPercentage > 100 && (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-red-700">
                  تحذير: مجموع النسب ({totalAllocatedPercentage}%) يتجاوز 100%. يرجى تعديل النسب.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* System Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            الإعدادات العامة
          </CardTitle>
          <CardDescription>
            إعدادات النظام وا��أمان
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>النسخ الاحتياطي التلقائي</Label>
                  <p className="text-xs text-gray-600">
                    إنشاء نسخة احتياطية تلقائياً
                  </p>
                </div>
                <Switch
                  checked={settings.autoBackup}
                  onCheckedChange={(checked) => updateSetting('autoBackup', checked)}
                />
              </div>

              {settings.autoBackup && (
                <div>
                  <Label htmlFor="backupFrequency">تكرار النسخ الاحتياطي</Label>
                  <Select value={settings.backupFrequency} onValueChange={(value) => updateSetting('backupFrequency', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">يومياً</SelectItem>
                      <SelectItem value="weekly">أسبوعياً</SelectItem>
                      <SelectItem value="monthly">شهرياً</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="sessionTimeout">انتهاء الجلسة (دقيقة)</Label>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <Input
                    id="sessionTimeout"
                    type="number"
                    min="5"
                    max="1440"
                    value={settings.sessionTimeout}
                    onChange={(e) => updateSetting('sessionTimeout', Number(e.target.value))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="dataRetentionDays">الاحتفاظ بالبيانات (يوم)</Label>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <Input
                    id="dataRetentionDays"
                    type="number"
                    min="30"
                    max="3650"
                    value={settings.dataRetentionDays}
                    onChange={(e) => updateSetting('dataRetentionDays', Number(e.target.value))}
                  />
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  مدة الاحتفاظ بالبيانات قبل حذفها تلقائياً
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            إعدادات الإشعارات
          </CardTitle>
          <CardDescription>
            تفعيل الإشعارات والتقارير
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>إشعارات البريد الإلكتروني</Label>
                  <p className="text-xs text-gray-600">
                    استلام تحديثات مهمة عبر البريد الإلكتروني
                  </p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>إشعارات الرسائل النصية</Label>
                  <p className="text-xs text-gray-600">
                    استلام تنبيهات عاجلة عبر الرسائل النصية
                  </p>
                </div>
                <Switch
                  checked={settings.smsNotifications}
                  onCheckedChange={(checked) => updateSetting('smsNotifications', checked)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="emailForReports">البريد الإلكتروني للتقارير</Label>
              <Input
                id="emailForReports"
                type="email"
                value={settings.emailForReports}
                onChange={(e) => updateSetting('emailForReports', e.target.value)}
                placeholder="reports@company.com"
              />
              <p className="text-xs text-gray-600 mt-1">
                البريد الإلكتروني لإرسال التقارير الدورية
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interface Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            إعدادات الواجهة
          </CardTitle>
          <CardDescription>
            تخصيص مظهر ولغة التطبيق
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="theme">المظهر</Label>
              <Select value={settings.theme} onValueChange={(value) => updateSetting('theme', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">فاتح</SelectItem>
                  <SelectItem value="dark">داكن</SelectItem>
                  <SelectItem value="auto">تلقائي</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="language">اللغة</Label>
              <Select value={settings.language} onValueChange={(value) => updateSetting('language', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ar">العربية</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="dateFormat">تنسيق التاريخ</Label>
              <Select value={settings.dateFormat} onValueChange={(value) => updateSetting('dateFormat', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Card>
        <CardContent className="pt-6">
          <Button 
            onClick={handleSave} 
            disabled={loading || totalAllocatedPercentage > 100}
            className="w-full md:w-auto"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                حفظ جميع الإعدادات
              </>
            )}
          </Button>
          <p className="text-xs text-gray-600 mt-2">
            سيتم تطبيق الإعدادات الجديدة فوراً على جميع العمليات المالية
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
