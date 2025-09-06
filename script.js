let wordBank = {};
let civilianWord = "";
let impostorWord = "";
let currentPlayer = 0;
let totalPlayers = 0;
let impostorIndex = 0;
let playerNames = []; // store names

async function loadWords() {
  try {
    const response = await fetch("words.json");
    wordBank = await response.json();
  } catch (error) {
    console.error("Failed to load words.json:", error);
  }
}

// Generate input fields for names
function generateNameInputs() {
  totalPlayers = parseInt(document.getElementById("numPlayers").value);
  if (isNaN(totalPlayers) || totalPlayers < 3 || totalPlayers > 12) {
    alert("Please enter a number between 3 and 12!");
    return;
  }

  const container = document.getElementById("playerNamesContainer");
  container.innerHTML = "";

  for (let i = 0; i < totalPlayers; i++) {
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = `Name of Player ${i+1}`;
    input.id = `playerName${i}`;
    container.appendChild(input);
    container.appendChild(document.createElement("br"));
  }

  document.getElementById("startBtn").classList.remove("hidden");
}

// Start game with names
function startGame() {
  playerNames = [];
  for (let i = 0; i < totalPlayers; i++) {
    const name = document.getElementById(`playerName${i}`).value.trim();
    if (!name) {
      alert(`Please enter a name for Player ${i+1}`);
      return;
    }
    playerNames.push(name);
  }

  const category = document.getElementById("category").value;
  const words = wordBank[category];

  civilianWord = words[Math.floor(Math.random() * words.length)];
  do {
    impostorWord = words[Math.floor(Math.random() * words.length)];
  } while (impostorWord === civilianWord);

  impostorIndex = Math.floor(Math.random() * totalPlayers); // index in array

  currentPlayer = 0;
  document.querySelector(".category-select").classList.add("hidden");
  document.getElementById("revealContainer").classList.remove("hidden");
  document.getElementById("playerTitle").textContent = `${playerNames[currentPlayer]}'s Turn`;
}

// Reveal word
function revealWord() {
  const word = (currentPlayer === impostorIndex) ? impostorWord : civilianWord;
  const wordDisplay = document.getElementById("wordDisplay");
  wordDisplay.textContent = word;
  wordDisplay.classList.remove("hidden");

  document.getElementById("revealBtn").classList.add("hidden");
  document.getElementById("nextBtn").classList.remove("hidden");
}

// Next player
function nextPlayer() {
  currentPlayer++;
  if (currentPlayer >= totalPlayers) {
    document.getElementById("revealContainer").classList.add("hidden");
    startVoting();
  } else {
    document.getElementById("playerTitle").textContent = `${playerNames[currentPlayer]}'s Turn`;
    document.getElementById("wordDisplay").classList.add("hidden");
    document.getElementById("revealBtn").classList.remove("hidden");
    document.getElementById("nextBtn").classList.add("hidden");
  }
}

// Voting
function startVoting() {
  const voteContainer = document.getElementById("voteContainer");
  voteContainer.classList.remove("hidden");

  const voteButtons = document.getElementById("voteButtons");
  voteButtons.innerHTML = "";

  for (let i = 0; i < totalPlayers; i++) {
    const btn = document.createElement("button");
    btn.textContent = playerNames[i];
    btn.onclick = () => endVoting(i);
    voteButtons.appendChild(btn);
  }
}

function endVoting(votedIndex) {
  const result = document.getElementById("voteResult");
  if (votedIndex === impostorIndex) {
    result.textContent = `🎉 ${playerNames[votedIndex]} was the impostor! Civilians win!`;
  } else {
    result.textContent = `😢 ${playerNames[votedIndex]} was not the impostor. The impostor was ${playerNames[impostorIndex]}.`;
  }
  document.querySelectorAll("#voteButtons button").forEach(btn => btn.disabled = true);
}

loadWords();
