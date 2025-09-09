import { RequestHandler } from "express";
import { getUserPermissions } from "./auth";
import { databaseService } from "../services/databaseService";

// Use the singleton Database Service instance
const database = databaseService;

// Investors CRUD
export const handleAddInvestor: RequestHandler = async (req, res) => {
  try {
    const user = (req as any).user;
    const permissions = getUserPermissions(user.role);
    
    if (!permissions.canEditInvestors) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية لإضافة مستثمرين'
      });
    }

    // Validate required fields
    if (!req.body.name || !req.body.phone || req.body.sharePercentage === undefined) {
      return res.status(400).json({
        success: false,
        message: 'الحقول مطلوبة: الاسم، الهاتف، نسبة المشاركة'
      });
    }

    const sharePercentage = parseFloat(req.body.sharePercentage);
    const totalInvested = parseFloat(req.body.totalInvested) || 0;

    if (isNaN(sharePercentage)) {
      return res.status(400).json({
        success: false,
        message: 'نسبة المشاركة يجب أن تكون رقم صحيح'
      });
    }

    const newInvestor = {
      id: 'INV' + Date.now(),
      name: req.body.name.trim(),
      phone: req.body.phone.trim(),
      nationalId: req.body.nationalId?.trim() || null,
      bankTransferNumber: req.body.bankTransferNumber?.trim() || null,
      sharePercentage: sharePercentage,
      totalInvested: totalInvested,
      totalProfit: 0,
      totalWithdrawn: 0,
      currentBalance: totalInvested
    };

    const result = await database.addInvestor(newInvestor);

    // Log the operation
    await database.addOperationLog({
      id: 'LOG' + Date.now(),
      operationType: 'إضافة مستثمر',
      details: `تم إضافة مستثمر جديد: ${newInvestor.name} بنسبة ${newInvestor.sharePercentage}%`,
      date: new Date().toLocaleString('ar-SA'),
      performedBy: user.name
    });

    res.json({
      success: true,
      message: 'تم إضافة المستثمر بنجاح',
      data: newInvestor
    });

  } catch (error) {
    console.error('Add investor error:', error);

    let errorMessage = 'حدث خ��أ في إضا��ة المستثمر';

    if (error && typeof error === 'object') {
      if (error.code === '23502') {
        errorMessage = 'بيانات المستثمر غير مكتملة - يرجى التأكد من ملء جميع الحقول المطلوبة';
      } else if (error.message) {
        errorMessage = `خطأ في قاعدة البيانات: ${error.message}`;
      }
    }

    res.status(500).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

export const handleUpdateInvestor: RequestHandler = async (req, res) => {
  try {
    const user = (req as any).user;
    const permissions = getUserPermissions(user.role);

    if (!permissions.canEditInvestors) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية لتعديل المستثمرين'
      });
    }

    const investorId = req.body.id;

    // Validate required fields for update
    if (!investorId) {
      return res.status(400).json({
        success: false,
        message: 'معرف المستثمر مطلوب للتحديث'
      });
    }

    if (!req.body.name || !req.body.phone || req.body.sharePercentage === undefined) {
      return res.status(400).json({
        success: false,
        message: 'الحقول مطلوبة للتحديث: الاسم، الهاتف، نسبة المشاركة'
      });
    }

    const sharePercentage = parseFloat(req.body.sharePercentage);
    const totalInvested = parseFloat(req.body.totalInvested) || 0;

    if (isNaN(sharePercentage)) {
      return res.status(400).json({
        success: false,
        message: 'نسبة المشاركة يجب أن تكون رقم صحيح'
      });
    }

    const updatedInvestor = {
      name: req.body.name.trim(),
      phone: req.body.phone.trim(),
      nationalId: req.body.nationalId?.trim() || null,
      bankTransferNumber: req.body.bankTransferNumber?.trim() || null,
      sharePercentage: sharePercentage,
      totalInvested: totalInvested,
      totalProfit: parseFloat(req.body.totalProfit || 0),
      totalWithdrawn: parseFloat(req.body.totalWithdrawn || 0),
      currentBalance: parseFloat(req.body.currentBalance || totalInvested)
    };

    console.log('🔄 Updating investor:', investorId, updatedInvestor);

    const result = await database.updateInvestor(investorId, updatedInvestor);

    // Log the operation
    await database.addOperationLog({
      id: 'LOG' + Date.now(),
      operationType: 'تعديل مستثمر',
      details: `ت��� تعديل بيانات المستثمر: ${updatedInvestor.name}`,
      date: new Date().toLocaleString('ar-SA'),
      performedBy: user.name
    });

    res.json({
      success: true,
      message: 'تم تحديث المستثمر بنجاح',
      data: result
    });

  } catch (error) {
    console.error('Update investor error:', error);

    let errorMessage = 'حدث خطأ في تحديث المستثمر';

    if (error && typeof error === 'object' && error.message) {
      errorMessage = `خطأ في قاع��ة البيانات: ${error.message}`;
    }

    res.status(500).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

export const handleDeleteInvestor: RequestHandler = async (req, res) => {
  try {
    const user = (req as any).user;
    const permissions = getUserPermissions(user.role);

    if (!permissions.canEditInvestors) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية لحذف المستثمرين'
      });
    }

    const investorId = req.body.id;

    if (!investorId) {
      return res.status(400).json({
        success: false,
        message: 'معرف المستثمر مطلوب لل����ذف'
      });
    }

    console.log('🗑️ Deleting investor:', investorId);

    const result = await database.deleteInvestor(investorId);

    // Log the operation
    await database.addOperationLog({
      id: 'LOG' + Date.now(),
      operationType: 'حذف مستثمر',
      details: `تم حذف المستثمر بالرقم: ${investorId}`,
      date: new Date().toLocaleString('ar-SA'),
      performedBy: user.name
    });

    res.json({
      success: true,
      message: 'تم حذف المستثمر بنجاح',
      data: result
    });

  } catch (error) {
    console.error('Delete investor error:', error);

    let errorMessage = 'حدث خطأ في حذف المستثمر';

    if (error && typeof error === 'object' && error.message) {
      errorMessage = `خطأ في قاعدة البيانات: ${error.message}`;
    }

    res.status(500).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Expenses CRUD
export const handleAddExpense: RequestHandler = async (req, res) => {
  try {
    const user = (req as any).user;
    const permissions = getUserPermissions(user.role);
    
    if (!permissions.canEditExpenses) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك ��لاحية لإضافة مصاريف'
      });
    }

    const newExpense = {
      id: 'EXP' + Date.now(),
      category: req.body.category,
      amount: parseFloat(req.body.amount),
      date: req.body.date || new Date().toLocaleDateString('ar-SA'),
      notes: req.body.notes || '',
      addedBy: user.name,
      attachments: req.body.attachments || [],
      timestamp: req.body.timestamp || new Date().toISOString()
    };

    const result = await database.addExpense(newExpense);

    // Log the operation
    await database.addOperationLog({
      id: 'LOG' + Date.now(),
      operationType: 'إضافة مصروف',
      details: `تم إضافة مصروف جديد: ${newExpense.category} بقيمة ${newExpense.amount.toLocaleString()} MRU في تاريخ ${newExpense.date}. ${newExpense.notes ? 'ملاحظات: ' + newExpense.notes : ''}`,
      date: new Date().toLocaleString('ar-SA'),
      performedBy: user.name
    });

    res.json({
      success: true,
      message: 'تم إضافة المصروف بنجاح',
      data: newExpense
    });

  } catch (error) {
    console.error('Add expense error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في إضافة المصروف'
    });
  }
};

export const handleUpdateExpense: RequestHandler = async (req, res) => {
  try {
    const user = (req as any).user;
    const permissions = getUserPermissions(user.role);
    
    if (!permissions.canEditExpenses) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية لتعديل المصاريف'
      });
    }

    const expenseId = req.body.id;
    const updatedExpense = {
      category: req.body.category,
      amount: parseFloat(req.body.amount),
      date: req.body.date,
      notes: req.body.notes || '',
      addedBy: user.name,
      attachments: req.body.attachments || [],
      timestamp: req.body.timestamp || new Date().toISOString()
    };

    const result = await database.updateExpense(expenseId, updatedExpense);

    // Log the operation
    database.addOperationLog({
      id: 'LOG' + Date.now(),
      operationType: 'تعديل مصروف',
      details: `تم تعديل المصروف: ${updatedExpense.category}`,
      date: new Date().toLocaleString('ar-SA'),
      performedBy: user.name
    });

    res.json({
      success: true,
      message: 'تم تحديث المصروف بنجاح'
    });

  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في تحديث المصروف'
    });
  }
};

export const handleDeleteExpense: RequestHandler = async (req, res) => {
  try {
    const user = (req as any).user;
    const permissions = getUserPermissions(user.role);
    
    if (!permissions.canEditExpenses) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية لحذف المصاريف'
      });
    }

    const expenseId = req.body.id;
    const result = database.deleteExpense(expenseId);

    // Log the operation
    database.addOperationLog({
      id: 'LOG' + Date.now(),
      operationType: 'حذف مصروف',
      details: `تم حذف المصروف بالرقم: ${expenseId}`,
      date: new Date().toLocaleString('ar-SA'),
      performedBy: user.name
    });

    res.json({
      success: true,
      message: 'تم حذف المصروف بنجاح'
    });

  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في حذف المصروف'
    });
  }
};

// Revenues CRUD
export const handleAddRevenue: RequestHandler = async (req, res) => {
  try {
    const user = (req as any).user;
    const permissions = getUserPermissions(user.role);
    
    if (!permissions.canEditRevenues) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية لإضافة إيرادات'
      });
    }

    const newRevenue = {
      id: 'REV' + Date.now(),
      amount: parseFloat(req.body.amount),
      date: req.body.date || new Date().toLocaleDateString('ar-SA'),
      description: req.body.description,
      addedBy: user.name,
      attachments: req.body.attachments || [],
      timestamp: req.body.timestamp || new Date().toISOString()
    };

    const result = await database.addRevenue(newRevenue);

    // Log the operation
    await database.addOperationLog({
      id: 'LOG' + Date.now(),
      operationType: 'إضافة إيراد',
      details: `تم تسجيل إيراد جديد: ${newRevenue.description} بقيمة ${newRevenue.amount.toLocaleString()} MRU في تاريخ ${newRevenue.date}. مصدر الإيراد: ${newRevenue.description}`,
      date: new Date().toLocaleString('ar-SA'),
      performedBy: user.name
    });

    res.json({
      success: true,
      message: 'تم إضافة الإيراد بنجاح',
      data: newRevenue
    });

  } catch (error) {
    console.error('Add revenue error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في إضافة الإيراد'
    });
  }
};

export const handleUpdateRevenue: RequestHandler = async (req, res) => {
  try {
    const user = (req as any).user;
    const permissions = getUserPermissions(user.role);
    
    if (!permissions.canEditRevenues) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية لتعديل الإيرادات'
      });
    }

    const revenueId = req.body.id;
    const updatedRevenue = {
      amount: parseFloat(req.body.amount),
      date: req.body.date,
      description: req.body.description,
      addedBy: user.name,
      attachments: req.body.attachments || [],
      timestamp: req.body.timestamp || new Date().toISOString()
    };

    const result = await database.updateRevenue(revenueId, updatedRevenue);

    // Log the operation
    database.addOperationLog({
      id: 'LOG' + Date.now(),
      operationType: 'تعديل إيراد',
      details: `تم تعديل الإيراد: ${updatedRevenue.description}`,
      date: new Date().toLocaleString('ar-SA'),
      performedBy: user.name
    });

    res.json({
      success: true,
      message: 'تم تحديث الإيراد بنجاح'
    });

  } catch (error) {
    console.error('Update revenue error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في تحديث الإيراد'
    });
  }
};

export const handleDeleteRevenue: RequestHandler = async (req, res) => {
  try {
    const user = (req as any).user;
    const permissions = getUserPermissions(user.role);
    
    if (!permissions.canEditRevenues) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية لحذف الإيرادات'
      });
    }

    const revenueId = req.body.id;
    const result = database.deleteRevenue(revenueId);

    // Log the operation
    database.addOperationLog({
      id: 'LOG' + Date.now(),
      operationType: 'حذف إيراد',
      details: `تم حذف الإيراد بالرقم: ${revenueId}`,
      date: new Date().toLocaleString('ar-SA'),
      performedBy: user.name
    });

    res.json({
      success: true,
      message: 'تم حذف الإيراد بنجاح'
    });

  } catch (error) {
    console.error('Delete revenue error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في حذف الإيراد'
    });
  }
};

// Withdrawals CRUD
export const handleAddWithdrawal: RequestHandler = async (req, res) => {
  try {
    const user = (req as any).user;
    const permissions = getUserPermissions(user.role);
    
    if (!permissions.canApproveWithdrawals) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية لإضافة سح��بات'
      });
    }

    const newWithdrawal = {
      id: 'WIT' + Date.now(),
      investorName: req.body.investorName,
      amount: parseFloat(req.body.amount),
      date: req.body.date || new Date().toLocaleDateString('ar-SA'),
      notes: req.body.notes || '',
      approvedBy: user.name,
      attachments: req.body.attachments || [],
      timestamp: req.body.timestamp || new Date().toISOString()
    };

    const result = await database.addWithdrawal(newWithdrawal);

    // Update investor balance
    try {
      const investors = await database.getInvestors();
      const investor = investors.find(inv => inv.name === newWithdrawal.investorName);

      if (investor) {
        const updatedInvestor = {
          ...investor,
          totalWithdrawn: investor.totalWithdrawn + newWithdrawal.amount,
          currentBalance: investor.currentBalance - newWithdrawal.amount
        };

        await database.updateInvestor(investor.id, updatedInvestor);
        console.log(`✅ Updated investor ${investor.name} balance: ${updatedInvestor.currentBalance}`);
      }
    } catch (balanceError) {
      console.error('❌ Error updating investor balance:', balanceError);
    }

    // Log the operation
    await database.addOperationLog({
      id: 'LOG' + Date.now(),
      operationType: 'إضافة سحب',
      details: `تم تسجيل سحب جديد للمستثمر ${newWithdrawal.investorName} بقيمة ${newWithdrawal.amount.toLocaleString()} MRU. الرصيد المتبقي للمستثمر: ${(result.success && investor) ? (investor.currentBalance - newWithdrawal.amount).toLocaleString() : 'غير محدد'} MRU`,
      date: new Date().toLocaleString('ar-SA'),
      performedBy: user.name
    });

    res.json({
      success: true,
      message: 'تم تسجيل السحب بنجاح',
      data: newWithdrawal
    });

  } catch (error) {
    console.error('Add withdrawal error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في تسجيل السحب'
    });
  }
};

export const handleUpdateWithdrawal: RequestHandler = async (req, res) => {
  try {
    const user = (req as any).user;
    const permissions = getUserPermissions(user.role);
    
    if (!permissions.canApproveWithdrawals) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية لتعديل السحوبات'
      });
    }

    const withdrawalId = req.body.id;
    const updatedWithdrawal = {
      investorName: req.body.investorName,
      amount: parseFloat(req.body.amount),
      date: req.body.date,
      notes: req.body.notes || '',
      approvedBy: user.name,
      attachments: req.body.attachments || [],
      timestamp: req.body.timestamp || new Date().toISOString()
    };

    // Get old withdrawal data first
    const withdrawals = await database.getWithdrawals();
    const oldWithdrawal = withdrawals.find(w => w.id === withdrawalId);

    const result = await database.updateWithdrawal(withdrawalId, updatedWithdrawal);

    // Update investor balance if amount or investor changed
    try {
      if (oldWithdrawal) {
        const investors = await database.getInvestors();

        // Revert old withdrawal from old investor
        if (oldWithdrawal.investorName) {
          const oldInvestor = investors.find(inv => inv.name === oldWithdrawal.investorName);
          if (oldInvestor) {
            const revertedInvestor = {
              ...oldInvestor,
              totalWithdrawn: oldInvestor.totalWithdrawn - oldWithdrawal.amount,
              currentBalance: oldInvestor.currentBalance + oldWithdrawal.amount
            };
            await database.updateInvestor(oldInvestor.id, revertedInvestor);
          }
        }

        // Apply new withdrawal to new investor
        const newInvestor = investors.find(inv => inv.name === updatedWithdrawal.investorName);
        if (newInvestor) {
          const updatedInvestor = {
            ...newInvestor,
            totalWithdrawn: newInvestor.totalWithdrawn + updatedWithdrawal.amount,
            currentBalance: newInvestor.currentBalance - updatedWithdrawal.amount
          };
          await database.updateInvestor(newInvestor.id, updatedInvestor);
        }
      }
    } catch (balanceError) {
      console.error('❌ Error updating investor balance:', balanceError);
    }

    // Log the operation
    await database.addOperationLog({
      id: 'LOG' + Date.now(),
      operationType: 'تعديل سحب',
      details: `تم تعديل السحب: ${updatedWithdrawal.investorName}`,
      date: new Date().toLocaleString('ar-SA'),
      performedBy: user.name
    });

    res.json({
      success: true,
      message: 'تم تحديث السحب بنجاح'
    });

  } catch (error) {
    console.error('Update withdrawal error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في تحديث السحب'
    });
  }
};

export const handleDeleteWithdrawal: RequestHandler = async (req, res) => {
  try {
    const user = (req as any).user;
    const permissions = getUserPermissions(user.role);
    
    if (!permissions.canApproveWithdrawals) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحي�� لحذف السحوب��ت'
      });
    }

    const withdrawalId = req.body.id;

    // Get withdrawal data before deletion
    const withdrawals = await database.getWithdrawals();
    const withdrawalToDelete = withdrawals.find(w => w.id === withdrawalId);

    const result = await database.deleteWithdrawal(withdrawalId);

    // Revert withdrawal from investor balance
    try {
      if (withdrawalToDelete) {
        const investors = await database.getInvestors();
        const investor = investors.find(inv => inv.name === withdrawalToDelete.investorName);

        if (investor) {
          const updatedInvestor = {
            ...investor,
            totalWithdrawn: investor.totalWithdrawn - withdrawalToDelete.amount,
            currentBalance: investor.currentBalance + withdrawalToDelete.amount
          };

          await database.updateInvestor(investor.id, updatedInvestor);
          console.log(`✅ Reverted withdrawal for investor ${investor.name}: +${withdrawalToDelete.amount}`);
        }
      }
    } catch (balanceError) {
      console.error('❌ Error reverting investor balance:', balanceError);
    }

    // Log the operation
    await database.addOperationLog({
      id: 'LOG' + Date.now(),
      operationType: 'حذف سحب',
      details: `تم حذف السحب بالرقم: ${withdrawalId}`,
      date: new Date().toLocaleString('ar-SA'),
      performedBy: user.name
    });

    res.json({
      success: true,
      message: 'تم حذف السحب بنجاح'
    });

  } catch (error) {
    console.error('Delete withdrawal error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في حذف السحب'
    });
  }
};

// Users CRUD
export const handleAddUser: RequestHandler = async (req, res) => {
  try {
    const currentUser = (req as any).user;
    const permissions = getUserPermissions(currentUser.role);

    if (!permissions.canViewAllData) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية لإضافة مستخدمين'
      });
    }

    // Validate required fields
    if (!req.body.name || !req.body.phone || !req.body.role || !req.body.password) {
      return res.status(400).json({
        success: false,
        message: 'جميع الحقول مطلوبة: الاسم، الهاتف، الدور، كلمة المرور'
      });
    }

    const newUser = {
      id: 'USER' + Date.now(),
      name: req.body.name.trim(),
      phone: req.body.phone.trim(),
      role: req.body.role,
      password: req.body.password
    };

    console.log('🔄 Adding new user:', { ...newUser, password: '[HIDDEN]' });

    const result = await database.addUser(newUser);

    // Log the operation
    await database.addOperationLog({
      id: 'LOG' + Date.now(),
      operationType: 'إضافة مستخدم',
      details: `تم إضافة مستخدم جديد: ${newUser.name} بدور ${newUser.role}`,
      date: new Date().toLocaleString('ar-SA'),
      performedBy: currentUser.name
    });

    res.json({
      success: true,
      message: 'تم إضافة المستخدم بنجاح',
      data: { ...newUser, password: undefined } // Don't return password
    });

  } catch (error) {
    console.error('Add user error:', error);

    let errorMessage = 'حدث خطأ في إضافة المستخدم';

    if (error && typeof error === 'object') {
      if (error.code === '23505') {
        errorMessage = 'رقم الهاتف مستخدم مسبقاً';
      } else if (error.message) {
        errorMessage = `خطأ في قاعدة البيانات: ${error.message}`;
      }
    }

    res.status(500).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

export const handleUpdateUser: RequestHandler = async (req, res) => {
  try {
    const currentUser = (req as any).user;
    const permissions = getUserPermissions(currentUser.role);

    if (!permissions.canViewAllData) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية لتعديل المستخدمين'
      });
    }

    const userId = req.body.id;

    // Validate required fields for update
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'معرف المستخدم مطلوب للتحديث'
      });
    }

    if (!req.body.name || !req.body.phone || !req.body.role) {
      return res.status(400).json({
        success: false,
        message: 'جميع الحقول مطلوبة للتحديث: الاسم، الهاتف، الدور'
      });
    }

    const updatedUser = {
      name: req.body.name.trim(),
      phone: req.body.phone.trim(),
      role: req.body.role,
      password: req.body.password // Optional - only update if provided
    };

    console.log('🔄 Updating user:', userId, { ...updatedUser, password: updatedUser.password ? '[UPDATED]' : '[NOT CHANGED]' });

    const result = await database.updateUser(userId, updatedUser);

    // Log the operation
    await database.addOperationLog({
      id: 'LOG' + Date.now(),
      operationType: 'تعديل مستخدم',
      details: `تم تعديل بيانات المستخدم: ${updatedUser.name}`,
      date: new Date().toLocaleString('ar-SA'),
      performedBy: currentUser.name
    });

    res.json({
      success: true,
      message: 'تم تحديث المستخدم بنجاح',
      data: result
    });

  } catch (error) {
    console.error('Update user error:', error);

    let errorMessage = 'حدث خطأ في تحديث المستخدم';

    if (error && typeof error === 'object' && error.message) {
      errorMessage = `خطأ في ��اعدة البيانات: ${error.message}`;
    }

    res.status(500).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

export const handleDeleteUser: RequestHandler = async (req, res) => {
  try {
    const currentUser = (req as any).user;
    const permissions = getUserPermissions(currentUser.role);

    if (!permissions.canViewAllData) {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية لحذف المستخدمين'
      });
    }

    const userId = req.body.id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'معرف المستخدم مطلوب للحذف'
      });
    }

    // Check if user is trying to delete themselves
    if (userId === currentUser.id) {
      return res.status(400).json({
        success: false,
        message: 'لا يمكنك حذف حسابك الشخصي'
      });
    }

    console.log('🗑️ Deleting user:', userId);

    const result = await database.deleteUser(userId);

    // Log the operation
    await database.addOperationLog({
      id: 'LOG' + Date.now(),
      operationType: 'حذف مستخدم',
      details: `تم حذف ��لمستخدم بالرقم: ${userId}`,
      date: new Date().toLocaleString('ar-SA'),
      performedBy: currentUser.name
    });

    res.json({
      success: true,
      message: 'تم حذف ا��مستخدم بنجاح',
      data: result
    });

  } catch (error) {
    console.error('Delete user error:', error);

    let errorMessage = 'حدث خطأ في حذف المستخدم';

    if (error && typeof error === 'object' && error.message) {
      errorMessage = `خطأ في قاعدة البيانات: ${error.message}`;
    }

    res.status(500).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Project Withdrawals CRUD
export const handleAddProjectWithdrawal: RequestHandler = async (req, res) => {
  try {
    const user = (req as any).user;
    const permissions = getUserPermissions(user.role);

    if (user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية لإضافة سحوبات المشروع'
      });
    }

    // Validate required fields
    if (!req.body.amount || !req.body.purpose || !req.body.date) {
      return res.status(400).json({
        success: false,
        message: 'الحقول مطلوبة: المبلغ، الغرض، التاريخ'
      });
    }

    const amount = parseFloat(req.body.amount);
    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'المبلغ يجب أن يكون أكبر من صفر'
      });
    }

    const withdrawalData = {
      id: 'PW' + Date.now(),
      amount: amount,
      date: req.body.date,
      purpose: req.body.purpose,
      notes: req.body.notes || '',
      approvedBy: user.name
    };

    console.log('💰 Adding project withdrawal:', withdrawalData);

    const result = await database.addProjectWithdrawal(withdrawalData);

    // Log the operation
    await database.addOperationLog({
      id: 'LOG' + Date.now(),
      operationType: 'سحب من المشروع',
      details: `تم سحب ${amount} من نسبة المشروع - الغرض: ${req.body.purpose}`,
      date: new Date().toLocaleString('ar-SA'),
      performedBy: user.name
    });

    res.json({
      success: true,
      message: 'تم إضافة سحب المشروع بنجاح',
      data: result
    });

  } catch (error) {
    console.error('Add project withdrawal error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في إضافة سحب المشروع'
    });
  }
};

export const handleUpdateProjectWithdrawal: RequestHandler = async (req, res) => {
  try {
    const user = (req as any).user;

    if (user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية لتعديل سحوبات المشروع'
      });
    }

    const withdrawalId = req.body.id;
    if (!withdrawalId) {
      return res.status(400).json({
        success: false,
        message: 'معرف السحب مطلوب للتعديل'
      });
    }

    const amount = parseFloat(req.body.amount);
    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'المبلغ يجب أن يكون أكبر من صفر'
      });
    }

    const updateData = {
      amount: amount,
      date: req.body.date,
      purpose: req.body.purpose,
      notes: req.body.notes || '',
      approvedBy: user.name
    };

    console.log('📝 Updating project withdrawal:', withdrawalId, updateData);

    const result = await database.updateProjectWithdrawal(withdrawalId, updateData);

    // Log the operation
    await database.addOperationLog({
      id: 'LOG' + Date.now(),
      operationType: 'تعديل سحب المشروع',
      details: `تم تعديل سحب المشروع بالرقم: ${withdrawalId}`,
      date: new Date().toLocaleString('ar-SA'),
      performedBy: user.name
    });

    res.json({
      success: true,
      message: 'تم تحديث سحب المشروع بنجاح',
      data: result
    });

  } catch (error) {
    console.error('Update project withdrawal error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في تحديث سحب المشروع'
    });
  }
};

export const handleDeleteProjectWithdrawal: RequestHandler = async (req, res) => {
  try {
    const user = (req as any).user;

    if (user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية لحذف سحوبات المشروع'
      });
    }

    const withdrawalId = req.body.id;
    if (!withdrawalId) {
      return res.status(400).json({
        success: false,
        message: 'معرف السحب مطلوب للحذف'
      });
    }

    console.log('🗑️ Deleting project withdrawal:', withdrawalId);

    const result = await database.deleteProjectWithdrawal(withdrawalId);

    // Log the operation
    await database.addOperationLog({
      id: 'LOG' + Date.now(),
      operationType: 'حذف سحب المشروع',
      details: `تم حذف سحب المشروع بالرقم: ${withdrawalId}`,
      date: new Date().toLocaleString('ar-SA'),
      performedBy: user.name
    });

    res.json({
      success: true,
      message: 'تم حذف سحب المشروع بنجاح'
    });

  } catch (error) {
    console.error('Delete project withdrawal error:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في حذف سحب المشروع'
    });
  }
};
