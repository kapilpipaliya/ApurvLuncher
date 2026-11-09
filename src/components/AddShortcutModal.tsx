import React, { useState } from 'react';
import { Screen, Shortcut, ShortcutType, WidgetType } from '../types';
import { api } from '../services/api';
import { IconRenderer } from './IconRenderer';
import {
  X,
  Plus,
  Upload,
  Globe,
  FileText,
  Sparkles,
  Check,
  Terminal,
  Calculator,
  FolderKanban,
  ExternalLink,
  Clock,
  Activity,
  HardDrive,
} from 'lucide-react';

interface AddShortcutModalProps {
  isOpen: boolean;
  screens: Screen[];
  activeScreenId: string;
  initialTab?: string;
  onClose: () => void;
  onShortcutCreated: (shortcut: Shortcut) => void;
  onRefreshAll: () => void;
}

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

const ACCENT_COLORS = [
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#10b981', // emerald
  '#06b6d4', // cyan
  '#f59e0b', // amber
  '#ef4444', // red
  '#64748b', // slate
];

export const AddShortcutModal: React.FC<AddShortcutModalProps> = ({
  isOpen,
  screens,
  activeScreenId,
  initialTab = 'app',
  onClose,
  onShortcutCreated,
  onRefreshAll,
}) => {
  const [activeTab, setActiveTab] = useState<'app' | 'file' | 'note' | 'widget'>(
    (initialTab as any) || 'app'
  );

  // Common fields
  const [title, setTitle] = useState('');
  const [selectedScreenId, setSelectedScreenId] = useState(activeScreenId);
  const [selectedColor, setSelectedColor] = useState('#3b82f6');
  const [selectedIcon, setSelectedIcon] = useState('Globe');
  const [dimensionPreset, setDimensionPreset] = useState<'1x1' | '2x1' | '2x2' | '3x2'>('1x1');

  // App / URL tab fields
  const [appType, setAppType] = useState<'url' | 'terminal' | 'calculator' | 'filemanager' | 'browser'>('url');
  const [urlTarget, setUrlTarget] = useState('https://');

  // File upload fields
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);

  // Note fields
  const [noteTitle, setNoteTitle] = useState('Quick Note');
  const [noteContent, setNoteContent] = useState('# Important Memo\n\n- Write tasks\n- Drag and resize freely');

  // Widget fields
  const [widgetType, setWidgetType] = useState<WidgetType>('clock_weather');

  if (!isOpen) return null;

  const getDimensions = () => {
    switch (dimensionPreset) {
      case '2x1':
        return { w: 200, h: 104 };
      case '2x2':
        return { w: 220, h: 220 };
      case '3x2':
        return { w: 320, h: 220 };
      case '1x1':
      default:
        return { w: 96, h: 104 };
    }
  };

  const handleSubmitApp = () => {
    const dims = getDimensions();
    let finalTitle = title.trim();
    let finalIcon = selectedIcon;
    let finalColor = selectedColor;
    let type: ShortcutType = 'url';
    let target = urlTarget;
    let appId: string | undefined = undefined;

    if (appType === 'terminal') {
      finalTitle = finalTitle || 'Cloud Terminal';
      finalIcon = 'Terminal';
      finalColor = '#10b981';
      type = 'app';
      appId = 'terminal';
    } else if (appType === 'calculator') {
      finalTitle = finalTitle || 'Calculator';
      finalIcon = 'Calculator';
      finalColor = '#ec4899';
      type = 'app';
      appId = 'calculator';
    } else if (appType === 'filemanager') {
      finalTitle = finalTitle || 'File Manager';
      finalIcon = 'FolderKanban';
      finalColor = '#8b5cf6';
      type = 'app';
      appId = 'filemanager';
    } else if (appType === 'browser') {
      finalTitle = finalTitle || 'Web Explorer';
      finalIcon = 'Globe';
      finalColor = '#3b82f6';
      type = 'app';
      appId = 'browser';
      target = urlTarget || 'https://developer.mozilla.org';
    } else {
      finalTitle = finalTitle || 'Web Link';
    }

    const newShortcut: Shortcut = {
      id: `shortcut-${Date.now()}`,
      title: finalTitle,
      type,
      target,
      appId,
      screenId: selectedScreenId,
      x: 60,
      y: 60,
      w: dims.w,
      h: dims.h,
      color: finalColor,
      icon: finalIcon,
    };

    onShortcutCreated(newShortcut);
    onClose();
  };

  const handleUploadFiles = async () => {
    if (!selectedFiles || selectedFiles.length === 0) return;
    try {
      setUploading(true);
      const res = await api.uploadFiles(selectedFiles, selectedScreenId, 60, 60);
      if (res.success && res.createdShortcuts.length > 0) {
        res.createdShortcuts.forEach((s) => onShortcutCreated(s));
        onRefreshAll();
        onClose();
      }
    } catch (err) {
      console.error('File upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleCreateNoteFile = async () => {
    try {
      const res = await api.createNoteFile(
        noteTitle.trim() || 'Untitled.md',
        noteContent,
        selectedScreenId,
        60,
        60
      );
      if (res.success && res.shortcut) {
        onShortcutCreated(res.shortcut);
        onRefreshAll();
        onClose();
      }
    } catch (err) {
      console.error('Note create error:', err);
    }
  };

  const handleCreateWidget = () => {
    let w = 280;
    let h = 140;
    let widgetTitle = 'Widget';
    let icon = 'Sparkles';
    let color = '#6366f1';

    if (widgetType === 'clock_weather') {
      widgetTitle = 'Time & Weather';
      icon = 'Clock';
      color = '#6366f1';
      w = 280;
      h = 140;
    } else if (widgetType === 'system_stats') {
      widgetTitle = 'System Diagnostics';
      icon = 'Activity';
      color = '#10b981';
      w = 280;
      h = 140;
    } else if (widgetType === 'notes') {
      widgetTitle = 'Quick Scratchpad';
      icon = 'FileText';
      color = '#f59e0b';
      w = 240;
      h = 220;
    } else if (widgetType === 'tasks') {
      widgetTitle = 'Project Roadmap';
      icon = 'CheckSquare';
      color = '#8b5cf6';
      w = 320;
      h = 240;
    } else if (widgetType === 'storage_vault') {
      widgetTitle = 'Internal File Vault';
      icon = 'HardDrive';
      color = '#06b6d4';
      w = 360;
      h = 240;
    }

    const shortcut: Shortcut = {
      id: `widget-${Date.now()}`,
      title: widgetTitle,
      type: 'widget',
      widgetType,
      screenId: selectedScreenId,
      x: 60,
      y: 60,
      w,
      h,
      color,
      icon,
      content:
        widgetType === 'tasks'
          ? JSON.stringify([
              { id: '1', text: 'Customize launcher desktop layout', done: false },
              { id: '2', text: 'Drag and resize tiles with interact.js', done: true },
            ])
          : widgetType === 'notes'
          ? '# Notes\nDouble click to edit scratchpad...'
          : undefined,
    };

    onShortcutCreated(shortcut);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-950/80 border border-indigo-700/40 text-indigo-400">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Add New Desktop Item</h2>
              <div className="text-xs text-slate-400">
                Draggable &amp; resizable shortcut powered by interact.js
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="px-6 pt-3 border-b border-slate-800 flex gap-2 overflow-x-auto bg-slate-950/20">
          <button
            onClick={() => setActiveTab('app')}
            className={`pb-2.5 px-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'app'
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            App or URL
          </button>
          <button
            onClick={() => setActiveTab('file')}
            className={`pb-2.5 px-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'file'
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Upload File to Folder
          </button>
          <button
            onClick={() => setActiveTab('note')}
            className={`pb-2.5 px-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'note'
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            New Markdown Note
          </button>
          <button
            onClick={() => setActiveTab('widget')}
            className={`pb-2.5 px-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'widget'
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Interactive Widget
          </button>
        </div>

        {/* Body Form */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {/* Target Screen */}
          <div>
            <label className="block text-slate-400 mb-1.5 font-medium">Place on Desktop Screen</label>
            <div className="grid grid-cols-3 gap-2">
              {screens.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSelectedScreenId(s.id)}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    selectedScreenId === s.id
                      ? 'border-indigo-500 bg-indigo-950/60 text-white font-medium shadow-sm'
                      : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          {/* TAB 1: App or Web URL */}
          {activeTab === 'app' && (
            <div className="space-y-4">
              <div>
                <label className="block text-slate-400 mb-1.5 font-medium">Application Type</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAppType('url');
                      setTitle('Web Link');
                    }}
                    className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                      appType === 'url' ? 'border-indigo-500 bg-indigo-950/60 text-white' : 'border-slate-800 bg-slate-800/40 text-slate-400'
                    }`}
                  >
                    <ExternalLink className="w-4 h-4 text-indigo-400" />
                    <span>Custom URL</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAppType('terminal');
                      setTitle('Cloud Terminal');
                      setSelectedIcon('Terminal');
                      setSelectedColor('#10b981');
                    }}
                    className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                      appType === 'terminal' ? 'border-indigo-500 bg-indigo-950/60 text-white' : 'border-slate-800 bg-slate-800/40 text-slate-400'
                    }`}
                  >
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    <span>Terminal</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAppType('browser');
                      setTitle('Web Explorer');
                      setSelectedIcon('Globe');
                      setSelectedColor('#3b82f6');
                    }}
                    className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                      appType === 'browser' ? 'border-indigo-500 bg-indigo-950/60 text-white' : 'border-slate-800 bg-slate-800/40 text-slate-400'
                    }`}
                  >
                    <Globe className="w-4 h-4 text-blue-400" />
                    <span>Browser</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAppType('calculator');
                      setTitle('Calculator');
                      setSelectedIcon('Calculator');
                      setSelectedColor('#ec4899');
                    }}
                    className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                      appType === 'calculator' ? 'border-indigo-500 bg-indigo-950/60 text-white' : 'border-slate-800 bg-slate-800/40 text-slate-400'
                    }`}
                  >
                    <Calculator className="w-4 h-4 text-pink-400" />
                    <span>Calculator</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAppType('filemanager');
                      setTitle('File Manager');
                      setSelectedIcon('FolderKanban');
                      setSelectedColor('#8b5cf6');
                    }}
                    className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                      appType === 'filemanager' ? 'border-indigo-500 bg-indigo-950/60 text-white' : 'border-slate-800 bg-slate-800/40 text-slate-400'
                    }`}
                  >
                    <FolderKanban className="w-4 h-4 text-purple-400" />
                    <span>File Manager</span>
                  </button>
                </div>
              </div>

              {appType === 'url' && (
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Target Web Address (URL)</label>
                  <input
                    type="url"
                    value={urlTarget}
                    onChange={(e) => setUrlTarget(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 font-mono text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Display Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. My Shortcut"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Dimension Preset */}
              <div>
                <label className="block text-slate-400 mb-1.5 font-medium">Shortcut Layout Preset</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['1x1', '2x1', '2x2', '3x2'] as const).map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setDimensionPreset(preset)}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        dimensionPreset === preset
                          ? 'border-indigo-500 bg-indigo-950/60 text-white font-medium'
                          : 'border-slate-800 bg-slate-800/40 text-slate-400'
                      }`}
                    >
                      {preset} Tile
                    </button>
                  ))}
                </div>
              </div>

              {/* Icon & Color selector */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1.5 font-medium">Accent Color</label>
                  <div className="flex flex-wrap gap-1.5">
                    {ACCENT_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setSelectedColor(c)}
                        className={`w-6 h-6 rounded-lg transition-transform ${
                          selectedColor === c ? 'scale-110 ring-2 ring-white ring-offset-1 ring-offset-slate-900' : ''
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1.5 font-medium">Icon Emblem</label>
                  <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                    {AVAILABLE_ICONS.slice(0, 10).map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setSelectedIcon(icon)}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          selectedIcon === icon
                            ? 'border-indigo-500 bg-indigo-600 text-white'
                            : 'border-slate-700 bg-slate-800 text-slate-300'
                        }`}
                      >
                        <IconRenderer name={icon} className="w-3.5 h-3.5" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: File Upload */}
          {activeTab === 'file' && (
            <div className="space-y-4">
              <div className="p-4 border border-dashed border-slate-700 rounded-2xl bg-slate-800/30 text-center">
                <Upload className="w-8 h-8 mx-auto text-cyan-400 mb-2" />
                <div className="text-sm font-semibold text-slate-200">
                  Select files to copy into internal launcher folder
                </div>
                <div className="text-slate-400 text-xs mt-1">
                  Files are saved into <code className="text-cyan-400">/data/storage_folder/</code> and a desktop shortcut is placed automatically.
                </div>
                <label className="inline-block mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium cursor-pointer transition-colors shadow">
                  Browse Files
                  <input
                    type="file"
                    multiple
                    onChange={(e) => setSelectedFiles(e.target.files)}
                    className="hidden"
                  />
                </label>
              </div>

              {selectedFiles && selectedFiles.length > 0 && (
                <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700 space-y-1">
                  <div className="font-semibold text-slate-300 text-xs">
                    {selectedFiles.length} file(s) selected:
                  </div>
                  {Array.from(selectedFiles).map((f, i) => (
                    <div key={i} className="text-slate-400 text-[11px] truncate flex justify-between">
                      <span>{f.name}</span>
                      <span>{(f.size / 1024).toFixed(1)} KB</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: New Markdown Note */}
          {activeTab === 'note' && (
            <div className="space-y-3">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Note Document Name</label>
                <input
                  type="text"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="MyNote.md"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Markdown Content</label>
                <textarea
                  rows={6}
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 text-xs font-mono focus:outline-none focus:border-indigo-500 leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* TAB 4: Interactive Widget */}
          {activeTab === 'widget' && (
            <div className="space-y-3">
              <label className="block text-slate-400 mb-1.5 font-medium">Select Widget Prototype</label>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setWidgetType('clock_weather')}
                  className={`w-full p-3 rounded-2xl border flex items-center justify-between text-left transition-colors ${
                    widgetType === 'clock_weather'
                      ? 'border-indigo-500 bg-indigo-950/60 text-white'
                      : 'border-slate-800 bg-slate-800/40 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-indigo-900/60 text-indigo-400">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-100">Live Clock &amp; Ambient Weather</div>
                      <div className="text-[11px] text-slate-400">Real-time seconds clock, calendar date, ambient status.</div>
                    </div>
                  </div>
                  {widgetType === 'clock_weather' && <Check className="w-4 h-4 text-indigo-400" />}
                </button>

                <button
                  type="button"
                  onClick={() => setWidgetType('system_stats')}
                  className={`w-full p-3 rounded-2xl border flex items-center justify-between text-left transition-colors ${
                    widgetType === 'system_stats'
                      ? 'border-indigo-500 bg-indigo-950/60 text-white'
                      : 'border-slate-800 bg-slate-800/40 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-emerald-900/60 text-emerald-400">
                      <Activity className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-100">System Diagnostics &amp; POSIX DB</div>
                      <div className="text-[11px] text-slate-400">Live interact.js grid status, database integrity check.</div>
                    </div>
                  </div>
                  {widgetType === 'system_stats' && <Check className="w-4 h-4 text-emerald-400" />}
                </button>

                <button
                  type="button"
                  onClick={() => setWidgetType('notes')}
                  className={`w-full p-3 rounded-2xl border flex items-center justify-between text-left transition-colors ${
                    widgetType === 'notes'
                      ? 'border-indigo-500 bg-indigo-950/60 text-white'
                      : 'border-slate-800 bg-slate-800/40 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-amber-900/60 text-amber-400">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-100">Quick Scratchpad Memo</div>
                      <div className="text-[11px] text-slate-400">Resizable desktop sticky memo with persistent content.</div>
                    </div>
                  </div>
                  {widgetType === 'notes' && <Check className="w-4 h-4 text-amber-400" />}
                </button>

                <button
                  type="button"
                  onClick={() => setWidgetType('tasks')}
                  className={`w-full p-3 rounded-2xl border flex items-center justify-between text-left transition-colors ${
                    widgetType === 'tasks'
                      ? 'border-indigo-500 bg-indigo-950/60 text-white'
                      : 'border-slate-800 bg-slate-800/40 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-purple-900/60 text-purple-400">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-100">Project Roadmap &amp; Tasks</div>
                      <div className="text-[11px] text-slate-400">Interactive todo list stored directly in JSON database.</div>
                    </div>
                  </div>
                  {widgetType === 'tasks' && <Check className="w-4 h-4 text-purple-400" />}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition-colors"
          >
            Cancel
          </button>

          {activeTab === 'app' && (
            <button
              onClick={handleSubmitApp}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-colors shadow-sm shadow-indigo-600/40"
            >
              Add Shortcut
            </button>
          )}

          {activeTab === 'file' && (
            <button
              onClick={handleUploadFiles}
              disabled={!selectedFiles || selectedFiles.length === 0 || uploading}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-xs transition-colors shadow-sm"
            >
              {uploading ? 'Copying to folder...' : 'Upload &amp; Create Tile'}
            </button>
          )}

          {activeTab === 'note' && (
            <button
              onClick={handleCreateNoteFile}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-colors shadow-sm"
            >
              Save Note File &amp; Create Tile
            </button>
          )}

          {activeTab === 'widget' && (
            <button
              onClick={handleCreateWidget}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-colors shadow-sm shadow-indigo-600/40"
            >
              Add Widget to Grid
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
