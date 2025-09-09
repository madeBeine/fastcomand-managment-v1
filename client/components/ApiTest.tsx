import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function ApiTest() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testApi = async () => {
    setLoading(true);
    setResult('');
    
    try {
      // Use native fetch to avoid any conflicts
      const nativeFetch = window.fetch.bind(window);
      
      const response = await nativeFetch('/api/debug', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'same-origin'
      });

      if (response.ok) {
        const data = await response.json();
        setResult(`✅ Success: ${JSON.stringify(data, null, 2)}`);
      } else {
        setResult(`❌ HTTP Error: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      setResult(`❌ Network Error: ${error.message}`);
      console.error('API Test Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-white">
      <h3 className="font-semibold mb-3">اختبار API</h3>
      <Button onClick={testApi} disabled={loading} className="mb-3">
        {loading ? 'جاري الاختبار...' : 'اختبار الاتصال'}
      </Button>
      
      {result && (
        <Alert>
          <AlertDescription>
            <pre className="text-xs overflow-auto max-h-40">
              {result}
            </pre>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
