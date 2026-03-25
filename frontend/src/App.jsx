import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Siren, ShieldCheck, ShieldAlert, Flame, Phone, LayoutGrid, Settings, ArrowLeft } from 'lucide-react';
import { useFireStatus } from './hooks/useFireStatus';
import { useCameras }    from './hooks/useCameras';
import LiveStream   from './components/LiveStream';
import Sidebar      from './components/Sidebar';
import Controls     from './components/Controls';
import CameraGrid   from './components/CameraGrid';
import AdminPanel   from './components/AdminPanel';
import './index.css';

export default function App() {
  const {
    cameras, globalFire,
    addCamera, removeCamera, renameCamera, resetCamera
  } = useCameras();
  const { cpuUsage, gpuUsage, latency, activityLog, connected, resetAlarm } = useFireStatus(globalFire);

  const [view,      setView]      = useState('cameras'); // 'cameras' | 'admin'
  const [focusedId, setFocusedId] = useState(null);      // null = grid, number = single view

  const focusedCam   = cameras.find(c => c.id === focusedId) ?? cameras[0];
  const fireDetected = globalFire;

  const audioRef = useRef(null);

  // Play siren when fire detected
  useEffect(() => {
    if (!audioRef.current) return;
    if (fireDetected) {
      audioRef.current.play().catch(() => console.log('Autoplay blocked'));
    } else {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [fireDetected]);

  // Pulse document title on fire
  useEffect(() => {
    document.title = fireDetected
      ? '🔥 FIRE ALERT — Advanced Security'
      : '🛡 Advanced Fire Detection System';
  }, [fireDetected]);

  // When user clicks a camera card, show single view drill-down
  const handleFocusChange = (id) => {
    if (id !== null) {
      setFocusedId(id);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans relative">

      {/* Animated red border on fire */}
      <AnimatePresence>
        {fireDetected && (
          <motion.div
            className="fixed inset-0 pointer-events-none z-50"
            style={{ boxShadow: '0 0 0 4px #dc2626 inset' }}
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 0.7, repeat: Infinity }}
          />
        )}
      </AnimatePresence>

      <audio ref={audioRef} src="https://actions.google.com/sounds/v1/alarms/spaceship_alarm.ogg" loop />

      {/* ════════ HEADER ════════ */}
      <header className="border-b border-slate-800 bg-slate-950/95 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-screen-xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-600/20 border border-red-600/40 flex items-center justify-center">
              <Flame size={18} className="text-red-400" />
            </div>
            <div>
              <h1 className="text-slate-100 font-bold text-base leading-tight tracking-tight">
                Advanced Fire Detection System
              </h1>
              <p className="text-slate-500 text-xs">High-Security Surveillance Console v2.0</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* View toggle tabs */}
            <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg p-1 gap-1">
              <button
                onClick={() => setView('cameras')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors
                  ${view === 'cameras' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <LayoutGrid size={12} /> Cameras
              </button>
              <div className="w-px h-4 bg-slate-700 mx-1"></div>
              <button
                onClick={() => setView('admin')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors
                  ${view === 'admin' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-indigo-300'}`}
              >
                <Settings size={12} /> Admin
              </button>
            </div>

            {/* Global status badge */}
            <AnimatePresence mode="wait">
              {fireDetected ? (
                <motion.div key="alert"
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-950 border border-red-500"
                  initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                >
                  <motion.div className="siren-bounce"><Siren size={16} className="text-red-400" /></motion.div>
                  <span className="text-red-300 text-xs font-bold tracking-widest uppercase">Alert Active</span>
                </motion.div>
              ) : (
                <motion.div key="safe"
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-950/60 border border-emerald-700"
                  initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                >
                  <ShieldCheck size={16} className="text-emerald-400" />
                  <span className="text-emerald-300 text-xs font-bold tracking-widest uppercase">All Systems Normal</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* ════════ EMERGENCY BANNER ════════ */}
      <AnimatePresence>
        {fireDetected && (
          <motion.div
            className="bg-red-700 border-b border-red-500"
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="max-w-screen-xl mx-auto px-6 py-2.5 flex items-center justify-center gap-4">
              <motion.div animate={{ rotate: [0, -15, 15, 0] }} transition={{ duration: 0.4, repeat: Infinity }}>
                <ShieldAlert size={20} className="text-white" />
              </motion.div>
              <p className="text-white font-bold text-sm tracking-widest uppercase">
                🚨 FIRE DETECTED — CALLING EMERGENCY CONTACTS
              </p>
              <div className="flex items-center gap-1.5">
                <Phone size={14} className="text-red-200" />
                <motion.span className="text-red-200 text-xs font-mono"
                  animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 0.8, repeat: Infinity }}>
                  Dialing 911…
                </motion.span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ════════ MAIN CONTENT ════════ */}
      <main className="max-w-screen-xl mx-auto px-6 py-6">
        <AnimatePresence mode="wait">

          {/* ── CAMERAS VIEW (Grid or Single Drill-down) ── */}
          {view === 'cameras' && (
            <motion.div
              key="cameras"
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <div className="lg:col-span-2 flex flex-col gap-6">
                
                {focusedId ? (
                  /* Single Camera Drill-down */
                  <>
                    <div className="flex items-center justify-between bg-slate-900 border border-slate-700 rounded-xl px-4 py-3">
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => setFocusedId(null)}
                          className="flex items-center gap-1.5 text-slate-400 hover:text-sky-400 transition-colors text-sm font-semibold"
                        >
                          <ArrowLeft size={16} /> Back to Grid
                        </button>
                        <div className="w-px h-4 bg-slate-700"></div>
                        <span className="text-slate-200 text-sm font-mono">
                          CAM-{String(focusedCam.id).padStart(2, '0')} · {focusedCam.room}
                        </span>
                      </div>
                    </div>
                    <LiveStream 
                      fireDetected={focusedCam?.fireDetected ?? false} 
                      camType={focusedCam?.type ?? 'Laptop Camera'} 
                      roomName={focusedCam?.room ?? 'Unknown'} 
                      camId={focusedCam?.id ?? 1}
                    />
                    <Controls fireDetected={focusedCam?.fireDetected ?? false} onReset={() => resetCamera(focusedCam?.id)} />
                  </>
                ) : (
                  /* Grid Overview */
                  <CameraGrid
                    cameras={cameras}
                    globalFire={globalFire}
                    onAdd={addCamera}
                    onRemove={removeCamera}
                    onRename={renameCamera}
                    onReset={resetCamera}
                    focusedId={focusedId}
                    onFocusChange={handleFocusChange}
                  />
                )}

              </div>

              {/* Right: Sidebar */}
              <div className="lg:col-span-1">
                <Sidebar
                  cpuUsage={cpuUsage}
                  gpuUsage={gpuUsage}
                  latency={latency}
                  activityLog={activityLog}
                  connected={connected}
                />
              </div>
            </motion.div>
          )}

          {/* ── ADMIN VIEW ── */}
          {view === 'admin' && (
            <motion.div
              key="admin"
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <div className="lg:col-span-2">
                <AdminPanel
                  cameras={cameras}
                  onAdd={addCamera}
                  onRemove={removeCamera}
                  onRename={renameCamera}
                />
              </div>
              <div className="lg:col-span-1">
                <Sidebar
                  cpuUsage={cpuUsage}
                  gpuUsage={gpuUsage}
                  latency={latency}
                  activityLog={activityLog}
                  connected={connected}
                />
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* ════════ FOOTER ════════ */}
      <footer className="border-t border-slate-800 mt-6">
        <div className="max-w-screen-xl mx-auto px-6 py-3 flex items-center justify-between">
          <span className="text-slate-600 text-xs font-mono">ADVANCED-FIRE-SYS © 2026</span>
          <div className="flex items-center gap-1.5">
            <motion.div className="w-2 h-2 rounded-full bg-emerald-500"
              animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity }} />
            <span className="text-slate-600 text-xs font-mono">
              {cameras.length} camera{cameras.length !== 1 ? 's' : ''} · same fire model · polling every 1 s
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
