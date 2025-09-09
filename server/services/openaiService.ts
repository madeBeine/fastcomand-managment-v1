import OpenAI from 'openai';
import { DashboardStats, Investor, Expense, Revenue, Withdrawal } from '../../shared/types';

export interface AIInsight {
  id: string;
  type: 'positive' | 'negative' | 'neutral';
  title: string;
  description: string;
  recommendation?: string;
  impact: 'high' | 'medium' | 'low';
  category: 'revenue' | 'expense' | 'investor' | 'profit' | 'risk';
}

class OpenAIService {
  private openai: OpenAI | null = null;

  constructor() {
    // Don't initialize OpenAI client here - do it lazily when needed
  }

  private getOpenAIClient(): OpenAI {
    if (!this.openai) {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey || apiKey.trim() === '') {
        throw new Error('OpenAI API key is not configured. Please set OPENAI_API_KEY environment variable.');
      }
      this.openai = new OpenAI({
        apiKey: apiKey,
      });
    }
    return this.openai;
  }

  async generateInsights(
    stats: DashboardStats,
    investors: Investor[],
    expenses: Expense[],
    revenues: Revenue[],
    withdrawals: Withdrawal[]
  ): Promise<AIInsight[]> {
    try {
      // Prepare data summary for OpenAI
      const dataContext = this.prepareDataContext(stats, investors, expenses, revenues, withdrawals);
      
      const openaiClient = this.getOpenAIClient();
      const completion = await openaiClient.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `أنت محلل مالي خبير متخصص في تحليل أداء المشاريع الاستثمارية. مهمتك هي تحليل البيانات المالية المقدمة وتقديم رؤى ذكية وتوصيات عملية باللغة العربية.

يجب أن تكون إجابتك في صيغة JSON صالحة تحتوي على مصفوفة من الرؤى، حيث يحتوي كل عنصر على:
- id: معرف فريد
- type: "positive" أو "negative" أو "neutral"
- title: عنوان مختصر
- description: وصف مفصل
- recommendation: توصية عملية (اختيارية)
- impact: "high" أو "medium" أو "low"
- category: "revenue" أو "expense" أو "investor" أو "profit" أو "risk"

ركز على التحليل العملي والتوصيات القابلة للتطبيق.`
          },
          {
            role: "user",
            content: `احلل البيانات المالية التالية وقدم رؤى ذكية باللغة العربية:

${dataContext}

قدم بين 3-5 رؤى محددة وعملية بناءً على هذه البيانات.`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('لم يتم الحصول على رد من OpenAI');
      }

      // Parse the JSON response
      try {
        const insights = JSON.parse(response);
        if (Array.isArray(insights)) {
          return insights;
        } else if (insights.insights && Array.isArray(insights.insights)) {
          return insights.insights;
        } else {
          console.error('تنسيق غير متوقع من OpenAI:', insights);
          return this.getFallbackInsights(stats, investors, expenses, revenues);
        }
      } catch (parseError) {
        console.error('خطأ في تحليل رد OpenAI:', parseError);
        return this.getFallbackInsights(stats, investors, expenses, revenues);
      }

    } catch (error) {
      console.error('خطأ في استدعاء OpenAI:', error);
      // Return fallback insights if OpenAI fails
      return this.getFallbackInsights(stats, investors, expenses, revenues);
    }
  }

  private prepareDataContext(
    stats: DashboardStats,
    investors: Investor[],
    expenses: Expense[],
    revenues: Revenue[],
    withdrawals: Withdrawal[]
  ): string {
    const profitMargin = stats.totalRevenue > 0 ? (stats.totalProfit / stats.totalRevenue) * 100 : 0;
    
    // Calculate recent trends
    const recentExpenses = expenses.slice(0, 5).reduce((sum, exp) => sum + exp.amount, 0);
    const recentRevenues = revenues.slice(0, 5).reduce((sum, rev) => sum + rev.amount, 0);
    
    // Calculate investor distribution
    const highShareInvestors = investors.filter(inv => inv.sharePercentage > 25);
    const avgInvestment = investors.length > 0 ? investors.reduce((sum, inv) => sum + inv.totalInvested, 0) / investors.length : 0;
    
    return `
إحصائيات المشروع:
- إجمالي الإيرادات: ${stats.totalRevenue.toLocaleString()} وحدة نقدية
- إجمالي المصروفات: ${stats.totalExpenses.toLocaleString()} وحدة نقدية
- صافي الربح: ${stats.totalProfit.toLocaleString()} وحدة نقدية
- هامش الربح: ${profitMargin.toFixed(1)}%
- عدد المستثمرين النشطين: ${stats.activeInvestors}
- معدل النمو الشهري: ${stats.monthlyGrowth}%

تفاصيل المستثمرين:
- عدد المستثمرين: ${investors.length}
- متوسط الاستثمار: ${avgInvestment.toLocaleString()} وحدة نقدية
- المستثمرون الكبار (أكثر من 25%): ${highShareInvestors.length}
- إجمالي السحوبات: ${stats.totalWithdrawals.toLocaleString()} وحدة نقدية

الإيرادات الحديثة:
- ��دد الإيرادات المسجلة: ${revenues.length}
- إجمالي الإيرادات الحديثة: ${recentRevenues.toLocaleString()} وحدة نقدية

المصروفات الحديثة:
- عدد المصروفات المسجلة: ${expenses.length}
- إجمالي المصروفات الحديثة: ${recentExpenses.toLocaleString()} وحدة نقدية
- أهم فئات المصروفات: ${expenses.slice(0, 3).map(exp => exp.category).join(', ')}

حالة السيولة:
- الرصيد المتاح للمستثمري��: ${stats.availableBalance.toLocaleString()} وحدة نقدية
- رصيد المشروع: ${stats.projectBalance.toLocaleString()} وحدة نقدية
`;
  }

  private getFallbackInsights(
    stats: DashboardStats,
    investors: Investor[],
    expenses: Expense[],
    revenues: Revenue[]
  ): AIInsight[] {
    const insights: AIInsight[] = [];
    const profitMargin = stats.totalRevenue > 0 ? (stats.totalProfit / stats.totalRevenue) * 100 : 0;

    // Profit margin analysis
    if (profitMargin > 20) {
      insights.push({
        id: 'fallback-1',
        type: 'positive',
        title: 'هامش ربح ممتاز',
        description: `هامش الربح الحالي ${profitMargin.toFixed(1)}% يعتبر ممتازاً ويدل على كفاءة ع��لية في إدارة المشروع`,
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
        recommendation: 'راجع المصروفات ��ابحث عن طرق لزيادة الإيرادات أو تقليل التكاليف',
        impact: 'high',
        category: 'profit'
      });
    }

    // Revenue analysis
    if (stats.totalRevenue > stats.totalExpenses * 2) {
      insights.push({
        id: 'fallback-3',
        type: 'positive',
        title: 'نمو إيرادات قوي',
        description: 'الإيرادات تتجاوز المصروفات بنسبة كبيرة مما يشير إلى نمو صحي',
        recommendation: 'فكر في إعادة استثمار جزء من الأرباح لتسريع النمو',
        impact: 'medium',
        category: 'revenue'
      });
    }

    return insights;
  }
}

export const openaiService = new OpenAIService();
