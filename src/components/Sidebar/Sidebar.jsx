import { useApp } from '../../context/AppContext';
import SessionSelector from './SessionSelector';
import Statistics from './Statistics';
import History from './History';

export default function Sidebar({ isOpen, onClose, onOpenSolve, onOpenSettings, timerState }) {
  const { theme, setTheme } = useApp();
  const hidden = timerState === 'running';

  return (
    <div
      className={`sidebar${isOpen ? ' active' : ''}${hidden ? ' hidden' : ''}`}
    >
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <button className="header-btn" style={{ flex: 1 }} onClick={onOpenSettings}>⚙️ Settings</button>
        <button className="header-btn" id="themeToggle" style={{ flex: 1 }} onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>
          {theme === 'light' ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
      </div>
      <SessionSelector />
      <Statistics />
      <History onOpenSolve={onOpenSolve} />
    </div>
  );
}
