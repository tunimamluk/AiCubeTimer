import { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { useTimer } from './hooks/useTimer';
import Header from './components/Header';
import Sidebar from './components/Sidebar/Sidebar';
import MainArea from './components/MainArea/MainArea';
import SettingsModal from './components/modals/SettingsModal';
import SolveInfoModal from './components/modals/SolveInfoModal';

function AppInner() {
  const { theme } = useApp();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [solveInfoIndex, setSolveInfoIndex] = useState(null);

  const timer = useTimer();

  useEffect(() => {
    document.body.classList.toggle('light-mode', theme === 'light');
  }, [theme]);

  return (
    <>
      <Header
        onToggleSidebar={() => setSidebarOpen(o => !o)}
        sidebarOpen={sidebarOpen}
        timerState={timer.timerState}
      />
      <div className="container">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onOpenSolve={setSolveInfoIndex}
          onOpenSettings={() => setSettingsOpen(true)}
          timerState={timer.timerState}
        />
        <MainArea
          timer={timer}
          timerState={timer.timerState}
        />
      </div>

      {settingsOpen && (
        <SettingsModal onClose={() => setSettingsOpen(false)} />
      )}
      {solveInfoIndex !== null && (
        <SolveInfoModal
          index={solveInfoIndex}
          onClose={() => setSolveInfoIndex(null)}
          setPenaltyCallback={timer.setPenaltyCallback}
        />
      )}
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}
