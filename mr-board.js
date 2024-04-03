class BoardSystem extends MRSystem {
    constructor() {
        super()

        this.tilemap = [];
        this.timer = 0;

        // this.state = {
        //     heightMap: [],
        //     tiles: [],
        //     player: {
        //         element:  
        //     }

        // }
    }

    update(deltaTime, frame) {
        // this.timer += deltaTime * 2;

        // console.log(this.playerPos);

        // for (let f = 0; f < this.tilemap.length; f++) {
        //     for (let r = 0; r < this.tilemap[f].length; r++) {
        //         for (let c = 0; c < this.tilemap[f][r].length; c++) {
        //             const tile = this.tilemap[f][r][c];
        //             const tempPosition = tile.dataset.position.split(" ");
        //             const deltaY = Math.sin(this.timer + f / 1.5 + r / 1.5 + c / 1.5) / 100;
        //             const positionY = parseFloat(tile.dataset.offsetFloor) + deltaY;
        //             tile.dataset.position = `${tempPosition[0]} ${positionY} ${tempPosition[2]}`;

        //             let isTop = (f === this.heightMap[r][c]);
        //             if (r == this.playerPos.x && c == this.playerPos.y && isTop) {
        //                 // TODO: make sure there are no plants on the spawn point
        //                 this.player.dataset.position = tile.dataset.position;
        //             }
        //             if (r == this.goalPos.x && c == this.goalPos.y && isTop) {
        //                 // TODO: make sure there are no plants on the spawn point
        //                 this.goal.dataset.position = tile.dataset.position;
        //             }

        //             // this.parent.player.moveTo(this.dataset.position);
        //         }
        //     }
        // }

        // this.player.dataset.position = 
        // use projectCoordinates(r, c, f) to update the position?
    }

    attachedComponent(entity) {
        this.comp = entity.components.get('board')
        const models = [
            "tilegrass001",
            "tilegrass002",
            "tilegrass003"];
        const rotations = [0, 90, 180, 270];
        this.scale = 0.05;

        // Generate the height map using smoothNoise
        this.heightMap = Array.from({ length: this.comp.rows }, (_, x) =>
            Array.from({ length: this.comp.cols }, (_, y) => Math.floor(smoothNoise(x * 0.5, y * 0.5) * this.comp.floors))
        );

        this.playerPos = this.goalPos = {
            x: Math.floor(Math.random() * this.comp.rows),
            y: Math.floor(Math.random() * this.comp.cols)
        }

        while (this.playerPos == this.goalPos) {
            this.playerPos = {
                x: Math.floor(Math.random() * this.comp.rows),
                y: Math.floor(Math.random() * this.comp.cols)
            }
        }

        // Player
        this.player = document.createElement("mr-player");
        this.player.parent = this;
        Object.assign(this.player.style, {
            scale: this.scale
        })
        entity.appendChild(this.player);

        // Goal
        this.goal = document.createElement("mr-goal");
        Object.assign(this.goal.style, {
            scale: this.scale
        })
        entity.appendChild(this.goal);

        for (let f = 0; f < this.comp.floors; f++) {
            const floor = [];

            for (let r = 0; r < this.comp.rows; r++) {
                const row = [];

                for (let c = 0; c < this.comp.cols; c++) {

                    const projected = this.projectCoordinates(r, c, f);

                    let randomModel = models[Math.floor(Math.random() * models.length)];
                    let randomRotation = rotations[Math.floor(Math.random() * rotations.length)];

                    // 
                    let isTop = (f === this.heightMap[r][c]);
                    // if (f <= this.heightMap[r][c]) {
                    if (f == this.heightMap[r][c]) {
                        let tile = document.createElement("mr-tile");
                        // Is the tile at the top of the column?
                        // We only want to add plant at the top
                        tile.dataset.isTop = isTop;
                        tile.dataset.offsetFloor = projected.offsetFloor;
                        tile.dataset.rotation = `0 ${randomRotation} 0`;
                        tile.dataset.position = `${projected.offsetRow} ${projected.offsetFloor} ${projected.offsetCol}`;
                        tile.dataset.scale = this.scale;
                        tile.dataset.rowId = r;
                        tile.dataset.columnId = c;
                        tile.parent = this;

                        // if (isTop) {
                        tile.dataset.model = randomModel;

                        if (c == this.playerPos.x && r == this.playerPos.y && isTop) {
                            // TODO: make sure there are no plants on the spawn point
                            this.player.dataset.position = `${projected.offsetRow} ${projected.offsetFloor} ${projected.offsetCol}`;
                        }

                        if (r == this.goalPos.x && c == this.goalPos.y && isTop) {
                            // TODO: make sure there are no pla=nts on the spawn point
                            this.goal.dataset.position = `${projected.offsetRow} ${projected.offsetFloor} ${projected.offsetCol}`;
                        }

                        tile.addEventListener("mouseover", () => {
                            // color tile green if horse can move to a floor tille and red otherwise
                            if (this.canHorseMove(
                                parseInt(tile.dataset.columnId),
                                parseInt(tile.dataset.rowId),
                                this.playerPos.x,
                                this.playerPos.y)) {
                                tile.floorTile.object3D.children[0].material = new THREE.MeshPhongMaterial({
                                    color: "#00ff00",
                                    transparent: true,
                                    opacity: 0.75
                                });
                            } else {
                                tile.floorTile.object3D.children[0].material = new THREE.MeshPhongMaterial({
                                    color: "#ff0000",
                                    transparent: true,
                                    opacity: 0.75,
                                });
                            }

                        })

                        tile.addEventListener("mouseleave", () => {
                            tile.floorTile.object3D.children[0].material = new THREE.MeshPhongMaterial({
                                color: "#d3ceba",
                                transparent: true,
                                opacity: 0.2,
                            });

                            console.log('mouseleave');
                        })

                        tile.addEventListener("click", () => {
                            console.log('click');

                            if (this.canHorseMove(
                                parseInt(tile.dataset.columnId),
                                parseInt(tile.dataset.rowId),
                                this.playerPos.x,
                                this.playerPos.y)) {
                                this.movePlayer(parseInt(tile.dataset.rowId), parseInt(tile.dataset.columnId));

                                tile.floorTile.object3D.children[0].material = new THREE.MeshPhongMaterial({
                                    color: "#d3ceba",
                                    transparent: true,
                                    opacity: 0.2
                                });
                            }
                        })

                        // if (r % 2 && c % 2 || !(r % 2) && !(c % 2)) {
                        //     tile.dataset.isBlack = true;
                        // } else {
                        //     tile.dataset.isBlack = false;
                        // }

                        entity.appendChild(tile);

                        Object.assign(tile.style, {
                            scale: this.scale
                        })

                        row.push(tile);
                    }

                }

                floor.push(row);
            }

            this.tilemap.push(floor);
        }
    }

    canHorseMove(r, c, px, py) {
        // const r = parseInt(tile.dataset.rowId);
        // const c = parseInt(tile.dataset.columnId);

        // const px = this.playerPos.x;
        // const py = this.playerPos.y;

        let canMove = false;
        if (r + 1 == px && c + 2 == py ||
            r + 2 == px && c + 1 == py ||
            r + 2 == px && c - 1 == py ||
            r + 1 == px && c - 2 == py ||
            r - 1 == px && c - 2 == py ||
            r - 2 == px && c - 1 == py ||
            r - 2 == px && c + 1 == py ||
            r - 1 == px && c + 2 == py
        ) {
            canMove = true;
        }
        return canMove;
    }

    projectCoordinates(r, c, f) {
        // return {
        //     offsetRow: r * this.scale - (this.comp.rows * this.scale) / 2,
        //     offsetCol: c * this.scale - (this.comp.cols * this.scale) / 2,
        //     offsetFloor: f * this.scale + 0.1
        // }
        return {
            offsetRow: r * this.scale - (this.comp.rows * this.scale) / 2,
            offsetCol: c * this.scale - (this.comp.cols * this.scale) / 2,
            offsetFloor: f * this.scale + 0.1
        }
    }

    movePlayer(targetX, targetY) {
        this.playerPos = {
            x: targetX,
            y: targetY
        }
        this.player.moveTo(targetX, targetY);
    }
}

let boardsys = new BoardSystem()

