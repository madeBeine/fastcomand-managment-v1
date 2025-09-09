import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  ArrowDownToLine,
  Brain,
  UserCog,
  Settings,
  ChevronRight,
  LogOut
} from 'lucide-react';

interface DrawerMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface MenuItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  permission?: keyof import('../../shared/types').UserPermissions;
  description: string;
}

const menuItems: MenuItem[] = [
  {
    name: 'السحوبات',
    href: '/withdrawals',
    icon: ArrowDownToLine,
    permission: 'canViewWithdrawals',
    description: 'إدارة سحوبات المستثمرين'
  },
  {
    name: 'سحوبات المشروع',
    href: '/project-withdrawals',
    icon: Settings,
    permission: 'canViewAllData',
    description: 'إدارة سحوبات نسبة المشروع'
  },
  {
    name: 'التحليلات الذكية',
    href: '/insights',
    icon: Brain,
    permission: 'canViewAIInsights',
    description: 'رؤى وتحليلات ذكية للبيانات'
  },
  {
    name: 'إدارة المستخدمين',
    href: '/users',
    icon: UserCog,
    permission: 'canViewAllData',
    description: 'إدارة حسابات المستخدمين'
  },
  {
    name: 'الملف الشخصي',
    href: '/investor-profile',
    icon: UserCog,
    permission: 'canViewOwnProfile',
    description: 'عرض الملف الشخصي والسحوبات'
  },
  {
    name: 'الإعدادات',
    href: '/settings',
    icon: Settings,
    permission: 'canViewSettings',
    description: 'إعدادات النظام والتطبيق'
  },
];

export default function DrawerMenu({ open, onOpenChange }: DrawerMenuProps) {
  const { permissions, logout } = useAuth();
  const location = useLocation();

  const handleItemClick = () => {
    onOpenChange(false);
  };

  const filteredItems = menuItems.filter(item => {
    if (!item.permission) return true;
    return permissions?.[item.permission];
  });

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="text-right">القائمة الجانبية</DrawerTitle>
          <p className="text-sm text-gray-600 text-right">الوصول السريع للصفحات المهمة</p>
        </DrawerHeader>
        
        <div className="px-4 pb-6 space-y-2">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={handleItemClick}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-lg transition-all duration-200 border",
                  isActive 
                    ? "bg-investment-primary-50 border-investment-primary-200 text-investment-primary-700" 
                    : "bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                )}
              >
                <div className={cn(
                  "p-2 rounded-lg",
                  isActive 
                    ? "bg-investment-primary-100 text-investment-primary-600" 
                    : "bg-gray-100 text-gray-600"
                )}>
                  <Icon className="h-5 w-5" />
                </div>
                
                <div className="flex-1 text-right">
                  <h3 className={cn(
                    "font-medium",
                    isActive ? "text-investment-primary-700" : "text-gray-900"
                  )}>
                    {item.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {item.description}
                  </p>
                </div>
                
                <ChevronRight className={cn(
                  "h-4 w-4 transition-colors",
                  isActive ? "text-investment-primary-500" : "text-gray-400"
                )} />
              </Link>
            );
          })}
        </div>
        
        <div className="px-4 pb-4 border-t pt-4 space-y-2">
          <Button
            variant="outline"
            onClick={() => {
              logout();
              onOpenChange(false);
            }}
            className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
          >
            <LogOut className="ml-2 h-4 w-4" />
            تسجيل الخروج
          </Button>

          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full"
          >
            إغلاق القائمة
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
