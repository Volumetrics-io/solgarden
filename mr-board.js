class BoardSystem extends MRSystem {
    constructor() {
        super()
        this.scale = 0.05;

        // TODO: move the high level stats
        // into a gameStats Class maybe?
        this.levelId = 0;
        this.cycleId = 0;
        this.gameIsStarted = false;
        this.needsUpdate = false;

        // TODO: package the sound into a simple Class
        // something like this.sound.play('doorHinge');\
        // Sound Effect from https://pixabay.com/
        this.sounds = {
            bgMusic: document.querySelector('#bg-music'),
            chessSound: document.querySelector('#chess-sound'),
            doorSound: document.querySelector('#door-sound'),
            analogSound: document.querySelector('#analog-sound'),
            clashSound: document.querySelector('#clash-sound'),
            nopeSound: document.querySelector('#nope-sound'),
            swooshSound: document.querySelector('#swoosh-sound'),
            latchSound: document.querySelector('#latch-sound'),
            fridgeSound: document.querySelector('#fridge-sound'),
            farmSound: document.querySelector('#farm-sound'),
            bandlandsSound: document.querySelector('#badlands-sound'),
        }

        // TODO: package player stats in a simple Class
        // something like this.stats.useAction(3)
        this.playerStats = {
            health: 5,
            maxHealth: 5,
            range: 20,
            maxRange: 20,
            actionPoints: 4,
            maxActionPoints: 4,
            projectedCost: 0,
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
        this.timer = 0;
        this.isPlayerTurn = true;
        this.playerStats.actionPoints = this.playerStats.maxActionPoints;

        // clear up the dom elements container
        while (this.container.firstChild) {
            this.container.removeChild(this.container.lastChild);
        }

        this.sounds.fridgeSound.components.set('audio', {
            state: 'pause'
        });
        this.sounds.farmSound.components.set('audio', {
            state: 'pause'
        });
        this.sounds.bandlandsSound.components.set('audio', {
            state: 'pause'
        });

        // The room class generate all kind of arrays and dom elements
        // to represent a level, either hardcoded or randomly generated

        // TODO: make the soundtrack part of the biome
        if (this.levelId == 0) {
            // starting room
            this.room = new Room(this.container, {
                flrCount: 1,
                rowCount: 5,
                colCount: 5,
                enemyCount: 0,
                propCount: 0,
                chestCount: 0,
                biome: {
                    name: 'spawn',
                    path: "tiles/biome_purple/",
                    tiles: ["tilegrasspurple001.glb"],
                    props: []
                }
            });
        } else if (this.levelId == 3 || this.levelId == 8 || this.levelId == 13 || this.levelId == 21 || this.levelId == 34 || this.levelId == 55) {
            // battery room
            this.room = new Room(this.container, {
                flrCount: 1,
                rowCount: 7,
                colCount: 7,
                enemyCount: 0,
                // propCount: 0,
                chestCount: 0,
                biome: {
                    name: 'battery',
                    path: "tiles/biome_cyan/",
                    tiles: ["tilegrasscyan001.glb"],
                    props: ["rockdesert001.glb", "rockdesert002.glb"]
                },
                playerPos: {
                    x: 5,
                    y: 3
                },
                entityMap: [
                    [0, 0, 0, {
                        el: document.createElement("mr-door"),
                        type: 'door'
                    }, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, {
                        el: document.createElement("mr-charging-station"),
                        type: 'charging-station'
                    }, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, {
                        el: document.createElement("mr-player"),
                        type: 'player'
                    }, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0],
                ]
            });

            this.sounds.fridgeSound.components.set('audio', {
                state: 'play'
            });
        } else {
            // otherwise, just get a random room
            this.room = new Room(this.container, {});
        }

        switch (this.room.biome.name) {
            case 'plains':
                this.sounds.farmSound.components.set('audio', {
                    state: 'play'
                });
                break;
            case "desert":
                this.sounds.bandlandsSound.components.set('audio', {
                    state: 'play'
                });
                break;
        }

        // the tile elements (the floor) own all the events handling
        this.room.tilemap.forEach(row => {
            row.forEach(tile => {

                // console.log("tile", tile);

                tile.el.addEventListener("mouseover", () => {

                    if (!this.room.entityMap[tile.pos.x][tile.pos.y].type) {

                        // there is nothing on the tile.
                        this.playerStats.projectedCost = this.room.distances[tile.pos.x][tile.pos.y];
                        tile.el.floorMaterial.opacity = 1;

                    } else {

                        // there is an entity on the tile
                        switch (this.room.entityMap[tile.pos.x][tile.pos.y].type) {
                            case "enemy":
                                if (this.distanceBetween(tile.pos.x, tile.pos.y, this.room.playerPos.x, this.room.playerPos.y) <= 2) {
                                    this.playerStats.projectedCost = 2;
                                    console.log("a weapon would be highlighted");
                                }
                                break;
                        }
                    }

                });

                tile.el.addEventListener("mouseout", () => {
                    this.playerStats.projectedCost = 0;
                    tile.el.floorMaterial.opacity = 0.75;
                });

                tile.el.addEventListener("touchstart", () => {
                    const targetEntity = this.room.entityMap[tile.pos.x][tile.pos.y];

                    if (!targetEntity) {
                        // there is nothing on the tile.

                        // TODO: all that below should be a method of Room
                        // this.room.movePlayer(x, y)
                        const moveCost = this.room.distances[tile.pos.x][tile.pos.y];

                        if (moveCost <= this.playerStats.actionPoints) {
                            this.playerStats.actionPoints -= moveCost;
                            this.sounds.chessSound.components.set('audio', {
                                state: 'play'
                            })
                            this.room.moveEntity(this.room.playerPos.x, this.room.playerPos.y, tile.pos.x, tile.pos.y);
                            this.room.playerPos.x = tile.pos.x;
                            this.room.playerPos.y = tile.pos.y;
                            // this.needsUpdate = true;
                        } else {
                            this.sounds.nopeSound.components.set('audio', {
                                state: 'play'
                            });
                        }

                    } else {
                        // there is an entity on the tile

                        switch (targetEntity.type) {
                            case "enemy":
                                // console.log("would be combat, depending of the distance.")
                                if (this.distanceBetween(tile.pos.x, tile.pos.y, this.room.playerPos.x, this.room.playerPos.y) <= 2 && this.playerStats.actionPoints >= 2) {
                                    this.playerStats.actionPoints -= 2;
                                    this.attackEntity(targetEntity, tile.pos.x, tile.pos.y);
                                } else {
                                    this.sounds.nopeSound.components.set('audio', {
                                        state: 'play'
                                    });
                                }
                                break;
                            case "chest":
                                // console.log("that will open the chest and drop an item on the floor")
                                if (this.distanceBetween(tile.pos.x, tile.pos.y, this.room.playerPos.x, this.room.playerPos.y) <= 2) {
                                    // console.log('open the chest')

                                    // TODO: should be this.room.removeEntityAt(tile.pos.x, tile.pos.y);
                                    this.container.removeChild(this.room.entityMap[tile.pos.x][tile.pos.y].el);
                                    this.dropLoot(tile.pos.x, tile.pos.y);

                                    this.sounds.latchSound.components.set('audio', {
                                        state: 'play'
                                    });
                                } else {
                                    this.sounds.nopeSound.components.set('audio', {
                                        state: 'play'
                                    });
                                }
                                break;
                            case "loot":
                                if (this.distanceBetween(tile.pos.x, tile.pos.y, this.room.playerPos.x, this.room.playerPos.y) <= 2) {
                                    this.container.removeChild(this.room.entityMap[tile.pos.x][tile.pos.y].el);
                                    this.room.entityMap[tile.pos.x][tile.pos.y] = 0;

                                    this.sounds.analogSound.components.set('audio', {
                                        state: 'play'
                                    });

                                    // check for and apply the effect of the loot
                                    switch (targetEntity.effect) {
                                        case "health":
                                            if (this.playerStats.health < this.playerStats.maxHealth) {
                                                this.playerStats.health++;
                                            }
                                            console.log("increased health");
                                            break;
                                        case "range":
                                            if (this.playerStats.range < this.playerStats.maxRange) {
                                                this.playerStats.range++;
                                            }
                                            console.log("increased range");
                                            break;
                                    }
                                } else {
                                    this.sounds.nopeSound.components.set('audio', {
                                        state: 'play'
                                    });
                                }
                                // console.log("the item will do something on pick up")
                                break;
                            case "door":
                                if (this.distanceBetween(tile.pos.x, tile.pos.y, this.room.playerPos.x, this.room.playerPos.y) <= 2) {
                                    this.sounds.doorSound.components.set('audio', {
                                        state: 'play'
                                    });
                                    this.initialize();
                                } else {
                                    this.sounds.nopeSound.components.set('audio', {
                                        state: 'play'
                                    });
                                }
                                // console.log("go to the next room after killing all the enemies")
                                break;
                        }
                    }

                    // Automatically end the turn when the player runs out of action points
                    // if (this.playerStats.actionPoints == 0) {
                    //     this.endTurn();
                    // }

                    this.needsUpdate = true;

                });
            })
        })

        this.room.checkForDoor(this.container);
        this.gameIsStarted = true;
        this.needsUpdate = true;

        this.levelId++;
    }

    decreaseRange() {
        if (this.playerStats.range > 1) {
            this.combatQueue = [];

            for (let r = 0; r < this.room.rowCount; r++) {
                for (let c = 0; c < this.room.colCount; c++) {
                    const entity = this.room.entityMap[r][c];
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
            this.playerStats.range--;
        } else {
            this.endGame();
        }
    }

    endTurn() {
        // console.log("turn ended")
        this.playerStats.actionPoints = this.playerStats.maxActionPoints;
        this.isPlayerTurn = false;
        this.decreaseRange();
        this.needsUpdate = true;
    }

    resetPlayer() {
        this.levelId = 0;
        this.cycleId++;
        this.playerStats.health = this.playerStats.maxHealth;
        this.playerStats.range = this.playerStats.maxRange;

        // TODO: this is were we could assign a random weapon
        // at the beginning of each run
    }

    endGame() {
        console.log('you ded');

        this.resetPlayer()

        // TODO: display level and cycle count in the UI
        // TODO: store max cycle level in the localStorage?
        this.initialize();
    }

    opponentTurn() {
        // the combat is a queue
        // each enemy takes a turn
        if (this.combatQueue.length > 0) {
            const entry = this.combatQueue.pop();
            const entity = entry.entry;
            const r = entry.r;
            const c = entry.c;
            const x = this.room.playerPos.x;
            const y = this.room.playerPos.y;

            // remove origin and target from the entity map
            // otherwise the pathfinding can't work
            const blockmap = this.room.entityMap.map(function(arr) {
                return arr.slice();
            });
            blockmap[r][c] = 0;
            blockmap[x][y] = 0;

            const pf = new PathFinder(blockmap);
            const path = pf.findPath([r, c], [x, y]);

            // path[0] is the origin
            // const nextMove = path[1];
            // TODO: enemies move one step at the time

            // if path[1] is undefined, the path has no solution
            const nextMove = (!path[1]) ? [r, c] : path[1];

            this.room.moveEntity(r, c, nextMove[0], nextMove[1]);


            // melee weapon.
            // console.log(nextMove, x, y, this.distanceBetween(nextMove[0], nextMove[1], x, y));
            if (this.distanceBetween(r, c, x, y) <= 1) {
                // console.log(this.distanceBetween(r, c, x, y));
                this.attackPlayer(entity, 1);
                // } else {
                //     this.room.moveEntity(r, c, nextMove[0], nextMove[1]);
            }

            setTimeout(() => {
                this.opponentTurn();
            }, 1000)
        } else {
            this.isPlayerTurn = true;
        }

        this.needsUpdate = true;
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

            this.room.checkForDoor(this.container);

            this.needsUpdate = true;
        }
    }

    dropLoot(x, y) {
        const possibleEffects = [
            "health",
            "range"
        ]
        const effect = possibleEffects[Math.floor(Math.random() * possibleEffects.length)];

        const droppedLoot = document.createElement("mr-loot");
        droppedLoot.dataset.effect = effect;
        this.container.appendChild(droppedLoot);

        const loot = {
            el: droppedLoot,
            type: 'loot',
            effect: effect
        };

        this.room.entityMap[x][y] = loot;

        this.needsUpdate = true;
    }

    // TODO: this should be moved to Room
    // alongside everything that depends on it
    distanceBetween(x1, y1, x2, y2) {
        var distX = x1 - x2;
        var distY = y1 - y2;
        return Math.sqrt(distX * distX + distY * distY);
    }

    projectRoom() {
        this.actionBalls.forEach((actionBall, index) => {
            const ballsize = 0.008;
            const margin = 0.01;
            const offsetX = ballsize + margin;
            actionBall.dataset.position = `${index * ballsize + index * margin + offsetX} ${this.scale / 2 + ballsize} 0`;
        });

        const offsetX = -this.scale / 2;
        const offsetY = (this.room.rowCount / 2) * this.scale;

        this.UILayer.dataset.position = `${offsetX} 0 ${offsetY}`;

        this.room.calculateDistancesFromPlayer();
        this.room.tilemap.forEach(row => {
            row.forEach(tile => {

                const x = tile.pos.x;
                const y = tile.pos.y;

                this.room.project(tile, x, y, this.timer);

                if (this.isPlayerTurn) {
                    const distance = this.room.distances[tile.pos.x][tile.pos.y];

                    if (distance != Infinity &&
                        distance <= this.playerStats.actionPoints &&
                        distance > 0 &&
                        this.room.entityMap[tile.pos.x][tile.pos.y] == 0) {

                        let offsetY = distance * 40;
                        let color = `hsl(${offsetY}, 80%, 60%)`;
                        tile.el.floorTile.style.visibility = "visible";
                        tile.el.floorMaterial.opacity = 0.75;
                        tile.el.floorMaterial.color.setStyle(color)

                        tile.el.numberString.innerText = distance;
                    } else {
                        tile.el.numberString.innerText = '';
                        tile.el.floorTile.style.visibility = "hidden";
                        switch (this.room.entityMap[tile.pos.x][tile.pos.y].type) {
                            case "prop":
                                tile.el.floorTile.style.visibility = "hidden";
                                break;
                            case "enemy":
                                tile.el.floorTile.style.visibility = "visible";
                                if (this.distanceBetween(x, y, this.room.playerPos.x, this.room.playerPos.y) <= 2) {
                                    tile.el.floorMaterial.color.setStyle("#f00");
                                } else {
                                    tile.el.floorMaterial.color.setStyle("#888");
                                }
                                break;
                            case "chest":
                                tile.el.floorTile.style.visibility = "visible";
                                if (this.distanceBetween(x, y, this.room.playerPos.x, this.room.playerPos.y) <= 2) {
                                    tile.el.floorMaterial.color.setStyle("#0f0");
                                } else {
                                    tile.el.floorMaterial.color.setStyle("#888");
                                }
                                break;
                            case "loot":
                                tile.el.floorTile.style.visibility = "visible";
                                if (this.distanceBetween(x, y, this.room.playerPos.x, this.room.playerPos.y) <= 2) {
                                    tile.el.floorMaterial.color.setStyle("#00ffd1");
                                } else {
                                    tile.el.floorMaterial.color.setStyle("#888");
                                }
                                break;
                            case "charging-station":
                                tile.el.floorTile.style.visibility = "visible";
                                tile.el.floorMaterial.color.setStyle("#00ffd1");
                                if (this.playerStats.range < this.playerStats.maxRange) {
                                    this.playerStats.range += 0.05;
                                }

                            case "door":
                                tile.el.floorTile.style.visibility = "visible";
                                if (this.distanceBetween(x, y, this.room.playerPos.x, this.room.playerPos.y) <= 2) {
                                    tile.el.floorMaterial.color.setStyle("#00ffd1");
                                } else {
                                    tile.el.floorMaterial.color.setStyle("#888");
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

        for (let r = 0; r < this.room.rowCount; r++) {
            for (let c = 0; c < this.room.colCount; c++) {
                const entity = this.room.entityMap[r][c];
                if (entity != 0) {
                    this.room.project(entity, r, c, this.timer);
                }
            }
        }

        if (this.playerStats.actionPoints == 0) {
            this.endTurnButton.style.backgroundColor = "RebeccaPurple";
        } else {
            this.endTurnButton.style.backgroundColor = "#e72d75";
        }

        this.needsUpdate = false;
    }

    update(deltaTime, frame) {
        if (this.gameIsStarted) {
            this.timer += deltaTime;

            // UI STUFF
            this.actionBalls.forEach((actionBall, index) => {
                if (index < this.playerStats.maxActionPoints) {
                    actionBall.style.visibility = "visible";
                    if (index < this.playerStats.actionPoints) {
                        actionBall.material.color.setStyle('#00d2d2')
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

            this.healthBar.setHealth(this.playerStats.health / this.playerStats.maxHealth);
            this.levelCountLabel.innerText = `Battery: ${Math.round(this.playerStats.range)} Floor: ${this.levelId} Death: ${this.cycleId}`;
            ////////////

            if (this.needsUpdate) {
                this.projectRoom();
            } else {
                for (let r = 0; r < this.room.rowCount; r++) {
                    for (let c = 0; c < this.room.colCount; c++) {
                        const entity = this.room.entityMap[r][c];
                        if (entity != 0 && entity.animation) {
                            this.room.project(entity, r, c, this.timer);
                        }
                    }
                }
            }
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
                color: "hsl(35, 46%, 80%)",
                transparent: true,
                opacity: 1,
                receiveShadow: true,
                wireframe: false,
                // emissive: "#FFFFFF",
                // specular: "#FFFFFF",
                shininess: 200,
                reflectivity: 1,
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
        this.endTurnButton.dataset.position = "0 0.027 0.01";
        this.endTurnButton.dataset.rotation = "270 0 0";
        this.UILayer.appendChild(this.endTurnButton);

        this.labelContainer = document.createElement("mr-div");
        this.labelContainer.dataset.position = "0 0 0.027";
        this.labelContainer.className = 'label-container';
        this.UILayer.appendChild(this.labelContainer);

        // this.batteryRemainingLabel = document.createElement("mr-text");
        // this.batteryRemainingLabel.className = 'text-label';
        // this.batteryRemainingLabel.innerText = "test text"
        // this.labelContainer.appendChild(this.batteryRemainingLabel);

        this.levelCountLabel = document.createElement("mr-text");
        this.levelCountLabel.className = 'text-label';
        this.labelContainer.appendChild(this.levelCountLabel);

        this.endTurnButton.addEventListener('click', () => {
            this.endTurn();
        });

        this.initialize();
    }
}

let boardsys = new BoardSystem()
