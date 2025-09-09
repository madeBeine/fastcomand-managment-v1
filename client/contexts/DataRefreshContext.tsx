import React, { createContext, useContext, useState, useCallback } from 'react';

interface DataRefreshContextType {
  refreshTrigger: number;
  triggerRefresh: () => void;
  refreshSpecific: (dataType: string) => void;
  lastUpdated: Record<string, number>;
}

const DataRefreshContext = createContext<DataRefreshContextType | undefined>(undefined);

export function DataRefreshProvider({ children }: { children: React.ReactNode }) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<Record<string, number>>({});

  const triggerRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
    setLastUpdated(prev => ({
      ...prev,
      all: Date.now()
    }));
  }, []);

  const refreshSpecific = useCallback((dataType: string) => {
    setRefreshTrigger(prev => prev + 1);
    setLastUpdated(prev => ({
      ...prev,
      [dataType]: Date.now()
    }));
  }, []);

  return (
    <DataRefreshContext.Provider value={{
      refreshTrigger,
      triggerRefresh,
      refreshSpecific,
      lastUpdated
    }}>
      {children}
    </DataRefreshContext.Provider>
  );
}

export function useDataRefresh() {
  const context = useContext(DataRefreshContext);
  if (context === undefined) {
    throw new Error('useDataRefresh must be used within a DataRefreshProvider');
  }
  return context;
}
