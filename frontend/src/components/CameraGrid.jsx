import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle, LayoutGrid, Flame, ShieldCheck, Video } from 'lucide-react';
import CameraCard from './CameraCard';

const GRID_COLS = {
  1:  'grid-cols-1',
  2:  'grid-cols-2',
  3:  'grid-cols-2 md:grid-cols-3',
  4:  'grid-cols-2',
  6:  'grid-cols-2 md:grid-cols-3',
  12: 'grid-cols-3 md:grid-cols-4',
};

function getGridCols(count) {
  if (count === 1)  return 'grid-cols-1';
  if (count <= 4)   return 'grid-cols-2';
  if (count <= 9)   return 'grid-cols-2 md:grid-cols-3';
  return 'grid-cols-3 md:grid-cols-4 lg:grid-cols-5';
}

export default function CameraGrid({
  cameras, globalFire,
  onAdd, onRemove, onRename, onReset,
  focusedId, onFocusChange,
}) {
  const alertCount = cameras.filter(c => c.fireDetected).length;

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden">

      {/* ── Grid Header ── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <LayoutGrid size={15} className="text-sky-400" />
          <h2 className="text-slate-200 text-sm font-semibold tracking-wide uppercase">
            Camera Network
          </h2>
          <span className="bg-slate-800 text-slate-400 text-xs font-mono px-2 py-0.5 rounded-full">
            {cameras.length} Active
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Alert summary pill */}
          <AnimatePresence>
            {alertCount > 0 && (
              <motion.div
                className="flex items-center gap-1.5 bg-red-950 border border-red-600 px-3 py-1 rounded-full"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <motion.div
                  className="w-1.5 h-1.5 rounded-full bg-red-400"
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                />
                <Flame size={11} className="text-red-400" />
                <span className="text-red-300 text-xs font-bold">
                  {alertCount} {alertCount === 1 ? 'Alert' : 'Alerts'}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Camera Grid ── */}
      <div className="p-4">
        <motion.div
          layout
          className={`grid gap-3 ${getGridCols(cameras.length)}`}
        >
          <AnimatePresence>
            {cameras.map((cam) => (
              <CameraCard
                key={cam.id}
                camera={cam}
                isSelected={focusedId === cam.id}
                onRemove={onRemove}
                onRename={onRename}
                onReset={onReset}
                onClick={(c) => onFocusChange(c.id === focusedId ? null : c.id)}
              />
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Empty state */}
        {cameras.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Video size={32} className="text-slate-700 mb-3" />
            <p className="text-slate-600 text-sm">No cameras added yet.</p>
            <p className="text-slate-700 text-xs mt-1">Click "Add Camera" to get started.</p>
          </div>
        )}
      </div>

      {/* ── Status Bar ── */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={12} className="text-emerald-400" />
            <span className="text-slate-500 text-xs">
              {cameras.filter(c => !c.fireDetected).length} safe
            </span>
          </div>
          {alertCount > 0 && (
            <div className="flex items-center gap-1.5">
              <Flame size={12} className="text-red-400" />
              <span className="text-red-400 text-xs font-medium">{alertCount} in alert</span>
            </div>
          )}
        </div>
        <span className="text-slate-700 text-xs font-mono">Same model · all cameras</span>
      </div>
    </div>
  );
}
