import { SupabaseDatabase } from './supabaseDatabase';

class DatabaseService {
  private supabaseDb: SupabaseDatabase;

  constructor() {
    this.supabaseDb = new SupabaseDatabase();
    console.log('🚀 Using Supabase Database (Cloud)');
  }

  async initializeDatabase() {
    try {
      console.log('🔗 Initializing Supabase database...');

      // Initialize tables if needed
      await this.supabaseDb.initializeTables();

      // Update database schema for attachments
      await this.supabaseDb.updateDatabaseSchema();

      console.log('✅ Supabase database initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Supabase initialization failed:', error);
      return false;
    }
  }

  getDatabaseType(): 'supabase' {
    return 'supabase';
  }

  getDatabaseInfo() {
    return {
      type: 'supabase',
      configured: true,
      message: 'متصل بـ Supabase (سحابي - آمن)'
    };
  }

  // Data retrieval methods
  async getInvestors(options?: { limit?: number; offset?: number }) {
    return await this.supabaseDb.getInvestors(options);
  }

  async getExpenses(options?: { limit?: number; offset?: number }) {
    return await this.supabaseDb.getExpenses(options);
  }

  async getRevenues(options?: { limit?: number; offset?: number }) {
    return await this.supabaseDb.getRevenues(options);
  }

  async getWithdrawals(options?: { limit?: number; offset?: number }) {
    return await this.supabaseDb.getWithdrawals(options);
  }

  async getProjectWithdrawals() {
    try {
      return await this.supabaseDb.getProjectWithdrawals();
    } catch (error) {
      console.log('⚠️ Project withdrawals table not found, returning empty array');
      return [];
    }
  }

  async getUsers() {
    return await this.supabaseDb.getUsers();
  }

  async getSettings() {
    return await this.supabaseDb.getSettings();
  }

  async getOperationsLog() {
    return await this.supabaseDb.getOperationsLog();
  }

  async getExpensesSummary() {
    return await this.supabaseDb.getExpensesSummary();
  }

  async getRevenuesSummary() {
    return await this.supabaseDb.getRevenuesSummary();
  }

  async getWithdrawalsSummary() {
    return await this.supabaseDb.getWithdrawalsSummary();
  }

  async getDashboardStats(customSettings?: any) {
    // Get all required data
    const [investors, revenues, expenses, withdrawals, projectWithdrawalsData] = await Promise.all([
      this.getInvestors(),
      this.getRevenues(),
      this.getExpenses(),
      this.getWithdrawals(),
      this.getProjectWithdrawals()
    ]);

    // STEP 1: الحسابات الأساسية (Basic Calculations)
    const totalRevenue = revenues.reduce((sum, rev) => sum + rev.amount, 0);
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalProfit = totalRevenue - totalExpenses; // صافي الربح = الإيرادات - المصاريف
    const totalWithdrawals = withdrawals.reduce((sum, wit) => sum + wit.amount, 0); // إجمالي سحوبات المستثمرين
    const activeInvestors = investors.length;

    // STEP 2: إعدادات المشروع (Project Settings)
    const projectPercentage = customSettings?.projectPercentage || 15; // نسبة المشروع (افتراضي 15%)
    const customAllocations = customSettings?.customAllocations || []; // التخصيصات الإضافية

    // STEP 3: حساب التخصيصات (Calculate Allocations)
    const totalCustomAllocations = customAllocations.reduce((sum: number, allocation: any) => sum + allocation.percentage, 0);
    const projectBalance = (totalProfit * projectPercentage) / 100; // رصيد المشروع = نسبة المشروع × صافي الربح
    const customAllocationsAmount = (totalProfit * totalCustomAllocations) / 100; // مبلغ التخصيصات الإضافية

    // STEP 4: حساب النسب (Calculate Percentages)
    const totalAllocatedPercentage = projectPercentage + totalCustomAllocations; // إجمالي النسب المخصصة
    const investorsPercentage = Math.max(0, 100 - totalAllocatedPercentage); // النسبة المتبقية للمستثمرين

    // STEP 5: حساب السحوبات (Calculate Withdrawals)
    const projectWithdrawals = projectWithdrawalsData.reduce((sum, withdrawal) => sum + withdrawal.amount, 0); // إجمالي سحوبات المشروع

    // STEP 6: الحساب النهائي (Final Calculation)
    // ا��رصيد المتاح للتوزيع = صافي الربح - نسبة المشروع - التخصيصات الإضافية - سحوبات المشروع - سحوبات المستثمرين
    const availableBalance = totalProfit - projectBalance - customAllocationsAmount - projectWithdrawals - totalWithdrawals;

    // Calculate monthly growth (simplified)
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyRevenues = revenues.filter(rev => {
      const revDate = new Date(rev.date);
      return revDate.getMonth() === currentMonth && revDate.getFullYear() === currentYear;
    });
    const monthlyTotal = monthlyRevenues.reduce((sum, rev) => sum + rev.amount, 0);
    const monthlyGrowth = totalRevenue > 0 ? (monthlyTotal / totalRevenue) * 100 : 0;

    return {
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
      projectPercentage: projectPercentage,
      totalCustomAllocations,
      investorsPercentage: investorsPercentage
    };
  }

  async getInvestorsWithEffectiveProfits(customSettings?: any) {
    // Get all investors and calculate their effective profits
    const [investors, allWithdrawals] = await Promise.all([
      this.getInvestors(),
      this.getWithdrawals()
    ]);
    const stats = await this.getDashboardStats(customSettings);

    // Calculate total original shares
    const totalOriginalShares = investors.reduce((sum, inv) => sum + inv.sharePercentage, 0);

    if (totalOriginalShares === 0) {
      return investors.map(inv => ({
        ...inv,
        effectiveSharePercentage: 0,
        expectedEffectiveProfit: 0,
        totalProfit: 0,
        totalWithdrawn: 0,
        currentBalance: 0
      }));
    }

    // Calculate effective profits for each investor
    return investors.map(investor => {
      // Calculate effective share percentage
      const effectiveSharePercentage = (investor.sharePercentage / totalOriginalShares) * stats.investorsPercentage;

      // Calculate expected effective profit based on available balance
      const expectedEffectiveProfit = (stats.availableBalance * effectiveSharePercentage) / 100;

      // Calculate actual total withdrawals for this investor
      const actualTotalWithdrawn = allWithdrawals
        .filter(w => w.investorName === investor.name)
        .reduce((sum, w) => sum + w.amount, 0);

      // Calculate total profit: their percentage of total net profit
      const actualTotalProfit = (stats.totalProfit * effectiveSharePercentage) / 100;

      // Calculate current balance
      const actualCurrentBalance = actualTotalProfit - actualTotalWithdrawn;

      return {
        ...investor,
        effectiveSharePercentage: Math.round(effectiveSharePercentage * 100) / 100,
        expectedEffectiveProfit: Math.round(expectedEffectiveProfit),
        totalProfit: Math.round(actualTotalProfit),
        totalWithdrawn: Math.round(actualTotalWithdrawn),
        currentBalance: Math.round(actualCurrentBalance)
      };
    });
  }

  // CRUD operations
  async addInvestor(data: any) {
    return await this.supabaseDb.addInvestor(data);
  }

  async updateInvestor(id: string, data: any) {
    return await this.supabaseDb.updateInvestor(id, data);
  }

  async deleteInvestor(id: string) {
    return await this.supabaseDb.deleteInvestor(id);
  }

  async addExpense(data: any) {
    return await this.supabaseDb.addExpense(data);
  }

  async updateExpense(id: string, data: any) {
    return await this.supabaseDb.updateExpense(id, data);
  }

  async deleteExpense(id: string) {
    return await this.supabaseDb.deleteExpense(id);
  }

  async addRevenue(data: any) {
    return await this.supabaseDb.addRevenue(data);
  }

  async updateRevenue(id: string, data: any) {
    return await this.supabaseDb.updateRevenue(id, data);
  }

  async deleteRevenue(id: string) {
    return await this.supabaseDb.deleteRevenue(id);
  }

  async addWithdrawal(data: any) {
    return await this.supabaseDb.addWithdrawal(data);
  }

  async updateWithdrawal(id: string, data: any) {
    return await this.supabaseDb.updateWithdrawal(id, data);
  }

  async deleteWithdrawal(id: string) {
    return await this.supabaseDb.deleteWithdrawal(id);
  }

  // Project Withdrawals CRUD operations
  async addProjectWithdrawal(data: any) {
    return await this.supabaseDb.addProjectWithdrawal(data);
  }

  async updateProjectWithdrawal(id: string, data: any) {
    return await this.supabaseDb.updateProjectWithdrawal(id, data);
  }

  async deleteProjectWithdrawal(id: string) {
    return await this.supabaseDb.deleteProjectWithdrawal(id);
  }

  async addOperationLog(data: any) {
    return await this.supabaseDb.addOperationLog(data);
  }

  async updateSetting(key: string, value: string) {
    return await this.supabaseDb.updateSetting(key, value);
  }

  async addUser(data: any) {
    return await this.supabaseDb.addUser(data);
  }

  async updateUser(id: string, data: any) {
    return await this.supabaseDb.updateUser(id, data);
  }

  async deleteUser(id: string) {
    return await this.supabaseDb.deleteUser(id);
  }

  async authenticateUser(phone: string, password: string) {
    return await this.supabaseDb.authenticateUser(phone, password);
  }
}

// Export singleton instance
export const databaseService = new DatabaseService();
export default databaseService;
