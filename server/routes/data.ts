import { RequestHandler } from "express";
import { getUserPermissions } from "./auth";
import { DashboardStats } from "../../shared/types";
import {
  calculateDashboardStats
} from "../services/mockData";
import { databaseService } from "../services/databaseService";

// Use the singleton Database Service instance
const database = databaseService;

export const handleGetDashboard: RequestHandler = async (req, res) => {
  try {
    const user = (req as any).user;
    const permissions = getUserPermissions(user.role);

    if (!permissions.canViewAllData && user.role !== 'Investor') {
      return res.status(403).json({
        success: false,
        message: 'ل��س لديك صلاحية لعرض هذه البيانات'
      });
    }

    const { loadSettings } = await import('./settings');
    const currentSettings = loadSettings();

    // Fetch all needed datasets once (in parallel) then compute stats to avoid duplicate queries
    const [investors, revenues, expenses, withdrawals, projectWithdrawals] = await Promise.all([
      database.getInvestors(),
      database.getRevenues(),
      database.getExpenses(),
      database.getWithdrawals(),
      database.getProjectWithdrawals()
    ]);

    // Compute stats (mirrors databaseService.getDashboardStats but reuses fetched arrays)
    const totalRevenue = revenues.reduce((sum, rev) => sum + rev.amount, 0);
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalProfit = totalRevenue - totalExpenses;
    const totalWithdrawals = withdrawals.reduce((sum, wit) => sum + wit.amount, 0);
    const activeInvestors = investors.length;

    const projectPercentage = currentSettings?.projectPercentage || 15;
    const customAllocations = currentSettings?.customAllocations || [];
    const totalCustomAllocations = customAllocations.reduce((sum: number, allocation: any) => sum + allocation.percentage, 0);
    const projectBalance = (totalProfit * projectPercentage) / 100;
    const customAllocationsAmount = (totalProfit * totalCustomAllocations) / 100;
    const projectWithdrawalsSum = projectWithdrawals.reduce((sum, w) => sum + w.amount, 0);
    const availableBalance = totalProfit - projectBalance - customAllocationsAmount - projectWithdrawalsSum - totalWithdrawals;

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyRevenues = revenues.filter(rev => {
      const revDate = new Date(rev.date);
      return revDate.getMonth() === currentMonth && revDate.getFullYear() === currentYear;
    });
    const monthlyTotal = monthlyRevenues.reduce((sum, rev) => sum + rev.amount, 0);
    const monthlyGrowth = totalRevenue > 0 ? (monthlyTotal / totalRevenue) * 100 : 0;

    const stats: DashboardStats = {
      totalRevenue,
      totalExpenses,
      totalProfit,
      totalWithdrawals,
      activeInvestors,
      monthlyGrowth: Math.round(monthlyGrowth * 100) / 100,
      pendingApprovals: 0,
      projectBalance: Math.round(projectBalance),
      availableBalance: Math.round(availableBalance),
      customAllocationsAmount: Math.round(customAllocationsAmount),
      projectPercentage,
      totalCustomAllocations,
      investorsPercentage: Math.max(0, 100 - (projectPercentage + totalCustomAllocations))
    };

    // Prepare minimal payloads for dashboard speed
    const recentExpenses = expenses.slice(0, 5);
    const recentRevenues = revenues.slice(0, 5);
    const recentWithdrawals = withdrawals.slice(0, 5);

    let responseData = {
      stats,
      investors: [] as any[],
      expenses: recentExpenses,
      revenues: recentRevenues,
      withdrawals: recentWithdrawals,
      recentActivities: [] as any[]
    };

    if (user.role === 'Investor') {
      const userInvestor = investors.find(inv => inv.name.toLowerCase().trim() === user.name.toLowerCase().trim());
      responseData = {
        ...responseData,
        stats: { ...stats, activeInvestors: 1 },
        investors: userInvestor ? [userInvestor] : [],
        withdrawals: recentWithdrawals.filter(w => w.investorName.toLowerCase().trim() === user.name.toLowerCase().trim())
      };
    }

    return res.json({ success: true, data: responseData });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ success: false, message: 'حدث خطأ في تحميل البيانات' });
  }
};

export const handleGetInvestors: RequestHandler = async (req, res) => {
  try {
    const user = (req as any).user;
    const permissions = getUserPermissions(user.role);

    if (!permissions.canViewInvestors) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحي�� لعرض بيانات المست��مرين'
      });
    }

    // Check if requesting effective profits calculation
    const includeEffective = req.query.includeEffective === 'true';

    let investorsData;
    if (includeEffective) {
      // Load current settings for accurate calculations
      const { loadSettings } = await import('./settings');
      const currentSettings = loadSettings();

      // Get investors with effective profit calculations
      investorsData = await database.getInvestorsWithEffectiveProfits(currentSettings);
    } else {
      // Get regular investors data
      investorsData = await database.getInvestors();
    }

    res.json({
      success: true,
      data: investorsData
    });

  } catch (error) {
    console.error('Get investors error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في تحميل بيانات المستثمرين'
    });
  }
};

export const handleGetExpenses: RequestHandler = async (req, res) => {
  try {
    const user = (req as any).user;
    const permissions = getUserPermissions(user.role);

    if (!permissions.canViewExpenses) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية لعرض بيانات المصاري��'
      });
    }

    const limit = Math.max(1, parseInt((req.query.limit as string) || '25'));
    const page = Math.max(1, parseInt((req.query.page as string) || '1'));
    const offset = (page - 1) * limit;
    const includeSummary = String(req.query.summary || 'false') === 'true';

    const [items, summary] = await Promise.all([
      database.getExpenses({ limit, offset }),
      includeSummary ? database.getExpensesSummary() : Promise.resolve(null)
    ]);

    res.json({
      success: true,
      data: {
        items,
        summary: summary || undefined,
        pagination: { page, limit }
      }
    });

  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في تحميل بيانات المصاريف'
    });
  }
};

export const handleGetRevenues: RequestHandler = async (req, res) => {
  try {
    const user = (req as any).user;
    const permissions = getUserPermissions(user.role);

    if (!permissions.canViewRevenues) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية لعرض بيانا�� الإيرادات'
      });
    }

    const limit = Math.max(1, parseInt((req.query.limit as string) || '25'));
    const page = Math.max(1, parseInt((req.query.page as string) || '1'));
    const offset = (page - 1) * limit;
    const includeSummary = String(req.query.summary || 'false') === 'true';

    const [items, summary] = await Promise.all([
      database.getRevenues({ limit, offset }),
      includeSummary ? database.getRevenuesSummary() : Promise.resolve(null)
    ]);

    res.json({
      success: true,
      data: {
        items,
        summary: summary || undefined,
        pagination: { page, limit }
      }
    });

  } catch (error) {
    console.error('Get revenues error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في تحميل بيانات الإيرادات'
    });
  }
};

export const handleGetWithdrawals: RequestHandler = async (req, res) => {
  try {
    const user = (req as any).user;
    const permissions = getUserPermissions(user.role);

    if (!permissions.canViewWithdrawals) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية لعرض بيانات السحوبات'
      });
    }

    const limit = Math.max(1, parseInt((req.query.limit as string) || '25'));
    const page = Math.max(1, parseInt((req.query.page as string) || '1'));
    const offset = (page - 1) * limit;
    const includeSummary = String(req.query.summary || 'false') === 'true';

    let items = await database.getWithdrawals({ limit, offset });

    if (user.role === 'Investor') {
      items = items.filter(w => w.investorName === user.name);
    }

    const summary = includeSummary ? await database.getWithdrawalsSummary() : null;

    res.json({
      success: true,
      data: {
        items,
        summary: summary || undefined,
        pagination: { page, limit }
      }
    });

  } catch (error) {
    console.error('Get withdrawals error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في تحميل بيانات السحوبات'
    });
  }
};



export const handleGetProjectWithdrawals: RequestHandler = async (req, res) => {
  try {
    const user = (req as any).user;
    const permissions = getUserPermissions(user.role);

    if (user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية لعرض سحوبات المشروع'
      });
    }

    // Get data from database (SQLite or Supabase)
    const projectWithdrawalsData = await database.getProjectWithdrawals();

    res.json({
      success: true,
      data: projectWithdrawalsData
    });

  } catch (error) {
    console.error('Get project withdrawals error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في تحميل بيانات سحوبات المشروع'
    });
  }
};

export const handleSyncData: RequestHandler = async (req, res) => {
  try {
    const user = (req as any).user;
    const permissions = getUserPermissions(user.role);

    if (!permissions.canViewSettings) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية لمزامنة البيانات'
      });
    }

    // For now, just return success since we're using mock data
    res.json({
      success: true,
      message: 'تم تحديث البيانات بنجاح'
    });

  } catch (error) {
    console.error('Sync data error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في مزامنة البيانات'
    });
  }
};
