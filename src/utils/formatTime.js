export function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const milliseconds = Math.floor((ms % 1000) / 10);
  const msStr = milliseconds.toString().padStart(2, '0');
  if (minutes > 0) {
    const secStr = seconds.toString().padStart(2, '0');
    return `${minutes}:${secStr}.${msStr}`;
  }
  return `${seconds}.${msStr}`;
}
