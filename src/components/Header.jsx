import { useApp } from '../context/AppContext';

export default function Header({ onOpenSettings, onToggleSidebar, sidebarOpen, timerState }) {
  const { theme, setTheme } = useApp();
  const hidden = timerState === 'running';

  return (
    <>
      <button
        className="menu-btn header-btn"
        id="mobileMenuBtn"
        style={hidden ? { opacity: 0, visibility: 'hidden' } : {}}
        onClick={onToggleSidebar}
      >
        {sidebarOpen ? '✕' : '☰'}
      </button>
      <div className="header" style={hidden ? { opacity: 0, visibility: 'hidden' } : {}}>
        <button className="header-btn" onClick={onOpenSettings}>⚙️ Settings</button>
        <button
          className="header-btn"
          id="themeToggle"
          onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
        >
          {theme === 'light' ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
      </div>
    </>
  );
}
