import { formatTime } from '../../utils/formatTime';

export default function TimerDisplay({ timerState, isHolding, displayTime, inspectionRemaining }) {
  let text, className;
  const isLong = displayTime >= 60000;

  if (timerState === 'inspection') {
    text = inspectionRemaining > 0 ? inspectionRemaining.toString() : '0';
    className = 'timer-display';
  } else if (timerState === 'running') {
    text = formatTime(displayTime);
    className = `timer-display running${isLong ? ' long-time' : ''}`;
  } else if (timerState === 'ready') {
    text = '0.00';
    className = `timer-display ready running${isLong ? ' long-time' : ''}`;
  } else if (isHolding) {
    text = formatTime(displayTime);
    className = `timer-display running${isLong ? ' long-time' : ''}`;
  } else {
    text = formatTime(displayTime);
    className = `timer-display${isLong ? ' long-time' : ''}`;
  }

  return (
    <div className={className} id="timerDisplay">{text}</div>
  );
}
