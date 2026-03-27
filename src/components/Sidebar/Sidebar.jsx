import SessionSelector from './SessionSelector';
import Statistics from './Statistics';
import History from './History';

export default function Sidebar({ isOpen, onClose, onOpenSolve, timerState }) {
  const hidden = timerState === 'running';

  return (
    <div
      className={`sidebar${isOpen ? ' active' : ''}${hidden ? ' hidden' : ''}`}
    >
      <SessionSelector />
      <Statistics />
      <History onOpenSolve={onOpenSolve} />
    </div>
  );
}
