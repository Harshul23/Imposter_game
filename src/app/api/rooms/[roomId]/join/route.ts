import { NextResponse } from "next/server";
import { rooms, Player } from "@/lib/roomStore";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;
    const roomKey = roomId.toUpperCase();
    const room = rooms[roomKey];

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    const { playerName, playerId: reqPlayerId } = await request.json();
    if (!playerName || !playerName.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const playerId = reqPlayerId || Math.random().toString(36).substring(2, 11);

    // Check if player is already in this room (reconnection)
    const existingPlayer = room.players.find((p) => p.id === playerId);
    if (existingPlayer) {
      existingPlayer.name = playerName.trim(); // Update name in case it changed
      return NextResponse.json({ room, playerId });
    }

    // Block joins if game already started
    if (room.gameState !== "lobby") {
      return NextResponse.json({ error: "Game already started in this room" }, { status: 400 });
    }

    // Limit to 12 players
    if (room.players.length >= 12) {
      return NextResponse.json({ error: "Room is full (max 12 players)" }, { status: 400 });
    }

    const newPlayer: Player = {
      id: playerId,
      name: playerName.trim(),
      isHost: false,
      votedFor: null,
    };

    room.players.push(newPlayer);

    return NextResponse.json({ room, playerId });
  } catch (error) {
    console.error("Error joining room:", error);
    return NextResponse.json({ error: "Failed to join room" }, { status: 500 });
  }
}
