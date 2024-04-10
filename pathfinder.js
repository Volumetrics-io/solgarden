class PathFinder {
    constructor(rowCount, colCount, playerX, playerY) {
        // this.board = board;
        // this.rowCount = board.length;
        // this.colCount = board[0].length;
        // this.rowCount = rowCount;
        // this.colCount = colCount;
        // this.playerX = playerX;
        // this.playerY = playerY;

        this.blockMap = [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 1, 1, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
        ]

        this.rowCount = this.blockMap.length;
        this.colCount = this.blockMap[0].length;
        this.playerX = 3;
        this.playerY = 3;

        this.distanceMap = [];
        for (let r = 0; r < this.rowCount; r++) {
            this.distanceMap[r] = [];
            for(let c = 0; c < this.colCount; c++){
                this.distanceMap[r][c] = null
            }
        }

        console.log(this.blockMap)
        console.log(this.distanceMap)

        // this.addMove(playerX, playerY, 0);
        // let index = 0;
        // while (this.distanceMap[this.rowCount - 1][this.colCount - 1] == null) {
        //     this.addAllPossible(index++);
        // };
        // console.log(this.board);
        // return this.board[endX][endY];
        // console.log(this.findPath(0, 0, playerX, playerY));

        // document.querySelector("#root").innerHTML = this.findPath(0, 0, 3, 4);
        console.log(this.findPath(0, 0, 3, 4));
    }
    addMove(x, y, level) {
        if ((x >= 0) && (x <= this.rowCount) && (y >= 0) && (y <= this.colCount) && this.distanceMap[x][y] == null) {
            this.distanceMap[x][y] = level;
        }
    }
    addAllMoves(x, y, level) {
        this.addMove(x + 1, y + 1, level);
        this.addMove(x + 1, y, level);
        this.addMove(x + 1, y - 1, level);
        this.addMove(x, y + 1, level);
        this.addMove(x, y - 1, level);
        this.addMove(x - 1, y + 1, level);
        this.addMove(x - 1, y, level);
        this.addMove(x - 1, y - 1, level);
    }
    addAllPossible(level) {
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                if (this.distanceMap[i][j] === level) {
                    this.addAllMoves(i, j, level + 1);
                }
            }
        }
    }
    findPath(startX, startY, endX, endY) {
        this.addMove(startX, startY, 0);
        let index = 0;
        while (this.distanceMap[endX][endY] == null) {
            this.addAllPossible(index++);
        };
        // console.log(this.distanceMap);
        return this.distanceMap[endX][endY];
    }
    // getBoard() {
    //     this.findPath(this.playerX, this.playerY, 0, 0);
    //     // console.log(this.board);
    //     return this.board;
    // }
}




// const 

// const 

// const 

// console.log(findPath(1, 3, 6, 6));
