import React, { useEffect, useMemo, useRef, useState } from 'react';

interface LoadingScreenProps {
  loading: boolean;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ loading }) => {
  const [visible, setVisible] = useState<boolean>(loading);
  const [progress, setProgress] = useState<number>(0);
  const intervalRef = useRef<number | null>(null);

  const start = () => {
    if (intervalRef.current) return;
    intervalRef.current = window.setInterval(() => {
      setProgress((p) => {
        if (p >= 95) return p; // hold until real load completes
        const inc = p < 50 ? 2 : p < 80 ? 1.5 : 1;
        return Math.min(95, p + inc);
      });
    }, 60);
  };

  const stop = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    if (loading) {
      setVisible(true);
      setProgress(0);
      start();
    } else {
      stop();
      setProgress(100);
      const t = setTimeout(() => setVisible(false), 400);
      return () => clearTimeout(t);
    }
  }, [loading]);

  useEffect(() => () => stop(), []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 dark:bg-background/90 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <div className="animate-pulse">
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2Fa5ec0e689b304bfa8842a000e7d9fdc0%2Fbd9157aae96346eaa06aeb734ef2f123?format=webp&width=800"
              alt="App Logo"
              className="h-24 w-auto"
            />
          </div>
          <div className="pointer-events-none absolute -inset-3 rounded-full border-4 border-investment-primary-300/30 animate-[spin_6s_linear_infinite]" />
        </div>

        <div className="w-64 sm:w-80">
          <div className="h-3 w-full rounded-full bg-gray-200 overflow-hidden">
            <div
              className="h-full bg-gradient-to-l from-investment-secondary-500 via-investment-primary-500 to-investment-primary-700 transition-[width] duration-200 ease-out"
              style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
            />
          </div>
          <div className="mt-2 text-center font-semibold text-gray-700 dark:text-gray-200 number">
            {Math.round(progress)}%
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
