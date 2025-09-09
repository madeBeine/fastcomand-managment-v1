import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Investors from "@/pages/Investors";
import Expenses from "@/pages/Expenses";
import Revenues from "@/pages/Revenues";
import Withdrawals from "@/pages/Withdrawals";
import ProjectWithdrawals from "@/pages/ProjectWithdrawals";
import OperationsLog from "@/pages/OperationsLog";
import Insights from "@/pages/Insights";
import Users from "@/pages/Users";
import InvestorProfile from "@/pages/InvestorProfile";
import Settings from "@/pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-investment-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل التطبيق...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <Layout>{children}</Layout>;
};

// Public Route Component (for login page)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-investment-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل التطبيق...</p>
        </div>
      </div>
    );
  }
  
  if (user) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

// Placeholder component for unimplemented pages
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="text-center py-12">
    <h1 className="text-2xl font-bold text-gray-900 mb-4">{title}</h1>
    <p className="text-gray-600 mb-6">هذه الصفحة قيد التطوير</p>
    <p className="text-sm text-gray-500">
      يرجى العودة لاحقاً أو طلب تطوير هذه الصفحة
    </p>
  </div>
);

const AppRoutes = () => (
  <Routes>
    {/* Public Routes */}
    <Route path="/login" element={
      <PublicRoute>
        <Login />
      </PublicRoute>
    } />
    
    {/* Protected Routes */}
    <Route path="/" element={
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    } />
    
    <Route path="/investors" element={
      <ProtectedRoute>
        <Investors />
      </ProtectedRoute>
    } />

    <Route path="/expenses" element={
      <ProtectedRoute>
        <Expenses />
      </ProtectedRoute>
    } />

    <Route path="/revenues" element={
      <ProtectedRoute>
        <Revenues />
      </ProtectedRoute>
    } />

    <Route path="/withdrawals" element={
      <ProtectedRoute>
        <Withdrawals />
      </ProtectedRoute>
    } />

    <Route path="/project-withdrawals" element={
      <ProtectedRoute>
        <ProjectWithdrawals />
      </ProtectedRoute>
    } />

    <Route path="/operations-log" element={
      <ProtectedRoute>
        <OperationsLog />
      </ProtectedRoute>
    } />

    <Route path="/insights" element={
      <ProtectedRoute>
        <Insights />
      </ProtectedRoute>
    } />

    <Route path="/users" element={
      <ProtectedRoute>
        <Users />
      </ProtectedRoute>
    } />

    <Route path="/settings" element={
      <ProtectedRoute>
        <Settings />
      </ProtectedRoute>
    } />

    <Route path="/investor-profile" element={
      <ProtectedRoute>
        <InvestorProfile />
      </ProtectedRoute>
    } />

    {/* Catch-all route */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

import { ensureApiBase } from '@/lib/apiBase';

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

(async () => {
  await ensureApiBase();
  createRoot(document.getElementById('root')!).render(<App />);
})();
