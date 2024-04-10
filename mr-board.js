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
                path: "tiles/biome_plains/",
                tiles: ["tilegrass001.glb", "tilegrass002.glb", "tilegrass003.glb"],
                props: ["plant_01.glb", "plant_02.glb", "rock001.glb"]
            },
            {
                name: "deserts",
                path: "tiles/biome_deserts/",
                tiles: ["tiledesert001.glb", "tiledesert002.glb", "tiledesert003.glb"],
                props: ["rockdesert001.glb", "rockdesert002.glb", "plant_05_to_test.glb"]
            }
        ]

        this.sounds = {
            bgMusic: document.querySelector('#background-music'),
            chessSound: document.querySelector('#chess-sound'),
            doorSound: document.querySelector('#door-sound'),
            analogSound: document.querySelector('#analog-sound'),
            clashSound: document.querySelector('#clash-sound')
        }

        this.playerStats = {
            health: 5000,
            maxHealth: 5000,
            moveSpeed: 2,
            actionPoints: 5,
            maxActionPoints: 5
        };
        // this.key = {
        //     el: document.createElement("mr-key")
        // };
        // this.door = {
        //     el: document.createElement("mr-door")
        // };
        // this.goal = {
        //     el: document.createElement("mr-goal")
        // };

        // container to store board object references
        this.container = document.createElement("mr-div");

        this.UILayer = document.createElement("mr-div");
        this.actionBalls = [];
        this.healthBalls = [];


        // debug
        document.addEventListener("keydown", (event) => {
            if (event.key === "d") {
                event.preventDefault();
                this.initialize();
            }
        });

    }

    // only used to debug
    printArray(string, array) {
        console.log(string);
        array.forEach(row => {
            console.log(row);
        })
    }

    initialize() {
        console.clear();
        this.levelId++;
        this.state = {
            hasKey: false,
            moveCount: 0,
            // isFalling: true,
            // fallHeight: -0.1
        };
        this.timer = 0;
        this.isPlayerTurn = true;

        // random geometry for the room
        this.flrCount = Math.floor(Math.random() * (this.maxFlrCount - this.minFlrCount) + this.minFlrCount);
        this.rowCount = Math.floor(Math.random() * (this.maxRowCount - this.minRowCount) + this.minRowCount);
        this.colCount = Math.floor(Math.random() * (this.maxColCount - this.minColCount) + this.minColCount);
        this.heightMap = Array.from({ length: this.rowCount }, (_, x) =>
            Array.from({ length: this.colCount }, (_, y) => Math.floor(smoothNoise(x * 0.5, y * 0.5) * this.flrCount))
        );

        console.log(`Floor: ${this.flrCount}; Rows: ${this.rowCount}; Cols: ${this.colCount}`)

        // will contain the obstacle 
        // this.blockmap = Array.from({ length: this.rowCount }, () =>
        //     Array.from({ length: this.colCount }, () => 0)
        // );

        // will contain all the other entities
        // this.entityMap = Array.from({ length: this.rowCount }, () =>
        //     Array.from({ length: this.colCount }, () => null)
        // );

        this.blockmap = Array.from({ length: this.rowCount }, () => Array(this.colCount).fill(0));
        this.entityMap = Array.from({ length: this.rowCount }, () => Array(this.colCount).fill(0));

        // clear up the dom elements container
        while (this.container.firstChild) {
            this.container.removeChild(this.container.lastChild);
        }

        // this.entityMap = [];
        // for (let r = 0; r < this.rowCount; r++) {
        //     const row = []
        //     for (let c = 0; c < this.colCount; c++) {
        //         row.push(null);
        //     }
        //     this.entityMap.push(row);
        // }


        // var possiblePos = [];
        // for (let r = 1; r < this.rowCount - 1; r++) {
        //     for (let c = 1; c < this.colCount - 1; c++) {
        //         const pos = {
        //             x: r,
        //             y: c
        //         }
        //         possiblePos.push(pos);
        //     }
        // }

        // this.player.pos = this.uniquePosition(possiblePos);
        // this.key.pos = this.uniquePosition(possiblePos);

        // Randomly generate tilemap
        this.tilemap = [];
        const randomBiome = this.biomes[Math.floor(Math.random() * this.biomes.length)];
        for (let r = 0; r < this.rowCount; r++) {
            const row = [];
            for (let c = 0; c < this.colCount; c++) {
                const el = document.createElement("mr-tile");
                // el.style.scale = this.scale;
                el.dataset.tileset = randomBiome.tiles;
                el.dataset.tilepath = randomBiome.path;
                this.container.appendChild(el);

                const tile = {
                    el: el,
                    pos: {
                        x: r,
                        y: c
                    }
                };

                // el.addEventListener("touchstart", () => {
                //     if (this.canMove(tile.pos.x, tile.pos.y, this.player.pos.x, this.player.pos.y)) {
                //         this.movePlayer(tile.pos.x, tile.pos.y);
                //     }
                // });

                row.push(tile);
            }
            this.tilemap.push(row);
        }

        // Generate the enemies starting at the second room
        // this.enemies = [];
        if (this.levelId > 1) {
            const enemyCount = Math.floor(Math.random() * 2) + 1;
            for (let i = 0; i < enemyCount; i++) {
                const el = document.createElement("mr-enemy");
                // el.style.scale = this.scale;
                this.container.appendChild(el);

                const enemy = {
                    el: el,
                    type: 'enemy',
                    hp: 3,
                    isDead: false
                };

                this.addToEntityMap(enemy);


                // this.enemies.push({
                //     el: el,
                //     hp: 3,
                //     isDead: false,
                //     pos: this.uniquePosition(possiblePos)
                // });
            }
        }

        // this.props = [];
        const propCount = 5;
        for (let i = 0; i < propCount; i++) {
            const el = document.createElement("mr-prop");
            // el.style.scale = this.scale;
            el.dataset.tileset = randomBiome.props;
            el.dataset.tilepath = randomBiome.path;
            this.container.appendChild(el);

            const prop = {
                el: el,
                type: 'prop'
            }

            let uniquePosition = this.addToEntityMap(prop);

            // player can't go on tiles marked 1 on the blockmap
            this.blockmap[uniquePosition.x][uniquePosition.y] = 1;

        }

        const player = document.createElement("mr-player");
        // player.style.scale = this.scale;
        this.container.appendChild(player);
        this.playerPos = this.addToEntityMap({
            el: player,
            type: 'player'
        });

        // player overhead light
        this.overheadLight = document.createElement("mr-light");
        this.container.appendChild(this.overheadLight);
        this.overheadLight.setAttribute('color', "#ffffff")
        this.overheadLight.setAttribute('intensity', 0.03)

        console.log(`Player position: { x: ${this.playerPos.x}, y: ${this.playerPos.y}}`)

        const randomChest = document.createElement("mr-chest");
        // randomChest.style.scale = this.scale;
        this.container.appendChild(randomChest);
        this.addToEntityMap({
            el: randomChest,
            type: 'chest'
        });

        // Put the door on the outer ring of the map
        // if (Math.random() < 0.5) {
        //     // between first and last row
        //     this.door.pos = {
        //         x: Math.random() < 0.5 ? 0 : this.rowCount - 1,
        //         y: Math.floor(Math.random() * this.rowCount)
        //     }
        //     if (this.door.pos.x == 0) {
        //         this.door.el.dataset.rotation = '0 90 0';
        //     } else {
        //         this.door.el.dataset.rotation = '0 270 0';
        //     }

        // } else {
        //     // Between the first and last column
        //     this.door.pos = {
        //         x: Math.floor(Math.random() * this.colCount),
        //         y: Math.random() < 0.5 ? 0 : this.colCount - 1
        //     }
        //     if (this.door.pos.y == 0) {
        //         this.door.el.dataset.rotation = '0 0 0';
        //     } else {
        //         this.door.el.dataset.rotation = '0 180 0';
        //     }

        // }

        // this.goal.pos = this.key.pos;

        // if (this.levelId > 1) {
        //     this.sounds.doorSound.components.set('audio', { state: 'play' });
        // }

        // Play the background music
        // if (this.levelId == 2) {
        //     this.sounds.bgMusic.components.set('audio', { state: 'play' })
        // }

        this.gameIsStarted = true;

        this.printArray("this.heightMap", this.heightMap);
        this.printArray("this.blockmap", this.blockmap);
        this.printArray("this.entityMap", this.entityMap);
    }

    waveDeltaYAt(r, c) {
        // return 0;
        return Math.sin(this.timer + this.heightMap[r][c] / 1.5 + r / 10.5 + c / 1.5) / 1000;
    }

    uniquePosition(array) {
        return array.splice(Math.floor(Math.random() * array.length), 1)[0]
    }

    addToEntityMap(entity) {
        // this.printArray('addToMap() before insertion', this.entityMap)
        let inserted = false;
        let pos;

        while (!inserted) {
            const randRow = Math.floor(Math.random() * this.rowCount);
            const randCol = Math.floor(Math.random() * this.colCount);

            if (this.entityMap[randRow][randCol] === 0) {
                this.entityMap[randRow][randCol] = entity;
                inserted = true;
                pos = {
                    x: randRow,
                    y: randCol
                }
            }
        }
        // this.printArray('addToMap() after insertion', this.entityMap)
        return pos
    }

    update(deltaTime, frame) {

        if (this.gameIsStarted) {
            this.timer += deltaTime;

            ///// UI LAYER
            this.actionBalls.forEach((actionBall, index) => {
                const ballsize = 0.01;
                const margin = 0.015;
                const offsetX = (this.actionBalls.length / 2) * ballsize + (this.actionBalls.length / 2 - 1) * margin;
                actionBall.dataset.position = `${index * ballsize + index * margin - offsetX} ${this.scale / 2 + ballsize} 0`;

                if (index < this.playerStats.maxActionPoints) {
                    actionBall.style.visibility = "visible";
                    if (index < this.playerStats.actionPoints) {
                        // actionBall.el.style.opacity = 1;
                        actionBall.el.object3D.children[0].material.opacity = 1;
                    } else {
                        // actionBall.el.style.opacity = 0.25;
                        actionBall.el.object3D.children[0].material.opacity = 0.25;
                    }
                } else {
                    actionBall.style.visibility = "hidden";
                }
            });
            /////

            // PLAYER
            // if (this.state.isFalling) {
            //     this.state.fallHeight += 0.01;
            //     if (this.state.fallHeight >= 0) {
            //         this.state.isFalling = false;
            //     }
            // }
            // const plc = this.projectCoordinates(this.player.pos.x, this.player.pos.y);
            // const playerY = plc.offsetFloor + this.waveDeltaYAt(this.player.pos.x, this.player.pos.y) - this.state.fallHeight;
            // this.player.el.dataset.position = `${plc.offsetRow} ${playerY} ${plc.offsetCol}`;
            // this.sounds.chessSound.dataset.position = this.player.el.dataset.position;

            // TUTORIAL (Blue goal)
            // Blue goal is shown for the first 2 turns
            // if (this.levelId < 3) {
            //     const gc = this.projectCoordinates(this.goal.pos.x, this.goal.pos.y);
            //     this.goal.el.dataset.position = `${gc.offsetRow} ${gc.offsetFloor + this.waveDeltaYAt(this.goal.pos.x, this.goal.pos.y)} ${gc.offsetCol}`;
            //     this.goal.el.style.scale = this.scale;
            //     this.goal.el.style.visibility = "visible";
            // } else {
            //     this.goal.el.style.visibility = "hidden";
            // }

            // DOOR
            // const dc = this.projectCoordinates(this.door.pos.x, this.door.pos.y);
            // this.door.el.dataset.position = `${dc.offsetRow} ${dc.offsetFloor + this.waveDeltaYAt(this.door.pos.x, this.door.pos.y)} ${dc.offsetCol}`;
            // this.sounds.doorSound.dataset.position = this.door.el.dataset.position;

            // ENEMIES
            // this.enemies.forEach(enemy => {
            //     const coor = this.projectCoordinates(enemy.pos.x, enemy.pos.y);
            //     enemy.el.dataset.position = `${coor.offsetRow} ${coor.offsetFloor + this.waveDeltaYAt(enemy.pos.x, enemy.pos.y)} ${coor.offsetCol}`;
            //     if (enemy.isDead) {
            //         enemy.el.style.visibility = "hidden";
            //     } else {
            //         enemy.el.style.visibility = "visible";
            //     }
            // })

            // PROPS
            // this.props.forEach(prop => {
            //     const coor = this.projectCoordinates(prop.pos.x, prop.pos.y);
            //     prop.el.dataset.position = `${coor.offsetRow} ${coor.offsetFloor + this.waveDeltaYAt(prop.pos.x, prop.pos.y)} ${coor.offsetCol}`;
            // })

            const offsetX = - this.scale / 2;
            const offsetY = (this.rowCount / 2) * this.scale;
            // const offsetY = this.rowCount * this.scale;

            this.UILayer.dataset.position = `${offsetX} 0 ${offsetY}`;

            const distances = this.calculateDistances(this.playerPos.y, this.playerPos.x, this.blockmap);
            // this.printArray('distances array', distances)
            this.tilemap.forEach(row => {
                row.forEach(tile => {
                    const coor = this.projectCoordinates(tile.pos.x, tile.pos.y);
                    tile.el.dataset.position = `${coor.offsetRow} ${coor.offsetFloor + this.waveDeltaYAt(tile.pos.x, tile.pos.y)} ${coor.offsetCol}`;

                    const distance = distances[tile.pos.x][tile.pos.y];

                    if (distance != Infinity &&
                        distance <= this.playerStats.actionPoints &&
                        distance > 0 &&
                        this.entityMap[tile.pos.x][tile.pos.y] == 0) {
                        let offsetY = distance * 40;
                        // tile.el.floorTile.dataset.position = `0 0 0`;
                        let color = `hsl(${offsetY}, 80%, 60%)`;
                        tile.el.floorTile.object3D.children[0].material.color.setStyle(color)
                        tile.el.floorTile.object3D.children[0].material.opacity = 1;

                        tile.el.numberString.innerText = distance;
                    }

                    // if(this.entityMap[tile.pos.x][tile.pos.y] != 0) {
                    //     let color = `hsl(0, 70%, 70%)`;
                    //     tile.el.floorTile.object3D.children[0].material.color.setStyle(color)
                    //     tile.el.floorTile.object3D.children[0].material.opacity = 1;
                    // }

                    // if (this.isPlayerTurn) {
                    //     if (this.canMove(tile.pos.x, tile.pos.y, this.player.pos.x, this.player.pos.y)) {

                    //         // reachable tiles in the zone around the player
                    //         // console.log(this.pathfinder.findPath(tile.pos.x, tile.pos.y, this.player.pos.x, this.player.pos.y))
                    //         tile.el.floorTile.dataset.position = `0 0 0`;
                    //         tile.el.floorTile.object3D.children[0].material.color.setStyle('#66aaff')
                    //         tile.el.floorTile.object3D.children[0].material.opacity = 0.5;

                    //         // recolor the tile if any enemy is on it
                    //         this.enemies.forEach(enemy => {
                    //             if (tile.pos.x == enemy.pos.x && tile.pos.y == enemy.pos.y && !enemy.isDead) {
                    //                 tile.el.floorTile.object3D.children[0].material.color.setStyle('#ff6666')
                    //             }
                    //         })

                    //         // recolor the tile if any prop is on it
                    //         this.props.forEach(prop => {
                    //             if (tile.pos.x == prop.pos.x && tile.pos.y == prop.pos.y) {
                    //                 tile.el.floorTile.object3D.children[0].material.color.setStyle('#ff6666')
                    //             }
                    //         })

                    //     } else {

                    //         // otherwise make the tile transparent and shove it 
                    //         // in the floor so it doesn't intercept clicks
                    //         tile.el.floorTile.dataset.position = "0 -0.2 0";
                    //         tile.el.floorTile.object3D.children[0].material.opacity = 0;
                    //     }
                    // } else {
                    //     tile.el.floorTile.object3D.children[0].material.opacity = 0;
                    // }

                })
            })

            for (let r = 0; r < this.rowCount; r++) {
                for (let c = 0; c < this.colCount; c++) {
                    const entity = this.entityMap[r][c];
                    if (entity != 0) {
                        const coor = this.projectCoordinates(r, c);
                        entity.el.dataset.position = `${coor.offsetRow} ${coor.offsetFloor + this.waveDeltaYAt(r, c)} ${coor.offsetCol}`;
                    }
                }
            }

            const coor = this.projectCoordinates(this.playerPos.x, this.playerPos.y);
            this.overheadLight.dataset.position = `${coor.offsetRow} ${coor.offsetFloor + 0.9 + this.waveDeltaYAt(this.playerPos.x, this.playerPos.y)} ${coor.offsetCol}`;


            // this.entityMap.forEach(row => {
            //     row.forEach(entity => {
            //         const coor = this.projectCoordinates(tile.pos.x, tile.pos.y);
            //         tile.el.dataset.position = `${coor.offsetRow} ${coor.offsetFloor + this.waveDeltaYAt(tile.pos.x, tile.pos.y)} ${coor.offsetCol}`;
            //     })
            // })

            // if (this.state.hasKey) {
            //     this.goal.pos = this.door.pos;
            //     const kc = this.projectCoordinates(this.player.pos.x, this.player.pos.y);
            //     this.key.el.dataset.position = `${kc.offsetRow} ${kc.offsetFloor + this.waveDeltaYAt(this.key.pos.x, this.key.pos.y) + 0.06} ${kc.offsetCol}`;
            //     this.key.el.dataset.compAnimation = "clip: 0; action: stop;";
            // } else {
            //     const kc = this.projectCoordinates(this.key.pos.x, this.key.pos.y);
            //     this.key.el.dataset.position = `${kc.offsetRow} ${kc.offsetFloor + this.waveDeltaYAt(this.key.pos.x, this.key.pos.y)} ${kc.offsetCol}`;
            //     this.key.el.dataset.compAnimation = "clip: 0; action: play;";
            // }
            // this.sounds.analogSound.dataset.position = this.key.el.dataset.position;

            // if (this.state.hasKey && this.door.pos.x == this.player.pos.x && this.door.pos.y == this.player.pos.y) {
            //     this.initialize();
            // }

            // this.updatePanel();

            // const offsetX = (this.rowCount * this.scale) / 2;
            // const offsetY = (this.colCount * this.scale) / 2;
            // this.container.dataset.position = `-${offsetX / 2} 0 -${offsetY / 2}`

        }
    }

    attachedComponent(entity) {
        this.root = entity;
        this.root.appendChild(this.container);

        this.root.appendChild(this.UILayer);
        this.UILayer.object3D.add(new THREE.Mesh(
            new THREE.BoxGeometry(this.scale * 5, this.scale, this.scale),
            new THREE.MeshPhongMaterial({
                color: "#ffffff",
                transparent: true,
                opacity: 1,
                receiveShadow: true
            })));
        this.root.appendChild(this.UILayer);

        for (let i = 0; i < 7; i++) {
            let actionBall = document.createElement("mr-action-ball");
            this.actionBalls.push(actionBall);
            this.UILayer.appendChild(actionBall);
        }

        this.endTurnButton = document.createElement("mr-button");
        this.endTurnButton.innerText = "End turn";
        this.endTurnButton.style.fontSize = "10px";
        this.endTurnButton.dataset.position = "0.085 0.027 0";
        this.endTurnButton.dataset.rotation = "270 0 0";
        this.UILayer.appendChild(this.endTurnButton);


        // this.root.appendChild(this.overheadLight);


        this.container.style.scale = this.scale;

        // this.player.el.style.scale = this.scale;
        // this.root.appendChild(this.player.el);

        // this.door.el.style.scale = this.scale;
        // this.root.appendChild(this.door.el);

        // this.key.el.style.scale = this.scale;
        // this.root.appendChild(this.key.el);

        // this.goal.el.style.scale = this.scale;
        // this.root.appendChild(this.goal.el);

        this.initialize();
    }

    // updatePanel() {
    //     document.querySelector("#move-count").innerText = this.state.moveCount;
    //     document.querySelector("#room-count").innerText = this.levelId;
    //     document.querySelector("#health-status").innerText = this.playerStats.health + "/" + this.playerStats.maxHealth;
    // }

    // canMove(r, c, px, py) {
    //     const diffX = Math.abs(r - px);
    //     const diffY = Math.abs(c - py);
    //     const distance = Math.sqrt(diffX * diffX + diffY * diffY);
    //     return (distance < this.playerStats.moveSpeed)
    // }

    projectCoordinates(r, c) {
        // return {
        //     offsetRow: r * this.scale - (this.rowCount * this.scale) / 2,
        //     offsetCol: c * this.scale - (this.colCount * this.scale) / 2,
        //     offsetFloor: this.heightMap[r][c] * this.scale * 0.35 + 0.1
        // }
        // return {
        //     offsetRow: r - this.rowCount / 2,
        //     offsetCol: c - this.colCount / 2,
        //     offsetFloor: this.heightMap[r][c] * 0.35 + 0.1
        // }
        return {
            offsetRow: c - this.colCount / 2,
            offsetCol: r - this.rowCount / 2,
            offsetFloor: this.heightMap[r][c] * 0.35 + 0.3
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

                    this.playerStats.moveSpeed = 2.35;
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

        this.playerStats.health--;
        enemy.hp--;

        if (this.playerStats.health <= 0) {
            this.gameIsStarted = false;
            console.log('you ded')
        }

        if (enemy.hp <= 0) {
            enemy.isDead = true;
        }
    }

    calculateDistances(x, y, blockmap) {
        // https://codepen.io/lobau/pen/XWQqVwy/6a4c88328ccf9f08befa5463af05708a
        const width = blockmap[0].length;
        const height = blockmap.length;

        // Initialize distances array with Infinity for unvisited cells
        const distances = Array.from({ length: height }, () =>
            Array(width).fill(Infinity)
        );
        distances[y][x] = 0; // Distance to itself is 0

        // Directions array for exploring all 8 directions around a cell (diagonals included)
        // const directions = [
        //     [-1, 0],
        //     [1, 0],
        //     [0, -1],
        //     [0, 1],
        //     [-1, -1],
        //     [1, 1],
        //     [-1, 1],
        //     [1, -1]
        // ];

        const directions = [
            [-1, 0],
            [1, 0],
            [0, -1],
            [0, 1]
        ];

        // Queue for BFS, starting with the specified cell
        let queue = [[x, y]];

        while (queue.length > 0) {
            const [currentX, currentY] = queue.shift();

            for (let [dx, dy] of directions) {
                const newX = currentX + dx;
                const newY = currentY + dy;

                // Check bounds and obstacles
                if (
                    newX >= 0 &&
                    newX < width &&
                    newY >= 0 &&
                    newY < height &&
                    blockmap[newY][newX] === 0
                ) {
                    // Calculate potential new distance
                    const newDistance = distances[currentY][currentX] + 1;

                    // Update distance if newDistance is smaller
                    if (newDistance < distances[newY][newX]) {
                        distances[newY][newX] = newDistance;
                        queue.push([newX, newY]);
                    }
                }
            }
        }

        return distances;
    }
}

let boardsys = new BoardSystem()

