class GameSystem extends MRSystem {
    constructor() {
        super()
        this.gameIsStarted = false;
        this.needsUpdate = false;
        this.level = 0;
        this.cycle = 0;

        // container to store board object references
        this.container = document.createElement("mr-div");
        this.container.id = 'container'; // for DOM debugging

        // The state system dealing with player state and UI
        this.state = document.createElement("mr-entity");
        this.state.components.set('state', {
            health: 10,
            maxHealth: 20,
            range: 50,
            maxRange: 50,
            actionPoints: 3,
            maxActionPoints: 3,
            projectedCost: 0,
            hasKey: false,
            meleeWeaponName: 'twig',
            meleeWeaponAttack: 1,
            rangeWeaponName: 'slingshot',
            rangeWeaponAttack: 1,
            selectedWeapon: "melee",
            isPlayerTurn: true,
            needsUpdate: false
        });

        this.endTurnButton = document.createElement("mr-button");
        this.endTurnButton.className = "end-turn";

        this.soundController = new SoundController();

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

            if (event.key === 's') {
                event.preventDefault();
                console.log(this.state.components.get('state'));
            }

            if (event.key === 'm') {
                event.preventDefault();
                this.printArray("this.board.entityMap", this.board.entityMap);
            }
        });

    }

    initialize() {
        // console.clear();
        this.timer = 0;
        const state = this.state.components.get('state');

        // clear up the dom elements container
        while (this.container.firstChild) {
            this.container.removeChild(this.container.lastChild);
        }
        this.soundController.initialize();

        let params;
        // TODO: make the soundtrack part of the biome
        // console.log(state.levelId);
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
                    path: "tiles/biome_purple/",
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
                    path: "tiles/biome_cyan/",
                    audio: "/audio/fridge.mp3",
                    tiles: ["tilegrasscyan001.glb"],
                    props: ["plant_01.glb", "plant_02.glb", "plant_03.glb", "plant_04.glb", "plant_05.glb"],
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

        this.board = new Board(this.container, params, this.state.components);
        this.board.assignHoverHandlers(this.state.components);

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

                tile.el.addEventListener("touchstart", () => {
                    const x = tile.pos.x;
                    const y = tile.pos.y;

                    // const x = parseInt(tile.el.dataset.x);
                    // const y = parseInt(tile.el.dataset.y);

                    const targetEntity = this.board.getEntityAt(x, y);
                    const cost = this.board.getProjectedCostFor(x, y);
                    const state = this.state.components.get('state');

                    if (state.isPlayerTurn) {
                        if (!targetEntity) {
                            // there is nothing on the tile.
                            if (cost <= state.actionPoints) {
                                state.actionPoints -= cost;
                                this.soundController.play('chessSound');
                                this.board.movePlayer(x, y);
                            } else {
                                this.soundController.play('nopeSound');
                            }

                        } else {
                            // there is an entity on the tile
                            if (cost <= state.actionPoints &&
                                this.board.distances[x][y] <= state.actionPoints) {
                                this.interactWith(x, y, targetEntity, cost, state);

                                // pickable items
                                if (targetEntity.type == "loot" ||
                                    targetEntity.type == "key" ||
                                    targetEntity.type == "weapon" ||
                                    targetEntity.type == "lore") {

                                    // then move the player
                                    state.actionPoints -= cost;
                                    this.soundController.play('chessSound');
                                    this.board.movePlayer(x, y);
                                }

                                // door
                                if (targetEntity.type == "door") {
                                    state.actionPoints -= cost;
                                    this.soundController.play('chessSound');
                                    this.board.movePlayer(x, y);

                                    state.isPlayerTurn = false;
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

                        state.needsUpdate = true;
                        this.state.components.set('state', state);

                        // Automatically end the turn when the player runs out of action points
                        if (this.autoEndTurn && state.actionPoints == 0) {
                            this.endTurn();
                        }

                        this.needsUpdate = true;
                    }
                });
            })
        })

        this.state.components.set('state', {
            isPlayerTurn: true,
            needsUpdate: true
        });

        console.log(this.level)
        this.level++;
        this.gameIsStarted = true;
        this.needsUpdate = true;
    }

    addToInventory(entity, state) {
        // if (entity.el.dataset.type == "weapon") {
        //     if (entity.el.dataset.subType == "melee" &&
        //         entity.el.dataset.attack > state.meleeWeaponAttack) {
        //         state.meleeWeaponName = entity.el.dataset.name;
        //         state.meleeWeaponAttack = entity.el.dataset.attack;
        //     }
        //     if (entity.el.dataset.subType == "range" &&
        //         entity.el.dataset.attack > state.rangeWeaponAttack) {
        //         state.rangeWeaponName = entity.el.dataset.name;
        //         state.rangeWeaponAttack = entity.el.dataset.attack;
        //     }
        // }
        if (entity.type == "weapon") {
            if (entity.subType == "melee" && entity.attack > state.meleeWeaponAttack) {
                state.meleeWeaponName = entity.name;
                state.meleeWeaponAttack = entity.attack;
            }
            if (entity.subType == "range" && entity.attack > state.rangeWeaponAttack) {
                state.rangeWeaponName = entity.name;
                state.rangeWeaponAttack = entity.attack;
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
            actionPoints: state.maxActionPoints,
            needsUpdate: true,
            isPlayerTurn: true
        });

        this.decreaseRange();
        this.needsUpdate = true;
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
            actionPoints: state.maxActionPoints,
            projectedCost: 0,
            hasKey: false,
            meleeWeaponName: 'twig',
            meleeWeaponAttack: 1,
            rangeWeaponName: 'slingshot',
            rangeWeaponAttack: 1,
            selectedWeapon: "melee",
            isPlayerTurn: true,
            needsUpdate: true
        });

        // this.state.components.set('state', {
        //     cycleId: state.cycleId + 1,
        //     levelId: 0,
        //     health: state.maxHealth,
        //     range: state.maxRange,
        //     needsUpdate: true
        // });

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
                needsUpdate: true
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

    interactWith(x, y, entity, cost, state) {
        switch (entity.type) {
            case "enemy":
                state.actionPoints -= cost;
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

    attack(entity, r, c) {
        const state = this.state.components.get('state');

        // TODO: move the sound where the player is
        // this.soundController.moveSoundPosition('swooshSound', );
        this.soundController.play('swooshSound');

        const damage = state.meleeWeaponAttack;
        entity.hp -= damage;
        this.board.showDamageAt(r, c, damage);

        if (entity.hp <= 0) {
            this.container.removeChild(entity.el);
            this.dropLoot(r, c);
            this.needsUpdate = true;
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
        // const Names = [
        //     "twig", "short-sword"
        // ]
        // const name = Names[Math.floor(Math.random() * Names.length)];
        const state = this.state.components.get('state');

        // TODO: there should be only one "mr-weapon"
        // as an entity in the entitymap
        const weaponEl = document.createElement("mr-weapon");
        weaponEl.dataset.levelId = this.level;
        this.container.appendChild(weaponEl);

        const weapon = {
            el: weaponEl,
            type: 'weapon',
        };

        this.board.entityMap[x][y] = weapon;

        this.needsUpdate = true;
    }

    projectRoom() {
        const state = this.state.components.get('state');

        this.board.calcDistFromPlayer();
        this.board.updateFloor(state, this.timer, state.isPlayerTurn);
        this.board.projectEverything(this.timer);

        if (state.actionPoints == 0) {
            this.endTurnButton.style.backgroundColor = Colors.hover;
        } else {
            this.endTurnButton.style.backgroundColor = Colors.health;
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

            const state = this.state.components.get('state');

            if (this.needsUpdate) {
                this.projectRoom();

                const offsetX = this.board.colCount / 2 + 0.5;
                this.state.dataset.position = `-${offsetX * this.scale} ${this.tableOffset} 0`;
            } else {
                this.board.projectAnimatedEntities(this.timer);
            }

            // the player is in the battery room
            this.board.checkBattery(state);
            this.state.components.set('state', state);
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
