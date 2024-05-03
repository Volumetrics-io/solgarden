const { distBetween, printArray } = require('../utils.js');

class GameSystem extends MRSystem {
    constructor() {
        super()
        this.gameIsStarted = false;
        this.needsUpdate = false;
        this.level = 0;
        this.cycle = 0;

        // this boolean is very important.
        // it toggles the interactivity of the whole game

        // TODO: the goal is to set a staticUntil that is a timestamp
        // let say, 3 seconds in the future: staticUntil = timestamp + 3;
        // and then for every interaction we check if isStatic is true
        // then we set isStatic back off when timestamp > staticUntil
        this.isStatic = false;
        this.staticUntil = 0;

        this.isDebug = false;

        // container to store board object references
        this.container = document.createElement("mr-div");
        this.container.id = 'container'; // for DOM debugging

        // The state system dealing with player state and UI
        this.state = document.createElement("mr-entity");
        this.defaultState = {
            health: 20,
            range: 30,
            action: 4,
            projectedCost: 0,
            hasKey: false,
            meleeName: '',
            meleeAttack: 0,
            meleeRange: 1,
            rangeName: '',
            rangeAttack: 0,
            rangeRange: 0,
            selectedWeapon: "melee",
            isPlayerTurn: true,
        }

        // assign default state
        // this.defaultState is reassigned after each death
        this.state.components.set('state', this.defaultState);
        this.state.components.set('state', {
            maxHealth: 20,
            maxRange: 30,
            maxAction: 4,
            hoverMelee: false,
            hoverRange: false,
        });

        this.endTurnButton = document.createElement("mr-button");
        this.soundController = new SoundController();


        document.addEventListener("keydown", (event) => {

            // I for Initialize a new room
            if (event.key === "i") {
                event.preventDefault();
                this.initialize();
            }

            // E for End game
            if (event.key === "e") {
                event.preventDefault();
                this.endGame();
            }

            // S for State
            if (event.key === 's') {
                event.preventDefault();
                console.log(this.state.components.get('state'));
            }

            // M for Map
            if (event.key === 'm') {
                event.preventDefault();
                printArray("this.board.heightMap", this.board.heightMap);
                printArray("this.board.entityMap", this.board.entityMap);
                printArray("this.board.propMap", this.board.propMap);
                printArray("this.board.distances", this.board.distances);
            }

            // U for Update
            if (event.key === "i") {
                event.preventDefault();
                this.needsUpdate = true;
                this.state.needsUpdate = true;
                console.log('triggered an update')
            }

            // D for Debug
            if (event.key === "d") {
                event.preventDefault();
                this.isDebug = !this.isDebug;
                this.needsUpdate = true;
                this.state.needsUpdate = true;
                console.log('isDebug is now ', this.isDebug);
            }

            // W for Weapon
            if (event.key === 'w') {
                event.preventDefault();

                const twig = document.createElement("mr-weapon");
                twig.dataset.model = "twig";
                this.container.appendChild(twig);

                const pos = this.board.addToMap({
                    el: twig,
                    type: 'weapon',
                    subtype: 'melee',
                    name: 'twig',
                    range: 10,
                    attack: 10
                }, this.board.entityMap);
                console.log('Weapon dropped at ', pos);

                this.needsUpdate = true;
                this.state.needsUpdate = true;
            }

            // R for Range
            if (event.key === 'r') {
                event.preventDefault();

                const range = document.createElement("mr-weapon");
                range.dataset.model = "slingshot";
                this.container.appendChild(range);

                const pos = this.board.addToMap({
                    el: range,
                    type: 'weapon',
                    subtype: 'range',
                    name: 'slingshot',
                    range: 3,
                    attack: 3
                }, this.board.entityMap);
                console.log('Weapon dropped at ', pos);

                this.needsUpdate = true;
                this.state.needsUpdate = true;
            }

            // C for Chest
            if (event.key === 'c') {
                event.preventDefault();

                const chest = document.createElement("mr-chest");
                this.container.appendChild(chest);

                const pos = this.board.addToMap({
                    el: chest,
                    type: 'chest',
                }, this.board.entityMap);
                console.log('Chest dropped at ', pos);

                this.needsUpdate = true;
                this.state.needsUpdate = true;
            }

            // H for Health reset
            if (event.key === 'h') {
                event.preventDefault();
                this.state.components.set("state", this.defaultState);

                this.needsUpdate = true;
                this.state.needsUpdate = true;
            }

            // K for Key
            // if (event.key === 'k') {
            //     event.preventDefault();
            //     this.state.components.set("state", {
            //         hasKey: true
            //     });
            //
            //     this.needsUpdate = true;
            //     this.state.needsUpdate = true;
            // }

            // P for projectiles
            if (event.key === 'p') {
                event.preventDefault();

                this.board.projectileTo(this.board.playerPos, this.board.doorPos);

                this.needsUpdate = true;
                this.state.needsUpdate = true;
            }

            // O for Open door
            if (event.key === 'o') {
                event.preventDefault();

                this.state.components.set("state", {
                    hasKey: true
                });

                this.board.openDoor();
            }

            // Q for Quake
            if (event.key === 'q') {
                event.preventDefault();
                this.board.startQuakeAt(
                    this.board.playerPos.x,
                    this.board.playerPos.y, 1.5, 40, 3);
            }
            if (event.key === 'a') {
                event.preventDefault();
                this.board.startQuakeAt(
                    this.board.playerPos.x,
                    this.board.playerPos.y, 1, 15, 0.5);
            }

        });

    }

    initialize() {
        // console.clear();
        this.timer = 0;
        // const state = this.state.components.get('state');

        // a different approach: pushing the previous room down
        // if (this.container.firstChild) {
        //     const newContainer = document.createElement("mr-div");
        //     this.root.appendChild(newContainer);
        //     newContainer.style.scale = this.scale;
        //
        //     this.oldContainer = this.container;
        //     this.container = newContainer;
        //     const depth = -this.level / 10;
        //     this.oldContainer.dataset.position = `0 ${depth} 0`;
        //
        //     // TODO: remove the player?
        // }

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
                floorCount: 1,
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
            // this.level == 2 ||
            this.level == 3 ||
            this.level == 8 ||
            this.level == 13 ||
            this.level == 21 ||
            this.level == 34 ||
            this.level == 55) {

            // battery room
            params = {
                levelId: this.level,
                floorCount: 1,
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
                    tiles: ["tilegrass001.glb"],
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
                        el: document.createElement("mr-battery-ii"),
                        type: 'prop'
                    }, {
                        el: document.createElement("mr-battery-i"),
                        type: 'prop'
                    }, 0],
                    [0, 0, {
                        el: document.createElement("mr-battery-iv"),
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
                        el: document.createElement("mr-battery-iii"),
                        type: 'battery'
                    }, 0, 0],
                    [0, 0, 0, 0],
                    [0, 0, 0, 0],
                    [0, 0, 0, 0],
                ]
            }
            this.soundController.play('fridgeSound');

            // give the key to the player since
            // there are no enemies in the room
            this.state.components.set('state', {
                hasKey: true
            });

        } else {
            params = {
                levelId: this.level
            }
        }

        params.isDebug = this.isDebug;
        this.board = new Board(this.container, params);

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

                // Mouse over tiles
                // Used to update the project cost of an action while hovering
                tile.el.addEventListener("mouseover", () => {
                    const x = tile.pos.x;
                    const y = tile.pos.y;

                    // TODO: GROSS
                    tile.el.borderContainer.dataset.position = "0 0.15 0";

                    const state = this.state.components.get('state');

                    this.state.components.set('state', {
                        projectedCost: this.board.getCostFor(x, y, state),
                    });
                    this.state.needsUpdate = true;
                });

                // Mouse out, reset the projected cost to 0
                tile.el.addEventListener("mouseout", () => {
                    const x = tile.pos.x;
                    const y = tile.pos.y;

                    // TODO: GROSS
                    tile.el.borderContainer.dataset.position = "0 0.2 0";

                    this.state.components.set('state', {
                        projectedCost: 0,
                    });
                    this.state.needsUpdate = true;
                });

                // Tap on a tile.
                // State machine based on what is tapped and what is the state
                tile.el.addEventListener("touchend", () => {
                    const x = tile.pos.x;
                    const y = tile.pos.y;

                    const state = this.state.components.get('state');
                    const targetEntity = this.board.getEntityAt(x, y);
                    const cost = this.board.getCostFor(x, y, state);

                    if (this.isDebug) console.log("Tapped entity", targetEntity);

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

                                if (targetEntity.type == "key") {
                                    this.board.openDoor();
                                    // this.soundController.play('doorSound');
                                }

                                // door
                                if (targetEntity.type == "door") {

                                    if (state.hasKey) {
                                        // this.soundController.play('doorSound');
                                        this.board.removeEntityAt(x, y);

                                        // move the player to the door
                                        state.action -= cost;
                                        this.soundController.play('chessSound');
                                        this.board.movePlayer(x, y);

                                        state.isPlayerTurn = false;
                                        // free full bar if you reach the door
                                        state.action = state.maxAction;
                                        state.hasKey = false;

                                        setTimeout(() => {
                                            this.initialize();
                                        }, 1000);
                                    } else {
                                        this.soundController.play('nopeSound');
                                    }
                                }
                            } else {
                                this.soundController.play('nopeSound');
                            }

                            // enemies
                            if (targetEntity.type == "enemy") {
                                const ppos = this.board.playerPos;
                                const dist = distBetween(x, y, ppos.x, ppos.y);
                                const type = state.selectedWeapon;
                                let range = this.getWeaponRange();

                                if (dist <= range && cost <= state.action) {
                                    state.action -= cost;
                                    this.attack(targetEntity, x, y);
                                } else {
                                    this.soundController.play('nopeSound');
                                }
                            }
                        }

                        // Automatically end the turn when the player
                        // runs out of action points
                        if (this.autoEndTurn && state.action == 0) {
                            setTimeout(() => {
                                this.endTurn();
                            }, 800);
                            // this.endTurn();
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
        });

        this.level++;
        this.gameIsStarted = true;
        this.needsUpdate = true;
        this.state.needsUpdate = true;
    }

    getWeaponRange() {
        const state = this.state.components.get('state');

        if (state.selectedWeapon == 'melee') {
            return state.meleeRange;
        } else if (state.selectedWeapon == 'range') {
            return state.rangeRange;
        }
    }

    getWeaponDamage() {
        const state = this.state.components.get('state');

        if (state.selectedWeapon == 'melee') {
            return state.meleeAttack;
        } else if (state.selectedWeapon == 'range') {
            return state.rangeAttack;
        }
    }

    addToInventory(entity, state) {
        if (entity.type == "weapon") {
            if (entity.subtype == "melee" && entity.attack > state.meleeAttack) {
                state.meleeName = entity.name;
                state.meleeAttack = entity.attack;
                state.meleeRange = entity.range;
            }
            if (entity.subtype == "range" && entity.attack > state.rangeAttack) {
                state.rangeName = entity.name;
                state.rangeAttack = entity.attack;
                state.rangeRange = entity.range;
            }
            if (state.selectedWeapon == '') {
                state.selectedWeapon = entity.subtype;
            }
        }
        if (entity.type == "key") {
            state.hasKey = true;
        }
    }

    endTurn() {
        const state = this.state.components.get('state');

        let range = state.range;
        if (range > 1) {
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

            // Dot still has battery left
            range--;
            this.opponentTurn();
        } else {

            // Dot's battery is depleted
            this.endGame();
        }

        this.state.components.set('state', {
            action: state.maxAction,
            isPlayerTurn: true,
            range: range
        });

        this.needsUpdate = true;
        this.state.needsUpdate = true;
        this.soundController.play('analogSound');

        if (this.isDebug) {
            console.log("Turn has ended. Combat queue", this.combatQueue);
        }
    }

    endGame() {
        console.log('you ded');

        this.level = 0;
        this.cycle++;
        this.state.components.set('state', this.defaultState);

        console.log("health:",
            this.state.components.get('state').health,
            "range",
            this.state.components.get('state').range);

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
            const subtype = entity.subtype;
            const r = entry.r;
            const c = entry.c;
            const x = this.board.playerPos.x;
            const y = this.board.playerPos.y;

            // Movements for different enemy types
            if (subtype == 'aimless') {
                //  this unit wanders randomly
                let Moves = [];;
                [
                    [-1, 0],
                    [1, 0],
                    [0, -1],
                    [0, 1]
                ].forEach((move, i) => {
                    const cell = this.board.getEntityAt(r + move[0], c + move[1]);
                    if (!cell && cell != "offmap") {
                        Moves.push(move);
                    }
                });
                if (Moves.length > 0) {
                    const rand = Math.floor(Math.random() * Moves.length);
                    const next = Moves[rand];
                    this.board.moveEntity(r, c, r + next[0], c + next[1]);
                }

            } else if (subtype == 'static') {
                // this unit doesn't move
                // this is a turet, or a tower

            } else if (subtype == 'homing') {

                // this unit follows the player
                // and always aim to get closer

                // the path finder needs an obstacle map
                // we can just copy the entity map
                const blockmap = this.board.entityMap.map(function(arr) {
                    return arr.slice();
                });
                // remove origin and target from copy
                // otherwise the pathfinding can't work
                blockmap[r][c] = 0;
                blockmap[x][y] = 0;

                const pf = new PathFinder(blockmap);
                const path = pf.findPath([r, c], [x, y]);

                // if path[1] is undefined, the path has no solution
                const nextMove = (!path[1]) ? [r, c] : path[1];

                this.board.moveEntity(r, c, nextMove[0], nextMove[1]);
            }

            // after moving, attack if in range
            // TODO: different attacks based on enemy subtype
            if (this.board.distances[r][c] <= 2) {
                this.attackPlayer(entity, r, c);
            }

            if (this.combatQueue.length > 0) {
                setTimeout(() => {
                    this.opponentTurn();
                }, 3000)
            }

        } else {
            this.state.components.set('state', {
                isPlayerTurn: true,
                // needsUpdate: true
            })
        }

        this.needsUpdate = true;
    }

    attackPlayer(attacker, r, c) {
        const state = this.state.components.get('state');
        const playerPos = this.board.playerPos;

        // TODO: move the sound where the attacker is
        // this.soundController.moveSound()
        this.soundController.play('clashSound');

        // console.log(attacker);
        this.board.projectileTo({
            x: r,
            y: c
        }, playerPos);

        setTimeout(() => {
            this.board.startQuakeAt(playerPos.x, playerPos.y, 1, 10, 0.5);
        }, 500);

        const health = state.health - attacker.attack;
        this.state.components.set('state', {
            health: health,
        });
        this.state.needsUpdate = true;

        this.board.showDamageAt(playerPos.x, playerPos.y, attacker.attack);

        if (health <= 0) {
            this.endGame();
        }
    }

    attack(entity, r, c) {
        const state = this.state.components.get('state');

        if (this.isDebug) {
            console.log(entity);
        }

        this.board.projectileTo(this.board.playerPos, {
            x: r,
            y: c
        });

        setTimeout(() => {
            this.board.startQuakeAt(r, c, 1, 10, 0.5);
        }, 500);

        // TODO: move the sound where the player is
        // this.soundController.moveSoundPosition('swooshSound', );
        this.soundController.play('swooshSound');

        // console.log(state.selectedWeapon)
        let damage;
        if (state.selectedWeapon == "melee") {
            damage = state.meleeAttack;
        } else {
            damage = state.rangeAttack;
        }

        entity.hp -= damage;
        this.board.showDamageAt(r, c, damage);

        if (entity.hp <= 0) {
            // setTimeout(() => {
            this.container.removeChild(entity.el);
            this.dropLoot(r, c);
            this.needsUpdate = true;
            // }, 500);
        }
    }

    interactWith(x, y, entity, cost, state) {
        switch (entity.type) {
            // case "enemy":
            //     state.action -= cost;
            //     this.attack(entity, x, y);
            //     break;

            case "chest":

                entity.el.open();

                // setTimeout(() => {
                this.container.removeChild(entity.el);
                this.board.removeEntityAt(x, y);
                this.dropWeapon(x, y);
                // }, 1000)

                // this.soundController.play('latchSound');
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

                // case "door":
                //     // remove the door from the entity map
                //     // so that the player can occupy the cell
                //     this.soundController.play('doorSound');
                //     this.board.removeEntityAt(x, y);
                //     break;
        }
    }

    dropLoot(x, y) {

        // TODO: should be a method of Board
        let enemyCount = 0;
        for (let r = 0; r < this.board.rowCount; r++) {
            for (let c = 0; c < this.board.colCount; c++) {
                if (this.board.entityMap[r][c].type == 'enemy') {
                    enemyCount++;
                }
            }
        }

        let state = this.state.components.get("state");
        let loot;
        if (enemyCount == 1 && state.hasKey) {
            // last enemy and no key, the key must drop
            if (Math.random() < 0.5) {
                const chest = document.createElement("mr-chest");
                this.container.appendChild(chest);
                loot = {
                    el: chest,
                    type: 'chest'
                };
            }
        } else if (enemyCount == 1 && !state.hasKey) {
            // last enemy and no key, the key must drop
            const key = document.createElement("mr-key");
            this.container.appendChild(key);
            loot = {
                el: key,
                type: 'key'
            };
        } else if (enemyCount > 1 && !state.hasKey && Math.random() > 0.5) {
            // not last enemy and no key. Key could drop
            const key = document.createElement("mr-key");
            this.container.appendChild(key);
            loot = {
                el: key,
                type: 'key'
            };
        } else {
            const Effects = ["health", "range"]
            const effect = Effects[Math.floor(Math.random() * Effects.length)];
            const droppedLoot = document.createElement("mr-loot");
            droppedLoot.dataset.effect = effect;
            this.container.appendChild(droppedLoot);
            loot = {
                el: droppedLoot,
                type: 'loot',
                effect: effect
            };
        }

        this.board.replaceEntity(x, y, loot);
        this.needsUpdate = true;
    }

    dropWeapon(x, y) {

        // TODO: what kind of weapons can drop?
        const Weapons = [{
                name: "twig",
                subtype: "melee",
                range: 1
            },
            {
                name: "shortsword",
                subtype: "melee",
                range: 1.5
            },
            {
                name: "slingshot",
                subtype: "range",
                range: 2
            },
            {
                name: "bow",
                subtype: "range",
                range: 3
            },
        ]

        // const Weapons = [{
        //         name: "shortsword",
        //         subtype: "melee"
        //     },
        //     {
        //         name: "slingshot",
        //         subtype: "range"
        //     }
        // ]

        const randomId = Math.floor(Math.random() * Weapons.length);
        const weapon = Weapons[randomId];
        const el = document.createElement("mr-weapon");
        el.dataset.model = weapon.name;
        this.container.appendChild(el);

        // random attack and random range
        let attack;
        let range;
        if (weapon.subtype == 'melee') {
            range = 1.5;
            attack = 1 + Math.ceil(this.level / 5);
        } else if (weapon.subtype == 'range') {
            range = 3;
            attack = 1 + Math.ceil(this.level / 5);
        } else {
            console.error("Illegal type for weapon.subtype");
        }

        console.log('dropped weapon', attack, range, weapon.name, weapon.subtype);

        this.board.entityMap[x][y] = {
            el: el,
            type: 'weapon',
            subtype: weapon.subtype,
            name: weapon.name,
            attack: attack,
            range: range,
        };
        this.needsUpdate = true;
    }

    projectRoom() {
        const state = this.state.components.get('state');

        this.board.calcDistFromPlayer();
        this.board.updateFloor(state, this.timer);
        // this.board.setAttackRange(state, this.timer);
        this.board.projectEverything(this.timer);

        if (state.action == 0) {
            this.endTurnButton.style.backgroundColor = Colors.hover;
        } else {
            this.endTurnButton.style.backgroundColor = Colors.health;
        }
    }

    update(deltaTime, frame) {
        if (this.gameIsStarted) {
            this.timer += deltaTime;

            if (this.needsUpdate ||
                this.state.needsUpdate ||
                this.board.isQuake) {

                if (this.isDebug) {
                    console.log('updated at', this.timer);
                }

                this.projectRoom();
                const offX = (this.board.colCount / 2 + 0.5) * this.scale;

                this.state.dataset.position = `-${offX} ${this.tableOffset} 0`;

                this.needsUpdate = false;
                this.state.needsUpdate = false;

                // Dot is in the battery room
                if (this.board.biome.name == 'battery') {
                    const state = this.state.components.get('state');
                    const pos = this.board.playerPos;

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
                            gaugeEl.updateLevel(state.range / state.maxRange);
                            this.needsUpdate = true;
                            this.state.needsUpdate = true;
                        } else {
                            // Dot is charged
                            state.range = state.maxRange;
                            this.needsUpdate = false;
                            this.state.needsUpdate = false;
                        }
                    } else {
                        gaugeEl.updateLevel(0);

                    }
                }
                // } else {
                //     this.board.projectAnimatedEntities(this.timer);
            }

            this.board.projectAnimatedEntities(this.timer);
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
