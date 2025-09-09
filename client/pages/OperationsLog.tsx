import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Number } from '@/components/ui/number';
import { useApi } from '@/hooks/useApi';
import { 
  ClipboardList, 
  Search, 
  Filter,
  AlertTriangle,
  Loader2,
  Calendar,
  User,
  Clock,
  Activity,
  Plus,
  Edit,
  Trash2,
  LogIn,
  LogOut,
  Settings,
  Eye,
  Download,
  Upload,
  Save,
  RefreshCw
} from 'lucide-react';

interface OperationLog {
  id: string;
  operationType: 'create' | 'update' | 'delete' | 'login' | 'logout' | 'view' | 'export' | 'import' | 'settings';
  entityType: 'investor' | 'expense' | 'revenue' | 'withdrawal' | 'user' | 'settings' | 'category' | 'system';
  entityId?: string;
  entityName?: string;
  details: string;
  previousData?: any;
  newData?: any;
  performedBy: string;
  performedById: string;
  userRole: string;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  errorMessage?: string;
}

// Operations log will be fetched from API
interface DatabaseOperationLog {
  id: string;
  operationType: string;
  details: string;
  date: string;
  performedBy: string;
  createdAt?: string;
}

// Mock operations log data for types that aren't in database yet
const mockOperationsLog: OperationLog[] = [
  {
    id: 'LOG001',
    operationType: 'login',
    entityType: 'system',
    details: 'تسجيل دخول المستخدم',
    performedBy: 'أحمد محمد',
    performedById: 'USER001',
    userRole: 'Admin',
    timestamp: '2024-01-30T10:30:00.000Z',
    ipAddress: '192.168.1.100',
    success: true
  },
  {
    id: 'LOG002',
    operationType: 'create',
    entityType: 'expense',
    entityId: 'EXP006',
    entityName: 'مواد خام',
    details: 'إضافة مصروف جديد: مواد خام بمبلغ 15000 MRU',
    newData: { category: 'مواد خام', amount: 15000, date: '2024-01-30' },
    performedBy: 'أحمد محمد',
    performedById: 'USER001',
    userRole: 'Admin',
    timestamp: '2024-01-30T10:45:00.000Z',
    success: true
  },
  {
    id: 'LOG003',
    operationType: 'update',
    entityType: 'investor',
    entityId: 'INV001',
    entityName: 'أحمد محمد',
    details: 'تعديل بيانات المستثمر: تحديث رقم الهاتف',
    previousData: { phone: '+222 12345678' },
    newData: { phone: '+222 12345679' },
    performedBy: 'فاطمة المحاسبة',
    performedById: 'USER002',
    userRole: 'Assistant',
    timestamp: '2024-01-30T11:15:00.000Z',
    success: true
  },
  {
    id: 'LOG004',
    operationType: 'create',
    entityType: 'withdrawal',
    entityId: 'WIT004',
    entityName: 'سحب لأحمد محمد',
    details: 'تسجيل سحب جديد: 5000 MRU لأحمد محمد',
    newData: { investorName: 'أحمد محمد', amount: 5000, date: '2024-01-30' },
    performedBy: 'أحمد محمد',
    performedById: 'USER001',
    userRole: 'Admin',
    timestamp: '2024-01-30T14:20:00.000Z',
    success: true
  },
  {
    id: 'LOG005',
    operationType: 'delete',
    entityType: 'expense',
    entityId: 'EXP004',
    entityName: 'مصروف خاطئ',
    details: 'حذف مصروف: مصروف تم إدخاله بالخطأ',
    previousData: { category: 'أخرى', amount: 500, date: '2024-01-29' },
    performedBy: 'أحمد محمد',
    performedById: 'USER001',
    userRole: 'Admin',
    timestamp: '2024-01-30T15:30:00.000Z',
    success: true
  },
  {
    id: 'LOG006',
    operationType: 'settings',
    entityType: 'settings',
    details: 'تعديل إعدادات النظام: تغيير نسبة المشروع من 10% إلى 15%',
    previousData: { projectPercentage: 10 },
    newData: { projectPercentage: 15 },
    performedBy: 'أحمد محمد',
    performedById: 'USER001',
    userRole: 'Admin',
    timestamp: '2024-01-30T16:00:00.000Z',
    success: true
  },
  {
    id: 'LOG007',
    operationType: 'export',
    entityType: 'system',
    details: 'تصدير تقرير المصاريف لشهر يناير',
    performedBy: 'فاطمة المحاسبة',
    performedById: 'USER002',
    userRole: 'Assistant',
    timestamp: '2024-01-30T16:45:00.000Z',
    success: true
  },
  {
    id: 'LOG008',
    operationType: 'create',
    entityType: 'revenue',
    entityId: 'REV006',
    entityName: 'مبيعات جديدة',
    details: 'إضافة إيراد جديد: مبيعات بمبلغ 25000 MRU',
    newData: { description: 'مبيعات جديدة', amount: 25000, date: '2024-01-30' },
    performedBy: 'محمد المبيعات',
    performedById: 'USER003',
    userRole: 'Assistant',
    timestamp: '2024-01-30T17:10:00.000Z',
    success: true
  },
  {
    id: 'LOG009',
    operationType: 'logout',
    entityType: 'system',
    details: 'تسجيل خروج المستخدم',
    performedBy: 'أحمد محمد',
    performedById: 'USER001',
    userRole: 'Admin',
    timestamp: '2024-01-30T18:00:00.000Z',
    success: true
  }
];

export default function OperationsLog() {
  const { user, permissions } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [operationTypeFilter, setOperationTypeFilter] = useState<string>('all');
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [userFilter, setUserFilter] = useState<string>('all');

  // Fetch real operations log from API
  const { data: operationsData, loading, error } = useApi<DatabaseOperationLog[]>('/operations-log');

  // Show error state if API fails
  if (error) {
    console.error('Operations log error:', error);
  }

  // Convert database operations to display format, with fallback for errors
  const operations: OperationLog[] = error ?
    // Fallback operations if API fails
    [{
      id: 'FALLBACK_001',
      operationType: 'view' as any,
      entityType: 'system' as any,
      details: 'تعذر تحميل سجل العمليات من الخادم',
      performedBy: 'النظام',
      performedById: 'SYSTEM',
      userRole: 'System',
      timestamp: new Date().toISOString(),
      success: false,
      errorMessage: error
    }] :
    // Normal operation mapping
    (operationsData || [])
      .filter(op => op && op.id) // Filter out any null/undefined operations
      .map(op => ({
        id: op.id || 'UNKNOWN',
        operationType: getOperationTypeFromString(op.operationType) as any,
        entityType: getEntityTypeFromString(op.operationType) as any,
        details: op.details || 'لا توجد تفاصيل',
        performedBy: op.performedBy || 'مستخدم غير محدد',
        performedById: op.performedBy || 'UNKNOWN',
        userRole: op.performedBy ? (op.performedBy.includes('النظام') ? 'System' : 'User') : 'Unknown',
        timestamp: op.createdAt || op.date || new Date().toISOString(),
        success: true
      }));

  // Helper functions to extract type from operation type string
  function getOperationTypeFromString(opType: string | undefined | null): string {
    if (!opType || typeof opType !== 'string') return 'view';

    if (opType.includes('إضافة') || opType.includes('تسجيل')) return 'create';
    if (opType.includes('تعديل')) return 'update';
    if (opType.includes('حذف')) return 'delete';
    if (opType.includes('تسجيل دخول')) return 'login';
    if (opType.includes('تسجيل خروج')) return 'logout';
    if (opType.includes('إعدادات')) return 'settings';
    return 'view';
  }

  function getEntityTypeFromString(opType: string | undefined | null): string {
    if (!opType || typeof opType !== 'string') return 'system';

    if (opType.includes('مستثمر')) return 'investor';
    if (opType.includes('مصروف')) return 'expense';
    if (opType.includes('إيراد')) return 'revenue';
    if (opType.includes('سحب')) return 'withdrawal';
    if (opType.includes('إعدادات')) return 'settings';
    if (opType.includes('تهيئة') || opType.includes('النظام')) return 'system';
    return 'system';
  }

  // Filter operations based on filters and search
  const filteredOperations = operations.filter(op => {
    const matchesSearch = op.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         op.performedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (op.entityName && op.entityName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesOperationType = operationTypeFilter === 'all' || op.operationType === operationTypeFilter;
    const matchesEntityType = entityTypeFilter === 'all' || op.entityType === entityTypeFilter;
    const matchesUser = userFilter === 'all' || op.performedBy === userFilter;
    
    // Date filter logic
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const opDate = new Date(op.timestamp);
      const now = new Date();
      
      switch (dateFilter) {
        case 'today':
          matchesDate = opDate.toDateString() === now.toDateString();
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = opDate >= weekAgo;
          break;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          matchesDate = opDate >= monthAgo;
          break;
      }
    }
    
    return matchesSearch && matchesOperationType && matchesEntityType && matchesUser && matchesDate;
  });

  const getOperationIcon = (type: string) => {
    switch (type) {
      case 'create': return <Plus className="h-4 w-4 text-green-600" />;
      case 'update': return <Edit className="h-4 w-4 text-blue-600" />;
      case 'delete': return <Trash2 className="h-4 w-4 text-red-600" />;
      case 'login': return <LogIn className="h-4 w-4 text-green-600" />;
      case 'logout': return <LogOut className="h-4 w-4 text-gray-600" />;
      case 'view': return <Eye className="h-4 w-4 text-gray-600" />;
      case 'export': return <Download className="h-4 w-4 text-purple-600" />;
      case 'import': return <Upload className="h-4 w-4 text-purple-600" />;
      case 'settings': return <Settings className="h-4 w-4 text-orange-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getOperationTypeName = (type: string) => {
    switch (type) {
      case 'create': return 'إضافة';
      case 'update': return 'تعديل';
      case 'delete': return 'حذف';
      case 'login': return 'دخول';
      case 'logout': return 'خروج';
      case 'view': return 'عرض';
      case 'export': return 'تصدير';
      case 'import': return 'استيراد';
      case 'settings': return 'إعدادات';
      default: return type;
    }
  };

  const getEntityTypeName = (type: string) => {
    switch (type) {
      case 'investor': return 'مستثمر';
      case 'expense': return 'مصروف';
      case 'revenue': return 'إيراد';
      case 'withdrawal': return 'سحب';
      case 'user': return 'مستخدم';
      case 'settings': return 'إعدادات';
      case 'category': return 'فئة';
      case 'system': return 'نظام';
      default: return type;
    }
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case 'Admin': return 'مدير';
      case 'Assistant': return 'مساعد';
      case 'Investor': return 'مستثمر';
      default: return role;
    }
  };

  const formatTimestamp = (operation: any) => {
    // Try to get timestamp from different fields
    const timestamp = operation.timestamp || operation.createdAt || operation.date;

    if (!timestamp) {
      return 'غير محدد';
    }

    // If it's already in Arabic format, return as is
    if (typeof timestamp === 'string' && timestamp.includes('م') || timestamp.includes('ص')) {
      return timestamp;
    }

    try {
      return new Date(timestamp).toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
    } catch (error) {
      return timestamp; // Return original if can't parse
    }
  };

  // Get unique users for filter
  const uniqueUsers = Array.from(new Set(operations.map(op => op.performedBy)));

  if (!permissions?.canViewAllData && user?.role !== 'Admin') {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-4">غير مصرح</h1>
        <p className="text-gray-600">ليس لديك صلاحية لعرض سجل العمليات</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-investment-primary-600" />
        <span className="mr-2 text-investment-primary-600">جاري تحميل سجل العمليات...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <ClipboardList className="h-8 w-8 text-investment-primary-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">سجل العمليات</h1>
          <p className="text-gray-600">سجل شامل لجميع العمليات والأنشطة في النظام</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            فلترة السجل
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {/* Search */}
            <div className="space-y-2">
              <Label>البحث</Label>
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="ابحث في التفاصيل..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>

            {/* Operation Type Filter */}
            <div className="space-y-2">
              <Label>نوع العملية</Label>
              <Select value={operationTypeFilter} onValueChange={setOperationTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع العمليات</SelectItem>
                  <SelectItem value="create">إضافة</SelectItem>
                  <SelectItem value="update">تعديل</SelectItem>
                  <SelectItem value="delete">حذف</SelectItem>
                  <SelectItem value="login">دخول</SelectItem>
                  <SelectItem value="logout">خروج</SelectItem>
                  <SelectItem value="export">تصدير</SelectItem>
                  <SelectItem value="settings">إعدادات</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Entity Type Filter */}
            <div className="space-y-2">
              <Label>نوع الكائن</Label>
              <Select value={entityTypeFilter} onValueChange={setEntityTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الكائنات</SelectItem>
                  <SelectItem value="investor">مستثمرون</SelectItem>
                  <SelectItem value="expense">مصاريف</SelectItem>
                  <SelectItem value="revenue">إيرادات</SelectItem>
                  <SelectItem value="withdrawal">سحوبات</SelectItem>
                  <SelectItem value="user">مستخدمون</SelectItem>
                  <SelectItem value="settings">إعدادات</SelectItem>
                  <SelectItem value="system">نظام</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Filter */}
            <div className="space-y-2">
              <Label>الفترة الزمنية</Label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الفترات</SelectItem>
                  <SelectItem value="today">اليوم</SelectItem>
                  <SelectItem value="week">آخر أسبوع</SelectItem>
                  <SelectItem value="month">آخر شهر</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* User Filter */}
            <div className="space-y-2">
              <Label>المستخدم</Label>
              <Select value={userFilter} onValueChange={setUserFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع المستخدمين</SelectItem>
                  {uniqueUsers.map(userName => (
                    <SelectItem key={userName} value={userName}>
                      {userName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results Summary */}
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              عرض {filteredOperations.length} من أصل {operations.length} عملية
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setOperationTypeFilter('all');
                setEntityTypeFilter('all');
                setDateFilter('all');
                setUserFilter('all');
              }}
            >
              <RefreshCw className="h-4 w-4 ml-2" />
              إعادة تعيين
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Operations List */}
      <Card>
        <CardHeader>
          <CardTitle>السجل التفصيلي</CardTitle>
          <CardDescription>
            جميع العمليات مرتبة حسب الوقت (الأحدث أولاً)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredOperations.length > 0 ? (
            <div className="space-y-4">
              {filteredOperations
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .map((operation) => (
                <div key={operation.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-4">
                    {/* Operation Icon */}
                    <div className="p-2 bg-gray-100 rounded-lg flex-shrink-0">
                      {getOperationIcon(operation.operationType)}
                    </div>

                    {/* Operation Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">
                          {getOperationTypeName(operation.operationType)}
                        </Badge>
                        <Badge variant="secondary">
                          {getEntityTypeName(operation.entityType)}
                        </Badge>
                        {operation.entityId && (
                          <Badge variant="outline" className="text-xs">
                            ID: {operation.entityId}
                          </Badge>
                        )}
                      </div>

                      <p className="text-sm font-medium text-gray-900 mb-2">
                        {operation.details}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>{operation.performedBy || 'مستخدم غير محدد'}</span>
                          <Badge variant="outline" className="text-xs">
                            {getRoleName(operation.userRole)}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span className="number">{formatTimestamp(operation)}</span>
                        </div>

                        {operation.ipAddress && (
                          <div className="flex items-center gap-1">
                            <Activity className="h-3 w-3" />
                            <span className="number">{operation.ipAddress}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-1">
                          <span>ID:</span>
                          <span className="number">{operation.id}</span>
                        </div>
                      </div>

                      {/* Data Changes */}
                      {(operation.previousData || operation.newData) && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg text-xs">
                          {operation.previousData && (
                            <div className="mb-2">
                              <span className="font-medium text-red-700">البيانات السابقة:</span>
                              <code className="block mt-1 text-red-600">
                                {JSON.stringify(operation.previousData, null, 2)}
                              </code>
                            </div>
                          )}
                          {operation.newData && (
                            <div>
                              <span className="font-medium text-green-700">البيانات الجديدة:</span>
                              <code className="block mt-1 text-green-600">
                                {JSON.stringify(operation.newData, null, 2)}
                              </code>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Success Indicator */}
                    <div className="flex-shrink-0">
                      {operation.success ? (
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      ) : (
                        <div className="w-3 h-3 bg-red-500 rounded-full" title={operation.errorMessage}></div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد عمليات</h3>
              <p className="text-gray-600">لا توجد عمليات تطابق المعايير المحددة</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
