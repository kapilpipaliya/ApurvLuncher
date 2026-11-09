import React, { useState, useEffect, useRef, useCallback } from 'react';
import { LauncherConfig, Shortcut, DbIntegrityInfo } from './types';
import { api } from './services/api';
import { ShortcutItem } from './components/ShortcutItem';
import { TopStatusBar } from './components/TopStatusBar';
import { Dock } from './components/Dock';
import { ContextMenu, ContextMenuState } from './components/ContextMenu';
import { AddShortcutModal } from './components/AddShortcutModal';
import { EditShortcutModal } from './components/EditShortcutModal';
import { FileManagerModal } from './components/FileManagerModal';
import { SettingsModal } from './components/SettingsModal';
import { AppViewerModal } from './components/AppViewerModal';
import { AppDrawerModal } from './components/AppDrawerModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { Upload, HardDrive, Sparkles, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [config, setConfig] = useState<LauncherConfig | null>(null);
  const [integrity, setIntegrity] = useState<DbIntegrityInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeScreenId, setActiveScreenId] = useState<string>('screen-1');
  const [selectedShortcutId, setSelectedShortcutId] = useState<string | null>(null);
  const [isDragOverCanvas, setIsDragOverCanvas] = useState(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Modals state
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    isOpen: false,
    x: 0,
    y: 0,
    type: 'desktop',
  });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalTab, setAddModalTab] = useState('app');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingShortcut, setEditingShortcut] = useState<Shortcut | null>(null);
  const [isFileManagerOpen, setIsFileManagerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAppDrawerOpen, setIsAppDrawerOpen] = useState(false);
  const [activeViewerShortcut, setActiveViewerShortcut] = useState<Shortcut | null>(null);

  // Hidden file input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Debounced auto-save timer ref
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load config on mount
  const loadConfiguration = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.getConfig();
      if (res.success) {
        setConfig(res.data);
        setIntegrity(res.integrity);
        if (res.data.activeScreenId) {
          setActiveScreenId(res.data.activeScreenId);
        }
      }
    } catch (err) {
      console.error('Failed to load configuration:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConfiguration();
  }, [loadConfiguration]);

  // Toast notification helper
  const showToast = (msg: string) => {
    setSaveToast(msg);
    setTimeout(() => {
      setSaveToast((prev) => (prev === msg ? null : prev));
    }, 2800);
  };

  // Persist config to backend JSON database
  const persistConfig = useCallback((updatedConfig: LauncherConfig, toastMsg?: string) => {
    setConfig(updatedConfig);

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await api.saveConfig(updatedConfig);
        if (res.success && toastMsg) {
          showToast(toastMsg);
        }
      } catch (err) {
        console.error('Save failed:', err);
      }
    }, 400);
  }, []);

  // Update shortcut position on drag end (interact.js)
  const handleUpdatePosition = useCallback(
    (id: string, x: number, y: number) => {
      if (!config) return;
      const updatedShortcuts = config.shortcuts.map((s) => (s.id === id ? { ...s, x, y } : s));
      const updatedConfig = { ...config, shortcuts: updatedShortcuts };
      persistConfig(updatedConfig, 'Shortcut position persisted to JSON DB');
    },
    [config, persistConfig]
  );

  // Update shortcut dimensions on resize end (interact.js)
  const handleUpdateSize = useCallback(
    (id: string, w: number, h: number, x: number, y: number) => {
      if (!config) return;
      const updatedShortcuts = config.shortcuts.map((s) =>
        s.id === id ? { ...s, w, h, x, y } : s
      );
      const updatedConfig = { ...config, shortcuts: updatedShortcuts };
      persistConfig(updatedConfig, 'Shortcut dimensions persisted to JSON DB');
    },
    [config, persistConfig]
  );

  // Launch shortcut (open app or document viewer)
  const handleLaunchShortcut = (shortcut: Shortcut) => {
    if (shortcut.type === 'url' && shortcut.target && !shortcut.appId) {
      window.open(shortcut.target, '_blank');
      return;
    }
    setActiveViewerShortcut(shortcut);
  };

  // Toggle dock pin
  const handleToggleDockPin = (shortcut: Shortcut) => {
    if (!config) return;
    const isPinned = config.settings.dockItems.includes(shortcut.id);
    const newDockItems = isPinned
      ? config.settings.dockItems.filter((id) => id !== shortcut.id)
      : [...config.settings.dockItems, shortcut.id];

    const updatedConfig = {
      ...config,
      settings: {
        ...config.settings,
        dockItems: newDockItems,
      },
    };
    persistConfig(updatedConfig, isPinned ? 'Unpinned from dock' : 'Pinned to dock');
  };

  // Toggle position lock
  const handleToggleLock = (shortcut: Shortcut) => {
    if (!config) return;
    const updatedShortcuts = config.shortcuts.map((s) =>
      s.id === shortcut.id ? { ...s, isLocked: !s.isLocked } : s
    );
    const updatedConfig = { ...config, shortcuts: updatedShortcuts };
    persistConfig(updatedConfig, shortcut.isLocked ? 'Shortcut unlocked' : 'Shortcut locked');
  };

  // Move shortcut to another screen
  const handleMoveToScreen = (shortcut: Shortcut, screenId: string) => {
    if (!config) return;
    const updatedShortcuts = config.shortcuts.map((s) =>
      s.id === shortcut.id ? { ...s, screenId } : s
    );
    const updatedConfig = { ...config, shortcuts: updatedShortcuts };
    persistConfig(updatedConfig, `Moved to screen`);
  };

  // Delete shortcut
  const handleDeleteShortcut = (shortcut: Shortcut) => {
    if (!config) return;
    const updatedShortcuts = config.shortcuts.filter((s) => s.id !== shortcut.id);
    const updatedDock = config.settings.dockItems.filter((id) => id !== shortcut.id);
    const updatedConfig = {
      ...config,
      shortcuts: updatedShortcuts,
      settings: { ...config.settings, dockItems: updatedDock },
    };
    persistConfig(updatedConfig, 'Shortcut deleted');
  };

  // Snap all shortcuts to grid
  const handleSnapAllToGrid = () => {
    if (!config) return;
    const cellSize = config.settings.gridCellSize || 80;
    const updatedShortcuts = config.shortcuts.map((s) => {
      const snappedX = Math.round(s.x / cellSize) * cellSize;
      const snappedY = Math.round(s.y / cellSize) * cellSize;
      const snappedW = Math.max(80, Math.round(s.w / cellSize) * cellSize);
      const snappedH = Math.max(80, Math.round(s.h / cellSize) * cellSize);
      return { ...s, x: snappedX, y: snappedY, w: snappedW, h: snappedH };
    });
    const updatedConfig = { ...config, shortcuts: updatedShortcuts };
    persistConfig(updatedConfig, 'All shortcuts snapped to grid');
  };

  // Toggle grid snapping
  const handleToggleGridSnap = () => {
    if (!config) return;
    const updatedConfig = {
      ...config,
      settings: {
        ...config.settings,
        gridSnap: !config.settings.gridSnap,
      },
    };
    persistConfig(updatedConfig, updatedConfig.settings.gridSnap ? 'Grid snap enabled' : 'Freeform enabled');
  };

  // Add new shortcut
  const handleShortcutCreated = (newShortcut: Shortcut) => {
    if (!config) return;
    const updatedConfig = {
      ...config,
      shortcuts: [...config.shortcuts, newShortcut],
    };
    persistConfig(updatedConfig, `Created '${newShortcut.title}'`);
  };

  // Edit shortcut save
  const handleSaveEditedShortcut = (updated: Shortcut) => {
    if (!config) return;
    const updatedShortcuts = config.shortcuts.map((s) => (s.id === updated.id ? updated : s));
    const updatedConfig = { ...config, shortcuts: updatedShortcuts };
    persistConfig(updatedConfig, `Updated '${updated.title}'`);
  };

  // Factory reset
  const handleResetDefaults = async () => {
    try {
      const res = await api.resetConfig();
      if (res.success) {
        setConfig(res.data);
        showToast('Factory configuration restored');
      }
    } catch (err) {
      console.error('Reset failed:', err);
    }
  };

  // External file drop handler (drop files onto canvas to copy into internal folder)
  const handleDropFiles = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverCanvas(false);
    if (!e.dataTransfer.files || e.dataTransfer.files.length === 0) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const dropX = Math.max(20, Math.round(e.clientX - rect.left - 50));
    const dropY = Math.max(20, Math.round(e.clientY - rect.top - 50));

    try {
      showToast('Copying files into launcher folder...');
      const res = await api.uploadFiles(e.dataTransfer.files, activeScreenId, dropX, dropY);
      if (res.success && res.createdShortcuts.length > 0) {
        if (config) {
          const updatedConfig = {
            ...config,
            shortcuts: [...config.shortcuts, ...res.createdShortcuts],
          };
          persistConfig(updatedConfig, `${res.files.length} file(s) copied & stored`);
        }
        loadConfiguration();
      }
    } catch (err) {
      console.error('Drop upload error:', err);
    }
  };

  // File input change (from manual upload trigger)
  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    try {
      showToast('Copying file to launcher folder...');
      const res = await api.uploadFiles(e.target.files, activeScreenId, 60, 100);
      if (res.success && res.createdShortcuts.length > 0) {
        if (config) {
          const updatedConfig = {
            ...config,
            shortcuts: [...config.shortcuts, ...res.createdShortcuts],
          };
          persistConfig(updatedConfig, `${res.files.length} file(s) copied to storage folder`);
        }
        loadConfiguration();
      }
    } catch (err) {
      console.error('Upload error:', err);
    }
  };

  // Right click on canvas
  const handleCanvasContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({
      isOpen: true,
      x: e.clientX,
      y: e.clientY,
      type: 'desktop',
    });
  };

  // Right click on shortcut
  const handleShortcutContextMenu = (shortcut: Shortcut, e: React.MouseEvent) => {
    setSelectedShortcutId(shortcut.id);
    setContextMenu({
      isOpen: true,
      x: e.clientX,
      y: e.clientY,
      type: 'shortcut',
      targetShortcut: shortcut,
    });
  };

  if (loading || !config) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-200 font-sans">
        <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
        <div className="text-sm font-semibold text-slate-100">Initializing NovaLauncher...</div>
        <div className="text-xs text-slate-500 font-mono mt-1">Verifying Atomic JSON DB Integrity</div>
      </div>
    );
  }

  // Filter shortcuts for current screen
  const currentScreenShortcuts = config.shortcuts.filter((s) => s.screenId === activeScreenId);

  // Shortcuts currently in dock
  const dockShortcuts = config.settings.dockItems
    .map((id) => config.shortcuts.find((s) => s.id === id))
    .filter((s): s is Shortcut => Boolean(s));

  const isGradientWallpaper = config.settings.wallpaper.startsWith('linear-gradient');

  return (
    <div
      className="relative w-screen h-screen overflow-hidden flex flex-col select-none text-slate-100 font-sans"
      onContextMenu={handleCanvasContextMenu}
      onClick={() => {
        setSelectedShortcutId(null);
        setContextMenu((prev) => ({ ...prev, isOpen: false }));
      }}
    >
      {/* Background Wallpaper */}
      <div
        className="absolute inset-0 z-0 pointer-events-none transition-all duration-300"
        style={{
          filter: config.settings.wallpaperBlur > 0 ? `blur(${config.settings.wallpaperBlur}px)` : 'none',
          transform: config.settings.wallpaperBlur > 0 ? 'scale(1.05)' : 'none',
        }}
      >
        {isGradientWallpaper ? (
          <div className="w-full h-full" style={{ background: config.settings.wallpaper }} />
        ) : (
          <img
            src={config.settings.wallpaper}
            alt="Desktop wallpaper"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Grid Pattern Overlay */}
      {config.settings.showGridLines && (
        <div className="absolute inset-0 z-[1] pointer-events-none grid-dots-pattern opacity-60" />
      )}

      {/* Top Bar following Top Bar Contract */}
      <TopStatusBar
        screens={config.screens}
        activeScreenId={activeScreenId}
        gridSnap={config.settings.gridSnap}
        integrity={integrity}
        onSelectScreen={(screenId) => {
          setActiveScreenId(screenId);
          persistConfig({ ...config, activeScreenId: screenId });
        }}
        onOpenAddModal={() => {
          setAddModalTab('app');
          setIsAddModalOpen(true);
        }}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenFileManager={() => setIsFileManagerOpen(true)}
        onToggleGridSnap={handleToggleGridSnap}
      />

      {/* Main Interactive Desktop Grid Canvas */}
      <main
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOverCanvas(true);
        }}
        onDragLeave={() => setIsDragOverCanvas(false)}
        onDrop={handleDropFiles}
        className="relative flex-1 w-full h-full overflow-hidden z-10"
      >
        {/* External File Drop Overlay */}
        {isDragOverCanvas && (
          <div className="absolute inset-4 z-40 rounded-3xl border-2 border-dashed border-indigo-400 bg-indigo-950/80 backdrop-blur-md flex flex-col items-center justify-center pointer-events-none animate-in fade-in duration-100">
            <Upload className="w-12 h-12 text-indigo-300 animate-bounce mb-3" />
            <div className="text-lg font-bold text-white">Drop files to copy into Launcher Folder</div>
            <div className="text-xs text-indigo-300 font-mono mt-1">
              Copied to /data/storage_folder/ &amp; added to {config.screens.find((s) => s.id === activeScreenId)?.name}
            </div>
          </div>
        )}

        {/* Desktop Shortcuts container */}
        <div className="relative w-full h-full">
          {currentScreenShortcuts.map((shortcut) => (
            <ShortcutItem
              key={shortcut.id}
              shortcut={shortcut}
              gridSnap={config.settings.gridSnap}
              gridCellSize={config.settings.gridCellSize || 80}
              isSelected={selectedShortcutId === shortcut.id}
              onSelect={(s) => setSelectedShortcutId(s.id)}
              onLaunch={handleLaunchShortcut}
              onUpdatePosition={handleUpdatePosition}
              onUpdateSize={handleUpdateSize}
              onContextMenu={handleShortcutContextMenu}
            />
          ))}
        </div>
      </main>

      {/* Persistent Bottom Dock */}
      <Dock
        dockShortcuts={dockShortcuts}
        onLaunchShortcut={handleLaunchShortcut}
        onOpenAppDrawer={() => setIsAppDrawerOpen(true)}
        onTriggerUpload={() => fileInputRef.current?.click()}
        onOpenTerminal={() => {
          const term = config.shortcuts.find((s) => s.appId === 'terminal') || {
            id: 'terminal-temp',
            title: 'Cloud Terminal',
            type: 'app' as const,
            appId: 'terminal',
            screenId: activeScreenId,
            x: 40,
            y: 40,
            w: 200,
            h: 100,
            color: '#10b981',
          };
          setActiveViewerShortcut(term);
        }}
        onOpenFiles={() => setIsFileManagerOpen(true)}
      />

      {/* Hidden file input for manual copying */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Context Menu */}
      <ContextMenu
        state={contextMenu}
        screens={config.screens}
        activeScreenId={activeScreenId}
        isDockPinned={
          contextMenu.targetShortcut
            ? config.settings.dockItems.includes(contextMenu.targetShortcut.id)
            : false
        }
        onClose={() => setContextMenu((prev) => ({ ...prev, isOpen: false }))}
        onLaunchShortcut={handleLaunchShortcut}
        onEditShortcut={(s) => {
          setEditingShortcut(s);
          setIsEditModalOpen(true);
        }}
        onDeleteShortcut={handleDeleteShortcut}
        onToggleLock={handleToggleLock}
        onToggleDockPin={handleToggleDockPin}
        onMoveToScreen={handleMoveToScreen}
        onOpenAddModal={(tab) => {
          if (tab) setAddModalTab(tab);
          setIsAddModalOpen(true);
        }}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenFileManager={() => setIsFileManagerOpen(true)}
        onSnapAllToGrid={handleSnapAllToGrid}
        onTriggerFileInput={() => fileInputRef.current?.click()}
      />

      {/* Add Shortcut Modal */}
      <AddShortcutModal
        isOpen={isAddModalOpen}
        screens={config.screens}
        activeScreenId={activeScreenId}
        initialTab={addModalTab}
        onClose={() => setIsAddModalOpen(false)}
        onShortcutCreated={handleShortcutCreated}
        onRefreshAll={loadConfiguration}
      />

      {/* Edit Shortcut Modal */}
      <EditShortcutModal
        isOpen={isEditModalOpen}
        shortcut={editingShortcut}
        screens={config.screens}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingShortcut(null);
        }}
        onSave={handleSaveEditedShortcut}
      />

      {/* File Manager & Vault Modal */}
      <FileManagerModal
        isOpen={isFileManagerOpen}
        onClose={() => setIsFileManagerOpen(false)}
        onOpenFile={(filename, url) => {
          setIsFileManagerOpen(false);
          const fileShortcut: Shortcut = {
            id: `view-${filename}`,
            title: filename,
            type: 'file',
            screenId: activeScreenId,
            x: 60,
            y: 60,
            w: 120,
            h: 120,
            fileMeta: {
              filename,
              originalName: filename,
              size: 0,
              mimeType: 'text/plain',
              url,
              uploadedAt: new Date().toISOString(),
            },
          };
          setActiveViewerShortcut(fileShortcut);
        }}
        onRefreshConfig={loadConfiguration}
      />

      {/* Settings & Database Integrity Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        config={config}
        integrity={integrity}
        onClose={() => setIsSettingsOpen(false)}
        onUpdateConfig={(newConf) => persistConfig(newConf, 'Settings updated and saved')}
        onResetDefaults={handleResetDefaults}
      />

      {/* App Drawer Modal */}
      <AppDrawerModal
        isOpen={isAppDrawerOpen}
        shortcuts={config.shortcuts}
        dockItemIds={config.settings.dockItems}
        onClose={() => setIsAppDrawerOpen(false)}
        onLaunch={handleLaunchShortcut}
        onToggleDockPin={handleToggleDockPin}
        onOpenAddModal={() => {
          setAddModalTab('app');
          setIsAddModalOpen(true);
        }}
      />

      {/* In-App Viewer Modal (Terminal, Calculator, Note Editor, Browser) */}
      <AppViewerModal
        shortcut={activeViewerShortcut}
        onClose={() => setActiveViewerShortcut(null)}
        onUpdateContent={(id, content) => {
          if (!config) return;
          const updatedShortcuts = config.shortcuts.map((s) => (s.id === id ? { ...s, content } : s));
          const updatedConfig = { ...config, shortcuts: updatedShortcuts };
          persistConfig(updatedConfig, 'Note content updated and persisted');
        }}
        onRefreshAll={loadConfiguration}
      />

      {/* Offline Status Connectivity Banner */}
      <OfflineIndicator />

      {/* Save / Integrity Toast */}
      {saveToast && (
        <div className="fixed top-16 right-6 z-50 flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-900/95 border border-slate-700 shadow-xl text-xs text-slate-200 animate-in fade-in slide-in-from-top-2 duration-150">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{saveToast}</span>
        </div>
      )}
    </div>
  );
}
