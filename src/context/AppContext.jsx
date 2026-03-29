import { createContext, useContext, useState, useEffect } from 'react';

const DEFAULT_SETTINGS = {
  inputSource: 'keyboard',
  inspectionEnabled: false,
  holdTime: 0.3,
  scrambleLength: 20,
  autoSave: true,
  confirmDelete: true,
  timerColor: null,
  timerFont: "'Courier New', monospace",
  backgroundImage: null,
  autoDeleteBelow: 0,
};

const DEFAULT_SESSIONS = {
  session1: [], session2: [], session3: [], session4: [],
};

const DEFAULT_NAMES = {
  session1: 'Session 1', session2: 'Session 2',
  session3: 'Session 3', session4: 'Session 4',
};

export const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      const s = localStorage.getItem('timerSettings');
      return s ? { ...DEFAULT_SETTINGS, ...JSON.parse(s) } : DEFAULT_SETTINGS;
    } catch { return DEFAULT_SETTINGS; }
  });

  const [sessions, setSessions] = useState(() => {
    try {
      const s = localStorage.getItem('sessions');
      return s ? JSON.parse(s) : DEFAULT_SESSIONS;
    } catch { return DEFAULT_SESSIONS; }
  });

  const [sessionNames, setSessionNames] = useState(() => {
    try {
      const s = localStorage.getItem('sessionNames');
      return s ? JSON.parse(s) : DEFAULT_NAMES;
    } catch { return DEFAULT_NAMES; }
  });

  const [currentSession, setCurrentSession] = useState(() => {
    try {
      const saved = localStorage.getItem('sessionNames');
      const names = saved ? JSON.parse(saved) : DEFAULT_NAMES;
      const keys = Object.keys(names);
      return keys[0] || 'session1';
    } catch { return 'session1'; }
  });

  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  const toggleTheme = (e) => {
    const next = theme === 'light' ? 'dark' : 'light';
    if (!document.startViewTransition) { setTheme(next); return; }
    const x = e?.clientX ?? window.innerWidth / 2;
    const y = e?.clientY ?? 0;
    const maxR = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
    document.documentElement.style.setProperty('--vt-x', `${x}px`);
    document.documentElement.style.setProperty('--vt-y', `${y}px`);
    document.documentElement.style.setProperty('--vt-r', `${maxR}px`);
    document.startViewTransition(() => setTheme(next));
  };

  // Persist
  useEffect(() => {
    localStorage.setItem('timerSettings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('sessionNames', JSON.stringify(sessionNames));
  }, [sessionNames]);

  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Apply CSS variables from settings
  useEffect(() => {
    if (settings.timerColor) {
      document.documentElement.style.setProperty('--timer-custom-color', settings.timerColor);
    } else {
      document.documentElement.style.removeProperty('--timer-custom-color');
    }
    document.documentElement.style.setProperty(
      '--timer-font', settings.timerFont || "'Courier New', monospace"
    );
    if (settings.backgroundImage) {
      document.documentElement.style.setProperty('--main-bg-image', `url(${settings.backgroundImage})`);
    } else {
      document.documentElement.style.removeProperty('--main-bg-image');
    }
  }, [settings.timerColor, settings.timerFont, settings.backgroundImage]);

  const updateSettings = (updates) => setSettings(prev => ({ ...prev, ...updates }));

  const addSolve = (solve) => {
    if (settings.autoDeleteBelow > 0) {
      const penalty = solve.penalty || 'ok';
      const t = penalty === 'plus2' ? solve.time + 2000 : solve.time;
      if (penalty !== 'dnf' && t < settings.autoDeleteBelow * 1000) return;
    }
    setSessions(prev => ({
      ...prev,
      [currentSession]: [solve, ...(prev[currentSession] || [])],
    }));
  };

  const deleteSolve = (index) => {
    setSessions(prev => ({
      ...prev,
      [currentSession]: prev[currentSession].filter((_, i) => i !== index),
    }));
  };

  const updateSolvePenalty = (index, penalty) => {
    setSessions(prev => ({
      ...prev,
      [currentSession]: prev[currentSession].map((s, i) =>
        i === index ? { ...s, penalty } : s
      ),
    }));
  };

  const createSession = () => {
    let i = 1;
    while (sessionNames[`session${i}`]) i++;
    const id = `session${i}`;
    const name = `Session ${i}`;
    setSessions(prev => ({ ...prev, [id]: [] }));
    setSessionNames(prev => ({ ...prev, [id]: name }));
    setCurrentSession(id);
  };

  const renameSession = (id, name) => {
    setSessionNames(prev => ({ ...prev, [id]: name }));
  };

  const deleteSession = (id) => {
    const keys = Object.keys(sessions).filter(k => k !== id);
    if (keys.length === 0) return;
    setSessions(prev => { const n = { ...prev }; delete n[id]; return n; });
    setSessionNames(prev => { const n = { ...prev }; delete n[id]; return n; });
    if (currentSession === id) setCurrentSession(keys[0]);
  };

  const clearSession = (id) => {
    setSessions(prev => ({ ...prev, [id]: [] }));
  };

  const clearAll = () => {
    setSessions(DEFAULT_SESSIONS);
    setSessionNames(DEFAULT_NAMES);
    setCurrentSession('session1');
  };


  const importData = (data) => {
    if (data.sessions) setSessions(prev => ({ ...prev, ...data.sessions }));
    if (data.sessionNames) setSessionNames(prev => ({ ...prev, ...data.sessionNames }));
  };

  return (
    <AppContext.Provider value={{
      settings, updateSettings,
      sessions, currentSession, setCurrentSession,
      sessionNames,
      theme, setTheme, toggleTheme,
      addSolve, deleteSolve, updateSolvePenalty,
      createSession, renameSession, deleteSession,
      clearSession, clearAll, importData,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
