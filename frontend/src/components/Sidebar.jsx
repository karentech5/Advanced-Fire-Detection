import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Cpu, Zap, Wifi, CheckCircle2, AlertTriangle, Flame, RotateCcw, Info } from 'lucide-react';

const LOG_STYLES = {
  danger:  { icon: Flame,          color: 'text-red-400',    bg: 'bg-red-950/60',    dot: 'bg-red-500'     },
  warning: { icon: AlertTriangle,  color: 'text-yellow-400', bg: 'bg-yellow-950/60', dot: 'bg-yellow-400'  },
  success: { icon: RotateCcw,      color: 'text-emerald-400',bg: 'bg-emerald-950/60',dot: 'bg-emerald-400' },
  info:    { icon: Info,           color: 'text-sky-400',    bg: 'bg-sky-950/50',    dot: 'bg-sky-400'     },
};

function GaugeBar({ label, value, color }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-slate-400 text-xs font-medium">{label}</span>
        <span className="text-slate-200 text-xs font-mono font-bold">{value}%</span>
      </div>
      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

export default function Sidebar({ cpuUsage, gpuUsage, latency, activityLog, connected }) {
  const logRef = useRef(null);

  // Auto-scroll to top when new entries arrive
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = 0;
  }, [activityLog.length]);

  const latencyColor =
    latency < 50  ? 'text-emerald-400' :
    latency < 150 ? 'text-yellow-400'  : 'text-red-400';

  const cpuBarColor =
    cpuUsage < 60 ? 'bg-emerald-500' :
    cpuUsage < 85 ? 'bg-yellow-500'  : 'bg-red-500';

  const gpuBarColor =
    gpuUsage < 60 ? 'bg-sky-500' :
    gpuUsage < 85 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="flex flex-col gap-4 h-full">

      {/* ── Connection Status ── */}
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700">
        <motion.div
          className={`w-2.5 h-2.5 rounded-full ${connected ? 'bg-emerald-400' : 'bg-red-500'}`}
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <Wifi size={14} className={connected ? 'text-emerald-400' : 'text-red-400'} />
        <span className="text-xs font-medium text-slate-300">
          {connected ? 'Backend Connected' : 'Backend Offline (mock mode)'}
        </span>
      </div>

      {/* ── System Health ── */}
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Cpu size={14} className="text-sky-400" />
          <h3 className="text-slate-200 text-sm font-semibold tracking-wide uppercase">System Health</h3>
        </div>

        <GaugeBar label="CPU Usage"  value={cpuUsage} color={cpuBarColor} />
        <GaugeBar label="GPU Usage"  value={gpuUsage} color={gpuBarColor} />

        {/* Latency */}
        <div className="flex justify-between items-center pt-1 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <Zap size={12} className="text-yellow-400" />
            <span className="text-slate-400 text-xs font-medium">Connection Latency</span>
          </div>
          <motion.span
            key={latency}
            className={`text-xs font-mono font-bold ${latencyColor}`}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {latency} ms
          </motion.span>
        </div>

        {/* Uptime mock */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={12} className="text-emerald-400" />
            <span className="text-slate-400 text-xs font-medium">System Uptime</span>
          </div>
          <span className="text-emerald-400 text-xs font-mono">99.98%</span>
        </div>
      </div>

      {/* ── Activity Log ── */}
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 flex flex-col flex-1 min-h-0">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-slate-200 text-sm font-semibold tracking-wide uppercase">Activity Log</h3>
          <span className="text-slate-500 text-xs font-mono">{activityLog.length} events</span>
        </div>

        <div
          ref={logRef}
          className="flex-1 overflow-y-auto space-y-1.5 pr-1"
          style={{ maxHeight: '340px', scrollbarWidth: 'thin', scrollbarColor: '#334155 transparent' }}
        >
          {activityLog.map((entry, idx) => {
            const style = LOG_STYLES[entry.type] ?? LOG_STYLES.info;
            const Icon  = style.icon;
            return (
              <motion.div
                key={entry.id}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg ${style.bg}`}
                initial={idx === 0 ? { opacity: 0, x: -10 } : false}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25 }}
              >
                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${style.dot}`} />
                <Icon size={12} className={`flex-shrink-0 ${style.color}`} />
                <span className={`text-xs font-medium flex-1 ${style.color}`}>{entry.event}</span>
                <span className="text-slate-600 text-xs font-mono flex-shrink-0">{entry.time}</span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
