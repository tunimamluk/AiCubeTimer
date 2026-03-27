import { useApp } from '../../context/AppContext';
import { formatTime } from '../../utils/formatTime';

export default function History({ onOpenSolve }) {
  const { sessions, currentSession, deleteSolve } = useApp();
  const solves = sessions[currentSession] || [];

  const handleDelete = (e, index) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this time?')) {
      deleteSolve(index);
    }
  };

  return (
    <div className="history">
      <div className="history-list" id="historyList">
        {solves.map((solve, index) => {
          const penalty = solve.penalty || 'ok';
          let timeText, timeClass;
          if (penalty === 'dnf') {
            timeText = 'DNF'; timeClass = 'history-time dnf';
          } else if (penalty === 'plus2') {
            timeText = formatTime(solve.time + 2000); timeClass = 'history-time plus-two';
          } else {
            timeText = formatTime(solve.time); timeClass = 'history-time';
          }

          return (
            <div
              key={`${solve.timestamp}-${index}`}
              className="history-item"
              onClick={() => onOpenSolve(index)}
            >
              <div className="history-time-wrapper">
                <span className={timeClass}>{timeText}</span>
                {penalty === 'plus2' && <span className="penalty-badge plus-two">+2</span>}
                {penalty === 'dnf' && <span className="penalty-badge dnf">DNF</span>}
              </div>
              <div className="history-actions">
                <button className="delete-btn" onClick={e => handleDelete(e, index)}>✕</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
