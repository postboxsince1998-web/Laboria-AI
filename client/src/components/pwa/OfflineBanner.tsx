import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';

export const OfflineBanner: React.FC = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="bg-amber-950/90 border-b border-amber-500/40 px-4 py-2 text-amber-200 text-xs flex items-center justify-between shadow-lg z-50">
      <div className="flex items-center gap-2 max-w-7xl mx-auto w-full justify-between">
        <div className="flex items-center gap-2">
          <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="font-medium">
            You are currently offline. Showing cached static career context & local telemetry.
          </span>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="text-amber-300 underline font-semibold flex items-center gap-1 hover:text-white"
        >
          <RefreshCw className="w-3 h-3" /> Retry Connection
        </button>
      </div>
    </div>
  );
};

export default OfflineBanner;
