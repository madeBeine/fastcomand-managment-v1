import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Number } from '@/components/ui/number';
import { useApi, useApiMutation } from '@/hooks/useApi';
import {
  Users,
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  Loader2,
  DollarSign,
  Percent,
  Phone,
  User,
  CreditCard,
  Building,
  Calculator
} from 'lucide-react';
import { Investor } from '../../shared/types';
import LoadingScreen from '@/components/LoadingScreen';

interface InvestorFormData {
  name: string;
  phone: string;
  nationalId?: string;
  bankTransferNumber?: string;
  sharePercentage: number;
  totalInvested: number;
}

const initialFormData: InvestorFormData = {
  name: '',
  phone: '',
  nationalId: '',
  bankTransferNumber: '',
  sharePercentage: 0,
  totalInvested: 0,
};

export default function Investors() {
  const { permissions } = useAuth();
  const { data: investors, loading, error, refetch } = useApi<Investor[]>('/investors?includeEffective=true');
  const { data: settings } = useApi<any>('/settings');
  const { data: dashboardStats } = useApi<any>('/dashboard');
  const addMutation = useApiMutation('/investors');
  const updateMutation = useApiMutation('/investors');
  const deleteMutation = useApiMutation('/investors');

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingInvestor, setEditingInvestor] = useState<Investor | null>(null);
  const [formData, setFormData] = useState<InvestorFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<string | null>(null);

  // Calculate totals
  const totalInvestment = investors?.reduce((sum, inv) => sum + inv.totalInvested, 0) || 0;
  const totalShares = investors?.reduce((sum, inv) => sum + inv.sharePercentage, 0) || 0;
  const investorsTotalProfit = investors?.reduce((sum, inv) => sum + (inv.totalProfit || 0), 0) || 0;

  // Use dashboard stats for project-wide calculations
  const totalProfit = dashboardStats?.totalProfit || 0; // صافي الربح
  const totalWithdrawn = dashboardStats?.totalWithdrawals || 0;
  const availableBalance = dashboardStats?.availableBalance || 0;
  const projectBalance = dashboardStats?.projectBalance || 0;

  // Calculate distribution percentages - ensure total is exactly 100%
  const projectPercentage = settings?.projectPercentage || 15;
  const customAllocations = settings?.customAllocations || [];
  const totalCustomAllocations = customAllocations.reduce((sum: number, allocation: any) => sum + allocation.percentage, 0);
  const totalAllocatedPercentage = projectPercentage + totalCustomAllocations;
  const investorsPercentage = Math.max(0, 100 - totalAllocatedPercentage);

  // Function to get effective share percentage for an investor
  const getEffectiveSharePercentage = (investor: Investor) => {
    return investor.effectiveSharePercentage || 0;
  };

  const handleInputChange = (field: keyof InvestorFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = field === 'sharePercentage' || field === 'totalInvested' 
      ? parseFloat(e.target.value) || 0 
      : e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setFormErrors('اسم المستثمر مطلوب');
      return false;
    }
    if (!formData.phone.trim()) {
      setFormErrors('رقم الهاتف مطلوب');
      return false;
    }
    if (formData.sharePercentage <= 0 || formData.sharePercentage > 100) {
      setFormErrors('نسبة المشاركة يجب أن تكون بين 1 و 100');
      return false;
    }
    if (formData.totalInvested < 0) {
      setFormErrors('مبلغ الاستثمار لا يمكن أن ��كو�� سالبًا');
      return false;
    }

    // Check if total shares exceed 100% (only for new investors or when changing percentage)
    const currentSharesTotal = editingInvestor 
      ? totalShares - editingInvestor.sharePercentage + formData.sharePercentage
      : totalShares + formData.sharePercentage;
    
    if (currentSharesTotal > investorsPercentage) {
      setFormErrors(`إجمالي النسب سيصبح ${currentSharesTotal.toFixed(1)}% وهو أكثر من ${investorsPercentage.toFixed(1)}% المسموحة للمستثمرين`);
      return false;
    }

    setFormErrors(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const result = editingInvestor
      ? await updateMutation.mutate({ ...formData, id: editingInvestor.id }, 'PUT')
      : await addMutation.mutate(formData);

    if (result.success) {
      setIsDialogOpen(false);
      setEditingInvestor(null);
      setFormData(initialFormData);
      refetch();
    }
  };

  const handleEdit = (investor: Investor) => {
    setEditingInvestor(investor);
    setFormData({
      name: investor.name,
      phone: investor.phone,
      nationalId: investor.nationalId || '',
      bankTransferNumber: investor.bankTransferNumber || '',
      sharePercentage: investor.sharePercentage,
      totalInvested: investor.totalInvested,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (investor: Investor) => {
    if (window.confirm(`هل أنت متأكد من حذف المستثمر "${investor.name}"؟`)) {
      const result = await deleteMutation.mutate({ id: investor.id }, 'DELETE');
      if (result.success) {
        refetch();
      }
    }
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingInvestor(null);
    setFormData(initialFormData);
    setFormErrors(null);
  };

  if (!permissions?.canViewInvestors) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-4">غير مصرح</h1>
        <p className="text-gray-600">ليس لديك صلاحية لعرض بيانات المستثمرين</p>
      </div>
    );
  }


  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-center">
        <div>
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={refetch} variant="outline">
            إعادة المحاولة
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <LoadingScreen loading={loading} />
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-investment-primary-600" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">المستثمرون</h1>
            <p className="text-gray-600">إدارة بيانات المستثمرين ونسب المشاركة</p>
          </div>
        </div>
        
        {permissions?.canEditInvestors && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-investment-primary-600 hover:bg-investment-primary-700">
                <Plus className="h-4 w-4 ml-2" />
                إضافة مستثمر
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingInvestor ? 'تعديل مستثمر' : 'إضافة مستثمر جديد'}
                </DialogTitle>
                <DialogDescription>
                  {editingInvestor ? 'تعديل بيانات المستثمر' : 'أدخل بيانات المستثمر الجديد'}
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {formErrors && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{formErrors}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="name">اسم المستثمر</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={handleInputChange('name')}
                    placeholder="أدخل اسم المستثمر"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">رقم الهاتف</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={handleInputChange('phone')}
                    placeholder="أدخل رقم الهاتف"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nationalId">رقم الهوية</Label>
                  <Input
                    id="nationalId"
                    value={formData.nationalId || ''}
                    onChange={handleInputChange('nationalId')}
                    placeholder="أدخل رقم الهوية (اختياري)"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bankTransferNumber">رقم التحويل البنكي</Label>
                  <Input
                    id="bankTransferNumber"
                    value={formData.bankTransferNumber || ''}
                    onChange={handleInputChange('bankTransferNumber')}
                    placeholder="أدخل رقم التحويل البنكي (اختياري)"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sharePercentage">نسبة المشاركة (%)</Label>
                  <Input
                    id="sharePercentage"
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="100"
                    value={formData.sharePercentage || ''}
                    onChange={handleInputChange('sharePercentage')}
                    placeholder="أدخل نسبة المشاركة"
                    required
                  />
                  <p className="text-xs text-gray-600">
                    المتبقي: <Number value={investorsPercentage - totalShares + (editingInvestor?.sharePercentage || 0)} percentage decimal={1} />
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="totalInvested">مبلغ الاستثمار (MRU)</Label>
                  <Input
                    id="totalInvested"
                    type="number"
                    min="0"
                    step="1000"
                    value={formData.totalInvested || ''}
                    onChange={handleInputChange('totalInvested')}
                    placeholder="أدخل مبلغ الاستثمار (0 للمستثمرين الفكريين)"
                  />
                  <p className="text-xs text-gray-600">
                    يمكن أن يكون 0 للمستثمرين الفكريين الذين لديهم نسبة بدون استثمار مالي
                  </p>
                </div>

                <DialogFooter className="gap-2">
                  <Button type="button" variant="outline" onClick={closeDialog}>
                    إلغاء
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={addMutation.loading || updateMutation.loading}
                    className="bg-investment-primary-600 hover:bg-investment-primary-700"
                  >
                    {(addMutation.loading || updateMutation.loading) ? (
                      <Loader2 className="h-4 w-4 animate-spin ml-2" />
                    ) : null}
                    {editingInvestor ? 'تحديث' : 'إضافة'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Distribution Summary */}
      <Card className="mb-6 border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-lg text-blue-800">ملخص توزيع النسب المئوية</CardTitle>
          <CardDescription className="text-blue-600">
            توزيع النسب على جميع أطراف المشروع
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-white rounded-lg border">
              <div className="text-sm text-gray-600 mb-1">نسبة المشروع</div>
              <div className="text-lg font-bold text-blue-600">
                <Number value={projectPercentage} percentage decimal={1} />
              </div>
            </div>
            {totalCustomAllocations > 0 && (
              <div className="text-center p-3 bg-white rounded-lg border">
                <div className="text-sm text-gray-600 mb-1">مخصصات أخرى</div>
                <div className="text-lg font-bold text-purple-600">
                  <Number value={totalCustomAllocations} percentage decimal={1} />
                </div>
              </div>
            )}
            <div className="text-center p-3 bg-white rounded-lg border">
              <div className="text-sm text-gray-600 mb-1">نسب المستثمرين الأصلية</div>
              <div className="text-lg font-bold text-green-600">
                <Number value={totalShares} percentage decimal={1} />
              </div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg border">
              <div className="text-sm text-gray-600 mb-1">نسب المستثمرين الفعلية</div>
              <div className="text-lg font-bold text-green-800">
                <Number value={investorsPercentage} percentage decimal={1} />
              </div>
            </div>
          </div>
          {customAllocations.length > 0 && (
            <div className="mt-4 pt-4 border-t border-blue-200">
              <h4 className="text-sm font-medium text-blue-800 mb-2">المخصصات الإضافية:</h4>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                {customAllocations.map((allocation: any, index: number) => (
                  <div key={index} className="text-xs bg-white p-2 rounded border">
                    <span className="text-gray-600">{allocation.name}: </span>
                    <span className="font-semibold text-purple-600">
                      <Number value={allocation.percentage} percentage decimal={1} />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">إجمالي الاستثمارات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-investment-primary-800">
              <Number value={totalInvestment} currency />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">إجمالي أرباح المستثمرين الفعلية</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-investment-success-600">
              <Number value={investorsTotalProfit} currency />
            </div>
            <p className="text-xs text-gray-600 mt-1">
              محسوبة حسب نسب التوزيع الفعلية
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">إجمالي السحوبات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-investment-warning-600">
              <Number value={totalWithdrawn} currency />
            </div>
          </CardContent>
        </Card>


      </div>

      {/* Investors List */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة المستثمرين</CardTitle>
          <CardDescription>
            إجمالي المستثمرين: {investors?.length || 0}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {investors && investors.length > 0 ? (
            <div className="space-y-4">
              {investors.map((investor) => (
                <div key={investor.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      {/* معلومات ��ساسية */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-investment-primary-100 rounded-lg">
                          <User className="h-5 w-5 text-investment-primary-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">{investor.name}</h3>
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              <span>{investor.phone}</span>
                            </div>
                            {investor.nationalId && (
                              <div className="flex items-center gap-1">
                                <CreditCard className="h-3 w-3" />
                                <span>هوية: {investor.nationalId}</span>
                              </div>
                            )}
                            {investor.bankTransferNumber && (
                              <div className="flex items-center gap-1">
                                <Building className="h-3 w-3" />
                                <span>حساب: {investor.bankTransferNumber}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Percent className="h-3 w-3" />
                              <span><Number value={investor.sharePercentage} percentage decimal={1} /></span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* البيانات المالية */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                        <div className="text-center p-2 bg-blue-50 rounded">
                          <div className="text-xs text-gray-600 mb-1">الاستثمار</div>
                          <div className="font-semibold text-blue-700">
                            <Number value={investor.totalInvested} currency />
                          </div>
                        </div>
                        <div className="text-center p-2 bg-green-50 rounded">
                          <div className="text-xs text-gray-600 mb-1">إجمالي الأرباح</div>
                          <div className="font-semibold text-green-700">
                            <Number value={investor.totalProfit} currency />
                          </div>
                        </div>
                        <div className="text-center p-2 bg-orange-50 rounded">
                          <div className="text-xs text-gray-600 mb-1">السحوبات</div>
                          <div className="font-semibold text-orange-700">
                            <Number value={investor.totalWithdrawn} currency />
                          </div>
                        </div>
                        <div className="text-center p-2 bg-purple-50 rounded">
                          <div className="text-xs text-gray-600 mb-1">رصيده الحالي</div>
                          <div className="font-semibold text-purple-700">
                            <Number value={investor.totalProfit - investor.totalWithdrawn} currency />
                          </div>
                        </div>


                      </div>
                    </div>

                    {permissions?.canEditInvestors && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(investor)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(investor)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">لا يوجد مستثمرون</h3>
              <p className="text-gray-600">ابدأ بإضافة المستثمرين لمشروعك</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error Messages */}
      {(addMutation.error || updateMutation.error || deleteMutation.error) && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {addMutation.error || updateMutation.error || deleteMutation.error}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
