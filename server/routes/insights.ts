import { Router } from 'express';
import { authenticateRequest } from './auth';
import { openaiService } from '../services/openaiService';

const router = Router();

// Generate AI insights
router.get('/api/insights/generate', authenticateRequest, async (req, res) => {
  try {
    // Check user permissions
    const userRole = (req as any).user?.role;
    if (!userRole || !['Admin', 'Assistant'].includes(userRole)) {
      return res.status(403).json({ 
        error: 'ليس لديك صلاحية للوصول إلى التحليلات الذكية' 
      });
    }

    // Get all required data
    const { databaseService } = await import('../services/databaseService');

    const [stats, investors, expenses, revenues, withdrawals] = await Promise.all([
      databaseService.getDashboardStats(),
      databaseService.getInvestors(),
      databaseService.getExpenses(),
      databaseService.getRevenues(),
      databaseService.getWithdrawals()
    ]);

    // Generate insights using OpenAI
    const insights = await openaiService.generateInsights(
      stats,
      investors,
      expenses,
      revenues,
      withdrawals
    );

    // Log the operation
    await dbService.addOperationLog({
      id: 'LOG' + Date.now(),
      operationType: 'توليد تحليلات ذكية',
      details: `تم توليد ${insights.length} تحليل ذكي باستخدام الذكاء الاصطناعي`,
      date: new Date().toLocaleString('ar-SA'),
      performedBy: (req as any).user?.name || 'مجهول'
    });

    res.json({
      success: true,
      insights,
      metadata: {
        generatedAt: new Date().toISOString(),
        dataPoints: {
          investors: investors.length,
          expenses: expenses.length,
          revenues: revenues.length,
          withdrawals: withdrawals.length
        }
      }
    });

  } catch (error) {
    console.error('خطأ في توليد التحليلات الذكية:', error);
    res.status(500).json({ 
      error: 'حدث خطأ في توليد التحليلات الذكية',
      details: error instanceof Error ? error.message : 'خطأ غير معروف'
    });
  }
});

// Get cached insights (if we want to implement caching later)
router.get('/api/insights/cached', authenticateRequest, async (req, res) => {
  try {
    const userRole = (req as any).user?.role;
    if (!userRole || !['Admin', 'Assistant'].includes(userRole)) {
      return res.status(403).json({ 
        error: 'ليس لديك صلاحية للوصول إلى التحليلات الذكية' 
      });
    }

    // For now, redirect to generate new insights
    // In the future, we could implement caching here
    res.json({
      success: false,
      message: 'لا توجد تحليلات محفوظة، سيتم توليد تحليلات جديدة',
      redirect: '/api/insights/generate'
    });

  } catch (error) {
    console.error('خطأ في جلب التحليلات المحفوظة:', error);
    res.status(500).json({ 
      error: 'حدث خطأ في جلب التحليلات المحفوظة' 
    });
  }
});

export default router;
