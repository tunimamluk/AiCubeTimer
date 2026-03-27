import { useState } from 'react';
import { useApp } from '../../context/AppContext';

export default function SessionSelector() {
  const {
    sessions, sessionNames, currentSession, setCurrentSession,
    createSession, renameSession, deleteSession,
  } = useApp();

  const [optionsOpen, setOptionsOpen] = useState(false);

  const sortedKeys = Object.keys(sessionNames).sort((a, b) => {
    const nA = parseInt(a.replace('session', ''));
    const nB = parseInt(b.replace('session', ''));
    if (!isNaN(nA) && !isNaN(nB)) return nA - nB;
    return a.localeCompare(b);
  });

  const handleRename = () => {
    const name = prompt('Enter new name for this session:', sessionNames[currentSession]);
    if (name && name.trim()) renameSession(currentSession, name.trim());
  };

  const handleDelete = () => {
    if (Object.keys(sessions).length <= 1) {
      alert('You cannot delete the last remaining session.');
      return;
    }
    if (confirm(`Delete "${sessionNames[currentSession]}"? This cannot be undone.`)) {
      deleteSession(currentSession);
    }
  };

  return (
    <div className="session-selector">
      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
        <select
          id="sessionSelect"
          style={{ flex: 1 }}
          value={currentSession}
          onChange={e => setCurrentSession(e.target.value)}
        >
          {sortedKeys.map(key => (
            <option key={key} value={key}>{sessionNames[key]}</option>
          ))}
        </select>
        <button
          className="header-btn"
          style={{ padding: '0.4rem 0.7rem', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
          onClick={() => setOptionsOpen(o => !o)}
          title="Session options"
        >
          {optionsOpen ? '✕' : '⚙️'}
        </button>
      </div>

      {optionsOpen && (
        <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.4rem' }}>
          <button className="header-btn" style={{ flex: 1, padding: '0.4rem', fontSize: '0.75rem' }} onClick={handleRename}>
            ✏️ Rename
          </button>
          <button className="header-btn" style={{ flex: 1, padding: '0.4rem', fontSize: '0.75rem' }} onClick={createSession}>
            ➕ New
          </button>
          <button className="header-btn" style={{ flex: 1, padding: '0.4rem', fontSize: '0.75rem' }} onClick={handleDelete}>
            🗑️ Delete
          </button>
        </div>
      )}
    </div>
  );
}
