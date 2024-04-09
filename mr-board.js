class BoardSystem extends MRSystem {
    constructor() {
        super()
        this.minRowCount = 4;
        this.minColCount = 4;
        this.minFlrCount = 1;
        this.maxRowCount = 10;
        this.maxColCount = 10;
        this.maxFlrCount = 4;
        this.scale = 0.05;
        this.levelId = 0;
        this.gameIsStarted = false;

        this.rotationCollection = [0, 90, 180, 270];

        this.biomes = [
            {
                name: "plains",
                tileset: ["tilegrass001", "tilegrass002", "tilegrass003"],
                
            },
            {

            }
        ]
        this.tileSets = [
            ["tilegrass001", "tilegrass002", "tilegrass003"],
            ["tilegrass001", "tilegrass001", "tilegrass002"],
            ["tilegrass003", "tilegrass003", "tilegrass003"],
            ["tilegrasscyan001", "tilegrasscyan002", "tilegrasscyan003"],
            ["tilegrasspurple001", "tilegrasspurple002", "tilegrasspurple003"],
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
        this.key = {
            el: document.createElement("mr-key")
        };
        this.door = {
            el: document.createElement("mr-door")
        };
        this.goal = {
            el: document.createElement("mr-goal")
        };

        // container to store board object references
        this.container = document.createElement("mr-div");

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
        };
        this.timer = 0;
        this.isPlayerTurn = true;
        // elevation for the heightmap
        this.flrCount = Math.floor(Math.random() * (this.maxFlrCount - this.minFlrCount) + this.minFlrCount);
        this.rowCount = Math.floor(Math.random() * (this.maxRowCount - this.minRowCount) + this.minRowCount);
        this.colCount = Math.floor(Math.random() * (this.maxColCount - this.minColCount) + this.minColCount);
        this.heightMap = Array.from({ length: this.rowCount }, (_, x) =>
            Array.from({ length: this.colCount }, (_, y) => Math.floor(smoothNoise(x * 0.5, y * 0.5) * this.flrCount))
        );

        // clear up the dom elements container
        while (this.container.firstChild) {
            this.container.removeChild(this.container.lastChild);
        }

        var possiblePos = [];
        for (let r = 0; r < this.rowCount; r++) {
            for (let c = 0; c < this.colCount; c++) {
                const pos = {
                    x: r,
                    y: c
                }
                possiblePos.push(pos);
            }
        }

        // console.log(possiblePos.splice(Math.floor(Math.random() * possiblePos.length), 1)[0])

        this.player.pos = possiblePos.splice(Math.floor(Math.random() * possiblePos.length), 1)[0];
        // console.log(possiblePos);

        this.key.pos = possiblePos.splice(Math.floor(Math.random() * possiblePos.length), 1)[0];
        // console.log(possiblePos);

        // TODO: change the way we find unnoccupied board space
        // Dictionnary and remove elements?
        // this.key.pos = this.player.pos = {
        //     x: 0,
        //     y: 0
        // }
        // while (this.player.pos.x == this.key.pos.x && this.player.pos.y == this.key.pos.y) {
        // this.player.pos = {
        //     x: Math.floor(Math.random() * (this.rowCount - 2) + 1),
        //     y: Math.floor(Math.random() * (this.colCount - 2) + 1)
        // }
        // this.key.pos = {
        //     x: Math.floor(Math.random() * (this.rowCount - 2) + 1),
        //     y: Math.floor(Math.random() * (this.colCount - 2) + 1)
        // }
        // }

        // Randomly generate tilemap
        this.tilemap = [];
        const randomTileset = this.tileSets[Math.floor(Math.random() * this.tileSets.length)];
        for (let r = 0; r < this.rowCount; r++) {
            const row = [];
            for (let c = 0; c < this.colCount; c++) {
                const el = document.createElement("mr-tile");
                el.style.scale = this.scale;
                el.dataset.tileset = randomTileset;
                this.container.appendChild(el);

                const tile = {
                    el: el,
                    pos: {
                        x: r,
                        y: c
                    }
                }

                el.addEventListener("mouseover", () => {
                    el.floorTile.object3D.children[0].material.color.setStyle('#66aaff')
                    el.floorTile.object3D.children[0].material.opacity = 0.5;
                })

                el.addEventListener("touchstart", () => {
                    if (this.canMove(tile.pos.x, tile.pos.y, this.player.pos.x, this.player.pos.y)) {
                        this.movePlayer(tile.pos.x, tile.pos.y);
                    }
                })

                row.push(tile);
            }
            this.tilemap.push(row);
        }

        // Generate the enemies starting at the second room
        this.enemies = [];
        if (this.levelId > 1) {
            const enemyCount = Math.floor(Math.random() * 3) + 2;
            for (let i = 0; i < enemyCount; i++) {
                const el = document.createElement("mr-enemy");
                el.style.scale = this.scale;
                this.container.appendChild(el);

                this.enemies.push({
                    el: el,
                    hp: 3,
                    isDead: false,
                    pos: possiblePos.splice(Math.floor(Math.random() * possiblePos.length), 1)[0]
                });
            }
        }

        this.impassibles = [];
        const impassibleCount = Math.floor(Math.random() * 3) + 2;
        for (let i = 0; i < impassibleCount; i++) {
            // const el = document.createElement("mr-enemy");
            // el.style.scale = this.scale;
            // this.container.appendChild(el);

            // this.enemies.push({
            //     el: el,
            //     hp: 3,
            //     isDead: false,
            //     pos: possiblePos.splice(Math.floor(Math.random() * possiblePos.length), 1)[0]
            // });
        }

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

        // Play the background music
        // if (this.levelId == 2) {
        //     this.sounds.bgMusic.components.set('audio', { state: 'play' })
        // }

        this.gameIsStarted = true;
    }

    waveDeltaYAt(r, c) {
        return 0;
        // return Math.sin(this.timer + this.heightMap[r][c] / 1.5 + r / 10.5 + c / 1.5) / 1000;
    }

    update(deltaTime, frame) {

        if (this.gameIsStarted) {
            this.timer += deltaTime;

            // PLAYER
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

            // TUTORIAL (Blue goal)
            // Blue goal is shown for the first 2 turns
            if (this.levelId < 3) {
                const gc = this.projectCoordinates(this.goal.pos.x, this.goal.pos.y);
                this.goal.el.dataset.position = `${gc.offsetRow} ${gc.offsetFloor + this.waveDeltaYAt(this.goal.pos.x, this.goal.pos.y)} ${gc.offsetCol}`;
                this.goal.el.style.scale = this.scale;
                this.goal.el.style.visibility = "visible";
            } else {
                this.goal.el.style.visibility = "hidden";
            }

            // DOOR
            const dc = this.projectCoordinates(this.door.pos.x, this.door.pos.y);
            this.door.el.dataset.position = `${dc.offsetRow} ${dc.offsetFloor + this.waveDeltaYAt(this.door.pos.x, this.door.pos.y)} ${dc.offsetCol}`;
            this.sounds.doorSound.dataset.position = this.door.el.dataset.position;

            // ENEMIES
            this.enemies.forEach(enemy => {
                const coor = this.projectCoordinates(enemy.pos.x, enemy.pos.y);
                enemy.el.dataset.position = `${coor.offsetRow} ${coor.offsetFloor + this.waveDeltaYAt(enemy.pos.x, enemy.pos.y)} ${coor.offsetCol}`;
                if (enemy.isDead) {
                    enemy.el.style.visibility = "hidden";
                } else {
                    enemy.el.style.visibility = "visible";
                }
            })

            this.tilemap.forEach(row => {
                row.forEach(tile => {
                    const coor = this.projectCoordinates(tile.pos.x, tile.pos.y);
                    tile.el.dataset.position = `${coor.offsetRow} ${coor.offsetFloor + this.waveDeltaYAt(tile.pos.x, tile.pos.y)} ${coor.offsetCol}`;

                    if (this.isPlayerTurn) {
                        if (this.canMove(tile.pos.x, tile.pos.y, this.player.pos.x, this.player.pos.y)) {

                            // reachable tiles in the zone around the player
                            tile.el.floorTile.dataset.position = "0 0 0";
                            tile.el.floorTile.object3D.children[0].material.color.setStyle('#66aaff')
                            tile.el.floorTile.object3D.children[0].material.opacity = 0.5;

                            // recolor the tile if any enemy is on it
                            this.enemies.forEach(enemy => {
                                if (tile.pos.x == enemy.pos.x && tile.pos.y == enemy.pos.y && !enemy.isDead) {
                                    tile.el.floorTile.object3D.children[0].material.color.setStyle('#ff6666')
                                }
                            })

                        } else {

                            // otherwise make the tile transparent and shove it 
                            // in the floor so it doesn't intercept clicks
                            tile.el.floorTile.dataset.position = "0 -0.2 0";
                            tile.el.floorTile.object3D.children[0].material.opacity = 0;
                        }
                    } else {
                        // tile.el.floorTile.object3D.children[0].material.color.setStyle('transparent')
                        tile.el.floorTile.object3D.children[0].material.opacity = 0;
                    }

                })
            })

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

        this.root = entity;
        this.root.appendChild(this.container);

        this.player.el.style.scale = this.scale;
        this.root.appendChild(this.player.el);

        this.door.el.style.scale = this.scale;
        this.root.appendChild(this.door.el);

        this.key.el.style.scale = this.scale;
        this.root.appendChild(this.key.el);

        this.goal.el.style.scale = this.scale;
        this.root.appendChild(this.goal.el);

        this.initialize();

        // debug
        // document.addEventListener("keydown", (event) => {
        //     if (event.key === "d") {
        //         event.preventDefault();
        //         this.initialize();
        //     }
        // });
    }

    updatePanel() {
        document.querySelector("#move-count").innerText = this.state.moveCount;
        document.querySelector("#room-count").innerText = this.levelId;
        document.querySelector("#health-status").innerText = this.player.playerHealth + "/" + this.player.playerMaxHealth;
    }

    canMove(r, c, px, py) {
        const diffX = Math.abs(r - px);
        const diffY = Math.abs(c - py);
        const distance = Math.sqrt(diffX * diffX + diffY * diffY);
        return (distance < this.player.playerSpeed)
    }

    projectCoordinates(r, c) {
        return {
            offsetRow: r * this.scale - (this.rowCount * this.scale) / 2,
            offsetCol: c * this.scale - (this.colCount * this.scale) / 2,
            offsetFloor: this.heightMap[r][c] * this.scale * 0.35 + 0.1
        }
    }

    movePlayer(targetX, targetY) {
        if (this.isPlayerTurn) {
            this.state.moveCount++;

            let hadCombats = false;
            this.enemies.forEach(enemy => {
                if (targetX == enemy.pos.x && targetY == enemy.pos.y && !enemy.isDead) {
                    console.log(`attacked by ${enemy.pos.x} ${enemy.pos.y}`);
                    this.combat(enemy);
                    hadCombats = true;
                }
            });

            if (!hadCombats) {
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
        this.enemies.forEach(enemy => {
            if (!enemy.isDead) {
                const directionX = this.player.pos.x - enemy.pos.x;
                const directionY = this.player.pos.y - enemy.pos.y;

                let goalX = enemy.pos.x;
                let goalY = enemy.pos.y;

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
                    this.combat(enemy);
                } else {
                    if (Math.random() < 0.75) {
                        enemy.pos.x = goalX;
                        enemy.pos.y = goalY;
                    }
                }
            }

        });

        setTimeout(() => {
            this.isPlayerTurn = true;
        }, 300)
    }

    combat(enemy) {
        this.sounds.clashSound.dataset.position = this.player.el.dataset.position;
        this.sounds.clashSound.components.set('audio', { state: 'play' });

        this.player.playerHealth--;
        enemy.hp--;

        if (this.player.playerHealth <= 0) {
            this.gameIsStarted = false;
            console.log('you ded')
        }

        if (enemy.hp <= 0) {
            enemy.isDead = true;
        }
    }
}

let boardsys = new BoardSystem()

