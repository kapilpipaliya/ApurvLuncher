export type ShortcutType = 'app' | 'file' | 'url' | 'widget' | 'folder' | 'note';

export type WidgetType = 'clock_weather' | 'system_stats' | 'notes' | 'tasks' | 'storage_vault';

export interface FileMetadata {
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  url: string;
  uploadedAt: string;
}

export interface Shortcut {
  id: string;
  title: string;
  type: ShortcutType;
  screenId: string;
  x: number;
  y: number;
  w: number;
  h: number;
  color?: string;
  icon?: string;
  target?: string;
  appId?: string;
  widgetType?: WidgetType;
  content?: string;
  fileMeta?: FileMetadata;
  isLocked?: boolean;
  zIndex?: number;
}

export interface Screen {
  id: string;
  name: string;
  order: number;
}

export interface LauncherSettings {
  gridSnap: boolean;
  gridCellSize: number;
  theme: 'dark' | 'light';
  wallpaper: string;
  wallpaperBlur: number;
  iconSize: 'small' | 'medium' | 'large';
  showGridLines: boolean;
  soundEffects: boolean;
  dockItems: string[];
}

export interface AuditLogEntry {
  id: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface LauncherConfig {
  version: number;
  createdAt: string;
  lastUpdated: string;
  settings: LauncherSettings;
  screens: Screen[];
  activeScreenId: string;
  shortcuts: Shortcut[];
  auditLog: AuditLogEntry[];
}

export interface DbIntegrityInfo {
  dbFileExists: boolean;
  backupExists: boolean;
  dbSizeBytes: number;
  storageFolder: string;
  storageFileCount: number;
}
