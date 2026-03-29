import { useState, useRef, useCallback, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { generateScramble } from '../utils/scramble';

export function useTimer({ disabled = false } = {}) {
  const { settings, addSolve } = useApp();
  const settingsRef = useRef(settings);
  useEffect(() => { settingsRef.current = settings; }, [settings]);

  const [timerState, setTimerState] = useState('idle');
  const [isHolding, setIsHolding] = useState(false);
  const [displayTime, setDisplayTime] = useState(0);
  const [inspectionRemaining, setInspectionRemaining] = useState(15);
  const [scramble, setScramble] = useState(() => generateScramble(settings.scrambleLength));

  const stateRef = useRef('idle');
  const startTimeRef = useRef(0);
  const timerIntervalRef = useRef(null);
  const inspectionIntervalRef = useRef(null);
  const holdTimeoutRef = useRef(null);
  const isDownRef = useRef(false);
  const scrambleRef = useRef(scramble);
  const addSolveRef = useRef(addSolve);
  useEffect(() => { addSolveRef.current = addSolve; }, [addSolve]);

  const setState = useCallback((s) => {
    stateRef.current = s;
    setTimerState(s);
  }, []);

  const nextScramble = useCallback(() => {
    const s = generateScramble(settingsRef.current.scrambleLength);
    scrambleRef.current = s;
    setScramble(s);
  }, []);

  const startTimer = useCallback(() => {
    if (inspectionIntervalRef.current) {
      clearInterval(inspectionIntervalRef.current);
      inspectionIntervalRef.current = null;
    }
    setInspectionRemaining(15);
    startTimeRef.current = Date.now();
    setState('running');
    timerIntervalRef.current = setInterval(() => {
      setDisplayTime(Date.now() - startTimeRef.current);
    }, 10);
  }, [setState]);

  const stopTimer = useCallback(() => {
    clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = null;
    const elapsed = Date.now() - startTimeRef.current;
    setDisplayTime(elapsed);
    if (settingsRef.current.autoSave) {
      addSolveRef.current({
        time: elapsed,
        scramble: scrambleRef.current,
        timestamp: Date.now(),
        penalty: 'ok',
      });
    }
    setIsHolding(false);
    setState('idle');
    nextScramble();
  }, [setState, nextScramble]);

  const startInspection = useCallback(() => {
    setState('inspection');
    let remaining = 15;
    setInspectionRemaining(remaining);
    inspectionIntervalRef.current = setInterval(() => {
      remaining -= 1;
      setInspectionRemaining(remaining);
      if (remaining <= 0) {
        clearInterval(inspectionIntervalRef.current);
        inspectionIntervalRef.current = null;
        setState('idle');
      }
    }, 1000);
  }, [setState]);

  // Keyboard handler — re-registers whenever relevant settings change
  const { holdTime, inputSource, inspectionEnabled } = settings;
  useEffect(() => {
    if (disabled) return;
    const onKeyDown = (e) => {
      if (e.code !== 'Space') return;
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') return;
      if (inputSource === 'stackmat') return;
      e.preventDefault();
      if (isDownRef.current) return;
      isDownRef.current = true;

      if (stateRef.current === 'running') {
        stopTimer();
        return;
      }

      if (stateRef.current === 'inspection') {
        if (inspectionIntervalRef.current) {
          clearInterval(inspectionIntervalRef.current);
          inspectionIntervalRef.current = null;
        }
        setState('ready');
        return;
      }

      if (stateRef.current === 'idle') {
        setIsHolding(true);
        const ht = (holdTime || 0) * 1000;
        if (ht > 0) {
          holdTimeoutRef.current = setTimeout(() => {
            if (isDownRef.current) {
              if (inspectionEnabled) {
                startInspection();
              } else {
                setState('ready');
              }
            }
          }, ht);
        } else {
          if (inspectionEnabled) {
            startInspection();
          } else {
            setState('ready');
          }
        }
      }
    };

    const onKeyUp = (e) => {
      if (e.code !== 'Space') return;
      if (inputSource === 'stackmat') return;
      e.preventDefault();
      isDownRef.current = false;

      if (holdTimeoutRef.current) {
        clearTimeout(holdTimeoutRef.current);
        holdTimeoutRef.current = null;
      }

      if (stateRef.current === 'ready') {
        startTimer();
      } else if (stateRef.current !== 'running' && stateRef.current !== 'inspection') {
        setIsHolding(false);
        setState('idle');
      }
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
    };
  }, [disabled, startTimer, stopTimer, startInspection, setState, holdTime, inputSource, inspectionEnabled]);

  // Penalty keybinds (1/2/3) — exposed via a penalty callback set by SolveInfoModal
  const penaltyCallbackRef = useRef(null);
  const setPenaltyCallback = useCallback((fn) => {
    penaltyCallbackRef.current = fn;
  }, []);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
      if (stateRef.current === 'running') return;
      if (e.key === '1' || e.key === '2' || e.key === '3') {
        e.preventDefault();
        const map = { '1': 'ok', '2': 'plus2', '3': 'dnf' };
        penaltyCallbackRef.current?.(map[e.key]);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  // Touch support
  const bindTouchArea = useCallback((el) => {
    if (!el) return;
    const onTouchStart = (e) => {
      if (e.target.closest('button') || e.target.closest('.scramble-display')) return;
      if (settingsRef.current.inputSource === 'stackmat') return;
      e.preventDefault();
      if (isDownRef.current) return;
      isDownRef.current = true;

      if (stateRef.current === 'running') {
        stopTimer();
        return;
      }
      if (stateRef.current === 'idle' || stateRef.current === 'stopped') {
        const holdTime = (settingsRef.current.holdTime || 0) * 1000;
        holdTimeoutRef.current = setTimeout(() => {
          if (isDownRef.current) setState('ready');
        }, holdTime);
      } else if (stateRef.current === 'inspection') {
        if (inspectionIntervalRef.current) {
          clearInterval(inspectionIntervalRef.current);
          inspectionIntervalRef.current = null;
        }
        setState('ready');
      }
    };
    const onTouchEnd = (e) => {
      if (e.target.closest('button') || e.target.closest('.scramble-display')) return;
      if (settingsRef.current.inputSource === 'stackmat') return;
      isDownRef.current = false;
      if (holdTimeoutRef.current) { clearTimeout(holdTimeoutRef.current); holdTimeoutRef.current = null; }
      if (stateRef.current === 'ready') startTimer();
    };
    el.addEventListener('touchstart', onTouchStart, { passive: false });
    el.addEventListener('touchend', onTouchEnd);
    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [startTimer, stopTimer, setState]);

  return {
    timerState,
    isHolding,
    displayTime,
    inspectionRemaining,
    scramble,
    nextScramble,
    setPenaltyCallback,
    bindTouchArea,
  };
}
