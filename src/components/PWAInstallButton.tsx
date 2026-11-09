import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X, Share2, PlusSquare } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);

  // If already running in standalone PWA or native container mode, hide prompt
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop PWA Flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        title="Install NovaLauncher on your device"
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 rounded-lg shadow-sm shadow-indigo-600/30 transition-all transform hover:scale-[1.02] active:scale-95 whitespace-nowrap shrink-0"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Install App</span>
      </button>
    );
  }

  // iOS Safari Flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSModal(true)}
          title="Add to Home Screen on iPhone or iPad"
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-lg transition-colors whitespace-nowrap shrink-0"
        >
          <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
          <span>Add to iOS</span>
        </button>

        {showIOSModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700/80 p-6 shadow-2xl text-slate-100 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-indigo-950/80 border border-indigo-700/50 text-indigo-400">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Install on iPhone / iPad</h3>
                    <p className="text-[11px] text-slate-400">Run as full-screen standalone app</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowIOSModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800 text-xs text-slate-300">
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 rounded-lg bg-indigo-900/60 text-indigo-400 shrink-0 mt-0.5">
                    <Share2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-white">Step 1:</span> Tap the <strong>Share</strong> button in the Safari toolbar at the bottom of your screen.
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 rounded-lg bg-cyan-900/60 text-cyan-400 shrink-0 mt-0.5">
                    <PlusSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-white">Step 2:</span> Scroll down and tap <strong>Add to Home Screen</strong>.
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowIOSModal(false)}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-colors shadow-sm"
              >
                Got it
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback direct button for browsers that support install prompt
  return (
    <button
      onClick={() => {
        alert(
          'To install NovaLauncher as an app, use your browser menu (e.g. Chrome ⠇ -> "Install NovaLauncher" or Safari Share -> "Add to Home Screen").'
        );
      }}
      title="Install as Progressive Web App"
      className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
    >
      <Download className="w-3.5 h-3.5 text-slate-400" />
      <span>Install App</span>
    </button>
  );
};
