import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Flame, Trash2, PlusCircle, Settings, Video } from 'lucide-react';

export default function AdminPanel({
  cameras, 
  onAdd, 
  onRemove, 
  onRename 
}) {
  const [newRoomDraft, setNewRoomDraft] = useState('');
  const [newCamIdDraft, setNewCamIdDraft] = useState('');
  const [newCamTypeDraft, setNewCamTypeDraft] = useState('Laptop Camera');

  const handleAddSubmit = (e) => {
    e.preventDefault();
    onAdd(newRoomDraft, newCamIdDraft, newCamTypeDraft);
    setNewRoomDraft('');
    setNewCamIdDraft('');
    setNewCamTypeDraft('Laptop Camera');
  };

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden flex flex-col h-full">
      
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
        <div className="flex items-center gap-3">
          <Settings size={18} className="text-sky-400" />
          <h2 className="text-slate-100 font-bold tracking-wide uppercase">System Administration</h2>
        </div>
        <span className="bg-slate-800 text-slate-400 text-xs font-mono px-2 py-0.5 rounded-full">
          {cameras.length} / 15 Cameras Active
        </span>
      </div>

      <div className="p-6 flex flex-col gap-8 flex-1 overflow-y-auto">
        
        {/* ── Add New Camera Form ── */}
        <div className="bg-slate-950/50 p-5 rounded-lg border border-slate-800">
          <h3 className="text-slate-300 text-sm font-semibold mb-3">Add New Camera</h3>
          <form onSubmit={handleAddSubmit} className="flex gap-3 items-center">
            <div className="flex gap-2 flex-1 max-w-lg">
              <div className="relative flex-[2]">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <Video size={14} className="text-slate-500" />
                </div>
                <input
                  type="text"
                  placeholder="Room Name (e.g. Server Room)"
                  value={newRoomDraft}
                  onChange={(e) => setNewRoomDraft(e.target.value)}
                  maxLength={30}
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-500 transition-colors"
                />
              </div>
              <div className="relative flex-1">
                <input
                  type="number"
                  min="1"
                  placeholder="Stream ID (e.g. 1)"
                  value={newCamIdDraft}
                  onChange={(e) => setNewCamIdDraft(e.target.value)}
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-500 transition-colors"
                />
              </div>
              <div className="relative flex-1">
                <select
                  value={newCamTypeDraft}
                  onChange={(e) => setNewCamTypeDraft(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 text-opacity-90 focus:outline-none focus:border-sky-500 transition-colors appearance-none cursor-pointer"
                >
                  <option value="Laptop Camera">Laptop Camera</option>
                  <option value="Desktop Camera">Desktop Camera</option>
                  <option value="Other Camera">Other Camera</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors bg-sky-600 hover:bg-sky-500 text-white cursor-pointer"
            >
              <PlusCircle size={16} />
              Provision Camera
            </button>
          </form>
        </div>

        {/* ── Camera List ── */}
        <div>
          <h3 className="text-slate-300 text-sm font-semibold mb-3">Manage Provisioned Cameras</h3>
          
          <div className="border border-slate-700 rounded-lg overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-800 text-slate-400 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3">Stream ID</th>
                  <th className="px-4 py-3">Source Type</th>
                  <th className="px-4 py-3">Room Assignment</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-900">
                <AnimatePresence>
                  {cameras.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-4 py-8 text-center text-slate-500 font-medium">
                        No cameras provisioned. Add one above.
                      </td>
                    </tr>
                  )}
                  {cameras.map((cam) => (
                    <motion.tr
                      key={cam.id}
                      layout
                      initial={{ opacity: 0, backgroundColor: '#020617' }}
                      animate={{ opacity: 1, backgroundColor: 'transparent' }}
                      exit={{ opacity: 0, backgroundColor: '#450a0a' }}
                      transition={{ duration: 0.2 }}
                      className="hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="px-4 py-3 font-mono text-slate-400">
                        CAM-{String(cam.id).padStart(2, '0')}
                      </td>
                      <td className="px-4 py-3 text-slate-300 text-xs">
                        <span className="bg-slate-800 px-2 py-1 rounded border border-slate-700">
                          {cam.type || 'Laptop Camera'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          value={cam.room}
                          onChange={(e) => onRename(cam.id, e.target.value)}
                          className="bg-transparent border-b border-transparent focus:border-sky-500 text-slate-200 outline-none w-full max-w-[200px]"
                        />
                      </td>
                      <td className="px-4 py-3">
                        {cam.fireDetected ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-950/80 text-red-400 text-xs font-semibold border border-red-800/50">
                            <Flame size={12} /> ALARM
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 text-xs font-semibold border border-emerald-800/40">
                            <ShieldCheck size={12} /> SAFE
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => onRemove(cam.id)}
                          className="p-1.5 rounded-md text-slate-500 hover:bg-red-950 hover:text-red-400 transition-colors"
                          title="Delete Camera"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
