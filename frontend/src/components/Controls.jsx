import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Bell, BellOff, ShieldAlert, ShieldCheck } from 'lucide-react';

export default function Controls({ fireDetected, onReset }) {
  const [sirenOn,   setSirenOn]   = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleReset = async () => {
    setResetting(true);
    await onReset();
    setTimeout(() => setResetting(false), 1200);
  };

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 space-y-5">
      <div className="flex items-center gap-2">
        {fireDetected
          ? <ShieldAlert size={16} className="text-red-400" />
          : <ShieldCheck  size={16} className="text-emerald-400" />
        }
        <h3 className="text-slate-200 text-sm font-semibold tracking-wide uppercase">System Controls</h3>
      </div>

      {/* ── RESET ALARM ── */}
      <motion.button
        id="reset-alarm-btn"
        onClick={handleReset}
        disabled={resetting}
        whileTap={{ scale: 0.96 }}
        whileHover={{ scale: 1.02 }}
        className={`w-full flex items-center justify-center gap-3 py-4 rounded-xl font-bold text-sm tracking-widest uppercase transition-all
          ${fireDetected
            ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/50 border border-red-400'
            : 'bg-slate-700 hover:bg-slate-600 text-slate-300 border border-slate-600'
          }
          ${resetting ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <motion.div
          animate={resetting ? { rotate: 360 } : { rotate: 0 }}
          transition={resetting ? { duration: 0.8, repeat: Infinity, ease: 'linear' } : {}}
        >
          <RotateCcw size={18} />
        </motion.div>
        {resetting ? 'Resetting…' : 'Reset Alarm'}
      </motion.button>

      {/* ── MANUAL SIREN TOGGLE ── */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2.5">
          <AnimatePresence mode="wait">
            {sirenOn
              ? <motion.div key="on"  initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                  <Bell size={16} className="text-yellow-400" />
                </motion.div>
              : <motion.div key="off" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                  <BellOff size={16} className="text-slate-500" />
                </motion.div>
            }
          </AnimatePresence>
          <span className="text-slate-300 text-sm font-medium">Manual Siren</span>
        </div>

        {/* Toggle Switch */}
        <motion.button
          id="siren-toggle"
          role="switch"
          aria-checked={sirenOn}
          onClick={() => setSirenOn(v => !v)}
          className={`relative w-12 h-6 rounded-full transition-colors ${sirenOn ? 'bg-yellow-500' : 'bg-slate-700'}`}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md"
            animate={{ left: sirenOn ? '26px' : '2px' }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        </motion.button>
      </div>

      {/* Siren active indicator */}
      <AnimatePresence>
        {sirenOn && (
          <motion.div
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-950/60 border border-yellow-800"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={  { opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="w-2 h-2 rounded-full bg-yellow-400"
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            />
            <span className="text-yellow-300 text-xs font-medium">Manual siren is ACTIVE</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
