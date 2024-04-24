class GameSystem extends MRSystem {
    constructor() {
        super()
        this.gameIsStarted = false;
        this.needsUpdate = false;
        this.level = 0;
        this.cycle = 0;

        // container to store board object references
        this.container = document.createElement("mr-div");
        // TODO: need to do this at the DOM level
        // and get element by id

        this.container.id = 'container'; // for DOM debugging

        // The state system dealing with player state and UI
        this.state = document.createElement("mr-entity");
        this.state.components.set('state', {
            health: 10,
            maxHealth: 20,
            range: 15,
            maxRange: 30,
            action: 4,
            maxAction: 4,
            projectedCost: 0,
            hasKey: false,
            meleeName: 'twig',
            meleeAttack: 1,
            meleeRange: 1,
            rangeName: 'slingshot',
            rangeAttack: 1,
            rangeRange: 4,
            selectedWeapon: "melee",
            isPlayerTurn: true,
            // needsUpdate: false
        });

        this.endTurnButton = document.createElement("mr-button");
        this.soundController = new SoundController();

        // debug
        document.addEventListener("keydown", (event) => {

            // I FOR INITIALIZE
            if (event.key === "i") {
                event.preventDefault();
                this.initialize();
            }

            // E FOR END
            if (event.key === "e") {
                event.preventDefault();
                this.endGame();
            }

            // S FOR STATE
            if (event.key === 's') {
                event.preventDefault();
                console.log(this.state.components.get('state'));
            }

            // M FOR MAP
            if (event.key === 'm') {
                event.preventDefault();
                this.printArray("this.board.entityMap", this.board.entityMap);
            }

            // U FOR UPDATE
            if (event.key === "i") {
                event.preventDefault();
                this.needsUpdate = true;
                this.state.needsUpdate = true;
                // this.state.components.set("state", {
                //     needsUpdate: true
                // })
                console.log('triggered an update')
            }
        });

    }

    initialize() {
        // console.clear();
        this.timer = 0;
        // const state = this.state.components.get('state');

        // clear up the dom elements container
        while (this.container.firstChild) {
            this.container.removeChild(this.container.lastChild);
        }
        this.soundController.initialize();

        let params;
        // TODO: make the soundtrack part of the biome
        if (this.level == 0) {
            // starting room
            // The room class generate all kind of arrays and dom elements
            // to represent a level, either hardcoded or randomly generated
            params = {
                levelId: this.level,
                flrCount: 1,
                rowCount: 6,
                colCount: 4,
                enemyCount: 0,
                propCount: 0,
                blockCount: 0,
                isChest: false,
                biome: {
                    name: 'spawn',
                    path: "biomes/purple/",
                    audio: "",
                    tiles: ["tilegrasspurple001.glb"],
                    props: [],
                    block: [],
                }
            }
        } else if (
            // this.levelId == 1 ||
            this.level == 2 ||
            this.level == 4 ||
            this.level == 8 ||
            this.level == 13 ||
            this.level == 21 ||
            this.level == 34 ||
            this.level == 55) {

            // battery room
            params = {
                levelId: this.level,
                flrCount: 1,
                rowCount: 8,
                colCount: 4,
                enemyCount: 0,
                propCount: 12,
                blockCount: 0,
                isChest: false,
                isLore: false,
                biome: {
                    name: 'battery',
                    path: "biomes/battery-room/",
                    audio: "/audio/fridge.mp3",
                    tiles: ["tilegrasscyan001.glb"],
                    props: ["plant_01.glb",
                        "plant_02.glb",
                        "plant_03.glb",
                        "plant_04.glb",
                        "plant_05.glb"
                    ],
                    block: []
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
                        type: 'battery'
                    }, 0, 0],
                    [0, 0, 0, 0],
                    [0, 0, 0, 0],
                    [0, 0, 0, 0],
                ]
            }
            this.soundController.play('fridgeSound');
        } else {
            params = {
                levelId: this.level
            }
        }

        this.board = new Board(this.container, params);
        // this.board.assignHoverHandlers(this.state.components);

        // TODO: move somewhere else?
        switch (this.board.biome.name) {
            case 'plains':
                this.soundController.play('farmSound');
                break;
            case "desert":
                this.soundController.play('bandlandsSound');
                break;
        }

        // the tile elements (the floor) own all the events handling
        this.board.tileMap.forEach(row => {
            row.forEach(tile => {

                tile.el.addEventListener("mouseover", () => {
                    const x = tile.pos.x;
                    const y = tile.pos.y;

                    // tile.el.setTileColor(Colors.hover);
                    this.state.components.set('state', {
                        projectedCost: this.board.getProjectedCostFor(x, y),
                    });
                    this.state.needsUpdate = true;
                });

                tile.el.addEventListener("mouseout", () => {
                    const x = tile.pos.x;
                    const y = tile.pos.y;

                    this.state.components.set('state', {
                        projectedCost: 0,
                    });
                    this.state.needsUpdate = true;

                    // if (!this.board.getEntityAt(x, y)) {
                    //     // it's a floor tile
                    //     tile.el.setTileColor(Colors.movement);
                    // } else {
                    //     // it's an entity
                    //     tile.el.setTileColor(Colors.objects);
                    // }

                });

                tile.el.addEventListener("touchend", () => {
                    const x = tile.pos.x;
                    const y = tile.pos.y;

                    const targetEntity = this.board.getEntityAt(x, y);
                    const cost = this.board.getProjectedCostFor(x, y);
                    const state = this.state.components.get('state');

                    if (state.isPlayerTurn) {
                        if (!targetEntity) {
                            // there is nothing on the tile.
                            if (cost <= state.action) {
                                state.action -= cost;
                                this.soundController.play('chessSound');
                                this.board.movePlayer(x, y);
                            } else {
                                this.soundController.play('nopeSound');
                            }

                        } else {
                            // there is an entity on the tile
                            if (cost <= state.action &&
                                this.board.distances[x][y] <= state.action) {
                                this.interactWith(x, y, targetEntity, cost, state);

                                console.log(targetEntity);

                                // pickable items
                                if (targetEntity.type == "loot" ||
                                    targetEntity.type == "key" ||
                                    targetEntity.type == "weapon" ||
                                    targetEntity.type == "lore") {

                                    // then move the player
                                    state.action -= cost;
                                    this.soundController.play('chessSound');
                                    this.board.movePlayer(x, y);
                                }

                                // door
                                if (targetEntity.type == "door") {
                                    state.action -= cost;
                                    this.soundController.play('chessSound');
                                    this.board.movePlayer(x, y);

                                    state.isPlayerTurn = false;

                                    // free full bar if you reach the door
                                    state.action = state.maxAction;

                                    // this.isPlayerTurn = false;
                                    setTimeout(() => {
                                        // this.state.components.set('state', {
                                        //   isPlayerTurn: true
                                        // });
                                        this.initialize();
                                    }, 1000);

                                }
                            } else {
                                this.soundController.play('nopeSound');
                            }
                        }

                        // state.needsUpdate = true;


                        // Automatically end the turn when the player
                        // runs out of action points
                        if (this.autoEndTurn && state.action == 0) {
                            this.endTurn();
                        }

                        this.needsUpdate = true;
                        this.state.needsUpdate = true;
                        this.state.components.set('state', state);
                    }
                });
            })
        })

        this.state.components.set('state', {
            isPlayerTurn: true,
            // needsUpdate: true
        });

        // console.log(this.level)
        this.level++;
        this.gameIsStarted = true;
        this.needsUpdate = true;
        this.state.needsUpdate = true;
    }

    addToInventory(entity, state) {
        if (entity.type == "weapon") {
            if (entity.subType == "melee" && entity.attack > state.meleeAttack) {
                state.meleeName = entity.name;
                state.meleeAttack = entity.attack;
                state.meleeRange = entity.range;
            }
            if (entity.subType == "range" && entity.attack > state.rangeAttack) {
                state.rangeName = entity.name;
                state.rangeAttack = entity.attack;
                state.rangeRange = entity.range;
            }
        }
        if (entity.type == "key") {
            state.hasKey = true;
        }
    }

    decreaseRange() {
        const state = this.state.components.get('state')
        if (state.range > 1) {
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
            state.range--;
            this.state.components.set('state', state)
        } else {
            this.endGame();
        }
    }

    endTurn() {
        const state = this.state.components.get('state');

        this.state.components.set('state', {
            action: state.maxAction,
            // needsUpdate: true,
            isPlayerTurn: true
        });

        this.decreaseRange();
        this.needsUpdate = true;
        this.state.needsUpdate = true;
        this.soundController.play('analogSound');
    }

    endGame() {
        console.log('you ded');

        this.level = 0;
        this.cycle++;

        const state = this.state.components.get('state');

        this.state.components.set('state', {
            health: state.maxHealth,
            range: state.maxRange,
            action: state.maxAction,
            projectedCost: 0,
            hasKey: false,
            meleeName: 'twig',
            meleeAttack: 1,
            rangeName: 'slingshot',
            rangeAttack: 1,
            selectedWeapon: "melee",
            isPlayerTurn: true,
            // needsUpdate: true
        });

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

            if (this.board.distances[r][c] <= 1) {
                this.attackPlayer(entity);
            } else {
                // TODO: enemies move one step at the time
                this.board.moveEntity(r, c, nextMove[0], nextMove[1]);
            }

            setTimeout(() => {
                this.opponentTurn();
            }, 1000)
        } else {
            this.state.components.set('state', {
                isPlayerTurn: true,
                // needsUpdate: true
            })
        }

        this.needsUpdate = true;
    }

    attackPlayer(attacker) {
        const state = this.state.components.get('state');
        const playerPos = this.board.getPlayerPos();

        // TODO: move the sound where the attacker is
        // this.soundController.moveSound()
        this.soundController.play('clashSound');

        const health = state.health - attacker.attack;
        this.state.components.set('state', {
            health: health,
            needsUpdate: true
        });

        this.board.showDamageAt(playerPos.x, playerPos.y, attacker.attack);

        if (health <= 0) {
            this.endGame();
        }
    }

    attack(entity, r, c) {
        const state = this.state.components.get('state');

        // TODO: move the sound where the player is
        // this.soundController.moveSoundPosition('swooshSound', );
        this.soundController.play('swooshSound');

        // console.log(state.selectedWeapon)
        let damage;
        if (state.selectedWeapon == "melee") {
            damage = state.meleeAttack;
        } else {
            damage = stage.rangeAttack;
        }

        entity.hp -= damage;
        this.board.showDamageAt(r, c, damage);

        if (entity.hp <= 0) {
            this.container.removeChild(entity.el);
            this.dropLoot(r, c);
            this.needsUpdate = true;
        }
    }

    interactWith(x, y, entity, cost, state) {
        switch (entity.type) {
            case "enemy":
                state.action -= cost;
                this.attack(entity, x, y);
                break;

            case "chest":
                this.container.removeChild(entity.el);
                this.board.removeEntityAt(x, y);
                this.dropWeapon(x, y);
                this.soundController.play('latchSound');
                break;

            case "loot":
                this.container.removeChild(entity.el);
                this.board.removeEntityAt(x, y);
                this.soundController.play('analogSound');
                if (entity.effect == 'health' &&
                    state.health < state.maxHealth) {
                    state.health++;
                }
                if (entity.effect == 'range' &&
                    state.range < state.maxRange) {
                    state.range++;
                }
                break;

            case "lore":
                entity.el.playLore();
                // entity.el.hideModel();
                this.container.removeChild(entity.el);
                this.board.removeEntityAt(x, y);
                this.soundController.play('analogSound');
                break;

            case "key":
                this.addToInventory(entity, state);
                this.container.removeChild(entity.el);
                this.board.removeEntityAt(x, y);
                this.soundController.play('analogSound');
                break;

            case "weapon":
                this.addToInventory(entity, state);
                this.container.removeChild(entity.el);
                this.board.removeEntityAt(x, y);
                this.soundController.play('analogSound');
                break;

            case "door":
                this.soundController.play('doorSound');
                this.board.removeEntityAt(x, y);
                // this.initialize();
                break;
        }
    }

    dropLoot(x, y) {
        const Effets = [
            "health",
            "range"
        ]
        const effect = Effets[Math.floor(Math.random() * Effets.length)];

        const droppedLoot = document.createElement("mr-loot");
        droppedLoot.dataset.effect = effect;
        this.container.appendChild(droppedLoot);

        const loot = {
            el: droppedLoot,
            type: 'loot',
            effect: effect
        };

        // this.board.entityMap[x][y] = loot;
        this.board.replaceEntity(x, y, loot);

        this.needsUpdate = true;
    }

    dropWeapon(x, y) {

        const Weapons = [{
                name: "twig",
                subtype: "melee"
            },
            {
                name: "short-sword",
                subtype: "melee"
            },
            {
                name: "slingshot",
                subtype: "range"
            },
            {
                name: "bow",
                subtype: "range"
            },
        ]

        // TODO: there should be only one "mr-weapon"
        // as an entity in the entitymap
        const randomId = Math.floor(Math.random() * Weapons.length);
        const el = document.createElement("mr-weapon");
        el.dataset.name = Weapons[randomId].name;
        this.container.appendChild(el);

        const weapon = {
            el: el,
            type: 'weapon',
            subType: Weapons[randomId].subtype,
            name: Weapons[randomId].name,
            attack: this.level + Math.ceil(Math.random() * this.level / 10),
            range: Math.ceil(Math.random() * 5) + 1,
        };

        this.board.entityMap[x][y] = weapon;
        this.needsUpdate = true;
    }

    projectRoom() {
        const state = this.state.components.get('state');

        this.board.calcDistFromPlayer();
        this.board.updateFloor(state, this.timer);
        this.board.setAttackRange(state, this.timer);
        this.board.projectEverything(this.timer);

        if (state.action == 0) {
            this.endTurnButton.style.backgroundColor = Colors.hover;
        } else {
            this.endTurnButton.style.backgroundColor = Colors.health;
        }
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

            if (this.needsUpdate || this.state.needsUpdate) {
                console.log('updated at', this.timer);

                this.projectRoom();
                const offX = this.board.colCount / 2 + 0.5;
                this.state.dataset.position = `-${offX * this.scale} ${this.tableOffset} 0`;

                this.needsUpdate = false;
                this.state.needsUpdate = false;

                // Dot is in the battery room
                if (this.board.biome.name == 'battery') {
                    const state = this.state.components.get('state');
                    const pos = this.board.getPlayerPos();

                    // the gauge that fills at it charges
                    const gaugeEl = this.board.entityMap[4][2].el;

                    // the charging pad on the floor,
                    // that Dot stands on.
                    const padEl = this.board.tileMap[4][1].el;

                    // Dot stands on the pad
                    if (pos.x == 4 && pos.y == 1) {
                        if (state.range < state.maxRange) {
                            // Dot is charging
                            this.state.components.set('state', {
                                range: state.range + 0.1
                            })
                            gaugeEl.updateBatteryLevel(state.range / state.maxRange);
                            this.needsUpdate = true;
                            this.state.needsUpdate = true;
                        } else {
                            // Dot is charged
                            state.range = state.maxRange;
                            this.needsUpdate = false;
                            this.state.needsUpdate = false;
                        }
                    } else {
                        gaugeEl.updateBatteryLevel(0);

                    }
                }
            } else {
                this.board.projectAnimatedEntities(this.timer);
            }
        }
    }

    attachedComponent(entity) {
        this.root = entity;
        this.root.appendChild(this.container);

        this.settings = this.root.components.get('game');
        this.autoEndTurn = this.settings.autoEndTurn ?? false;
        this.scale = this.settings.scale ?? 0.05;
        this.tableOffset = this.settings.tableOffset ?? 0;

        this.container.style.scale = this.scale;
        this.container.dataset.position = `0 ${this.tableOffset} 0`;

        this.root.appendChild(this.state);
        this.state.style.scale = this.scale;
        this.state.dataset.rotation = `0 0 30`

        this.endTurnButton.className = 'end-turn';
        this.endTurnButton.innerText = "End";
        this.endTurnButton.dataset.position = "0 0.08 2";
        this.endTurnButton.dataset.rotation = "270 0 270";
        this.state.appendChild(this.endTurnButton);

        this.endTurnButton.addEventListener('click', () => {
            this.endTurn();
        });

        this.initialize();
    }
}

let saGo = new GameSystem();
