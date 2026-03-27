import { useApp } from '../../context/AppContext';
import { calculateAverage } from '../../utils/statistics';

export default function Statistics() {
  const { sessions, currentSession } = useApp();
  const solves = sessions[currentSession] || [];
  const ao5 = calculateAverage(solves, 5);
  const ao12 = calculateAverage(solves, 12);

  return (
    <div className="statistics">
      <div className="stat-item">
        <span className="stat-label">Ao5</span>
        <span className="stat-value" id="ao5">{ao5}</span>
      </div>
      <div className="stat-item">
        <span className="stat-label">Ao12</span>
        <span className="stat-value" id="ao12">{ao12}</span>
      </div>
    </div>
  );
}
