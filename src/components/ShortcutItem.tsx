import React, { useEffect, useRef, useState } from 'react';
import interact from 'interactjs';
import { Shortcut } from '../types';
import { IconRenderer } from './IconRenderer';
import {
  MoreVertical,
  Lock,
  ExternalLink,
  Check,
  HardDrive,
  FileText,
  Clock,
  Cpu,
} from 'lucide-react';

interface ShortcutItemProps {
  shortcut: Shortcut;
  gridSnap: boolean;
  gridCellSize: number;
  isSelected: boolean;
  onSelect: (shortcut: Shortcut, e: React.MouseEvent) => void;
  onLaunch: (shortcut: Shortcut) => void;
  onUpdatePosition: (id: string, x: number, y: number) => void;
  onUpdateSize: (id: string, w: number, h: number, x: number, y: number) => void;
  onContextMenu: (shortcut: Shortcut, e: React.MouseEvent) => void;
}

export const ShortcutItem: React.FC<ShortcutItemProps> = ({
  shortcut,
  gridSnap,
  gridCellSize,
  isSelected,
  onSelect,
  onLaunch,
  onUpdatePosition,
  onUpdateSize,
  onContextMenu,
}) => {
  const itemRef = useRef<HTMLDivElement>(null);
  const [isInteracting, setIsInteracting] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Live timer for clock widget
  useEffect(() => {
    if (shortcut.type === 'widget' && shortcut.widgetType === 'clock_weather') {
      const interval = setInterval(() => setCurrentTime(new Date()), 1000);
      return () => clearInterval(interval);
    }
  }, [shortcut.type, shortcut.widgetType]);

  // Track drag distance to distinguish clicks from drags
  const interactionStateRef = useRef({
    hasMoved: false,
    initialX: shortcut.x,
    initialY: shortcut.y,
    currentX: shortcut.x,
    currentY: shortcut.y,
    currentW: shortcut.w,
    currentH: shortcut.h,
  });

  // Keep state ref updated with props
  useEffect(() => {
    interactionStateRef.current.currentX = shortcut.x;
    interactionStateRef.current.currentY = shortcut.y;
    interactionStateRef.current.currentW = shortcut.w;
    interactionStateRef.current.currentH = shortcut.h;
  }, [shortcut.x, shortcut.y, shortcut.w, shortcut.h]);

  useEffect(() => {
    const element = itemRef.current;
    if (!element) return;

    if (shortcut.isLocked) {
      interact(element).unset();
      return;
    }

    const interactable = interact(element);

    // Grid snap modifier config
    const snapModifiers = gridSnap
      ? [
          interact.modifiers.snap({
            targets: [interact.snappers.grid({ x: gridCellSize, y: gridCellSize })],
            range: Infinity,
            relativePoints: [{ x: 0, y: 0 }],
          }),
        ]
      : [];

    const snapSizeModifiers = gridSnap
      ? [
          interact.modifiers.snapSize({
            targets: [interact.snappers.grid({ x: gridCellSize, y: gridCellSize })],
          }),
        ]
      : [];

    // DRAGGABLE CONFIG
    interactable.draggable({
      inertia: false,
      autoScroll: false,
      modifiers: [
        ...snapModifiers,
        interact.modifiers.restrictRect({
          restriction: 'parent',
          endOnly: false,
        }),
      ],
      listeners: {
        start() {
          setIsInteracting(true);
          interactionStateRef.current.hasMoved = false;
        },
        move(event) {
          interactionStateRef.current.hasMoved = true;
          const newX = interactionStateRef.current.currentX + event.dx;
          const newY = interactionStateRef.current.currentY + event.dy;

          interactionStateRef.current.currentX = newX;
          interactionStateRef.current.currentY = newY;

          element.style.transform = `translate3d(${newX}px, ${newY}px, 0)`;
        },
        end() {
          setIsInteracting(false);
          if (interactionStateRef.current.hasMoved) {
            onUpdatePosition(
              shortcut.id,
              Math.max(0, Math.round(interactionStateRef.current.currentX)),
              Math.max(0, Math.round(interactionStateRef.current.currentY))
            );
          }
        },
      },
    });

    // RESIZABLE CONFIG
    interactable.resizable({
      edges: { left: true, right: true, bottom: true, top: true },
      modifiers: [
        interact.modifiers.restrictSize({
          min: { width: 80, height: 80 },
          max: { width: 900, height: 700 },
        }),
        ...snapSizeModifiers,
      ],
      listeners: {
        start() {
          setIsInteracting(true);
          interactionStateRef.current.hasMoved = false;
        },
        move(event) {
          interactionStateRef.current.hasMoved = true;
          let { x, y } = event.deltaRect;

          const newW = event.rect.width;
          const newH = event.rect.height;
          const newX = interactionStateRef.current.currentX + x;
          const newY = interactionStateRef.current.currentY + y;

          interactionStateRef.current.currentW = newW;
          interactionStateRef.current.currentH = newH;
          interactionStateRef.current.currentX = newX;
          interactionStateRef.current.currentY = newY;

          element.style.width = `${newW}px`;
          element.style.height = `${newH}px`;
          element.style.transform = `translate3d(${newX}px, ${newY}px, 0)`;
        },
        end() {
          setIsInteracting(false);
          if (interactionStateRef.current.hasMoved) {
            onUpdateSize(
              shortcut.id,
              Math.max(80, Math.round(interactionStateRef.current.currentW)),
              Math.max(80, Math.round(interactionStateRef.current.currentH)),
              Math.max(0, Math.round(interactionStateRef.current.currentX)),
              Math.max(0, Math.round(interactionStateRef.current.currentY))
            );
          }
        },
      },
    });

    return () => {
      interactable.unset();
    };
  }, [shortcut.id, shortcut.isLocked, gridSnap, gridCellSize, onUpdatePosition, onUpdateSize]);

  // Click vs Drag detection
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (interactionStateRef.current.hasMoved) {
      interactionStateRef.current.hasMoved = false;
      return;
    }
    onSelect(shortcut, e);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLaunch(shortcut);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onContextMenu(shortcut, e);
  };

  // Render Widget / Card Content
  const renderContent = () => {
    // 1. Clock & Weather Widget
    if (shortcut.type === 'widget' && shortcut.widgetType === 'clock_weather') {
      const timeStr = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const dateStr = currentTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
      return (
        <div className="w-full h-full p-4 flex flex-col justify-between bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-700/60 shadow-lg text-slate-100 select-none overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Time & Ambient
            </span>
            <span className="text-xs text-slate-400 font-mono">22°C Clear</span>
          </div>
          <div>
            <div className="text-3xl font-bold tracking-tight font-mono tabular-nums text-white">
              {timeStr}
            </div>
            <div className="text-xs text-slate-400 mt-1">{dateStr}</div>
          </div>
          <div className="text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-800 pt-1.5">
            <span>Desktop Workspace</span>
            <span className="text-emerald-400">Sync Active</span>
          </div>
        </div>
      );
    }

    // 2. System Stats Widget
    if (shortcut.type === 'widget' && shortcut.widgetType === 'system_stats') {
      return (
        <div className="w-full h-full p-4 flex flex-col justify-between bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-700/60 shadow-lg text-slate-100 select-none overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5" /> System Diagnostics
            </span>
            <span className="text-[10px] font-mono text-emerald-400 px-1.5 py-0.5 bg-emerald-950/60 border border-emerald-800/40 rounded">
              POSIX ATOMIC
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 my-1">
            <div className="bg-slate-800/60 p-2 rounded-lg border border-slate-700/40">
              <div className="text-[10px] text-slate-400 uppercase">Engine</div>
              <div className="text-sm font-bold text-slate-200 truncate">interact.js v1.10</div>
            </div>
            <div className="bg-slate-800/60 p-2 rounded-lg border border-slate-700/40">
              <div className="text-[10px] text-slate-400 uppercase">Persistence</div>
              <div className="text-sm font-bold text-emerald-300 truncate">launcher_db.json</div>
            </div>
          </div>
          <div className="text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800 pt-1">
            <span>Storage: Dedicated Folder</span>
            <span className="text-indigo-300 font-mono">100% Integrity</span>
          </div>
        </div>
      );
    }

    // 3. Scratchpad Notes Widget
    if (shortcut.type === 'widget' && shortcut.widgetType === 'notes') {
      return (
        <div className="w-full h-full p-3.5 flex flex-col bg-amber-950/40 backdrop-blur-md rounded-2xl border border-amber-700/40 shadow-lg text-slate-100 select-none overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" /> {shortcut.title}
            </span>
            <span className="text-[10px] text-amber-400/80 font-mono">Quick Note</span>
          </div>
          <div className="flex-1 text-xs text-amber-100/90 whitespace-pre-wrap font-sans overflow-hidden leading-relaxed opacity-90 line-clamp-6">
            {shortcut.content || 'Click to edit quick scratchpad note...'}
          </div>
          <div className="text-[10px] text-amber-400/70 border-t border-amber-900/40 pt-1.5 mt-2 flex justify-between">
            <span>Double click to edit</span>
            <span>Saved to DB</span>
          </div>
        </div>
      );
    }

    // 4. Todo / Task Checklist Widget
    if (shortcut.type === 'widget' && shortcut.widgetType === 'tasks') {
      let tasks: any[] = [];
      try {
        tasks = shortcut.content ? JSON.parse(shortcut.content) : [];
      } catch {
        tasks = [];
      }
      return (
        <div className="w-full h-full p-3.5 flex flex-col bg-purple-950/40 backdrop-blur-md rounded-2xl border border-purple-700/40 shadow-lg text-slate-100 select-none overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-purple-300 flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" /> {shortcut.title}
            </span>
            <span className="text-[10px] text-purple-400/80 font-mono">
              {tasks.filter((t) => t.done).length}/{tasks.length} Done
            </span>
          </div>
          <div className="flex-1 space-y-1.5 overflow-hidden text-xs">
            {tasks.slice(0, 4).map((task: any) => (
              <div key={task.id} className="flex items-center gap-2 text-slate-300">
                <span
                  className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[10px] ${
                    task.done ? 'bg-purple-600 text-white' : 'border border-purple-400/50'
                  }`}
                >
                  {task.done && '✓'}
                </span>
                <span className={`truncate ${task.done ? 'line-through text-slate-500' : ''}`}>
                  {task.text}
                </span>
              </div>
            ))}
          </div>
          <div className="text-[10px] text-purple-400/70 border-t border-purple-900/40 pt-1 mt-1">
            Double click to expand checklist
          </div>
        </div>
      );
    }

    // 5. Storage Vault Overview Widget
    if (shortcut.type === 'widget' && shortcut.widgetType === 'storage_vault') {
      return (
        <div className="w-full h-full p-4 flex flex-col justify-between bg-cyan-950/40 backdrop-blur-md rounded-2xl border border-cyan-700/40 shadow-lg text-slate-100 select-none overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-cyan-300 flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5" /> Internal File Vault
            </span>
            <span className="text-[10px] font-mono text-cyan-400">/data/storage_folder</span>
          </div>
          <div className="bg-cyan-900/20 p-2.5 rounded-xl border border-cyan-800/30 text-xs space-y-1">
            <div className="text-slate-300">Local folder storage for all copied files</div>
            <div className="text-slate-400 text-[11px]">
              Drop files anywhere on desktop to copy into launcher folder.
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-cyan-400 border-t border-cyan-900/40 pt-2">
            <span>Browse Vault Files</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </div>
        </div>
      );
    }

    // 6. Standard App / File / URL / Note Icon Tile
    const isFile = shortcut.type === 'file';
    const isUrl = shortcut.type === 'url';
    const isWideBanner = shortcut.w >= 160 && shortcut.h < 150;
    const isLargeTile = shortcut.w >= 180 && shortcut.h >= 160;

    return (
      <div
        className={`w-full h-full flex transition-all duration-150 ${
          isWideBanner
            ? 'flex-row items-center gap-3 p-3 bg-slate-900/70 backdrop-blur-md rounded-2xl border border-slate-700/50 shadow-md'
            : isLargeTile
            ? 'flex-col justify-between p-3.5 bg-slate-900/70 backdrop-blur-md rounded-2xl border border-slate-700/50 shadow-md'
            : 'flex-col items-center justify-center p-2 rounded-2xl group-hover:bg-white/5'
        }`}
      >
        {/* Icon Emblem */}
        <div
          className={`flex items-center justify-center rounded-2xl shadow-lg transition-transform group-hover:scale-105 ${
            isWideBanner ? 'w-12 h-12 shrink-0' : isLargeTile ? 'w-12 h-12' : 'w-14 h-14 mb-2'
          }`}
          style={{
            backgroundColor: shortcut.color || '#3b82f6',
            boxShadow: `0 8px 20px -4px ${(shortcut.color || '#3b82f6')}55`,
          }}
        >
          <IconRenderer name={shortcut.icon} className="w-7 h-7 text-white" />
        </div>

        {/* Text Details */}
        <div
          className={`flex flex-col ${
            isWideBanner ? 'flex-1 min-w-0' : isLargeTile ? 'mt-2 min-w-0' : 'items-center text-center max-w-full'
          }`}
        >
          <div className="text-xs font-semibold text-slate-100 truncate w-full drop-shadow">
            {shortcut.title}
          </div>
          {isFile && shortcut.fileMeta && (
            <div className="text-[10px] text-slate-400 font-mono truncate">
              {(shortcut.fileMeta.size / 1024).toFixed(1)} KB · Copied
            </div>
          )}
          {isUrl && (
            <div className="text-[10px] text-blue-300 truncate font-mono">
              {shortcut.target?.replace(/^https?:\/\//, '')}
            </div>
          )}
          {!isFile && !isUrl && isWideBanner && (
            <div className="text-[10px] text-slate-400 truncate">Application shortcut</div>
          )}
        </div>

        {/* Extra indicators on large tiles */}
        {isLargeTile && (
          <div className="text-[10px] text-slate-500 flex items-center justify-between border-t border-slate-800/80 pt-1.5 mt-auto">
            <span>{shortcut.type.toUpperCase()}</span>
            <span>{shortcut.w}×{shortcut.h}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      ref={itemRef}
      id={`shortcut-${shortcut.id}`}
      data-x={shortcut.x}
      data-y={shortcut.y}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
      className={`interact-item group absolute select-none cursor-grab active:cursor-grabbing transition-shadow ${
        isInteracting ? 'opacity-90 z-40 scale-[1.01] shadow-2xl ring-2 ring-indigo-500' : ''
      } ${isSelected ? 'ring-2 ring-indigo-400 ring-offset-2 ring-offset-slate-950 z-30' : 'z-10'}`}
      style={{
        width: `${shortcut.w}px`,
        height: `${shortcut.h}px`,
        transform: `translate3d(${shortcut.x}px, ${shortcut.y}px, 0)`,
        position: 'absolute',
        top: 0,
        left: 0,
      }}
    >
      {renderContent()}

      {/* Lock Indicator */}
      {shortcut.isLocked && (
        <div className="absolute top-1.5 right-1.5 bg-slate-900/80 p-1 rounded-full text-slate-400">
          <Lock className="w-2.5 h-2.5" />
        </div>
      )}

      {/* Quick Context Menu trigger icon */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onContextMenu(shortcut, e);
        }}
        aria-label="Shortcut menu"
        className="opacity-0 group-hover:opacity-100 focus:opacity-100 absolute top-1 right-1 p-1 bg-slate-900/90 text-slate-300 hover:text-white rounded-lg shadow border border-slate-700/60 transition-opacity"
      >
        <MoreVertical className="w-3.5 h-3.5" />
      </button>

      {/* Resize Handle Grids (Interact.js resizable edges/corners) */}
      {!shortcut.isLocked && (
        <>
          {/* Bottom Right Resize Handle Indicator */}
          <div
            title="Drag to resize (interact.js)"
            className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-0.5 right-0.5 w-4 h-4 cursor-se-resize flex items-end justify-end p-0.5 pointer-events-auto"
          >
            <div className="w-2 h-2 border-r-2 border-b-2 border-indigo-400 rounded-br-sm" />
          </div>

          {/* Selection Dimension Tag */}
          {isSelected && (
            <div className="absolute -top-6 left-0 bg-slate-900/90 text-[10px] font-mono text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-500/30 whitespace-nowrap pointer-events-none shadow">
              {shortcut.w} × {shortcut.h} px · ({shortcut.x}, {shortcut.y})
            </div>
          )}
        </>
      )}
    </div>
  );
};
