import React, { ReactNode, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Logo } from '@/components/Logo';
import {
  Users,
  TrendingDown,
  TrendingUp,
  ArrowDownToLine,
  Settings,
  LogOut,
  BarChart3,
  Brain,
  ClipboardList,
  UserCog,
  Menu
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import DrawerMenu from '@/components/DrawerMenu';

interface LayoutProps {
  children: ReactNode;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  permission?: keyof import('../../shared/types').UserPermissions;
  shortName?: string;
}

// Main navigation items
const mainNavItems: NavItem[] = [
  { name: 'لوحة التحكم', href: '/', icon: BarChart3, shortName: 'الرئيسية' },
  { name: 'المستثمرون', href: '/investors', icon: Users, permission: 'canViewInvestors', shortName: 'مستثمرون' },
  { name: 'المصاريف', href: '/expenses', icon: TrendingDown, permission: 'canViewExpenses', shortName: 'مصاريف' },
  { name: 'الإيرادات', href: '/revenues', icon: TrendingUp, permission: 'canViewRevenues', shortName: 'إيرادات' },
];

// Drawer-only navigation items (not shown in sidebar)
const drawerOnlyNavItems: NavItem[] = [
  { name: 'السحوبات', href: '/withdrawals', icon: ArrowDownToLine, permission: 'canViewWithdrawals', shortName: 'سحوبات' },
  { name: 'التحليلات الذكية', href: '/insights', icon: Brain, permission: 'canViewAIInsights', shortName: 'تحليلات' },
  { name: 'إدارة المستخدمين', href: '/users', icon: UserCog, permission: 'canViewAllData', shortName: 'مستخدمون' },
  { name: 'الإعدادات', href: '/settings', icon: Settings, permission: 'canViewSettings', shortName: 'إعدادات' },
];

// Secondary navigation items (sidebar only)
const secondaryNavItems: NavItem[] = [
  { name: 'سجل العمليات', href: '/operations-log', icon: ClipboardList, permission: 'canViewAllData', shortName: 'السجل' },
];

// Combined for mobile navigation
const allNavItems = [...mainNavItems, ...secondaryNavItems];

export default function Layout({ children }: LayoutProps) {
  const { user, permissions, logout } = useAuth();
  const location = useLocation();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  if (!user || !permissions) {
    return null;
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Admin':
        return 'bg-investment-primary-600 text-white';
      case 'Assistant':
        return 'bg-investment-warning-500 text-white';
      case 'Investor':
        return 'bg-investment-success-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'Admin':
        return 'مدير';
      case 'Assistant':
        return 'مساعد';
      case 'Investor':
        return 'مستثمر';
      default:
        return role;
    }
  };

  const filteredMainNavItems = mainNavItems.filter(item => {
    if (!item.permission) return true;
    return permissions[item.permission];
  });

  const filteredSecondaryNavItems = secondaryNavItems.filter(item => {
    if (!item.permission) return true;
    return permissions[item.permission];
  });

  const filteredAllNavItems = allNavItems.filter(item => {
    if (!item.permission) return true;
    return permissions[item.permission];
  });

  return (
    <div className="min-h-screen bg-gray-50 rtl">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="hidden sm:flex">
                <Logo size="md" className="flex items-center" />
              </div>
              <div className="sm:hidden">
                <Logo size="sm" className="flex items-center" showText={false} />
              </div>
            </div>

            {/* Right side - User Menu and Drawer Menu Button */}
            <div className="flex items-center gap-3">
              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2 space-x-reverse">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-investment-primary-100 text-investment-primary-700">
                        {user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-right">
                      <p className="text-sm font-medium">{user.name}</p>
                      <Badge variant="secondary" className={cn('text-xs', getRoleColor(user.role))}>
                        {getRoleLabel(user.role)}
                      </Badge>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem>
                  <span className="text-sm text-gray-600">
                    {user.phone && `📱 ${user.phone}`}
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
              </DropdownMenu>

              {/* Drawer Menu Button - Far Right */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDrawerOpen(true)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <Menu className="h-5 w-5" />
                <span className="hidden sm:inline">القائمة</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col md:flex-row">
        {/* Sidebar */}
        <nav className="hidden md:block w-64 bg-white shadow-sm h-[calc(100vh-4rem)] border-l border-gray-200">
          <div className="p-4 space-y-6">
            {/* Main Navigation */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 px-3">
                القائمة الرئيسية
              </h3>
              <ul className="space-y-1">
                {filteredMainNavItems.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        to={item.href}
                        className={cn(
                          'flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-investment-primary-100 text-investment-primary-700 border-r-2 border-investment-primary-600'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        )}
                      >
                        <item.icon className="ml-3 h-5 w-5" />
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Secondary Navigation */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 px-3">
                إدارة متقدمة
              </h3>
              <ul className="space-y-1">
                {filteredSecondaryNavItems.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        to={item.href}
                        className={cn(
                          'flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-investment-primary-100 text-investment-primary-700 border-r-2 border-investment-primary-600'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        )}
                      >
                        <item.icon className="ml-3 h-5 w-5" />
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Logout Button */}
            <div className="pt-4 border-t border-gray-200">
              <Button
                onClick={logout}
                variant="outline"
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="ml-3 h-5 w-5" />
                تسجيل الخروج
              </Button>
            </div>
          </div>
        </nav>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
          <div className="flex overflow-x-auto pb-safe mobile-nav-scroll">
            <div className="flex min-w-full">
              {filteredAllNavItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      'flex flex-col items-center py-3 px-3 text-xs font-medium transition-colors min-w-0 flex-1',
                      isActive
                        ? 'text-investment-primary-700 bg-investment-primary-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    )}
                  >
                    <item.icon className={cn(
                      'h-5 w-5 mb-1 flex-shrink-0',
                      isActive ? 'text-investment-primary-700' : 'text-gray-400'
                    )} />
                    <span className="truncate text-center leading-tight">{item.shortName || item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 overflow-auto pb-20 md:pb-0">
          <div className="p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>

      {/* Drawer Menu */}
      <DrawerMenu open={isDrawerOpen} onOpenChange={setIsDrawerOpen} />
    </div>
  );
}
