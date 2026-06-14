let wordBank = {};
let civilianWord = "";
let impostorWord = "";
let currentPlayer = 0;
let totalPlayers = 0;
let impostorIndex = 0;
let playerNames = []; // store names
let friendGroups = {}; // store friend groups
let currentGroupMembers = []; // current group being created

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

// Friend Groups Management Functions
function loadFriendGroups() {
  const saved = localStorage.getItem('imposterGameFriendGroups');
  if (saved) {
    friendGroups = JSON.parse(saved);
    updateGroupSelect();
  }
}

function saveFriendGroups() {
  localStorage.setItem('imposterGameFriendGroups', JSON.stringify(friendGroups));
}

function updateGroupSelect() {
  const select = document.getElementById('groupSelect');
  select.innerHTML = '<option value="">-- Select a group --</option>';
  
  for (const [groupName, members] of Object.entries(friendGroups)) {
    const option = document.createElement('option');
    option.value = groupName;
    option.textContent = `${groupName} (${members.length} members)`;
    select.appendChild(option);
  }
}

function handleGroupSelection() {
  const selectedGroup = document.getElementById('groupSelect').value;
  if (selectedGroup && friendGroups[selectedGroup]) {
    // Auto-fill the number of players and generate inputs
    const members = friendGroups[selectedGroup];
    document.getElementById('numPlayers').value = members.length;
    generateNameInputsFromGroup(members);
  }
}

function generateNameInputsFromGroup(members) {
  const container = document.getElementById("playerNamesContainer");
  container.innerHTML = "";

  for (let i = 0; i < members.length; i++) {
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = `Name of Player ${i+1}`;
    input.id = `playerName${i}`;
    input.value = members[i]; // Pre-fill with group member names
    container.appendChild(input);
    container.appendChild(document.createElement("br"));
  }

  document.getElementById("startBtn").classList.remove("hidden");
}

// Modal Functions
function showCreateGroupModal() {
  const modal = document.getElementById('createGroupModal');
  modal.classList.remove('hidden');
  document.body.classList.add('modal-open'); // Prevent body scroll
  document.getElementById('groupNameInput').value = '';
  currentGroupMembers = [];
  updateGroupMembersContainer();
  
  // Add click outside to close
  modal.onclick = function(event) {
    if (event.target === modal) {
      closeCreateGroupModal();
    }
  };
}

function closeCreateGroupModal() {
  const modal = document.getElementById('createGroupModal');
  modal.classList.add('hidden');
  document.body.classList.remove('modal-open'); // Restore body scroll
  modal.onclick = null; // Remove event listener
}

function showManageGroupsModal() {
  const modal = document.getElementById('manageGroupsModal');
  modal.classList.remove('hidden');
  document.body.classList.add('modal-open'); // Prevent body scroll
  displayGroupsList();
  
  // Add click outside to close
  modal.onclick = function(event) {
    if (event.target === modal) {
      closeManageGroupsModal();
    }
  };
}

function closeManageGroupsModal() {
  const modal = document.getElementById('manageGroupsModal');
  modal.classList.add('hidden');
  document.body.classList.remove('modal-open'); // Restore body scroll
  modal.onclick = null; // Remove event listener
}

function addMemberToGroup() {
  currentGroupMembers.push('');
  updateGroupMembersContainer();
}

function updateGroupMembersContainer() {
  const container = document.getElementById('groupMembersContainer');
  container.innerHTML = '';
  
  currentGroupMembers.forEach((member, index) => {
    const memberDiv = document.createElement('div');
    memberDiv.className = 'member-input';
    
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = `Member ${index + 1} name`;
    input.value = member;
    input.onchange = (e) => currentGroupMembers[index] = e.target.value;
    
    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-member';
    removeBtn.innerHTML = '×';
    removeBtn.onclick = () => removeMemberFromGroup(index);
    
    memberDiv.appendChild(input);
    memberDiv.appendChild(removeBtn);
    container.appendChild(memberDiv);
  });
}

function removeMemberFromGroup(index) {
  currentGroupMembers.splice(index, 1);
  updateGroupMembersContainer();
}

function saveGroup() {
  const groupName = document.getElementById('groupNameInput').value.trim();
  if (!groupName) {
    alert('Please enter a group name!');
    return;
  }
  
  const members = currentGroupMembers.filter(member => member.trim() !== '');
  if (members.length < 3) {
    alert('A group must have at least 3 members!');
    return;
  }
  
  if (friendGroups[groupName]) {
    if (!confirm(`A group named "${groupName}" already exists. Do you want to replace it?`)) {
      return;
    }
  }
  
  friendGroups[groupName] = members;
  saveFriendGroups();
  updateGroupSelect();
  closeCreateGroupModal();
  alert(`Group "${groupName}" saved successfully!`);
}

function displayGroupsList() {
  const container = document.getElementById('groupsList');
  container.innerHTML = '';
  
  if (Object.keys(friendGroups).length === 0) {
    container.innerHTML = '<p>No groups created yet. Create your first group!</p>';
    return;
  }
  
  for (const [groupName, members] of Object.entries(friendGroups)) {
    const groupDiv = document.createElement('div');
    groupDiv.className = 'group-item';
    
    groupDiv.innerHTML = `
      <div class="group-info">
        <h4>${groupName}</h4>
        <p>${members.length} members: ${members.join(', ')}</p>
      </div>
      <div class="group-actions">
        <button onclick="editGroup('${groupName}')">Edit</button>
        <button onclick="useGroup('${groupName}')">Use</button>
        <button class="delete" onclick="deleteGroup('${groupName}')">Delete</button>
      </div>
    `;
    
    container.appendChild(groupDiv);
  }
}

function editGroup(groupName) {
  const members = friendGroups[groupName];
  document.getElementById('groupNameInput').value = groupName;
  currentGroupMembers = [...members];
  updateGroupMembersContainer();
  closeManageGroupsModal();
  showCreateGroupModal();
}

function useGroup(groupName) {
  document.getElementById('groupSelect').value = groupName;
  handleGroupSelection();
  closeManageGroupsModal();
}

function deleteGroup(groupName) {
  if (confirm(`Are you sure you want to delete the group "${groupName}"?`)) {
    delete friendGroups[groupName];
    saveFriendGroups();
    updateGroupSelect();
    displayGroupsList();
  }
}

// Keyboard support for modals
document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    // Close any open modal
    if (!document.getElementById('createGroupModal').classList.contains('hidden')) {
      closeCreateGroupModal();
    } else if (!document.getElementById('manageGroupsModal').classList.contains('hidden')) {
      closeManageGroupsModal();
    }
  }
});

// Initialize friend groups on page load
loadWords();
loadFriendGroups();
