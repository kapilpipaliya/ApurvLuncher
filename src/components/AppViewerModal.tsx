import React, { useState, useEffect } from 'react';
import { Shortcut } from '../types';
import { api } from '../services/api';
import {
  X,
  Maximize2,
  Minimize2,
  Terminal as TerminalIcon,
  Globe,
  Calculator as CalcIcon,
  FileText,
  Save,
  Check,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';

interface AppViewerModalProps {
  shortcut: Shortcut | null;
  onClose: () => void;
  onUpdateContent?: (shortcutId: string, content: string) => void;
  onRefreshAll?: () => void;
}

export const AppViewerModal: React.FC<AppViewerModalProps> = ({
  shortcut,
  onClose,
  onUpdateContent,
  onRefreshAll,
}) => {
  const [isMaximized, setIsMaximized] = useState(false);

  // Terminal state
  const [termInput, setTermInput] = useState('');
  const [termHistory, setTermHistory] = useState<Array<{ cmd: string; output: string }>>([
    {
      cmd: 'welcome',
      output:
        'NovaLauncher System Terminal v2.4\nPowered by interact.js & Atomic JSON Persistence\nType "help" to view available commands.',
    },
  ]);

  // Calculator state
  const [calcDisplay, setCalcDisplay] = useState('0');
  const [calcPrev, setCalcPrev] = useState<number | null>(null);
  const [calcOp, setCalcOp] = useState<string | null>(null);
  const [calcClearNext, setCalcClearNext] = useState(false);

  // Note / File state
  const [fileContent, setFileContent] = useState('');
  const [isSavingFile, setIsSavingFile] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (!shortcut) return;

    // Load file content if it's a file
    if (shortcut.type === 'file' && shortcut.fileMeta?.url) {
      fetch(shortcut.fileMeta.url)
        .then((res) => res.text())
        .then((txt) => setFileContent(txt))
        .catch(() => setFileContent('Failed to load file contents.'));
    } else if (shortcut.content) {
      setFileContent(shortcut.content);
    }
  }, [shortcut]);

  if (!shortcut) return null;

  // Terminal execution
  const handleTerminalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = termInput.trim();
    if (!cmd) return;

    let output = '';
    const parts = cmd.split(' ');
    const main = parts[0].toLowerCase();

    switch (main) {
      case 'help':
        output =
          'Available Commands:\n- help: List commands\n- ls: List files in storage folder\n- cat <filename>: Read file content\n- status: System diagnostics & POSIX DB status\n- neofetch: Display launcher ASCII art & specs\n- clear: Clear terminal output\n- exit: Close terminal';
        break;
      case 'clear':
        setTermHistory([]);
        setTermInput('');
        return;
      case 'exit':
        onClose();
        return;
      case 'status':
        output =
          'STATUS: OK\nEngine: interact.js v1.10.x\nDatabase: /data/launcher_db.json\nStorage: /data/storage_folder/\nIntegrity: POSIX Atomic Durability Active\nMemory: ~38 MB';
        break;
      case 'ls':
        try {
          const res = await api.listStorageFiles();
          if (res.success) {
            output = res.files.map((f) => `${f.filename}  (${f.size} B)`).join('\n');
          } else {
            output = 'Failed to list files.';
          }
        } catch {
          output = 'Error reading directory.';
        }
        break;
      case 'cat':
        if (!parts[1]) {
          output = 'Usage: cat <filename>';
        } else {
          try {
            const res = await fetch(`/api/files/${encodeURIComponent(parts[1])}`);
            if (res.ok) {
              output = await res.text();
            } else {
              output = `File not found: ${parts[1]}`;
            }
          } catch {
            output = `Error reading file ${parts[1]}`;
          }
        }
        break;
      case 'neofetch':
        output = `
  /\\_/\\    NovaLauncher OS
 ( o.o )   OS: NovaLauncher React 19 + TypeScript
  > ^ <    Engine: interact.js Draggable & Resizable Grid
           Persistence: Atomic JSON Database (/data/launcher_db.json)
           Storage: /data/storage_folder/
           Resolution: ${window.innerWidth}x${window.innerHeight}
        `;
        break;
      default:
        output = `Command not recognized: ${cmd}. Type "help" for a list of commands.`;
    }

    setTermHistory((prev) => [...prev, { cmd, output }]);
    setTermInput('');
  };

  // Calculator logic
  const handleCalcNum = (digit: string) => {
    if (calcDisplay === '0' || calcClearNext) {
      setCalcDisplay(digit);
      setCalcClearNext(false);
    } else {
      setCalcDisplay(calcDisplay + digit);
    }
  };

  const handleCalcOp = (op: string) => {
    setCalcPrev(parseFloat(calcDisplay));
    setCalcOp(op);
    setCalcClearNext(true);
  };

  const handleCalcEqual = () => {
    if (calcPrev === null || calcOp === null) return;
    const current = parseFloat(calcDisplay);
    let result = 0;
    switch (calcOp) {
      case '+':
        result = calcPrev + current;
        break;
      case '-':
        result = calcPrev - current;
        break;
      case '*':
        result = calcPrev * current;
        break;
      case '/':
        result = current !== 0 ? calcPrev / current : 0;
        break;
    }
    setCalcDisplay(String(result));
    setCalcPrev(null);
    setCalcOp(null);
    setCalcClearNext(true);
  };

  const handleCalcClear = () => {
    setCalcDisplay('0');
    setCalcPrev(null);
    setCalcOp(null);
    setCalcClearNext(false);
  };

  // Save File or Note content
  const handleSaveFileContent = async () => {
    setIsSavingFile(true);
    setSaveSuccess(false);

    try {
      if (shortcut.type === 'file' && shortcut.fileMeta?.filename) {
        // Create/overwrite file in folder
        await api.createNoteFile(shortcut.fileMeta.filename, fileContent, shortcut.screenId);
      } else if (shortcut.id && onUpdateContent) {
        onUpdateContent(shortcut.id, fileContent);
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
      if (onRefreshAll) onRefreshAll();
    } catch (err) {
      console.error('Failed to save file content:', err);
    } finally {
      setIsSavingFile(false);
    }
  };

  const isTerminal = shortcut.appId === 'terminal';
  const isCalculator = shortcut.appId === 'calculator';
  const isFileOrNote =
    shortcut.type === 'file' ||
    shortcut.type === 'note' ||
    (shortcut.type === 'widget' && (shortcut.widgetType === 'notes' || shortcut.widgetType === 'tasks'));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/70 backdrop-blur-md animate-in fade-in duration-150">
      <div
        className={`bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100 transition-all duration-200 ${
          isMaximized
            ? 'w-full h-full rounded-none'
            : isCalculator
            ? 'w-full max-w-sm h-[520px]'
            : 'w-full max-w-3xl h-[600px] max-h-[92vh]'
        }`}
      >
        {/* Title bar */}
        <div className="px-5 py-3 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between select-none">
          <div className="flex items-center gap-2.5 min-w-0">
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: shortcut.color || '#3b82f6' }}
            />
            <span className="font-bold text-sm text-white truncate">{shortcut.title}</span>
            <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
              [{shortcut.type.toUpperCase()}]
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setIsMaximized(!isMaximized)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Viewer Body */}
        <div className="flex-1 overflow-hidden flex flex-col bg-slate-950/40">
          {/* TERMINAL APP */}
          {isTerminal && (
            <div className="flex-1 flex flex-col p-4 font-mono text-xs bg-slate-950 text-emerald-400 overflow-hidden">
              <div className="flex-1 overflow-y-auto space-y-2 mb-2 pr-1">
                {termHistory.map((item, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center gap-2 text-indigo-400">
                      <span>guest@novalauncher:~$</span>
                      <span className="text-white font-bold">{item.cmd}</span>
                    </div>
                    <pre className="text-slate-300 whitespace-pre-wrap font-mono pl-4 leading-relaxed">
                      {item.output}
                    </pre>
                  </div>
                ))}
              </div>
              <form onSubmit={handleTerminalSubmit} className="flex items-center gap-2 border-t border-slate-800 pt-2">
                <span className="text-indigo-400 font-bold shrink-0">guest@novalauncher:~$</span>
                <input
                  type="text"
                  autoFocus
                  value={termInput}
                  onChange={(e) => setTermInput(e.target.value)}
                  placeholder="Type command ('help', 'ls', 'status')..."
                  className="flex-1 bg-transparent border-none text-white focus:outline-none font-mono text-xs"
                />
              </form>
            </div>
          )}

          {/* CALCULATOR APP */}
          {isCalculator && (
            <div className="flex-1 p-6 flex flex-col justify-between select-none">
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-right">
                <div className="text-[11px] text-slate-500 font-mono h-4">
                  {calcPrev !== null ? `${calcPrev} ${calcOp}` : ''}
                </div>
                <div className="text-4xl font-bold font-mono tracking-tight text-white truncate tabular-nums">
                  {calcDisplay}
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2.5 mt-4">
                <button
                  onClick={handleCalcClear}
                  className="p-3.5 bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 font-bold rounded-2xl text-sm border border-rose-800/40"
                >
                  C
                </button>
                <button
                  onClick={() => setCalcDisplay(String(-parseFloat(calcDisplay)))}
                  className="p-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-2xl text-sm border border-slate-700/60"
                >
                  +/-
                </button>
                <button
                  onClick={() => setCalcDisplay(String(parseFloat(calcDisplay) / 100))}
                  className="p-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-2xl text-sm border border-slate-700/60"
                >
                  %
                </button>
                <button
                  onClick={() => handleCalcOp('/')}
                  className="p-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl text-sm shadow-sm"
                >
                  ÷
                </button>

                {['7', '8', '9'].map((n) => (
                  <button
                    key={n}
                    onClick={() => handleCalcNum(n)}
                    className="p-3.5 bg-slate-800/80 hover:bg-slate-700 text-slate-100 font-bold rounded-2xl text-sm border border-slate-700/40"
                  >
                    {n}
                  </button>
                ))}
                <button
                  onClick={() => handleCalcOp('*')}
                  className="p-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl text-sm shadow-sm"
                >
                  ×
                </button>

                {['4', '5', '6'].map((n) => (
                  <button
                    key={n}
                    onClick={() => handleCalcNum(n)}
                    className="p-3.5 bg-slate-800/80 hover:bg-slate-700 text-slate-100 font-bold rounded-2xl text-sm border border-slate-700/40"
                  >
                    {n}
                  </button>
                ))}
                <button
                  onClick={() => handleCalcOp('-')}
                  className="p-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl text-sm shadow-sm"
                >
                  −
                </button>

                {['1', '2', '3'].map((n) => (
                  <button
                    key={n}
                    onClick={() => handleCalcNum(n)}
                    className="p-3.5 bg-slate-800/80 hover:bg-slate-700 text-slate-100 font-bold rounded-2xl text-sm border border-slate-700/40"
                  >
                    {n}
                  </button>
                ))}
                <button
                  onClick={() => handleCalcOp('+')}
                  className="p-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl text-sm shadow-sm"
                >
                  +
                </button>

                <button
                  onClick={() => handleCalcNum('0')}
                  className="col-span-2 p-3.5 bg-slate-800/80 hover:bg-slate-700 text-slate-100 font-bold rounded-2xl text-sm border border-slate-700/40"
                >
                  0
                </button>
                <button
                  onClick={() => {
                    if (!calcDisplay.includes('.')) setCalcDisplay(calcDisplay + '.');
                  }}
                  className="p-3.5 bg-slate-800/80 hover:bg-slate-700 text-slate-100 font-bold rounded-2xl text-sm border border-slate-700/40"
                >
                  .
                </button>
                <button
                  onClick={handleCalcEqual}
                  className="p-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl text-sm shadow-sm"
                >
                  =
                </button>
              </div>
            </div>
          )}

          {/* FILE OR NOTE VIEWER / EDITOR */}
          {isFileOrNote && !isTerminal && !isCalculator && (
            <div className="flex-1 flex flex-col p-4 overflow-hidden">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
                <span className="text-slate-400 font-mono">
                  {shortcut.fileMeta ? `File: /data/storage_folder/${shortcut.fileMeta.filename}` : 'Interactive Document'}
                </span>
                <button
                  onClick={handleSaveFileContent}
                  disabled={isSavingFile}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  {saveSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Saved!</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>{isSavingFile ? 'Saving...' : 'Save Changes'}</span>
                    </>
                  )}
                </button>
              </div>

              <textarea
                value={fileContent}
                onChange={(e) => setFileContent(e.target.value)}
                placeholder="Write markdown or document text..."
                className="flex-1 w-full p-4 mt-3 bg-slate-950/80 border border-slate-800 rounded-2xl text-slate-200 font-mono text-xs focus:outline-none focus:border-indigo-500 leading-relaxed resize-none"
              />
            </div>
          )}

          {/* WEB BROWSER / URL VIEWER */}
          {!isTerminal && !isCalculator && !isFileOrNote && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Address bar */}
              <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center gap-3 text-xs">
                <div className="flex-1 flex items-center gap-2 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 font-mono truncate">
                  <Globe className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span className="truncate">{shortcut.target || 'https://developer.mozilla.org'}</span>
                </div>
                <a
                  href={shortcut.target || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium flex items-center gap-1.5 shadow-sm transition-colors whitespace-nowrap"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open in Tab</span>
                </a>
              </div>

              <div className="flex-1 bg-white relative">
                <iframe
                  src={shortcut.target || 'https://developer.mozilla.org'}
                  title={shortcut.title}
                  className="w-full h-full border-none"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
