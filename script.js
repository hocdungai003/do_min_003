const DIFFICULTIES = {
    easy: { rows: 8, cols: 8, mines: 10 },
    medium: { rows: 16, cols: 16, mines: 40 },
    hard: { rows: 16, cols: 30, mines: 99 },
  };
  let ROWS, COLS, MINES;
  let board = [];
  let gameOver = false;
  let timerInterval;
  let seconds = 0;
  let minesFlagged = 0;
  let isFlagMode = false;
  let currentDifficulty = 'easy';
  
  // Initialize the board
  function initBoard() {
    board = Array.from({ length: ROWS }, () =>
      Array.from({ length: COLS }, () => ({
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        neighborMines: 0,
      }))
    );
  
    // Place mines randomly
    let minesPlaced = 0;
    while (minesPlaced < MINES) {
      const row = Math.floor(Math.random() * ROWS);
      const col = Math.floor(Math.random() * COLS);
      if (!board[row][col].isMine) {
        board[row][col].isMine = true;
        minesPlaced++;
      }
    }
  
    // Calculate neighbor mines
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (!board[r][c].isMine) {
          board[r][c].neighborMines = countNeighborMines(r, c);
        }
      }
    }
  }
  
  // Count mines in neighboring cells
  function countNeighborMines(row, col) {
    let count = 0;
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const nr = row + dr;
        const nc = col + dc;
        if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && board[nr][nc].isMine) {
          count++;
        }
      }
    }
    return count;
  }
  
  // Render the board
  function renderBoard() {
    const boardElement = document.getElementById('board');
    let cellSize;
    let gapSize = 2;
    if (window.innerWidth <= 600) {
      const viewportWidth = window.innerWidth * 0.95;
      const viewportHeight = window.innerHeight * 0.8;
      const padding = 16;
      gapSize = currentDifficulty === 'hard' ? 0.5 : 1;
      const gaps = (COLS - 1) * gapSize;
      const heightBasedSize = (viewportHeight - padding - (ROWS - 1) * gapSize) / ROWS;
      const widthBasedSize = (viewportWidth - padding - gaps) / COLS;
      cellSize = Math.min(heightBasedSize, widthBasedSize, 30);
      if (window.innerWidth <= 400) {
        cellSize = Math.min(heightBasedSize, widthBasedSize, 28);
      }
    } else {
      cellSize = 40;
    }
    boardElement.style.setProperty('--cell-size', `${cellSize}px`);
    boardElement.style.setProperty('--gap-size', `${gapSize}px`);
    boardElement.style.gridTemplateColumns = `repeat(${COLS}, var(--cell-size))`;
    boardElement.style.gap = `var(--gap-size)`;
    boardElement.innerHTML = '';
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.row = r;
        cell.dataset.col = c;
  
        if (board[r][c].isRevealed) {
          cell.classList.add('revealed');
          if (board[r][c].isMine) {
            cell.classList.add('mine');
          } else if (board[r][c].neighborMines > 0) {
            cell.textContent = board[r][c].neighborMines;
            cell.dataset.value = board[r][c].neighborMines;
          }
        } else if (board[r][c].isFlagged) {
          cell.classList.add('flagged');
          cell.innerHTML = '<i class="material-icons">flag</i>';
        }
  
        cell.addEventListener('click', handleCellClick);
        cell.addEventListener('contextmenu', handleRightClick);
        cell.addEventListener('touchstart', handleTouchStart, { passive: false });
        boardElement.appendChild(cell);
      }
    }
  }
  
  // Handle cell click (desktop and mobile)
  function handleCellClick(e) {
    e.preventDefault();
    if (gameOver) return;
    const row = parseInt(e.target.dataset.row || e.target.parentElement.dataset.row);
    const col = parseInt(e.target.dataset.col || e.target.parentElement.dataset.col);
    if (board[row][col].isRevealed) return;
  
    if (isFlagMode) {
      handleFlag(row, col);
    } else {
      handleReveal(row, col);
    }
  }
  
  // Handle right click (desktop flag in flag mode)
  function handleRightClick(e) {
    e.preventDefault();
    if (gameOver) return;
    const row = parseInt(e.target.dataset.row || e.target.parentElement.dataset.row);
    const col = parseInt(e.target.dataset.col || e.target.parentElement.dataset.col);
    if (board[row][col].isRevealed) return;
    
    // Luôn cắm cờ với click chuột phải
    handleFlag(row, col);
  }
  
  // Handle touch start (mobile)
  function handleTouchStart(e) {
    e.preventDefault();
    if (gameOver) return;
    const row = parseInt(e.target.dataset.row || e.target.parentElement.dataset.row);
    const col = parseInt(e.target.dataset.col || e.target.parentElement.dataset.col);
    if (board[row][col].isRevealed) return;
  
    if (isFlagMode) {
      handleFlag(row, col);
    } else {
      handleReveal(row, col);
    }
  }
  
  // Handle reveal action
  function handleReveal(row, col) {
    if (board[row][col].isFlagged || board[row][col].isRevealed) return;
  
    // Start timer on first click
    if (!timerInterval) {
      startTimer();
    }
  
    if (board[row][col].isMine) {
      board[row][col].isRevealed = true;
      gameOver = true;
      revealAllMines();
      renderBoard();
      stopTimer();
      document.getElementById('statusMessage').textContent = 'Thua cuộc';
      document.getElementById('statusMessage').classList.add('loss');
      document.getElementById('statusMessage').classList.remove('win');
      document.getElementById('board').classList.add('loss');
      return;
    }
  
    revealCell(row, col);
    renderBoard();
    checkWin();
  }
  
  // Handle flag action
  function handleFlag(row, col) {
    if (board[row][col].isRevealed) return;
  
    if (!board[row][col].isFlagged && minesFlagged >= MINES) {
      document.getElementById('statusMessage').textContent = 'Đã cắm đủ số cờ!';
      document.getElementById('statusMessage').classList.add('loss');
      document.getElementById('statusMessage').classList.remove('win');
      setTimeout(() => {
        if (!gameOver) {
          document.getElementById('statusMessage').textContent = '';
          document.getElementById('statusMessage').classList.remove('loss');
        }
      }, 2000);
      return;
    }
  
    board[row][col].isFlagged = !board[row][col].isFlagged;
    minesFlagged += board[row][col].isFlagged ? 1 : -1;
    document.getElementById('mineCounter').textContent = `Cờ: ${minesFlagged}/${MINES}`;
    renderBoard();
  }
  
  // Reveal a cell and its neighbors if necessary
  function revealCell(row, col) {
    if (row < 0 || row >= ROWS || col < 0 || col >= COLS || board[row][col].isRevealed || board[row][col].isFlagged) {
      return;
    }
  
    board[row][col].isRevealed = true;
    if (board[row][col].neighborMines === 0) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr !== 0 || dc !== 0) {
            revealCell(row + dr, col + dc);
          }
        }
      }
    }
  }
  
  // Reveal all mines on game over
  function revealAllMines() {
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (board[r][c].isMine) {
          board[r][c].isRevealed = true;
        }
      }
    }
  }
  
  // Check if the player has won
  function checkWin() {
    let unrevealedCount = 0;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (!board[r][c].isRevealed && !board[r][c].isMine) {
          unrevealedCount++;
        }
      }
    }
    if (unrevealedCount === 0) {
      gameOver = true;
      stopTimer();
      document.getElementById('statusMessage').textContent = 'Chúc mừng! Bạn đã thắng!';
      document.getElementById('statusMessage').classList.add('win');
      document.getElementById('statusMessage').classList.remove('loss');
      document.getElementById('board').classList.add('win');
    }
  }
  
  // Start the timer
  function startTimer() {
    timerInterval = setInterval(() => {
      seconds++;
      document.getElementById('timer').textContent = `Thời gian: ${seconds}`;
    }, 1000);
  }
  
  // Stop the timer
  function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  
  // Toggle between reveal and flag mode
  function toggleMode() {
    isFlagMode = !isFlagMode;
    const modeButton = document.getElementById('modeToggleBtn');
    modeButton.innerHTML = isFlagMode ? '<i class="material-icons">flag</i> Cắm cờ' : '<i class="material-icons">visibility</i> Mở ô';
    modeButton.classList.toggle('flag-mode', isFlagMode);
  }
  
  // Start a new game
  function startGame(difficulty) {
    currentDifficulty = difficulty;
    const config = DIFFICULTIES[difficulty];
    ROWS = config.rows;
    COLS = config.cols;
    MINES = config.mines;
    gameOver = false;
    minesFlagged = 0;
    seconds = 0;
    isFlagMode = false;
    stopTimer();
    document.getElementById('mineCounter').textContent = `Cờ: 0/${MINES}`;
    document.getElementById('timer').textContent = `Thời gian: 0`;
    document.getElementById('statusMessage').textContent = '';
    document.getElementById('statusMessage').classList.remove('loss', 'win');
    document.getElementById('board').classList.remove('loss', 'win');
    document.getElementById('modeToggleBtn').innerHTML = '<i class="material-icons">visibility</i> Mở ô';
    document.getElementById('modeToggleBtn').classList.remove('flag-mode');
    document.getElementById('menu').classList.add('hidden');
    document.getElementById('game').classList.remove('hidden');
    initBoard();
    renderBoard();
  }
  
  // Reset the game (restart with same difficulty)
  function resetGame() {
    startGame(currentDifficulty);
  }
  
  // Return to menu
  function returnToMenu() {
    document.getElementById('menu').classList.remove('hidden');
    document.getElementById('game').classList.add('hidden');
  }
  
  // Event listeners
  document.getElementById('easyBtn').addEventListener('click', () => startGame('easy'));
  document.getElementById('mediumBtn').addEventListener('click', () => startGame('medium'));
  document.getElementById('hardBtn').addEventListener('click', () => startGame('hard'));
  document.getElementById('replayBtn').addEventListener('click', resetGame);
  document.getElementById('backBtn').addEventListener('click', returnToMenu);
  document.getElementById('modeToggleBtn').addEventListener('click', toggleMode);