import React, { useEffect, useRef } from 'react';
import { Shortcut, Screen } from '../types';
import {
  Play,
  Edit3,
  Trash2,
  Lock,
  Unlock,
  Move,
  Pin,
  ExternalLink,
  Plus,
  Upload,
  FileText,
  Clock,
  Activity,
  HardDrive,
  Grid,
  Settings,
  Sparkles,
} from 'lucide-react';

export interface ContextMenuState {
  isOpen: boolean;
  x: number;
  y: number;
  type: 'desktop' | 'shortcut';
  targetShortcut?: Shortcut;
}

interface ContextMenuProps {
  state: ContextMenuState;
  screens: Screen[];
  activeScreenId: string;
  isDockPinned: boolean;
  onClose: () => void;
  onLaunchShortcut: (shortcut: Shortcut) => void;
  onEditShortcut: (shortcut: Shortcut) => void;
  onDeleteShortcut: (shortcut: Shortcut) => void;
  onToggleLock: (shortcut: Shortcut) => void;
  onToggleDockPin: (shortcut: Shortcut) => void;
  onMoveToScreen: (shortcut: Shortcut, screenId: string) => void;
  onOpenAddModal: (tab?: string) => void;
  onOpenSettings: () => void;
  onOpenFileManager: () => void;
  onSnapAllToGrid: () => void;
  onTriggerFileInput: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  state,
  screens,
  isDockPinned,
  onClose,
  onLaunchShortcut,
  onEditShortcut,
  onDeleteShortcut,
  onToggleLock,
  onToggleDockPin,
  onMoveToScreen,
  onOpenAddModal,
  onOpenSettings,
  onOpenFileManager,
  onSnapAllToGrid,
  onTriggerFileInput,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (state.isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [state.isOpen, onClose]);

  if (!state.isOpen) return null;

  // Keep menu within screen boundaries
  const menuWidth = 240;
  const menuHeight = state.type === 'shortcut' ? 320 : 280;
  const clampedX = Math.min(state.x, window.innerWidth - menuWidth - 10);
  const clampedY = Math.min(state.y, window.innerHeight - menuHeight - 10);

  return (
    <div
      ref={menuRef}
      style={{ top: `${clampedY}px`, left: `${clampedX}px` }}
      className="fixed z-50 w-60 bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl p-1.5 text-xs text-slate-200 select-none animate-in fade-in zoom-in-95 duration-100"
    >
      {state.type === 'shortcut' && state.targetShortcut ? (
        <div className="space-y-0.5">
          <div className="px-3 py-2 border-b border-slate-800/80 mb-1">
            <div className="font-semibold text-slate-100 truncate">{state.targetShortcut.title}</div>
            <div className="text-[10px] text-slate-400 capitalize">
              {state.targetShortcut.type} shortcut · {state.targetShortcut.w}×{state.targetShortcut.h}px
            </div>
          </div>

          <button
            onClick={() => {
              onLaunchShortcut(state.targetShortcut!);
              onClose();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-indigo-600/20 hover:text-indigo-300 transition-colors"
          >
            <Play className="w-4 h-4 text-indigo-400" />
            <span>Open / Launch</span>
          </button>

          <button
            onClick={() => {
              onEditShortcut(state.targetShortcut!);
              onClose();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-slate-800 transition-colors"
          >
            <Edit3 className="w-4 h-4 text-slate-400" />
            <span>Edit Shortcut & Dimensions</span>
          </button>

          <button
            onClick={() => {
              onToggleDockPin(state.targetShortcut!);
              onClose();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-slate-800 transition-colors"
          >
            <Pin className="w-4 h-4 text-slate-400" />
            <span>{isDockPinned ? 'Unpin from Dock' : 'Pin to Bottom Dock'}</span>
          </button>

          <button
            onClick={() => {
              onToggleLock(state.targetShortcut!);
              onClose();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-slate-800 transition-colors"
          >
            {state.targetShortcut.isLocked ? (
              <>
                <Unlock className="w-4 h-4 text-emerald-400" />
                <span>Unlock Position (Draggable)</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 text-amber-400" />
                <span>Lock Position on Grid</span>
              </>
            )}
          </button>

          {/* Move to other screens */}
          {screens.length > 1 && (
            <div className="py-1 border-t border-slate-800/80 my-1">
              <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Move to Screen
              </div>
              {screens.map((screen) => (
                <button
                  key={screen.id}
                  disabled={screen.id === state.targetShortcut?.screenId}
                  onClick={() => {
                    onMoveToScreen(state.targetShortcut!, screen.id);
                    onClose();
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-left transition-colors ${
                    screen.id === state.targetShortcut?.screenId
                      ? 'text-slate-500 cursor-default'
                      : 'hover:bg-slate-800 hover:text-slate-100'
                  }`}
                >
                  <Move className="w-3.5 h-3.5" />
                  <span className="truncate">{screen.name}</span>
                </button>
              ))}
            </div>
          )}

          <div className="pt-1 border-t border-slate-800/80 mt-1">
            <button
              onClick={() => {
                onDeleteShortcut(state.targetShortcut!);
                onClose();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors"
            >
              <Trash2 className="w-4 h-4 text-rose-400" />
              <span>Delete Shortcut</span>
            </button>
          </div>
        </div>
      ) : (
        // Desktop Canvas Context Menu
        <div className="space-y-0.5">
          <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800/80 mb-1">
            Desktop Actions
          </div>

          <button
            onClick={() => {
              onOpenAddModal('app');
              onClose();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-slate-800 transition-colors"
          >
            <Plus className="w-4 h-4 text-indigo-400" />
            <span>Add Shortcut or App</span>
          </button>

          <button
            onClick={() => {
              onTriggerFileInput();
              onClose();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-slate-800 transition-colors"
          >
            <Upload className="w-4 h-4 text-cyan-400" />
            <span>Upload &amp; Copy Files to Folder</span>
          </button>

          <button
            onClick={() => {
              onOpenAddModal('note');
              onClose();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-slate-800 transition-colors"
          >
            <FileText className="w-4 h-4 text-amber-400" />
            <span>New Quick Scratchpad</span>
          </button>

          <button
            onClick={() => {
              onOpenAddModal('widget');
              onClose();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-slate-800 transition-colors"
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Add Interactive Widget</span>
          </button>

          <div className="py-1 border-t border-slate-800/80 my-1">
            <button
              onClick={() => {
                onSnapAllToGrid();
                onClose();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-slate-800 transition-colors"
            >
              <Grid className="w-4 h-4 text-slate-400" />
              <span>Align All to Grid</span>
            </button>

            <button
              onClick={() => {
                onOpenFileManager();
                onClose();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-slate-800 transition-colors"
            >
              <HardDrive className="w-4 h-4 text-cyan-400" />
              <span>Internal Storage Folder Vault</span>
            </button>

            <button
              onClick={() => {
                onOpenSettings();
                onClose();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-slate-800 transition-colors"
            >
              <Settings className="w-4 h-4 text-slate-400" />
              <span>Launcher Settings &amp; JSON DB</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
