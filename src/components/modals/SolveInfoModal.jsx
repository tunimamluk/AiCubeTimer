import { useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { formatTime } from '../../utils/formatTime';

export default function SolveInfoModal({ index, onClose, setPenaltyCallback }) {
  const { sessions, currentSession, updateSolvePenalty } = useApp();
  const solves = sessions[currentSession] || [];
  const solve = solves[index];

  const setPenalty = (penalty) => {
    updateSolvePenalty(index, penalty);
  };

  // Register penalty callback for keybinds
  useEffect(() => {
    setPenaltyCallback((p) => setPenalty(p));
    return () => setPenaltyCallback(null);
  }, [index, setPenaltyCallback]); // eslint-disable-line

  if (!solve) return null;

  const penalty = solve.penalty || 'ok';
  let displayTime;
  if (penalty === 'dnf') displayTime = 'DNF';
  else if (penalty === 'plus2') displayTime = formatTime(solve.time + 2000) + ' (+2)';
  else displayTime = formatTime(solve.time);

  const date = solve.timestamp
    ? new Date(solve.timestamp).toLocaleString()
    : '-';

  const copyScramble = () => {
    navigator.clipboard.writeText(solve.scramble || '').catch(() => {});
  };

  const copySolve = () => {
    const d = new Date(solve.timestamp);
    const pad = n => String(n).padStart(2, '0');
    const dateStr = `@${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    const timeStr = penalty === 'dnf' ? 'DNF' : formatTime(penalty === 'plus2' ? solve.time + 2000 : solve.time);
    const text = `${timeStr}   ${solve.scramble || ''}   ${dateStr}`;
    navigator.clipboard.writeText(text).catch(() => {});
  };

  return (
    <div className="modal-overlay active" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="solve-info-modal">
        <div className="solve-info-header">
          <h3 style={{ margin: 0 }}>Solve Info</h3>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button className="header-btn" style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }} onClick={copySolve}>
              📋 Copy Solve
            </button>
            <button className="close-btn" id="closeSolveInfo" onClick={onClose}>✕</button>
          </div>
        </div>
        <div className="solve-info-content">
          <div className="info-row">
            <span className="info-label">Time:</span>
            <span className="info-value" id="infoTime">{displayTime}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Status:</span>
            <span className="info-value" id="infoStatus">{penalty.toUpperCase()}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Date:</span>
            <span className="info-value" id="infoDate">{date}</span>
          </div>
          <div className="scramble-info">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <div className="info-label">Scramble:</div>
              <button className="header-btn" id="copyScrambleBtn" style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }} onClick={copyScramble}>
                📋 Copy
              </button>
            </div>
            <div className="scramble-info-text" id="infoScramble">{solve.scramble || '-'}</div>
          </div>
          <div className="penalty-actions">
            <button
              className={`penalty-btn ok${penalty === 'ok' ? ' active' : ''}`}
              id="penaltyOk"
              onClick={() => setPenalty('ok')}
            >
              OK
            </button>
            <button
              className={`penalty-btn plus-two${penalty === 'plus2' ? ' active' : ''}`}
              id="penaltyPlusTwo"
              onClick={() => setPenalty('plus2')}
            >
              +2
            </button>
            <button
              className={`penalty-btn dnf${penalty === 'dnf' ? ' active' : ''}`}
              id="penaltyDnf"
              onClick={() => setPenalty('dnf')}
            >
              DNF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
