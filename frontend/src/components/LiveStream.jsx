import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Radio, ShieldCheck } from 'lucide-react';

const BASE_URL = 'http://localhost:8000';

export default function LiveStream({ fireDetected, camType = 'Laptop Camera', roomName = 'Unit A', camId = 1 }) {
  const [timestamp, setTimestamp] = useState('');

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTimestamp(now.toLocaleString('en-US', {
        hour12: false,
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
      }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-slate-700 bg-slate-900 shadow-2xl">
      {/* Video Feed */}
      <div className="relative aspect-video w-full bg-slate-950 flex items-center justify-center">
        <img
          src={`${BASE_URL}/video_feed?cam=${encodeURIComponent(camType)}`}
          alt="Main Live Feed"
          className="w-full h-full object-cover"
          onError={e => { e.target.style.display = 'none'; }}
        />

        {/* Fallback overlay when stream is unavailable */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="grid grid-cols-8 gap-1 opacity-5">
            {Array.from({ length: 64 }).map((_, i) => (
              <div key={i} className="w-2 h-2 rounded-full bg-slate-400" />
            ))}
          </div>
          <p className="absolute text-slate-600 text-sm font-mono">NO SIGNAL</p>
        </div>

        {/* Corner scan lines */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)' }}
        />

        {/* Alert flash overlay */}
        {fireDetected && (
          <motion.div
            className="absolute inset-0 bg-red-600"
            animate={{ opacity: [0, 0.15, 0] }}
            transition={{ duration: 0.6, repeat: Infinity }}
          />
        )}

        {/* LIVE Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-slate-600">
          <motion.div
            className="w-2.5 h-2.5 rounded-full bg-emerald-400"
            animate={{ opacity: [1, 0.2, 1] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <span className="text-emerald-400 text-xs font-bold tracking-widest">LIVE</span>
          <Radio size={12} className="text-emerald-400" />
        </div>

        {/* Camera label */}
        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-slate-600">
          <p className="text-slate-300 text-xs font-mono">CAM-{String(camId).padStart(2,'0')} · {roomName.toUpperCase()}</p>
        </div>

        {/* Timestamp */}
        <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-slate-700">
          <p className="text-slate-200 text-xs font-mono tracking-widest">{timestamp}</p>
        </div>

        {/* REC indicator */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-slate-700">
          <motion.div
            className="w-2 h-2 rounded-full bg-red-500"
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
          <span className="text-red-400 text-xs font-mono">REC</span>
        </div>
      </div>

      {/* Alert Banner below feed */}
      {fireDetected && (
        <motion.div
          className="bg-red-900/80 border-t border-red-500 px-4 py-2 flex items-center gap-3"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <motion.div
            className="w-3 h-3 rounded-full bg-red-400"
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 0.4, repeat: Infinity }}
          />
          <p className="text-red-200 text-sm font-semibold tracking-wider">
            ⚠ FIRE DETECTED — EMERGENCY SERVICES NOTIFIED
          </p>
        </motion.div>
      )}

      {/* Normal Banner below feed */}
      {!fireDetected && (
        <div className="bg-emerald-950/40 border-t border-emerald-900/50 px-4 py-2 flex items-center gap-3">
          <ShieldCheck size={14} className="text-emerald-500" />
          <p className="text-emerald-400 text-sm font-semibold tracking-wider">
            NO FIRE DETECTED — SYSTEM SAFE
          </p>
        </div>
      )}
    </div>
  );
}
