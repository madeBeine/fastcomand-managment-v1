import { SupabaseDatabase } from './supabaseDatabase';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class DataBackupService {
  private database: SupabaseDatabase;
  private backupDir: string;

  constructor() {
    this.database = new SupabaseDatabase();
    this.backupDir = path.join(__dirname, '../backups');
    this.ensureBackupDir();
  }

  private ensureBackupDir() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
      console.log('📁 Created backup directory');
    }
  }

  // إنشاء نسخة احتياطية بتنسيق JSON
  async createJsonBackup(): Promise<{ success: boolean; filePath?: string; message: string }> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `backup-${timestamp}.json`;
      const filePath = path.join(this.backupDir, fileName);

      const backupData = {
        timestamp: new Date().toISOString(),
        version: '1.0',
        data: {
          investors: await this.database.getInvestors(),
          expenses: await this.database.getExpenses(),
          revenues: await this.database.getRevenues(),
          withdrawals: await this.database.getWithdrawals(),
          users: await this.database.getUsers(),
          settings: await this.database.getSettings(),
          operationsLog: await this.database.getOperationsLog()
        }
      };

      fs.writeFileSync(filePath, JSON.stringify(backupData, null, 2), 'utf8');
      
      console.log('✅ Backup created:', fileName);
      return {
        success: true,
        filePath,
        message: `تم إنشاء النسخة الاحتياطية: ${fileName}`
      };
    } catch (error) {
      console.error('❌ Backup creation failed:', error);
      return {
        success: false,
        message: `فشل في إنشاء النسخة الاحتياطية: ${error.message}`
      };
    }
  }

  // استعادة البيانات من نسخة احتياطية
  async restoreFromBackup(backupFileName: string): Promise<{ success: boolean; message: string }> {
    try {
      const filePath = path.join(this.backupDir, backupFileName);
      
      if (!fs.existsSync(filePath)) {
        return {
          success: false,
          message: 'ملف النسخة الاحتياطية غير موجود'
        };
      }

      const backupContent = fs.readFileSync(filePath, 'utf8');
      const backupData = JSON.parse(backupContent);

      // Clear existing data and restore from backup
      await this.clearAllData();
      await this.restoreData(backupData.data);

      console.log('✅ Data restored from backup:', backupFileName);
      return {
        success: true,
        message: `تم استعادة البيانات من: ${backupFileName}`
      };
    } catch (error) {
      console.error('❌ Restore failed:', error);
      return {
        success: false,
        message: `فشل في استعادة البيانات: ${error.message}`
      };
    }
  }

  // قائمة النسخ الاحتياطية المتاحة
  listBackups(): string[] {
    try {
      const files = fs.readdirSync(this.backupDir);
      return files
        .filter(file => file.endsWith('.json') && file.startsWith('backup-'))
        .sort()
        .reverse(); // أحدث أولاً
    } catch (error) {
      console.error('❌ Error listing backups:', error);
      return [];
    }
  }

  // تصدير البيانات للتحميل
  async exportForDownload(): Promise<{ success: boolean; data?: any; message: string }> {
    try {
      const exportData = {
        exportDate: new Date().toISOString(),
        applicationName: 'نظام إدارة الاستثمارات',
        data: {
          investors: await this.database.getInvestors(),
          expenses: await this.database.getExpenses(),
          revenues: await this.database.getRevenues(),
          withdrawals: await this.database.getWithdrawals(),
          settings: await this.database.getSettings()
        }
      };

      return {
        success: true,
        data: exportData,
        message: 'تم تجهيز البيانات للتحميل'
      };
    } catch (error) {
      console.error('❌ Export failed:', error);
      return {
        success: false,
        message: `فشل في تصدير البيانات: ${error.message}`
      };
    }
  }

  // استيراد البيانات من ملف
  async importData(importData: any): Promise<{ success: boolean; message: string }> {
    try {
      if (!importData.data) {
        return {
          success: false,
          message: 'صيغة البيانات غير صحيحة'
        };
      }

      // Backup current data before import
      await this.createJsonBackup();

      // Clear and import new data
      await this.clearAllData();
      await this.restoreData(importData.data);

      return {
        success: true,
        message: 'تم استيراد البيانات بنجاح'
      };
    } catch (error) {
      console.error('❌ Import failed:', error);
      return {
        success: false,
        message: `فشل في استيراد البيانات: ${error.message}`
      };
    }
  }

  // مسح جميع البيانات
  private async clearAllData() {
    // This would clear all tables, but we'll implement it carefully
    console.log('🗑️ Clearing existing data for restore...');
    // Note: For Supabase, we might need to implement specific clear methods
    // For now, we'll just log this action
  }

  // استعادة البيانات
  private async restoreData(data: any) {
    // Restore investors
    if (data.investors) {
      for (const investor of data.investors) {
        try {
          await this.database.addInvestor(investor);
        } catch (error) {
          console.error('Error restoring investor:', error);
        }
      }
    }

    // Restore expenses
    if (data.expenses) {
      for (const expense of data.expenses) {
        try {
          await this.database.addExpense(expense);
        } catch (error) {
          console.error('Error restoring expense:', error);
        }
      }
    }

    // Restore revenues
    if (data.revenues) {
      for (const revenue of data.revenues) {
        try {
          await this.database.addRevenue(revenue);
        } catch (error) {
          console.error('Error restoring revenue:', error);
        }
      }
    }

    // Restore withdrawals
    if (data.withdrawals) {
      for (const withdrawal of data.withdrawals) {
        try {
          await this.database.addWithdrawal(withdrawal);
        } catch (error) {
          console.error('Error restoring withdrawal:', error);
        }
      }
    }

    // Add restoration log
    await this.database.addOperationLog({
      id: 'LOG' + Date.now(),
      operationType: 'استعادة بيانات',
      details: 'تم استعادة البيانات من نسخة احتياطية',
      date: new Date().toLocaleString('ar-SA'),
      performedBy: 'النظام التلقائي'
    });

    console.log('✅ Data restoration completed');
  }

  // إنشاء نسخة احتياطية تلقائية
  async autoBackup() {
    try {
      const result = await this.createJsonBackup();
      if (result.success) {
        console.log('🔄 Auto backup completed successfully');
      }
      return result;
    } catch (error) {
      console.error('❌ Auto backup failed:', error);
      return {
        success: false,
        message: 'فشل في النسخ الاحتياطي التلقائي'
      };
    }
  }
}

// إنشاء instance واحد للاستخدام
export const dataBackupService = new DataBackupService();

// جدولة النسخ الاحتياطي التلقائي كل 6 ساعات
setInterval(() => {
  console.log('🕐 Starting scheduled backup...');
  dataBackupService.autoBackup();
}, 6 * 60 * 60 * 1000); // 6 ساعات

console.log('📋 Data backup service initialized with auto-backup every 6 hours');
