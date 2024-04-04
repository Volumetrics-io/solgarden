class BoardSystem extends MRSystem {
    constructor() {
        super()
        this.rowCount = 7;
        this.colCount = 7;
        this.floorCount = 2;
        this.scale = 0.06;
        this.tileMap = [];
        this.gameCount = 0;

        for (let r = 0; r < this.rowCount; r++) {
            const row = [];
            for (let c = 0; c < this.colCount; c++) {
                const tileObj = {
                    el: document.createElement("mr-tile"),
                    pos: {
                        x: r,
                        y: c
                    }
                }
                tileObj.el.dataset.isBlack = (r % 2 && c % 2 || !(r % 2) && !(c % 2)) ? true : false;
                row.push(tileObj);

            }
            this.tileMap.push(row);
        }

        this.player = {
            el: document.createElement("mr-player")
        };
        this.key = {
            el: document.createElement("mr-key")
        };
        this.door = {
            el: document.createElement("mr-door")
        };
        this.goal = {
            el: document.createElement("mr-goal")
        };

        this.initialize();

        // debug
        document.addEventListener("keydown", (event) => {
            if (event.key === "d") {
                event.preventDefault();
                this.initialize();
            }
        });
    }

    initialize() {
        this.gameCount++;
        this.state = {
            hasKey: false,
            moveCount: 0,
            isFalling: true,
            fallHeight: -0.1
        }
        this.heightMap = Array.from({ length: this.rowCount }, (_, x) =>
            Array.from({ length: this.colCount }, (_, y) => Math.floor(smoothNoise(x * 0.5, y * 0.5) * this.floorCount))
        );
        this.timer = 0;
        this.key.pos = this.player.pos = {
            x: Math.floor(Math.random() * (this.rowCount - 2) + 1),
            y: Math.floor(Math.random() * (this.colCount - 2) + 1)
        }

        // make sure the player and the key start at different locations
        while (this.player.pos.x == this.key.pos.x && this.player.pos.y == this.key.pos.y) {
            this.key.pos = {
                x: Math.floor(Math.random() * (this.rowCount - 2) + 1),
                y: Math.floor(Math.random() * (this.colCount - 2) + 1)
            }
        }

        if (Math.random() < 0.5) {
            // between first and last row
            this.door.pos = {
                x: Math.random() < 0.5 ? 0 : this.rowCount - 1,
                y: Math.floor(Math.random() * this.rowCount)
            }
            if (this.door.pos.x == 0) {
                this.door.el.dataset.rotation = '0 90 0';
            } else {
                this.door.el.dataset.rotation = '0 270 0';
            }

        } else {
            this.door.pos = {
                x: Math.floor(Math.random() * this.colCount),
                y: Math.random() < 0.5 ? 0 : this.colCount - 1
            }
            if (this.door.pos.y == 0) {
                this.door.el.dataset.rotation = '0 0 0';
            } else {
                this.door.el.dataset.rotation = '0 180 0';
            }

        }

        this.goal.pos = this.key.pos;

        if (this.tileMap.length) {
            // console.log(this.tileMap);
            for (let r = 0; r < this.rowCount; r++) {
                for (let c = 0; c < this.colCount; c++) {
                    const tileObj = this.tileMap[r][c].el;
                    // console.log(tileObj)
                    // tileObj.randomize();
                }
            }
        }
    }

    waveDeltaYAt(r, c) {
        return Math.sin(this.timer + this.heightMap[r][c] / 1.5 + r / 10.5 + c / 1.5) / 600;
    }

    update(deltaTime, frame) {
        this.timer += deltaTime;

        for (let r = 0; r < this.tileMap.length; r++) {
            for (let c = 0; c < this.tileMap[r].length; c++) {
                const tile = this.tileMap[r][c];
                const pc = this.projectCoordinates(tile.pos.x, tile.pos.y);
                tile.el.dataset.position = `${pc.offsetRow} ${pc.offsetFloor + this.waveDeltaYAt(r, c)} ${pc.offsetCol}`;
            }
        }

        if (this.state.isFalling) {
            this.state.fallHeight += 0.01;
            if (this.state.fallHeight >= 0) {
                this.state.isFalling = false;
            }
        }

        const plc = this.projectCoordinates(this.player.pos.x, this.player.pos.y);
        const playerY = plc.offsetFloor + this.waveDeltaYAt(this.player.pos.x, this.player.pos.y) - this.state.fallHeight;
        this.player.el.dataset.position = `${plc.offsetRow} ${playerY} ${plc.offsetCol}`;

        // console.log(this.gameCount)

        if (this.gameCount < 3) {
            const gc = this.projectCoordinates(this.goal.pos.x, this.goal.pos.y);
            this.goal.el.dataset.position = `${gc.offsetRow} ${gc.offsetFloor + this.waveDeltaYAt(this.goal.pos.x, this.goal.pos.y)} ${gc.offsetCol}`;
            this.goal.el.style.scale = this.scale;
        } else {
            this.goal.el.dataset.position = '0 0 0';
            this.goal.el.style.scale = 0.2;
        }

        const dc = this.projectCoordinates(this.door.pos.x, this.door.pos.y);
        this.door.el.dataset.position = `${dc.offsetRow} ${dc.offsetFloor + this.waveDeltaYAt(this.door.pos.x, this.door.pos.y)} ${dc.offsetCol}`;

        if (this.key.pos.x == this.player.pos.x && this.key.pos.y == this.player.pos.y) {
            this.state.hasKey = true;
        }

        if (this.state.hasKey) {
            this.goal.pos = this.door.pos;
            const kc = this.projectCoordinates(this.player.pos.x, this.player.pos.y);
            this.key.el.dataset.position = `${kc.offsetRow} ${kc.offsetFloor + this.waveDeltaYAt(this.key.pos.x, this.key.pos.y) + 0.06} ${kc.offsetCol}`;
            this.key.el.dataset.compAnimation = "clip: 0; action: stop;";
        } else {
            const kc = this.projectCoordinates(this.key.pos.x, this.key.pos.y);
            this.key.el.dataset.position = `${kc.offsetRow} ${kc.offsetFloor + this.waveDeltaYAt(this.key.pos.x, this.key.pos.y)} ${kc.offsetCol}`;
            this.key.el.dataset.compAnimation = "clip: 0; action: play;";
        }

        if (this.state.hasKey && this.door.pos.x == this.player.pos.x && this.door.pos.y == this.player.pos.y) {
            this.initialize();
        }
    }

    attachedComponent(entity) {

        this.player.el.style.scale = this.scale;
        entity.appendChild(this.player.el);

        this.door.el.style.scale = this.scale;
        entity.appendChild(this.door.el);

        this.key.el.style.scale = this.scale;
        entity.appendChild(this.key.el);

        this.goal.el.style.scale = this.scale;
        entity.appendChild(this.goal.el);

        for (let r = 0; r < this.rowCount; r++) {
            for (let c = 0; c < this.colCount; c++) {
                const tileObj = this.tileMap[r][c];

                tileObj.el.addEventListener("mouseover", () => {
                    // color tile green if horse can move to a floor tille and red otherwise
                    if (this.canMove(tileObj.pos.x, tileObj.pos.y, this.player.pos.x, this.player.pos.y)) {
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

                tileObj.el.addEventListener("touchstart", () => {
                    if (this.canMove(tileObj.pos.x, tileObj.pos.y, this.player.pos.x, this.player.pos.y)) {
                        this.movePlayer(tileObj.pos.x, tileObj.pos.y);

                        tileObj.el.floorTile.object3D.children[0].material = new THREE.MeshPhongMaterial({
                            color: "#d3ceba",
                            transparent: true,
                            opacity: 0.2
                        });
                    }
                })

                entity.appendChild(tileObj.el);

                Object.assign(tileObj.el.style, {
                    scale: this.scale
                })
            }
        }
    }

    // should there be a function to update the inventory panel?
    updatePanel() {
        console.log(this.state.moveCount, this.gameCount)
        document.querySelector("#move-count").innerText = this.state.moveCount;
        document.querySelector("#room-count").innerText = this.gameCount;
    }

    canMove(r, c, px, py) {
        let canMove = false;
        if (r + 1 == px && c - 1 == py ||
            r + 1 == px && c == py ||
            r + 1 == px && c + 1 == py ||
            r - 1 == px && c - 1 == py ||
            r - 1 == px && c == py ||
            r - 1 == px && c + 1 == py ||
            r == px && c - 1 == py ||
            r == px && c + 1 == py
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
        this.state.moveCount++;
        this.player.pos = {
            x: targetX,
            y: targetY
        }
         this.updatePanel();
    }
}

let boardsys = new BoardSystem()

