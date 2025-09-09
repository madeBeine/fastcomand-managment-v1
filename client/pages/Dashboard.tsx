import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Number } from '@/components/ui/number';
import { useDashboard } from '@/hooks/useApi';
import { useAuth } from '@/contexts/AuthContext';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  ArrowDownToLine, 
  RefreshCw,
  Calendar,
  Activity,
  BarChart3,
  PieChart,
  AlertTriangle
} from 'lucide-react';
import { DashboardStats, Investor, Expense, Revenue, Withdrawal } from '../../shared/types';
import { Link } from 'react-router-dom';
import LoadingScreen from '@/components/LoadingScreen';


export default function Dashboard() {
  const { user, permissions } = useAuth();
  const { data, loading, error, refetch } = useDashboard();
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }));

  useEffect(() => {
    if (data) {
      setLastUpdated(new Date().toLocaleString('en-US'));
    }
  }, [data]);

  // Always render page; show animated loading overlay instead of plain text

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-center">
        <div>
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={refetch} variant="outline">
            <RefreshCw className="ml-2 h-4 w-4" />
            إعادة المحاولة
          </Button>
        </div>
      </div>
    );
  }

  const stats: DashboardStats = data?.stats || {};
  const investors: Investor[] = data?.investors || [];
  const expenses: Expense[] = data?.expenses || [];
  const revenues: Revenue[] = data?.revenues || [];
  const withdrawals: Withdrawal[] = data?.withdrawals || [];

  // Get recent activities
  const recentActivities = [
    ...expenses.slice(0, 3).map(e => ({
      type: 'مصروف',
      description: e.category,
      amount: e.amount,
      date: e.date,
      color: 'text-red-600',
      icon: TrendingDown
    })),
    ...revenues.slice(0, 3).map(r => ({
      type: 'إيراد',
      description: r.description,
      amount: r.amount,
      date: r.date,
      color: 'text-green-600',
      icon: TrendingUp
    })),
    ...withdrawals.slice(0, 2).map(w => ({
      type: 'سحب',
      description: `سحب - ${w.investorName}`,
      amount: w.amount,
      date: w.date,
      color: 'text-blue-600',
      icon: ArrowDownToLine
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  return (
    <div className="space-y-6">
      <LoadingScreen loading={loading} />
      {/* API Test - Temporary Debug Component */}


      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            مرحباً {user?.name}
          </h1>
          <p className="text-gray-600 mt-1 text-sm">
            نظرة عامة على أداء المشروع والاستثمارات
          </p>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>

          </div>
        </div>
        <Button onClick={refetch} variant="outline" className="w-full sm:w-auto">
          <RefreshCw className="ml-2 h-4 w-4" />
          تحديث البيانات
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="border-investment-success-200 bg-investment-success-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-investment-success-700">
              إجمالي الإيرادات
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-investment-success-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-investment-success-800">
              <Number value={stats.totalRevenue || 0} currency />
            </div>
          </CardContent>
        </Card>

        <Card className="border-investment-error-200 bg-investment-error-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-investment-error-700">
              إجمالي المصاريف
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-investment-error-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-investment-error-800">
              <Number value={stats.totalExpenses || 0} currency />
            </div>
          </CardContent>
        </Card>

        <Card className="border-investment-primary-200 bg-investment-primary-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-investment-primary-700">
              صافي الربح
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-investment-primary-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-investment-primary-800">
              <Number value={stats.totalProfit || 0} currency />
            </div>
            <p className="text-xs text-investment-primary-600 mt-1">
              الإيرادات - المصاريف | نمو: <Number value={stats.monthlyGrowth || 0} percentage decimal={1} />
            </p>
          </CardContent>
        </Card>

        <Card className="border-investment-warning-200 bg-investment-warning-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-investment-warning-700">
              المستثمرون النشطون
            </CardTitle>
            <Users className="h-4 w-4 text-investment-warning-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-investment-warning-800">
              <Number value={stats.activeInvestors || 0} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Summary - New Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card className="border-investment-secondary-200 bg-investment-secondary-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-investment-secondary-700">
              رصيد المشروع (15%)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-investment-secondary-800">
              <Number value={stats.projectBalance || 0} currency />
            </div>
            <p className="text-xs text-investment-secondary-600 mt-1">
              15% من صافي الربح
            </p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">
              الرصيد المتاح للتوزيع
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-blue-800">
              <Number value={stats.availableBalance || 0} currency />
            </div>
            <p className="text-xs text-blue-600 mt-1">
              صافي الربح - نسبة المشروع - سحوبات المشروع - سحوبات المستثمرين
            </p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">
              إجمالي السحوبات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-purple-800">
              <Number value={stats.totalWithdrawals || 0} currency />
            </div>
            <p className="text-xs text-purple-600 mt-1">
              سحوبات المستثمرين
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Recent Activities */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="ml-2 h-5 w-5" />
              آخر العمليات
            </CardTitle>
            <CardDescription>
              أحدث المعاملات المالية في النظام
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity, index) => {
                  const Icon = activity.icon;
                  return (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className={`p-2 rounded-lg bg-white ${activity.color}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="mr-3">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {activity.type}
                            </Badge>
                            <span className="font-medium">{activity.description}</span>
                          </div>
                          <p className="text-sm text-gray-600 number">
                            {new Date(activity.date).toLocaleDateString('en-US')}
                          </p>
                        </div>
                      </div>
                      <div className={`font-bold ${activity.color}`}>
                        <Number value={activity.amount} currency />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-500 text-center py-8">لا توجد عمليات حديثة</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="ml-2 h-5 w-5" />
              إجراءات سريعة
            </CardTitle>
            <CardDescription>
              الوصول السريع للعمليات الشائعة
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {permissions?.canEditRevenues && (
              <Link to="/revenues" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="ml-2 h-4 w-4 text-green-600" />
                  إضافة إيراد جديد
                </Button>
              </Link>
            )}
            
            {permissions?.canEditExpenses && (
              <Link to="/expenses" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <TrendingDown className="ml-2 h-4 w-4 text-red-600" />
                  إضافة مصروف جديد
                </Button>
              </Link>
            )}
            
            {permissions?.canViewInvestors && (
              <Link to="/investors" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="ml-2 h-4 w-4 text-blue-600" />
                  عرض المستثمرين
                </Button>
              </Link>
            )}
            
            {permissions?.canApproveWithdrawals && (
              <Link to="/withdrawals" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <ArrowDownToLine className="ml-2 h-4 w-4 text-purple-600" />
                  إدارة السحوبات
                </Button>
              </Link>
            )}

            {user?.role === 'Admin' && (
              <Link to="/project-withdrawals" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <ArrowDownToLine className="ml-2 h-4 w-4 text-orange-600" />
                  سحوبات المشروع
                </Button>
              </Link>
            )}

            {user?.role === 'Investor' && (
              <div className="pt-4 border-t">
                <h4 className="font-medium text-gray-900 mb-2">رصيدك الحالي</h4>
                {investors.length > 0 && (
                  <div className="bg-investment-primary-50 p-3 rounded-lg">
                    <p className="text-sm text-investment-primary-700">رصيدك المتاح:</p>
                    <p className="text-lg font-bold text-investment-primary-900">
                      <Number value={investors[0]?.expectedEffectiveProfit || 0} currency />
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>


    </div>
  );
}
