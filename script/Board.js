"use strict";

class Board {
    constructor(canvas, position, callback, boardSize = 15) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.position = position;
        this.callback = callback;
        this.showScores = false;
        this.boardSize = boardSize;
        this.cellSize = canvas.width / (boardSize + 1);
        this.stoneRadius = this.cellSize * 0.4;

    }

    // 绘制棋子
    drawStone(x, y, player) {
        if(player === 0)
            return;

        const centerX = this.cellSize * (x + 1);
        const centerY = this.cellSize * (y + 1);

        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, this.stoneRadius, 0, Math.PI * 2);

        const gradient = this.ctx.createRadialGradient(
            centerX - this.stoneRadius * 0.3,
            centerY - this.stoneRadius * 0.3,
            this.stoneRadius * 0.1,
            centerX,
            centerY,
            this.stoneRadius
        );

        if (player === Player.BLACK) {
            gradient.addColorStop(0, '#666');
            gradient.addColorStop(1, '#000');
        } else {
            gradient.addColorStop(0, '#fff');
            gradient.addColorStop(1, '#ddd');
        }

        this.ctx.fillStyle = gradient;
        this.ctx.fill();

        if (player === Player.WHITE) {
            this.ctx.strokeStyle = '#999';
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
        }
    }

    // 绘制棋盘
    drawBoard() {
        // 绘制背景
        this.ctx.fillStyle = '#dcb35c';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 绘制网格线
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 1;

        for (let i = 0; i < this.boardSize; i++) {
            // 横线
            this.ctx.beginPath();
            this.ctx.moveTo(this.cellSize, this.cellSize * (i + 1));
            this.ctx.lineTo(this.cellSize * this.boardSize, this.cellSize * (i + 1));
            this.ctx.stroke();

            // 竖线
            this.ctx.beginPath();
            this.ctx.moveTo(this.cellSize * (i + 1), this.cellSize);
            this.ctx.lineTo(this.cellSize * (i + 1), this.cellSize * this.boardSize);
            this.ctx.stroke();
        }

        // 绘制星位点
        this.drawStarPoints();
    }

    // 绘制星位点
    drawStarPoints() {
        const starPoints = [3, 7, 11];
        this.ctx.fillStyle = '#000';

        starPoints.forEach(x => {
            starPoints.forEach(y => {
                if (!(x === 7 && y === 7) || this.boardSize >= 15) {
                    this.ctx.beginPath();
                    this.ctx.arc(
                        this.cellSize * (x + 1),
                        this.cellSize * (y + 1),
                        4,
                        0,
                        Math.PI * 2
                    );
                    this.ctx.fill();
                }
            });
        });

        // 绘制中心点
        this.ctx.beginPath();
        this.ctx.arc(
            this.cellSize * (Math.floor(this.boardSize / 2) + 1),
            this.cellSize * (Math.floor(this.boardSize / 2) + 1),
            5,
            0,
            Math.PI * 2
        );
        this.ctx.fill();
    }

    drawScore(x, y, piece) {
        if (piece === 0) {
            const score = this.position.evaluate(x, y);
            if (score > 100) {
                const maxSize = 20;
                const minSize = 5;
                const size = minSize + (maxSize - minSize) * Math.min(1, score / 100000);
                this.ctx.fillStyle = this.position.getPlayer() === Player.BLACK ? '#000' : '#fff';
                this.ctx.fillRect(
                    this.cellSize * (x + 1) - size/2,
                    this.cellSize * (y + 1) - size/2,
                    size,
                    size
                );
            }
        }
    }
    drawScores() {
        if (!this.showScores)
            return;
        this.position.forEach((x, y, piece) => {
            this.drawScore(x, y, piece);
        });
    }

    // 重新绘制整个棋盘
    redrawBoard() {
        this.drawBoard();
        this.position.forEach((x, y, piece) => {
            this.drawStone(x, y, piece);
        });
        this.drawScores();
    }

    // 将屏幕坐标转换为棋盘坐标
    screenToBoard(clientX, clientY) {
        const rect = this.canvas.getBoundingClientRect();
        const x = Math.round((clientX - rect.left) / this.cellSize) - 1;
        const y = Math.round((clientY - rect.top) / this.cellSize) - 1;
        return { x, y };
    }

    // 获取单元格大小
    getCellSize() {
        return this.cellSize;
    }

    // 获取棋盘大小
    getBoardSize() {
        return this.boardSize;
    }

    click(x, y) {
        let position = this.position;
        x = Math.round( x / this.cellSize) - 1;
        y = Math.round(y / this.cellSize) - 1;
        this.callback.onClick(x, y);
    }

    toggleScores() {
        this.showScores = !this.showScores;
        this.redrawBoard();
    }
}
