function createPlayer(name, marker) {
  return { name, marker };
}

const Gameboard = (() => {
  const SIZE = 9;
  let board = Array(SIZE).fill("");

  const getBoard = () => [...board]; 
  const isEmpty = (index) => board[index] === "";

  const placeMark = (index, marker) => {
    if (index < 0 || index >= SIZE || !isEmpty(index)) return false;
    board[index] = marker;
    return true;
  };

  const isFull = () => board.every((cell) => cell !== "");
  const reset = () => {
    board = Array(SIZE).fill("");
  };

  return { getBoard, placeMark, isFull, reset };
})();

const Game = (() => {
  const WIN_LINES = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], 
    [0, 3, 6], [1, 4, 7], [2, 5, 8], 
    [0, 4, 8], [2, 4, 6],           
  ];

  let players = [];
  let currentPlayer = null;
  let gameOver = false;
  let winner = null;
  let winningLine = [];

  const start = (name1, name2) => {
    players = [
      createPlayer(name1 || "Player 1", "X"),
      createPlayer(name2 || "Player 2", "O"),
    ];
    currentPlayer = players[0];
    gameOver = false;
    winner = null;
    winningLine = [];
    Gameboard.reset();
  };

  const checkWinner = (marker) => {
    const board = Gameboard.getBoard();
    return WIN_LINES.find((line) => line.every((i) => board[i] === marker)) || null;
  };

  
  const playTurn = (index) => {
    if (gameOver || !currentPlayer) return false;
    if (!Gameboard.placeMark(index, currentPlayer.marker)) return false; 

    const line = checkWinner(currentPlayer.marker);
    if (line) {
      gameOver = true;
      winner = currentPlayer;
      winningLine = line;
    } else if (Gameboard.isFull()) {
      gameOver = true; 
    } else {
      currentPlayer = currentPlayer === players[0] ? players[1] : players[0];
    }
    return true;
  };

  const getState = () => ({
    started: currentPlayer !== null,
    currentPlayer,
    gameOver,
    winner,
    winningLine: [...winningLine],
    isTie: gameOver && winner === null,
  });

  return { start, playTurn, getState };
})();

const DisplayController = (() => {
  const boardEl = document.querySelector("#board");
  const statusEl = document.querySelector("#status");
  const setupForm = document.querySelector("#setup-form");
  const restartBtn = document.querySelector("#restart-btn");

  const buildBoard = () => {
    boardEl.innerHTML = "";
    for (let i = 0; i < 9; i++) {
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "cell";
      cell.dataset.index = i;
      boardEl.appendChild(cell);
    }
  };

  const render = () => {
    const board = Gameboard.getBoard();
    const state = Game.getState();

    boardEl.querySelectorAll(".cell").forEach((cell, i) => {
      const mark = board[i];
      cell.textContent = mark;
      cell.className = "cell";
      if (mark) cell.classList.add(mark.toLowerCase());
      if (state.winningLine.includes(i)) cell.classList.add("win");
      cell.disabled = Boolean(mark) || !state.started || state.gameOver;
    });

    if (!state.started) {
      statusEl.textContent = "Enter names and press “Start game”.";
    } else if (state.winner) {
      statusEl.textContent = `${state.winner.name} (${state.winner.marker}) wins! 🎉`;
    } else if (state.isTie) {
      statusEl.textContent = "It's a tie!";
    } else {
      statusEl.textContent = `${state.currentPlayer.name}'s turn (${state.currentPlayer.marker})`;
    }
  };

  const startGame = () => {
    const data = new FormData(setupForm);
    Game.start(data.get("player1").trim(), data.get("player2").trim());
    restartBtn.hidden = false;
    document.querySelector("#start-btn").textContent = "New names";
    render();
  };

  const init = () => {
    buildBoard();
    render();

    setupForm.addEventListener("submit", (event) => {
      event.preventDefault();
      startGame();
    });

    restartBtn.addEventListener("click", startGame);

    boardEl.addEventListener("click", (event) => {
      const cell = event.target.closest(".cell");
      if (!cell) return;
      if (Game.playTurn(Number(cell.dataset.index))) render();
    });
  };

  return { init };
})();

DisplayController.init();