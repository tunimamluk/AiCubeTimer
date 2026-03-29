import { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { useTimer } from './hooks/useTimer';
import { useRoom } from './hooks/useRoom';
import Header from './components/Header';
import Sidebar from './components/Sidebar/Sidebar';
import MainArea from './components/MainArea/MainArea';
import SettingsModal from './components/modals/SettingsModal';
import SolveInfoModal from './components/modals/SolveInfoModal';
import RoomEntryModal from './components/Room/RoomEntryModal';
import RoomView from './components/Room/RoomView';

function AppInner() {
  const { theme } = useApp();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [solveInfoIndex, setSolveInfoIndex] = useState(null);
  const [roomEntryOpen, setRoomEntryOpen] = useState(false);

  const room = useRoom();
  const timer = useTimer({ disabled: room.inRoom });

  useEffect(() => {
    document.body.classList.toggle('light-mode', theme === 'light');
  }, [theme]);

  return (
    <>
      <Header
        onToggleSidebar={() => setSidebarOpen(o => !o)}
        sidebarOpen={sidebarOpen}
        timerState={timer.timerState}
        isHolding={timer.isHolding}
      />
      <div className="container">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onOpenSolve={setSolveInfoIndex}
          onOpenSettings={() => setSettingsOpen(true)}
          onOpenRoom={() => setRoomEntryOpen(true)}
          timerState={timer.timerState}
          isHolding={timer.isHolding}
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
      {roomEntryOpen && !room.inRoom && (
        <RoomEntryModal
          onClose={() => setRoomEntryOpen(false)}
          onCreate={async (name) => { await room.createRoom(name); setRoomEntryOpen(false); }}
          onJoin={async (code, name) => { await room.joinRoom(code, name); }}
          error={room.error}
        />
      )}
      {room.inRoom && room.room && (
        <RoomView
          room={room.room}
          myId={room.myId}
          isHost={room.isHost}
          myParticipant={room.myParticipant}
          roomCode={room.roomCode}
          onLeave={room.leaveRoom}
          setReady={room.setReady}
          submitSolve={room.submitSolve}
          startNewRound={room.startNewRound}
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
