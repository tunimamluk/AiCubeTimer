import { useApp } from '../context/AppContext';

export default function Header({ onToggleSidebar, sidebarOpen, timerState }) {
  const hidden = timerState === 'running';

  return (
    <button
      className="menu-btn"
      id="mobileMenuBtn"
      style={hidden ? { opacity: 0, visibility: 'hidden' } : {}}
      onClick={onToggleSidebar}
    >
      {sidebarOpen ? '✕' : '☰'}
    </button>
  );
}
