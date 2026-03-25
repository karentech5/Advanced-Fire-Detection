import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, ShieldCheck, Wifi, WifiOff, Pencil, X, Check, Video } from 'lucide-react';

const BASE_URL = 'http://localhost:8000';

export default function CameraCard({ camera, onRemove, onRename, onReset, onClick, isSelected }) {
  const [editing, setEditing] = useState(false);
  const [draft,   setDraft]   = useState(camera.room);

  const submitRename = () => {
    const trimmed = draft.trim();
    if (trimmed) onRename(camera.id, trimmed);
    setEditing(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.88 }}
      transition={{ duration: 0.25 }}
      onClick={() => !editing && onClick(camera)}
      className={`relative cursor-pointer rounded-xl overflow-hidden border transition-all
        ${camera.fireDetected
          ? 'border-red-500 shadow-lg shadow-red-900/40'
          : isSelected
            ? 'border-sky-500 shadow-sky-900/30'
            : 'border-slate-700 hover:border-slate-500'
        }
      `}
    >
      {/* Fire alert flash overlay */}
      {camera.fireDetected && (
        <motion.div
          className="absolute inset-0 bg-red-600/20 z-10 pointer-events-none"
          animate={{ opacity: [0.2, 0, 0.2] }}
          transition={{ duration: 0.7, repeat: Infinity }}
        />
      )}

      {/* Video feed thumbnail */}
      <div className="relative aspect-video bg-slate-950">
        <img
          src={`${BASE_URL}/video_feed?cam=${encodeURIComponent(camera.type || 'Laptop Camera')}`}
          alt={`${camera.room} feed`}
          className="w-full h-full object-cover"
          onError={e => { e.target.style.display = 'none'; }}
        />

        {/* Scan-line texture */}
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.15) 2px,rgba(0,0,0,.15) 4px)' }}
        />

        {/* Header overlay */}
      <div className="absolute top-0 inset-x-0 p-3 bg-gradient-to-b from-black/80 to-transparent z-20 pointer-events-none flex justify-between items-start">
        <div className="flex flex-col gap-0.5 pointer-events-auto">
          <div className="flex items-center gap-2">
            <Video size={12} className="text-slate-300" />
            <span className="text-white text-xs font-semibold tracking-wide drop-shadow-md">
              {camera.room}
            </span>
            <span className="bg-slate-800/80 border border-slate-600/50 text-sky-300 text-[9px] px-1.5 py-0.5 rounded font-mono uppercase">
              {camera.type || 'Laptop Camera'}
            </span>
          </div>
          <span className="text-slate-400 text-[10px] font-mono pl-5 drop-shadow">
            ID: CAM-{String(camera.id).padStart(2, '0')}
          </span>
        </div>
        <div className="pointer-events-auto">
          {camera.online
            ? <Wifi    size={12} className="text-emerald-400" />
            : <WifiOff size={12} className="text-slate-600"   />
          }
        </div>
      </div>

        {/* NO SIGNAL text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-slate-700 text-xs font-mono">NO SIGNAL</span>
        </div>

        {/* Fire badge / Safe badge */}
        {camera.fireDetected ? (
          <motion.div
            className="absolute bottom-1.5 left-1.5 flex items-center gap-1 bg-red-700/90 px-2 py-0.5 rounded-full z-20"
            animate={{ opacity: [1, 0.6, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            <Flame size={10} className="text-white" />
            <span className="text-white text-[10px] font-bold">FIRE</span>
          </motion.div>
        ) : (
          <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1 bg-emerald-700/80 px-2 py-0.5 rounded-full z-20">
            <ShieldCheck size={10} className="text-white" />
            <span className="text-white text-[10px] font-bold tracking-wide">SAFE</span>
          </div>
        )}
      </div>

      {/* Footer bar */}
      <div className={`px-3 py-2 flex items-center justify-between gap-2
        ${camera.fireDetected ? 'bg-red-950/80' : 'bg-slate-900'}`}
        onClick={e => e.stopPropagation()}
      >
        {/* Room name / edit field */}
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          {camera.fireDetected
            ? <Flame       size={12} className="text-red-400 flex-shrink-0" />
            : <ShieldCheck size={12} className="text-emerald-400 flex-shrink-0" />
          }

          <AnimatePresence mode="wait">
            {editing ? (
              <input
                key="input"
                autoFocus
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') submitRename(); if (e.key === 'Escape') setEditing(false); }}
                className="flex-1 bg-slate-800 border border-slate-600 rounded px-2 py-0.5 text-slate-200 text-xs font-medium focus:outline-none focus:border-sky-500"
                onClick={e => e.stopPropagation()}
              />
            ) : (
              <span key="label" className="text-slate-200 text-xs font-medium truncate">{camera.room}</span>
            )}
          </AnimatePresence>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {editing ? (
            <button onClick={submitRename} className="p-1 rounded hover:bg-emerald-700/50 text-emerald-400">
              <Check size={11} />
            </button>
          ) : (
            <button onClick={() => { setDraft(camera.room); setEditing(true); }}
              className="p-1 rounded hover:bg-slate-700 text-slate-500 hover:text-slate-300">
              <Pencil size={11} />
            </button>
          )}
          <button onClick={() => onRemove(camera.id)}
            className="p-1 rounded hover:bg-red-900/60 text-slate-600 hover:text-red-400">
            <X size={11} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
