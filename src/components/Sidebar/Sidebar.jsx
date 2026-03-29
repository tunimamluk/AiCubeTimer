import { useApp } from '../../context/AppContext';
import SessionSelector from './SessionSelector';
import Statistics from './Statistics';
import History from './History';

export default function Sidebar({ isOpen, onClose, onOpenSolve, onOpenSettings, onOpenRoom, timerState, isHolding }) {
  const { theme, toggleTheme } = useApp();
  const hidden = timerState === 'running' || isHolding;

  return (
    <div
      className={`sidebar${isOpen ? ' active' : ''}${hidden ? ' hidden' : ''}`}
    >
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <button className="header-btn" style={{ flex: 1 }} onClick={onOpenSettings}>⚙️ Settings</button>
        <button className="header-btn" id="themeToggle" style={{ flex: 1 }} onClick={toggleTheme}>
          {theme === 'light' ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
      </div>
      <button className="header-btn" style={{ width: '100%', marginBottom: '1rem' }} onClick={onOpenRoom}>
        🏆 Compete Online
      </button>
      <SessionSelector />
      <Statistics />
      <History onOpenSolve={onOpenSolve} />
    </div>
  );
}
