import { LauncherConfig, DbIntegrityInfo, Shortcut } from '../types';

export interface ConfigResponse {
  success: boolean;
  data: LauncherConfig;
  integrity: DbIntegrityInfo;
  error?: string;
  isOffline?: boolean;
}

export interface StoredFileItem {
  filename: string;
  size: number;
  createdAt: string;
  modifiedAt: string;
  url: string;
}

const OFFLINE_CACHE_KEY = 'novalauncher_offline_config_v2';

export const api = {
  async getConfig(): Promise<ConfigResponse> {
    try {
      const res = await fetch('/api/config');
      if (res.ok) {
        const json: ConfigResponse = await res.json();
        if (json.success && json.data) {
          try {
            localStorage.setItem(OFFLINE_CACHE_KEY, JSON.stringify(json.data));
          } catch {
            // Ignore storage quota errors
          }
        }
        return json;
      }
      throw new Error(`HTTP ${res.status}`);
    } catch (err) {
      console.warn('Network unavailable, checking offline cache fallback...', err);
      const cached = localStorage.getItem(OFFLINE_CACHE_KEY);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          return {
            success: true,
            data: parsed,
            integrity: {
              dbFileExists: true,
              backupExists: true,
              dbSizeBytes: cached.length,
              storageFolder: 'Offline Local Mirror',
              storageFileCount: parsed.shortcuts?.filter((s: any) => s.type === 'file').length || 0,
            },
            isOffline: true,
          };
        } catch {
          // Fall through
        }
      }
      throw new Error('No network and no cached launcher configuration available.');
    }
  },

  async saveConfig(config: LauncherConfig): Promise<{ success: boolean; lastUpdated: string }> {
    // Always mirror to local cache first
    try {
      localStorage.setItem(OFFLINE_CACHE_KEY, JSON.stringify(config));
    } catch {
      // Ignore storage errors
    }

    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (res.ok) {
        return res.json();
      }
    } catch (err) {
      console.warn('Offline mode: Saved configuration to local offline mirror.', err);
    }

    return {
      success: true,
      lastUpdated: new Date().toISOString(),
    };
  },

  async resetConfig(): Promise<{ success: boolean; data: LauncherConfig }> {
    try {
      const res = await fetch('/api/config/reset', { method: 'POST' });
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          localStorage.setItem(OFFLINE_CACHE_KEY, JSON.stringify(json.data));
        }
        return json;
      }
    } catch {
      localStorage.removeItem(OFFLINE_CACHE_KEY);
    }
    throw new Error('Failed to reset configuration');
  },

  async uploadFiles(files: FileList | File[], screenId: string, x = 60, y = 100): Promise<{
    success: boolean;
    files: any[];
    createdShortcuts: Shortcut[];
  }> {
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }
    formData.append('screenId', screenId);
    formData.append('x', x.toString());
    formData.append('y', y.toString());

    const res = await fetch('/api/files/upload', {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error('Failed to copy files to storage folder');
    return res.json();
  },

  async createNoteFile(title: string, content: string, screenId: string, x = 80, y = 100): Promise<{
    success: boolean;
    shortcut: Shortcut;
  }> {
    const res = await fetch('/api/files/create-note', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: title, content, screenId, x, y }),
    });
    if (!res.ok) throw new Error('Failed to create note file in storage folder');
    return res.json();
  },

  async listStorageFiles(): Promise<{ success: boolean; folder: string; files: StoredFileItem[] }> {
    const res = await fetch('/api/files');
    if (!res.ok) throw new Error('Failed to list files');
    return res.json();
  },

  async deleteStorageFile(filename: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/files/${encodeURIComponent(filename)}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete file');
    return res.json();
  },

  async importDatabase(jsonData: any): Promise<{ success: boolean; data: LauncherConfig }> {
    const res = await fetch('/api/database/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(jsonData),
    });
    if (!res.ok) throw new Error('Failed to import database JSON');
    return res.json();
  },
};
