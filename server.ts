import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import crypto from 'crypto';

const isProduction = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 3000;
const DATA_DIR = path.resolve(process.cwd(), 'data');
const STORAGE_DIR = path.resolve(DATA_DIR, 'storage_folder');
const DB_FILE = path.resolve(DATA_DIR, 'launcher_db.json');
const BACKUP_FILE = path.resolve(DATA_DIR, 'launcher_db.backup.json');

// Ensure data and storage directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

// Default initial database configuration
const getDefaultConfig = () => ({
  version: 2,
  createdAt: new Date().toISOString(),
  lastUpdated: new Date().toISOString(),
  settings: {
    gridSnap: true,
    gridCellSize: 80,
    theme: 'dark',
    wallpaper: '/src/assets/images/launcher_wallpaper_cyber_abstract_1794184895306.jpg',
    wallpaperBlur: 0,
    iconSize: 'medium', // small, medium, large
    showGridLines: true,
    soundEffects: false,
    dockItems: ['app-browser', 'app-terminal', 'app-notes', 'app-files', 'app-calculator', 'app-settings'],
  },
  screens: [
    { id: 'screen-1', name: 'Home Workspace', order: 0 },
    { id: 'screen-2', name: 'Dev & Projects', order: 1 },
    { id: 'screen-3', name: 'Media & Storage', order: 2 },
  ],
  activeScreenId: 'screen-1',
  shortcuts: [
    // Screen 1: Home workspace
    {
      id: 'widget-clock',
      title: 'Time & Weather',
      type: 'widget',
      widgetType: 'clock_weather',
      screenId: 'screen-1',
      x: 40,
      y: 40,
      w: 280,
      h: 140,
      color: '#6366f1',
      icon: 'Clock',
      isLocked: false,
    },
    {
      id: 'widget-system',
      title: 'System Diagnostics',
      type: 'widget',
      widgetType: 'system_stats',
      screenId: 'screen-1',
      x: 360,
      y: 40,
      w: 280,
      h: 140,
      color: '#10b981',
      icon: 'Activity',
      isLocked: false,
    },
    {
      id: 'app-browser',
      title: 'Web Explorer',
      type: 'app',
      appId: 'browser',
      screenId: 'screen-1',
      x: 40,
      y: 220,
      w: 96,
      h: 104,
      color: '#3b82f6',
      icon: 'Globe',
      target: 'https://developer.mozilla.org',
    },
    {
      id: 'app-notes',
      title: 'Quick Scratchpad',
      type: 'widget',
      widgetType: 'notes',
      screenId: 'screen-1',
      x: 160,
      y: 220,
      w: 240,
      h: 220,
      color: '#f59e0b',
      icon: 'FileText',
      content: '# Sprint Goals\n- Drag & resize shortcuts freely\n- Store files inside launcher directory\n- Atomic JSON DB persistence guaranteed\n- Snapping to custom desktop grid',
    },
    {
      id: 'app-terminal',
      title: 'Cloud Terminal',
      type: 'app',
      appId: 'terminal',
      screenId: 'screen-1',
      x: 440,
      y: 220,
      w: 96,
      h: 104,
      color: '#10b981',
      icon: 'Terminal',
      command: 'launcher --status',
    },
    {
      id: 'app-files',
      title: 'File Manager',
      type: 'app',
      appId: 'filemanager',
      screenId: 'screen-1',
      x: 560,
      y: 220,
      w: 96,
      h: 104,
      color: '#8b5cf6',
      icon: 'FolderKanban',
    },
    {
      id: 'file-readme',
      title: 'Launcher_Guide.md',
      type: 'file',
      screenId: 'screen-1',
      x: 40,
      y: 360,
      w: 100,
      h: 104,
      color: '#06b6d4',
      icon: 'FileCode',
      fileMeta: {
        filename: 'Launcher_Guide.md',
        originalName: 'Launcher_Guide.md',
        size: 1420,
        mimeType: 'text/markdown',
        url: '/api/files/Launcher_Guide.md',
        uploadedAt: new Date().toISOString(),
      },
    },
    {
      id: 'app-calculator',
      title: 'Calculator',
      type: 'app',
      appId: 'calculator',
      screenId: 'screen-1',
      x: 440,
      y: 360,
      w: 96,
      h: 104,
      color: '#ec4899',
      icon: 'Calculator',
    },
    {
      id: 'app-settings',
      title: 'Settings',
      type: 'app',
      appId: 'settings',
      screenId: 'screen-1',
      x: 560,
      y: 360,
      w: 96,
      h: 104,
      color: '#64748b',
      icon: 'Settings',
    },

    // Screen 2: Dev & Projects
    {
      id: 'widget-todos',
      title: 'Project Roadmap',
      type: 'widget',
      widgetType: 'tasks',
      screenId: 'screen-2',
      x: 40,
      y: 40,
      w: 320,
      h: 240,
      color: '#8b5cf6',
      icon: 'CheckSquare',
      content: JSON.stringify([
        { id: '1', text: 'Install and configure interact.js drag & resize', done: true },
        { id: '2', text: 'Persist layouts in local JSON database file', done: true },
        { id: '3', text: 'Provide dedicated folder file copy & upload', done: true },
        { id: '4', text: 'Responsive multi-device viewport support', done: true },
      ]),
    },
    {
      id: 'file-roadmap-json',
      title: 'roadmap_spec.json',
      type: 'file',
      screenId: 'screen-2',
      x: 400,
      y: 40,
      w: 110,
      h: 104,
      color: '#eab308',
      icon: 'FileJson',
      fileMeta: {
        filename: 'roadmap_spec.json',
        originalName: 'roadmap_spec.json',
        size: 890,
        mimeType: 'application/json',
        url: '/api/files/roadmap_spec.json',
        uploadedAt: new Date().toISOString(),
      },
    },
    {
      id: 'url-interactjs',
      title: 'Interact.js Docs',
      type: 'url',
      screenId: 'screen-2',
      x: 400,
      y: 180,
      w: 110,
      h: 104,
      color: '#22c55e',
      icon: 'ExternalLink',
      target: 'https://interactjs.io',
    },
    {
      id: 'url-github',
      title: 'Repository',
      type: 'url',
      screenId: 'screen-2',
      x: 540,
      y: 180,
      w: 110,
      h: 104,
      color: '#cbd5e1',
      icon: 'Code2',
      target: 'https://github.com',
    },

    // Screen 3: Media & Storage
    {
      id: 'widget-storage-overview',
      title: 'Launcher Folder Vault',
      type: 'widget',
      widgetType: 'storage_vault',
      screenId: 'screen-3',
      x: 40,
      y: 40,
      w: 380,
      h: 260,
      color: '#06b6d4',
      icon: 'HardDrive',
    },
  ],
  auditLog: [
    {
      id: 'init-1',
      action: 'INITIALIZE_DB',
      details: 'Launcher JSON database initialized with integrity verification.',
      timestamp: new Date().toISOString(),
    },
  ],
});

// Seed sample files into storage folder if missing
const seedSampleFiles = () => {
  const guidePath = path.resolve(STORAGE_DIR, 'Launcher_Guide.md');
  if (!fs.existsSync(guidePath)) {
    fs.writeFileSync(
      guidePath,
      `# NovaLauncher Workspace Guide

Welcome to your customized desktop launcher built with **interact.js**!

## Key Capabilities
1. **Draggable & Resizable Grid Shortcuts**:
   - Grab any card or shortcut to drag it across the desktop.
   - Use the bottom-right handle or card edges to resize icons into banners, widgets, or expansive windows.
   - Live grid snapping keeps everything neatly aligned.
2. **Dedicated Folder File Storage**:
   - Every file uploaded or dropped into the launcher is automatically copied into the launcher's own local folder (\`/data/storage_folder/\`).
   - Files are served directly from this internal storage.
3. **Data Integrity via Local JSON Database**:
   - Configurations and layouts are persisted in \`/data/launcher_db.json\`.
   - Atomic temporary-write and rename prevents partial writes or corrupted state.
   - Automatic backup file rotation ensures redundancy.
`,
      'utf8'
    );
  }

  const specPath = path.resolve(STORAGE_DIR, 'roadmap_spec.json');
  if (!fs.existsSync(specPath)) {
    fs.writeFileSync(
      specPath,
      JSON.stringify(
        {
          appName: 'NovaLauncher',
          engine: 'interact.js v1.10.x',
          dataIntegrity: 'Atomic POSIX JSON DB',
          storageFolder: '/data/storage_folder',
          gridModes: ['80px snap', 'freeform', 'auto-pack'],
          virtualDesktops: 3,
        },
        null,
        2
      ),
      'utf8'
    );
  }
};

seedSampleFiles();

// Atomic JSON Read / Write with Data Integrity
function readDatabase(): any {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const def = getDefaultConfig();
      writeDatabase(def);
      return def;
    }
    const content = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    console.error('Error reading DB, attempting backup recovery...', err);
    if (fs.existsSync(BACKUP_FILE)) {
      const backup = fs.readFileSync(BACKUP_FILE, 'utf8');
      return JSON.parse(backup);
    }
    const def = getDefaultConfig();
    writeDatabase(def);
    return def;
  }
}

function writeDatabase(data: any): boolean {
  try {
    data.lastUpdated = new Date().toISOString();
    const serialized = JSON.stringify(data, null, 2);

    // Maintain rotating backup first
    if (fs.existsSync(DB_FILE)) {
      try {
        fs.copyFileSync(DB_FILE, BACKUP_FILE);
      } catch (copyErr) {
        console.warn('Backup copy warning:', copyErr);
      }
    }

    // Atomic write pattern: write to tmp file then rename
    const tmpFile = `${DB_FILE}.${crypto.randomBytes(4).toString('hex')}.tmp`;
    fs.writeFileSync(tmpFile, serialized, 'utf8');
    fs.renameSync(tmpFile, DB_FILE);
    return true;
  } catch (err) {
    console.error('Failed to write database file:', err);
    return false;
  }
}

// Multer storage for copied files in the launcher folder
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, STORAGE_DIR);
  },
  filename: (_req, file, cb) => {
    // Sanitize and preserve clean readable name with timestamp prefix
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const safeName = `${base}_${Date.now()}${ext}`;
    cb(null, safeName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

async function startServer() {
  const app = express();

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // API: Get Launcher Configuration and Data Integrity Health
  app.get('/api/config', (_req, res) => {
    const config = readDatabase();
    res.json({
      success: true,
      data: config,
      integrity: {
        dbFileExists: fs.existsSync(DB_FILE),
        backupExists: fs.existsSync(BACKUP_FILE),
        dbSizeBytes: fs.existsSync(DB_FILE) ? fs.statSync(DB_FILE).size : 0,
        storageFolder: STORAGE_DIR,
        storageFileCount: fs.existsSync(STORAGE_DIR) ? fs.readdirSync(STORAGE_DIR).length : 0,
      },
    });
  });

  // API: Save Launcher Configuration
  app.post('/api/config', (req, res) => {
    const newConfig = req.body;
    if (!newConfig || typeof newConfig !== 'object') {
      return res.status(400).json({ success: false, error: 'Invalid configuration payload' });
    }

    // Append audit log entry
    if (!Array.isArray(newConfig.auditLog)) {
      newConfig.auditLog = [];
    }
    newConfig.auditLog.unshift({
      id: `log-${Date.now()}`,
      action: 'UPDATE_CONFIG',
      details: `Saved layout with ${newConfig.shortcuts?.length || 0} items across ${newConfig.screens?.length || 0} screens.`,
      timestamp: new Date().toISOString(),
    });
    // Keep max 50 log records
    if (newConfig.auditLog.length > 50) {
      newConfig.auditLog = newConfig.auditLog.slice(0, 50);
    }

    const ok = writeDatabase(newConfig);
    if (!ok) {
      return res.status(500).json({ success: false, error: 'Failed to write configuration file' });
    }

    res.json({
      success: true,
      lastUpdated: newConfig.lastUpdated,
      message: 'Configuration atomically persisted to launcher_db.json',
    });
  });

  // API: Reset to Defaults
  app.post('/api/config/reset', (_req, res) => {
    const def = getDefaultConfig();
    seedSampleFiles();
    writeDatabase(def);
    res.json({ success: true, data: def, message: 'Launcher reset to factory configuration' });
  });

  // API: Upload / Copy File into Launcher Folder
  app.post('/api/files/upload', upload.array('files', 10), (req, res) => {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, error: 'No files provided' });
    }

    const screenId = req.body.screenId || 'screen-1';
    const startX = parseInt(req.body.x, 10) || 60;
    const startY = parseInt(req.body.y, 10) || 120;

    const db = readDatabase();
    const createdShortcuts: any[] = [];

    files.forEach((file, index) => {
      const isImage = file.mimetype.startsWith('image/');
      const isJson = file.mimetype.includes('json') || file.originalname.endsWith('.json');
      const isCode = file.originalname.match(/\.(ts|js|jsx|tsx|html|css|py|sh|md)$/i);

      let iconType = 'File';
      let iconColor = '#06b6d4';
      if (isImage) {
        iconType = 'Image';
        iconColor = '#ec4899';
      } else if (isJson) {
        iconType = 'FileJson';
        iconColor = '#eab308';
      } else if (isCode) {
        iconType = 'FileCode';
        iconColor = '#3b82f6';
      }

      const shortcut = {
        id: `file-${Date.now()}-${index}`,
        title: file.originalname,
        type: 'file',
        screenId,
        x: startX + index * 110,
        y: startY,
        w: 110,
        h: 110,
        color: iconColor,
        icon: iconType,
        fileMeta: {
          filename: file.filename,
          originalName: file.originalname,
          size: file.size,
          mimeType: file.mimetype,
          url: `/api/files/${file.filename}`,
          uploadedAt: new Date().toISOString(),
        },
      };

      createdShortcuts.push(shortcut);
      db.shortcuts.push(shortcut);
    });

    db.auditLog.unshift({
      id: `log-${Date.now()}`,
      action: 'COPY_FILE_TO_FOLDER',
      details: `Copied ${files.length} file(s) into launcher storage folder.`,
      timestamp: new Date().toISOString(),
    });

    writeDatabase(db);

    res.json({
      success: true,
      files: files.map((f) => ({
        filename: f.filename,
        originalName: f.originalname,
        size: f.size,
        mimeType: f.mimetype,
        url: `/api/files/${f.filename}`,
      })),
      createdShortcuts,
      message: `${files.length} file(s) safely copied to launcher folder`,
    });
  });

  // API: Create new text/markdown file directly in the folder
  app.post('/api/files/create-note', (req, res) => {
    const { name, content, screenId, x, y } = req.body;
    const originalName = name || `Note_${Date.now()}.md`;
    const cleanName = originalName.replace(/[^a-zA-Z0-9_.-]/g, '_');
    const safeFilename = `${path.basename(cleanName, path.extname(cleanName))}_${Date.now()}.md`;
    const filePath = path.resolve(STORAGE_DIR, safeFilename);

    const noteBody = content || `# ${cleanName}\nCreated at ${new Date().toLocaleString()}`;
    fs.writeFileSync(filePath, noteBody, 'utf8');

    const db = readDatabase();
    const stat = fs.statSync(filePath);

    const shortcut = {
      id: `file-note-${Date.now()}`,
      title: cleanName,
      type: 'file',
      screenId: screenId || 'screen-1',
      x: x || 80,
      y: y || 80,
      w: 110,
      h: 110,
      color: '#06b6d4',
      icon: 'FileText',
      fileMeta: {
        filename: safeFilename,
        originalName: cleanName,
        size: stat.size,
        mimeType: 'text/markdown',
        url: `/api/files/${safeFilename}`,
        uploadedAt: new Date().toISOString(),
      },
    };

    db.shortcuts.push(shortcut);
    db.auditLog.unshift({
      id: `log-${Date.now()}`,
      action: 'CREATE_NOTE_FILE',
      details: `Created new file '${cleanName}' in storage folder.`,
      timestamp: new Date().toISOString(),
    });

    writeDatabase(db);

    res.json({
      success: true,
      shortcut,
      file: {
        filename: safeFilename,
        size: stat.size,
      },
    });
  });

  // API: List files in the launcher folder
  app.get('/api/files', (_req, res) => {
    try {
      const filenames = fs.readdirSync(STORAGE_DIR);
      const files = filenames.map((name) => {
        const fullPath = path.resolve(STORAGE_DIR, name);
        const stat = fs.statSync(fullPath);
        return {
          filename: name,
          size: stat.size,
          createdAt: stat.birthtime,
          modifiedAt: stat.mtime,
          url: `/api/files/${name}`,
        };
      });
      res.json({ success: true, folder: STORAGE_DIR, files });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // API: Serve / Stream file from internal folder
  app.get('/api/files/:filename', (req, res) => {
    const filename = req.params.filename;
    // Prevent directory traversal
    const safePath = path.resolve(STORAGE_DIR, path.basename(filename));

    if (!fs.existsSync(safePath)) {
      return res.status(404).json({ success: false, error: 'File not found in launcher folder' });
    }

    res.sendFile(safePath);
  });

  // API: Delete file from launcher folder
  app.delete('/api/files/:filename', (req, res) => {
    const filename = req.params.filename;
    const safePath = path.resolve(STORAGE_DIR, path.basename(filename));

    if (fs.existsSync(safePath)) {
      try {
        fs.unlinkSync(safePath);
      } catch (err) {
        console.error('Error unlinking file:', err);
      }
    }

    // Clean from database shortcuts as well
    const db = readDatabase();
    const prevCount = db.shortcuts.length;
    db.shortcuts = db.shortcuts.filter((s: any) => s.fileMeta?.filename !== filename);

    db.auditLog.unshift({
      id: `log-${Date.now()}`,
      action: 'DELETE_FILE',
      details: `Removed file '${filename}' from storage folder.`,
      timestamp: new Date().toISOString(),
    });

    writeDatabase(db);

    res.json({
      success: true,
      deletedFile: filename,
      shortcutsRemoved: prevCount - db.shortcuts.length,
      message: 'File and associated shortcuts removed.',
    });
  });

  // API: Export database for backup
  app.get('/api/database/export', (_req, res) => {
    const db = readDatabase();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="launcher_db_${Date.now()}.json"`);
    res.send(JSON.stringify(db, null, 2));
  });

  // API: Import database
  app.post('/api/database/import', (req, res) => {
    const importedData = req.body;
    if (!importedData || !Array.isArray(importedData.shortcuts)) {
      return res.status(400).json({ success: false, error: 'Invalid database format' });
    }
    importedData.lastUpdated = new Date().toISOString();
    writeDatabase(importedData);
    res.json({ success: true, message: 'Database imported successfully', data: importedData });
  });

  // Mount Vite development middlewares or serve static production build
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[NovaLauncher Server] Running on http://localhost:${PORT}`);
    console.log(`[NovaLauncher Server] Local JSON DB: ${DB_FILE}`);
    console.log(`[NovaLauncher Server] Storage Folder: ${STORAGE_DIR}`);
  });
}

startServer().catch((err) => {
  console.error('[NovaLauncher Server] Fatal start error:', err);
});
