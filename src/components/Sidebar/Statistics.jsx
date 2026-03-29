import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { calculateAverage } from '../../utils/statistics';

const AO_OPTIONS = [5, 12, 50, 100];

export default function Statistics() {
  const { sessions, currentSession } = useApp();
  const solves = sessions[currentSession] || [];
  const [aoIndex, setAoIndex] = useState(0);

  const aoN = AO_OPTIONS[aoIndex];
  const value = calculateAverage(solves, aoN);

  const cycle = () => setAoIndex((i) => (i + 1) % AO_OPTIONS.length);

  return (
    <div className="statistics">
      <div className="stat-item">
        <button className="stat-label ao-selector" onClick={cycle} title="Click to switch average">
          Ao{aoN} ▾
        </button>
        <span className="stat-value">{value}</span>
      </div>
    </div>
  );
}
