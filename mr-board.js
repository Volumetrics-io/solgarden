class BoardSystem extends MRSystem {
    constructor() {
        super()

        // will be moved to the Room class
        // this.minRowCount = 4;
        // this.minColCount = 4;
        // this.minFlrCount = 1;
        // this.maxRowCount = 10;
        // this.maxColCount = 10;
        // this.maxFlrCount = 4;
        //
        // this.biomes = [{
        //         name: "plains",
        //         path: "tiles/biome_plains/",
        //         tiles: ["tilegrass001.glb", "tilegrass002.glb", "tilegrass003.glb"],
        //         props: ["plant_01.glb", "plant_02.glb", "plant_03.glb", "plant_04.glb", "plant_05.glb", "rock001.glb"]
        //     },
        //     {
        //         name: "deserts",
        //         path: "tiles/biome_deserts/",
        //         tiles: ["tiledesert001.glb", "tiledesert002.glb", "tiledesert003.glb"],
        //         props: ["rockdesert001.glb", "rockdesert002.glb", "plant_05_to_test.glb"]
        //     }
        // ]
        ///////////////////////////////////


        this.scale = 0.05;
        this.levelId = 0;
        this.gameIsStarted = false;


        this.sounds = {
            bgMusic: document.querySelector('#bg-music'),
            chessSound: document.querySelector('#chess-sound'),
            doorSound: document.querySelector('#door-sound'),
            analogSound: document.querySelector('#analog-sound'),
            clashSound: document.querySelector('#clash-sound'),
            nopeSound: document.querySelector('#nope-sound'),
            swooshSound: document.querySelector('#swoosh-sound')
        }

        this.playerStats = {
            health: 10,
            maxHealth: 10,
            actionPoints: 4,
            maxActionPoints: 4,
            projectedCost: 0
        };

        // container to store board object references
        this.container = document.createElement("mr-div");
        this.UILayer = document.createElement("mr-div");
        this.actionBalls = [];

        // debug
        document.addEventListener("keydown", (event) => {
            if (event.key === "d") {
                event.preventDefault();
                this.initialize();
            }

            if (event.key === "e") {
                event.preventDefault();
                this.endGame();
            }
        });

    }

    initialize() {
        console.clear();
        this.levelId++;
        this.timer = 0;
        this.isPlayerTurn = true;
        this.playerStats.actionPoints = this.playerStats.maxActionPoints;

        // TODO:
        // Big refactor needed here.
        // Create a separate object called Room
        // You can pass already-made arrays to predefine rooms
        // or let it generate new random rooms with various variables
        // and you use this.myBiome.tileset and this.myBiome.entityMap, for example
        // const firstRoom = new Room({
        //      biome: "plains",
        //      entityMap: [...]
        // })
        //

        // random geometry for the room
        // this.flrCount = Math.floor(Math.random() * (this.maxFlrCount - this.minFlrCount) + this.minFlrCount);
        // this.rowCount = Math.floor(Math.random() * (this.maxRowCount - this.minRowCount) + this.minRowCount);
        // this.colCount = Math.floor(Math.random() * (this.maxColCount - this.minColCount) + this.minColCount);
        // this.heightMap = Array.from({
        //         length: this.rowCount
        //     }, (_, x) =>
        //     Array.from({
        //         length: this.colCount
        //     }, (_, y) => Math.floor(smoothNoise(x * 0.5, y * 0.5) * this.flrCount))
        // );
        // this.entityMap = Array.from({
        //     length: this.rowCount
        // }, () => Array(this.colCount).fill(0));

        // const numberOfAvailableSpots = this.rowCount * this.colCount;

        // console.log(`Floor: ${this.flrCount}; Rows: ${this.rowCount}; Cols: ${this.colCount}`)

        this.room = new Room();


        // clear up the dom elements container
        while (this.container.firstChild) {
            this.container.removeChild(this.container.lastChild);
        }

        // // Randomly generate tilemap
        // this.tilemap = [];
        // const randomBiome = this.biomes[Math.floor(Math.random() * this.biomes.length)];
        for (let r = 0; r < this.rowCount; r++) {
            const row = [];
            for (let c = 0; c < this.colCount; c++) {
                const el = document.createElement("mr-tile");
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

                el.addEventListener("mouseover", () => {
                    switch (this.entityMap[tile.pos.x][tile.pos.y].type) {
                        case "prop":
                            break;
                        case "enemy":
                            if (this.distanceBetween(tile.pos.x, tile.pos.y, this.playerPos.x, this.playerPos.y) <= 2) {
                                this.playerStats.projectedCost = 2;
                                console.log("a weapon would be highlighted");
                            }
                            break;
                        case "chest":
                            // console.log("hovering a chest")
                            break;
                        case "loot":
                            console.log("the item will do something on pick up")
                            break;
                        case "door":
                            // console.log("go to the next room after killing all the enemies")
                            break;
                        default:
                            // console.log("here");
                            this.playerStats.projectedCost = this.distances[tile.pos.x][tile.pos.y];
                            // el.floorTile.object3D.children[0].material.opacity = 1;
                            el.floorMaterial.opacity = 1;
                    }

                });

                el.addEventListener("mouseout", () => {
                    this.playerStats.projectedCost = 0;
                    // el.floorTile.object3D.children[0].material.opacity = 0.75;
                    el.floorMaterial.opacity = 0.75;
                });

                el.addEventListener("touchstart", () => {
                    const targetEntity = this.entityMap[tile.pos.x][tile.pos.y];
                    switch (targetEntity.type) {
                        case "prop":
                            // TODO do something when a prop is touched?
                            // Play a sound, an animation?
                            // console.log("this is a prop.")
                            break;
                        case "enemy":
                            // console.log("would be combat, depending of the distance.")
                            if (this.distanceBetween(tile.pos.x, tile.pos.y, this.playerPos.x, this.playerPos.y) <= 2 && this.playerStats.actionPoints >= 2) {
                                this.playerStats.actionPoints -= 2;
                                // this.combat(this.entityMap[tile.pos.x][tile.pos.y], tile.pos.x, tile.pos.y);
                                this.attackEntity(targetEntity, tile.pos.x, tile.pos.y);
                            } else {
                                this.sounds.nopeSound.components.set('audio', {
                                    state: 'play'
                                });
                            }
                            break;
                        case "chest":
                            // console.log("that will open the chest and drop an item on the floor")
                            if (this.distanceBetween(tile.pos.x, tile.pos.y, this.playerPos.x, this.playerPos.y) <= 2) {
                                // console.log('open the chest')
                                this.container.removeChild(this.entityMap[tile.pos.x][tile.pos.y].el);
                                this.dropLoot(tile.pos.x, tile.pos.y);
                                // this.entityMap[tile.pos.x][tile.pos.y] = {
                                //
                                // }
                            } else {
                                this.sounds.nopeSound.components.set('audio', {
                                    state: 'play'
                                });
                            }
                            break;
                        case "loot":
                            if (this.distanceBetween(tile.pos.x, tile.pos.y, this.playerPos.x, this.playerPos.y) <= 2) {
                                // this.playerStats.projectedCost = 2;
                                this.container.removeChild(this.entityMap[tile.pos.x][tile.pos.y].el);
                                this.entityMap[tile.pos.x][tile.pos.y] = 0;

                                this.sounds.analogSound.components.set('audio', {
                                    state: 'play'
                                });

                                if (this.playerStats.health < this.playerStats.maxHealth) {
                                    this.playerStats.health++;
                                }
                                // console.log("You got loot!!");
                            } else {
                                this.sounds.nopeSound.components.set('audio', {
                                    state: 'play'
                                });
                            }
                            // console.log("the item will do something on pick up")
                            break;
                        case "door":
                            this.sounds.doorSound.components.set('audio', {
                                state: 'play'
                            });
                            this.initialize();
                            // console.log("go to the next room after killing all the enemies")
                            break;
                        default:
                            const moveCost = this.distances[tile.pos.x][tile.pos.y];

                            if (moveCost <= this.playerStats.actionPoints) {
                                this.playerStats.actionPoints -= moveCost;
                                this.moveEntity(this.playerPos.x, this.playerPos.y, tile.pos.x, tile.pos.y);
                                this.playerPos.x = tile.pos.x;
                                this.playerPos.y = tile.pos.y;
                            } else {
                                this.sounds.nopeSound.components.set('audio', {
                                    state: 'play'
                                });
                            }

                    }
                    if (this.playerStats.actionPoints == 0) {
                        this.endTurn();
                    }

                });

                row.push(tile);
            }
            this.tilemap.push(row);
        }

        // Generate the enemies starting at the second room
        // if (this.levelId > 1) {
        const enemyCount = Math.floor(Math.random() * 2) + 1;
        // const enemyCount = 2;
        for (let i = 0; i < enemyCount; i++) {
            const el = document.createElement("mr-enemy");
            this.container.appendChild(el);

            const enemy = {
                el: el,
                type: 'enemy',
                hp: 3
            };

            this.addToEntityMap(enemy);
        }
        // }

        const propCount = Math.floor(numberOfAvailableSpots / 6);
        for (let i = 0; i < propCount; i++) {
            const el = document.createElement("mr-prop");
            el.dataset.tileset = randomBiome.props;
            el.dataset.tilepath = randomBiome.path;
            this.container.appendChild(el);

            const prop = {
                el: el,
                type: 'prop'
            }

            this.addToEntityMap(prop);
        }

        const player = document.createElement("mr-player");
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

        if (Math.random() > 0.6) {
            const randomChest = document.createElement("mr-chest");
            this.container.appendChild(randomChest);
            this.addToEntityMap({
                el: randomChest,
                type: 'chest'
            });

        }

        // Play the background music
        // if (this.levelId == 2) {
        //     this.sounds.bgMusic.components.set('audio', {
        //         state: 'play'
        //     });
        // }
        this.gameIsStarted = true;

        this.printArray("this.heightMap", this.heightMap);
        this.printArray("this.entityMap", this.entityMap);
    }

    // INITIALIZE() ^^^^
    //////////////////////////////////////////////////////
    //////////////////////////////////////////////////////
    //////////////////////////////////////////////////////
    //////////////////////////////////////////////////////
    //////////////////////////////////////////////////////
    //////////////////////////////////////////////////////
    //////////////////////////////////////////////////////

    // only used to debug
    printArray(string, array) {
        console.log(string);
        array.forEach(row => {
            console.log(row);
        })
    }

    waveDeltaYAt(r, c) {
        // return 0;
        return Math.sin(this.timer + this.heightMap[r][c] / 1.5 + r / 10.5 + c / 1.5) / 100;
    }

    uniquePosition(array) {
        return array.splice(Math.floor(Math.random() * array.length), 1)[0]
    }

    addToEntityMap(entity) {
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
        return pos
    }

    // updatePanel() {
    //     document.querySelector("#move-count").innerText = this.state.moveCount;
    //     document.querySelector("#room-count").innerText = this.levelId;
    //     document.querySelector("#health-status").innerText = this.playerStats.health + "/" + this.playerStats.maxHealth;
    // }

    projectCoordinates(r, c) {
        return {
            offsetRow: c - this.colCount / 2,
            offsetCol: r - this.rowCount / 2,
            offsetFloor: this.heightMap[r][c] * 0.35 + 0.3
        }
    }

    moveEntity(x1, y1, x2, y2) {
        if (!this.entityMap[x1] || !this.entityMap[x1][y1]) {
            console.log("No object found at the source position.");
            return; // No object at the source position
        }

        if (!this.entityMap[x2] || this.entityMap[x2][y2] !== 0) {
            console.log("Target position is not empty or out of bounds.");
            return; // Target cell is not empty or out of bounds
        }

        // Move the object
        this.entityMap[x2][y2] = this.entityMap[x1][y1];
        this.entityMap[x1][y1] = 0; // Set the source cell to empty

        this.sounds.chessSound.components.set('audio', {
            state: 'play'
        })

        // console.log("Object moved successfully.");
    }

    endTurn() {
        // console.log("turn ended")
        this.playerStats.actionPoints = this.playerStats.maxActionPoints;
        this.isPlayerTurn = false;


        this.combatQueue = [];

        for (let r = 0; r < this.rowCount; r++) {
            for (let c = 0; c < this.colCount; c++) {
                const entity = this.entityMap[r][c];
                if (entity.type == 'enemy') {
                    this.combatQueue.push({
                        entity: entity,
                        r: r,
                        c: c,
                    });
                }
            }
        }

        this.opponentTurn();

    }

    endGame() {
        console.log('you ded');

        this.playerStats.health = this.playerStats.maxHealth;
        this.initialize();

        // this is where we might want a way to generate a room
        // based on a template, that can be reusable
        // for example a 5x5 room with the player in the middle
        //
    }

    opponentTurn() {
        // the combat is a queue
        // each enemy take a turn
        if (this.combatQueue.length > 0) {
            const entry = this.combatQueue.pop();
            const entity = entry.entry;
            const r = entry.r;
            const c = entry.c;

            const directionX = this.playerPos.x - r;
            const directionY = this.playerPos.y - c;

            let goalX = r;
            let goalY = c;

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

            if (goalX == this.playerPos.x && goalY == this.playerPos.y) {
                this.attackPlayer(entity, 1);
            } else {
                if (Math.random() < 0.75) {
                    this.moveEntity(r, c, goalX, goalY);
                }
            }

            setTimeout(() => {
                this.opponentTurn();
            }, 800)
        } else {
            this.isPlayerTurn = true;
        }
    }

    attackPlayer(attacker, damage) {
        // TODO: move the sound where the attacker is
        this.sounds.clashSound.components.set('audio', {
            state: 'play'
        });
        this.playerStats.health -= damage;

        if (this.playerStats.health <= 0) {
            this.endGame();
        }
    }

    attackEntity(entity, r, c) {
        // TODO: move the sound where the player is
        this.sounds.swooshSound.components.set('audio', {
            state: 'play'
        });
        entity.hp -= 1; // TODO: should be tied to the player attack power

        if (entity.hp <= 0) {
            this.container.removeChild(entity.el);
            this.dropLoot(r, c);

            this.checkForDoor();
        }
    }

    checkForDoor() {
        let isEnemy = false;
        for (let r = 0; r < this.rowCount; r++) {
            for (let c = 0; c < this.colCount; c++) {
                const entity = this.entityMap[r][c];
                if (entity.type == 'enemy') {
                    isEnemy = true;
                }
            }
        }

        if (!isEnemy) {
            const el = document.createElement("mr-door");
            this.container.appendChild(el);

            const door = {
                el: el,
                type: 'door'
            };

            this.addToEntityMap(door);
        }
    }

    dropLoot(x, y) {
        const droppedLoot = document.createElement("mr-loot");
        this.container.appendChild(droppedLoot);

        const loot = {
            el: droppedLoot,
            type: 'loot',
            increaseHP: 1,
            increaseAP: 1,
        };

        this.entityMap[x][y] = loot;
    }

    distanceBetween(x1, y1, x2, y2) {
        var distX = x1 - x2;
        var distY = y1 - y2;
        return Math.sqrt(distX * distX + distY * distY);
    }

    calculateDistances(x, y, blockmap) {
        // https://codepen.io/lobau/pen/XWQqVwy/6a4c88328ccf9f08befa5463af05708a
        const width = blockmap[0].length;
        const height = blockmap.length;

        // Initialize distances array with Infinity for unvisited cells
        this.distances = Array.from({
                length: height
            }, () =>
            Array(width).fill(Infinity)
        );
        this.distances[y][x] = 0; // Distance to itself is 0

        const directions = [
            [-1, 0],
            [1, 0],
            [0, -1],
            [0, 1],
            // [-1, -1],
            // [1, 1],
            // [-1, 1],
            // [1, -1]
        ];

        // Queue for BFS, starting with the specified cell
        let queue = [
            [x, y]
        ];

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
                    const newDistance = this.distances[currentY][currentX] + 1;

                    // Update distance if newDistance is smaller
                    if (newDistance < this.distances[newY][newX]) {
                        this.distances[newY][newX] = newDistance;
                        queue.push([newX, newY]);
                    }
                }
            }
        }
    }

    //////////////////////////////////////////////////////
    //////////////////////////////////////////////////////
    //////////////////////////////////////////////////////
    //////////////////////////////////////////////////////
    //////////////////////////////////////////////////////
    //////////////////////////////////////////////////////
    //////////////////////////////////////////////////////
    // UPDATE()

    update(deltaTime, frame) {

        if (this.gameIsStarted) {
            this.timer += deltaTime;

            ///// UI LAYER
            this.actionBalls.forEach((actionBall, index) => {
                const ballsize = 0.008;
                const margin = 0.01;
                // const offsetX = (this.actionBalls.length / 2) * ballsize + (this.actionBalls.length / 2 - 1) * margin;
                const offsetX = ballsize + margin;
                actionBall.dataset.position = `${index * ballsize + index * margin + offsetX} ${this.scale / 2 + ballsize} 0`;

                if (index < this.playerStats.maxActionPoints) {
                    actionBall.style.visibility = "visible";
                    if (index < this.playerStats.actionPoints) {
                        actionBall.material.color.setStyle('#00ff55')
                        actionBall.material.opacity = 1;
                    } else {
                        actionBall.material.color.setStyle('#dddddd')
                        actionBall.material.opacity = 0.25;
                    }

                    // recolor the ball if it's a projected cost
                    if (index < this.playerStats.projectedCost) {
                        actionBall.material.color.setStyle('#875dff')
                    }
                } else {
                    actionBall.style.visibility = "hidden";
                }
            });
            // this.healthBar.el.dataset.position = `0 0.1 0`;
            // this.healthBar.geometry.scale( this.playerStats.health / this.playerStats.maxHealth, 0, 0 );
            // console.log(this.healthBar.mesh.scale);
            // this.healthBar.geometry = new THREE.BoxGeometry((this.playerStats.health / this.playerStats.maxHealth) / 10, 0.01, 0.01);
            this.healthBar.setHealth(this.playerStats.health / this.playerStats.maxHealth);
            /////

            const offsetX = -this.scale / 2;
            const offsetY = (this.rowCount / 2) * this.scale;

            this.UILayer.dataset.position = `${offsetX} 0 ${offsetY}`;
            // this.UILayer.dataset.rotation = `0 270 0`;

            this.calculateDistances(this.playerPos.y, this.playerPos.x, this.entityMap);
            this.tilemap.forEach(row => {
                row.forEach(tile => {

                    const x = tile.pos.x;
                    const y = tile.pos.y;

                    const coor = this.projectCoordinates(x, y);
                    tile.el.dataset.position = `${coor.offsetRow} ${coor.offsetFloor + this.waveDeltaYAt(x, y)} ${coor.offsetCol}`;

                    if (this.isPlayerTurn) {
                        const distance = this.distances[tile.pos.x][tile.pos.y];

                        if (distance != Infinity &&
                            distance <= this.playerStats.actionPoints &&
                            distance > 0 &&
                            this.entityMap[tile.pos.x][tile.pos.y] == 0) {

                            let offsetY = distance * 40;
                            let color = `hsl(${offsetY}, 80%, 60%)`;
                            tile.el.floorTile.style.visibility = "visible";
                            tile.el.floorMaterial.opacity = 0.75;
                            tile.el.floorMaterial.color.setStyle(color)

                            tile.el.numberString.innerText = distance;
                        } else {
                            tile.el.numberString.innerText = '';
                            tile.el.floorTile.style.visibility = "hidden";
                            switch (this.entityMap[tile.pos.x][tile.pos.y].type) {
                                case "prop":
                                    tile.el.floorTile.style.visibility = "hidden";
                                    break;
                                case "enemy":
                                    tile.el.floorTile.style.visibility = "visible";
                                    if (this.distanceBetween(x, y, this.playerPos.x, this.playerPos.y) <= 2) {
                                        tile.el.floorMaterial.color.setStyle("#f00")
                                    } else {
                                        tile.el.floorMaterial.color.setStyle("#888")
                                    }
                                    break;
                                case "chest":
                                    tile.el.floorTile.style.visibility = "visible";
                                    if (this.distanceBetween(x, y, this.playerPos.x, this.playerPos.y) <= 2) {
                                        tile.el.floorMaterial.color.setStyle("#0f0")
                                    } else {
                                        tile.el.floorMaterial.color.setStyle("#888")
                                    }
                                    break;
                                case "loot":
                                    tile.el.floorTile.style.visibility = "visible";
                                    if (this.distanceBetween(x, y, this.playerPos.x, this.playerPos.y) <= 2) {
                                        tile.el.floorMaterial.color.setStyle("#00ffd1")
                                    } else {
                                        tile.el.floorMaterial.color.setStyle("#888")
                                    }
                                    break;
                                case "door":
                                    tile.el.floorTile.style.visibility = "visible";
                                    if (this.distanceBetween(x, y, this.playerPos.x, this.playerPos.y) <= 2) {
                                        tile.el.floorMaterial.color.setStyle("#00ffd1")
                                    } else {
                                        tile.el.floorMaterial.color.setStyle("#888")
                                    }
                                    break;
                            }
                        }
                    } else {
                        tile.el.numberString.innerText = '';
                        tile.el.floorTile.style.visibility = "hidden";
                    }
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

            // move the overhead light above the player position
            const coor = this.projectCoordinates(this.playerPos.x, this.playerPos.y);
            this.overheadLight.dataset.position = `${coor.offsetRow} ${coor.offsetFloor + 0.9 + this.waveDeltaYAt(this.playerPos.x, this.playerPos.y)} ${coor.offsetCol}`;
        }
    }

    attachedComponent(entity) {
        this.root = entity;
        this.root.appendChild(this.container);
        this.container.style.scale = this.scale;

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

        this.healthBar = document.createElement('mr-health-bar');
        this.UILayer.appendChild(this.healthBar);

        this.endTurnButton = document.createElement("mr-button");
        this.endTurnButton.className = 'end-turn';
        this.endTurnButton.innerText = "End turn";
        this.endTurnButton.style.fontSize = "10px";
        // this.endTurnButton.dataset.position = "0.085 0.027 0";
        this.endTurnButton.dataset.position = "0 0.027 0.01";
        this.endTurnButton.dataset.rotation = "270 0 0";
        this.UILayer.appendChild(this.endTurnButton);

        this.endTurnButton.addEventListener('click', () => {
            this.endTurn();
        });

        this.initialize();
    }
}

let boardsys = new BoardSystem()
