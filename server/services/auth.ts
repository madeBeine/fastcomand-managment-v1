import jwt from 'jsonwebtoken';
import { User, LoginCredentials, AuthResponse, UserPermissions } from '@shared/types';
import { GoogleSheetsService } from './googleSheets';

export class AuthService {
  private jwtSecret: string;
  private googleSheetsService: GoogleSheetsService;

  constructor(googleSheetsService: GoogleSheetsService) {
    this.jwtSecret = process.env.JWT_SECRET || 'investment-app-secret-key-2024';
    this.googleSheetsService = googleSheetsService;
  }

  async authenticateUser(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const users = await this.googleSheetsService.getUsers();
      
      // Find user by phone or email
      const user = users.find(u => 
        u.phone === credentials.identifier || 
        u.email === credentials.identifier ||
        u.name === credentials.identifier
      );

      if (!user) {
        return {
          success: false,
          message: 'المستخدم غير موجود'
        };
      }

      // Simple password check (in production, use bcrypt)
      if (user.password !== credentials.password) {
        return {
          success: false,
          message: 'كلمة المرور غير صحيحة'
        };
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user.id, 
          role: user.role,
          name: user.name 
        },
        this.jwtSecret,
        { expiresIn: '7d' }
      );

      // Remove password from response
      const { password, ...userWithoutPassword } = user;

      return {
        success: true,
        user: userWithoutPassword,
        token,
        message: 'تم تسجيل الدخول بنجاح'
      };

    } catch (error) {
      console.error('Authentication error:', error);
      return {
        success: false,
        message: '��دث خطأ أثناء تسجيل الدخول'
      };
    }
  }

  verifyToken(token: string): { valid: boolean; user?: any } {
    try {
      const decoded = jwt.verify(token, this.jwtSecret);
      return { valid: true, user: decoded };
    } catch (error) {
      return { valid: false };
    }
  }

  getUserPermissions(role: string): UserPermissions {
    switch (role) {
      case 'Admin':
        return {
          canViewInvestors: true,
          canEditInvestors: true,
          canViewExpenses: true,
          canEditExpenses: true,
          canViewRevenues: true,
          canEditRevenues: true,
          canViewWithdrawals: true,
          canApproveWithdrawals: true,
          canViewSettings: true,
          canEditSettings: true,
          canViewAIInsights: true,
          canViewAllData: true,
          canExportData: true,
        };
      
      case 'Assistant':
        return {
          canViewInvestors: true,
          canEditInvestors: true,
          canViewExpenses: true,
          canEditExpenses: true,
          canViewRevenues: true,
          canEditRevenues: true,
          canViewWithdrawals: true,
          canApproveWithdrawals: true,
          canViewSettings: false,
          canEditSettings: false,
          canViewAIInsights: true,
          canViewAllData: true,
          canExportData: false,
        };
      
      case 'Investor':
        return {
          canViewInvestors: false,
          canEditInvestors: false,
          canViewExpenses: true,
          canEditExpenses: false,
          canViewRevenues: true,
          canEditRevenues: false,
          canViewWithdrawals: true, // Allow investors to view withdrawals
          canApproveWithdrawals: false,
          canViewSettings: false,
          canEditSettings: false,
          canViewAIInsights: true,
          canViewAllData: false,
          canExportData: false,
        };
      
      default:
        return {
          canViewInvestors: false,
          canEditInvestors: false,
          canViewExpenses: false,
          canEditExpenses: false,
          canViewRevenues: false,
          canEditRevenues: false,
          canViewWithdrawals: false,
          canApproveWithdrawals: false,
          canViewSettings: false,
          canEditSettings: false,
          canViewAIInsights: false,
          canViewAllData: false,
          canExportData: false,
        };
    }
  }

  checkPermission(userRole: string, permission: keyof UserPermissions): boolean {
    const permissions = this.getUserPermissions(userRole);
    return permissions[permission];
  }
}
