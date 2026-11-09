import React from 'react';
import { Screen, DbIntegrityInfo } from '../types';
import {
  Plus,
  Settings,
  HardDrive,
  Database,
  Grid,
  ShieldCheck,
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface TopStatusBarProps {
  screens: Screen[];
  activeScreenId: string;
  gridSnap: boolean;
  integrity: DbIntegrityInfo | null;
  onSelectScreen: (screenId: string) => void;
  onOpenAddModal: () => void;
  onOpenSettings: () => void;
  onOpenFileManager: () => void;
  onToggleGridSnap: () => void;
}

export const TopStatusBar: React.FC<TopStatusBarProps> = ({
  screens,
  activeScreenId,
  gridSnap,
  integrity,
  onSelectScreen,
  onOpenAddModal,
  onOpenSettings,
  onOpenFileManager,
  onToggleGridSnap,
}) => {
  return (
    <header className="h-14 px-4 sm:px-6 flex items-center justify-between gap-4 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-xl z-30 shrink-0 select-none">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <a
          href="/"
          onClick={(e) => e.preventDefault()}
          className="text-base sm:text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0 flex items-center gap-2"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-sm shadow-indigo-500/50" />
          <span>NovaLauncher</span>
        </a>
        <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-slate-400 font-mono border-l border-slate-800 pl-3">
          <span>interact.js</span>
          <span aria-hidden="true">·</span>
          <span>JSON DB</span>
        </div>
      </div>

      {/* Zone 2: 3-5 clean single-line navigation links / screens */}
      <nav className="flex items-center gap-1 p-1 bg-slate-900/80 border border-slate-800/80 rounded-xl overflow-x-auto max-w-full">
        {screens.map((screen) => {
          const isActive = screen.id === activeScreenId;
          return (
            <button
              key={screen.id}
              onClick={() => onSelectScreen(screen.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {screen.name}
            </button>
          );
        })}
      </nav>

      {/* Zone 3: 1 primary action + utility buttons */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Toggle Grid Snapping */}
        <button
          onClick={onToggleGridSnap}
          title={gridSnap ? 'Grid snap enabled' : 'Freeform movement'}
          className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-lg border transition-colors ${
            gridSnap
              ? 'bg-slate-900/90 border-indigo-500/40 text-indigo-300'
              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Grid className="w-3.5 h-3.5" />
          <span className="font-mono text-[11px]">{gridSnap ? 'Snap On' : 'Freeform'}</span>
        </button>

        {/* File Vault shortcut */}
        <button
          onClick={onOpenFileManager}
          title="Internal Storage Folder Vault"
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
        >
          <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Files</span>
          {integrity && (
            <span className="text-[10px] text-cyan-400 font-mono">({integrity.storageFileCount})</span>
          )}
        </button>

        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          title="Launcher Settings & Database"
          className="p-2 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* PWA Cross-Platform Install Button */}
        <PWAInstallButton />

        {/* Primary Action Button */}
        <button
          onClick={onOpenAddModal}
          className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm shadow-indigo-600/30 transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Shortcut</span>
        </button>
      </div>
    </header>
  );
};
