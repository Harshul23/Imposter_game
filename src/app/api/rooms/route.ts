import { NextResponse } from "next/server";
import { rooms, Room, Player } from "@/lib/roomStore";

function generateRoomId() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let id = "";
  for (let i = 0; i < 4; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

export async function POST(request: Request) {
  try {
    const { hostName, playerId: reqPlayerId } = await request.json();
    if (!hostName || !hostName.trim()) {
      return NextResponse.json({ error: "Host name is required" }, { status: 400 });
    }

    let roomId = generateRoomId();
    let retries = 0;
    while (rooms[roomId] && retries < 50) {
      roomId = generateRoomId();
      retries++;
    }

    const playerId = reqPlayerId || Math.random().toString(36).substring(2, 11);
    const hostPlayer: Player = {
      id: playerId,
      name: hostName.trim(),
      isHost: true,
      votedFor: null,
    };

    const newRoom: Room = {
      id: roomId,
      category: "Food",
      gameState: "lobby",
      players: [hostPlayer],
      civilianWord: "",
      impostorWord: "",
      impostorId: null,
      currentPlayerIndex: 0,
      revealedPlayers: [],
      votedPlayerId: null,
    };

    rooms[roomId] = newRoom;

    return NextResponse.json({ room: newRoom, playerId });
  } catch (error) {
    console.error("Error creating room:", error);
    return NextResponse.json({ error: "Failed to create room" }, { status: 500 });
  }
}
