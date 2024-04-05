class BoardSystem extends MRSystem {
    constructor() {
        super()
        this.rowCount = 5;
        this.colCount = 5;
        this.floorCount = 2;
        this.scale = 0.06;

        this.levelId = 0;
        this.levelCount = 2;

        this.gameIsStarted = false;

        this.rotationCollection = [0, 90, 180, 270];
        this.modelCollection = ["tilegrass001", "tilegrass002", "tilegrass003"];

        this.sounds = {
            bgMusic: document.querySelector('#background-music'),
            chessSound: document.querySelector('#chess-sound'),
            doorSound: document.querySelector('#door-sound'),
            analogSound: document.querySelector('#analog-sound')
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

        this.levelsMap = [];
        for (let l = 0; l < this.levelCount; l++) {
            const level = {
                tiles: [],
                heightMap: Array.from({ length: this.rowCount }, (_, x) =>
                    Array.from({ length: this.colCount }, (_, y) => Math.floor(smoothNoise(x * 0.5, y * 0.5) * this.floorCount))
                )
            };

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
                    row.push(tileObj);
                }
                level.tiles.push(row);
            }

            this.levelsMap.push(level);
        }

        // console.log(this.levelsMap)
        // this.tileMap = [];

        // debug
        // document.addEventListener("keydown", (event) => {
        //     if (event.key === "d") {
        //         event.preventDefault();
        //         // this.randomizeTile();
        //     }
        // });
    }

    initialize() {
        if (this.levelId < this.levelCount) {
            this.levelId++;
            this.state = {
                hasKey: false,
                moveCount: 0,
                isFalling: true,
                fallHeight: -0.1
            }
            // this.heightMap = Array.from({ length: this.rowCount }, (_, x) =>
            //     Array.from({ length: this.colCount }, (_, y) => Math.floor(smoothNoise(x * 0.5, y * 0.5) * this.floorCount))
            // );
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

            if (this.levelId > 1) {
                this.sounds.doorSound.components.set('audio', { state: 'play' });
            }

            // Play the background music
            // if (this.levelId == 2) {
            //     this.sounds.bgMusic.components.set('audio', { state: 'play' })
            // }
        } else {
            console.log("you've won!")
        }

    }

    waveDeltaYAt(r, c) {
        return Math.sin(this.timer + this.levelsMap[this.levelId].heightMap[r][c] / 1.5 + r / 10.5 + c / 1.5) / 1000;
    }

    update(deltaTime, frame) {

        if (this.gameIsStarted) {
            this.timer += deltaTime;

            for (let l = 0; l < this.levelCount; l++) {
                for (let r = 0; r < this.rowCount; r++) {
                    for (let c = 0; c < this.colCount; c++) {
                        const tile = this.levelsMap[l].tiles[r][c];

                        if (l != this.levelId) {
                            tile.el.style.visibility = "hidden";
                        } else {
                            tile.el.style.visibility = "visible";
                        }
                    }
                }
            }

            for (let r = 0; r < this.levelsMap[this.levelId].tiles.length; r++) {
                for (let c = 0; c < this.levelsMap[this.levelId].tiles[r].length; c++) {
                    const tile = this.levelsMap[this.levelId].tiles[r][c];
                    // console.log(tile)
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
            this.sounds.chessSound.dataset.position = this.player.el.dataset.position;

            // tutorial
            // Blue goal is shown for the first 2 turns
            if (this.levelId < 3) {
                const gc = this.projectCoordinates(this.goal.pos.x, this.goal.pos.y);
                this.goal.el.dataset.position = `${gc.offsetRow} ${gc.offsetFloor + this.waveDeltaYAt(this.goal.pos.x, this.goal.pos.y)} ${gc.offsetCol}`;
                this.goal.el.style.scale = this.scale;
            } else {
                this.goal.el.dataset.position = '0 0 0';
                this.goal.el.style.scale = 0.2;
            }

            const dc = this.projectCoordinates(this.door.pos.x, this.door.pos.y);
            this.door.el.dataset.position = `${dc.offsetRow} ${dc.offsetFloor + this.waveDeltaYAt(this.door.pos.x, this.door.pos.y)} ${dc.offsetCol}`;
            this.sounds.doorSound.dataset.position = this.door.el.dataset.position;

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
            this.sounds.analogSound.dataset.position = this.key.el.dataset.position;

            if (this.state.hasKey && this.door.pos.x == this.player.pos.x && this.door.pos.y == this.player.pos.y) {
                this.initialize();
            }

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

        this.tileContainer = document.createElement("mr-div");
        entity.append(this.tileContainer);

        this.initialize();

        for (let l = 0; l < this.levelCount; l++) {
            for (let r = 0; r < this.rowCount; r++) {
                for (let c = 0; c < this.colCount; c++) {
                    const tileObj = this.levelsMap[l].tiles[r][c];

                    tileObj.el.addEventListener("mouseover", () => {
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
                        tileObj.el.floorTile.dataset.position = '0 0 0';
                    })

                    tileObj.el.addEventListener("mouseout", () => {
                        tileObj.el.floorTile.object3D.children[0].material = new THREE.MeshPhongMaterial({
                            color: "#d3ceba",
                            transparent: true,
                            opacity: 0,
                        });
                        tileObj.el.floorTile.dataset.position = '0 -0.3 0';
                    })

                    tileObj.el.addEventListener("touchstart", () => {
                        if (this.canMove(tileObj.pos.x, tileObj.pos.y, this.player.pos.x, this.player.pos.y)) {
                            this.movePlayer(tileObj.pos.x, tileObj.pos.y);

                            tileObj.el.floorTile.object3D.children[0].material = new THREE.MeshPhongMaterial({
                                color: "#d3ceba",
                                transparent: true,
                                opacity: 0.75
                            });
                        }
                    })

                    this.tileContainer.appendChild(tileObj.el);
                    tileObj.el.style.scale = this.scale;
                }
            }
        }

        this.gameIsStarted = true;


        // this.randomizeTile();

        // debug
        // document.addEventListener("keydown", (event) => {
        //     if (event.key === "d") {
        //         event.preventDefault();
        //         this.initialize();
        //     }
        // });
    }

    // randomizeTile() {
    //     console.log('randomize tiles');
    //     for (let r = 0; r < this.rowCount; r++) {
    //         for (let c = 0; c < this.colCount; c++) {
    //             const tileObj = this.tileMap[r][c];

    //             const prevSrc = tileObj.el.src;

    //             let randomRotation = this.rotationCollection[Math.floor(Math.random() * this.rotationCollection.length)];
    //             tileObj.el.dataset.rotation = `0 ${randomRotation} 0`;

    //             let randomModel = this.modelCollection[Math.floor(Math.random() * this.modelCollection.length)];
    //             tileObj.el.src = `tiles/${randomModel}.glb`;

    //             console.log(prevSrc, tileObj.el.src)

    //             // 60% chance of plant on top
    //             // if (Math.random() > 0.4) {
    //             //     const props = ["tiles/plant_01.glb", "tiles/plant_02.glb", "tiles/plant_03.glb", "tiles/plant_04.glb", "tiles/plant_05.glb"];
    //             //     const randomRotation = Math.random() * 360;
    //             //     const randomScale = Math.random() * 0.5 + 0.5;
    //             //     const YOffset = Math.random() * 0.2;
    //             //     const XJitter = Math.random() * 0.6 - 0.3;
    //             //     const ZJitter = Math.random() * 0.6 - 0.3;

    //             //     tileObj.prop.src = props[Math.floor(Math.random() * props.length)];
    //             //     tileObj.prop.dataset.rotation = `0 ${randomRotation} 0`;
    //             //     tileObj.prop.dataset.position = `${XJitter} -${YOffset} ${ZJitter}`;
    //             //     Object.assign(tileObj.prop.style, {
    //             //         scale: randomScale,
    //             //     })
    //             // }

    //         }
    //     }
    // }

    updatePanel() {
        document.querySelector("#move-count").innerText = this.state.moveCount;
        document.querySelector("#room-count").innerText = this.levelId;
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
        // console.log(this.levelId)
        return {
            offsetRow: r * this.scale - (this.rowCount * this.scale) / 2,
            offsetCol: c * this.scale - (this.colCount * this.scale) / 2,
            offsetFloor: this.levelsMap[this.levelId].heightMap[r][c] * this.scale * 0.35 + 0.1
        }
    }

    movePlayer(targetX, targetY) {
        this.state.moveCount++;
        this.updatePanel();
        this.player.pos = {
            x: targetX,
            y: targetY
        }
        this.sounds.chessSound.components.set('audio', { state: 'play' })
        if (this.key.pos.x == this.player.pos.x && this.key.pos.y == this.player.pos.y && !this.state.hasKey) {
            this.state.hasKey = true;
            this.sounds.analogSound.components.set('audio', { state: 'play' });
        }
    }
}

let boardsys = new BoardSystem()

