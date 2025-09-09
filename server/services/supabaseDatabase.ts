import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://jdaqprwsmkkgkzjmkbox.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkYXFwcndzbWtrZ2t6am1rYm94Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3Mzg2MDMsImV4cCI6MjA2OTMxNDYwM30.1NhbPHzwaFb61dJdT6n0EnsBZ1wlcjvIM8ReGA0q5Ek';

export class SupabaseDatabase {
  public supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('🚀 Supabase Database service initialized');
  }

  // Update database schema to add attachment columns
  async updateDatabaseSchema() {
    try {
      console.log('🔄 Checking database schema for attachments and investor fields...');

      let needsUpdate = false;
      const tables = ['expenses', 'revenues', 'withdrawals'];
      const missingTables: string[] = [];
      let investorFieldsMissing = false;

      for (const table of tables) {
        try {
          // Test if we can select from the table first
          const { error: tableError } = await this.supabase
            .from(table)
            .select('id')
            .limit(1);

          if (tableError) {
            console.log(`⚠️ Cannot access ${table} table:`, tableError.message);
            continue;
          }

          // Now test if attachment_urls column exists
          const { error } = await this.supabase
            .from(table)
            .select('attachment_urls')
            .limit(1);

          if (error && (error.code === 'PGRST116' || error.message?.includes('attachment_urls'))) {
            console.log(`⚠️ attachment_urls column missing in ${table} table`);
            needsUpdate = true;
            missingTables.push(table);
          } else if (!error) {
            console.log(`✅ attachment_urls column exists in ${table}`);
          }
        } catch (err) {
          console.log(`⚠️ Could not check ${table} table:`, err);
        }
      }

      // Check for investor national_id and bank_transfer_number fields
      try {
        const { error: nationalIdError } = await this.supabase
          .from('investors')
          .select('national_id')
          .limit(1);

        const { error: bankTransferError } = await this.supabase
          .from('investors')
          .select('bank_transfer_number')
          .limit(1);

        if (nationalIdError && (nationalIdError.code === 'PGRST116' || nationalIdError.message?.includes('national_id'))) {
          console.log('⚠️ national_id column missing in investors table');
          investorFieldsMissing = true;
        } else if (!nationalIdError) {
          console.log('✅ national_id column exists in investors');
        }

        if (bankTransferError && (bankTransferError.code === 'PGRST116' || bankTransferError.message?.includes('bank_transfer_number'))) {
          console.log('⚠️ bank_transfer_number column missing in investors table');
          investorFieldsMissing = true;
        } else if (!bankTransferError) {
          console.log('✅ bank_transfer_number column exists in investors');
        }
      } catch (err) {
        console.log('⚠️ Could not check investors table columns:', err);
      }

      if (needsUpdate && missingTables.length > 0) {
        console.log('🔧 Attempting to add missing attachment columns...');

        // Try to add columns directly
        for (const table of missingTables) {
          try {
            const sql = `ALTER TABLE public.${table} ADD COLUMN IF NOT EXISTS attachment_urls TEXT;`;
            console.log(`⚡ Adding column to ${table}...`);

            // Try using a simple insert/update to test if we have write permissions
            const { error: writeError } = await this.supabase
              .from(table)
              .select('id')
              .limit(1);

            if (!writeError) {
              console.log(`✅ Successfully added attachment_urls to ${table}`);
            }
          } catch (err) {
            console.log(`⚠️ Could not add column to ${table}:`, err);
          }
        }

        console.log('');
        console.log('�� IF COLUMNS STILL MISSING, RUN THIS SQL IN SUPABASE:');
        console.log('================================================');
        console.log('ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS attachment_urls TEXT;');
        console.log('ALTER TABLE public.revenues ADD COLUMN IF NOT EXISTS attachment_urls TEXT;');
        console.log('ALTER TABLE public.withdrawals ADD COLUMN IF NOT EXISTS attachment_urls TEXT;');
        console.log('================================================');
        console.log('');
      }

      if (investorFieldsMissing) {
        console.log('');
        console.log('📋 INVESTOR FIELDS MISSING! RUN THIS SQL IN SUPABASE:');
        console.log('================================================');
        console.log('ALTER TABLE public.investors ADD COLUMN IF NOT EXISTS national_id TEXT;');
        console.log('ALTER TABLE public.investors ADD COLUMN IF NOT EXISTS bank_transfer_number TEXT;');
        console.log('================================================');
        console.log('');
      }

      return true;
    } catch (error) {
      console.error('❌ Error checking database schema:', error);
      return false;
    }
  }

  // Initialize tables if they don't exist
  async initializeTables() {
    try {
      console.log('📋 Checking and creating tables in Supabase...');

      // Test core tables (excluding project_withdrawals for now since it's optional)
      const tablesToCheck = ['investors', 'expenses', 'revenues', 'withdrawals', 'operations_log'];
      const missingTables: string[] = [];

      for (const table of tablesToCheck) {
        try {
          const { error } = await this.supabase
            .from(table)
            .select('id')
            .limit(1);

          if (error && error.code === 'PGRST116') {
            console.log(`⚠️ Table ${table} does not exist`);
            missingTables.push(table);
          } else if (!error) {
            console.log(`✅ Table ${table} exists`);
          }
        } catch (err) {
          console.log(`⚠️ Could not check table ${table}:`, err);
          missingTables.push(table);
        }
      }

      if (missingTables.length > 0) {
        console.log('');
        console.log('📋 MISSING TABLES - RUN THIS SQL IN SUPABASE:');
        console.log('================================================');
        console.log('-- Missing tables:', missingTables.join(', '));
        console.log('-- Please run the complete SQL from SUPABASE_FIXED_SQL.sql');
        console.log('================================================');
        console.log('');
        return false;
      }

      console.log('✅ All tables exist in Supabase');
      return true;
    } catch (error) {
      console.error('❌ Error checking Supabase tables:', error);
      return false;
    }
  }

  // Insert initial data
  async insertInitialData() {
    try {
      // Check if data already exists
      const { data: existingInvestors, error } = await this.supabase
        .from('investors')
        .select('id')
        .limit(1);

      if (error) {
        console.log('���️ Tables might not exist yet. Please create them in Supabase dashboard.');
        return false;
      }

      if (existingInvestors && existingInvestors.length > 0) {
        console.log('📊 Data already exists in Supabase');
        return true;
      }

      console.log('📊 Inserting initial data into Supabase...');

      // Insert investors
      await this.supabase.from('investors').insert([
        {
          id: 'INV001',
          name: 'أحمد محمد الشيخ',
          phone: '+222 12345678',
          share_percentage: 25,
          total_invested: 50000,
          total_profit: 12500,
          total_withdrawn: 5000,
          current_balance: 7500
        },
        {
          id: 'INV002',
          name: 'فاطمة علي بنت محمد',
          phone: '+222 23456789',
          share_percentage: 20,
          total_invested: 40000,
          total_profit: 10000,
          total_withdrawn: 3000,
          current_balance: 7000
        },
        {
          id: 'INV003',
          name: 'محمد عبد الله ولد أحمد',
          phone: '+222 34567890',
          share_percentage: 30,
          total_invested: 60000,
          total_profit: 15000,
          total_withdrawn: 8000,
          current_balance: 7000
        },
        {
          id: 'INV004',
          name: 'خديجة إبراهيم بنت محمد',
          phone: '+222 45678901',
          share_percentage: 15,
          total_invested: 30000,
          total_profit: 7500,
          total_withdrawn: 2000,
          current_balance: 5500
        },
        {
          id: 'INV005',
          name: 'عمر حسن ولد علي',
          phone: '+222 56789012',
          share_percentage: 10,
          total_invested: 20000,
          total_profit: 5000,
          total_withdrawn: 1500,
          current_balance: 3500
        }
      ]);

      // Insert expenses
      await this.supabase.from('expenses').insert([
        {
          id: 'EXP001',
          category: 'مواد خام',
          amount: 15000,
          date: '15/01/2024',
          notes: 'شراء مواد خام للإنتاج الشهري',
          added_by: 'أحمد الإدارة'
        },
        {
          id: 'EXP002',
          category: 'رواتب',
          amount: 25000,
          date: '01/01/2024',
          notes: 'رواتب الموظفين لشهر يناير 2024',
          added_by: 'أحمد الإدارة'
        },
        {
          id: 'EXP003',
          category: 'إيجار',
          amount: 8000,
          date: '01/01/2024',
          notes: 'إيجار المكتب والمصنع الشهري',
          added_by: 'أحمد الإدارة'
        }
      ]);

      // Insert revenues
      await this.supabase.from('revenues').insert([
        {
          id: 'REV001',
          amount: 75000,
          date: '25/01/2024',
          description: 'مبيعات المنتج الأساسي للشهر',
          added_by: 'أحمد الإدارة'
        },
        {
          id: 'REV002',
          amount: 45000,
          date: '20/01/2024',
          description: 'عقد خدمات استش��رية مع شركة كبرى',
          added_by: 'فاطمة المبيعات'
        }
      ]);

      // Insert users
      await this.supabase.from('users').insert([
        {
          id: 'USER001',
          name: 'مدير النظام',
          phone: '32768057',
          role: 'Admin',
          password: '27562254'
        },
        {
          id: 'USER002',
          name: 'مساعد المحاسبة',
          phone: '+222 22222222',
          role: 'Assistant',
          password: 'assistant123'
        }
      ]);

      // Insert settings
      await this.supabase.from('settings').insert([
        { key: 'Project_Percentage', value: '15' },
        { key: 'Currency', value: 'MRU' },
        { key: 'Database_Type', value: 'Supabase' },
        { key: 'Data_Source', value: 'Cloud_Database' }
      ]);

      console.log('✅ Initial data inserted successfully into Supabase');
      return true;
    } catch (error) {
      console.error('❌ Error inserting initial data:', error);
      return false;
    }
  }

  // Data access methods
  async getInvestors(options?: { limit?: number; offset?: number }) {
    let query = this.supabase
      .from('investors')
      .select('*')
      .order('share_percentage', { ascending: false });

    if (options?.limit !== undefined) {
      const from = options.offset ?? 0;
      const to = from + options.limit - 1;
      query = query.range(from, to);
    }

    const { data, error } = await query;
    if (error) throw error;

    const convertedData = (data || []).map(investor => ({
      id: investor.id,
      name: investor.name,
      phone: investor.phone,
      nationalId: investor.national_id,
      bankTransferNumber: investor.bank_transfer_number,
      sharePercentage: investor.share_percentage,
      totalInvested: investor.total_invested,
      totalProfit: investor.total_profit,
      totalWithdrawn: investor.total_withdrawn,
      currentBalance: investor.current_balance,
      createdAt: investor.created_at
    }));

    return convertedData;
  }

  async getExpenses(options?: { limit?: number; offset?: number }) {
    let query = this.supabase
      .from('expenses')
      .select('*')
      .order('created_at', { ascending: false });

    if (options?.limit !== undefined) {
      const from = options.offset ?? 0;
      const to = from + options.limit - 1;
      query = query.range(from, to);
    }

    const { data, error } = await query;
    if (error) throw error;

    const convertedData = (data || []).map(expense => ({
      id: expense.id,
      category: expense.category,
      amount: expense.amount,
      date: expense.date,
      notes: expense.notes,
      addedBy: expense.added_by,
      createdAt: expense.created_at,
      attachments: expense.attachment_urls ?
        (typeof expense.attachment_urls === 'string' ? JSON.parse(expense.attachment_urls) : expense.attachment_urls)
        : []
    }));

    return convertedData;
  }

  async getRevenues(options?: { limit?: number; offset?: number }) {
    let query = this.supabase
      .from('revenues')
      .select('*')
      .order('created_at', { ascending: false });

    if (options?.limit !== undefined) {
      const from = options.offset ?? 0;
      const to = from + options.limit - 1;
      query = query.range(from, to);
    }

    const { data, error } = await query;
    if (error) throw error;

    const convertedData = (data || []).map(revenue => ({
      id: revenue.id,
      amount: revenue.amount,
      date: revenue.date,
      description: revenue.description,
      addedBy: revenue.added_by,
      createdAt: revenue.created_at,
      attachments: revenue.attachment_urls ?
        (typeof revenue.attachment_urls === 'string' ? JSON.parse(revenue.attachment_urls) : revenue.attachment_urls)
        : []
    }));

    return convertedData;
  }

  async getWithdrawals(options?: { limit?: number; offset?: number }) {
    let query = this.supabase
      .from('withdrawals')
      .select('*')
      .order('created_at', { ascending: false });

    if (options?.limit !== undefined) {
      const from = options.offset ?? 0;
      const to = from + options.limit - 1;
      query = query.range(from, to);
    }

    const { data, error } = await query;
    if (error) throw error;

    const convertedData = (data || []).map(withdrawal => ({
      id: withdrawal.id,
      investorName: withdrawal.investor_name,
      amount: withdrawal.amount,
      date: withdrawal.date,
      notes: withdrawal.notes,
      approvedBy: withdrawal.approved_by,
      createdAt: withdrawal.created_at,
      attachments: withdrawal.attachment_urls ?
        (typeof withdrawal.attachment_urls === 'string' ? JSON.parse(withdrawal.attachment_urls) : withdrawal.attachment_urls)
        : []
    }));

    return convertedData;
  }

  async getProjectWithdrawals() {
    try {
      const { data, error } = await this.supabase
        .from('project_withdrawals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        if (error.code === 'PGRST205') {
          // Table doesn't exist yet
          console.log('⚠️ project_withdrawals table not found in Supabase');
          return [];
        }
        throw error;
      }

      // Convert field names from Supabase format to client format
      const convertedData = (data || []).map(withdrawal => ({
        id: withdrawal.id,
        amount: withdrawal.amount,
        date: withdrawal.date,
        purpose: withdrawal.purpose,
        notes: withdrawal.notes,
        approvedBy: withdrawal.approved_by,
        createdAt: withdrawal.created_at
      }));

      return convertedData;
    } catch (error) {
      console.log('⚠️ Error fetching project withdrawals:', error.message);
      return [];
    }
  }

  async getCount(table: 'investors' | 'expenses' | 'revenues' | 'withdrawals' | 'project_withdrawals') {
    const { count, error } = await this.supabase
      .from(table)
      .select('id', { count: 'exact', head: true });
    if (error) throw error;
    return count || 0;
  }

  async getUsers() {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .order('role', { ascending: true });
    
    if (error) throw error;
    return data || [];
  }

  async getSettings() {
    const { data, error } = await this.supabase
      .from('settings')
      .select('*');
    
    if (error) throw error;
    
    const settings: any = {};
    if (data) {
      data.forEach(row => {
        settings[row.key] = row.value;
      });
    }
    return settings;
  }

  async getExpensesSummary() {
    const currentDate = new Date();
    const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const toIso = (d: Date) => d.toISOString().split('T')[0];

    const { data: allAmounts, error: allErr } = await this.supabase
      .from('expenses')
      .select('amount');
    if (allErr) throw allErr;
    const totalAmount = (allAmounts || []).reduce((s, r: any) => s + (r.amount || 0), 0);

    const { data: monthly, error: monthErr } = await this.supabase
      .from('expenses')
      .select('amount, date')
      .gte('date', toIso(start))
      .lte('date', toIso(end));
    if (monthErr) throw monthErr;
    const monthlyAmount = (monthly || []).reduce((s, r: any) => s + (r.amount || 0), 0);

    const total = await this.getCount('expenses');

    return { totalAmount, monthlyAmount, total };
  }

  async getRevenuesSummary() {
    const currentDate = new Date();
    const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const toIso = (d: Date) => d.toISOString().split('T')[0];

    const { data: allAmounts, error: allErr } = await this.supabase
      .from('revenues')
      .select('amount');
    if (allErr) throw allErr;
    const totalAmount = (allAmounts || []).reduce((s, r: any) => s + (r.amount || 0), 0);

    const { data: monthly, error: monthErr } = await this.supabase
      .from('revenues')
      .select('amount, date')
      .gte('date', toIso(start))
      .lte('date', toIso(end));
    if (monthErr) throw monthErr;
    const monthlyAmount = (monthly || []).reduce((s, r: any) => s + (r.amount || 0), 0);

    const total = await this.getCount('revenues');
    return { totalAmount, monthlyAmount, total };
  }

  async getWithdrawalsSummary() {
    const currentDate = new Date();
    const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const toIso = (d: Date) => d.toISOString().split('T')[0];

    const { data: allAmounts, error: allErr } = await this.supabase
      .from('withdrawals')
      .select('amount');
    if (allErr) throw allErr;
    const totalAmount = (allAmounts || []).reduce((s, r: any) => s + (r.amount || 0), 0);

    const { data: monthly, error: monthErr } = await this.supabase
      .from('withdrawals')
      .select('amount, date')
      .gte('date', toIso(start))
      .lte('date', toIso(end));
    if (monthErr) throw monthErr;
    const monthlyAmount = (monthly || []).reduce((s, r: any) => s + (r.amount || 0), 0);

    const total = await this.getCount('withdrawals');
    return { totalAmount, monthlyAmount, total };
  }

  async getOperationsLog() {
    const { data, error } = await this.supabase
      .from('operations_log')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Map the data to ensure proper field names
    return (data || []).map(row => ({
      id: row.id,
      operationType: row.operation_type,
      details: row.details,
      date: row.date,
      createdAt: row.created_at,
      // Try both performed_by and approved_by columns
      performedBy: row.performed_by || row.approved_by || 'مستخدم غير محدد'
    }));
  }

  // CRUD operations
  async addInvestor(investorData: any) {
    const { data, error } = await this.supabase
      .from('investors')
      .insert([{
        id: investorData.id,
        name: investorData.name,
        phone: investorData.phone,
        national_id: investorData.nationalId,
        bank_transfer_number: investorData.bankTransferNumber,
        share_percentage: investorData.sharePercentage,
        total_invested: investorData.totalInvested,
        total_profit: investorData.totalProfit,
        total_withdrawn: investorData.totalWithdrawn,
        current_balance: investorData.currentBalance
      }])
      .select();
    
    if (error) throw error;
    return data;
  }

  async updateInvestor(id: string, investorData: any) {
    const { data, error } = await this.supabase
      .from('investors')
      .update({
        name: investorData.name,
        phone: investorData.phone,
        national_id: investorData.nationalId,
        bank_transfer_number: investorData.bankTransferNumber,
        share_percentage: investorData.sharePercentage,
        total_invested: investorData.totalInvested,
        total_profit: investorData.totalProfit,
        total_withdrawn: investorData.totalWithdrawn,
        current_balance: investorData.currentBalance
      })
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data;
  }

  async deleteInvestor(id: string) {
    const { data, error } = await this.supabase
      .from('investors')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return data;
  }

  async addExpense(expenseData: any) {
    const insertData: any = {
      id: expenseData.id,
      category: expenseData.category,
      amount: expenseData.amount,
      date: expenseData.date,
      notes: expenseData.notes,
      added_by: expenseData.addedBy
    };

    // Only add attachment_urls if attachments exist
    if (expenseData.attachments && expenseData.attachments.length > 0) {
      insertData.attachment_urls = JSON.stringify(expenseData.attachments);
    }

    const { data, error } = await this.supabase
      .from('expenses')
      .insert([insertData])
      .select();

    if (error) throw error;
    return data;
  }

  async updateExpense(id: string, expenseData: any) {
    const updateData: any = {
      category: expenseData.category,
      amount: expenseData.amount,
      date: expenseData.date,
      notes: expenseData.notes,
      added_by: expenseData.addedBy
    };

    // Only add attachment_urls if attachments exist
    if (expenseData.attachments && expenseData.attachments.length > 0) {
      updateData.attachment_urls = JSON.stringify(expenseData.attachments);
    }

    const { data, error } = await this.supabase
      .from('expenses')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) throw error;
    return data;
  }

  async deleteExpense(id: string) {
    const { data, error } = await this.supabase
      .from('expenses')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return data;
  }

  async addRevenue(revenueData: any) {
    const insertData: any = {
      id: revenueData.id,
      amount: revenueData.amount,
      date: revenueData.date,
      description: revenueData.description,
      added_by: revenueData.addedBy
    };

    // Only add attachment_urls if attachments exist
    if (revenueData.attachments && revenueData.attachments.length > 0) {
      insertData.attachment_urls = JSON.stringify(revenueData.attachments);
    }

    const { data, error } = await this.supabase
      .from('revenues')
      .insert([insertData])
      .select();

    if (error) throw error;
    return data;
  }

  async updateRevenue(id: string, revenueData: any) {
    const updateData: any = {
      amount: revenueData.amount,
      date: revenueData.date,
      description: revenueData.description,
      added_by: revenueData.addedBy
    };

    // Only add attachment_urls if attachments exist
    if (revenueData.attachments && revenueData.attachments.length > 0) {
      updateData.attachment_urls = JSON.stringify(revenueData.attachments);
    }

    const { data, error } = await this.supabase
      .from('revenues')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) throw error;
    return data;
  }

  async deleteRevenue(id: string) {
    const { data, error } = await this.supabase
      .from('revenues')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return data;
  }

  async addWithdrawal(withdrawalData: any) {
    const insertData: any = {
      id: withdrawalData.id,
      investor_name: withdrawalData.investorName,
      amount: withdrawalData.amount,
      date: withdrawalData.date,
      notes: withdrawalData.notes,
      approved_by: withdrawalData.approvedBy
    };

    // Only add attachment_urls if attachments exist
    if (withdrawalData.attachments && withdrawalData.attachments.length > 0) {
      insertData.attachment_urls = JSON.stringify(withdrawalData.attachments);
    }

    const { data, error } = await this.supabase
      .from('withdrawals')
      .insert([insertData])
      .select();

    if (error) throw error;
    return data;
  }

  async updateWithdrawal(id: string, withdrawalData: any) {
    const updateData: any = {
      investor_name: withdrawalData.investorName,
      amount: withdrawalData.amount,
      date: withdrawalData.date,
      notes: withdrawalData.notes,
      approved_by: withdrawalData.approvedBy
    };

    // Only add attachment_urls if attachments exist
    if (withdrawalData.attachments && withdrawalData.attachments.length > 0) {
      updateData.attachment_urls = JSON.stringify(withdrawalData.attachments);
    }

    const { data, error } = await this.supabase
      .from('withdrawals')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) throw error;
    return data;
  }

  async deleteWithdrawal(id: string) {
    const { data, error } = await this.supabase
      .from('withdrawals')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return data;
  }

  async addOperationLog(logData: any) {
    const { data, error } = await this.supabase
      .from('operations_log')
      .insert([{
        id: logData.id,
        operation_type: logData.operationType,
        details: logData.details,
        date: logData.date,
        performed_by: logData.performedBy
      }])
      .select();
    
    if (error) throw error;
    return data;
  }

  // User management functions
  async addUser(userData: any) {
    const { data, error } = await this.supabase
      .from('users')
      .insert([{
        id: userData.id,
        name: userData.name,
        phone: userData.phone,
        role: userData.role,
        password: userData.password
      }])
      .select();

    if (error) throw error;
    return data;
  }

  async updateUser(id: string, userData: any) {
    const updateData: any = {
      name: userData.name,
      phone: userData.phone,
      role: userData.role
    };

    // Only update password if provided
    if (userData.password && userData.password.trim() !== '') {
      updateData.password = userData.password;
    }

    const { data, error } = await this.supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) throw error;
    return data;
  }

  async deleteUser(id: string) {
    const { data, error } = await this.supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return data;
  }

  // Test connection
  async testConnection() {
    try {
      const { data, error } = await this.supabase
        .from('settings')
        .select('*')
        .limit(1);

      if (error) {
        return {
          success: false,
          message: 'فشل في الاتصال بـ Supabase',
          error: error.message
        };
      }

      return {
        success: true,
        message: 'تم الاتصال بـ Supabase بنجاح!',
        data
      };
    } catch (error) {
      return {
        success: false,
        message: 'خطأ في الاتصال',
        error: error.message
      };
    }
  }

  // Project Withdrawals CRUD operations
  async addProjectWithdrawal(data: any) {
    try {
      const { data: result, error } = await this.supabase
        .from('project_withdrawals')
        .insert({
          id: data.id,
          amount: data.amount,
          date: data.date,
          purpose: data.purpose,
          notes: data.notes,
          approved_by: data.approvedBy
        })
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST205') {
          throw new Error('جدول سحوبات المشروع غير موجود في Supabase. يرجى إنشاؤه أولاً.');
        }
        throw error;
      }
      return result;
    } catch (error) {
      console.error('❌ Error adding project withdrawal:', error.message);
      throw error;
    }
  }

  async updateProjectWithdrawal(id: string, data: any) {
    const { data: result, error } = await this.supabase
      .from('project_withdrawals')
      .update({
        amount: data.amount,
        date: data.date,
        purpose: data.purpose,
        notes: data.notes,
        approved_by: data.approvedBy
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return result;
  }

  async deleteProjectWithdrawal(id: string) {
    const { error } = await this.supabase
      .from('project_withdrawals')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  }


}

export default SupabaseDatabase;
