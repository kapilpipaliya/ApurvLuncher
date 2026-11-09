import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-20 left-4 z-50 flex items-center gap-2 rounded-2xl bg-amber-500/90 text-slate-950 px-3.5 py-2 text-xs font-semibold shadow-xl backdrop-blur-md border border-amber-400 animate-in fade-in slide-in-from-bottom-2 duration-200">
      <WifiOff className="w-4 h-4 shrink-0 text-slate-950" />
      <span>Offline Mode — Cached data and local storage active</span>
    </div>
  );
};
