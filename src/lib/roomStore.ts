import Redis from "ioredis";

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
  var redisClient: Redis | undefined;
}

function getLocalStore(): Record<string, Room> {
  if (!globalThis.roomStore) {
    globalThis.roomStore = {};
  }
  return globalThis.roomStore;
}

// Support both Vercel KV (KV_) and Vercel Redis (REDIS_) integration environment variables
const KV_URL = process.env.KV_REST_API_URL || 
               process.env.REDIS_REST_API_URL || 
               process.env.UPSTASH_REDIS_REST_URL;

const KV_TOKEN = process.env.KV_REST_API_TOKEN || 
                 process.env.REDIS_REST_API_TOKEN || 
                 process.env.UPSTASH_REDIS_REST_TOKEN;

const REDIS_URL = process.env.REDIS_URL;

function getRedisClient(): Redis | null {
  if (REDIS_URL) {
    if (!globalThis.redisClient) {
      globalThis.redisClient = new Redis(REDIS_URL, {
        maxRetriesPerRequest: 3,
        connectTimeout: 5000,
        lazyConnect: true
      });
    }
    return globalThis.redisClient;
  }
  return null;
}

export async function getRoom(id: string): Promise<Room | null> {
  const upperId = id.toUpperCase();
  const redis = getRedisClient();

  if (redis) {
    try {
      const data = await redis.get(`room:${upperId}`);
      if (data) {
        return JSON.parse(data) as Room;
      }
      return null;
    } catch (e) {
      console.error("ioredis Error getting room:", e);
    }
  } else if (KV_URL && KV_TOKEN) {
    try {
      const res = await fetch(KV_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${KV_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(["GET", `room:${upperId}`]),
        cache: 'no-store'
      });
      if (!res.ok) return null;
      const data = await res.json();
      if (data.result) {
        return typeof data.result === 'string' ? JSON.parse(data.result) : data.result;
      }
      return null;
    } catch (e) {
      console.error("Redis KV Error getting room:", e);
    }
  }
  return getLocalStore()[upperId] || null;
}

export async function saveRoom(room: Room): Promise<void> {
  const upperId = room.id.toUpperCase();
  const redis = getRedisClient();

  if (redis) {
    try {
      // 24 hour TTL (86400 seconds)
      await redis.set(`room:${upperId}`, JSON.stringify(room), "EX", 86400);
      return;
    } catch (e) {
      console.error("ioredis Error saving room:", e);
    }
  } else if (KV_URL && KV_TOKEN) {
    try {
      await fetch(KV_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${KV_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(["SET", `room:${upperId}`, JSON.stringify(room), "EX", 86400])
      });
      return;
    } catch (e) {
      console.error("Redis KV Error saving room:", e);
    }
  }
  getLocalStore()[upperId] = room;
}

export async function deleteRoom(id: string): Promise<void> {
  const upperId = id.toUpperCase();
  const redis = getRedisClient();

  if (redis) {
    try {
      await redis.del(`room:${upperId}`);
      return;
    } catch (e) {
      console.error("ioredis Error deleting room:", e);
    }
  } else if (KV_URL && KV_TOKEN) {
    try {
      await fetch(KV_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${KV_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(["DEL", `room:${upperId}`])
      });
      return;
    } catch (e) {
      console.error("Redis KV Error deleting room:", e);
    }
  }
  delete getLocalStore()[upperId];
}

export async function hasRoom(id: string): Promise<boolean> {
  const upperId = id.toUpperCase();
  const redis = getRedisClient();

  if (redis) {
    try {
      const count = await redis.exists(`room:${upperId}`);
      return count === 1;
    } catch (e) {
      console.error("ioredis Error checking existence:", e);
    }
  } else if (KV_URL && KV_TOKEN) {
    try {
      const res = await fetch(KV_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${KV_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(["EXISTS", `room:${upperId}`]),
        cache: 'no-store'
      });
      if (res.ok) {
        const data = await res.json();
        return data.result === 1;
      }
    } catch (e) {
      console.error("Redis KV Error checking existence:", e);
    }
  }
  return !!getLocalStore()[upperId];
}
