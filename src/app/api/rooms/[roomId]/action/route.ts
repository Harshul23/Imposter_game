import { NextResponse } from "next/server";
import { getRoom, saveRoom, deleteRoom } from "@/lib/roomStore";
import fs from "fs";
import path from "path";

// Helper to fetch words dynamically on backend
let wordsCache: Record<string, string[]> | null = null;
function getWords(category: string): string[] {
  if (!wordsCache) {
    const filePath = path.join(process.cwd(), "public", "words.json");
    const fileContent = fs.readFileSync(filePath, "utf8");
    wordsCache = JSON.parse(fileContent);
  }
  return wordsCache ? wordsCache[category] || [] : [];
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;
    const room = await getRoom(roomId);

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    const { playerId, action, payload } = await request.json();
    if (!playerId) {
      return NextResponse.json({ error: "Player ID is required" }, { status: 400 });
    }

    const player = room.players.find(p => p.id === playerId);
    if (!player && action !== "leave") {
      return NextResponse.json({ error: "Player not in room" }, { status: 403 });
    }

    switch (action) {
      case "start": {
        if (!player || !player.isHost) {
          return NextResponse.json({ error: "Only the host can start the game" }, { status: 403 });
        }
        const category = payload?.category || room.category;
        const wordsList = getWords(category);
        if (wordsList.length < 2) {
          return NextResponse.json({ error: "Category doesn't have enough words" }, { status: 400 });
        }

        const civWord = wordsList[Math.floor(Math.random() * wordsList.length)];
        let impWord = "";
        do {
          impWord = wordsList[Math.floor(Math.random() * wordsList.length)];
        } while (impWord === civWord);

        const impPlayerIndex = Math.floor(Math.random() * room.players.length);
        const impostor = room.players[impPlayerIndex];
        room.category = category;
        room.civilianWord = civWord;
        room.impostorWord = impWord;
        room.impostorId = impostor.id;
        room.gameState = "voting";
        room.currentPlayerIndex = 0;
        room.revealedPlayers = [];
        room.votedPlayerId = null;
        
        // Reset player votes
        room.players.forEach(p => {
          p.votedFor = null;
        });
        break;
      }

      case "setCategory": {
        if (!player || !player.isHost) {
          return NextResponse.json({ error: "Only the host can change the category" }, { status: 403 });
        }
        const category = payload?.category;
        if (!category) {
          return NextResponse.json({ error: "Category is required" }, { status: 400 });
        }
        room.category = category;
        break;
      }

      case "reveal": {
        if (!room.revealedPlayers.includes(playerId)) {
          room.revealedPlayers.push(playerId);
        }
        if (room.revealedPlayers.length === room.players.length) {
          room.gameState = "voting";
        }
        break;
      }

      case "next": {
        const currentPlayer = room.players[room.currentPlayerIndex];
        if (currentPlayer.id !== playerId) {
          return NextResponse.json({ error: "It is not your turn" }, { status: 400 });
        }
        
        if (room.currentPlayerIndex + 1 >= room.players.length) {
          room.gameState = "voting";
        } else {
          room.currentPlayerIndex++;
        }
        break;
      }

      case "vote": {
        const { votedForId } = payload;
        if (!votedForId) {
          return NextResponse.json({ error: "Voted player ID is required" }, { status: 400 });
        }
        
        if (player) {
          player.votedFor = votedForId;
        }

        // Check if all players have voted
        const allVoted = room.players.every(p => p.votedFor !== null);
        if (allVoted) {
          // Count votes
          const voteCounts: Record<string, number> = {};
          room.players.forEach(p => {
            const vId = p.votedFor!;
            voteCounts[vId] = (voteCounts[vId] || 0) + 1;
          });

          // Find candidate with max votes
          let maxVotes = -1;
          let votedOutId: string | null = null;
          room.players.forEach(p => {
            const count = voteCounts[p.id] || 0;
            if (count > maxVotes) {
              maxVotes = count;
              votedOutId = p.id;
            }
          });

          room.votedPlayerId = votedOutId;
          room.gameState = "result";
        }
        break;
      }

      case "reset": {
        if (!player || !player.isHost) {
          return NextResponse.json({ error: "Only the host can reset the game" }, { status: 403 });
        }
        room.gameState = "lobby";
        room.civilianWord = "";
        room.impostorWord = "";
        room.impostorId = null;
        room.currentPlayerIndex = 0;
        room.revealedPlayers = [];
        room.votedPlayerId = null;
        room.players.forEach(p => {
          p.votedFor = null;
        });
        break;
      }

      case "leave": {
        room.players = room.players.filter(p => p.id !== playerId);
        if (room.players.length === 0) {
          await deleteRoom(roomId);
        } else {
          const wasHost = room.players.find(p => p.id === playerId)?.isHost;
          if (wasHost && room.players.length > 0) {
            room.players[0].isHost = true;
          }
          await saveRoom(room);
        }
        break;
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    if (room.players.length > 0) {
      await saveRoom(room);
    }

    return NextResponse.json({ room });
  } catch (error) {
    console.error("Error executing room action:", error);
    return NextResponse.json({ error: "Failed to execute action" }, { status: 500 });
  }
}
