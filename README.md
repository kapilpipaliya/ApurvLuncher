# NovaLauncher Desktop

> A cross-platform, responsive desktop launcher built with **[interact.js](https://interactjs.io)** for customizable draggable and resizable grid shortcuts, dedicated internal folder file copying, and atomic local JSON database persistence for guaranteed data integrity.

---

## Overview

**NovaLauncher** delivers a full desktop and mobile-responsive workspace experience inside the browser. Users can freely arrange app icons, documents, bookmarks, and interactive widgets across virtual screens, resize tiles from compact 1×1 icons to expansive 3×2 dashboards, drop files directly onto the canvas to copy them into the launcher's internal storage vault, and rely on atomic POSIX JSON database commits that ensure zero state corruption.

---

## Key Features

### 1. Draggable & Resizable Grid Shortcuts (`interact.js`)
- **Silky Drag & Drop**: Smooth 60 FPS translation using `interact.js` listeners with live boundary detection.
- **Multi-Edge & Corner Resizing**: Interactive handles allow resizing shortcuts into 1×1 icon tiles, 2×1 banners, 2×2 cards, or 3×2/4×2 wide dashboard widgets.
- **Configurable Grid Snapping**: Built-in snappers (`interact.snappers.grid`) support 60px (dense), 80px (standard), 100px (spacious), or freeform placement.
- **Position Lock & Align All**: Lock specific shortcut coordinates to prevent accidental movement, or trigger one-click alignment across the entire screen.

### 2. Dedicated Folder File Storage (`/data/storage_folder/`)
- **Automatic File Copying**: Dropping files onto the desktop canvas or selecting them via the upload dialog automatically copies and stores them inside the launcher's own dedicated storage directory (`./data/storage_folder/`).
- **Local File Serving**: Stored files are served locally via `/api/files/:filename` with sanitized filenames, preserved metadata, MIME types, and file size tracking.
- **File Manager Vault**: A built-in modal window to inspect, preview, download, and delete files residing in internal storage.

### 3. Data Integrity & Atomic Local JSON Database (`/data/launcher_db.json`)
- **POSIX Atomic Writes**: Every layout change, position update, and shortcut mutation writes first to an isolated temporary file (`launcher_db.json.<hash>.tmp`) before executing an atomic rename (`fs.renameSync`). This eliminates partial writes and file corruption.
- **Rotating Backup Redundancy**: An active backup file (`/data/launcher_db.backup.json`) is updated prior to commits for instant failover recovery.
- **Audit Logging**: Real-time audit trail recording every database mutation, file copy, and layout adjustment with timestamps.
- **Export & Import**: Download the full JSON database file for backups, or import an existing configuration file at any time.

### 4. Virtual Desktop Workspaces
- Multi-screen switcher supporting distinct desktop environments:
  - **Screen 1 — Home Workspace**: Core tools, daily widgets, and system overview.
  - **Screen 2 — Dev & Projects**: Technical documentation, roadmap checklist, and terminal.
  - **Screen 3 — Media & Storage**: Storage vault overview and copied file shortcuts.
- Move any shortcut seamlessly between screens via right-click context menu.

### 5. Built-in Applications & Interactive Widgets
- **Cloud Terminal**: Interactive command line interface with real commands (`help`, `ls`, `cat <file>`, `status`, `neofetch`, `clear`, `exit`).
- **Desk Calculator**: Full mathematical keypad calculator with instant arithmetic operations.
- **Markdown & Note Editor**: Live document scratchpad allowing inline edits that save directly back to the storage folder.
- **Live Clock & Ambient Weather**: Digital clock with real-time seconds, date, and ambient status.
- **System Diagnostics**: Real-time POSIX DB health, memory status, and interact.js engine telemetry.
- **Project Roadmap Checklist**: Interactive task manager stored in the JSON database.
- **Web Explorer**: In-app iframe browser for web shortcuts with direct external tab fallback.

### 6. Sleek Dock & Desktop Customization
- **macOS / iPadOS Style Dock**: Pinned shortcuts with hover tooltips, app drawer trigger, quick terminal launcher, and upload button.
### 7. Cross-Platform PWA & Native Mobile Packaging (Android, iOS, Web)
- **Installable PWA**: Runs as a standalone application on macOS, Windows, Linux, Android, and iOS. Includes an in-app **"Install App"** button in the header with guided iOS Safari home screen instructions.
- **Offline Resilience**: Service worker precaching with Workbox caches core application bundles, Google Fonts, and wallpaper assets for offline use. When network drops, an offline status indicator appears and local storage fallback keeps the launcher interactive.
- **Capacitor Mobile Ready**: Configured with `capacitor.config.ts` (`app.novalauncher.workspace`). The exact same web codebase compiles directly into native Android (`.apk`/`.aab`) and iOS (`.ipa`) applications with zero code changes.

---

## Technical Stack & Architecture

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Draggable / Resizable** | `interact.js v1.10.x` | Native multi-touch and mouse gesture physics, grid snapping, and edge resizing |
| **Frontend Framework** | `React 19` + `TypeScript` | Functional component architecture with ref-based mutation patterns for 60 FPS drag performance |
| **Styling & Theme** | `Tailwind CSS v4` | Modern zero-runtime styling with custom dark variants and typography |
| **Icons & Motion** | `lucide-react`, `motion` | Crisp iconography and micro-interactions |
| **Backend Server** | `Express 4.21` + `Vite` | Full-stack server providing API routes and mounting Vite middleware |
| **File Storage** | `Multer` + `Node.js fs` | Multipart file upload and copy directly into `./data/storage_folder/` |
| **Database** | Local JSON File (`POSIX`) | Atomic JSON persistence with rotating backup at `./data/launcher_db.json` |

> **Note on SolidJS Version 2 Request**: SolidJS v2 is currently in experimental design and RFC phase without an official stable release on npm. This applet is built using the standard React 19 + TypeScript runtime with fine-grained ref-driven updates that maximize interact.js performance.

---

## File Structure

```
├── data/
│   ├── launcher_db.json          # Main atomic JSON database
│   ├── launcher_db.backup.json   # Rotating backup copy
│   └── storage_folder/           # Internal storage folder for copied files
├── src/
│   ├── assets/images/            # High-resolution desktop wallpapers
│   ├── components/
│   │   ├── AddShortcutModal.tsx  # Add App / File / Note / Widget modal
│   │   ├── AppDrawerModal.tsx    # Searchable all-apps drawer
│   │   ├── AppViewerModal.tsx    # Terminal, Calculator, File Editor, Browser
│   │   ├── ContextMenu.tsx       # Desktop & shortcut right-click menus
│   │   ├── Dock.tsx              # Bottom application dock
│   │   ├── EditShortcutModal.tsx # Geometry and property editor
│   │   ├── FileManagerModal.tsx  # Dedicated folder vault manager
│   │   ├── IconRenderer.tsx      # Lucide icon mapping
│   │   ├── SettingsModal.tsx     # Grid, wallpaper, and JSON DB integrity
│   │   ├── ShortcutItem.tsx      # interact.js draggable/resizable card
│   │   └── TopStatusBar.tsx      # Screen switcher & top status bar
│   ├── services/
│   │   └── api.ts                # Client API for config, files, and DB
│   ├── types.ts                  # TypeScript data contracts
│   ├── App.tsx                   # Root workspace orchestrator
│   ├── index.css                 # Tailwind CSS & grid blueprint rules
│   └── main.tsx                  # Application entry point
├── server.ts                     # Express server & Vite middleware
├── package.json
└── README.md
```

---

## API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/config` | Retrieves the entire launcher configuration, shortcuts, and DB integrity stats |
| `POST` | `/api/config` | Atomically persists updated configuration to `launcher_db.json` |
| `POST` | `/api/config/reset` | Resets configuration to factory defaults |
| `POST` | `/api/files/upload` | Copies uploaded files into `/data/storage_folder/` and creates shortcuts |
| `POST` | `/api/files/create-note` | Creates a new text/markdown file directly in storage folder |
| `GET` | `/api/files` | Lists all files inside `/data/storage_folder/` with sizes and dates |
| `GET` | `/api/files/:filename` | Streams/downloads the file from internal storage |
| `DELETE` | `/api/files/:filename` | Deletes file from internal storage and removes matching shortcuts |
| `GET` | `/api/database/export` | Downloads `launcher_db.json` as a JSON attachment |
| `POST` | `/api/database/import` | Validates and restores configuration from an uploaded JSON file |

---

## Getting Started

### Development
```bash
npm run dev
```
Starts the full-stack Express server with Vite middleware on port 3000.

### Production Build
```bash
npm run build
npm run start
```
Compiles client assets to `/dist` and serves them via the production Express server.

### Packaging for Native Mobile (Android APK & iOS IPA)
```bash
# 1. Build the production web bundle
npm run build

# 2. Add native mobile platforms (first time)
npx cap add android
npx cap add ios

# 3. Synchronize web assets with native mobile projects
npx cap sync

# 4. Open project in Android Studio (for APK/AAB) or Xcode (for iOS IPA)
npx cap open android
npx cap open ios
```

---

## License
Apache-2.0
