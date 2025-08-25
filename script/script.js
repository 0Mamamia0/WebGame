"use strict";
document.addEventListener('DOMContentLoaded', function () {
    const canvas = document.getElementById('board');
    const ctx = canvas.getContext('2d');
    const statusDisplay = document.getElementById('status');
    const restartButton = document.getElementById('restart');
    const undoButton = document.getElementById('undo');
    const scoresButton = document.getElementById('show-scores');
    const difficultySelect = document.getElementById('difficulty');
    const playerOrderSelect = document.getElementById('player-order');

    difficultySelect.addEventListener('change', difficultyChange);
    canvas.addEventListener('click', clickCanvas);
    scoresButton.addEventListener('click', toggleScores);
    undoButton.addEventListener('click', undoMove)
    restartButton.addEventListener('click', initBoard);
    playerOrderSelect.addEventListener('change', playerOrderChange);

    const position = new Position();
    const board = new Board(canvas, position, {
        onClick: onClick,
    });

    let gameOver;
    let aiThinking;
    let difficulty;
    let userColor;
    let aiColor;
    let difficultyProperty = 2
    let userColorProperty = Player.BLACK;
    let aiColorProperty = Player.WHITE;

    initBoard();

    function initBoard() {
        position.reset();
        gameOver = false;
        aiThinking = false;
        difficulty = difficultyProperty;
        userColor = userColorProperty;
        aiColor = aiColorProperty;

        updateStatus("黑方回合")
        if(aiColor === Player.BLACK) {
            // position.changeSide();
            setTimeout(aiMove, 250)
        }
        repaint();
    }

    function updateStatus(message) {
        statusDisplay.textContent = message;
    }

    function repaint() {
        setTimeout(() => {
            board.redrawBoard();
        })
    }

    function onChangeSide() {
        position.changeSide();
        if(position.getPlayer() === aiColor) {
            setTimeout(aiMove, 250)
        }
    }

    function postChangeSide() {
        if(!gameOver) {
            setTimeout(() => {
                onChangeSide();
            })
        }
    }

    function onMove(move) {
        if(gameOver)
            return;
        if(position.makeMove(move)) {
            checkStatus(move.x, move.y);
            repaint();
        }
    }

    function postMove(move) {
        setTimeout(() => {
            onMove(move)
        })
    }


    function onClick(x, y) {
        if (gameOver || aiThinking) return;
        if(position.valid(x, y)) {
            postMove({x, y})
        }
    }


    function checkStatus(x, y) {
        let status = position.status(x, y);
        switch (status) {
            case Status.PLAYING:
                updateStatus(position.getPlayer() === Player.BLACK ? "黑棋回合" : "白棋回合")
                postChangeSide();
                break;
            case Status.BLACK_WIN:
                updateStatus("黑棋获胜！")
                gameOver = true;
                break;
            case Status.WHITE_WIN:
                updateStatus("白棋获胜！")
                gameOver = true;
                break;
            case Status.DRAW:
                updateStatus("平局！")
                gameOver = true;
                break;
        }
    }





    function toggleScores() {
        board.toggleScores();
    }


    function undoMove() {
        if (!gameOver && !aiThinking) {
            position.undoMove();
            position.undoMove();
            board.redrawBoard();
        }
    }

    function difficultyChange() {
        difficultyProperty = parseInt(this.value);
    }

    function playerOrderChange() {
        userColorProperty = this.value === 'black' ? Player.BLACK : Player.WHITE;
        aiColorProperty = this.value === 'black' ? Player.WHITE : Player.BLACK;
    }

    function clickCanvas(e) {
        if (gameOver || aiThinking) return;
        if (position.getPlayer() !== userColor) return;
        const rect = canvas.getBoundingClientRect();
        board.click(e.clientX - rect.left, e.clientY - rect.top);
    }


    function aiMove() {
        if (gameOver || aiThinking) return;

        aiThinking = true;
        statusDisplay.textContent = "AI思考中...";

        // 使用setTimeout让UI有时间更新
        setTimeout(() => {
            let bestScore = -Infinity;
            let bestMove = null;

            position.forEach((x, y, piece) => {
                if (piece === 0) {
                    const score = position.evaluate(x, y);
                    if (score > bestScore) {
                        bestScore = score;
                        bestMove = {x, y};
                    }
                }
            })


            if (bestMove === null) {
                const emptyCells = [];
                position.forEach((x, y, player) => {
                    if (player === 0) {
                        emptyCells.push({x, y});
                    }
                })

                if (emptyCells.length > 0) {
                    bestMove = emptyCells[Math.floor(Math.random() * emptyCells.length)];
                }
            }


            if (bestMove !== null) {
                postMove(bestMove);
            }

            aiThinking = false;
        });
    }


});