import { useState, useEffect } from 'react';
import { ApiResponse } from '../../shared/types';

interface UseApiOptions {
  immediate?: boolean;
}

export function useApi<T>(
  endpoint: string,
  options: UseApiOptions = { immediate: true }
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = (typeof window !== 'undefined' && (window as any).__API_BASE__) || import.meta.env.VITE_API_BASE || '/api';

  const doFetch = async (input: RequestInfo, init: RequestInit & { timeoutMs?: number }) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), init.timeoutMs ?? 10000);
    try {
      return await fetch(input, { ...init, signal: controller.signal });
    } finally {
      clearTimeout(id);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('authToken');

      // Skip protected calls if not authenticated (reduces failed fetch on public pages)
      const isAuthEndpoint = endpoint.startsWith('/auth') || endpoint.startsWith('/ping') || endpoint.startsWith('/demo');
      if (!token && !isAuthEndpoint) {
        setError('يرجى تسجيل الدخول للوصول للبيانات');
        setLoading(false);
        return;
      }

      const url = `${API_BASE}${endpoint}`;

      let response: Response | null = null;
      let lastErr: any = null;
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          response = await doFetch(url, {
            method: 'GET',
            headers: {
              'Authorization': token ? `Bearer ${token}` : '',
              'Accept': 'application/json',
            },
            credentials: 'same-origin',
            timeoutMs: 10000,
          });
          break;
        } catch (e) {
          lastErr = e;
          // Retry only on aborted/network errors
          if (!(e instanceof DOMException && e.name === 'AbortError')) {
            // still retry once for transient network errors
          }
        }
      }

      if (!response) throw lastErr || new Error('Network error');

      if (!response.ok) {
        let errorMessage = `خطأ في الخادم: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {}
        setError(errorMessage);
        return;
      }

      const result: ApiResponse<T> = await response.json();

      if (result.success) {
        setData(result.data || null);
      } else {
        setError(result.message || 'حدث خطأ غير متوقع');
      }
    } catch (err) {
      const errorMessage = err instanceof TypeError && err.message.includes('fetch')
        ? 'فشل في الاتصال - تحقق من الاتصال بالإنترنت'
        : 'حدث خطأ في الاتصا�� بالخادم';
      setError(errorMessage);
      console.error('API Error for endpoint', endpoint, ':', err);
    } finally {
      setLoading(false);
    }
  };

  const postData = async (payload: any) => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('authToken');

      const response = await fetch(`/api${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify(payload),
      });

      // Check if response is ok before reading body
      if (!response.ok) {
        let errorMessage = 'حدث خطأ غير متوقع';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = `خطأ في الخادم: ${response.status}`;
        }
        setError(errorMessage);
        return { success: false, message: errorMessage };
      }

      let result: ApiResponse<T>;
      try {
        result = await response.json();
      } catch (jsonError) {
        const errorMessage = 'خطأ في تحليل استجابة الخادم';
        setError(errorMessage);
        return { success: false, message: errorMessage };
      }

      if (result.success) {
        setData(result.data || null);
        return result;
      } else {
        setError(result.message || 'حدث خطأ غير متوقع');
        return result;
      }
    } catch (err) {
      const errorMessage = err instanceof TypeError && err.message.includes('fetch')
        ? 'فشل في الاتصال - تحقق من الاتصال بالإنترنت'
        : 'حدث خطأ في الاتصال بالخادم';
      setError(errorMessage);
      console.error('API Error:', err);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (options.immediate) {
      fetchData();
    }
  }, [endpoint, options.immediate]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    postData,
  };
}

export function useApiMutation<T>(endpoint: string, options?: { onSuccess?: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = (typeof window !== 'undefined' && (window as any).__API_BASE__) || import.meta.env.VITE_API_BASE || '/api';

  const doFetch = async (input: RequestInfo, init: RequestInit & { timeoutMs?: number }) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), init.timeoutMs ?? 10000);
    try {
      return await fetch(input, { ...init, signal: controller.signal });
    } finally {
      clearTimeout(id);
    }
  };

  const mutate = async (payload: any, method: 'POST' | 'PUT' | 'DELETE' = 'POST') => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('authToken');

      const url = `${API_BASE}${endpoint}`;
      let response: Response | null = null;
      let lastErr: any = null;
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          response = await doFetch(url, {
            method,
            headers: {
              'Authorization': token ? `Bearer ${token}` : '',
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            credentials: 'same-origin',
            body: method !== 'GET' ? JSON.stringify(payload) : undefined,
            timeoutMs: 10000,
          });
          break;
        } catch (e) {
          lastErr = e;
        }
      }

      if (!response) throw lastErr || new Error('Network error');

      if (!response.ok) {
        let errorMessage = 'حدث خطأ غير متوقع';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = `خطأ في الخادم: ${response.status}`;
        }
        setError(errorMessage);
        return { success: false, message: errorMessage };
      }

      let result: ApiResponse<T>;

      try {
        result = await response.json();
      } catch (jsonError) {
        const errorMessage = 'خطأ في تحليل استجابة الخادم';
        setError(errorMessage);
        return { success: false, message: errorMessage };
      }

      if (!result.success) {
        setError(result.message || 'حدث خطأ غير متوقع');
      } else {
        if (options?.onSuccess) {
          options.onSuccess();
        }
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof TypeError && err.message.includes('fetch')
        ? 'فشل في الاتصال - تحقق من الاتصال بالإنترنت'
        : 'حدث خطأ في الاتصال بالخادم';
      setError(errorMessage);
      console.error('API Error:', err);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    mutate,
    loading,
    error,
  };
}

// Specialized hooks for common operations
export function useDashboard() {
  return useApi('/dashboard');
}

export function useInvestors() {
  return useApi('/investors');
}

export function useExpenses() {
  return useApi('/expenses');
}

export function useRevenues() {
  return useApi('/revenues');
}

export function useWithdrawals() {
  return useApi('/withdrawals');
}
