class BoardSystem extends MRSystem {
    constructor() {
        super()

        this.rowCount = 8;
        this.colCount = 8;
        this.floorCount = 2;
        this.modelCollection = [
            "tilegrass001",
            "tilegrass002",
            "tilegrass003"];
        this.rotationCollection = [0, 90, 180, 270];
        this.scale = 0.075;
        this.tileMap = [];
        this.heightMap = Array.from({ length: this.rowCount }, (_, x) =>
            Array.from({ length: this.colCount }, (_, y) => Math.floor(smoothNoise(x * 0.5, y * 0.5) * this.floorCount))
        );
        this.timer = 0;
        this.player = {
            el: document.createElement("mr-player"),
            pos: {
                x: Math.floor(Math.random() * this.rowCount),
                y: Math.floor(Math.random() * this.colCount)
            }
        };
        this.key = {
            el: "",
            pos: {
                x: Math.floor(Math.random() * this.rowCount),
                y: Math.floor(Math.random() * this.colCount)
            }
        };
        while (this.player.pos == this.key.pos) {
            this.key.pos = {
                x: Math.floor(Math.random() * this.rowCount),
                y: Math.floor(Math.random() * this.colCount)
            }
        }
        this.goal = {
            el: document.createElement("mr-goal"),
            pos: {
                x: Math.floor(Math.random() * this.rowCount),
                y: Math.floor(Math.random() * this.colCount)
            }
        };
        while (this.player.pos == this.goal.pos && this.key.pos == this.goal.pos) {
            this.goal.pos = {
                x: Math.floor(Math.random() * this.rowCount),
                y: Math.floor(Math.random() * this.colCount)
            }
        }

        // console.log(this.player, this.goal, this.key);
    }

    update(deltaTime, frame) {
        this.timer += deltaTime;

        for (let r = 0; r < this.tileMap.length; r++) {
            for (let c = 0; c < this.tileMap[r].length; c++) {
                const tile = this.tileMap[r][c];
                const pc = this.projectCoordinates(tile.pos.x, tile.pos.y);
                const deltaY = Math.sin(this.timer + this.heightMap[r][c] / .5 + r / 10.5 + c / 1.5) / 1000;

                tile.el.dataset.position = `${pc.offsetRow} ${pc.offsetFloor + deltaY} ${pc.offsetCol}`;

                // place the player
                if (r == this.player.pos.x && c == this.player.pos.y) {
                    const plc = this.projectCoordinates(this.player.pos.x, this.player.pos.y);
                    this.player.el.dataset.position = `${plc.offsetRow} ${plc.offsetFloor + deltaY} ${plc.offsetCol}`;
                }

                if (r == this.goal.pos.x && c == this.goal.pos.y) {
                    const gc = this.projectCoordinates(this.goal.pos.x, this.goal.pos.y);
                    this.goal.el.dataset.position = `${gc.offsetRow} ${gc.offsetFloor + deltaY} ${gc.offsetCol}`;
                }
            }
        }
    }

    attachedComponent(entity) {

        this.player.el.style.scale = this.scale;
        entity.appendChild(this.player.el);

        this.goal.el.style.scale = this.scale;
        entity.appendChild(this.goal.el);

        for (let r = 0; r < this.rowCount; r++) {
            const row = [];

            for (let c = 0; c < this.colCount; c++) {

                const tileObj = {
                    el: document.createElement("mr-tile"),
                    isBlack: true,
                    pos: {
                        x: r,
                        y: c
                    }
                }

                let randomModel = this.modelCollection[Math.floor(Math.random() * this.modelCollection.length)];
                let randomRotation = this.rotationCollection[Math.floor(Math.random() * this.rotationCollection.length)];

                tileObj.el.dataset.rotation = `0 ${randomRotation} 0`;
                // tile.dataset.rowId = r;
                // tile.dataset.columnId = c;
                tileObj.el.dataset.model = randomModel;

                tileObj.el.addEventListener("mouseover", () => {
                    // color tile green if horse can move to a floor tille and red otherwise
                    if (this.canHorseMove(tileObj.pos.x, tileObj.pos.y, this.player.pos.x, this.player.pos.y)) {
                        tileObj.el.floorTile.object3D.children[0].material = new THREE.MeshPhongMaterial({
                            color: "#00ff00",
                            transparent: true,
                            opacity: 0.75
                        });
                    } else {
                        tileObj.el.floorTile.object3D.children[0].material = new THREE.MeshPhongMaterial({
                            color: "#ff0000",
                            transparent: true,
                            opacity: 0.75,
                        });
                    }
                })

                tileObj.el.addEventListener("mouseout", () => {
                    tileObj.el.floorTile.object3D.children[0].material = new THREE.MeshPhongMaterial({
                        color: "#d3ceba",
                        transparent: true,
                        opacity: 0.2,
                    });
                })

                tileObj.el.addEventListener("click", () => {
                    console.log('click');

                    if (this.canHorseMove(tileObj.pos.x, tileObj.pos.y, this.player.pos.x, this.player.pos.y)) {
                        this.movePlayer(tileObj.pos.x, tileObj.pos.y);

                        tile.floorTile.object3D.children[0].material = new THREE.MeshPhongMaterial({
                            color: "#d3ceba",
                            transparent: true,
                            opacity: 0.2
                        });
                    }
                })

                if (r % 2 && c % 2 || !(r % 2) && !(c % 2)) {
                    tileObj.isBlack = true;
                } else {
                    tileObj.isBlack = false;
                }

                entity.appendChild(tileObj.el);

                Object.assign(tileObj.el.style, {
                    scale: this.scale
                })

                row.push(tileObj);

            }

            this.tileMap.push(row);
        }
    }

    canHorseMove(r, c, px, py) {
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

    projectCoordinates(r, c) {
        return {
            offsetRow: r * this.scale - (this.rowCount * this.scale) / 2,
            offsetCol: c * this.scale - (this.colCount * this.scale) / 2,
            offsetFloor: this.heightMap[r][c] * this.scale * 0.5 + 0.1
        }
    }

    movePlayer(targetX, targetY) {
        this.player.pos = {
            x: targetX,
            y: targetY
        }
        this.player.moveTo(targetX, targetY);
    }
}

let boardsys = new BoardSystem()

