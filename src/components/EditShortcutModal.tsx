import React, { useState } from 'react';
import { Screen, Shortcut } from '../types';
import { IconRenderer } from './IconRenderer';
import { X, Check, Lock, Unlock } from 'lucide-react';

interface EditShortcutModalProps {
  isOpen: boolean;
  shortcut: Shortcut | null;
  screens: Screen[];
  onClose: () => void;
  onSave: (updated: Shortcut) => void;
}

const ACCENT_COLORS = [
  '#3b82f6',
  '#6366f1',
  '#8b5cf6',
  '#ec4899',
  '#10b981',
  '#06b6d4',
  '#f59e0b',
  '#ef4444',
  '#64748b',
];

const AVAILABLE_ICONS = [
  'Globe',
  'Terminal',
  'FolderKanban',
  'FileCode',
  'FileText',
  'FileJson',
  'Image',
  'Calculator',
  'Settings',
  'CheckSquare',
  'Clock',
  'Activity',
  'HardDrive',
  'ExternalLink',
  'Code2',
  'Folder',
  'Sparkles',
];

export const EditShortcutModal: React.FC<EditShortcutModalProps> = ({
  isOpen,
  shortcut,
  screens,
  onClose,
  onSave,
}) => {
  if (!isOpen || !shortcut) return null;

  const [title, setTitle] = useState(shortcut.title);
  const [w, setW] = useState(shortcut.w);
  const [h, setH] = useState(shortcut.h);
  const [x, setX] = useState(shortcut.x);
  const [y, setY] = useState(shortcut.y);
  const [color, setColor] = useState(shortcut.color || '#3b82f6');
  const [icon, setIcon] = useState(shortcut.icon || 'File');
  const [screenId, setScreenId] = useState(shortcut.screenId);
  const [isLocked, setIsLocked] = useState(Boolean(shortcut.isLocked));

  const handleSave = () => {
    onSave({
      ...shortcut,
      title: title.trim() || shortcut.title,
      w: Math.max(80, Math.round(w)),
      h: Math.max(80, Math.round(h)),
      x: Math.max(0, Math.round(x)),
      y: Math.max(0, Math.round(y)),
      color,
      icon,
      screenId,
      isLocked,
    });
    onClose();
  };

  const applyPreset = (width: number, height: number) => {
    setW(width);
    setH(height);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-slate-100">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div>
            <h2 className="text-base font-bold text-white">Edit Shortcut &amp; Geometry</h2>
            <div className="text-xs text-slate-400 font-mono">ID: {shortcut.id}</div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1 font-medium">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Quick Dimension Presets */}
          <div>
            <label className="block text-slate-400 mb-1.5 font-medium">Dimension Presets</label>
            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => applyPreset(96, 104)}
                className="p-2 rounded-xl border border-slate-800 bg-slate-800/40 hover:bg-slate-800 text-slate-300 text-center"
              >
                1x1 (Icon)
              </button>
              <button
                type="button"
                onClick={() => applyPreset(200, 104)}
                className="p-2 rounded-xl border border-slate-800 bg-slate-800/40 hover:bg-slate-800 text-slate-300 text-center"
              >
                2x1 (Banner)
              </button>
              <button
                type="button"
                onClick={() => applyPreset(240, 220)}
                className="p-2 rounded-xl border border-slate-800 bg-slate-800/40 hover:bg-slate-800 text-slate-300 text-center"
              >
                2x2 (Card)
              </button>
              <button
                type="button"
                onClick={() => applyPreset(320, 240)}
                className="p-2 rounded-xl border border-slate-800 bg-slate-800/40 hover:bg-slate-800 text-slate-300 text-center"
              >
                3x2 (Widget)
              </button>
            </div>
          </div>

          {/* Width / Height / X / Y */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-slate-400 mb-1 font-medium font-mono">Width (px)</label>
              <input
                type="number"
                value={w}
                onChange={(e) => setW(parseInt(e.target.value, 10) || 80)}
                className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 font-mono text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-medium font-mono">Height (px)</label>
              <input
                type="number"
                value={h}
                onChange={(e) => setH(parseInt(e.target.value, 10) || 80)}
                className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 font-mono text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-medium font-mono">X Coord</label>
              <input
                type="number"
                value={x}
                onChange={(e) => setX(parseInt(e.target.value, 10) || 0)}
                className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 font-mono text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-medium font-mono">Y Coord</label>
              <input
                type="number"
                value={y}
                onChange={(e) => setY(parseInt(e.target.value, 10) || 0)}
                className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 font-mono text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Screen assignment */}
          <div>
            <label className="block text-slate-400 mb-1.5 font-medium">Desktop Screen Assignment</label>
            <div className="grid grid-cols-3 gap-2">
              {screens.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setScreenId(s.id)}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    screenId === s.id
                      ? 'border-indigo-500 bg-indigo-950/60 text-white font-medium'
                      : 'border-slate-800 bg-slate-800/40 text-slate-400'
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          {/* Lock toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/40 border border-slate-800">
            <div className="flex items-center gap-2.5">
              {isLocked ? (
                <Lock className="w-4 h-4 text-amber-400" />
              ) : (
                <Unlock className="w-4 h-4 text-emerald-400" />
              )}
              <div>
                <div className="font-semibold text-slate-200">Lock Position &amp; Size</div>
                <div className="text-[11px] text-slate-400">
                  Prevents accidental drag or resize with interact.js
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsLocked(!isLocked)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                isLocked
                  ? 'bg-amber-950/60 border-amber-600/40 text-amber-300'
                  : 'bg-slate-800 border-slate-700 text-slate-300'
              }`}
            >
              {isLocked ? 'Locked' : 'Unlocked'}
            </button>
          </div>

          {/* Color & Icon */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 mb-1.5 font-medium">Accent Color</label>
              <div className="flex flex-wrap gap-1.5">
                {ACCENT_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-6 h-6 rounded-lg transition-transform ${
                      color === c ? 'scale-110 ring-2 ring-white ring-offset-1 ring-offset-slate-900' : ''
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1.5 font-medium">Icon Emblem</label>
              <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                {AVAILABLE_ICONS.slice(0, 10).map((ic) => (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => setIcon(ic)}
                    className={`p-1.5 rounded-lg border transition-colors ${
                      icon === ic
                        ? 'border-indigo-500 bg-indigo-600 text-white'
                        : 'border-slate-700 bg-slate-800 text-slate-300'
                    }`}
                  >
                    <IconRenderer name={ic} className="w-3.5 h-3.5" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-colors shadow-sm shadow-indigo-600/40"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
