# ⚔️ Vim Hero

*[Русская версия](README.md)*

**Vim Hero** is an interactive web game designed for learning and practicing Vim editor commands. The project turns the mastery of this powerful text editor into an engaging journey through worlds of increasing difficulty.

## 🚀 Features

- **Real Vim Engine:** A fully custom keystroke handler without any third-party libraries. Supports `Normal` and `Insert` modes.
- **Advanced Vim Motions:**
  - Basic navigation: `h`, `j`, `k`, `l`, `w`, `b`, `e`, `0`, `$`, `^`, `G`
  - Pending motions: character search `f`, `F`, `t`, `T`
  - Operators: yank `yy`, delete `dd`, change `cc`, paste `p`
  - Text Objects: change or delete inside quotes or brackets (e.g., `ci"`, `di{`, `yi(`).
- **Game Progression:** Various worlds and levels (Challenges). To unlock the next world, you must successfully complete all challenges in the current one.
- **Multi-language Support (i18n):** A built-in localization system that allows switching languages on the fly.
- **Hidden Mechanics:** 
  <details>
  <summary>🤫 <i>Click here for a secret...</i></summary>
  <br>
  There is a classic Konami Code hidden in the game! Enter the secret combination (<code>↑ ↑ ↓ ↓ ← → ← → B A</code>) in the main menu to instantly unlock all levels and worlds. Enjoy!
  </details>

## 🏗 Architecture & Technologies

The project was built with a focus on performance, modularity, and zero unnecessary dependencies:

- **Frontend:** React 18 + Vite
- **State Management:** React Context API + `useReducer` (saving progress in `localStorage`).
- **No Heavy Dependencies:** Routing and state management are implemented natively.
- **Isolated Engine:** The logic for parsing Vim commands is completely separated from the UI components (pure functions, immutable state updates).

## 🛠 Local Setup

Make sure you have [Node.js](https://nodejs.org/) installed (version 18+ recommended).

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/vim-hero.git
   cd vim-hero
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open your browser at the address provided in the terminal (usually `http://localhost:5173`).

## 🎮 How to Play

1. Click "Begin" on the main screen.
2. Select an available world and challenge.
3. You will see an editor with text and a task.
4. Complete the objective using **only** Vim keystrokes.
5. Enjoy the process and build up your muscle memory!

---

*Made with love for everyone who wants to stop being afraid of quitting Vim!* 🚀
