import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Number } from '@/components/ui/number';
import { useApi, useApiMutation } from '@/hooks/useApi';
import {
  Building,
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  Loader2,
  DollarSign,
  Calendar,
  FileText,
  Target
} from 'lucide-react';
import { ProjectWithdrawal } from '../../shared/types';

interface ProjectWithdrawalFormData {
  amount: number;
  date: string;
  purpose: string;
  notes?: string;
}

const initialFormData: ProjectWithdrawalFormData = {
  amount: 0,
  date: new Date().toISOString().split('T')[0],
  purpose: '',
  notes: '',
};

export default function ProjectWithdrawals() {
  const { user, permissions } = useAuth();
  const { data: projectWithdrawals, loading, error, refetch } = useApi<ProjectWithdrawal[]>('/project-withdrawals');
  const { data: dashboardStats } = useApi<any>('/dashboard');
  const addMutation = useApiMutation('/project-withdrawals');
  const updateMutation = useApiMutation('/project-withdrawals');
  const deleteMutation = useApiMutation('/project-withdrawals');

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingWithdrawal, setEditingWithdrawal] = useState<ProjectWithdrawal | null>(null);
  const [formData, setFormData] = useState<ProjectWithdrawalFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<string | null>(null);

  // Calculate totals
  const totalWithdrawn = projectWithdrawals?.reduce((sum, withdrawal) => sum + withdrawal.amount, 0) || 0;
  const projectBalance = dashboardStats?.data?.projectBalance || dashboardStats?.projectBalance || 0;
  const availableForWithdrawal = projectBalance - totalWithdrawn;

  const handleInputChange = (field: keyof ProjectWithdrawalFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = field === 'amount' 
      ? parseFloat(e.target.value) || 0 
      : e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.purpose.trim()) {
      setFormErrors('الغرض من السحب مطلوب');
      return false;
    }
    if (formData.amount <= 0) {
      setFormErrors('المبلغ يجب أن يكون أكبر من صفر');
      return false;
    }
    if (!formData.date) {
      setFormErrors('التاريخ مطلوب');
      return false;
    }

    // Check if withdrawal amount exceeds available balance (only for new withdrawals)
    if (!editingWithdrawal && formData.amount > availableForWithdrawal) {
      setFormErrors(`المبلغ يتجاوز الرصيد المتاح للمشروع (${availableForWithdrawal.toLocaleString()} MRU)`);
      return false;
    }

    setFormErrors(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const result = editingWithdrawal
      ? await updateMutation.mutate({ ...formData, id: editingWithdrawal.id }, 'PUT')
      : await addMutation.mutate(formData);

    if (result.success) {
      setIsDialogOpen(false);
      setEditingWithdrawal(null);
      setFormData(initialFormData);
      refetch();
    }
  };

  const handleEdit = (withdrawal: ProjectWithdrawal) => {
    setEditingWithdrawal(withdrawal);
    setFormData({
      amount: withdrawal.amount,
      date: withdrawal.date,
      purpose: withdrawal.purpose,
      notes: withdrawal.notes || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (withdrawal: ProjectWithdrawal) => {
    if (window.confirm(`هل أنت متأكد من حذف سحب المشروع "${withdrawal.purpose}"؟`)) {
      const result = await deleteMutation.mutate({ id: withdrawal.id }, 'DELETE');
      if (result.success) {
        refetch();
      }
    }
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingWithdrawal(null);
    setFormData(initialFormData);
    setFormErrors(null);
  };

  if (user?.role !== 'Admin') {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-4">غير مصرح</h1>
        <p className="text-gray-600">ليس لديك صلاحية لعرض سحوبات المشروع</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-investment-primary-600" />
        <span className="mr-2 text-investment-primary-600">جاري تحميل سحوبات المشروع...</span>
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Building className="h-8 w-8 text-investment-primary-600" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">سحوبات المشروع</h1>
            <p className="text-gray-600">إدارة سحوبات نسبة المشروع ومتابعة الاستخدامات</p>
          </div>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-investment-primary-600 hover:bg-investment-primary-700">
              <Plus className="h-4 w-4 ml-2" />
              إضافة سحب جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingWithdrawal ? 'تعديل سحب المشروع' : 'إضافة سحب جديد'}
              </DialogTitle>
              <DialogDescription>
                {editingWithdrawal ? 'تعديل بيانات سحب المشروع' : 'إضافة سحب جديد من نسبة المشروع'}
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
                <Label htmlFor="amount">المبلغ (MRU)</Label>
                <Input
                  id="amount"
                  type="number"
                  min="1"
                  step="1000"
                  value={formData.amount || ''}
                  onChange={handleInputChange('amount')}
                  placeholder="أدخل المبلغ"
                  required
                />
                <p className="text-xs text-gray-600">
                  الرصيد المتاح للسحب: <Number value={availableForWithdrawal} currency />
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="purpose">الغرض من السحب</Label>
                <Input
                  id="purpose"
                  value={formData.purpose}
                  onChange={handleInputChange('purpose')}
                  placeholder="مثال: تطوير النظام، أتعاب إدارية"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">التاريخ</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={handleInputChange('date')}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">ملاحظات (اختياري)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={handleInputChange('notes')}
                  placeholder="ملاحظات إضافية حول السحب"
                  rows={3}
                />
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
                  {editingWithdrawal ? 'تحديث' : 'إضافة'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">رصيد المشروع</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-investment-primary-800">
              <Number value={projectBalance} currency />
            </div>
            <p className="text-xs text-gray-600 mt-1">15% من صافي الربح</p>
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
            <p className="text-xs text-gray-600 mt-1">المسحوب من نسبة المشروع</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">الرصيد المتاح للسحب</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${availableForWithdrawal >= 0 ? 'text-investment-success-600' : 'text-red-600'}`}>
              <Number value={availableForWithdrawal} currency />
            </div>
            <p className="text-xs text-gray-600 mt-1">رصيد المشروع - السحوبات</p>
          </CardContent>
        </Card>
      </div>

      {/* Withdrawals List */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة سحوبات المشروع</CardTitle>
          <CardDescription>
            إجمالي السحوبات: {projectWithdrawals?.length || 0}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {projectWithdrawals && projectWithdrawals.length > 0 ? (
            <div className="space-y-4">
              {projectWithdrawals.map((withdrawal) => (
                <div key={withdrawal.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-investment-primary-100 rounded-lg">
                          <Target className="h-5 w-5 text-investment-primary-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">{withdrawal.purpose}</h3>
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{new Date(withdrawal.date).toLocaleDateString('ar-SA')}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              <span><Number value={withdrawal.amount} currency /></span>
                            </div>
                            <div className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              <span>بواسطة: {withdrawal.approvedBy}</span>
                            </div>
                          </div>
                          {withdrawal.notes && (
                            <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-700">
                              <strong>ملاحظات:</strong> {withdrawal.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(withdrawal)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(withdrawal)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد سحوبات للمشروع</h3>
              <p className="text-gray-600">ابدأ بإضافة أول سحب من نسبة المشروع</p>
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
