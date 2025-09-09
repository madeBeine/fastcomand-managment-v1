import { Router } from 'express';
import { authenticateRequest } from './auth';
import fs from 'fs';
import path from 'path';

const router = Router();

// File to store settings
const SETTINGS_FILE = path.join(process.cwd(), 'settings.json');

// Default settings
const defaultSettings = {
  // الإعدادات المالية
  projectPercentage: 15,
  currency: 'MRU',
  customAllocations: [],

  // معلومات الشركة
  companyName: 'Fast Command',
  companyPhone: '',
  companyEmail: '',
  companyAddress: '',

  // الإعدادات العامة
  autoBackup: true,
  backupFrequency: 'daily',
  sessionTimeout: 30,
  dataRetentionDays: 365,

  // الإشعارات
  emailNotifications: true,
  smsNotifications: false,
  emailForReports: '',

  // المظهر والواجهة
  theme: 'light',
  language: 'ar',
  dateFormat: 'DD/MM/YYYY'
};

// Load settings from file
const loadSettings = () => {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = fs.readFileSync(SETTINGS_FILE, 'utf8');
      return { ...defaultSettings, ...JSON.parse(data) };
    }
  } catch (error) {
    console.error('Error loading settings:', error);
  }
  return defaultSettings;
};

// Save settings to file
const saveSettings = (settings: any) => {
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving settings:', error);
    return false;
  }
};

// Get settings
router.get('/api/settings', authenticateRequest, (req, res) => {
  try {
    const settings = loadSettings();
    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error getting settings:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تحميل الإعدادات'
    });
  }
});

// Save settings
router.post('/api/settings/save', authenticateRequest, async (req, res) => {
  try {
    const user = (req as any).user;
    
    if (user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية لحفظ الإعدادات'
      });
    }

    const newSettings = { ...defaultSettings, ...req.body };
    
    // Validate percentages
    const totalCustomAllocations = newSettings.customAllocations.reduce(
      (sum: number, allocation: any) => sum + (allocation.percentage || 0), 0
    );
    
    if (totalCustomAllocations > newSettings.projectPercentage) {
      return res.status(400).json({
        success: false,
        message: 'مجموع التخصيصات الإضافية لا يمكن أن يتجاوز نسبة المشروع'
      });
    }

    const saved = saveSettings(newSettings);
    
    if (saved) {
      // Log the settings change
      const { databaseService } = await import('../services/databaseService');
      
      await databaseService.addOperationLog({
        id: 'LOG' + Date.now(),
        operationType: 'تحديث الإعدادات',
        details: `تم تحديث إعدادات النظام - نسبة المشروع: ${newSettings.projectPercentage}%، التخصيصات الإضافية: ${newSettings.customAllocations.length}`,
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        performedBy: user.name
      });

      res.json({
        success: true,
        message: 'تم حفظ الإعدادات بنجاح',
        data: newSettings
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'فشل في حفظ الإعدادات'
      });
    }
  } catch (error) {
    console.error('Error saving settings:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء حفظ الإعدادات'
    });
  }
});

// Get current settings for dashboard calculations
router.get('/api/settings/current', authenticateRequest, (req, res) => {
  try {
    const settings = loadSettings();
    res.json({
      success: true,
      data: {
        projectPercentage: settings.projectPercentage,
        customAllocations: settings.customAllocations,
        currency: settings.currency
      }
    });
  } catch (error) {
    console.error('Error getting current settings:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب الإعدادات'
    });
  }
});

export { loadSettings };
export default router;
