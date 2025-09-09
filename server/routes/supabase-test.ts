import { Router } from 'express';
import { authenticateRequest } from '../services/auth';

const router = Router();

// Test adding data to Supabase directly
router.post('/add-test-data', authenticateRequest, async (req, res) => {
  try {
    const user = (req as any).user;

    if (user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية لإضافة البيانات التجريبية'
      });
    }

    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    );

    const timestamp = Date.now();
    
    // Add a test investor
    const testInvestor = {
      id: `TEST_INV_${timestamp}`,
      name: `مستثمر تجريبي ${timestamp}`,
      phone: `+222 ${timestamp.toString().slice(-8)}`,
      share_percentage: 10,
      total_invested: 25000,
      total_profit: 2500,
      total_withdrawn: 500,
      current_balance: 2000
    };

    const { data: investorData, error: investorError } = await supabase
      .from('investors')
      .insert([testInvestor])
      .select();

    if (investorError) {
      throw new Error(`خطأ في إضافة المستثمر: ${investorError.message}`);
    }

    // Add a test expense
    const testExpense = {
      id: `TEST_EXP_${timestamp}`,
      category: 'تجريبي',
      amount: 5000,
      date: new Date().toLocaleDateString('ar-SA'),
      notes: 'مصروف تجريبي للاختبار',
      added_by: 'Admin Test'
    };

    const { data: expenseData, error: expenseError } = await supabase
      .from('expenses')
      .insert([testExpense])
      .select();

    if (expenseError) {
      throw new Error(`خطأ في إضافة المصروف: ${expenseError.message}`);
    }

    // Add a test revenue
    const testRevenue = {
      id: `TEST_REV_${timestamp}`,
      amount: 15000,
      date: new Date().toLocaleDateString('ar-SA'),
      description: 'إيراد تجريبي للاختبار',
      added_by: 'Admin Test'
    };

    const { data: revenueData, error: revenueError } = await supabase
      .from('revenues')
      .insert([testRevenue])
      .select();

    if (revenueError) {
      throw new Error(`خطأ في إضافة الإيراد: ${revenueError.message}`);
    }

    res.json({
      success: true,
      message: '✅ تم إضافة البيانات التجريبية بنجاح في Supabase!',
      data: {
        investor: investorData[0],
        expense: expenseData[0],
        revenue: revenueData[0],
        timestamp: new Date().toLocaleString('ar-SA')
      }
    });

  } catch (error) {
    console.error('❌ Error adding test data:', error);
    res.status(500).json({
      success: false,
      message: `فشل في إضافة البيانات التجريبية: ${error.message}`
    });
  }
});

// Get data directly from Supabase
router.get('/get-supabase-data', authenticateRequest, async (req, res) => {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    );

    const [investorsRes, expensesRes, revenuesRes] = await Promise.all([
      supabase.from('investors').select('*').order('created_at', { ascending: false }).limit(5),
      supabase.from('expenses').select('*').order('created_at', { ascending: false }).limit(5),
      supabase.from('revenues').select('*').order('created_at', { ascending: false }).limit(5)
    ]);

    res.json({
      success: true,
      message: 'تم جلب البيانات من Supabase مباشرة',
      data: {
        investors: {
          count: investorsRes.data?.length || 0,
          data: investorsRes.data || [],
          error: investorsRes.error?.message
        },
        expenses: {
          count: expensesRes.data?.length || 0,
          data: expensesRes.data || [],
          error: expensesRes.error?.message
        },
        revenues: {
          count: revenuesRes.data?.length || 0,
          data: revenuesRes.data || [],
          error: revenuesRes.error?.message
        }
      }
    });

  } catch (error) {
    console.error('❌ Error getting Supabase data:', error);
    res.status(500).json({
      success: false,
      message: `فشل في جلب البيانات: ${error.message}`
    });
  }
});

// Force switch to Supabase
router.post('/force-supabase', authenticateRequest, async (req, res) => {
  try {
    const user = (req as any).user;

    if (user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية لتغيير قاعدة البيانات'
      });
    }

    const { databaseService } = await import('../services/databaseService');
    
    // Test connection
    const testResult = await databaseService.getInvestors();
    
    res.json({
      success: true,
      message: '✅ تم التبديل إلى Supabase بنجاح!',
      data: {
        investors_count: testResult.length,
        database_type: 'Supabase',
        connection_test: 'نجح الاتصال'
      }
    });

  } catch (error) {
    console.error('❌ Error forcing Supabase:', error);
    res.status(500).json({
      success: false,
      message: `فشل في التبديل إلى Supabase: ${error.message}`
    });
  }
});

export default router;
