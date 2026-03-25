import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const BASE_URL = 'http://localhost:8000';

const MOCK_LOG = [
  { id: 1, event: 'System Online',     type: 'info',    time: '00:00:01' },
  { id: 2, event: 'Camera Feed Active', type: 'info',   time: '00:00:03' },
];

export function useFireStatus(globalFire) {
  const [cpuUsage,     setCpuUsage]     = useState(34);
  const [gpuUsage,     setGpuUsage]     = useState(51);
  const [latency,      setLatency]      = useState(18);
  const [activityLog,  setActivityLog]  = useState(MOCK_LOG);
  const [connected,    setConnected]    = useState(false);
  const logIdRef    = useRef(3);
  const lastFireRef = useRef(false);

  const appendLog = (event, type) => {
    const now = new Date();
    const time = now.toTimeString().slice(0, 8);
    setActivityLog(prev => [
      { id: logIdRef.current++, event, type, time },
      ...prev.slice(0, 49),
    ]);
  };

  useEffect(() => {
    if (globalFire && !lastFireRef.current) {
      appendLog('FIRE DETECTED!',       'danger');
      appendLog('Calling Emergency...',   'danger');
    } else if (!globalFire && lastFireRef.current) {
      appendLog('Hazard Cleared — SAFE', 'success');
    }
    lastFireRef.current = !!globalFire;
  }, [globalFire]);

  useEffect(() => {
    const poll = async () => {
      const t0 = performance.now();
      try {
        const { data } = await axios.get(`${BASE_URL}/status`, { timeout: 900 });
        const ping = Math.round(performance.now() - t0);
        setCpuUsage(    data.cpu_usage    ?? Math.round(20 + Math.random() * 60));
        setGpuUsage(    data.gpu_usage    ?? Math.round(30 + Math.random() * 50));
        setLatency(ping);
        setConnected(true);
      } catch {
        // Backend offline – keep UI alive with mock drift
        setConnected(false);
        setCpuUsage(v => Math.min(99, Math.max(5, v + (Math.random() > 0.5 ? 1 : -1))));
        setGpuUsage(v => Math.min(99, Math.max(5, v + (Math.random() > 0.5 ? 1 : -1))));
        setLatency(v => Math.min(999, v + Math.round((Math.random() - 0.3) * 5)));
      }
    };

    poll();
    const id = setInterval(poll, 1000);
    return () => clearInterval(id);
  }, []);

  const resetAlarm = async () => {
    try {
      await axios.post(`${BASE_URL}/reset`);
      setFireDetected(false);
    } catch {
      setFireDetected(false); // optimistic reset
    }
  };

  return { cpuUsage, gpuUsage, latency, activityLog, connected, resetAlarm };
}
