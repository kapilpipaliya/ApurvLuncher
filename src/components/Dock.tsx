import React from 'react';
import { Shortcut } from '../types';
import { IconRenderer } from './IconRenderer';
import { Grid, Upload, Plus, HardDrive, Terminal } from 'lucide-react';

interface DockProps {
  dockShortcuts: Shortcut[];
  onLaunchShortcut: (shortcut: Shortcut) => void;
  onOpenAppDrawer: () => void;
  onTriggerUpload: () => void;
  onOpenTerminal: () => void;
  onOpenFiles: () => void;
}

export const Dock: React.FC<DockProps> = ({
  dockShortcuts,
  onLaunchShortcut,
  onOpenAppDrawer,
  onTriggerUpload,
  onOpenTerminal,
  onOpenFiles,
}) => {
  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-30 select-none max-w-[94vw]">
      <div className="px-3 py-2 bg-slate-900/80 backdrop-blur-2xl border border-slate-700/60 rounded-3xl shadow-2xl flex items-center gap-1.5 sm:gap-2.5">
        {/* App Drawer trigger */}
        <button
          onClick={onOpenAppDrawer}
          title="All Applications & Shortcuts"
          className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-indigo-950/70 hover:bg-indigo-900/80 border border-indigo-700/50 flex items-center justify-center text-indigo-300 hover:text-white transition-all transform hover:-translate-y-1 active:scale-95 shadow"
        >
          <Grid className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        <div className="w-[1px] h-7 bg-slate-800 mx-0.5" />

        {/* Pinned dock items */}
        {dockShortcuts.map((item) => (
          <button
            key={item.id}
            onClick={() => onLaunchShortcut(item)}
            title={item.title}
            className="group relative w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center transition-all transform hover:-translate-y-1 active:scale-95 shadow"
            style={{
              backgroundColor: item.color || '#3b82f6',
              boxShadow: `0 4px 14px -2px ${(item.color || '#3b82f6')}66`,
            }}
          >
            <IconRenderer name={item.icon} className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            
            {/* Tooltip on hover */}
            <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-slate-900/90 text-[10px] font-medium text-slate-100 rounded-md whitespace-nowrap pointer-events-none shadow border border-slate-700">
              {item.title}
            </span>

            {/* Little dot below icon indicator */}
            <span className="absolute -bottom-1 w-1 h-1 rounded-full bg-white/60" />
          </button>
        ))}

        <div className="w-[1px] h-7 bg-slate-800 mx-0.5" />

        {/* Quick Tools */}
        <button
          onClick={onTriggerUpload}
          title="Upload & Copy file into Launcher Folder"
          className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 flex items-center justify-center text-cyan-400 hover:text-cyan-300 transition-all transform hover:-translate-y-1 active:scale-95 shadow"
        >
          <Upload className="w-5 h-5 sm:w-5 sm:h-5" />
        </button>

        <button
          onClick={onOpenTerminal}
          title="Open Cloud Terminal"
          className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 flex items-center justify-center text-emerald-400 hover:text-emerald-300 transition-all transform hover:-translate-y-1 active:scale-95 shadow"
        >
          <Terminal className="w-5 h-5 sm:w-5 sm:h-5" />
        </button>

        <button
          onClick={onOpenFiles}
          title="Browse Storage Vault"
          className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 flex items-center justify-center text-purple-400 hover:text-purple-300 transition-all transform hover:-translate-y-1 active:scale-95 shadow"
        >
          <HardDrive className="w-5 h-5 sm:w-5 sm:h-5" />
        </button>
      </div>
    </div>
  );
};
