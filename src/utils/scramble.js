const MOVES = ['R', 'L', 'U', 'D', 'F', 'B'];
const MODIFIERS = ['', "'", '2'];
const OPPOSITES = { R: 'L', L: 'R', U: 'D', D: 'U', F: 'B', B: 'F' };

export function generateScramble(length = 20) {
  let scramble = [];
  let lastMove = '';
  let secondLastMove = '';
  for (let i = 0; i < length; i++) {
    let move;
    do {
      move = MOVES[Math.floor(Math.random() * MOVES.length)];
    } while (
      move === lastMove ||
      (move === secondLastMove && lastMove === OPPOSITES[move])
    );
    const modifier = MODIFIERS[Math.floor(Math.random() * MODIFIERS.length)];
    scramble.push(move + modifier);
    secondLastMove = lastMove;
    lastMove = move;
  }
  return scramble.join(' ');
}
