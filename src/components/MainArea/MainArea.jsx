import { useRef } from 'react';
import ScrambleDisplay from './ScrambleDisplay';
import TimerDisplay from './TimerDisplay';
import { useApp } from '../../context/AppContext';

export default function MainArea({ timer, timerState }) {
  const { settings } = useApp();
  const areaRef = useRef(null);
  const hidden = timerState === 'running';

  // Bind touch events to the main area element
  const handleRef = (el) => {
    if (el && areaRef.current !== el) {
      areaRef.current = el;
      timer.bindTouchArea(el);
    }
  };

  return (
    <div
      className={`main-area${settings.backgroundImage ? ' has-bg' : ''}${timerState === 'running' ? ' running' : ''}`}
      ref={handleRef}
    >
      <ScrambleDisplay
        scramble={timer.scramble}
        onNext={timer.nextScramble}
        hidden={hidden}
      />
      <TimerDisplay
        timerState={timerState}
        displayTime={timer.displayTime}
        inspectionRemaining={timer.inspectionRemaining}
      />
      <div
        className={`instruction${hidden ? ' hidden' : ''}`}
        style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '1rem' }}
      >
        Hold SPACE to ready • Release to start • Press SPACE to stop
      </div>
    </div>
  );
}
