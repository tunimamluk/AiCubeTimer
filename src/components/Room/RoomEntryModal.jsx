import { useState } from 'react';

export default function RoomEntryModal({ onClose, onCreate, onJoin, error }) {
  const [name, setName] = useState(() => localStorage.getItem('cubeTimerName') || '');
  const [code, setCode] = useState('');
  const [mode, setMode] = useState('choose');

  const saveName = (n) => {
    setName(n);
    localStorage.setItem('cubeTimerName', n);
  };

  const handleCreate = () => {
    if (!name.trim()) return;
    onCreate(name.trim());
  };

  const handleJoin = () => {
    if (!name.trim() || !code.trim()) return;
    onJoin(code.trim(), name.trim());
  };

  return (
    <div className="modal-overlay active" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="settings-modal" style={{ maxWidth: '380px' }}>
        <div className="settings-header">
          <h2 style={{ margin: 0 }}>Compete</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <div className="setting-label">Your name</div>
            <input
              type="text"
              placeholder="e.g. SpeedCuber99"
              value={name}
              onChange={e => saveName(e.target.value)}
              maxLength={20}
              style={{ width: '100%', marginTop: '0.4rem' }}
              autoFocus
            />
          </div>

          {mode === 'choose' && (
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button className="btn-room-action" onClick={handleCreate} disabled={!name.trim()}>
                ➕ Create Room
              </button>
              <button className="header-btn" style={{ flex: 1 }} onClick={() => setMode('join')}>
                🔗 Join Room
              </button>
            </div>
          )}

          {mode === 'join' && (
            <>
              <div>
                <div className="setting-label">Room code</div>
                <input
                  type="text"
                  placeholder="ABC123"
                  value={code}
                  onChange={e => setCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  style={{ width: '100%', marginTop: '0.4rem', letterSpacing: '0.25em', fontFamily: 'var(--timer-font)', fontSize: '1.2rem' }}
                  onKeyDown={e => e.key === 'Enter' && handleJoin()}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button className="header-btn" style={{ flex: 1 }} onClick={() => setMode('choose')}>← Back</button>
                <button className="btn-room-action" onClick={handleJoin} disabled={!name.trim() || code.length < 6}>
                  Join
                </button>
              </div>
            </>
          )}

          {error && <div className="room-error">{error}</div>}
        </div>
      </div>
    </div>
  );
}
