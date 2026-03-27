import { formatTime } from './formatTime';

export function calculateAverage(solves, count) {
  if (!solves || solves.length < count) return '-';
  const recent = solves.slice(0, count);
  const times = recent.map(s => {
    const penalty = s.penalty || 'ok';
    if (penalty === 'dnf') return Infinity;
    if (penalty === 'plus2') return s.time + 2000;
    return s.time;
  });
  const dnfCount = times.filter(t => t === Infinity).length;
  if (dnfCount > 1) return 'DNF';
  const sorted = [...times].sort((a, b) => a - b);
  sorted.shift();
  sorted.pop();
  if (sorted.some(t => t === Infinity)) return 'DNF';
  const avg = sorted.reduce((a, b) => a + b, 0) / sorted.length;
  return formatTime(avg);
}
