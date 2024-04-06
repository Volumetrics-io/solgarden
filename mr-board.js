class BoardSystem extends MRSystem {
    constructor() {
        super()
        this.rowCount = 5;
        this.colCount = 5;
        this.floorCount = 2;
        this.scale = 0.06;

        this.levelId = 0;
        this.isPlayerTurn = true;
        this.gameIsStarted = false;

        this.rotationCollection = [0, 90, 180, 270];
        this.modelCollection = [
            ["tilegrass001", "tilegrass002", "tilegrass003"],
            ["tilegrass001", "tilegrass001", "tilegrass002"],
            ["tilegrass003", "tilegrass003", "tilegrass003"],
        ];

        this.sounds = {
            bgMusic: document.querySelector('#background-music'),
            chessSound: document.querySelector('#chess-sound'),
            doorSound: document.querySelector('#door-sound'),
            analogSound: document.querySelector('#analog-sound'),
            clashSound: document.querySelector('#clash-sound')
        }
        this.player = {
            el: document.createElement("mr-player"),
            playerHealth: 5000,
            playerMaxHealth: 5000,
            playerSpeed: 2
        };
        this.enemy = {
            el: document.createElement("mr-enemy")
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

        this.tilemap = [];

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
            this.tilemap.push(row);
        }

        // debug
        document.addEventListener("keydown", (event) => {
            if (event.key === "d") {
                event.preventDefault();
                this.initialize();
            }
        });
    }

    initialize() {
        this.levelId++;
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
        this.key.pos = this.player.pos = this.enemy.pos = {
            x: 0,
            y: 0
        }
        while ( this.player.pos.x == this.key.pos.x && this.player.pos.y == this.key.pos.y ||
                this.player.pos.x == this.enemy.pos.x && this.player.pos.y == this.enemy.pos.y ||
                this.enemy.pos.x == this.key.pos.x && this.enemy.pos.y == this.key.pos.y
            ) {
            this.player.pos = {
                x: Math.floor(Math.random() * (this.rowCount - 2) + 1),
                y: Math.floor(Math.random() * (this.colCount - 2) + 1)
            }
            this.key.pos = {
                x: Math.floor(Math.random() * (this.rowCount - 2) + 1),
                y: Math.floor(Math.random() * (this.colCount - 2) + 1)
            }
            this.enemy.pos = {
                x: Math.floor(Math.random() * (this.rowCount - 2) + 1),
                y: Math.floor(Math.random() * (this.colCount - 2) + 1)
            }
        }
        this.enemy.hp = 3;
        this.enemy.isDead = false;
        this.enemy.el.style.visibility = "visible";


        // Put the door on the outer ring of the map
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
            // Between the first and last column
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

        // a random tileset for this level
        const randomCollection = this.modelCollection[Math.floor(Math.random() * this.modelCollection.length)];

        for (let r = 0; r < this.rowCount; r++) {
            for (let c = 0; c < this.colCount; c++) {
                const tile = this.tilemap[r][c];

                let randomRotation = this.rotationCollection[Math.floor(Math.random() * this.rotationCollection.length)];
                tile.el.el.dataset.rotation = `0 ${randomRotation} 0`;

                // console.log(randomCollection);
                let randomModel = randomCollection[Math.floor(Math.random() * randomCollection.length)];
                // console.log(randomModel);
                tile.el.el.src = `tiles/${randomModel}.glb`;
                tile.el.elId = randomModel;
            }
        }

        // Play the background music
        // if (this.levelId == 2) {
        //     this.sounds.bgMusic.components.set('audio', { state: 'play' })
        // }
    }

    waveDeltaYAt(r, c) {
        // return 0;
        return Math.sin(this.timer + this.heightMap[r][c] / 1.5 + r / 10.5 + c / 1.5) / 1000;
    }

    update(deltaTime, frame) {

        if (this.gameIsStarted) {
            this.timer += deltaTime;

            for (let r = 0; r < this.tilemap.length; r++) {
                for (let c = 0; c < this.tilemap[r].length; c++) {
                    const tile = this.tilemap[r][c];

                    const pc = this.projectCoordinates(tile.pos.x, tile.pos.y);
                    tile.el.dataset.position = `${pc.offsetRow} ${pc.offsetFloor + this.waveDeltaYAt(r, c)} ${pc.offsetCol}`;

                    if (this.isPlayerTurn) {
                        if (this.canMove(tile.pos.x, tile.pos.y, this.player.pos.x, this.player.pos.y)) {
                            if (tile.pos.x == this.enemy.pos.x && tile.pos.y == this.enemy.pos.y && !this.enemy.isDead) {
                                tile.el.floorTile.object3D.children[0].material = new THREE.MeshPhongMaterial({
                                    color: "#ff6666",
                                    transparent: true,
                                    opacity: 0.5
                                });
                            } else {
                                tile.el.floorTile.object3D.children[0].material = new THREE.MeshPhongMaterial({
                                    color: "#66aaff",
                                    transparent: true,
                                    opacity: 0.5
                                });
                            }
                        } else {
                            tile.el.floorTile.object3D.children[0].material = new THREE.MeshPhongMaterial({
                                color: "#ffffff",
                                transparent: true,
                                opacity: 0,
                            });
                        }
                    } else {
                        tile.el.floorTile.object3D.children[0].material.opacity = 0;
                    }

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
                this.goal.el.style.visibility = "visible";
            } else {
                this.goal.el.style.visibility = "hidden";
            }

            const dc = this.projectCoordinates(this.door.pos.x, this.door.pos.y);
            this.door.el.dataset.position = `${dc.offsetRow} ${dc.offsetFloor + this.waveDeltaYAt(this.door.pos.x, this.door.pos.y)} ${dc.offsetCol}`;
            this.sounds.doorSound.dataset.position = this.door.el.dataset.position;

            const ec = this.projectCoordinates(this.enemy.pos.x, this.enemy.pos.y);
            this.enemy.el.dataset.position = `${ec.offsetRow} ${ec.offsetFloor + this.waveDeltaYAt(this.enemy.pos.x, this.enemy.pos.y)} ${ec.offsetCol}`;
            if (this.enemy.isDead) {
                this.enemy.el.style.visibility = "hidden";
            } else {
                this.enemy.el.style.visibility = "visible";
            }
            this.sounds.clashSound.dataset.position = this.enemy.el.dataset.position;

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

            this.updatePanel();

        }
    }

    attachedComponent(entity) {

        this.player.el.style.scale = this.scale;
        entity.appendChild(this.player.el);

        this.enemy.el.style.scale = this.scale;
        entity.appendChild(this.enemy.el);

        this.door.el.style.scale = this.scale;
        entity.appendChild(this.door.el);

        this.key.el.style.scale = this.scale;
        entity.appendChild(this.key.el);

        this.goal.el.style.scale = this.scale;
        entity.appendChild(this.goal.el);

        // for (let l = 0; l < this.levelCount; l++) {
        for (let r = 0; r < this.rowCount; r++) {
            for (let c = 0; c < this.colCount; c++) {
                const tileObj = this.tilemap[r][c];

                tileObj.el.addEventListener("mouseover", () => {
                    tileObj.el.floorTile.dataset.position = "0 -0.1 0";
                })

                tileObj.el.addEventListener("mouseout", () => {
                    tileObj.el.floorTile.dataset.position = "0 0 0";
                })

                tileObj.el.addEventListener("touchstart", () => {
                    if (this.canMove(tileObj.pos.x, tileObj.pos.y, this.player.pos.x, this.player.pos.y)) {
                        this.movePlayer(tileObj.pos.x, tileObj.pos.y);
                    }
                })

                // this.tileContainer.appendChild(tileObj.el);
                entity.append(tileObj.el);
                tileObj.el.style.scale = this.scale;
            }
        }
        // }

        this.initialize();
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
        document.querySelector("#health-status").innerText = this.player.playerHealth + "/" + this.player.playerMaxHealth;
    }

    canMove(r, c, px, py) {
        let canMove = false;

        const diffX = Math.abs(r - px);
        const diffY = Math.abs(c - py);
        const distance = Math.sqrt(diffX * diffX + diffY * diffY);

        if (distance < this.player.playerSpeed) {
            canMove = true;
        }

        // if (r + 1 == px && c - 1 == py ||
        //     r + 1 == px && c == py ||
        //     r + 1 == px && c + 1 == py ||
        //     r - 1 == px && c - 1 == py ||
        //     r - 1 == px && c == py ||
        //     r - 1 == px && c + 1 == py ||
        //     r == px && c - 1 == py ||
        //     r == px && c + 1 == py
        // ) {
        //     canMove = true;
        // }
        return canMove;
    }

    projectCoordinates(r, c) {
        // console.log(this.levelId)
        return {
            offsetRow: r * this.scale - (this.rowCount * this.scale) / 2,
            offsetCol: c * this.scale - (this.colCount * this.scale) / 2,
            offsetFloor: this.heightMap[r][c] * this.scale * 0.35 + 0.1
        }
    }

    movePlayer(targetX, targetY) {
        if (this.isPlayerTurn) {
            this.state.moveCount++;

            console.log(this.enemy.pos);

            if (targetX == this.enemy.pos.x && targetY == this.enemy.pos.y && !this.enemy.isDead) {
                console.log("attack");
                this.combat();
            } else {
                this.player.pos = {
                    x: targetX,
                    y: targetY
                }
                this.sounds.chessSound.components.set('audio', { state: 'play' })
                if (this.key.pos.x == this.player.pos.x && this.key.pos.y == this.player.pos.y && !this.state.hasKey) {
                    this.state.hasKey = true;
                    this.sounds.analogSound.components.set('audio', { state: 'play' });

                    this.player.playerSpeed = 2.35;
                }
                this.isPlayerTurn = false;
                this.opponentTurn();
            }
        }
    }

    opponentTurn() {
        if (!this.enemy.isDead) {
            const directionX = this.player.pos.x - this.enemy.pos.x;
            const directionY = this.player.pos.y - this.enemy.pos.y;

            let goalX = this.enemy.pos.x;
            let goalY = this.enemy.pos.y;

            if (directionX < 0) {
                goalX -= 1;
            } else if (directionX > 0) {
                goalX += 1;
            }

            if (directionY < 0) {
                goalY -= 1;
            } else if (directionY > 0) {
                goalY += 1;
            }

            if (goalX == this.player.pos.x && goalY == this.player.pos.y) {
                console.log("you are being attacked");
                this.combat();
            } else {
                if (Math.random() < 0.75) {
                    this.enemy.pos.x = goalX;
                    this.enemy.pos.y = goalY;
                }
            }
        }

        setTimeout(() => {
            this.isPlayerTurn = true;
        }, 300)
    }

    combat() {
        this.sounds.clashSound.components.set('audio', { state: 'play' });

        this.player.playerHealth--;
        this.enemy.hp--;

        if (this.player.playerHealth <= 0) {
            this.gameIsStarted = false;
            console.log('you ded')
        }

        if (this.enemy.hp <= 0) {
            this.enemy.isDead = true;
        }
    }
}

let boardsys = new BoardSystem()

