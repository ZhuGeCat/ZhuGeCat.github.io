document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('game-board');
    const scoreContainer = document.getElementById('score');
    const gameOverOverlay = document.getElementById('game-over');
    const restartButton = document.getElementById('restart-button');
    const tryAgainButton = document.getElementById('try-again-button');
    let tiles = Array.from(board.getElementsByClassName('tile'));
    let grid = Array(4).fill(null).map(() => Array(4).fill(0));
    let score = 0;

    function initialize() {
        resetGame();
        addNewTile(true);
        addNewTile(true);
        renderBoard();
    }

    function resetGame() {
        grid = Array(4).fill(null).map(() => Array(4).fill(0));
        score = 0;
        gameOverOverlay.classList.remove('visible');
    }

    function addNewTile(initial = false) {
        let emptyTiles = [];
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                if (grid[r][c] === 0) {
                    emptyTiles.push({ r, c });
                }
            }
        }
        if (emptyTiles.length > 0) {
            let { r, c } = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
            grid[r][c] = Math.random() < 0.9 ? 2 : 4;
            if (!initial) {
                tiles[r * 4 + c].classList.add('tile-appear');
            }
        }
    }

    function renderBoard() {
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                let tile = tiles[r * 4 + c];
                tile.textContent = grid[r][c] === 0 ? '' : grid[r][c];
                tile.dataset.value = grid[r][c];
                tile.classList.remove('tile-appear', 'tile-combine');
            }
        }
        scoreContainer.textContent = score;
    }

    function slide(row) {
        row = row.filter(val => val);
        while (row.length < 4) row.push(0);
        return row;
    }

    function combine(row) {
        for (let i = 0; i < 3; i++) {
            if (row[i] !== 0 && row[i] === row[i + 1]) {
                row[i] *= 2;
                row[i + 1] = 0;
                score += row[i];
                tiles[i].classList.add('tile-combine');
                setTimeout(() => tiles[i].classList.remove('tile-combine'), 300);
            }
        }
        return row;
    }

    function slideAndCombine(row) {
        row = slide(row);
        row = combine(row);
        row = slide(row);
        return row;
    }

    function moveLeft() {
        for (let r = 0; r < 4; r++) {
            grid[r] = slideAndCombine(grid[r]);
        }
    }

    function moveRight() {
        for (let r = 0; r < 4; r++) {
            grid[r] = slideAndCombine(grid[r].reverse()).reverse();
        }
    }

    function moveUp() {
        for (let c = 0; c < 4; c++) {
            let col = [grid[0][c], grid[1][c], grid[2][c], grid[3][c]];
            col = slideAndCombine(col);
            for (let r = 0; r < 4; r++) {
                grid[r][c] = col[r];
            }
        }
    }

    function moveDown() {
        for (let c = 0; c < 4; c++) {
            let col = [grid[0][c], grid[1][c], grid[2][c], grid[3][c]];
            col = slideAndCombine(col.reverse()).reverse();
            for (let r = 0; r < 4; r++) {
                grid[r][c] = col[r];
            }
        }
    }

    function handleKeyPress(event) {
        switch (event.key) {
            case 'ArrowLeft':
                moveLeft();
                break;
            case 'ArrowRight':
                moveRight();
                break;
            case 'ArrowUp':
                moveUp();
                break;
            case 'ArrowDown':
                moveDown();
                break;
            default:
                return;
        }
        addNewTile();
        renderBoard();
        checkGameOver();
    }

    function handleTouchStart(event) {
        const touch = event.touches[0];
        this.startX = touch.clientX;
        this.startY = touch.clientY;
    }

    function handleTouchMove(event) {
        if (!this.startX || !this.startY) return;

        const touch = event.touches[0];
        const endX = touch.clientX;
        const endY = touch.clientY;

        const diffX = this.startX - endX;
        const diffY = this.startY - endY;

        if (Math.abs(diffX) > Math.abs(diffY)) {
            if (diffX > 0) {
                moveLeft();
            } else {
                moveRight();
            }
        } else {
            if (diffY > 0) {
                moveUp();
            } else {
                moveDown();
            }
        }

        this.startX = null;
        this.startY = null;

        addNewTile();
        renderBoard();
        checkGameOver();
    }

    function checkGameOver() {
        if (!canMove()) {
            gameOverOverlay.classList.add('visible');
        }
    }

    function canMove() {
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                if (grid[r][c] === 0) return true;
                if (c < 3 && grid[r][c] === grid[r][c + 1]) return true;
                if (r < 3 && grid[r][c] === grid[r + 1][c]) return true;
            }
        }
        return false;
    }

    restartButton.addEventListener('click', initialize);
    tryAgainButton.addEventListener('click', initialize);
    board.addEventListener('touchstart', handleTouchStart, false);
    board.addEventListener('touchmove', handleTouchMove, false);

    initialize();
    document.addEventListener('keydown', handleKeyPress);
});
