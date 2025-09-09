import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Logo } from '@/components/Logo';
import { Loader2, TrendingUp } from 'lucide-react';
import { LoginCredentials } from '../../shared/types';

export default function Login() {
  const { login } = useAuth();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    identifier: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent duplicate submissions
    if (isLoading) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await login(credentials);

      if (!result.success) {
        setError(result.message || 'حدث خطأ أثناء تسجيل الدخول');
      }
    } catch (err) {
      console.error('Submit error:', err);
      setError('حدث خطأ غير متوقع');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof LoginCredentials) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCredentials(prev => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-investment-primary-50 via-white to-investment-secondary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <Logo size="xl" showText={false} />
          </div>
          <h1 className="text-3xl font-bold text-investment-primary-900 mb-2">
            نظام إدارة الاستثمار
          </h1>
          <p className="text-investment-primary-600">
            تسجيل الدخول إلى حسابك
          </p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-xl text-investment-primary-900">
              مرحباً بك
            </CardTitle>
            <CardDescription>
              يرجى إدخال بيانات تسجيل الدخول
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="identifier">اسم المستخدم أو رقم الهاتف</Label>
                <Input
                  id="identifier"
                  type="text"
                  value={credentials.identifier}
                  onChange={handleInputChange('identifier')}
                  placeholder="أدخل اسم المستخدم أو رقم الهاتف"
                  required
                  disabled={isLoading}
                  className="text-right"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">كلمة المرور</Label>
                <Input
                  id="password"
                  type="password"
                  value={credentials.password}
                  onChange={handleInputChange('password')}
                  placeholder="أدخل كلمة المرور"
                  required
                  disabled={isLoading}
                  className="text-right"
                />
              </div>
            </CardContent>
            
            <CardFooter>
              <Button 
                type="submit" 
                className="w-full bg-investment-primary-600 hover:bg-investment-primary-700"
                disabled={isLoading || !credentials.identifier || !credentials.password}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    جاري تسجيل الدخول...
                  </>
                ) : (
                  'تسجيل الدخول'
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Support Contact Info */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-sm text-blue-800 flex items-center">
              <TrendingUp className="ml-2 h-4 w-4" />
              الدعم الفني
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <div className="bg-white p-3 rounded border text-center">
              <p className="text-gray-700 mb-2">
                إذا واجهت أي مشكلة في التطبيق
              </p>
              <p className="text-gray-900 font-semibold">
                تواصل مع المدير على:
                <span className="text-blue-600 font-bold"> 32768057</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
