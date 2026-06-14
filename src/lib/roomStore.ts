export interface Player {
  id: string;
  name: string;
  isHost: boolean;
  votedFor: string | null; // Player ID voted for
}

export interface Room {
  id: string;
  category: string;
  gameState: "lobby" | "reveal" | "voting" | "result";
  players: Player[];
  civilianWord: string;
  impostorWord: string;
  impostorId: string | null; // Player ID
  currentPlayerIndex: number;
  revealedPlayers: string[]; // Player IDs who have revealed their words
  votedPlayerId: string | null; // Player ID voted out
}

declare global {
  var roomStore: Record<string, Room> | undefined;
}

if (!globalThis.roomStore) {
  globalThis.roomStore = {};
}

export const rooms = globalThis.roomStore;
