import React, { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Number } from '@/components/ui/number';
import { useApi, useApiMutation } from '@/hooks/useApi';
import {
  ArrowDownToLine,
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  Loader2,
  Calendar,
  User,
  Upload,
  X,
  CheckCircle,
  Clock,
  XCircle,
  Image as ImageIcon,
  FileText,
  Eye
} from 'lucide-react';
import { Withdrawal, Investor } from '../../shared/types';
import LoadingScreen from '@/components/LoadingScreen';

interface WithdrawalFormData {
  investorName: string;
  amount: number;
  date: string;
  notes: string;
  attachments: File[];
}

const initialFormData: WithdrawalFormData = {
  investorName: '',
  amount: 0,
  date: new Date().toLocaleDateString('en-CA'), // YYYY-MM-DD format
  notes: '',
  attachments: [],
};

export default function Withdrawals() {
  const { user, permissions } = useAuth();
  const { data, loading: withdrawalsLoading, error: withdrawalsError, refetch: refetchWithdrawals } = useApi<{ items: Withdrawal[]; summary?: { totalAmount: number; monthlyAmount: number; total: number } }>('/withdrawals?limit=25&summary=true');
  const withdrawals = data?.items || [];
  const { data: investors, loading: investorsLoading, error: investorsError, refetch: refetchInvestors } = useApi<Investor[]>('/investors?includeEffective=true');

  // Create mutations with auto-refresh
  const addMutation = useApiMutation('/withdrawals', {
    onSuccess: () => {
      refetchWithdrawals();
      refetchInvestors(); // Refresh investors to show updated balances
    }
  });
  const updateMutation = useApiMutation('/withdrawals', {
    onSuccess: () => {
      refetchWithdrawals();
      refetchInvestors();
    }
  });
  const deleteMutation = useApiMutation('/withdrawals', {
    onSuccess: () => {
      refetchWithdrawals();
      refetchInvestors();
    }
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingWithdrawal, setEditingWithdrawal] = useState<Withdrawal | null>(null);
  const [formData, setFormData] = useState<WithdrawalFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<string | null>(null);
  const [attachmentPreviews, setAttachmentPreviews] = useState<string[]>([]);
  const [viewingAttachments, setViewingAttachments] = useState<{withdrawal: Withdrawal, isOpen: boolean}>({withdrawal: {} as Withdrawal, isOpen: false});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loading = withdrawalsLoading || investorsLoading;
  const error = withdrawalsError || investorsError;

  // Totals from summary for speed
  const totalAmount = data?.summary?.totalAmount || 0;
  const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const monthlyWithdrawals = data?.summary?.monthlyAmount || 0;

  // Get selected investor details for validation
  const selectedInvestor = investors?.find(inv => inv.name === formData.investorName);

  const handleInputChange = (field: keyof WithdrawalFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = field === 'amount' ? parseFloat(e.target.value) || 0 : e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleInvestorChange = (value: string) => {
    setFormData(prev => ({ ...prev, investorName: value }));
  };

  const handleAttachmentsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (formData.attachments.length + files.length > 3) {
      setFormErrors('يمكن رفع حتى 3 ملفات فقط');
      return;
    }

    // Check file sizes (max 5MB each)
    const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setFormErrors('حجم كل ملف يجب أن يكون أقل من 5 ميجابايت');
      return;
    }

    const newAttachments = [...formData.attachments, ...files];
    setFormData(prev => ({ ...prev, attachments: newAttachments }));

    // Create previews for image files
    const newPreviews = [...attachmentPreviews];
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          newPreviews.push(e.target?.result as string);
          setAttachmentPreviews([...newPreviews]);
        };
        reader.readAsDataURL(file);
      } else {
        newPreviews.push(''); // Placeholder for non-image files
      }
    });

    setFormErrors(null);
  };

  const removeAttachment = (index: number) => {
    const newAttachments = formData.attachments.filter((_, i) => i !== index);
    const newPreviews = attachmentPreviews.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, attachments: newAttachments }));
    setAttachmentPreviews(newPreviews);
  };

  const validateForm = (): boolean => {
    if (!formData.investorName) {
      setFormErrors('يجب اختيار المستثمر');
      return false;
    }
    if (formData.amount <= 0) {
      setFormErrors('مبلغ السحب يجب أن يكون أكبر من صفر');
      return false;
    }
    if (!formData.date) {
      setFormErrors('تاريخ السحب مطلوب');
      return false;
    }

    // Check if investor has enough balance
    if (selectedInvestor && formData.amount > selectedInvestor.currentBalance) {
      setFormErrors(`المبلغ أكبر من رصيد المستثمر المتاح (${selectedInvestor.currentBalance.toLocaleString()} MRU)`);
      return false;
    }

    setFormErrors(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    // Convert date to US format for consistency
    const formattedDate = new Date(formData.date).toLocaleDateString('en-US');

    // Convert files to base64 URLs for storage, but handle existing attachments differently
    const attachmentUrls = await Promise.all(
      formData.attachments.map(async (file) => {
        // If this is an existing attachment (has url property), return it as is
        if ((file as any).url) {
          return {
            name: file.name,
            size: file.size,
            type: file.type,
            url: (file as any).url
          };
        }

        // For new files, convert to base64
        return new Promise<{name: string, size: number, type: string, url: string}>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            resolve({
              name: file.name,
              size: file.size,
              type: file.type,
              url: reader.result as string
            });
          };
          reader.readAsDataURL(file);
        });
      })
    );

    let finalAttachments = attachmentUrls;

    const submitData = {
      investorName: formData.investorName,
      amount: formData.amount,
      date: formattedDate,
      notes: formData.notes,
      approvedBy: user?.name || 'غير محدد',
      timestamp: new Date().toISOString(),
      attachments: finalAttachments
    };

    const result = editingWithdrawal
      ? await updateMutation.mutate({ ...submitData, id: editingWithdrawal.id }, 'PUT')
      : await addMutation.mutate(submitData);

    if (result.success) {
      setIsDialogOpen(false);
      setEditingWithdrawal(null);
      setFormData(initialFormData);
      setAttachmentPreviews([]);
      // refetch happens automatically via onSuccess callback
    }
  };

  const handleEdit = (withdrawal: Withdrawal) => {
    setEditingWithdrawal(withdrawal);

    // Convert existing attachments to display in form
    const existingAttachments: File[] = [];
    const existingPreviews: string[] = [];

    if (withdrawal.attachments && withdrawal.attachments.length > 0) {
      withdrawal.attachments.forEach((attachment) => {
        // Create fake File objects to represent existing attachments
        const fakeFile = new File([''], attachment.name, { type: attachment.type });
        Object.defineProperty(fakeFile, 'size', { value: attachment.size });
        Object.defineProperty(fakeFile, 'url', { value: attachment.url });
        existingAttachments.push(fakeFile);

        if (attachment.type.startsWith('image/') && attachment.url) {
          existingPreviews.push(attachment.url);
        } else {
          existingPreviews.push('');
        }
      });
    }

    setFormData({
      investorName: withdrawal.investorName,
      amount: withdrawal.amount,
      date: new Date(withdrawal.date).toLocaleDateString('en-CA'),
      notes: withdrawal.notes || '',
      attachments: existingAttachments,
    });
    setAttachmentPreviews(existingPreviews);
    setIsDialogOpen(true);
  };

  const handleDelete = async (withdrawal: Withdrawal) => {
    if (window.confirm(`هل أنت متأكد من حذف سحب "${withdrawal.investorName}" بمبلغ ${withdrawal.amount} MRU؟`)) {
      const result = await deleteMutation.mutate({ id: withdrawal.id }, 'DELETE');
      // refetch happens automatically via onSuccess callback
    }
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingWithdrawal(null);
    setFormData(initialFormData);
    setFormErrors(null);
    setAttachmentPreviews([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!permissions?.canViewWithdrawals && user?.role !== 'Investor') {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-4">غير مصرح</h1>
        <p className="text-gray-600">ليس لديك صلاحية لعرض السحوبات</p>
      </div>
    );
  }


  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-center">
        <div>
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={refetchWithdrawals} variant="outline">
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
          <ArrowDownToLine className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">السحوبات</h1>
            <p className="text-gray-600">إدارة سحوبات المستثمرين</p>
          </div>
        </div>
        
        {permissions?.canApproveWithdrawals && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 ml-2" />
                تسجيل سحب
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingWithdrawal ? 'تعديل سحب' : 'تسجيل سحب جديد'}
                </DialogTitle>
                <DialogDescription>
                  {editingWithdrawal ? 'تعديل بيانات السحب' : 'أدخل بيانات السحب الجديد'}
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
                  <Label htmlFor="investorName">المستثمر</Label>
                  <Select value={formData.investorName} onValueChange={handleInvestorChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المستثمر" />
                    </SelectTrigger>
                    <SelectContent>
                      {investors?.map((investor) => (
                        <SelectItem key={investor.id} value={investor.name}>
                          <div className="flex justify-between items-center w-full">
                            <span>{investor.name}</span>
                            <span className="text-sm text-gray-500 number mr-2">
                              ({investor.currentBalance.toLocaleString()} MRU متاح)
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedInvestor && (
                    <div className="p-2 bg-blue-50 rounded-lg text-sm">
                      <p className="text-blue-700">
                        الرصيد المتاح: <Number value={selectedInvestor.currentBalance} currency />
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">مبلغ السحب (MRU)</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="0"
                    step="0.01"
                    max={selectedInvestor?.currentBalance || undefined}
                    value={formData.amount || ''}
                    onChange={handleInputChange('amount')}
                    placeholder="أدخل مبلغ السحب"
                    required
                  />

                  {/* Quick amount buttons */}
                  {selectedInvestor && selectedInvestor.currentBalance > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setFormData(prev => ({ ...prev, amount: Math.round(selectedInvestor.currentBalance * 0.25 * 100) / 100 }))}
                        className="text-xs"
                      >
                        25%
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setFormData(prev => ({ ...prev, amount: Math.round(selectedInvestor.currentBalance * 0.5 * 100) / 100 }))}
                        className="text-xs"
                      >
                        50%
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setFormData(prev => ({ ...prev, amount: Math.round(selectedInvestor.currentBalance * 0.75 * 100) / 100 }))}
                        className="text-xs"
                      >
                        75%
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setFormData(prev => ({ ...prev, amount: selectedInvestor.currentBalance }))}
                        className="text-xs"
                      >
                        الكل
                      </Button>
                    </div>
                  )}

                  {selectedInvestor && formData.amount > 0 && (
                    <div className="text-sm">
                      {formData.amount <= selectedInvestor.currentBalance ? (
                        <span className="text-green-600">✓ المبلغ صحيح</span>
                      ) : (
                        <span className="text-red-600">✗ المبلغ أكبر من الرصيد المتاح</span>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">تاريخ السحب</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={handleInputChange('date')}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">ملاحظات</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={handleInputChange('notes')}
                    placeholder="أدخل أي ملاحظات إضافية (اختياري)"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="attachments">المرفقات (حتى 3 ملفات)</Label>
                  <div className="space-y-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,.pdf,.doc,.docx,.xlsx,.xls"
                      onChange={handleAttachmentsChange}
                      className="hidden"
                      id="attachmentsUpload"
                      multiple
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full"
                      disabled={formData.attachments.length >= 3}
                    >
                      <Upload className="h-4 w-4 ml-2" />
                      رفع ملفات ({formData.attachments.length}/3)
                    </Button>

                    {formData.attachments.length > 0 && (
                      <div className="grid grid-cols-1 gap-2">
                        {formData.attachments.map((file, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 border rounded-lg">
                            {file.type.startsWith('image/') ? (
                              <ImageIcon className="h-4 w-4 text-blue-500" />
                            ) : (
                              <FileText className="h-4 w-4 text-gray-500" />
                            )}
                            <span className="text-sm flex-1 truncate">{file.name}</span>
                            <span className="text-xs text-gray-500">
                              {(file.size / 1024 / 1024).toFixed(1)} MB
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeAttachment(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-600">
                    يمكن رفع الصور والملفات (PDF, Word, Excel). الحد الأقصى: 5 ميجابايت لكل ملف
                  </p>
                </div>

                {/* Withdrawal Summary */}
                {formData.investorName && formData.amount > 0 && selectedInvestor && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-2">ملخص السحب:</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>المستثمر:</span>
                        <span className="font-medium">{formData.investorName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>مبلغ السحب:</span>
                        <span className="font-medium number">
                          <Number value={formData.amount} currency />
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>الرصيد بعد السحب:</span>
                        <span className="font-medium number">
                          <Number value={selectedInvestor.currentBalance - formData.amount} currency />
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>ا��تاريخ:</span>
                        <span className="font-medium number">{formData.date}</span>
                      </div>
                    </div>
                  </div>
                )}

                <DialogFooter className="gap-2">
                  <Button type="button" variant="outline" onClick={closeDialog}>
                    إلغاء
                  </Button>
                  <Button
                    type="submit"
                    disabled={addMutation.loading || updateMutation.loading || !formData.investorName || formData.amount <= 0}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {(addMutation.loading || updateMutation.loading) ? (
                      <Loader2 className="h-4 w-4 animate-spin ml-2" />
                    ) : null}
                    {editingWithdrawal ? 'تحديث السحب' : 'تأكيد السحب'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">إجمالي السحوبات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              <Number value={totalAmount} currency />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">سحوبات {currentMonth}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">
              <Number value={monthlyWithdrawals} currency />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">عدد السحوبات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-investment-primary-600">
              <Number value={withdrawals?.length || 0} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Available Balances for Admin/Assistant */}
      {permissions?.canViewInvestors && (
        <Card>
          <CardHeader>
            <CardTitle>الأرصدة المتاحة لل��حب</CardTitle>
            <CardDescription>
              أرصدة المستثمرين المتاحة حالياً
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {investors?.map((investor) => (
                <div key={investor.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">{investor.name}</h4>
                      <p className="text-sm text-gray-600">
                        نسبة ��لمشاركة: <Number value={investor.sharePercentage} percentage />
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-investment-success-600">
                        <Number value={investor.currentBalance} currency />
                      </div>
                      <p className="text-xs text-gray-500">متاح للسحب</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Withdrawals List */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة السحوبات</CardTitle>
          <CardDescription>
            جميع سحوبات المستثمرين مرتبة حسب التاريخ
          </CardDescription>
        </CardHeader>
        <CardContent>
          {withdrawals && withdrawals.length > 0 ? (
            <div className="space-y-4">
              {withdrawals
                .sort((a, b) => {
                  // Use createdAt or timestamp for sorting, fallback to date
                  const aTime = a.createdAt || a.timestamp || a.date;
                  const bTime = b.createdAt || b.timestamp || b.date;
                  return new Date(bTime).getTime() - new Date(aTime).getTime();
                })
                .map((withdrawal) => (
                <div key={withdrawal.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{withdrawal.investorName}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span className="number">{withdrawal.timestamp ? new Date(withdrawal.timestamp).toLocaleString('en-US', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: false
                              }) : new Date(withdrawal.date).toLocaleDateString('en-US')}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              <span>{withdrawal.approvedBy}</span>
                            </div>
                            {withdrawal.timestamp && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span className="number">{new Date(withdrawal.timestamp).toLocaleTimeString('en-US', { hour12: false })}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          <Number value={withdrawal.amount} currency />
                        </Badge>
                      </div>
                      
                      {withdrawal.notes && (
                        <p className="text-sm text-gray-600 mb-2">{withdrawal.notes}</p>
                      )}

                      <div className="text-xs text-gray-500">
                        ID: {withdrawal.id}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {/* View Attachments Button */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setViewingAttachments({withdrawal, isOpen: true})}
                        className="relative"
                      >
                        <Eye className="h-4 w-4" />
                        {withdrawal.attachments && withdrawal.attachments.length > 0 && (
                          <Badge
                            variant="secondary"
                            className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs flex items-center justify-center"
                          >
                            {withdrawal.attachments.length}
                          </Badge>
                        )}
                      </Button>

                      {permissions?.canApproveWithdrawals && (
                        <>
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
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <ArrowDownToLine className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد سحوبات</h3>
              <p className="text-gray-600">لم يتم تسجيل أي سحوبات بعد</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Attachments Dialog */}
      <Dialog open={viewingAttachments.isOpen} onOpenChange={(open) => setViewingAttachments({...viewingAttachments, isOpen: open})}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>مرفقات السحب</DialogTitle>
            <DialogDescription>
              {viewingAttachments.withdrawal.investorName} - <Number value={viewingAttachments.withdrawal.amount} currency />
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {viewingAttachments.withdrawal.attachments && viewingAttachments.withdrawal.attachments.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {viewingAttachments.withdrawal.attachments.map((attachment, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      {attachment.type.startsWith('image/') ? (
                        <ImageIcon className="h-5 w-5 text-blue-500" />
                      ) : (
                        <FileText className="h-5 w-5 text-gray-500" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-sm">{attachment.name}</p>
                        <p className="text-xs text-gray-500">
                          {(attachment.size / 1024 / 1024).toFixed(1)} MB
                        </p>
                      </div>
                    </div>

                    {attachment.type.startsWith('image/') && attachment.url && (
                      <div className="mt-3">
                        <img
                          src={attachment.url}
                          alt={attachment.name}
                          className="max-w-full max-h-96 object-contain rounded border"
                          style={{ width: 'auto', height: 'auto' }}
                        />
                      </div>
                    )}

                    {!attachment.type.startsWith('image/') && attachment.url && (
                      <div className="mt-3">
                        <a
                          href={attachment.url}
                          download={attachment.name}
                          className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm"
                        >
                          <FileText className="h-4 w-4" />
                          تحميل الملف
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">لا توجد مرفقات محفوظة</p>
                <p className="text-sm text-gray-500 mt-2">
                  لم يتم رفع أي مرفقات مع هذا السحب
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

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
