export default function ScrambleDisplay({ scramble, hidden }) {
  const copyScramble = () => {
    navigator.clipboard.writeText(scramble).catch(() => {});
  };

  return (
    <div className={`scramble-display${hidden ? ' hidden' : ''}`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
        <h2 style={{ margin: 0 }}>Scramble</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className="header-btn"
            id="copyMainScrambleBtn"
            style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }}
            onClick={copyScramble}
          >
            📋 Copy
          </button>
        </div>
      </div>
      <div className="scramble-text" id="scrambleText">{scramble || 'Press SPACE to start'}</div>
    </div>
  );
}
