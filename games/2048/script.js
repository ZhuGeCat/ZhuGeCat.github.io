document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('game-board');
    const scoreContainer = document.getElementById('score');
    const gameOverOverlay = document.getElementById('game-over');
    const restartButton = document.getElementById('restart-button');
    const tryAgainButton = document.getElementById('try-again-button');
    const swipeGuide = document.getElementById('swipe-guide');
    let tiles = Array.from(board.getElementsByClassName('tile'));
    let grid = Array(4).fill(null).map(() => Array(4).fill(0));
    let score = 0;

    const aiToggle = document.getElementById('ai-toggle');
    const aiSpeedSlider = document.getElementById('ai-speed');
    const speedValue = document.getElementById('speed-value');
    const aiMoveDisplay = document.getElementById('ai-move');
    const aiModeButton = document.getElementById('ai-mode-button');
    const aiModal = document.getElementById('ai-modal');
    const closeModal = document.querySelector('.close');
    let aiMode = false;
    let aiSpeed = 300;

    aiModeButton.addEventListener('click', () => {
        aiModal.style.display = 'block';
    });

    closeModal.addEventListener('click', () => {
        aiModal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target == aiModal) {
            aiModal.style.display = 'none';
        }
    });

    aiToggle.addEventListener('change', () => {
        aiMode = aiToggle.checked;
        if (aiMode) {
            makeAIMove();
        }
    });

    aiSpeedSlider.addEventListener('input', () => {
        aiSpeed = aiSpeedSlider.value;
        speedValue.textContent = `${aiSpeed}ms`;
    });

    function makeAIMove() {
        if (!aiMode) return;

        // 简单的 AI 逻辑：尝试所有可能的移动,选择得分最高的
        const moves = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
        let bestScore = -1;
        let bestMove = null;

        for (const move of moves) {
            const tempGrid = JSON.parse(JSON.stringify(grid));
            const tempScore = score;

            let moved = false;
            switch (move) {
                case 'ArrowLeft':
                    moved = moveLeft();
                    break;
                case 'ArrowRight':
                    moved = moveRight();
                    break;
                case 'ArrowUp':
                    moved = moveUp();
                    break;
                case 'ArrowDown':
                    moved = moveDown();
                    break;
            }

            if (moved) {
                const currentScore = evaluatePosition();
                if (currentScore > bestScore) {
                    bestScore = currentScore;
                    bestMove = move;
                }
            }

            // 恢复原始状态
            grid = tempGrid;
            score = tempScore;
        }

        if (bestMove) {
            let moved = false;
            switch (bestMove) {
                case 'ArrowLeft':
                    moved = moveLeft();
                    aiMoveDisplay.textContent = 'AI当前操作: ←';
                    break;
                case 'ArrowRight':
                    moved = moveRight();
                    aiMoveDisplay.textContent = 'AI当前操作: →';
                    break;
                case 'ArrowUp':
                    moved = moveUp();
                    aiMoveDisplay.textContent = 'AI当前操作: ↑';
                    break;
                case 'ArrowDown':
                    moved = moveDown();
                    aiMoveDisplay.textContent = 'AI当前操作: ↓';
                    break;
            }
            if (moved) {
                addNewTile();
                renderBoard();
                checkGameOver();
            }
        }

        // 继续进行 AI 移动
        setTimeout(makeAIMove, aiSpeed);
    }

    function evaluatePosition() {
        // 简单的评估函数:空格数量 + 得分
        let emptyTiles = 0;
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                if (grid[r][c] === 0) {
                    emptyTiles++;
                }
            }
        }
        return emptyTiles * 10 + score;
    }

    function initialize() {
        resetGame();
        addNewTile(true);
        addNewTile(true);
        renderBoard();
        if (isMobileDevice()) {
            adjustForMobile();
            showSwipeGuide();
        }
        aiMode = false;
        aiToggle.checked = false;
        aiMoveDisplay.textContent = 'AI当前操作: -';
    }

    function resetGame() {
        grid = Array(4).fill(null).map(() => Array(4).fill(0));
        score = 0;
        gameOverOverlay.classList.remove('visible');
        swipeGuide.classList.remove('visible');
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
        let moved = false;
        for (let r = 0; r < 4; r++) {
            let newRow = slideAndCombine(grid[r]);
            if (newRow.join(',') !== grid[r].join(',')) {
                moved = true;
            }
            grid[r] = newRow;
        }
        return moved;
    }

    function moveRight() {
        let moved = false;
        for (let r = 0; r < 4; r++) {
            let newRow = slideAndCombine(grid[r].reverse()).reverse();
            if (newRow.join(',') !== grid[r].join(',')) {
                moved = true;
            }
            grid[r] = newRow;
        }
        return moved;
    }

    function moveUp() {
        let moved = false;
        for (let c = 0; c < 4; c++) {
            let col = [grid[0][c], grid[1][c], grid[2][c], grid[3][c]];
            let newCol = slideAndCombine(col);
            if (newCol.join(',') !== col.join(',')) {
                moved = true;
            }
            for (let r = 0; r < 4; r++) {
                grid[r][c] = newCol[r];
            }
        }
        return moved;
    }

    function moveDown() {
        let moved = false;
        for (let c = 0; c < 4; c++) {
            let col = [grid[0][c], grid[1][c], grid[2][c], grid[3][c]];
            let newCol = slideAndCombine(col.reverse()).reverse();
            if (newCol.join(',') !== col.join(',')) {
                moved = true;
            }
            for (let r = 0; r < 4; r++) {
                grid[r][c] = newCol[r];
            }
        }
        return moved;
    }

    function handleKeyPress(event) {
        if (aiMode) return;
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

    function isMobileDevice() {
        return /Mobi|Android/i.test(navigator.userAgent);
    }

    function adjustForMobile() {
        document.body.style.zoom = '0.75';
    }

    function showSwipeGuide() {
        swipeGuide.classList.add('visible');
        setTimeout(() => {
            swipeGuide.classList.remove('visible');
        }, 3000);
    }

    restartButton.addEventListener('click', initialize);
    tryAgainButton.addEventListener('click', initialize);
    board.addEventListener('touchstart', handleTouchStart, false);
    board.addEventListener('touchmove', handleTouchMove, false);

    initialize();
    document.addEventListener('keydown', handleKeyPress);
});
