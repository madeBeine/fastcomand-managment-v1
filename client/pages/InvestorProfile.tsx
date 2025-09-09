import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User, Wallet, TrendingUp, ArrowDownRight, Phone, Calendar } from 'lucide-react';

interface InvestorData {
  id: string;
  name: string;
  phone: string;
  sharePercentage: number;
  totalInvested: number;
  totalProfit: number;
  totalWithdrawn: number;
  currentBalance: number;
  createdAt: string;
}

interface Withdrawal {
  id: string;
  investorName: string;
  amount: number;
  date: string;
  notes: string;
  approvedBy: string;
  createdAt: string;
}

interface ProfileData {
  profile: InvestorData;
  withdrawals: Withdrawal[];
}

export default function InvestorProfile() {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const controller = new AbortController();
    fetchProfileData(controller.signal);

    return () => {
      controller.abort();
    };
  }, []);

  const fetchProfileData = async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      setError(''); // Clear previous errors
      const token = localStorage.getItem('authToken');

      if (!token) {
        throw new Error('لم يتم العثور على رمز المصاد��ة');
      }

      const response = await window.fetch('/api/investor/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        signal
      });

      // Check if request was aborted
      if (signal?.aborted) {
        return;
      }

      // Read the response body only once
      let responseData;
      try {
        responseData = await response.json();
      } catch (parseError) {
        throw new Error('خطأ في تحليل البيانات المستلمة');
      }

      if (!response.ok) {
        throw new Error(responseData?.message || `خطأ في الخادم: ${response.status}`);
      }

      if (signal?.aborted) {
        return;
      }

      setProfileData(responseData.data);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return; // Request was cancelled, don't show error
      }

      console.error('Error fetching profile:', error);
      setError(error?.message || 'حدث خطأ في جلب البيانات');
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-700">
            {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="p-6">
        <Alert>
          <AlertDescription>
            لا توجد بيانات متاحة
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const { profile, withdrawals } = profileData;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <User className="h-8 w-8 text-investment-primary-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">الملف الشخصي</h1>
          <p className="text-gray-600">مرحباً بك، {user?.name}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Share Percentage */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">نسبة المشاركة</CardTitle>
            <TrendingUp className="h-4 w-4 text-investment-primary-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-investment-primary-700">
              {profile.sharePercentage}%
            </div>
            <p className="text-xs text-gray-600">
              من إجمالي المشروع
            </p>
          </CardContent>
        </Card>

        {/* Total Invested */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المبلغ المستثمر</CardTitle>
            <Wallet className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">
              {profile.totalInvested.toLocaleString()} MRU
            </div>
            <p className="text-xs text-gray-600">
              إجمالي الاستثمار
            </p>
          </CardContent>
        </Card>

        {/* Total Profit */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الأرباح</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">
              {profile.totalProfit.toLocaleString()} MRU
            </div>
            <p className="text-xs text-gray-600">
              أرباح محققة
            </p>
          </CardContent>
        </Card>

        {/* Current Balance */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الرصيد الحالي</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-700">
              {(profile.expectedEffectiveProfit || 0).toLocaleString()} MRU
            </div>
            <p className="text-xs text-gray-600">
              متاح للسحب
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            المعلومات الشخصية
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-700">الاسم الكامل</p>
                <p className="text-gray-900">{profile.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-700">رقم الهاتف</p>
                <p className="text-gray-900">{profile.phone}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-700">تاريخ الانضمام</p>
                <p className="text-gray-900">{new Date(profile.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="bg-investment-primary-100 text-investment-primary-700">
                مستثمر
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Withdrawals History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowDownRight className="h-5 w-5" />
            سجل السحوبات الشخصية
          </CardTitle>
          <CardDescription>
            جميع السحوبات التي قمت بها من المشروع
          </CardDescription>
        </CardHeader>
        <CardContent>
          {withdrawals.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              لا توجد سحوبات مسجلة حتى الآن
            </div>
          ) : (
            <div className="space-y-3">
              {withdrawals.map((withdrawal) => (
                <div
                  key={withdrawal.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-lg">
                        {withdrawal.amount.toLocaleString()} MRU
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {withdrawal.date}
                      </Badge>
                    </div>
                    {withdrawal.notes && (
                      <p className="text-sm text-gray-600 mb-1">{withdrawal.notes}</p>
                    )}
                    <p className="text-xs text-gray-500">
                      اعتمد من: {withdrawal.approvedBy}
                    </p>
                  </div>
                  <ArrowDownRight className="h-5 w-5 text-red-500" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
