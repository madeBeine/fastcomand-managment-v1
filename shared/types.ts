export interface User {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  role: 'Admin' | 'Assistant' | 'Investor';
  password: string;
  permissions?: string[];
  createdAt?: string;
  lastLogin?: string;
}

export interface Investor {
  id: string;
  name: string;
  phone: string;
  nationalId?: string; // رقم الهوية
  bankTransferNumber?: string; // رقم التحويل البنكي
  sharePercentage: number;
  totalInvested: number;
  totalProfit: number;
  totalWithdrawn: number;
  currentBalance: number; // Total_Profit - Total_Withdrawn
  effectiveSharePercentage?: number; // النسبة الفعلية بعد خصم نسبة المشروع
  expectedEffectiveProfit?: number; // الربح المتوقع بناءً على النسبة الفعلية
  lastUpdated?: string;
}

export interface Expense {
  id: string;
  category: string;
  amount: number;
  date: string;
  notes?: string;
  addedBy: string;
  createdAt?: string;
  timestamp?: string;
  attachments?: {
    name: string;
    size: number;
    type: string;
    url?: string;
  }[];
}

export interface Revenue {
  id: string;
  amount: number;
  date: string;
  description: string;
  addedBy: string;
  createdAt?: string;
  timestamp?: string;
  attachments?: {
    name: string;
    size: number;
    type: string;
    url?: string;
  }[];
}

export interface Withdrawal {
  id: string;
  investorName: string;
  amount: number;
  date: string;
  notes?: string;
  approvedBy: string;
  createdAt?: string;
  timestamp?: string;
  attachments?: {
    name: string;
    size: number;
    type: string;
    url?: string;
  }[];
}

export interface ProjectWithdrawal {
  id: string;
  amount: number;
  date: string;
  purpose: string; // الغرض من السحب
  notes?: string;
  approvedBy: string;
  createdAt?: string;
  timestamp?: string;
}

export interface OperationLog {
  id: string;
  operationType: string;
  details: string;
  date: string;
  performedBy: string;
}

export interface AppSettings {
  projectPercentage: number;
  currency: 'MRU';
  enableGoogleDriveLink: boolean;
  enableAIInsights: boolean;
  googleDriveId?: string;
  openAiKey?: string;
  sheetId: string;
  lastSync?: string;
  aiSyncInterval: number; // days
}

export interface AIInsight {
  id: string;
  type: 'recommendation' | 'warning' | 'analysis';
  title: string;
  message: string;
  date: string;
  severity: 'low' | 'medium' | 'high';
  data?: any;
}

export interface DashboardStats {
  totalRevenue: number;
  totalExpenses: number;
  totalProfit: number; // Net profit (revenues - expenses)
  totalWithdrawals: number;
  activeInvestors: number;
  monthlyGrowth: number;
  pendingApprovals: number;
  projectBalance?: number; // 15% of net profit
  availableBalance?: number; // Available for distribution after project cut and withdrawals
}

export interface GoogleSheetsConfig {
  sheetId: string;
  credentials?: any;
  isConnected: boolean;
}

// Response types for API endpoints
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
}

export interface LoginCredentials {
  identifier: string; // phone or email
  password: string;
}

export interface UserPermissions {
  canViewInvestors: boolean;
  canEditInvestors: boolean;
  canViewExpenses: boolean;
  canEditExpenses: boolean;
  canViewRevenues: boolean;
  canEditRevenues: boolean;
  canViewWithdrawals: boolean;
  canApproveWithdrawals: boolean;
  canViewSettings: boolean;
  canEditSettings: boolean;
  canViewAIInsights: boolean;
  canViewAllData: boolean;
  canExportData: boolean;
}
