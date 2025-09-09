import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Number } from '@/components/ui/number';
import { useApi } from '@/hooks/useApi';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  BarChart3, 
  AlertTriangle,
  Loader2,
  Target,
  Calendar,
  DollarSign,
  Users,
  Activity,
  Lightbulb,
  CheckCircle2,
  XCircle,
  Eye,
  Zap
} from 'lucide-react';
import { Investor, Expense, Revenue, Withdrawal, DashboardStats } from '../../shared/types';

// AI insights data from OpenAI
interface AIInsight {
  id: string;
  type: 'positive' | 'negative' | 'neutral';
  title: string;
  description: string;
  recommendation?: string;
  impact: 'high' | 'medium' | 'low';
  category: 'revenue' | 'expense' | 'investor' | 'profit' | 'risk';
}

interface InsightsResponse {
  success: boolean;
  insights: AIInsight[];
  metadata?: {
    generatedAt: string;
    dataPoints: {
      investors: number;
      expenses: number;
      revenues: number;
      withdrawals: number;
    };
  };
}

interface TrendData {
  period: string;
  revenue: number;
  expenses: number;
  profit: number;
}

interface InvestorPerformance {
  name: string;
  investedAmount: number;
  currentBalance: number;
  withdrawnAmount: number;
  roi: number;
  sharePercentage: number;
}

export default function Insights() {
  const { user, permissions } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<'3months' | '6months' | '1year'>('3months');
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [insightsMetadata, setInsightsMetadata] = useState<any>(null);

  const { data: stats, loading: statsLoading } = useApi<DashboardStats>('/dashboard/stats');
  const { data: investors, loading: investorsLoading } = useApi<Investor[]>('/investors');
  const { data: expenses, loading: expensesLoading } = useApi<Expense[]>('/expenses');
  const { data: revenues, loading: revenuesLoading } = useApi<Revenue[]>('/revenues');
  const { data: withdrawals, loading: withdrawalsLoading } = useApi<Withdrawal[]>('/withdrawals');

  const loading = statsLoading || investorsLoading || expensesLoading || revenuesLoading || withdrawalsLoading;

  // Generate AI insights using OpenAI
  const generateAIInsights = async () => {
    if (!stats || !investors || !expenses || !revenues) {
      console.log('Data not ready for insights generation');
      return;
    }

    setLoadingInsights(true);
    try {
      const token = localStorage.getItem('authToken');
      // Use native fetch to avoid FullStory interference
      const nativeFetch = window.fetch;
      const response = await nativeFetch('/api/insights/generate', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: InsightsResponse = await response.json();

      if (data.success && data.insights) {
        setAiInsights(data.insights);
        setInsightsMetadata(data.metadata);
      } else {
        console.error('Failed to generate insights:', data);
        // Fall back to local insights if API fails
        setAiInsights(getFallbackInsights());
      }
    } catch (error) {
      console.error('Error generating AI insights:', error);
      // Fall back to local insights if API fails
      setAiInsights(getFallbackInsights());
    } finally {
      setLoadingInsights(false);
    }
  };

  // Fallback insights in case OpenAI fails
  const getFallbackInsights = (): AIInsight[] => {
    if (!stats || !investors || !expenses || !revenues) return [];

    const insights: AIInsight[] = [];
    const profitMargin = stats.totalRevenue > 0 ? (stats.totalProfit / stats.totalRevenue) * 100 : 0;

    // Profit margin analysis
    if (profitMargin > 20) {
      insights.push({
        id: 'fallback-1',
        type: 'positive',
        title: 'هامش ربح ممتاز',
        description: `هامش الربح الحالي ${profitMargin.toFixed(1)}% يعتبر ممتازاً ويدل على كفاءة عالية في إدارة المشروع`,
        recommendation: 'استمر في نفس الاستراتيجية وفكر في زيادة الاستثمار',
        impact: 'high',
        category: 'profit'
      });
    } else if (profitMargin < 10) {
      insights.push({
        id: 'fallback-2',
        type: 'negative',
        title: 'هامش ربح منخفض',
        description: `هامش الربح الحالي ${profitMargin.toFixed(1)}% أقل من المتوقع`,
        recommendation: 'راجع المصروفات وابحث عن طرق لزيادة الإيرادات أو تقليل التكاليف',
        impact: 'high',
        category: 'profit'
      });
    }

    return insights;
  };

  // Generate insights when data is ready
  useEffect(() => {
    if (!loading && stats && investors && expenses && revenues && user?.role !== 'Investor') {
      generateAIInsights();
    }
  }, [loading, stats, investors, expenses, revenues, user?.role]);

  // Generate trend data (mock data for now)
  const generateTrendData = (): TrendData[] => {
    if (!revenues || !expenses) return [];

    const periods = selectedPeriod === '3months' ? 3 : selectedPeriod === '6months' ? 6 : 12;
    const trendData: TrendData[] = [];
    
    for (let i = periods - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const period = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      
      // Calculate actual data for each month (simplified)
      const monthRevenues = revenues.filter(r => {
        const revDate = new Date(r.date);
        return revDate.getMonth() === date.getMonth() && revDate.getFullYear() === date.getFullYear();
      }).reduce((sum, r) => sum + r.amount, 0);
      
      const monthExpenses = expenses.filter(e => {
        const expDate = new Date(e.date);
        return expDate.getMonth() === date.getMonth() && expDate.getFullYear() === date.getFullYear();
      }).reduce((sum, e) => sum + e.amount, 0);

      trendData.push({
        period,
        revenue: monthRevenues,
        expenses: monthExpenses,
        profit: monthRevenues - monthExpenses
      });
    }
    
    return trendData;
  };

  // Calculate investor performance
  const calculateInvestorPerformance = (): InvestorPerformance[] => {
    if (!investors || !withdrawals) return [];

    return investors.map(investor => {
      const investorWithdrawals = withdrawals.filter(w => w.investorName === investor.name);
      const withdrawnAmount = investorWithdrawals.reduce((sum, w) => sum + w.amount, 0);
      
      // Calculate ROI (simplified)
      const totalReturn = investor.currentBalance + withdrawnAmount;
      const roi = investor.investedAmount > 0 ? ((totalReturn - investor.investedAmount) / investor.investedAmount) * 100 : 0;

      return {
        name: investor.name,
        investedAmount: investor.investedAmount,
        currentBalance: investor.currentBalance,
        withdrawnAmount,
        roi,
        sharePercentage: investor.sharePercentage
      };
    });
  };

  // Use AI insights instead of locally generated ones
  const trendData = generateTrendData();
  const investorPerformance = calculateInvestorPerformance();

  if (!permissions?.canViewInsights && user?.role !== 'Admin') {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-4">غير مصرح</h1>
        <p className="text-gray-600">ليس لديك صلاحية للوصول إلى التحليلات الذكية</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-investment-primary-600" />
        <span className="mr-2 text-investment-primary-600">جاري تحليل البيانات...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Brain className="h-8 w-8 text-purple-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">التحليل��ت الذكية</h1>
          <p className="text-gray-600">تحليلات مدعومة بالذكاء الاصطناعي لأداء المشروع</p>
        </div>
      </div>

      {/* Period Selection */}
      <div className="flex gap-2">
        {[
          { key: '3months', label: '3 أشهر' },
          { key: '6months', label: '6 أشهر' },
          { key: '1year', label: 'سنة' }
        ].map(period => (
          <Button
            key={period.key}
            variant={selectedPeriod === period.key ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedPeriod(period.key as any)}
          >
            {period.label}
          </Button>
        ))}
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-investment-primary-200 bg-gradient-to-br from-investment-primary-50 to-investment-primary-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-investment-primary-700 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              معدل العائد
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-investment-primary-800">
              <Number value={stats?.totalRevenue && stats?.totalExpenses ? 
                ((stats.totalRevenue - stats.totalExpenses) / stats.totalExpenses) * 100 : 0} 
                percentage 
              />
            </div>
            <p className="text-xs text-investment-primary-600 mt-1">مقارنة بالتكاليف</p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700 flex items-center gap-2">
              <Target className="h-4 w-4" />
              هامش الربح
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-800">
              <Number value={stats?.totalRevenue ? 
                (stats.totalProfit / stats.totalRevenue) * 100 : 0} 
                percentage 
              />
            </div>
            <p className="text-xs text-green-600 mt-1">من إجمالي الإيرادات</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 flex items-center gap-2">
              <Users className="h-4 w-4" />
              متوسط استثمار المستثمر
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-800">
              <Number value={investors?.length ? 
                investors.reduce((sum, inv) => sum + inv.investedAmount, 0) / investors.length : 0} 
                currency 
              />
            </div>
            <p className="text-xs text-blue-600 mt-1">لكل مستثمر</p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 flex items-center gap-2">
              <Activity className="h-4 w-4" />
              نمو الإيرادات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-800">
              +15.2%
            </div>
            <p className="text-xs text-purple-600 mt-1">مقارنة بالفترة السابقة</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            التحليلات الذكية
          </CardTitle>
          <CardDescription>
            تحليلات تلقائية مدعومة بالذكاء الاصطناعي لأداء مشروعك
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingInsights ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
              <span className="mr-2 text-purple-600">جاري توليد التحليلات الذكية...</span>
            </div>
          ) : aiInsights.length > 0 ? (
            <div className="space-y-4">
              {insightsMetadata && (
                <div className="mb-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-800">مدعوم بالذكاء الاصطناعي</span>
                  </div>
                  <p className="text-xs text-purple-600">
                    تم توليد التحليلات في {new Date(insightsMetadata.generatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    • {insightsMetadata.dataPoints.investors} مستثمر
                    • {insightsMetadata.dataPoints.expenses} مصروف
                    • {insightsMetadata.dataPoints.revenues} إيراد
                  </p>
                </div>
              )}
              {aiInsights.map((insight) => (
                <div key={insight.id} className={`p-4 rounded-lg border-l-4 ${
                  insight.type === 'positive' ? 'border-green-500 bg-green-50' :
                  insight.type === 'negative' ? 'border-red-500 bg-red-50' :
                  'border-blue-500 bg-blue-50'
                }`}>
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      insight.type === 'positive' ? 'bg-green-100 text-green-600' :
                      insight.type === 'negative' ? 'bg-red-100 text-red-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {insight.type === 'positive' ? <CheckCircle2 className="h-5 w-5" /> :
                       insight.type === 'negative' ? <XCircle className="h-5 w-5" /> :
                       <Eye className="h-5 w-5" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{insight.title}</h3>
                        <Badge variant={insight.impact === 'high' ? 'destructive' : 
                                      insight.impact === 'medium' ? 'default' : 'secondary'}>
                          {insight.impact === 'high' ? 'تأثير عالي' :
                           insight.impact === 'medium' ? 'تأثير متوسط' : 'تأثير منخفض'}
                        </Badge>
                      </div>
                      <p className="text-gray-700 mb-2">{insight.description}</p>
                      {insight.recommendation && (
                        <div className="p-3 bg-white/50 rounded-lg border">
                          <div className="flex items-center gap-2 mb-1">
                            <Zap className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm font-medium text-gray-700">التوصية:</span>
                          </div>
                          <p className="text-sm text-gray-600">{insight.recommendation}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">لا توجد تحليلات متاحة حالياً</p>
              <p className="text-sm text-gray-500 mt-2">
                أضف المزيد من البيانات للحصول على تحليلات أكثر دقة
              </p>
              <Button
                onClick={generateAIInsights}
                className="mt-4"
                disabled={loading || loadingInsights}
              >
                {loadingInsights ? (
                  <Loader2 className="h-4 w-4 animate-spin ml-2" />
                ) : (
                  <Brain className="h-4 w-4 ml-2" />
                )}
                توليد تحليلات ذكية
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Trend Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            تحليل الاتجاهات
          </CardTitle>
          <CardDescription>
            اتجاهات الإيرادات والمصروفات والأرباح خلال الفترة المحددة
          </CardDescription>
        </CardHeader>
        <CardContent>
          {trendData.length > 0 ? (
            <div className="space-y-4">
              {trendData.map((trend, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-gray-900">{trend.period}</h4>
                    <Badge variant={trend.profit > 0 ? 'default' : 'destructive'}>
                      <Number value={trend.profit} currency />
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <p className="text-gray-600">الإيرادات</p>
                      <p className="font-bold text-green-600">
                        <Number value={trend.revenue} currency />
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-600">المصروفات</p>
                      <p className="font-bold text-red-600">
                        <Number value={trend.expenses} currency />
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-600">الربح</p>
                      <p className={`font-bold ${trend.profit > 0 ? 'text-investment-primary-600' : 'text-red-600'}`}>
                        <Number value={trend.profit} currency />
                      </p>
                    </div>
                  </div>

                  {/* Simple visual bar */}
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-green-600 w-12">إي��ادات</span>
                      <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500 transition-all duration-300"
                          style={{ 
                            width: `${Math.max((trend.revenue / Math.max(...trendData.map(t => t.revenue))) * 100, 1)}%` 
                          }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-red-600 w-12">مصروفات</span>
                      <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-red-500 transition-all duration-300"
                          style={{ 
                            width: `${Math.max((trend.expenses / Math.max(...trendData.map(t => t.expenses))) * 100, 1)}%` 
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">لا توجد بيانات كافية لعرض الاتجاهات</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Investor Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5 text-investment-secondary-600" />
            أداء المستثمرين
          </CardTitle>
          <CardDescription>
            تحليل أداء كل مستثمر ومعدل العائد على الاستثمار
          </CardDescription>
        </CardHeader>
        <CardContent>
          {investorPerformance.length > 0 ? (
            <div className="space-y-4">
              {investorPerformance.map((performance, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-semibold text-gray-900">{performance.name}</h4>
                    <Badge variant={performance.roi > 0 ? 'default' : 'destructive'}>
                      ROI: <Number value={performance.roi} percentage />
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">مبلغ الاستثمار</p>
                      <p className="font-bold text-blue-600">
                        <Number value={performance.investedAmount} currency />
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">الرصيد الحالي</p>
                      <p className="font-bold text-green-600">
                        <Number value={performance.currentBalance} currency />
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">المسحوب</p>
                      <p className="font-bold text-orange-600">
                        <Number value={performance.withdrawnAmount} currency />
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">نسبة المشاركة</p>
                      <p className="font-bold text-investment-primary-600">
                        <Number value={performance.sharePercentage} percentage />
                      </p>
                    </div>
                  </div>

                  {/* Performance indicator */}
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-xs text-gray-600">الأداء:</span>
                    <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          performance.roi > 15 ? 'bg-green-500' :
                          performance.roi > 5 ? 'bg-yellow-500' :
                          performance.roi > 0 ? 'bg-blue-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(Math.max((performance.roi + 20) / 40 * 100, 5), 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">لا توجد بيانات مستثمرين متاحة</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Analysis Summary */}
      <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-800">
            <Brain className="h-5 w-5" />
            ملخص التحليل الذكي
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-2">
                {aiInsights.filter(i => i.type === 'positive').length}
              </div>
              <p className="text-sm text-gray-600">نقاط إيجابية</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600 mb-2">
                {aiInsights.filter(i => i.type === 'neutral').length}
              </div>
              <p className="text-sm text-gray-600">ملاحظات</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600 mb-2">
                {aiInsights.filter(i => i.type === 'negative').length}
              </div>
              <p className="text-sm text-gray-600">تحديات</p>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-white/50 rounded-lg border border-purple-200">
            <h4 className="font-semibold text-purple-800 mb-2">التقييم العام:</h4>
            <p className="text-sm text-purple-700">
              {aiInsights.filter(i => i.type === 'positive').length > aiInsights.filter(i => i.type === 'negative').length
                ? 'مشروعك يظهر أداءً إيجابياً بشكل عام. استمر في هذا المسار مع تطبيق التوصيات.'
                : aiInsights.filter(i => i.type === 'negative').length > aiInsights.filter(i => i.type === 'positive').length
                ? 'هناك بعض التحديات التي تحتاج لاهتمام. راجع التوصيات وطبق الحلول المقترحة.'
                : 'مشروعك في ��الة متوازنة. ركز على تطوير النقاط الإيجابية ومعالجة التحديات.'
              }
            </p>
            {insightsMetadata && (
              <div className="mt-4 p-3 bg-white/70 rounded-lg border border-purple-100">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-700">التحليل مد��وم بـ OpenAI</span>
                </div>
                <p className="text-xs text-purple-600">
                  تم تحليل {Object.values(insightsMetadata.dataPoints).reduce((a, b) => a + b, 0)} نقطة بيانات
                  لتوليد رؤى دقيقة ومخصصة لمشروعك
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
