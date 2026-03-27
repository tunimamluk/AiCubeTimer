import { useRef, useCallback } from 'react';

export function useStackmat({ onStart, onStop }) {
  const contextRef = useRef(null);
  const streamRef = useRef(null);
  const analyzerRef = useRef(null);
  const micLevelIntervalRef = useRef(null);
  const runningRef = useRef(false);
  const lastTimeRef = useRef(0);
  const packetBufferRef = useRef([]);

  const getMicLevel = useCallback(() => {
    if (!analyzerRef.current) return 0;
    const data = new Uint8Array(analyzerRef.current.frequencyBinCount);
    analyzerRef.current.getByteFrequencyData(data);
    const avg = data.reduce((a, b) => a + b, 0) / data.length;
    return Math.min(100, (avg / 128) * 100);
  }, []);

  const init = useCallback(async (onLevel) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      contextRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyzer = ctx.createAnalyser();
      analyzer.fftSize = 256;
      analyzerRef.current = analyzer;
      source.connect(analyzer);

      micLevelIntervalRef.current = setInterval(() => {
        onLevel?.(getMicLevel());
      }, 100);

      return true;
    } catch {
      return false;
    }
  }, [getMicLevel]);

  const stop = useCallback(() => {
    clearInterval(micLevelIntervalRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (contextRef.current) {
      contextRef.current.close();
      contextRef.current = null;
    }
    analyzerRef.current = null;
    runningRef.current = false;
    packetBufferRef.current = [];
  }, []);

  return { init, stop, getMicLevel };
}
