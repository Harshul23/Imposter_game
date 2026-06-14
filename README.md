# 🕵️‍♂️ Impostor Word Game

An interactive, premium social deduction game built with **Next.js**, **React**, and **Tailwind CSS**. Players must guess who among them is the hidden Impostor using clever single-word clues, while the Impostor tries to blend in with a closely related secret word.

---

## 🎮 Game Rules & Loop

### 1. The Setup
- Players enter their nickname (which is securely saved on their device's local storage for seamless room entry).
- The host selects a category (e.g. *Food*, *Animals*, *Locations*, *Brands*) and the number of players.
- The game assigns words:
  - **Civilians** receive the secret **Civilian Word** (e.g., *Apple*).
  - The **Impostor** receives the **Impostor Word**, a closely related but different word (e.g., *Pear*).

### 2. The Clue Phase
- In turn order, each player must give a **single-word clue** that relates to their secret word.
- **Civilians** try to give clues that prove to other civilians they know the secret word, without being too obvious (otherwise the Impostor will guess it).
- The **Impostor** must listen to others' clues and invent a matching clue to blend in and avoid detection.

### 3. Discussion & Voting (Among Us Style)
- After all clues are shared, players discuss and vote for the player they suspect is the Impostor.
- The game features a fully custom **Among Us themed voting screen**:
  - **Avatars**: Every player has a custom-colored Crewmate avatar.
  - **Voter Reveal**: See who voted for whom via visual crewmate symbols appearing on the player cards.
  - **Voted Status**: Real-time status shows a Ballot Box check symbol once a player has cast their vote.

### 4. The Verdict
- If the civilians successfully vote out the Impostor, **Civilians Win!**
- If the civilians vote out an innocent player, the **Impostor Wins!** (Triggering an Among Us style red shushing crewmate win screen).

---

## ✨ Features

- 🌐 **Two Play Modes**:
  - **Local Pass & Play**: Play offline with friends passing a single device around.
  - **Online Multiplayer**: Create rooms with 4-letter codes and play synchronously on separate devices.
- 🎭 **Premium Visuals**: Sleek dark mode theme with glassmorphic panels, vibrant accent glows, micro-animations, and custom SVG icons.
- 💾 **Instant Identity**: Automated username caching via local storage makes joining or creating rooms zero-friction.
- ⚙️ **Host Settings**: Host controls player count (with custom step buttons) and categories.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: Next.js 16 (App Router), React, Tailwind CSS, Lucide Icons
- **State Store**: Lightweight Next.js API route handlers utilizing a global in-memory room store (`globalThis.roomStore`) to register and update multiplayer rooms in real time.
- **Network Sync**: Fast client-side polling ensuring state updates sync within 1.5 seconds across all player devices.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18.x or higher recommended)
- npm or yarn

### Installation
1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser to start playing!
