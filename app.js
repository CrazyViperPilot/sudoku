const sudokuGen = new SudokuGenerator();
let currentPuzzle = [];
let currentSolution = [];
let userBoard = [];
let selectedCell = null;
let currentDifficulty = 'easy';
let toastTimer = null; // used to debounce/cancel pending toasts

const boardEl = document.getElementById('board');
const numpadEl = document.getElementById('numpad');
const btnNewGame = document.getElementById('btnNewGame');
const btnHint = document.getElementById('btnHint');
const btnErase = document.getElementById('btnErase');

// =============================================================
// Toast / Love-Messages
// =============================================================

/**
 * Displays a temporary Glassmorphism toast overlay at the bottom
 * of the screen. Disappears automatically after 2 seconds.
 * pointer-events: none so it never blocks gameplay.
 * @param {string} message  - The text to display
 * @param {number} [duration=2000] - Visible duration in ms
 */
function showToast(message, duration = 2000) {
    // Cancel any in-flight toast to avoid stacking
    if (toastTimer) {
        clearTimeout(toastTimer);
        const old = document.getElementById('love-toast');
        if (old) old.remove();
    }

    const toast = document.createElement('div');
    toast.id = 'love-toast';
    toast.className = 'love-toast';
    toast.textContent = message;

    document.body.appendChild(toast);

    // Trigger enter animation on the next frame
    requestAnimationFrame(() => {
        requestAnimationFrame(() => toast.classList.add('love-toast--visible'));
    });

    toastTimer = setTimeout(() => {
        toast.classList.remove('love-toast--visible');
        // Remove from DOM after CSS transition finishes (300 ms)
        toast.addEventListener('transitionend', () => toast.remove(), { once: true });
        toastTimer = null;
    }, duration);
}

function initGame() {
    createNumpad();
    
    // Bind diff buttons
    document.querySelectorAll('.diff-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentDifficulty = e.target.dataset.level;
            startNewGame();
        });
    });

    btnNewGame.addEventListener('click', startNewGame);
    btnErase.addEventListener('click', eraseCell);
    btnHint.addEventListener('click', giveHint);

    // Keyboard support
    document.addEventListener('keydown', handleKeyboard);

    startNewGame();
}

function startNewGame() {
    const { puzzle, solution } = sudokuGen.generate(currentDifficulty);
    currentPuzzle = puzzle;
    currentSolution = solution;
    userBoard = puzzle.map(row => [...row]);
    selectedCell = null;
    
    renderBoard();
}

function renderBoard() {
    boardEl.innerHTML = '';
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.r = r;
            cell.dataset.c = c;
            
            const val = userBoard[r][c];
            if (val !== 0) {
                cell.textContent = val;
                if (currentPuzzle[r][c] !== 0) {
                    cell.classList.add('fixed');
                }
            }

            cell.addEventListener('click', () => selectCell(r, c));
            boardEl.appendChild(cell);
        }
    }
    updateHighlights();
}

function selectCell(r, c) {
    selectedCell = { r, c };
    updateHighlights();
}

function updateHighlights() {
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        cell.classList.remove('selected', 'highlight');
        const cr = parseInt(cell.dataset.r);
        const cc = parseInt(cell.dataset.c);
        
        if (selectedCell) {
            if (cr === selectedCell.r && cc === selectedCell.c) {
                cell.classList.add('selected');
            } else if (cr === selectedCell.r || cc === selectedCell.c || 
                      (Math.floor(cr/3) === Math.floor(selectedCell.r/3) && Math.floor(cc/3) === Math.floor(selectedCell.c/3))) {
                cell.classList.add('highlight');
            }
        }
    });
}

function createNumpad() {
    numpadEl.innerHTML = '';
    for (let i = 1; i <= 9; i++) {
        const btn = document.createElement('button');
        btn.className = 'num-btn';
        btn.textContent = i;
        btn.addEventListener('click', () => fillNumber(i));
        numpadEl.appendChild(btn);
    }
}

function fillNumber(num) {
    if (!selectedCell) return;
    const { r, c } = selectedCell;
    if (currentPuzzle[r][c] !== 0) return; // Cannot overwrite fixed cell

    const cellEl = document.querySelector(`.cell[data-r="${r}"][data-c="${c}"]`);
    
    // Validation
    if (currentSolution[r][c] !== num) {
        cellEl.classList.add('error');
        setTimeout(() => cellEl.classList.remove('error'), 400);
    } else {
        userBoard[r][c] = num;
        cellEl.textContent = num;
        cellEl.classList.remove('error');

        // Check milestones before win (win overrides these toasts)
        if (!checkWin()) {
            const rowDone = checkRowComplete(r);
            const boxDone = checkBoxComplete(r, c);
            if (rowDone || boxDone) {
                showToast(getRandomLoveMessage(window.currentLang));
            }
        }
    }
}

/**
 * Returns true if every cell in the given row is correctly filled.
 * @param {number} row
 * @returns {boolean}
 */
function checkRowComplete(row) {
    for (let c = 0; c < 9; c++) {
        if (userBoard[row][c] !== currentSolution[row][c]) return false;
    }
    return true;
}

/**
 * Returns true if the 3×3 box containing (row, col) is completely
 * and correctly filled.
 * @param {number} row
 * @param {number} col
 * @returns {boolean}
 */
function checkBoxComplete(row, col) {
    const rStart = Math.floor(row / 3) * 3;
    const cStart = Math.floor(col / 3) * 3;
    for (let r = rStart; r < rStart + 3; r++) {
        for (let c = cStart; c < cStart + 3; c++) {
            if (userBoard[r][c] !== currentSolution[r][c]) return false;
        }
    }
    return true;
}

function eraseCell() {
    if (!selectedCell) return;
    const { r, c } = selectedCell;
    if (currentPuzzle[r][c] !== 0) return;
    
    userBoard[r][c] = 0;
    const cellEl = document.querySelector(`.cell[data-r="${r}"][data-c="${c}"]`);
    cellEl.textContent = '';
}

function giveHint() {
    if (!selectedCell) return;
    const { r, c } = selectedCell;
    if (currentPuzzle[r][c] !== 0 || userBoard[r][c] !== 0) return;
    
    fillNumber(currentSolution[r][c]);
}

function handleKeyboard(e) {
    if (e.key >= '1' && e.key <= '9') {
        fillNumber(parseInt(e.key));
    } else if (e.key === 'Backspace' || e.key === 'Delete') {
        eraseCell();
    } else if (e.key.startsWith('Arrow') && selectedCell) {
        let { r, c } = selectedCell;
        if (e.key === 'ArrowUp') r = Math.max(0, r - 1);
        if (e.key === 'ArrowDown') r = Math.min(8, r + 1);
        if (e.key === 'ArrowLeft') c = Math.max(0, c - 1);
        if (e.key === 'ArrowRight') c = Math.min(8, c + 1);
        selectCell(r, c);
    }
}

/**
 * Checks if the board is fully and correctly solved.
 * @returns {boolean} true if the puzzle is solved
 */
function checkWin() {
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (userBoard[r][c] !== currentSolution[r][c]) return false;
        }
    }

    // Win animation on all cells
    document.querySelectorAll('.cell').forEach(cell => {
        cell.classList.add('complete-anim');
    });

    // Show win message as a beautiful toast (no blocking alert)
    setTimeout(() => {
        showToast(texts[window.currentLang].won, 4000);
    }, 800);

    return true;
}

document.addEventListener('DOMContentLoaded', initGame);
