import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useApi, useApiMutation } from '@/hooks/useApi';
import { 
  Users as UsersIcon, 
  Plus, 
  Edit, 
  Trash2, 
  AlertTriangle,
  Loader2,
  Shield,
  User,
  Eye,
  EyeOff,
  Phone,
  KeyRound
} from 'lucide-react';
import { User as UserType } from '../../shared/types';

interface UserFormData {
  name: string;
  phone: string;
  role: 'Admin' | 'Assistant' | 'Investor';
  password: string;
}

const initialFormData: UserFormData = {
  name: '',
  phone: '',
  role: 'Assistant',
  password: '',
};

export default function Users() {
  const { user, permissions } = useAuth();
  const { data: users, loading, error, refetch } = useApi<UserType[]>('/users');
  
  // Create mutations with auto-refresh
  const addMutation = useApiMutation('/users', {
    onSuccess: () => {
      refetch();
    }
  });
  const updateMutation = useApiMutation('/users', {
    onSuccess: () => {
      refetch();
    }
  });
  const deleteMutation = useApiMutation('/users', {
    onSuccess: () => {
      refetch();
    }
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [formData, setFormData] = useState<UserFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (field: keyof UserFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleRoleChange = (role: 'Admin' | 'Assistant' | 'Investor') => {
    setFormData(prev => ({ ...prev, role }));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setFormErrors('اسم المستخدم مطلوب');
      return false;
    }
    if (!formData.phone.trim()) {
      setFormErrors('رقم الهاتف مطلوب');
      return false;
    }
    if (!editingUser && !formData.password.trim()) {
      setFormErrors('كلمة المرور مطلوبة للمستخدم الجديد');
      return false;
    }
    if (formData.password && formData.password.length < 6) {
      setFormErrors('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return false;
    }
    setFormErrors(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const submitData = {
      name: formData.name,
      phone: formData.phone,
      role: formData.role,
      ...(formData.password && { password: formData.password })
    };

    const result = editingUser
      ? await updateMutation.mutate({ ...submitData, id: editingUser.id }, 'PUT')
      : await addMutation.mutate(submitData);

    if (result.success) {
      setIsDialogOpen(false);
      setEditingUser(null);
      setFormData(initialFormData);
      setShowPassword(false);
    }
  };

  const handleEdit = (user: UserType) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      phone: user.phone || '',
      role: user.role,
      password: '', // Don't pre-fill password for security
    });
    setShowPassword(false);
    setIsDialogOpen(true);
  };

  const handleDelete = async (userToDelete: UserType) => {
    if (userToDelete.id === user?.id) {
      alert('لا يمكنك حذف حسابك الشخصي');
      return;
    }
    
    if (window.confirm(`هل أنت متأكد من حذف المستخدم "${userToDelete.name}"؟`)) {
      const result = await deleteMutation.mutate({ id: userToDelete.id }, 'DELETE');
    }
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingUser(null);
    setFormData(initialFormData);
    setFormErrors(null);
    setShowPassword(false);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Admin':
        return 'bg-red-100 text-red-800';
      case 'Assistant':
        return 'bg-blue-100 text-blue-800';
      case 'Investor':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Admin':
        return <Shield className="h-4 w-4" />;
      case 'Assistant':
        return <User className="h-4 w-4" />;
      case 'Investor':
        return <UsersIcon className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  if (!permissions?.canViewAllData && user?.role !== 'Admin') {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-4">غير مصرح</h1>
        <p className="text-gray-600">ليس لديك صلاحية لإدارة المستخدمين</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-investment-primary-600" />
        <span className="mr-2 text-investment-primary-600">جاري تحميل المستخدمين...</span>
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
          <UsersIcon className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">إدارة المستخدمين</h1>
            <p className="text-gray-600">إدارة حسابات المستخدمين وصلاحياتهم</p>
          </div>
        </div>
        
        {(permissions?.canEditSettings || user?.role === 'Admin') && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 ml-2" />
                إضافة مستخدم
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingUser ? 'تعديل مستخدم' : 'إضافة مستخدم جديد'}
                </DialogTitle>
                <DialogDescription>
                  {editingUser ? 'تعديل بيانات المستخدم وصلاحياته' : 'أدخل بيانات المستخدم الجديد'}
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
                  <Label htmlFor="name">اسم المستخدم</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={handleInputChange('name')}
                    placeholder="أدخل اسم المستخدم"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">رقم الهاتف</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={handleInputChange('phone')}
                    placeholder="+222 12345678"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">الدور</Label>
                  <Select value={formData.role} onValueChange={handleRoleChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Admin">مدير - صلاحيات كاملة</SelectItem>
                      <SelectItem value="Assistant">مساعد - صلاحيات محدودة</SelectItem>
                      <SelectItem value="Investor">مستثمر - عرض فقط</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">
                    {editingUser ? 'كلمة المرور الجديدة (اختياري)' : 'كلمة المرور'}
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleInputChange('password')}
                      placeholder={editingUser ? 'اتركها فارغة للاحتفاظ بالكلمة القديمة' : 'أدخل كلمة المرور'}
                      required={!editingUser}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute left-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <DialogFooter className="gap-2">
                  <Button type="button" variant="outline" onClick={closeDialog}>
                    إلغاء
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={addMutation.loading || updateMutation.loading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {(addMutation.loading || updateMutation.loading) ? (
                      <Loader2 className="h-4 w-4 animate-spin ml-2" />
                    ) : null}
                    {editingUser ? 'تحديث' : 'إضافة'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">إجمالي المستخدمين</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-investment-primary-600">
              <span className="number">{users?.length || 0}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">المديرون</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              <span className="number">{users?.filter(u => u.role === 'Admin').length || 0}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">المساعدون</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              <span className="number">{users?.filter(u => u.role === 'Assistant').length || 0}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة المستخدمين</CardTitle>
          <CardDescription>
            جميع المستخدمين المسجلين في النظام
          </CardDescription>
        </CardHeader>
        <CardContent>
          {users && users.length > 0 ? (
            <div className="space-y-4">
              {users.map((userItem) => (
                <div key={userItem.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 rounded-lg ${getRoleBadgeColor(userItem.role).replace('text-', 'bg-').replace('bg-', 'bg-opacity-10 bg-')}`}>
                          {getRoleIcon(userItem.role)}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{userItem.name}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Phone className="h-4 w-4" />
                              <span className="number">{userItem.phone}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <KeyRound className="h-4 w-4" />
                              <span>ID: <span className="number">{userItem.id}</span></span>
                            </div>
                          </div>
                        </div>
                        <Badge className={getRoleBadgeColor(userItem.role)}>
                          {userItem.role === 'Admin' ? 'مدير' : 
                           userItem.role === 'Assistant' ? 'مساعد' : 'مستثمر'}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {(permissions?.canEditSettings || user?.role === 'Admin') && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(userItem)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(userItem)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            disabled={userItem.id === user?.id}
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
              <UsersIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">لا يوجد مستخدمون</h3>
              <p className="text-gray-600">لم يتم تسجيل أي مستخدمين بعد</p>
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
