import React, { useState } from 'react';
import { Shortcut } from '../types';
import { IconRenderer } from './IconRenderer';
import { Search, X, Pin, Play, HardDrive, Plus } from 'lucide-react';

interface AppDrawerModalProps {
  isOpen: boolean;
  shortcuts: Shortcut[];
  dockItemIds: string[];
  onClose: () => void;
  onLaunch: (shortcut: Shortcut) => void;
  onToggleDockPin: (shortcut: Shortcut) => void;
  onOpenAddModal: () => void;
}

export const AppDrawerModal: React.FC<AppDrawerModalProps> = ({
  isOpen,
  shortcuts,
  dockItemIds,
  onClose,
  onLaunch,
  onToggleDockPin,
  onOpenAddModal,
}) => {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filtered = shortcuts.filter(
    (s) =>
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden text-slate-100">
        {/* Header & Search */}
        <div className="p-6 border-b border-slate-800 bg-slate-950/60 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search apps, files, widgets..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-2xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => {
                onClose();
                onOpenAddModal();
              }}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Create Item</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Shortcuts Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-slate-500 text-xs">
              No matching shortcuts found for &quot;{search}&quot;.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3.5">
              {filtered.map((item) => {
                const isPinned = dockItemIds.includes(item.id);
                return (
                  <div
                    key={item.id}
                    className="group relative p-3.5 rounded-2xl bg-slate-800/40 hover:bg-slate-800 border border-slate-700/50 flex flex-col items-center text-center transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    {/* Launch trigger */}
                    <div
                      onClick={() => {
                        onClose();
                        onLaunch(item);
                      }}
                      className="cursor-pointer w-full flex flex-col items-center"
                    >
                      <div
                        className="w-13 h-13 rounded-2xl flex items-center justify-center mb-2.5 shadow-md"
                        style={{
                          backgroundColor: item.color || '#3b82f6',
                          boxShadow: `0 6px 16px -2px ${(item.color || '#3b82f6')}55`,
                        }}
                      >
                        <IconRenderer name={item.icon} className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-xs font-semibold text-slate-100 truncate w-full group-hover:text-white">
                        {item.title}
                      </div>
                      <div className="text-[10px] text-slate-400 capitalize mt-0.5">
                        {item.type}
                      </div>
                    </div>

                    {/* Quick Pin / Unpin button */}
                    <button
                      onClick={() => onToggleDockPin(item)}
                      title={isPinned ? 'Unpin from dock' : 'Pin to dock'}
                      className={`absolute top-2 right-2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity ${
                        isPinned
                          ? 'bg-indigo-600/30 text-indigo-300'
                          : 'bg-slate-700/80 text-slate-300 hover:text-white'
                      }`}
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/60 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Click any shortcut to launch or pin to the dock.</span>
          <span>{filtered.length} total items</span>
        </div>
      </div>
    </div>
  );
};
