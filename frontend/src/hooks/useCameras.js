import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const BASE_URL = 'http://localhost:8000';

const ROOM_PRESETS = [
  'Zone A', 'Zone B', 'Zone C',
  'Lobby', 'Vault Room', 'Server Room',
  'Corridor 1', 'Corridor 2', 'Emergency Exit',
  'Reception', 'Manager Office', 'Parking Level 1',
  'Parking Level 2', 'Rooftop', 'Back Office',
];

const createCamera = (id) => ({
  id,
  room: ROOM_PRESETS[id - 1] ?? `Camera ${id}`,
  type: 'IP Camera', // Default
  fireDetected: false,
  online: false,
  lastChecked: null,
});

export function useCameras() {
  // Start with 1 camera, let user add more
  const [cameras, setCameras] = useState([createCamera(1)]);
  const [globalFire, setGlobalFire] = useState(false);

  // Poll all cameras every second
  useEffect(() => {
    const id = setInterval(() => {
      setCameras((currentCameras) => {
        // We do the async fetching inside here but since we don't want to block setCameras...
        // Actually it's better to fetch first, then merge into prev.
        const doPoll = async () => {
          const updated = await Promise.all(
            currentCameras.map(async (cam) => {
              try {
                // Poll the fastAPI backend tracking actual active streams
                const { data } = await axios.get(`${BASE_URL}/status?cam=${encodeURIComponent(cam.type || 'Laptop Camera')}`, { timeout: 900 });
                return {
                  ...cam,
                  fireDetected: data.fire_detected ?? false,
                  online: true,
                  lastChecked: new Date().toTimeString().slice(0, 8),
                };
              } catch {
                // Return just the partial update for offline
                return { online: false, lastChecked: new Date().toTimeString().slice(0, 8) };
              }
            })
          );
          
          setCameras((prev) => {
            const merged = prev.map((cam, i) => ({ ...cam, ...updated[i] }));
            
            // Update global fire status
            setGlobalFire(merged.some(c => c.fireDetected));
            return merged;
          });
        };
        doPoll();
        return currentCameras;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const addCamera = useCallback((customRoomName, customCamId, camType) => {
    setCameras((prev) => {
      // If no custom ID passed, just auto-increment for defaults
      let newId = customCamId ? parseInt(customCamId, 10) : null;
      if (!newId || isNaN(newId)) {
        newId = prev.length > 0 ? Math.max(...prev.map((c) => c.id)) + 1 : 1;
      }

      // Ensure no duplicates by removing previous ones with same ID if any
      const filtered = prev.filter(c => c.id !== newId);
      
      const newCam = createCamera(newId);
      if (customRoomName && customRoomName.trim()) {
        newCam.room = customRoomName.trim();
      }
      if (camType) {
        newCam.type = camType;
      }
      return [...filtered, newCam];
    });
  }, []);

  const removeCamera = useCallback((id) => {
    setCameras((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const renameCamera = useCallback((id, room) => {
    setCameras((prev) => prev.map((c) => (c.id === id ? { ...c, room } : c)));
  }, []);

  const resetCamera = useCallback(async (id) => {
    // We must find the camera to get its type
    setCameras((prev) => {
      const cam = prev.find((c) => c.id === id);
      if (cam) {
        axios.post(`${BASE_URL}/reset?cam=${encodeURIComponent(cam.type || 'Laptop Camera')}`).catch(() => {});
      }
      return prev.map((c) => (c.id === id ? { ...c, fireDetected: false } : c));
    });
    setGlobalFire((prev) => {
      // recheck after reset
      return cameras.some((c) => c.id !== id && c.fireDetected);
    });
  }, [cameras]);

  return {
    cameras,
    globalFire,
    addCamera,
    removeCamera,
    renameCamera,
    resetCamera,
  };
}
