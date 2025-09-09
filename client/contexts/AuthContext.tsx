import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserPermissions, LoginCredentials, AuthResponse } from '../../shared/types';

interface AuthContextType {
  user: User | null;
  permissions: UserPermissions | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const API_BASE = (typeof window !== 'undefined' && (window as any).__API_BASE__) || import.meta.env.VITE_API_BASE || '/api';

  const fetchWithTimeout = async (input: RequestInfo, init: RequestInit & { timeoutMs?: number } = {}) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), init.timeoutMs ?? 10000);
    try {
      return await window.fetch(input, { ...init, signal: controller.signal });
    } finally {
      clearTimeout(id);
    }
  };

  // Check if user is already logged in on app start
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      verifyToken(token);
    } else {
      setIsLoading(false);
    }
  }, []);

  const verifyToken = async (token: string) => {
    try {
      const response = await fetchWithTimeout(`${API_BASE}/auth/verify`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'same-origin',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUser(data.user);
          setPermissions(data.permissions);
        } else {
          localStorage.removeItem('authToken');
        }
      } else {
        localStorage.removeItem('authToken');
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      localStorage.removeItem('authToken');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      if (isLoggingIn) {
        console.log('🔄 Login already in progress, skipping...');
        return { success: false, message: 'عملية تسجيل الدخول قيد التنفيذ...' };
      }

      setIsLoggingIn(true);
      console.log('🔐 Starting login process...');

      const response = await fetchWithTimeout(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify(credentials),
        timeoutMs: 10000,
      });

      // Parse response body ONCE safely regardless of status
      let parsed: any = null;
      try {
        parsed = await response.json();
      } catch {
        parsed = null;
      }

      if (!response.ok || !parsed) {
        return {
          success: false,
          message: (parsed && parsed.message) || 'حدث خطأ أثناء ت��جيل الدخول',
        } as AuthResponse;
      }

      const data: AuthResponse = parsed;

      if (data.success && data.user && data.token) {
        setUser(data.user);
        localStorage.setItem('authToken', data.token);

        const permissionsResponse = await fetchWithTimeout(`${API_BASE}/auth/verify`, {
          headers: { 'Authorization': `Bearer ${data.token}` },
          credentials: 'same-origin',
        });

        if (permissionsResponse.ok) {
          try {
            const permissionsData = await permissionsResponse.json();
            setPermissions(permissionsData.permissions);
          } catch (e) {
            console.error('Failed parsing permissions response', e);
          }
        }
      }

      return data;
    } catch (error) {
      console.error('Login failed:', error);
      if (error instanceof TypeError && error.message.includes('body stream')) {
        console.error('Body stream error - possible duplicate request');
        return { success: false, message: 'حدث خطأ في معالجة الطلب. يرجى إعادة المحاولة.' };
      }
      return { success: false, message: 'حدث خطأ في الاتصال بالخادم' };
    } finally {
      setIsLoggingIn(false);
      console.log('🔐 Login process completed');
    }
  };

  const logout = async () => {
    if (user) {
      try {
        const token = localStorage.getItem('authToken');
        if (token) {
          await fetchWithTimeout(`${API_BASE}/auth/logout`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            credentials: 'same-origin',
            body: JSON.stringify({
              userName: user.name,
              userRole: user.role
            })
          });
        }
      } catch (error) {
        console.error('Error logging logout:', error);
      }
    }

    setUser(null);
    setPermissions(null);
    localStorage.removeItem('authToken');
  };

  const value: AuthContextType = {
    user,
    permissions,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
