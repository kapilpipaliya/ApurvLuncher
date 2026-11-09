# Cross-Platform PWA & Capacitor Desktop Workspace Launcher

A comprehensive architectural blueprint to transform NovaLauncher into a high-performance cross-platform application capable of running seamlessly across Android, iOS, and the modern Web using Progressive Web App (PWA) standards and Capacitor native containerization.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural decisions were confirmed during the interactive interview:

- **Application Category**: Productivity & Desktop Workspace Launcher featuring draggable, resizable shortcuts powered by `interact.js`.
- **Target Cross-Platform Strategy**: **Progressive Web App (PWA) with Capacitor Packaging**. This approach guarantees a single unified codebase in TypeScript + React 19 that runs natively in web browsers while compiling directly into native Android (`.apk`/`.aab`) and iOS (`.ipa`) binaries via Capacitor.
- **Rollout Priority**: **Instant web deployment with full offline caching and in-app install prompts**, followed by Capacitor build pipelines for Google Play Store and Apple App Store deployment.

---

## 1. Overview & Core Concept

### What It Delivers
A unified workspace experience that functions as a rich desktop launcher in desktop browser viewports and transforms into a native home-screen launcher on Android and iOS devices. The application features:
- **Zero-Friction Web Delivery**: Users can visit the web URL and immediately use the full app without installing anything.
- **Native Installation Prompt**: One-tap installation on Android/Chromium desktops and guided home screen addition on iOS Safari.
- **Offline Reliability**: Service worker pre-caching ensures the workspace, widgets, calculator, terminal, and local files remain interactive even in flight mode or spotty connectivity.
- **Native App Packaging (Capacitor)**: A single `capacitor.config.ts` configuration enables compiling the exact same code into native Android Studio and Xcode projects without rewriting any UI or logic.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **First Launch & Install Prompt**:
   - The user visits the app on desktop, mobile Safari, or mobile Chrome.
   - An intuitive, non-intrusive **"Install App"** button appears in the top navigation bar.
   - On Chrome/Android, clicking triggers the native browser prompt; on iOS Safari, a guided sheet explains how to tap *Share* → *Add to Home Screen*.
2. **Standalone Fullscreen Experience**:
   - Once launched from the home screen, all browser chrome disappears (`display: standalone`), rendering a true native OS full-bleed canvas.
3. **Offline & Network Transitions**:
   - When the user goes offline, a discreet status indicator appears (`Offline Mode — Using Cached Data & Local Storage`).
   - File editing, local JSON configuration edits, and shortcut re-arrangements continue to work smoothly via IndexedDB and local browser fallback storage.
4. **Desktop vs. Mobile Responsive Ergonomics**:
   - **Desktop (≥ 1024px)**: Expanded 1440px workspace grid with multi-column widgets, custom wallpaper overlays, and floating dock.
   - **Mobile (≤ 768px)**: Adaptive thumb-zone layout with bottom-sheet modals, touch-expanded 48px hitboxes, and swipable screen tabs.

### Visual Identity & Theme
- **Display Typography**: `Plus Jakarta Sans` for clean, contemporary brand typography and system navigation.
- **Monospace Typography**: `JetBrains Mono` for tabular figures (`tabular-nums`), coordinates, file sizes, and terminal logs.
- **Color Discipline**: 60% deep obsidian/slate canvas (`#020617` / `#0f172a`), 30% structural surface containers with 1px hairline borders (`#1e293b`), and 10% high-intent indigo/cyan accent budget.
- **PWA Branding Assets**: High-contrast brand icons generated at 192×192, 512×512, and 180×180 (`apple-touch-icon.png`), plus dedicated maskable icon margins.

---

## 3. Key Product Decisions & Trade-Offs

### Decision 1: PWA + Capacitor vs. Flutter vs. React Native
- **Chosen Approach**: PWA + Capacitor.
- **Why**: Allows instant zero-download web distribution on Day 1, while providing 100% code reuse for native iOS and Android store packages. Neither Flutter nor React Native provides equivalent web fidelity for HTML5 file drag-and-drop, full-screen DOM rendering, and interact.js gesture mechanics without complex platform forks.
- **Alternatives Considered**: 
  - *React Native with Expo*: Excellent for mobile, but web output often feels sluggish with DOM canvas drag-and-drop.
  - *Flutter*: Heavy initial web bundle size (~15MB CanvasKit download) and unidiomatic web text selection.

### Decision 2: Offline Data Integrity & Storage Dual-Engine
- **Chosen Approach**: Hybrid Server Storage + Client-Side IndexedDB / Cache Storage.
- **Why**: When connected to the Express backend, files and JSON configurations persist atomically on the server disk. When running installed on mobile or offline, a client-side database layer mirrors all shortcuts and local files, syncing seamlessly when connectivity resumes.

---

## 4. Technical Architecture & Component Hierarchy

### System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CROSS-PLATFORM DISTRIBUTION                     │
│  [ Web Browser ]         [ Android App (Capacitor) ]    [ iOS (Capacitor) ]│
└───────────────┬────────────────────────────┬───────────────────────────┘
                │                            │
                ▼                            ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     PROGRESSIVE WEB APP RUNTIME                        │
│  ┌─────────────────────────┐          ┌─────────────────────────────┐  │
│  │ Web App Manifest        │          │ Service Worker (Workbox)    │  │
│  │ - standalone display    │          │ - Precache HTML/JS/CSS      │  │
│  │ - 192/512px icons       │          │ - Offline CacheFirst routes │  │
│  └─────────────────────────┘          └─────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌────────────────────────────────────────────────────────────────────────┐
│                    REACT 19 + INTERACT.JS APPLICATION                  │
│  ┌────────────────────────┐  ┌──────────────────────────────────────┐  │
│  │ Top Navigation Bar     │  │ Desktop Workspace Canvas             │  │
│  │ - Screen Switcher      │  │ - interact.js Draggable & Resizable  │  │
│  │ - PWA Install Trigger  │  │ - 60/80/100px Grid Snapper Engine    │  │
│  │ - Offline Status Banner│  │ - Dropzone for File Vault Copying    │  │
│  └────────────────────────┘  └──────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Pinned Ergonomic Dock (Terminal, Calculator, Files, Apps)        │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────┬────────────────────────────────────────┘
                                │
                                ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     DATA PERSISTENCE & VAULT                           │
│  ┌────────────────────────────────────┐ ┌───────────────────────────┐  │
│  │ POSIX Atomic Local JSON Database   │ │ Internal Storage Folder   │  │
│  │ /data/launcher_db.json + backup    │ │ /data/storage_folder/     │  │
│  └────────────────────────────────────┘ └───────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Step-by-Step Implementation Strategy

1. **Step 1: Install PWA Tooling & Configure Manifest**:
   - Install `vite-plugin-pwa` as a dev dependency.
   - Configure `vite.config.ts` with `VitePWA` plugin, auto-update service worker, and caching rules for Google Fonts, local wallpapers, and scripts.
   - Ensure `devOptions.enabled: true` for preview verification.
2. **Step 2: Generate PWA Icons & HTML Head Compliance**:
   - Create Web App Manifest icons (`pwa-192x192.png`, `pwa-512x512.png`, `pwa-maskable-512x512.png`, `apple-touch-icon.png`, `icon.svg`).
   - Update `index.html` with mobile status bar meta tags, theme color, and apple touch icon links.
3. **Step 3: Implement In-App Install Hook & UI (`PWAInstallButton`)**:
   - Build `usePWAInstall` hook listening to `beforeinstallprompt` and `appinstalled` events.
   - Mount `PWAInstallButton` in `TopStatusBar` with automatic suppression when in standalone mode and guided iOS modal instructions.
4. **Step 4: Implement Offline Indicator & Storage Mirroring**:
   - Create `useOnlineStatus` hook and non-intrusive `OfflineIndicator` banner.
   - Add IndexedDB client cache fallback for offline shortcut reading and editing.
5. **Step 5: Setup Capacitor Native Mobile Configuration**:
   - Provide `capacitor.config.ts` specification with bundle identifier `app.novalauncher.workspace`, app name `NovaLauncher`, and web asset directory `dist`.
   - Document the exact terminal commands (`npx cap add android`, `npx cap add ios`, `npx cap sync`) in `README.md` for zero-friction mobile compilation.
6. **Step 6: Build Verification & Testing**:
   - Co-execute `compile_applet` and `lint_applet` to ensure zero compilation or type issues.
