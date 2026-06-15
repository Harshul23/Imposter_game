"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Pizza, 
  PawPrint, 
  MapPin, 
  Package, 
  Film, 
  Briefcase, 
  ChevronDown, 
  Users, 
  Plus, 
  Minus,
  Settings, 
  Eye, 
  ArrowRight, 
  MessageSquare, 
  Trophy, 
  Skull, 
  UserX, 
  CheckCircle, 
  AlertTriangle, 
  RotateCcw, 
  Trash2, 
  Check, 
  Edit3,
  X,
  Copy,
  LogOut,
  Crown
} from "lucide-react";

type GameState = "setup" | "reveal" | "voting" | "result";
type PlayMode = "local" | "multiplayer";

interface WordBank {
  [category: string]: string[];
}

interface FriendGroups {
  [groupName: string]: string[];
}

// Multiplayer Schemas
interface NetworkPlayer {
  id: string;
  name: string;
  isHost: boolean;
  votedFor: string | null;
}

interface NetworkRoom {
  id: string;
  category: string;
  gameState: "lobby" | "reveal" | "voting" | "result";
  players: NetworkPlayer[];
  civilianWord: string;
  impostorWord: string;
  impostorId: string | null;
  currentPlayerIndex: number;
  revealedPlayers: string[];
  votedPlayerId: string | null;
}

const PLAYER_COLORS = [
  { fill: "fill-rose-500", border: "border-slate-900", bg: "bg-rose-100", text: "text-rose-900 font-extrabold" },
  { fill: "fill-sky-500", border: "border-slate-900", bg: "bg-sky-100", text: "text-sky-900 font-extrabold" },
  { fill: "fill-emerald-500", border: "border-slate-900", bg: "bg-emerald-100", text: "text-emerald-900 font-extrabold" },
  { fill: "fill-pink-500", border: "border-slate-900", bg: "bg-pink-100", text: "text-pink-900 font-extrabold" },
  { fill: "fill-orange-500", border: "border-slate-900", bg: "bg-orange-100", text: "text-orange-900 font-extrabold" },
  { fill: "fill-yellow-500", border: "border-slate-900", bg: "bg-yellow-100", text: "text-yellow-900 font-extrabold" },
  { fill: "fill-purple-500", border: "border-slate-900", bg: "bg-purple-100", text: "text-purple-900 font-extrabold" },
  { fill: "fill-cyan-500", border: "border-slate-900", bg: "bg-cyan-100", text: "text-cyan-900 font-extrabold" },
  { fill: "fill-lime-500", border: "border-slate-900", bg: "bg-lime-100", text: "text-lime-900 font-extrabold" },
  { fill: "fill-slate-500", border: "border-slate-900", bg: "bg-slate-100", text: "text-slate-900 font-extrabold" },
  { fill: "fill-amber-600", border: "border-slate-900", bg: "bg-amber-100", text: "text-amber-950 font-extrabold" },
  { fill: "fill-teal-500", border: "border-slate-900", bg: "bg-teal-100", text: "text-teal-900 font-extrabold" }
];

function CrewmateIcon({ fillClass = "fill-slate-400", className = "w-5 h-5" }: { fillClass?: string; className?: string }) {
  return (
    <svg 
      viewBox="0 0 20 20" 
      className={`${className} ${fillClass} inline-block select-none stroke-slate-900 stroke-[1.2] stroke-linejoin-round`} 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Backpack */}
      <rect x="3" y="7" width="2.5" height="6" rx="1" />
      {/* Body + Legs */}
      <path d="M6 9 C6 5.5, 7.5 4, 10 4 C12.5 4, 14 5.5, 14 9 L14 14 L12 14 L12 16 C12 16.5, 11.5 17, 11 17 C10.5 17, 10 16.5, 10 16 L10 14 L8 14 L8 16 C8 16.5, 7.5 17, 7 17 C6.5 17, 6 16.5, 6 16 L6 9 Z" />
      {/* Visor */}
      <rect x="10" y="6" width="5" height="3" rx="1.5" className="fill-cyan-200 stroke-slate-900 stroke-[1.2]" />
    </svg>
  );
}

function ImpostorWinIcon({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      className={`${className} inline-block select-none stroke-slate-900 stroke-[1.5] stroke-linejoin-round`} 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Hand-drawn red marker circle background */}
      <circle cx="12" cy="12" r="10" className="fill-rose-100" />
      
      {/* Crewmate backpack */}
      <rect x="5.5" y="8.5" width="2.5" height="7" rx="0.8" className="fill-rose-600" />
      
      {/* Crewmate body */}
      <path 
        d="M8.5 10.5 C8.5 7, 10 5.5, 12.5 5.5 C15 5.5, 16.5 7, 16.5 10.5 L16.5 15.5 L14.5 15.5 L14.5 17.5 C14.5 18, 14 18.5, 13.5 18.5 C13 18.5, 12.5 18, 12.5 17.5 L12.5 15.5 L10.5 15.5 L10.5 17.5 C10.5 18, 10 18.5, 9.5 18.5 C9 18.5, 8.5 18, 8.5 17.5 Z" 
        className="fill-rose-500"
      />
      
      {/* Red visor */}
      <rect x="12" y="7.5" width="5.5" height="3" rx="1.3" className="fill-rose-200" />
      <rect x="13" y="8" width="1.5" height="0.5" rx="0.2" className="fill-white/80" />
      
      {/* Shushing hand/finger */}
      <path 
        d="M12.5 15 L12.5 10 C12.5 9.5, 13 9, 13.5 9 C14 9, 14.5 9.5, 14.5 10 L14.5 15" 
        className="fill-none stroke-slate-700 stroke-linecap-round" 
      />
      {/* Hand base */}
      <circle cx="13.5" cy="14.5" r="1.5" className="fill-slate-700" />
    </svg>
  );
}

export default function ImposterGame() {
  // Mode selection
  const [playMode, setPlayMode] = useState<PlayMode>("local");

  // Game Setup States (Local)
  const [wordBank, setWordBank] = useState<WordBank>({});
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("Food");
  const [catDropdownOpen, setCatDropdownOpen] = useState<boolean>(false);
  const [numPlayers, setNumPlayers] = useState<number>(6);
  const [playerNames, setPlayerNames] = useState<string[]>(
    Array.from({ length: 6 }, (_, i) => `Player ${i + 1}`)
  );
  
  // Friend Groups States (Local)
  const [friendGroups, setFriendGroups] = useState<FriendGroups>({});
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  
  // Modals States (Local)
  const [showCreateGroup, setShowCreateGroup] = useState<boolean>(false);
  const [showManageGroups, setShowManageGroups] = useState<boolean>(false);
  const [groupNameInput, setGroupNameInput] = useState<string>("");
  const [groupMembers, setGroupMembers] = useState<string[]>(["", "", ""]);
  const [editingGroupName, setEditingGroupName] = useState<string | null>(null);

  // Active Game States (Local)
  const [gameState, setGameState] = useState<GameState>("setup");
  const [civilianWord, setCivilianWord] = useState<string>("");
  const [impostorWord, setImpostorWord] = useState<string>("");
  const [impostorIndex, setImpostorIndex] = useState<number>(0);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState<number>(0);
  const [wordRevealed, setWordRevealed] = useState<boolean>(false);
  const [votedIndex, setVotedIndex] = useState<number | null>(null);

  // --- Multiplayer States ---
  const [playerId, setPlayerId] = useState<string>("");
  const [playerNameInput, setPlayerNameInput] = useState<string>("");
  const [roomCodeInput, setRoomCodeInput] = useState<string>("");
  const [room, setRoom] = useState<NetworkRoom | null>(null);
  const [multiplayerError, setMultiplayerError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  
  // --- Profile / Login States ---
  const [profileName, setProfileName] = useState<string | null>(null);
  const [profileInput, setProfileInput] = useState<string>("");
  const [isEditingProfile, setIsEditingProfile] = useState<boolean>(false);
  
  // Reference for polling interval
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load words and groups on mount, establish Session Player ID
  useEffect(() => {
    async function loadGameData() {
      try {
        const res = await fetch("/words.json");
        const data: WordBank = await res.json();
        setWordBank(data);
        setCategories(Object.keys(data));
        if (Object.keys(data).length > 0) {
          setSelectedCategory(Object.keys(data)[0]);
        }
      } catch (err) {
        console.error("Failed to load words:", err);
      }

      const savedGroups = localStorage.getItem("imposterGameFriendGroups");
      if (savedGroups) {
        try {
          setFriendGroups(JSON.parse(savedGroups));
        } catch (e) {
          console.error("Failed to parse saved groups:", e);
        }
      }
    }
    loadGameData();

    // Establish persistent playerId
    let pId = sessionStorage.getItem("imposterPlayerId");
    if (!pId) {
      pId = Math.random().toString(36).substring(2, 11);
      sessionStorage.setItem("imposterPlayerId", pId);
    }
    setPlayerId(pId);

    // Retrieve player name from localStorage
    const savedName = localStorage.getItem("imposterPlayerName");
    if (savedName) {
      setProfileName(savedName);
      setPlayerNameInput(savedName);
      setProfileInput(savedName);
      setPlayerNames((prev) => {
        const next = [...prev];
        if (next[0] === "Player 1") {
          next[0] = savedName;
        }
        return next;
      });
    }
  }, []);

  // Poll multiplayer room state
  useEffect(() => {
    if (playMode === "multiplayer" && room?.id) {
      // Start polling
      pollIntervalRef.current = setInterval(() => {
        pollRoomState(room.id);
      }, 1500);
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [playMode, room?.id]);

  const pollRoomState = async (roomId: string) => {
    try {
      const res = await fetch(`/api/rooms/${roomId}`);
      if (!res.ok) {
        if (res.status === 404) {
          // Room deleted or host closed it
          setRoom(null);
          setMultiplayerError("The room was closed or not found.");
        }
        return;
      }
      const data = await res.json();
      setRoom(data.room);
    } catch (e) {
      console.error("Polling error:", e);
    }
  };

  // Category Icon Resolver
  const getCategoryIcon = (cat: string, className = "w-5 h-5 stroke-[2.5]") => {
    switch (cat) {
      case "Food":
        return <Pizza className={`${className} text-orange-500`} />;
      case "Animals":
        return <PawPrint className={`${className} text-blue-500`} />;
      case "Places":
        return <MapPin className={`${className} text-orange-500`} />;
      case "Objects":
        return <Package className={`${className} text-blue-500`} />;
      case "Movies":
        return <Film className={`${className} text-orange-500`} />;
      case "Jobs":
        return <Briefcase className={`${className} text-blue-500`} />;
      default:
        return <Package className={`${className} text-blue-500`} />;
    }
  };

  // Update player names array length when numPlayers changes (Local)
  const handleNumPlayersChange = (val: number) => {
    const clamped = Math.max(3, Math.min(12, val));
    setNumPlayers(clamped);
    setPlayerNames((prev) => {
      const next = [...prev];
      if (clamped > prev.length) {
        for (let i = prev.length; i < clamped; i++) {
          next.push(`Player ${i + 1}`);
        }
      } else {
        next.splice(clamped);
      }
      return next;
    });
    setSelectedGroup("");
  };

  const handlePlayerNameChange = (index: number, name: string) => {
    setPlayerNames((prev) => {
      const next = [...prev];
      next[index] = name;
      return next;
    });
  };

  // Group Selection Action (Local)
  const handleGroupSelect = (groupName: string) => {
    setSelectedGroup(groupName);
    if (groupName && friendGroups[groupName]) {
      const members = friendGroups[groupName];
      setNumPlayers(members.length);
      setPlayerNames([...members]);
    }
  };

  // Save/Create Group Action (Local)
  const handleSaveGroup = () => {
    const name = groupNameInput.trim();
    if (!name) {
      alert("Please enter a group name!");
      return;
    }
    const filteredMembers = groupMembers.map(m => m.trim()).filter(m => m !== "");
    if (filteredMembers.length < 3) {
      alert("A group must have at least 3 members!");
      return;
    }

    if (friendGroups[name] && editingGroupName !== name) {
      if (!confirm(`A group named "${name}" already exists. Overwrite?`)) {
        return;
      }
    }

    const updatedGroups = { ...friendGroups };
    if (editingGroupName && editingGroupName !== name) {
      delete updatedGroups[editingGroupName];
    }
    updatedGroups[name] = filteredMembers;

    setFriendGroups(updatedGroups);
    localStorage.setItem("imposterGameFriendGroups", JSON.stringify(updatedGroups));
    
    setSelectedGroup(name);
    setNumPlayers(filteredMembers.length);
    setPlayerNames([...filteredMembers]);

    setGroupNameInput("");
    setGroupMembers(["", "", ""]);
    setEditingGroupName(null);
    setShowCreateGroup(false);
  };

  // Edit group (Local)
  const handleEditGroup = (groupName: string) => {
    const members = friendGroups[groupName];
    setEditingGroupName(groupName);
    setGroupNameInput(groupName);
    setGroupMembers([...members]);
    setShowManageGroups(false);
    setShowCreateGroup(true);
  };

  // Delete group (Local)
  const handleDeleteGroup = (groupName: string) => {
    if (confirm(`Are you sure you want to delete the group "${groupName}"?`)) {
      const updatedGroups = { ...friendGroups };
      delete updatedGroups[groupName];
      setFriendGroups(updatedGroups);
      localStorage.setItem("imposterGameFriendGroups", JSON.stringify(updatedGroups));
      if (selectedGroup === groupName) {
        setSelectedGroup("");
      }
    }
  };

  const handleUseGroupFromManage = (groupName: string) => {
    handleGroupSelect(groupName);
    setShowManageGroups(false);
  };

  // Start Game Action (Local)
  const handleStartGame = () => {
    for (let i = 0; i < playerNames.length; i++) {
      if (!playerNames[i]?.trim()) {
        alert(`Please enter a name for Player ${i + 1}`);
        return;
      }
    }

    const words = wordBank[selectedCategory];
    if (!words || words.length < 2) {
      alert("Selected category doesn't have enough words!");
      return;
    }

    const civWord = words[Math.floor(Math.random() * words.length)];
    let impWord = "";
    do {
      impWord = words[Math.floor(Math.random() * words.length)];
    } while (impWord === civWord);

    setCivilianWord(civWord);
    setImpostorWord(impWord);

    const impIndex = Math.floor(Math.random() * playerNames.length);
    setImpostorIndex(impIndex);

    setCurrentPlayerIndex(0);
    setWordRevealed(false);
    setVotedIndex(null);
    setGameState("reveal");
  };

  const handleNextPlayer = () => {
    if (currentPlayerIndex + 1 >= playerNames.length) {
      setGameState("voting");
    } else {
      setCurrentPlayerIndex(prev => prev + 1);
      setWordRevealed(false);
    }
  };

  const handleVote = (index: number) => {
    setVotedIndex(index);
    setGameState("result");
  };

  const resetGame = () => {
    setGameState("setup");
    setCivilianWord("");
    setImpostorWord("");
    setWordRevealed(false);
    setVotedIndex(null);
  };

  // --- Multiplayer Backend Interaction Functions ---

  const handleCreateRoom = async () => {
    setMultiplayerError(null);
    const name = profileName?.trim();
    if (!name) {
      setMultiplayerError("Please set your player name first.");
      return;
    }

    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hostName: name, playerId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMultiplayerError(data.error || "Failed to create room.");
        return;
      }
      setRoom(data.room);
    } catch (e) {
      console.error(e);
      setMultiplayerError("Network error. Could not connect.");
    }
  };

  const handleJoinRoom = async () => {
    setMultiplayerError(null);
    const name = profileName?.trim();
    const code = roomCodeInput.trim().toUpperCase();
    if (!name) {
      setMultiplayerError("Please set your player name first.");
      return;
    }
    if (!code || code.length !== 4) {
      setMultiplayerError("Please enter a valid 4-letter room code.");
      return;
    }

    try {
      const res = await fetch(`/api/rooms/${code}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerName: name, playerId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMultiplayerError(data.error || "Failed to join room.");
        return;
      }
      setRoom(data.room);
    } catch (e) {
      console.error(e);
      setMultiplayerError("Network error. Could not connect.");
    }
  };

  const handleSendAction = async (action: string, payload?: any) => {
    if (!room?.id) return;
    try {
      const res = await fetch(`/api/rooms/${room.id}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId, action, payload }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to perform action.");
        return;
      }
      setRoom(data.room);
    } catch (e) {
      console.error(e);
    }
  };

  const handleLeaveRoom = async () => {
    if (!room?.id) return;
    try {
      await fetch(`/api/rooms/${room.id}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId, action: "leave" }),
      });
    } catch (e) {
      console.error(e);
    }
    setRoom(null);
    setRoomCodeInput("");
  };

  const copyRoomCode = () => {
    if (!room?.id) return;
    navigator.clipboard.writeText(room.id);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Helper derivatives for Multiplayer
  const me = room?.players.find(p => p.id === playerId);
  const isHost = me?.isHost || false;
  const currentNetworkPlayer = room?.players[room?.currentPlayerIndex];
  const isMyTurn = currentNetworkPlayer?.id === playerId;
  const hasVoted = me?.votedFor !== null;
  const votedCount = room?.players.filter(p => p.votedFor !== null).length || 0;
  const totalNetworkPlayers = room?.players.length || 0;
  const myImpostorWord = room?.impostorId === playerId ? room?.impostorWord : room?.civilianWord;
  const votedCountsForPlayers = room?.players.reduce((acc, p) => {
    if (p.votedFor) {
      acc[p.votedFor] = (acc[p.votedFor] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>) || {};

  return (
    <div className="min-h-screen bg-[#faf8f5] bg-dots text-slate-900 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-sky-200/60">
      
      {/* Playful watercolor/marker highlighter blots */}
      <div className="absolute top-[-15%] left-[-15%] w-[60%] h-[60%] bg-sky-200/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-15%] w-[60%] h-[60%] bg-yellow-200/20 rounded-full blur-[120px] pointer-events-none" />
      
      <div className={`w-full z-10 transition-all duration-300 ${gameState === "setup" && playMode === "local" ? "max-w-4xl" : "max-w-xl"}`}>
        
        {/* Header */}
        <header className="flex flex-col items-center justify-center">
          <div className="flex items-center mr-12">
            <img 
              src="/icon.png" 
              alt="Underword Icon" 
              className="w-12 h-12 md:w-54 md:h-54 object-contain select-none filter drop-shadow-[2px_2px_0px_#0f172a] rotate-[-3deg]"
            />
            <h1 className="text-4xl md:text-8xl tracking-tight text-slate-900 font-icecream select-none filter drop-shadow-[2.5px_2.5px_0px_#fed7aa] rotate-[-1deg]">
              Underword
            </h1>
          </div>
          <p className="text-slate-650 text-xs md:text-sm font-bold tracking-wide uppercase">
            A Hand-drawn Party Game
          </p>

          {profileName && gameState === "setup" && !room && (
            <div className="absolute top-4 min-w-58 right-4 text-xs font-bold text-slate-700 flex justify-between items-center gap-2 bg-white border-2 border-slate-900 px-3.5 py-3 rounded-xl shadow-[3px_3px_0px_#0f172a] animate-fade-in select-none z-20">
              <div>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span><span className="text-sky-350 text-xl font-black">{profileName}</span></span>
              </div>
              <div>
                <button
                  onClick={() => {
                    setProfileInput(profileName);
                    setIsEditingProfile(true);
                  }}
                  className="text-slate-500 hover:text-orange-600 font-extrabold cursor-pointer border-l border-slate-200 pl-2 ml-1 transition-colors flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </header>

        {!profileName || isEditingProfile ? (
          /* PROFILE LOGIN SCREEN CARD */
          <div className="glass-panel p-8 rounded-2xl shadow-2xl space-y-6 text-center animate-fade-in w-full mt-4 max-w-md mx-auto">
            <div className="flex flex-col items-center gap-3">
              <div className="p-4 bg-orange-100 border-2 border-slate-900 rounded-full shadow-[3px_3px_0px_#0f172a]">
                <UserX className="w-10 h-10 text-orange-600 stroke-[3]" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 font-handwritten uppercase tracking-wide">
                {isEditingProfile ? "Change Player Tag" : "Welcome, Agent!"}
              </h2>
              <p className="text-slate-650 text-xs leading-relaxed max-w-xs">
                {isEditingProfile 
                  ? "Update your identification tag for multiplayer matches." 
                  : "Enter a player name tag to access local matches and online rooms. No email is required."}
              </p>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Enter player name (e.g. Maverick)"
                value={profileInput}
                onChange={(e) => setProfileInput(e.target.value)}
                maxLength={15}
                className="w-full bg-white border-2.5 border-slate-900 rounded-xl px-4 py-3.5 text-sm text-slate-900 focus:outline-none transition-all duration-200 text-center font-bold font-sans tracking-wide placeholder-slate-400 shadow-[3px_3px_0px_#0f172a] focus:shadow-[4px_4px_0px_#0f172a]"
              />

              <div className="flex gap-3">
                {isEditingProfile && (
                  <button
                    onClick={() => setIsEditingProfile(false)}
                    className="btn-marker-gray flex-1 py-3 bg-white text-slate-700 font-bold rounded-xl text-xs uppercase cursor-pointer text-center"
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={() => {
                    const val = profileInput.trim();
                    if (!val) {
                      alert("Name cannot be empty!");
                      return;
                    }
                    const oldVal = profileName;
                    localStorage.setItem("imposterPlayerName", val);
                    setProfileName(val);
                    setPlayerNameInput(val);
                    setIsEditingProfile(false);
                    setPlayerNames((prev) => {
                      const next = [...prev];
                      if (next[0] === "Player 1" || next[0] === oldVal) {
                        next[0] = val;
                      }
                      return next;
                    });
                  }}
                  className="btn-marker-primary flex-1 py-3 text-white font-bold rounded-xl text-xs uppercase cursor-pointer text-center"
                >
                  Save Profile
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Local vs Multiplayer Segmented Toggle */}
            {gameState === "setup" && !room && (
              <div className="bg-slate-200 border-2 border-black-800 p-1.5 rounded-2xl flex gap-1.5 mt-4 w-full max-w-md mx-auto shadow-[3px_3px_0px_#0f172a]">
                <button
                  onClick={() => {
                    setPlayMode("local");
                    setMultiplayerError(null);
                  }}
                  className={`flex-1 py-2 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    playMode === "local"
                      ? "bg-white border-2 border-slate-900 text-slate-900"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <Users className="w-3.5 h-3.5 stroke-[3]" />
                  Local Play
                </button>
                <button
                  onClick={() => {
                    setPlayMode("multiplayer");
                    setMultiplayerError(null);
                  }}
                  className={`flex-1 py-2 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    playMode === "multiplayer"
                      ? "bg-white border-2 border-slate-900 text-slate-900"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5 stroke-[3]" />
                  Multiplayer Rooms
                </button>
              </div>
            )}

        {/* --- LOCAL PLAY GAME VIEW --- */}
        {playMode === "local" && (
          <>
            {/* SETUP SCREEN */}
            {gameState === "setup" && (
              <div className="glass-panel p-6 md:p-8 rounded-2xl shadow-2xl h-98 animate-fade-in mt-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-stretch">
                  
                  {/* Left Column (Grid span 6) */}
                  <div className="md:col-span-6 flex flex-col justify-between space-y-6">
                    {/* Custom Category Dropdown */}
                    <div className="space-y-2 relative">
                      <label className="block text-xs font-black text-slate-655 uppercase tracking-wider pl-1">
                        Choose a Category
                      </label>
                      <button
                        type="button"
                        onClick={() => setCatDropdownOpen(!catDropdownOpen)}
                        className="w-full flex justify-between items-center bg-white border-2 border-slate-900 hover:bg-slate-50 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-200 transition-all text-left text-sm font-bold cursor-pointer shadow-[3px_3px_0px_#0f172a]"
                      >
                        <div className="flex items-center gap-2.5">
                          {getCategoryIcon(selectedCategory, "w-5 h-5 stroke-[2.5]")}
                          <span className="font-extrabold">{selectedCategory}</span>
                        </div>
                        <ChevronDown className="w-4 h-4 text-slate-700 stroke-[3]" />
                      </button>

                      {catDropdownOpen && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setCatDropdownOpen(false)} />
                          <div className="absolute w-full mt-2 bg-white border-2.5 border-slate-900 rounded-xl shadow-[5px_5px_0px_#0f172a] overflow-hidden z-20 animate-fade-in">
                            {categories.map((cat) => (
                              <button
                                key={cat}
                                type="button"
                                onClick={() => {
                                  setSelectedCategory(cat);
                                  setCatDropdownOpen(false);
                                }}
                                className="w-full px-4 py-3 hover:bg-sky-100 flex items-center gap-2.5 text-left text-sm text-slate-800 hover:text-slate-950 transition-colors border-b-2 border-slate-100 last:border-0 font-bold"
                              >
                                {getCategoryIcon(cat, "w-4.5 h-4.5 stroke-[2.5]")}
                                <span className="font-bold">{cat}</span>
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Friend Groups Management Section */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center px-1">
                        <h3 className="text-xs font-black text-slate-655 uppercase tracking-wider flex items-center gap-2">
                          <Users className="w-4 h-4 text-sky-600 stroke-[3]" /> Friend Groups
                        </h3>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingGroupName(null);
                              setGroupNameInput("");
                              setGroupMembers(["", "", ""]);
                              setShowCreateGroup(true);
                            }}
                            className="btn-marker-gray text-[10px] px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer font-extrabold shadow-[2px_2px_0px_#0f172a]"
                          >
                            <Plus className="w-3 h-3 stroke-[3]" /> Create
                          </button>
                          <button
                            onClick={() => setShowManageGroups(true)}
                            className="btn-marker-gray text-[10px] px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer font-extrabold shadow-[2px_2px_0px_#0f172a]"
                          >
                            <Settings className="w-3 h-3 stroke-[3]" /> Manage
                          </button>
                        </div>
                      </div>
                      <select
                        id="groupSelect"
                        value={selectedGroup}
                        onChange={(e) => handleGroupSelect(e.target.value)}
                        className="w-full bg-white border-2 border-slate-900 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-200 transition-all cursor-pointer text-sm font-bold shadow-[3px_3px_0px_#0f172a]"
                      >
                        <option value="">-- Manual Setup --</option>
                        {Object.keys(friendGroups).map((gName) => (
                          <option key={gName} value={gName}>
                            {gName} ({friendGroups[gName].length} players)
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Players count select */}
                    <div className="space-y-3">
                      <label className="block text-xs font-black text-slate-655 uppercase tracking-wider pl-1">
                        Number of Players
                      </label>
                      <div className="flex items-center justify-between bg-slate-50 border-2 border-slate-900 rounded-xl p-1.5 shadow-[2px_2px_0px_#0f172a]">
                        <button
                          type="button"
                          onClick={() => handleNumPlayersChange(numPlayers - 1)}
                          disabled={numPlayers <= 3}
                          className="btn-marker-gray w-10 h-10 rounded-lg flex items-center justify-center font-extrabold select-none cursor-pointer shadow-[2px_2px_0px_#0f172a]"
                        >
                          <Minus className="w-4 h-4 stroke-[3]" />
                        </button>
                        <div className="text-center flex flex-col items-center">
                          <span className="text-sky-655 font-black text-2xl tracking-tight leading-none font-handwritten">
                            {numPlayers}
                          </span>
                          <span className="text-[10px] text-slate-600 font-extrabold uppercase tracking-wider mt-1 select-none">
                            Players
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleNumPlayersChange(numPlayers + 1)}
                          disabled={numPlayers >= 12}
                          className="btn-marker-gray w-10 h-10 rounded-lg flex items-center justify-center font-extrabold select-none cursor-pointer shadow-[2px_2px_0px_#0f172a]"
                        >
                          <Plus className="w-4 h-4 stroke-[3]" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Vertical Divider (Col span 1) */}
                  <div className="hidden md:flex md:col-span-1 justify-center items-center">
                    <div className="h-full w-0.5 border-r-2 border-dashed border-slate-200 self-stretch" />
                  </div>

                  {/* Right Column: Player Names & Start Game Button (Col span 5) */}
                  <div className="md:col-span-5 flex flex-col justify-between space-y-6">
                    <div className="space-y-3 flex-1 flex flex-col">
                      <label className="block text-xs font-black text-slate-655 uppercase tracking-wider pl-1">
                        Player Names
                      </label>
                      <div className="grid grid-cols-1 gap-3 content-start max-h-[225px] min-h-[230px] overflow-y-auto pr-1.5 custom-scrollbar flex-1">
                        {playerNames.map((name, i) => (
                          <div key={i} className="relative group">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-600 font-bold group-focus-within:text-sky-650 transition-colors">
                              {i + 1}
                            </span>
                            <input
                              type="text"
                              placeholder={`Player Name`}
                              value={name}
                              onChange={(e) => handlePlayerNameChange(i, e.target.value)}
                              className="w-full bg-white border-2 border-slate-900 rounded-xl pl-8.5 pr-3.5 py-2.5 text-sm text-slate-900 focus:outline-none transition-all duration-200 font-bold placeholder-slate-400 shadow-[2px_2px_0px_#0f172a] focus:shadow-[3px_3px_0px_#0f172a]"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={handleStartGame}
                      className="btn-marker-primary w-full py-4 text-center text-sm font-black tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer shadow-[4px_4px_0px_#0f172a]"
                    >
                      Start Game <ArrowRight className="w-4 h-4 stroke-[3]" />
                    </button>
                  </div>

                </div>
              </div>
            )}

            {/* REVEAL SCREEN */}
            {gameState === "reveal" && (
              <div className="glass-panel p-6 md:p-8 rounded-2xl shadow-2xl text-center h-[460px] flex flex-col justify-between animate-fade-in mt-4">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-1.5 bg-sky-100 border-2 border-slate-900 rounded-full px-4 py-1.5 text-[10px] text-sky-800 font-black uppercase tracking-widest shadow-[2px_2px_0px_#0f172a]">
                    <Users className="w-3.5 h-3.5 stroke-[3]" /> Turn {currentPlayerIndex + 1} of {playerNames.length}
                  </div>
                  
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none pt-2 font-handwritten">
                    {playerNames[currentPlayerIndex]}&apos;s Turn
                  </h2>
                  
                  <p className="text-slate-655 max-w-xs mx-auto text-xs md:text-sm leading-relaxed font-bold">
                    {!wordRevealed 
                      ? "Make sure nobody else is looking at your screen, then click reveal."
                      : "Memorize your secret word! Click next player to hand over."}
                  </p>
                </div>

                <div className="flex-1 flex items-center justify-center py-4">
                  <div className="relative w-full max-w-xs h-32 flex items-center justify-center bg-slate-50 border-2.5 border-slate-900 rounded-2xl shadow-[4px_4px_0px_#0f172a] overflow-hidden">
                    
                    {/* Secret Word Display (Transitions from blurred to clear) */}
                    <div className={`flex flex-col items-center justify-center ${
                      wordRevealed 
                        ? 'transition-all duration-700 ease-out blur-none scale-100' 
                        : 'blur-xl scale-95 select-none pointer-events-none'
                    }`}>
                      <span className="block text-[10px] font-black text-sky-800 uppercase tracking-widest font-sans mb-1">
                        Your Secret Word
                      </span>
                      <span className="text-3xl font-black text-sky-950 tracking-wide select-none font-handwritten bg-yellow-100 px-5 py-2 rounded border border-dashed border-sky-300 rotate-[-1deg] shadow-[2px_2px_0px_#bae6fd]">
                        {currentPlayerIndex === impostorIndex ? impostorWord : civilianWord}
                      </span>
                    </div>

                  </div>
                </div>

                <div className="w-full">
                  {!wordRevealed ? (
                    <button
                      onClick={() => setWordRevealed(true)}
                      className="btn-marker-secondary w-full py-4 font-black rounded-xl active:scale-95 transition-all duration-300 text-sm tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer shadow-[3px_3px_0px_#0f172a]"
                    >
                      <Eye className="w-5 h-5 stroke-[3]" /> Reveal Word
                    </button>
                  ) : (
                    <button
                      onClick={handleNextPlayer}
                      className="btn-marker-primary w-full py-4 text-center text-sm font-black tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer shadow-[3px_3px_0px_#0f172a] animate-fade-in"
                    >
                      Next Player <ArrowRight className="w-4 h-4 stroke-[3]" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* VOTING SCREEN */}
            {gameState === "voting" && (
              <div className="glass-panel p-6 md:p-8 rounded-2xl shadow-2xl text-center space-y-6 animate-fade-in mt-4">
                <div className="space-y-2">
                  <span className="inline-flex items-center gap-1.5 bg-orange-100 border-2 border-slate-900 rounded-full px-4 py-1.5 text-[10px] text-orange-850 font-black uppercase tracking-widest shadow-[2px_2px_0px_#0f172a]">
                    <MessageSquare className="w-3.5 h-3.5 stroke-[3]" /> Discussion & Vote
                  </span>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none pt-2 font-handwritten">
                    Who is the Impostor?
                  </h2>
                  <p className="text-slate-655 text-xs md:text-sm max-w-sm mx-auto leading-relaxed font-bold">
                    Discuss clues together. Vote for the player you suspect has a different word!
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3.5 pt-3">
                  {playerNames.map((name, i) => (
                    <button
                      key={i}
                      onClick={() => handleVote(i)}
                      className="py-3 px-4 bg-white border-2 border-slate-900 text-slate-800 hover:text-slate-950 font-bold rounded-xl transition-all duration-300 text-xs active:scale-[0.97] flex items-center justify-start pl-5 gap-3 group cursor-pointer shadow-[3px_3px_0px_#0f172a] hover:bg-orange-50 hover:shadow-[4px_4px_0px_#0f172a]"
                    >
                      <span className="text-[10px] text-slate-600 group-hover:text-orange-800 font-extrabold bg-slate-100 px-2 py-0.5 rounded-md border-2 border-slate-900 transition-colors">
                        {i + 1}
                      </span>
                      <span className="truncate font-black">{name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* RESULT SCREEN */}
            {gameState === "result" && votedIndex !== null && (
              <div className="glass-panel p-8 rounded-2xl shadow-2xl text-center space-y-8 animate-fade-in mt-4 max-w-md mx-auto">
                <div className="space-y-4">
                  {votedIndex === impostorIndex ? (
                    <div className="space-y-3 flex flex-col items-center">
                      <div className="p-4 bg-sky-100 border-2 border-slate-900 rounded-full shadow-[3px_3px_0px_#0f172a]">
                        <Trophy className="w-12 h-12 text-sky-600 stroke-[3] animate-bounce" />
                      </div>
                      <h2 className="text-3xl font-black text-sky-700 tracking-tight uppercase font-handwritten filter drop-shadow-[1.5px_1.5px_0px_#bae6fd]">
                        Civilians Win!
                      </h2>
                      <p className="text-slate-655 text-xs md:text-sm max-w-xs leading-relaxed font-bold">
                        You successfully voted out the Impostor! Great job.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 flex flex-col items-center">
                      <div className="p-2 bg-rose-50 border-2 border-slate-900 rounded-full shadow-[3px_3px_0px_#0f172a]">
                        <ImpostorWinIcon className="w-14 h-14" />
                      </div>
                      <h2 className="text-3xl font-black text-rose-700 tracking-tight uppercase font-handwritten filter drop-shadow-[1.5px_1.5px_0px_#fda4af]">
                        Impostor Wins!
                      </h2>
                      <p className="text-slate-655 text-xs md:text-sm max-w-xs leading-relaxed font-semibold">
                        Civilians voted for <span className="font-black text-orange-600">{playerNames[votedIndex]}</span> who was innocent.
                      </p>
                    </div>
                  )}
                </div>

                <div className="p-5 bg-white border-2 border-slate-900 rounded-2xl space-y-4 text-left text-sm font-bold shadow-[3px_3px_0px_#0f172a]">
                  <div className="flex justify-between items-center pb-3 border-b-2 border-slate-100">
                    <span className="text-slate-600 flex items-center gap-1.5"><UserX className="w-4 h-4 text-orange-600 stroke-[2.5]" /> Impostor</span>
                    <span className="font-extrabold text-orange-600">{playerNames[impostorIndex]}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b-2 border-slate-100">
                    <span className="text-slate-600 flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-sky-600 stroke-[2.5]" /> Civilian Word</span>
                    <span className="font-extrabold text-sky-600">{civilianWord}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 flex items-center gap-1.5"><AlertTriangle className="w-4 h-4 text-orange-600 stroke-[2.5]" /> Impostor Word</span>
                    <span className="font-extrabold text-orange-600">{impostorWord}</span>
                  </div>
                </div>

                <button
                  onClick={resetGame}
                  className="btn-marker-primary w-full py-3.5 text-center text-sm font-black uppercase flex items-center justify-center gap-2 cursor-pointer shadow-[4px_4px_0px_#0f172a]"
                >
                  <RotateCcw className="w-4 h-4 stroke-[3]" /> Play Again
                </button>
              </div>
            )}
          </>
        )}

        {/* --- ONLINE MULTIPLAYER GAME VIEW --- */}
        {playMode === "multiplayer" && (
          <>
            {/* 1. ROOM ENTRY (CREATE / JOIN LOBBY LOBBY SCREEN) */}
            {!room && (
              <div className="glass-panel p-6 md:p-8 rounded-2xl shadow-2xl space-y-6 animate-fade-in mt-4">
                <h3 className="text-lg font-black text-slate-900 font-handwritten uppercase tracking-wide flex items-center gap-2 pl-1">
                  <Users className="w-5 h-5 text-sky-650 stroke-[3]" /> Online Multiplayer Lobby
                </h3>

                <div className="space-y-4">
                  <div className="py-3 px-4 bg-slate-50 border-2 border-slate-900 rounded-xl text-xs flex justify-between items-center font-black select-none shadow-[2px_2px_0px_#0f172a]">
                    <span className="text-slate-500 uppercase tracking-wider pl-0.5">PLAYING AS</span>
                    <span className="text-sky-600 font-extrabold pr-0.5 font-mono">{profileName}</span>
                  </div>

                  {multiplayerError && (
                    <p className="text-xs text-orange-850 font-black bg-orange-50 border-2 border-slate-900 px-3.5 py-2.5 rounded-xl animate-fade-in shadow-[2px_2px_0px_#0f172a]">
                      {multiplayerError}
                    </p>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 border-t-2 border-dashed border-slate-200 pt-5">
                    {/* Create Room box */}
                    <div className="space-y-3">
                      <div className="text-xs font-black text-slate-500 uppercase tracking-wider pl-1">
                        New Game
                      </div>
                      <button
                        onClick={handleCreateRoom}
                        className="btn-marker-primary w-full py-3 text-xs tracking-wider uppercase shadow-[3px_3px_0px_#0f172a]"
                      >
                        Create Room
                      </button>
                    </div>

                    {/* Join Room box */}
                    <div className="space-y-3">
                      <div className="text-xs font-black text-slate-500 uppercase tracking-wider pl-1">
                        Join Game
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="CODE"
                          value={roomCodeInput}
                          maxLength={4}
                          onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                          className="w-24 bg-white border-2 border-slate-900 focus:border-sky-500 rounded-xl px-3 text-center text-sm font-black uppercase focus:outline-none transition-all tracking-widest font-mono placeholder-slate-400 shadow-[2px_2px_0px_#0f172a]"
                        />
                        <button
                          onClick={handleJoinRoom}
                          className="btn-marker-secondary flex-1 py-3 text-xs tracking-wider uppercase shadow-[3px_3px_0px_#0f172a]"
                        >
                          Join
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. ACTIVE MULTIPLAYER ROOM */}
            {room && (
              <div className="space-y-4 animate-fade-in">
                
                {/* Status Bar */}
                <div className="glass-panel px-4 py-2 rounded-2xl flex items-center justify-between text-xs font-bold shadow-[3px_3px_0px_#0f172a]">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">ROOM ID:</span>
                    <span className="text-sky-600 bg-slate-50 border-2 border-slate-900 px-2.5 py-0.5 rounded-md text-sm font-mono tracking-widest font-black shadow-[1.5px_1.5px_0px_#0f172a]">{room.id}</span>
                    <button
                      onClick={copyRoomCode}
                      className="p-1 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-sky-650 transition-all cursor-pointer border border-transparent"
                      title="Copy Room Code"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5 text-sky-650" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <button
                    onClick={handleLeaveRoom}
                    className="flex items-center gap-1.5 text-orange-600 hover:text-orange-700 bg-white hover:bg-orange-50 border-2 border-slate-900 px-2.5 py-1 rounded-lg shadow-[2px_2px_0px_#0f172a] transition-all font-black cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Leave
                  </button>
                </div>

                {/* MULTIPLAYER LOBBY (WAITING PLAYERS) */}
                {room.gameState === "lobby" && (
                  <div className="glass-panel p-6 rounded-2xl shadow-xl space-y-5">
                    <h3 className="text-sm font-black text-slate-655 uppercase tracking-wider flex items-center gap-2 pl-0.5">
                      <Users className="w-4 h-4 text-sky-600 stroke-[2.5]" /> Players ({totalNetworkPlayers}/12)
                    </h3>

                    {/* Roster list */}
                    <div className="grid grid-cols-2 gap-2.5 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
                      {room.players.map((p) => (
                        <div
                          key={p.id}
                          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border-2 text-xs font-black transition-all ${
                            p.id === playerId
                              ? "bg-sky-50 border-slate-900 text-sky-800 shadow-[2px_2px_0px_#0f172a]"
                              : "bg-white border-slate-200 text-slate-700 hover:border-slate-400 shadow-[2px_2px_0px_#f1f5f9]"
                          }`}
                        >
                          {p.isHost ? (
                            <Crown className="w-3.5 h-3.5 text-orange-600 stroke-[2.5]" />
                          ) : (
                            <div className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                          )}
                          <span className="truncate">{p.name}</span>
                          {p.id === playerId && <span className="text-[9px] text-sky-600/80 ml-auto font-normal">(You)</span>}
                        </div>
                      ))}
                    </div>

                    {/* Host Settings */}
                    {isHost ? (
                      <div className="border-t-2 border-dashed border-slate-200 pt-5 space-y-4">
                        {/* Custom Category Dropdown */}
                        <div className="space-y-2 relative">
                          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider pl-0.5">
                            Select Category
                          </label>
                          <button
                            type="button"
                            onClick={() => setCatDropdownOpen(!catDropdownOpen)}
                            className="w-full flex justify-between items-center bg-white border-2 border-slate-900 hover:bg-slate-50 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none transition-all text-xs font-black cursor-pointer shadow-[2px_2px_0px_#0f172a]"
                          >
                            <div className="flex items-center gap-2">
                              {getCategoryIcon(room.category, "w-4.5 h-4.5 stroke-[2.5]")}
                              <span className="font-extrabold">{room.category}</span>
                            </div>
                            <ChevronDown className="w-3.5 h-3.5 text-slate-700 stroke-[3]" />
                          </button>

                          {catDropdownOpen && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setCatDropdownOpen(false)} />
                              <div className="absolute w-full mt-1.5 bg-white border-2.5 border-slate-900 rounded-xl shadow-[4px_4px_0px_#0f172a] overflow-hidden z-20 animate-fade-in">
                                {categories.map((cat) => (
                                  <button
                                    key={cat}
                                    type="button"
                                    onClick={() => {
                                      handleSendAction("setCategory", { category: cat });
                                      setCatDropdownOpen(false);
                                    }}
                                    className="w-full px-4 py-2.5 hover:bg-sky-100 flex items-center gap-2.5 text-left text-xs text-slate-800 hover:text-slate-950 transition-colors border-b border-slate-200 last:border-0 font-bold"
                                  >
                                    {getCategoryIcon(cat, "w-3.5 h-3.5 stroke-[2.5]")}
                                    <span className="font-bold">{cat}</span>
                                  </button>
                                ))}
                              </div>
                            </>
                          )}
                        </div>

                        <button
                          onClick={() => handleSendAction("start", { category: room.category })}
                          disabled={totalNetworkPlayers < 3}
                          className="btn-marker-primary w-full py-3 text-xs tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer shadow-[3px_3px_0px_#0f172a]"
                        >
                          Start Game <ArrowRight className="w-4 h-4 stroke-[3]" />
                        </button>
                        {totalNetworkPlayers < 3 && (
                          <p className="text-[10px] text-orange-600 font-extrabold text-center mt-1">
                            At least 3 players are required to start online.
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="border-t-2 border-dashed border-slate-200 pt-5 text-center text-xs text-slate-500 font-extrabold py-2 animate-pulse">
                        Waiting for Host to configure and start the game...
                      </div>
                    )}
                  </div>
                )}

                {/* MULTIPLAYER REVEAL STATE (CONCURRENT READY) */}
                {room.gameState === "reveal" && (
                  <div className="glass-panel p-6 md:p-8 rounded-2xl shadow-2xl text-center space-y-6">
                    <div className="space-y-2">
                      <span className="inline-flex items-center gap-1 bg-sky-100 border-2 border-slate-900 rounded-full px-4 py-1.5 text-[10px] text-sky-850 font-black uppercase tracking-widest shadow-[2px_2px_0px_#0f172a]">
                        <Users className="w-3 h-3 stroke-[3]" /> Secret Word Assignment
                      </span>
                      <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none pt-2 font-handwritten">
                        Your Secret Word
                      </h2>
                      <p className="text-slate-655 text-xs md:text-sm max-w-xs mx-auto leading-relaxed font-bold">
                        Do not let other players see your screen! Memorize it, then check in below.
                      </p>
                    </div>

                    {/* Word display card */}
                    <div className="flex flex-col items-center justify-center py-2">
                      <div className="w-full max-w-xs p-6 bg-sky-50 border-2.5 border-slate-900 rounded-2xl shadow-[4px_4px_0px_#0f172a]">
                        <span className="block text-[10px] font-black text-sky-850 uppercase tracking-widest mb-1.5">
                          Your Assignment
                        </span>
                        <span className="text-3xl font-black text-sky-950 tracking-wide select-none font-handwritten bg-yellow-100 px-4 py-1.5 rounded border border-dashed border-sky-300 rotate-[-1deg]">
                          {myImpostorWord}
                        </span>
                      </div>
                    </div>

                    {/* Ready state control */}
                    {!room.revealedPlayers.includes(playerId) ? (
                      <button
                        onClick={() => handleSendAction("reveal")}
                        className="btn-marker-primary w-full py-4 text-center text-sm font-black uppercase flex items-center justify-center gap-2 cursor-pointer shadow-[3px_3px_0px_#0f172a]"
                      >
                        <CheckCircle className="w-4.5 h-4.5 stroke-[3]" /> Got It / Ready to Vote
                      </button>
                    ) : (
                      <div className="py-3 px-4 bg-sky-100 border-2 border-slate-900 text-sky-800 font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-[2px_2px_0px_#0f172a]">
                        <Check className="w-4 h-4 stroke-[3]" /> Ready! Waiting for others ({room.revealedPlayers.length}/{totalNetworkPlayers} ready)
                      </div>
                    )}

                    {/* List of players ready/not-ready status */}
                    <div className="border-t border-slate-200 pt-4 space-y-2">
                      <div className="text-[10px] font-black text-slate-650 uppercase tracking-wider text-left pl-1">
                        Player Status
                      </div>
                      <div className="grid grid-cols-2 gap-2 max-h-[120px] overflow-y-auto pr-1 custom-scrollbar">
                        {room.players.map((p) => {
                          const isReady = room.revealedPlayers.includes(p.id);
                          return (
                            <div
                              key={p.id}
                              className="flex items-center justify-between px-3.5 py-2 bg-white rounded-xl text-[11px] font-bold border-2 border-slate-200 shadow-[1.5px_1.5px_0px_#f1f5f9]"
                            >
                              <span className="truncate text-slate-700 font-extrabold">{p.name}</span>
                              {isReady ? (
                                <Check className="w-3.5 h-3.5 text-sky-600 stroke-[3] bg-sky-100 px-0.5 rounded border-2 border-slate-900 shadow-[1px_1px_0px_#0f172a]" />
                              ) : (
                                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* MULTIPLAYER VOTING STATE */}
                {room.gameState === "voting" && (
                  <div className="glass-panel p-6 md:p-8 rounded-2xl shadow-2xl text-center space-y-6">
                    <div className="space-y-2">
                      <span className="inline-flex items-center gap-1.5 bg-orange-100 border-2 border-slate-900 rounded-full px-4 py-1.5 text-[10px] text-orange-850 font-black uppercase tracking-widest shadow-[2px_2px_0px_#0f172a]">
                        <MessageSquare className="w-3.5 h-3.5 stroke-[3]" /> Discussion & Vote
                      </span>
                      <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none pt-2 font-handwritten">
                        Cast Your Vote
                      </h2>
                      <p className="text-slate-655 text-xs md:text-sm max-w-sm mx-auto leading-relaxed font-bold">
                        Discuss clues on chat or audio. Select the player you suspect is the Impostor!
                      </p>
                    </div>

                    {/* Display player's secret word prominently at the top of the voting screen */}
                    <div className="flex flex-col items-center justify-center py-1">
                      <div className="w-full max-w-xs p-4 bg-sky-50 border-2 border-slate-900 rounded-2xl shadow-[3px_3px_0px_#0f172a]">
                        <span className="block text-[10px] font-black text-sky-850 uppercase tracking-widest mb-1">
                          Your Secret Word
                        </span>
                        <span className="text-xl font-black text-sky-950 tracking-wide select-none font-handwritten bg-yellow-100 px-3.5 py-1 rounded border border-dashed border-sky-300 rotate-[1deg]">
                          {myImpostorWord}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
                      {room.players.map((p) => {
                        const playerHasVoted = p.votedFor !== null;
                        const isMe = p.id === playerId;
                        const playerIndex = room.players.indexOf(p);
                        const playerColor = PLAYER_COLORS[playerIndex % PLAYER_COLORS.length] || PLAYER_COLORS[0];
                        
                        return (
                          <button
                            key={p.id}
                            disabled={hasVoted}
                            onClick={() => handleSendAction("vote", { votedForId: p.id })}
                            className={`py-3 px-4 rounded-xl border-2 text-xs font-black transition-all duration-300 flex items-center justify-between gap-3 group relative select-none shadow-[3px_3px_0px_#0f172a] ${
                              hasVoted 
                                ? "bg-slate-50 border-slate-300 text-slate-450 cursor-default shadow-[1px_1px_0px_#cbd5e1]" 
                                : "bg-white border-slate-900 hover:bg-orange-50 hover:border-slate-900 text-slate-850 cursor-pointer hover:shadow-[4px_4px_0px_#0f172a]"
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              {/* Player Crewmate Avatar */}
                              <div className={`p-1 rounded-lg ${playerColor.bg} border-2 border-slate-900 shrink-0`}>
                                <CrewmateIcon fillClass={playerColor.fill} className="w-5 h-5" />
                              </div>
                              
                              <div className="flex flex-col items-start min-w-0 text-left">
                                <div className="flex items-center gap-1 flex-wrap">
                                  <span className="text-slate-850 group-hover:text-slate-950 font-black transition-colors break-words leading-tight">
                                    {p.name}
                                  </span>
                                  {isMe && (
                                    <span className="text-[9px] text-sky-600 font-extrabold bg-sky-50 border-2 border-slate-900 px-1.5 py-0.5 rounded ml-1 shadow-[1px_1px_0px_#0f172a]">
                                      (You)
                                    </span>
                                  )}
                                </div>
                                
                                {/* Voter icons below name (Among Us style) */}
                                {(() => {
                                  const voters = room.players.filter(v => v.votedFor === p.id);
                                  if (voters.length === 0) return null;
                                  return (
                                    <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                                      {voters.map(voter => {
                                        const voterIdx = room.players.indexOf(voter);
                                        const voterColor = PLAYER_COLORS[voterIdx % PLAYER_COLORS.length] || PLAYER_COLORS[0];
                                        return (
                                          <span 
                                            key={voter.id}
                                            className="inline-flex items-center justify-center p-0.5 rounded bg-white border border-slate-300 shadow-sm"
                                            title={voter.name}
                                          >
                                            <CrewmateIcon fillClass={voterColor.fill} className="w-3.5 h-3.5" />
                                          </span>
                                        );
                                      })}
                                    </div>
                                  );
                                })()}
                              </div>
                            </div>

                            {/* Voted check / pending dot */}
                            <div className="shrink-0">
                              {playerHasVoted ? (
                                <div className="flex items-center gap-1 bg-emerald-50 border-2 border-slate-900 px-2 py-1 rounded-lg shadow-[1.5px_1.5px_0px_#0f172a] select-none animate-fade-in">
                                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-emerald-600" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M4 10 h16 v10 H4 z" className="fill-white stroke-slate-900 stroke-[1.5]" />
                                    <path d="M8 10 V7 h8 v3" className="stroke-slate-900 stroke-[1.5]" />
                                    <path d="M9 13.5 l2 2 4-4" className="stroke-emerald-600 stroke-[2.5]" />
                                  </svg>
                                  <span className="text-[9px] text-emerald-800 font-extrabold uppercase tracking-wider">Voted</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1 bg-white border border-slate-300 px-2 py-1 rounded-lg select-none">
                                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse inline-block" />
                                  <span className="text-[9px] text-slate-450 font-extrabold uppercase tracking-wider">Voting</span>
                                </div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="border-t-2 border-dashed border-slate-200 pt-4 flex flex-col sm:flex-row justify-between items-center text-xs font-black text-slate-650 gap-3">
                      <div>
                        {hasVoted ? (
                          <span className="text-sky-600 flex items-center gap-1.5">
                            <Check className="w-4 h-4 stroke-[3]" /> Your vote is cast.
                          </span>
                        ) : (
                          <span className="text-orange-600 flex items-center gap-1.5 animate-pulse">
                            <AlertTriangle className="w-4 h-4 stroke-[3]" /> Select a player to eject.
                          </span>
                        )}
                      </div>
                      <div className="bg-white border-2 border-slate-900 px-3.5 py-1.5 rounded-xl text-[11px] font-mono shadow-[2px_2px_0px_#0f172a] text-slate-800">
                        VOTES: <span className="text-orange-600 font-black">{votedCount}</span> / <span className="text-slate-500">{totalNetworkPlayers}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* MULTIPLAYER RESULT STATE */}
                {room.gameState === "result" && room.votedPlayerId && (
                  <div className="glass-panel p-8 rounded-2xl shadow-2xl text-center space-y-8 animate-fade-in max-w-md mx-auto">
                    
                    {/* Winner layout */}
                    <div className="space-y-4">
                      {room.votedPlayerId === room.impostorId ? (
                        <div className="space-y-3 flex flex-col items-center">
                          <div className="p-4 bg-sky-100 border-2 border-slate-900 rounded-full shadow-[3px_3px_0px_#0f172a]">
                            <Trophy className="w-12 h-12 text-sky-600 stroke-[3] animate-bounce" />
                          </div>
                          <h2 className="text-3xl font-black text-sky-700 tracking-tight uppercase font-handwritten filter drop-shadow-[1.5px_1.5px_0px_#bae6fd]">
                            Civilians Win!
                          </h2>
                          <p className="text-slate-655 text-xs md:text-sm max-w-xs leading-relaxed font-bold">
                            You successfully voted out the Impostor! Great job.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3 flex flex-col items-center">
                          <div className="p-2 bg-rose-50 border-2 border-slate-900 rounded-full shadow-[3px_3px_0px_#0f172a]">
                            <ImpostorWinIcon className="w-14 h-14" />
                          </div>
                          <h2 className="text-3xl font-black text-rose-700 tracking-tight uppercase font-handwritten filter drop-shadow-[1.5px_1.5px_0px_#fda4af]">
                            Impostor Wins!
                          </h2>
                          <p className="text-slate-655 text-xs md:text-sm max-w-xs leading-relaxed font-semibold">
                            Civilians voted for <span className="font-black text-orange-600">
                              {room.players.find(p => p.id === room.votedPlayerId)?.name}
                            </span> who was innocent.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Word breakdown */}
                    <div className="p-5 bg-white border-2 border-slate-900 rounded-2xl space-y-4 text-left text-sm font-bold shadow-[3px_3px_0px_#0f172a]">
                      <div className="flex justify-between items-center pb-3 border-b-2 border-slate-100">
                        <span className="text-slate-600 flex items-center gap-1.5"><UserX className="w-4 h-4 text-orange-600 stroke-[2.5]" /> Impostor</span>
                        <span className="font-extrabold text-orange-600">
                          {room.players.find(p => p.id === room.impostorId)?.name}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pb-3 border-b-2 border-slate-100">
                        <span className="text-slate-600 flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-sky-600 stroke-[2.5]" /> Civilian Word</span>
                        <span className="font-extrabold text-sky-650">{room.civilianWord}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 flex items-center gap-1.5"><AlertTriangle className="w-4 h-4 text-orange-600 stroke-[2.5]" /> Impostor Word</span>
                        <span className="font-extrabold text-orange-600">{room.impostorWord}</span>
                      </div>
                    </div>

                    {/* Reset Trigger */}
                    {isHost ? (
                      <button
                        onClick={() => handleSendAction("reset")}
                        className="btn-marker-primary w-full py-3.5 text-center text-sm font-black uppercase flex items-center justify-center gap-2 cursor-pointer shadow-[4px_4px_0px_#0f172a]"
                      >
                        <RotateCcw className="w-4 h-4 stroke-[3]" /> Play Again
                      </button>
                    ) : (
                      <div className="text-xs text-slate-500 font-extrabold uppercase tracking-widest py-2 animate-pulse">
                        Waiting for Host to return to lobby...
                      </div>
                    )}
                  </div>
                )}

              </div>
            )}
          </>
        )}
      </>
    )}

      </div>

      {/* CREATE FRIEND GROUP MODAL (Local) */}
      {showCreateGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setShowCreateGroup(false)} />
          <div className="glass-panel p-6 rounded-2xl w-full max-w-md shadow-2xl relative z-10 space-y-4 max-h-[90vh] flex flex-col justify-between animate-fade-in">
            <button 
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-700 p-1 cursor-pointer transition-colors"
              onClick={() => setShowCreateGroup(false)}
            >
              <X className="w-5 h-5 stroke-[3]" />
            </button>
            
            <div className="space-y-4 overflow-y-auto pr-1.5 custom-scrollbar">
              <h3 className="text-lg font-black text-slate-900 font-handwritten uppercase tracking-wide border-b-2 border-dashed border-slate-200 pb-3 pl-0.5">
                {editingGroupName ? "Edit Friend Group" : "Create Friend Group"}
              </h3>
              
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider pl-0.5">
                  Group Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Family Game Night"
                  value={groupNameInput}
                  onChange={(e) => setGroupNameInput(e.target.value)}
                  disabled={editingGroupName !== null}
                  className="w-full bg-white border-2 border-slate-900 focus:border-sky-500 rounded-xl px-4 py-2.5 text-xs text-slate-950 focus:outline-none font-bold transition-all shadow-[2px_2px_0px_#0f172a]"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center px-0.5">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider">
                    Members ({groupMembers.length})
                  </label>
                  <button
                    onClick={() => setGroupMembers(prev => [...prev, ""])}
                    className="btn-marker-primary text-[10px] px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer font-black shadow-[2px_2px_0px_#0f172a]"
                  >
                    <Plus className="w-3 h-3 stroke-[3]" /> Add Member
                  </button>
                </div>
                
                <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1.5 custom-scrollbar">
                  {groupMembers.map((member, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        placeholder={`Member ${index + 1}`}
                        value={member}
                        onChange={(e) => {
                          const val = e.target.value;
                          setGroupMembers(prev => {
                            const next = [...prev];
                            next[index] = val;
                            return next;
                          });
                        }}
                        className="flex-1 bg-white border-2 border-slate-900 focus:border-sky-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-950 focus:outline-none font-bold transition-all shadow-[2px_2px_0px_#0f172a]"
                      />
                      {groupMembers.length > 3 && (
                        <button
                          onClick={() => {
                            setGroupMembers(prev => prev.filter((_, i) => i !== index));
                          }}
                          className="btn-marker-danger px-3.5 py-2.5 rounded-xl flex items-center justify-center cursor-pointer shadow-[2px_2px_0px_#0f172a]"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
 
            <div className="pt-4 border-t-2 border-dashed border-slate-200 flex gap-3">
              <button
                onClick={() => setShowCreateGroup(false)}
                className="btn-marker-gray flex-1 py-3 text-xs uppercase cursor-pointer text-center font-black shadow-[3px_3px_0px_#0f172a]"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveGroup}
                className="btn-marker-primary flex-1 py-3 text-xs uppercase cursor-pointer text-center font-black shadow-[3px_3px_0px_#0f172a]"
              >
                Save Group
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MANAGE FRIEND GROUPS MODAL (Local) */}
      {showManageGroups && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setShowManageGroups(false)} />
          <div className="glass-panel p-6 rounded-2xl w-full max-w-md shadow-2xl relative z-10 space-y-4 max-h-[80vh] flex flex-col justify-between animate-fade-in">
            <button 
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-700 p-1 cursor-pointer transition-colors"
              onClick={() => setShowManageGroups(false)}
            >
              <X className="w-5 h-5 stroke-[3]" />
            </button>

            <h3 className="text-lg font-black text-slate-900 font-handwritten uppercase tracking-wide border-b-2 border-dashed border-slate-200 pb-3 pl-0.5">
              Manage Friend Groups
            </h3>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1.5 custom-scrollbar min-h-[220px] max-h-[350px]">
              {Object.keys(friendGroups).length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-xs space-y-2">
                  <p className="font-bold">No groups created yet.</p>
                  <button
                    onClick={() => {
                      setShowManageGroups(false);
                      setShowCreateGroup(true);
                    }}
                    className="text-xs text-sky-600 hover:text-sky-750 hover:underline cursor-pointer font-black transition-all"
                  >
                    Create your first group
                  </button>
                </div>
              ) : (
                Object.entries(friendGroups).map(([gName, members]) => (
                  <div key={gName} className="p-4 bg-slate-50 border-2 border-slate-900 rounded-2xl space-y-3.5 shadow-[2.5px_2.5px_0px_#0f172a]">
                    <div className="space-y-1">
                      <h4 className="font-black text-slate-900 text-xs">{gName}</h4>
                      <p className="text-[10px] text-slate-650 font-semibold leading-normal line-clamp-2">
                        {members.length} members: {members.join(", ")}
                      </p>
                    </div>
                    <div className="flex gap-2 justify-end pt-1">
                      <button
                        onClick={() => handleUseGroupFromManage(gName)}
                        className="btn-marker-primary text-[10px] px-3.5 py-1.5 rounded-lg font-black shadow-[2px_2px_0px_#0f172a] flex items-center gap-0.5 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" /> Use
                      </button>
                      <button
                        onClick={() => handleEditGroup(gName)}
                        className="btn-marker-gray text-[10px] px-3.5 py-1.5 rounded-lg font-black shadow-[2px_2px_0px_#0f172a] flex items-center gap-0.5 cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteGroup(gName)}
                        className="btn-marker-danger text-[10px] px-3.5 py-1.5 rounded-lg font-black shadow-[2px_2px_0px_#0f172a] flex items-center gap-0.5 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3 text-rose-800" /> Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setShowManageGroups(false)}
              className="btn-marker-gray w-full py-3 text-xs font-black uppercase tracking-wider cursor-pointer shadow-[3px_3px_0px_#0f172a]"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
