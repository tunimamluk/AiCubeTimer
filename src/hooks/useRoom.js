export function useRoom() {
  return {
    room: null,
    roomCode: null,
    myId: null,
    myParticipant: null,
    isHost: false,
    error: null,
    inRoom: false,
    createRoom: async () => {},
    joinRoom: async () => {},
    leaveRoom: async () => {},
    setReady: async () => {},
    submitSolve: async () => {},
    startNewRound: async () => {},
  };
}
