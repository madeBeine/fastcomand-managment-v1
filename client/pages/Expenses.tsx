import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import CategoryManager from '@/components/CategoryManager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  ScrollableSelect as Select,
  ScrollableSelectContent as SelectContent,
  ScrollableSelectItem as SelectItem,
  ScrollableSelectTrigger as SelectTrigger,
  ScrollableSelectValue as SelectValue
} from '@/components/ui/scrollable-select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Number } from '@/components/ui/number';
import { useApi, useApiMutation } from '@/hooks/useApi';
import {
  TrendingDown,
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  Loader2,
  Calendar,
  Tag,
  Upload,
  Image as ImageIcon,
  X,
  FileText,
  Eye,
  Clock,
  User,
  Settings
} from 'lucide-react';
import { Expense } from '../../shared/types';
import LoadingScreen from '@/components/LoadingScreen';

// Default expense categories
const DEFAULT_EXPENSE_CATEGORIES = [
  'مواد خام',
  'رواتب',
  'إيجار',
  'كهرباء',
  'ماء',
  'اتصالات',
  'نقل ومواصلات',
  'صيانة',
  'تسويق وإعلان',
  'أدوات مكالبية',
  'خدمات قانونية',
  'تأمين',
  'ضرائب ورسوم',
  'تدريب',
  'استشارات',
  'أخرى'
];

interface ExpenseFormData {
  category: string;
  customCategory?: string;
  amount: number;
  date: string;
  notes: string;
  attachments: File[];
}

const initialFormData: ExpenseFormData = {
  category: '',
  customCategory: '',
  amount: 0,
  date: new Date().toLocaleDateString('en-CA'), // YYYY-MM-DD format
  notes: '',
  attachments: [],
};

export default function Expenses() {
  const { user, permissions } = useAuth();
  const { data, loading, error, refetch } = useApi<{ items: Expense[]; summary?: { totalAmount: number; monthlyAmount: number; total: number } }>('/expenses?limit=25&summary=true');
  const expenses = data?.items || [];
  // Create mutations with auto-refresh
  const addMutation = useApiMutation('/expenses', {
    onSuccess: () => {
      refetch();
    }
  });
  const updateMutation = useApiMutation('/expenses', {
    onSuccess: () => {
      refetch();
    }
  });
  const deleteMutation = useApiMutation('/expenses', {
    onSuccess: () => {
      refetch();
    }
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [formData, setFormData] = useState<ExpenseFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<string | null>(null);
  const [attachmentPreviews, setAttachmentPreviews] = useState<string[]>([]);
  const [viewingAttachments, setViewingAttachments] = useState<{expense: Expense, isOpen: boolean}>({expense: {} as Expense, isOpen: false});
  const [categories, setCategories] = useState<string[]>(DEFAULT_EXPENSE_CATEGORIES);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load categories from localStorage on component mount
  useEffect(() => {
    const savedCategories = localStorage.getItem('expenseCategories');
    if (savedCategories) {
      try {
        const parsed = JSON.parse(savedCategories);
        setCategories(parsed);
      } catch (error) {
        console.error('Error parsing saved categories:', error);
      }
    }
  }, []);

  // Calculate totals from summary for speed and accuracy
  const totalAmount = data?.summary?.totalAmount || 0;
  const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const monthlyExpenses = data?.summary?.monthlyAmount || 0;

  const handleInputChange = (field: keyof ExpenseFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = field === 'amount' ? parseFloat(e.target.value) || 0 : e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData(prev => ({ 
      ...prev, 
      category: value,
      customCategory: value === 'أخرى' ? prev.customCategory : ''
    }));
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
    if (!formData.category) {
      setFormErrors('يجب االتيار فئة المصروف');
      return false;
    }
    if (formData.category === 'أخرى' && !formData.customCategory?.trim()) {
      setFormErrors('يجب كتابة اسم الفئة المخصصة');
      return false;
    }
    if (formData.amount <= 0) {
      setFormErrors('مبلغ المصالوف يجب أن يكون أكبر من صفر');
      return false;
    }
    if (!formData.date) {
      setFormErrors('تا��يخ المصروف مطلوب');
      return false;
    }
    setFormErrors(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const finalCategory = formData.category === 'أخرى' ? formData.customCategory : formData.category;
    
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
      category: finalCategory,
      amount: formData.amount,
      date: formattedDate,
      notes: formData.notes,
      addedBy: user?.name || 'غير محدد',
      timestamp: new Date().toISOString(),
      attachments: finalAttachments
    };

    const result = editingExpense
      ? await updateMutation.mutate({ ...submitData, id: editingExpense.id }, 'PUT')
      : await addMutation.mutate(submitData);

    if (result.success) {
      setIsDialogOpen(false);
      setEditingExpense(null);
      setFormData(initialFormData);
      setAttachmentPreviews([]);
      // refetch happens automatically via onSuccess callback
    }
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);

    // Convert existing attachments to display in form
    const existingAttachments: File[] = [];
    const existingPreviews: string[] = [];

    if (expense.attachments && expense.attachments.length > 0) {
      expense.attachments.forEach((attachment) => {
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
      category: categories.includes(expense.category) ? expense.category : 'أخرى',
      customCategory: categories.includes(expense.category) ? '' : expense.category,
      amount: expense.amount,
      date: new Date(expense.date).toLocaleDateString('en-CA'),
      notes: expense.notes || '',
      attachments: existingAttachments,
    });
    setAttachmentPreviews(existingPreviews);
    setIsDialogOpen(true);
  };

  const handleDelete = async (expense: Expense) => {
    if (window.confirm(`هل أنت متأكد من حذف مصروف "${expense.category}" بمبلغ ${expense.amount} MRU؟`)) {
      const result = await deleteMutation.mutate({ id: expense.id }, 'DELETE');
      // refetch happens automatically via onSuccess callback
    }
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingExpense(null);
    setFormData(initialFormData);
    setFormErrors(null);
    setAttachmentPreviews([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatTimestamp = (dateStr: string, timestamp?: string) => {
    if (timestamp) {
      return new Date(timestamp).toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    }
    return new Date(dateStr).toLocaleDateString('en-US');
  };

  if (!permissions?.canViewExpenses) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-4">غير مصرح</h1>
        <p className="text-gray-600">ليس لديك صلاحية لعرض المصاريف</p>
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
          <TrendingDown className="h-8 w-8 text-red-600" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">المصااليف</h1>
            <p className="text-gray-600">إدارة مصروفات المشروع</p>
          </div>
        </div>
        
        {permissions?.canEditExpenses && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-red-600 hover:bg-red-700">
                <Plus className="h-4 w-4 ml-2" />
                إضافة مصروف
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingExpense ? 'تعديل مصروف' : 'إضافة مصروف جديد'}
                </DialogTitle>
                <DialogDescription>
                  {editingExpense ? 'تعديل بيانات المصروف' : 'أد��لل بيانات ا��مصروف الجديد'}
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
                  <div className="flex items-center justify-between">
                    <Label htmlFor="category">فئة المصروف</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsCategoryManagerOpen(true)}
                    >
                      <Settings className="h-4 w-4 ml-1" />
                      إدارة الفئات
                    </Button>
                  </div>
                  <Select value={formData.category} onValueChange={handleCategoryChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر فئة المصروف" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {formData.category === 'أخرى' && (
                  <div className="space-y-2">
                    <Label htmlFor="customCategory">اسم الفئة المخصصة</Label>
                    <Input
                      id="customCategory"
                      value={formData.customCategory}
                      onChange={(e) => setFormData(prev => ({ ...prev, customCategory: e.target.value }))}
                      placeholder="أدخل اسم الفئة"
                      required
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="amount">المبلغ (MRU)</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.amount || ''}
                    onChange={handleInputChange('amount')}
                    placeholder="أدخل مبلغ المصروف"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">تاريخ المص��وف</Label>
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
                    يمكن رفع الصور والملالات (PDF, Word, Excel). الحد الأقصى: 5 ميجابايت لكل ملف
                  </p>
                </div>

                <DialogFooter className="gap-2">
                  <Button type="button" variant="outline" onClick={closeDialog}>
                    إلغاء
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={addMutation.loading || updateMutation.loading}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {(addMutation.loading || updateMutation.loading) ? (
                      <Loader2 className="h-4 w-4 animate-spin ml-2" />
                    ) : null}
                    {editingExpense ? 'تحديث' : 'إضافة'}
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
            <CardTitle className="text-sm font-medium text-gray-700">إجمالي المصاريف</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              <Number value={totalAmount} currency />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">مصاريف {currentMonth}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              <Number value={monthlyExpenses} currency />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">عدد المصاريف</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-investment-primary-600">
              <Number value={expenses?.length || 0} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Expenses List */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة المصاريف</CardTitle>
          <CardDescription>
            جميع مصروفات المشروع مرتبة حسب التاريخ
          </CardDescription>
        </CardHeader>
        <CardContent>
          {expenses && expenses.length > 0 ? (
            <div className="space-y-4">
              {expenses
                .sort((a, b) => {
                  // Use createdAt or timestamp for sorting, fallback to date
                  const aTime = a.createdAt || a.timestamp || a.date;
                  const bTime = b.createdAt || b.timestamp || b.date;
                  return new Date(bTime).getTime() - new Date(aTime).getTime();
                })
                .map((expense) => (
                <div key={expense.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-red-100 rounded-lg">
                          <Tag className="h-5 w-5 text-red-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{expense.category}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span className="number">{formatTimestamp(expense.date, expense.timestamp)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              <span>{expense.addedBy}</span>
                            </div>
                            {expense.timestamp && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span className="number">{new Date(expense.timestamp).toLocaleTimeString('en-US', { hour12: false })}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-red-50 text-red-700">
                          <Number value={expense.amount} currency />
                        </Badge>
                      </div>
                      
                      {expense.notes && (
                        <p className="text-sm text-gray-600 mb-2">{expense.notes}</p>
                      )}

                      <div className="text-xs text-gray-500">
                        ID: {expense.id}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {/* View Attachments Button */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setViewingAttachments({expense, isOpen: true})}
                        className="relative"
                      >
                        <Eye className="h-4 w-4" />
                        {expense.attachments && expense.attachments.length > 0 && (
                          <Badge
                            variant="secondary"
                            className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs flex items-center justify-center"
                          >
                            {expense.attachments.length}
                          </Badge>
                        )}
                      </Button>

                      {permissions?.canEditExpenses && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(expense)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(expense)}
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
              <TrendingDown className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد مصاريف</h3>
              <p className="text-gray-600">لم يتم تسجيل أي مصاريف بعد</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Attachments Dialog */}
      <Dialog open={viewingAttachments.isOpen} onOpenChange={(open) => setViewingAttachments({...viewingAttachments, isOpen: open})}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>مرفقات المصروف</DialogTitle>
            <DialogDescription>
              {viewingAttachments.expense.category} - <Number value={viewingAttachments.expense.amount} currency />
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {viewingAttachments.expense.attachments && viewingAttachments.expense.attachments.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {viewingAttachments.expense.attachments.map((attachment, index) => (
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
                  لم يتم رفع أي مرفقات مع هذا المصروف
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Category Manager */}
      <CategoryManager
        isOpen={isCategoryManagerOpen}
        onClose={() => setIsCategoryManagerOpen(false)}
        categories={categories}
        onCategoriesChange={setCategories}
      />

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
