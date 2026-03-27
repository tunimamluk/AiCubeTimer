import { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { formatTime } from '../../utils/formatTime';

const TABS = [
  { id: 'timer', label: '⏱️ Timer' },
  { id: 'display', label: '🖥️ Display' },
  { id: 'session', label: '📊 Session' },
  { id: 'appearance', label: '🎨 Appearance' },
  { id: 'data', label: '📥 Data' },
  { id: 'danger', label: '⚠️ Danger', danger: true },
];

const FONTS = [
  { value: "'Courier New', monospace", label: 'Courier New' },
  { value: "'Roboto Mono', monospace", label: 'Roboto Mono' },
  { value: "'Share Tech Mono', monospace", label: 'Share Tech Mono' },
  { value: "'Space Mono', monospace", label: 'Space Mono' },
  { value: "'IBM Plex Mono', monospace", label: 'IBM Plex Mono' },
];

export default function SettingsModal({ onClose }) {
  const {
    settings, updateSettings,
    sessions, sessionNames, currentSession,
    clearSession, clearAll, importData,
  } = useApp();

  const [activeTab, setActiveTab] = useState('timer');
  const [micLevel, setMicLevel] = useState(0);
  const importFileRef = useRef(null);

  const exportJson = () => {
    const data = JSON.stringify({ sessions, sessionNames }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cubetimer-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportCsv = () => {
    const solves = sessions[currentSession] || [];
    const rows = [['#', 'Time', 'Penalty', 'Scramble', 'Date']];
    solves.forEach((s, i) => {
      const penalty = s.penalty || 'ok';
      let time = penalty === 'dnf' ? 'DNF' : formatTime(penalty === 'plus2' ? s.time + 2000 : s.time);
      rows.push([i + 1, time, penalty, s.scramble, new Date(s.timestamp).toLocaleString()]);
    });
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cubetimer-${sessionNames[currentSession]}-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = JSON.parse(evt.target.result);
        importData(data);
        alert('Import successful!');
      } catch {
        alert('Invalid JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleBgImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => updateSettings({ backgroundImage: evt.target.result });
    reader.readAsDataURL(file);
  };

  return (
    <div className="modal-overlay active" id="settingsModal" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="settings-modal">
        <div className="settings-header">
          <h2 style={{ margin: 0 }}>Settings</h2>
          <button className="close-btn" id="closeSettings" onClick={onClose}>✕</button>
        </div>
        <div className="settings-body">
          <nav className="settings-nav">
            {TABS.map(tab => (
              <button
                key={tab.id}
                className={`settings-nav-item${activeTab === tab.id ? ' active' : ''}${tab.danger ? ' danger' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </nav>
          <div className="settings-content">
            {/* TIMER TAB */}
            {activeTab === 'timer' && (
              <div className="settings-section" id="section-timer">
                <div className="setting-item">
                  <div>
                    <div className="setting-label">Input Source</div>
                    <div className="setting-description">Choose how to control the timer</div>
                  </div>
                  <div className="setting-control">
                    <select
                      id="inputSource"
                      value={settings.inputSource}
                      onChange={e => updateSettings({ inputSource: e.target.value })}
                    >
                      <option value="keyboard">Keyboard (Spacebar)</option>
                      <option value="stackmat">Stackmat Timer</option>
                    </select>
                  </div>
                </div>
                {settings.inputSource === 'stackmat' && (
                  <div className="setting-item" id="micInputContainer">
                    <div>
                      <div className="setting-label">Microphone Level</div>
                      <div className="setting-description">Audio input visualization</div>
                    </div>
                    <div className="setting-control">
                      <div style={{ width: '120px', height: '12px', background: 'var(--bg-primary)', borderRadius: '6px', overflow: 'hidden' }}>
                        <div id="micLevelBar" style={{ height: '100%', width: `${micLevel}%`, background: 'var(--accent)', transition: 'width 0.1s' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div className="setting-item">
                  <div>
                    <div className="setting-label">Inspection Time</div>
                    <div className="setting-description">Enable 15-second WCA inspection</div>
                  </div>
                  <div className="setting-control">
                    <input
                      type="checkbox"
                      id="inspectionToggle"
                      checked={settings.inspectionEnabled}
                      onChange={e => updateSettings({ inspectionEnabled: e.target.checked })}
                    />
                  </div>
                </div>
                <div className="setting-item">
                  <div>
                    <div className="setting-label">Hold Time</div>
                    <div className="setting-description">Time to hold before ready (ms)</div>
                  </div>
                  <div className="setting-control">
                    <input
                      type="number"
                      id="holdTime"
                      min="0"
                      max="2000"
                      value={settings.holdTime}
                      onChange={e => updateSettings({ holdTime: Number(e.target.value) })}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* DISPLAY TAB */}
            {activeTab === 'display' && (
              <div className="settings-section" id="section-display">
                <div className="setting-item">
                  <div>
                    <div className="setting-label">Scramble Length</div>
                    <div className="setting-description">Number of moves in scramble</div>
                  </div>
                  <div className="setting-control">
                    <input
                      type="number"
                      id="scrambleLength"
                      min="15"
                      max="30"
                      value={settings.scrambleLength}
                      onChange={e => updateSettings({ scrambleLength: Number(e.target.value) })}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SESSION TAB */}
            {activeTab === 'session' && (
              <div className="settings-section" id="section-session">
                <div className="setting-item">
                  <div>
                    <div className="setting-label">Auto-Save Sessions</div>
                    <div className="setting-description">Automatically save times to localStorage</div>
                  </div>
                  <div className="setting-control">
                    <input
                      type="checkbox"
                      id="autoSaveToggle"
                      checked={settings.autoSave}
                      onChange={e => updateSettings({ autoSave: e.target.checked })}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* APPEARANCE TAB */}
            {activeTab === 'appearance' && (
              <div className="settings-section" id="section-appearance">
                <div className="setting-item">
                  <div>
                    <div className="setting-label">Timer Color</div>
                    <div className="setting-description">Custom timer display color</div>
                  </div>
                  <div className="setting-control" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input
                      type="color"
                      id="timerColorPicker"
                      value={settings.timerColor || '#cdd6f4'}
                      onChange={e => updateSettings({ timerColor: e.target.value })}
                    />
                    <button
                      className="header-btn"
                      id="resetColorBtn"
                      style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                      onClick={() => updateSettings({ timerColor: null })}
                    >
                      Reset
                    </button>
                  </div>
                </div>
                <div className="setting-item">
                  <div>
                    <div className="setting-label">Timer Font</div>
                    <div className="setting-description">Font for the timer display</div>
                  </div>
                  <div className="setting-control">
                    <select
                      id="timerFontSelect"
                      value={settings.timerFont}
                      onChange={e => updateSettings({ timerFont: e.target.value })}
                    >
                      {FONTS.map(f => (
                        <option key={f.value} value={f.value}>{f.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="setting-item">
                  <div>
                    <div className="setting-label">Background Image</div>
                    <div className="setting-description">Custom background for timer area</div>
                  </div>
                  <div className="setting-control" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input type="file" accept="image/*" style={{ display: 'none' }} id="bgImageInput" onChange={handleBgImage} />
                    <button
                      className="header-btn"
                      style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                      onClick={() => document.getElementById('bgImageInput').click()}
                    >
                      Upload
                    </button>
                    {settings.backgroundImage && (
                      <button
                        className="header-btn"
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                        onClick={() => updateSettings({ backgroundImage: null })}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* DATA TAB */}
            {activeTab === 'data' && (
              <div className="settings-section" id="section-importexport">
                <div className="setting-item">
                  <div>
                    <div className="setting-label">Import Data</div>
                    <div className="setting-description">Load sessions from JSON file</div>
                  </div>
                  <div className="setting-control">
                    <input type="file" accept=".json" style={{ display: 'none' }} ref={importFileRef} onChange={handleImport} />
                    <button
                      className="header-btn"
                      id="importBtn"
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                      onClick={() => importFileRef.current.click()}
                    >
                      📂 Import JSON
                    </button>
                  </div>
                </div>
                <div className="setting-item">
                  <div>
                    <div className="setting-label">Export JSON</div>
                    <div className="setting-description">Save all sessions as JSON</div>
                  </div>
                  <div className="setting-control">
                    <button
                      className="header-btn"
                      id="exportBtn"
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                      onClick={exportJson}
                    >
                      💾 Export JSON
                    </button>
                  </div>
                </div>
                <div className="setting-item">
                  <div>
                    <div className="setting-label">Export CSV</div>
                    <div className="setting-description">Export current session as CSV</div>
                  </div>
                  <div className="setting-control">
                    <button
                      className="header-btn"
                      id="exportCsvBtn"
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                      onClick={exportCsv}
                    >
                      📊 Export CSV
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* DANGER TAB */}
            {activeTab === 'danger' && (
              <div className="settings-section danger-zone" id="section-danger">
                <h3 style={{ color: 'var(--delete-btn)', marginBottom: '1rem' }}>⚠️ Danger Zone</h3>
                <button
                  className="danger-btn"
                  id="clearSessionBtn"
                  onClick={() => {
                    if (confirm('Are you sure you want to clear all times in this session?')) {
                      clearSession(currentSession);
                    }
                  }}
                >
                  🗑️ Clear Current Session
                </button>
                <button
                  className="danger-btn"
                  id="clearAllBtn"
                  style={{ marginTop: '0.75rem' }}
                  onClick={() => {
                    if (confirm('Are you sure you want to delete ALL data? This cannot be undone.')) {
                      clearAll();
                    }
                  }}
                >
                  💥 Clear All Data
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
