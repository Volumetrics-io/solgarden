class GameSystem extends MRSystem {
    constructor() {
        super()
        this.scale = 0.06;
        this.tableOffset = 0.02;

        // TODO: move the high level stats
        // into a gameStats Class maybe?
        this.levelId = 0;
        this.cycleId = 0;
        this.gameIsStarted = false;
        this.needsUpdate = false;

        this.autoEndTurn = true;

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

        // container to store board object references
        this.container = document.createElement("mr-div");
        this.container.id = 'container'; // for DOM debugging

        // The Stats system dealing with player state and UI
        this.state = document.createElement("mr-entity");
        this.state.components.set('state', {
            health: 10,
            maxHealth: 10,
            range: 20,
            maxRange: 20,
            actionPoints: 4,
            maxActionPoints: 4,
            projectedCost: 0,
            hasKey: false,
            meleeWeaponName: 'twig',
            meleeWeaponAttack: 1,
            rangeWeaponName: false,
            rangeWeaponAttack: false,
            selectedWeapon: "melee"
        });

        this.endTurnButton = document.createElement("mr-button");
        this.endTurnButton.className = "end-turn";

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

            if( event.key === 's') {
                event.preventDefault();
                console.log(this.state.components.get('state'));
            }

            if( event.key === 'm') {
                event.preventDefault();
                this.printArray("this.board.entityMap", this.board.entityMap);
                // console.log(this.board.entityMap);
            }
        });

    }

    initialize() {
        // console.clear();
        this.timer = 0;
        this.isPlayerTurn = true;

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

        // TODO: make the soundtrack part of the biome
        if (this.levelId == 0) {
            // starting room
            // The room class generate all kind of arrays and dom elements
            // to represent a level, either hardcoded or randomly generated
            this.board = new Board(this.container, {
                levelId: this.levelId,
                flrCount: 1,
                rowCount: 6,
                colCount: 4,
                enemyCount: 0,
                propCount: 0,
                blockCount: 0,
                isChest: false,
                biome: {
                    name: 'spawn',
                    path: "tiles/biome_purple/",
                    tiles: ["tilegrasspurple001.glb"],
                    props: [],
                    block: [],
                }
            });
        } else if (
            // this.levelId == 1 ||
            this.levelId == 2 ||
            this.levelId == 8 ||
            this.levelId == 13 ||
            this.levelId == 21 ||
            this.levelId == 34 ||
            this.levelId == 55) {

            // battery room
            this.board = new Board(this.container, {
                levelId: this.levelId,
                flrCount: 1,
                rowCount: 8,
                colCount: 4,
                enemyCount: 0,
                propCount: 0,
                blockCount: 5,
                isChest: false,
                isLore: false,
                biome: {
                    name: 'battery',
                    path: "tiles/biome_cyan/",
                    tiles: ["tilegrasscyan001.glb"],
                    props: [],
                    block: ["rockdesert001.glb", "rockdesert002.glb"]
                },
                entityMap: [
                    [0, 0, 0, 0],
                    [0, 0, 0, 0],
                    [0, 0, 0, 0],
                    [0, {
                        el: document.createElement("mr-charging-station-ii"),
                        type: 'prop'
                    }, {
                        el: document.createElement("mr-charging-station-i"),
                        type: 'prop'
                    }, 0],
                    [0, 0, {
                        el: document.createElement("mr-charging-station-iv"),
                        type: 'prop'
                    }, 0],
                    [0, 0, 0, 0],
                    [0, 0, 0, 0],
                    [0, 0, 0, 0],
                ],
                propMap: [
                    [0, 0, 0, 0],
                    [0, 0, 0, 0],
                    [0, 0, 0, 0],
                    [0, 0, 0, 0],
                    [0, {
                        el: document.createElement("mr-charging-station-iii"),
                        type: 'prop'
                    }, 0, 0],
                    [0, 0, 0, 0],
                    [0, 0, 0, 0],
                    [0, 0, 0, 0],
                ]
            });
            this.sounds.fridgeSound.components.set('audio', {
                state: 'play'
            });
        } else {
            // otherwise, just get a random room
            this.board = new Board(this.container, {
                levelId: this.levelId
            });
        }

        switch (this.board.biome.name) {
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
        this.board.tilemap.forEach(row => {
            row.forEach(tile => {

                tile.el.addEventListener("mouseover", () => {
                    const stats = this.state.components.get('state');

                    if (!this.board.entityMap[tile.pos.x][tile.pos.y].type) {
                        stats.projectedCost = this.board.distances[tile.pos.x][tile.pos.y];
                        tile.el.floorMaterial.color.setStyle("#875dff");

                    } else {

                        // there is an entity on the tile
                        switch (this.board.entityMap[tile.pos.x][tile.pos.y].type) {
                            case "enemy":
                                if (this.distanceBetween(tile.pos.x, tile.pos.y, this.board.playerPos.x, this.board.playerPos.y) <= 2) {
                                    stats.projectedCost = 2;
                                    // TODO: highlight main weapon in the inventory
                                    console.log("a weapon would be highlighted");
                                }
                                break;
                        }
                    }

                    this.state.components.set('state', stats);
                });

                tile.el.addEventListener("mouseout", () => {
                    const stats = this.state.components.get('state');
                    // this.playerStats.projectedCost = 0;
                    stats.projectedCost = 0;
                    this.state.components.set('state', stats);
                    // tile.el.floorMaterial.opacity = 0.75;
                    if (!this.board.entityMap[tile.pos.x][tile.pos.y].type) {
                        tile.el.floorMaterial.color.setStyle("#00ffd1");
                    }
                });

                tile.el.addEventListener("touchstart", () => {
                    const targetEntity = this.board.entityMap[tile.pos.x][tile.pos.y];
                    const stats = this.state.components.get('state');
                    const moveCost = this.board.distances[tile.pos.x][tile.pos.y];
                    // console.log(moveCost, this.playerStats.actionPoints);

                    if (!targetEntity) {
                        // there is nothing on the tile.

                        // TODO: all that below should be a method of Room
                        // this.board.movePlayer(x, y)
                        // const moveCost = this.board.distances[tile.pos.x][tile.pos.y];

                        if (moveCost <= stats.actionPoints) {
                            stats.actionPoints -= moveCost;
                            this.sounds.chessSound.components.set('audio', {
                                state: 'play'
                            })
                            this.board.moveEntity(this.board.playerPos.x, this.board.playerPos.y, tile.pos.x, tile.pos.y);
                            this.board.playerPos.x = tile.pos.x;
                            this.board.playerPos.y = tile.pos.y;
                        } else {
                            this.sounds.nopeSound.components.set('audio', {
                                state: 'play'
                            });
                        }

                    } else {
                        // there is an entity on the tile
                        // if the entity is in move range of the player, or less than 2 tiles accross
                        if (moveCost <= stats.actionPoints &&
                            this.distanceBetween(tile.pos.x, tile.pos.y, this.board.playerPos.x, this.board.playerPos.y) <= stats.actionPoints) {
                            switch (targetEntity.type) {
                                case "enemy":
                                    stats.actionPoints -= 2;
                                    this.attackEntity(targetEntity, tile.pos.x, tile.pos.y);
                                    break;
                                case "chest":

                                    // TODO: should be this.board.removeEntityAt(tile.pos.x, tile.pos.y);
                                    this.container.removeChild(targetEntity.el);
                                    this.dropWeapon(tile.pos.x, tile.pos.y);

                                    this.sounds.latchSound.components.set('audio', {
                                        state: 'play'
                                    });
                                    break;
                                case "loot":
                                    this.container.removeChild(targetEntity.el);
                                    this.board.entityMap[tile.pos.x][tile.pos.y] = 0;

                                    this.sounds.analogSound.components.set('audio', {
                                        state: 'play'
                                    });

                                    // check for and apply the effect of the loot
                                    switch (targetEntity.effect) {
                                        case "health":
                                            if (stats.health < stats.maxHealth) {
                                                stats.health++;
                                            }
                                            console.log("increased health");
                                            break;
                                        case "range":
                                            if (stats.range < stats.maxRange) {
                                                stats.range++;
                                            }
                                            console.log("increased range");
                                            break;
                                    }
                                    break;
                                case "lore":
                                    targetEntity.el.playLore();
                                    targetEntity.el.hideModel();
                                    this.board.entityMap[tile.pos.x][tile.pos.y] = 0;
                                    this.sounds.analogSound.components.set('audio', {
                                        state: 'play'
                                    });
                                    break;
                                case "key":
                                    this.addToInventory(targetEntity, stats);
                                    this.container.removeChild(targetEntity.el);
                                    this.board.entityMap[tile.pos.x][tile.pos.y] = 0;
                                    this.sounds.analogSound.components.set('audio', {
                                        state: 'play'
                                    });
                                    break;
                                case "weapon":
                                    this.addToInventory(targetEntity, stats);
                                    this.container.removeChild(targetEntity.el);
                                    this.board.entityMap[tile.pos.x][tile.pos.y] = 0;
                                    this.sounds.analogSound.components.set('audio', {
                                        state: 'play'
                                    });
                                    break;
                                case "door":
                                    this.sounds.doorSound.components.set('audio', {
                                        state: 'play'
                                    });
                                    this.initialize();
                                    break;
                            }
                        } else {
                            this.sounds.nopeSound.components.set('audio', {
                                state: 'play'
                            });
                        }
                    }

                    this.state.components.set('state', stats);

                    // Automatically end the turn when the player runs out of action points
                    if (this.autoEndTurn && stats.actionPoints == 0) {
                        this.endTurn();
                    }

                    this.needsUpdate = true;

                });
            })
        })

        // this.board.checkForDoor(this.container);
        this.gameIsStarted = true;
        this.needsUpdate = true;

        this.levelId++;
    }

    addToInventory(entity, stats) {
        if (entity.type == "weapon") {
            if (entity.subType == "melee") {
                if (entity.attack > stats.meleeWeaponAttack) {
                    stats.meleeWeaponName = entity.name;
                    stats.meleeWeaponAttack = entity.attack;
                }
            }
        }
        if (entity.type == "key") {
            stats.hasKey = true;
        }
    }

    decreaseRange() {
        const stats = this.state.components.get('state')
        if (stats.range > 1) {
            this.combatQueue = [];

            for (let r = 0; r < this.board.rowCount; r++) {
                for (let c = 0; c < this.board.colCount; c++) {
                    const entity = this.board.entityMap[r][c];
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
            stats.range--;
            this.state.components.set('state', stats)
        } else {
            this.endGame();
        }
    }

    endTurn() {
        const stats = this.state.components.get('state');
        stats.actionPoints = stats.maxActionPoints;
        this.state.components.set('state', stats);

        this.isPlayerTurn = false;
        this.decreaseRange();
        this.needsUpdate = true;

        this.sounds.analogSound.components.set('audio', {
            state: 'play'
        });
    }

    resetPlayer() {
        this.levelId = 0;
        this.cycleId++;

        this.state.components.set('state', {
            health: this.state.components.get('state').maxHealth,
            range: this.state.components.get('state').maxRange,
        });

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

            // console.log('entry',entry);
            const entity = entry.entity;
            const r = entry.r;
            const c = entry.c;
            const x = this.board.playerPos.x;
            const y = this.board.playerPos.y;

            // remove origin and target from the entity map
            // otherwise the pathfinding can't work
            const blockmap = this.board.entityMap.map(function(arr) {
                return arr.slice();
            });
            blockmap[r][c] = 0;
            blockmap[x][y] = 0;

            const pf = new PathFinder(blockmap);
            const path = pf.findPath([r, c], [x, y]);

            // if path[1] is undefined, the path has no solution
            const nextMove = (!path[1]) ? [r, c] : path[1];

            if (this.distanceBetween(r, c, x, y) <= 1) {
                this.attackPlayer(entity, 1);
            } else {
                // TODO: enemies move one step at the time
                this.board.moveEntity(r, c, nextMove[0], nextMove[1]);
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
        const stats = this.state.components.get('state');

        // console.log(attacker);
        // TODO: move the sound where the attacker is
        this.sounds.clashSound.components.set('audio', {
            state: 'play'
        });

        stats.health -= attacker.attack;
        this.state.components.set('state', stats);

        // TODO: this probably should be in room
        this.board.entityMap[this.board.playerPos.x][this.board.playerPos.y].el.showDamage(attacker.attack)

        if (stats.health <= 0) {
            this.endGame();
        }
    }

    attackEntity(entity, r, c) {
        const stats = this.state.components.get('state');

        // TODO: move the sound where the player is
        this.sounds.swooshSound.components.set('audio', {
            state: 'play'
        });

        const damage = stats.meleeWeaponAttack;
        entity.hp -= damage;

        // TODO: should be moved to room
        this.board.entityMap[r][c].el.showDamage(damage);

        if (entity.hp <= 0) {
            this.container.removeChild(entity.el);
            this.dropLoot(r, c);
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

        this.board.entityMap[x][y] = loot;

        this.needsUpdate = true;
    }

    dropWeapon(x, y) {
        const possibleNames = [
            "twig", "short-sword"
        ]
        const name = possibleNames[Math.floor(Math.random() * possibleNames.length)];

        // TODO: there should be only one "mr-weapon" as an entity in the entitymap
        const weaponEl = document.createElement("mr-melee-weapon");
        weaponEl.dataset.name = name;
        this.container.appendChild(weaponEl);

        const weapon = {
            el: weaponEl,
            type: 'weapon',
            subType: 'melee',
            name: name,
            attack: this.levelId + 1
        };

        this.board.entityMap[x][y] = weapon;

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
        const stats = this.state.components.get('state');

        this.board.calcDistFromPlayer();
        this.board.tilemap.forEach(row => {
            row.forEach(tile => {

                const x = tile.pos.x;
                const y = tile.pos.y;

                this.board.project(tile, x, y, this.timer);

                if (this.isPlayerTurn) {
                    const distance = this.board.distances[tile.pos.x][tile.pos.y];

                    if (distance != Infinity &&
                        distance <= stats.actionPoints &&
                        distance > 0) {

                        if (this.board.entityMap[tile.pos.x][tile.pos.y] == 0) {
                            let offsetY = distance * 40;
                            // let color = `hsl(${offsetY}, 80%, 60%)`;
                            let color = `#00ffd1`;
                            let opacity = distance / stats.actionPoints;
                            tile.el.floorTile.style.visibility = "visible";
                            // tile.el.floorMaterial.opacity = 0.75;
                            tile.el.floorMaterial.opacity = opacity;
                            tile.el.floorMaterial.color.setStyle(color)

                            tile.el.numberString.innerText = distance;
                        } else {
                            if (this.board.entityMap[tile.pos.x][tile.pos.y].type != 'prop') {
                                tile.el.floorMaterial.color.setStyle("#ff7a00");
                                tile.el.floorTile.style.visibility = "visible";
                            } else {
                                tile.el.floorMaterial.color.setStyle("#888");
                                tile.el.floorTile.style.visibility = "hidden";
                            }
                        }


                    } else {
                        tile.el.numberString.innerText = '';
                        tile.el.floorTile.style.visibility = "hidden";
                    }
                } else {
                    tile.el.numberString.innerText = '';
                    tile.el.floorTile.style.visibility = "hidden";
                }
            })
        })

        for (let r = 0; r < this.board.rowCount; r++) {
            for (let c = 0; c < this.board.colCount; c++) {
                const entity = this.board.entityMap[r][c];
                if (entity != 0) {
                    this.board.project(entity, r, c, this.timer);
                }

                const prop = this.board.propMap[r][c];
                if (prop != 0) {
                    this.board.project(prop, r, c, this.timer);
                }
            }
        }

        if (stats.actionPoints == 0) {
            this.endTurnButton.style.backgroundColor = "#875dff";
        } else {
            this.endTurnButton.style.backgroundColor = "#e72d75";
        }

        this.needsUpdate = false;
    }

    printArray(string, array) {
        console.log(string);
        array.forEach(row => {
            console.log(row);
        })
    }

    update(deltaTime, frame) {
        if (this.gameIsStarted) {
            this.timer += deltaTime;

            const stats = this.state.components.get('state');

            if (this.needsUpdate) {
                this.projectRoom();

                const offsetX = this.board.colCount / 2 + 0.5;
                this.state.dataset.position = `-${offsetX * this.scale} ${this.tableOffset} 0`;
            } else {
                for (let r = 0; r < this.board.rowCount; r++) {
                    for (let c = 0; c < this.board.colCount; c++) {
                        const entity = this.board.entityMap[r][c];
                        if (entity != 0 && entity.animation) {
                            this.board.project(entity, r, c, this.timer);
                        }
                    }
                }
            }

            // the player is in the battery room
            if (this.board.biome.name == 'battery') {
                const chargingPos = {
                    x: 4,
                    y: 1
                }
                const chargingIndicator = {
                    x: 4,
                    y: 2
                }

                // TODO: charging prototype to rewrite
                // this.board.updateBattery()
                // room knows where the player and the battery are
                if (this.board.playerPos.x == chargingPos.x &&
                    this.board.playerPos.y == chargingPos.y) {
                    if (stats.range < stats.maxRange) {
                        // charging
                        stats.range += 0.04;

                        // TODO: move this to room?
                        this.board.entityMap[chargingIndicator.x][chargingIndicator.y].el.updateBatteryLevel(stats.range / stats.maxRange)

                        this.board.tilemap[chargingPos.x][chargingPos.y].el.floorTile.style.visibility = "visible";
                        this.board.tilemap[chargingPos.x][chargingPos.y].el.floorMaterial.color.setStyle("#f90");
                    } else {
                        // charged
                        stats.range = stats.maxRange;
                        this.board.tilemap[chargingPos.x][chargingPos.y].el.floorTile.style.visibility = "visible";
                        this.board.tilemap[chargingPos.x][chargingPos.y].el.floorMaterial.color.setStyle("#62ff42");
                    }

                } else {
                    this.board.tilemap[chargingPos.x][chargingPos.y].el.floorTile.style.visibility = "visible";
                    this.board.tilemap[chargingPos.x][chargingPos.y].el.floorMaterial.color.setStyle("#fff");

                }
            }

            this.state.components.set('state', stats);
        }
    }

    attachedComponent(entity) {
        this.root = entity;
        this.root.appendChild(this.container);
        this.container.style.scale = this.scale;
        this.container.dataset.position = `0 ${this.tableOffset} 0`;

        this.root.appendChild(this.state);
        this.state.style.scale = this.scale;
        this.state.dataset.rotation = `0 0 30`
        // this.state.dataset.position = `0 0.5 0`

        this.endTurnButton.className = 'end-turn';
        this.endTurnButton.innerText = "End turn";
        this.endTurnButton.dataset.position = "0 0.08 -0.55";
        this.endTurnButton.dataset.rotation = "270 0 270";
        this.state.appendChild(this.endTurnButton);

        this.endTurnButton.addEventListener('click', () => {
            this.endTurn();
        });

        this.initialize();
    }
}

let game = new GameSystem();
