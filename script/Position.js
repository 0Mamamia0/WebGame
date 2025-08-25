const Player = Object.freeze({
    BLACK: 1,  // 玩家(黑棋)
    WHITE: 2   // AI(白棋)
});


const Status = Object.freeze({
    PLAYING: 1,
    BLACK_WIN: 2,
    WHITE_WIN: 3,
    DRAW: 4
});


class Position {

    constructor() {
        this.boardSize = 15;
        this.reset();
    }


    getPlayer() {
        return this.player;
    }

    changeSide() {
        this.player = this.player === Player.BLACK ? Player.WHITE : Player.BLACK;
    }

    tryMove(move) {
        return this.grid[move.x][move.y] === 0;
    }


    makeMove(move) {
        if (!this.tryMove(move)) {
            return false;
        }

        this.grid[move.x][move.y] = this.player;
        this.mvList.push(move);
        return true;
    }

    undoMove(move) {
        let lastMove = this.mvList.pop();
        if(lastMove !== undefined) {
            this.grid[move.x][move.y] = 0;
            this.changeSide();
        }
    }


    reset() {
        this.grid = Array(this.boardSize).fill().map(() => Array(this.boardSize).fill(0));
        this.mvList = [];
        this.player = Player.BLACK;
    }

    isEmpty(x, y) {
        return this.grid[x][y] === 0;
    }

    isFull() {
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                if (this.grid[i][j] === 0) {
                    return false;
                }
            }
        }
        return true;
    }

    valid(x, y) {
        return x >= 0 && x < this.boardSize && y >= 0 && y < this.boardSize;
    }

    at(x, y) {
        if(!this.valid(x, y)) {
            return undefined;
        }
        return this.grid[x][y];
    }


    next(p, dx, dy) {
        p.x += dx;
        p.y += dy;
        return this.at(p.x, p.y)
    }

    forEach(callback) {
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                callback(i, j, this.grid[i][j]);
            }
        }
    }



    countWithEnds(x, y, dx, dy, player) {
        let count = 1; // 包括当前位置
        let openEnds = 0;


        let p = { x, y };
        let piece = undefined;
        while ( (piece = this.next(p, dx, dy)) !== undefined) {
            if(piece === player) {
                count++;
                continue
            } else if (piece === 0) {
                openEnds++;
            }
            break;
        }

        p = { x, y };

        while ( (piece = this.next(p, -dx, -dy)) !== undefined) {
            if(piece === player) {
                count++;
                continue
            } else if (piece === 0) {
                openEnds++;
            }
            break;
        }
        return { count, openEnds };
    }


    checkWin(x, y) {
        const directions = [
            [1, 0],  // 水平
            [0, 1],  // 垂直
            [1, 1],  // 对角线
            [1, -1]  // 反对角线
        ];

        for (const [dx, dy] of directions) {
            let count = 1;

            let p = { x, y };
            let piece = undefined;
            for (let i = 1; i < 5; i++) {
                piece = this.next(p, dx, dy)
                if(piece !== this.player) {
                    break
                }
                count++;
            }

            p = { x, y };

            for (let i = 1; i < 5; i++) {
                piece = this.next(p, -dx, -dy)
                if(piece !== this.player) {
                    break
                }
                count++;
            }

            if (count >= 5) {
                return true;
            }
        }

        return false;
    }

    status(x, y) {
        if(this.isFull()) {
            return Status.DRAW;
        }

        if(this.checkWin(x, y)) {
            return this.player === Player.BLACK ? Status.BLACK_WIN : Status.WHITE_WIN;
        }
        return Status.PLAYING;
    }



    evaluateMove(move) {
        if (!this.makeMove(move))
            return 0;

        let score = 0;

        const directions = [
            [1, 0],  // 水平
            [0, 1],  // 垂直
            [1, 1],  // 对角线
            [1, -1]  // 反对角线
        ];

        for (const [dx, dy] of directions) {
            const { count, openEnds } = this.countWithEnds(move.x, move.y, dx, dy, move.player);

            if (count >= 5) {
                score += 100000; // 五子连珠，最高分
            } else if (count === 4 && openEnds === 2) {
                score += 10000;  // 活四
            } else if (count === 4 && openEnds === 1) {
                score += 1000;   // 死四
            } else if (count === 3 && openEnds === 2) {
                score += 1000;   // 活三
            } else if (count === 3 && openEnds === 1) {
                score += 100;    // 死三
            } else if (count === 2 && openEnds === 2) {
                score += 100;    // 活二
            } else if (count === 2 && openEnds === 1) {
                score += 10;     // 死二
            } else if (count === 1 && openEnds === 2) {
                score += 10;     // 活一
            }
        }

        this.undoMove( move)

        return score;
    }

    evaluate(x, y) {
        if (!this.isEmpty(x, y)) return 0;
        const blackScore = this.evaluateMove({x : x, y : y, player: Player.BLACK});
        const whiteScore = this.evaluateMove({x : x, y: y, player: Player.WHITE});
        // 返回综合评分（AI优先考虑自己的优势，同时考虑阻止对手）
        return whiteScore * 1.2 + blackScore; // AI权重稍高
    }
}