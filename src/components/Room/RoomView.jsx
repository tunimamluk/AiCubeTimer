import { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { formatTime } from '../../utils/formatTime';

const MEDALS = ['🥇', '🥈', '🥉'];

function getEffectiveTime(p) {
  if (!p || p.time == null) return Infinity;
  if (p.penalty === 'dnf') return Infinity;
  return p.penalty === 'plus2' ? p.time + 2000 : p.time;
}

function displayResult(p) {
  if (!p || p.time == null) return '—';
  if (p.penalty === 'dnf') return 'DNF';
  const t = p.penalty === 'plus2' ? p.time + 2000 : p.time;
  return formatTime(t) + (p.penalty === 'plus2' ? '+' : '');
}

// ─── LOBBY ───────────────────────────────────────────────────────────────────
function LobbyView({ room, myId, myParticipant, roomCode, onLeave, setReady }) {
  const [copied, setCopied] = useState(false);
  const participants = Object.entries(room.participants || {});
  const allReady = participants.length >= 2 && participants.every(([, p]) => p.ready);

  const copyCode = () => {
    navigator.clipboard.writeText(roomCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  };

  return (
    <div className="room-overlay">
      <div className="room-panel">
        <div className="room-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span className="room-label">Room</span>
            <span className="room-code">{roomCode}</span>
            <button className="header-btn" style={{ padding: '0.3rem 0.6rem' }} onClick={copyCode}>
              {copied ? '✓' : '📋'}
            </button>
          </div>
          <button className="header-btn danger" onClick={onLeave}>Leave</button>
        </div>

        <div className="room-participants">
          <div className="setting-label" style={{ marginBottom: '0.5rem' }}>
            Players ({participants.length})
          </div>
          {participants.map(([uid, p]) => (
            <div key={uid} className="room-participant">
              <span>
                {p.name}
                {uid === myId && <span className="room-tag you">you</span>}
                {uid === room.hostId && <span className="room-tag host">host</span>}
              </span>
              <span className={`ready-badge ${p.ready ? 'ready' : 'waiting'}`}>
                {p.ready ? '✓ Ready' : 'waiting...'}
              </span>
            </div>
          ))}
        </div>

        {participants.length < 2 && (
          <div className="room-info">Share the code with friends to start!</div>
        )}
        {allReady && (
          <div className="room-info" style={{ color: 'var(--timer-ready)' }}>All ready! Starting...</div>
        )}

        <div className="room-actions">
          <button
            className={`btn-room-action${myParticipant?.ready ? ' cancel' : ''}`}
            style={{ minWidth: '160px' }}
            onClick={() => setReady(!myParticipant?.ready)}
          >
            {myParticipant?.ready ? 'Cancel' : '✓ Ready Up'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── COUNTDOWN ───────────────────────────────────────────────────────────────
function CountdownView({ room }) {
  const [count, setCount] = useState(3);

  useEffect(() => {
    const tick = () => {
      if (!room.countdownStartAt) return;
      const elapsed = (Date.now() - room.countdownStartAt) / 1000;
      setCount(Math.max(0, Math.ceil(3 - elapsed)));
    };
    tick();
    const id = setInterval(tick, 100);
    return () => clearInterval(id);
  }, [room.countdownStartAt]);

  return (
    <div className="room-overlay room-overlay-center">
      <div className="room-countdown-number">{count || '!'}</div>
      <div className="room-info">Get ready...</div>
    </div>
  );
}

// ─── SOLVING ─────────────────────────────────────────────────────────────────
function SolvingView({ room, myId, myParticipant, submitSolve }) {
  const { settings } = useApp();
  const [timerState, setTimerState] = useState('idle');
  const [displayTime, setDisplayTime] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const stateRef = useRef('idle');
  const startRef = useRef(0);
  const intervalRef = useRef(null);
  const holdRef = useRef(null);
  const isDownRef = useRef(false);
  const submittedRef = useRef(false);
  const isDone = myParticipant?.status === 'done';

  const setState = (s) => { stateRef.current = s; setTimerState(s); };

  const handleSubmit = useCallback((time) => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    submitSolve(time);
  }, [submitSolve]);

  useEffect(() => {
    if (isDone) return;

    const onKeyDown = (e) => {
      if (e.code !== 'Space') return;
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
      e.preventDefault();
      if (isDownRef.current) return;
      isDownRef.current = true;

      if (stateRef.current === 'running') {
        clearInterval(intervalRef.current);
        const elapsed = Date.now() - startRef.current;
        setDisplayTime(elapsed);
        setIsHolding(false);
        setState('idle');
        handleSubmit(elapsed);
        return;
      }

      if (stateRef.current === 'idle') {
        setIsHolding(true);
        const ht = (settings.holdTime || 0) * 1000;
        if (ht > 0) {
          holdRef.current = setTimeout(() => {
            if (isDownRef.current) setState('ready');
          }, ht);
        } else {
          setState('ready');
        }
      }
    };

    const onKeyUp = (e) => {
      if (e.code !== 'Space') return;
      e.preventDefault();
      isDownRef.current = false;
      if (holdRef.current) { clearTimeout(holdRef.current); holdRef.current = null; }

      if (stateRef.current === 'ready') {
        startRef.current = Date.now();
        setState('running');
        intervalRef.current = setInterval(() => setDisplayTime(Date.now() - startRef.current), 10);
      } else {
        setIsHolding(false);
        setState('idle');
      }
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
    };
  }, [isDone, settings.holdTime, handleSubmit]);

  const participants = Object.entries(room.participants || {});

  const timerClass = `room-timer-display${timerState === 'ready' ? ' ready' : timerState === 'running' ? ' running' : ''}`;

  return (
    <div className="room-overlay">
      <div className="room-scramble">{room.scramble}</div>

      {isDone ? (
        <div className="room-done">
          <div className="room-done-label">Your time</div>
          <div className="room-done-value">{displayResult(myParticipant)}</div>
          <div className="room-info" style={{ marginTop: '0.5rem' }}>Waiting for others...</div>
        </div>
      ) : (
        <>
          <div className={timerClass}>
            {timerState === 'ready' ? '0.00' : formatTime(displayTime)}
          </div>
          <div className="room-hint">
            {isHolding
              ? (timerState === 'ready' ? 'Release to start!' : 'Holding...')
              : timerState === 'running'
              ? 'SPACE to stop'
              : 'Hold SPACE to ready'}
          </div>
        </>
      )}

      <div className="room-participants-mini">
        {participants.map(([uid, p]) => (
          <div key={uid} className="room-participant-mini">
            <span>
              {p.name}
              {uid === myId && <span className="room-tag you"> you</span>}
            </span>
            <span className={p.status === 'done' ? 'result-done' : 'result-pending'}>
              {p.status === 'done' ? displayResult(p) : '⏱'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── RESULTS ─────────────────────────────────────────────────────────────────
function ResultsView({ room, myId, isHost, onLeave, startNewRound }) {
  const sorted = Object.entries(room.participants || {})
    .sort(([, a], [, b]) => getEffectiveTime(a) - getEffectiveTime(b));

  return (
    <div className="room-overlay">
      <div className="room-panel">
        <div className="room-header">
          <h2 style={{ margin: 0 }}>Results</h2>
          <button className="header-btn danger" onClick={onLeave}>Leave</button>
        </div>

        <div className="room-results">
          {sorted.map(([uid, p], i) => (
            <div key={uid} className={`room-result-row${uid === myId ? ' mine' : ''}`}>
              <span className="result-rank">{MEDALS[i] || `${i + 1}.`}</span>
              <span className="result-name">
                {p.name}
                {uid === myId && <span className="room-tag you"> you</span>}
              </span>
              <span className="result-time">{displayResult(p)}</span>
            </div>
          ))}
        </div>

        <div className="room-actions">
          {isHost ? (
            <button className="btn-room-action" onClick={startNewRound}>▶ New Round</button>
          ) : (
            <div className="room-info">Waiting for host to start new round...</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── EXPORT ──────────────────────────────────────────────────────────────────
export default function RoomView(props) {
  const { room } = props;
  if (room.status === 'lobby')     return <LobbyView    {...props} />;
  if (room.status === 'countdown') return <CountdownView {...props} />;
  if (room.status === 'solving')   return <SolvingView  {...props} />;
  if (room.status === 'results')   return <ResultsView  {...props} />;
  return null;
}
