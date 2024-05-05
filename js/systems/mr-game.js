class GameSystem extends MRSystem {
    constructor() {
        super()
        this.gameIsStarted = false;
        // this.needsUpdate = false;
        // this.level = 0;
        this.cycle = 0;
        this.isDebug = false;

        // this boolean is very important.
        // it toggles the interactivity of the whole game

        // TODO: the goal is to set a staticUntil that is a timestamp
        // let say, 3 seconds in the future: staticUntil = timestamp + 3;
        // and then for every interaction we check if isStatic is true
        // then we set isStatic back off when timestamp > staticUntil
        this.isStatic = false;
        this.staticUntil = 0;

        // container to store board object references
        this.container = document.createElement("mr-div");
        this.container.id = 'container'; // for DOM debugging

        // The state system dealing with player state and UI
        this.interface = document.querySelector("#interface");

        // Store the default state to reapply it when Dot is replaced
        // this.defaultState = this.state.components.get('state');
        this.defaultState = State;

        Object.assign(State, {
            maxHealth: 20,
            maxRange: 30,
            maxAction: 4,
            hoverMelee: false,
            hoverRange: false,
            needsUpdate: false
        })

        // this.state.components.set('state', {
        //     maxHealth: 20,
        //     maxRange: 30,
        //     maxAction: 4,
        //     hoverMelee: false,
        //     hoverRange: false,
        // });

        this.endTurnButton = document.createElement("mr-button");
        // this.soundController = new SoundController();


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
                // console.log(this.state.components.get('state'));
                console.log(State);
            }

            // M for Map
            if (event.key === 'm') {
                event.preventDefault();
                printArray("this.board.heightMap", this.board.heightMap);
                printArray("this.board.entityMap", this.board.entityMap);
                printArray("this.board.lootMap", this.board.lootMap);
                printArray("this.board.propMap", this.board.propMap);
                printArray("this.board.distances", this.board.distances);
            }

            // U for Update
            if (event.key === "i") {
                event.preventDefault();
                // this.needsUpdate = true;
                State.needsUpdate = true;
                console.log('triggered an update')
            }

            // D for Debug
            if (event.key === "d") {
                event.preventDefault();
                this.isDebug = !this.isDebug;
                // this.needsUpdate = true;
                State.needsUpdate = true;
                console.log('isDebug is now ', this.isDebug);
            }

            // W for Weapon
            if (event.key === 'w') {
                event.preventDefault();

                const twig = document.createElement("mr-weapon");
                twig.dataset.model = "twig";
                this.container.appendChild(twig);

                const pos = this.board.addToLootMap({
                    el: twig,
                    type: 'weapon',
                    subtype: 'melee',
                    name: 'twig',
                    range: 10,
                    attack: 10
                });
                console.log('Weapon dropped at ', pos);

                // this.needsUpdate = true;
                State.needsUpdate = true;
            }

            // R for Range
            if (event.key === 'r') {
                event.preventDefault();

                const range = document.createElement("mr-weapon");
                range.dataset.model = "slingshot";
                this.container.appendChild(range);

                const pos = this.board.addToLootMap({
                    el: range,
                    type: 'weapon',
                    subtype: 'range',
                    name: 'slingshot',
                    range: 3,
                    attack: 3
                });
                console.log('Weapon dropped at ', pos);

                // this.needsUpdate = true;
                State.needsUpdate = true;
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

                // this.needsUpdate = true;
                State.needsUpdate = true;
            }

            // H for Health reset
            if (event.key === 'h') {
                event.preventDefault();
                // this.state.components.set("state", this.defaultState);
                Object.assign(State, this.defaultState);

                // this.needsUpdate = true;
                State.needsUpdate = true;
            }

            // P for projectiles
            if (event.key === 'p') {
                event.preventDefault();

                this.board.projectileTo(this.board.playerPos, this.board.doorPos);

                // this.needsUpdate = true;
                State.needsUpdate = true;
            }

            // O for Open door
            if (event.key === 'o') {
                event.preventDefault();
                State.hasKey = true;
                // this.state.components.set("state", {
                //     hasKey: true
                // });
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

            // N for eNemy
            if (event.key === 'n') {
                event.preventDefault();

                const EnemySubtypes = [
                    'static',
                    'homing',
                    'aimless',
                ]
                const rand = Math.floor(Math.random() * EnemySubtypes.length);
                const subtype = EnemySubtypes[rand];

                const el = document.createElement("mr-enemy");
                this.container.appendChild(el);
                el.dataset.subtype = subtype;

                const enemy = {
                    el: el,
                    type: 'enemy',
                    subtype: subtype,
                    hp: 1,
                    attack: 0
                };
                this.board.addToMap(enemy, this.board.entityMap);

                // this.needsUpdate = true;
                State.needsUpdate = true;
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

        let params;
        // TODO: make the soundtrack part of the biome
        if (State.level == 0) {
            // starting room
            // The room class generate all kind of arrays and dom elements
            // to represent a level, either hardcoded or randomly generated
            params = {
                // levelId: State.level,
                floorCount: 1,
                rowCount: 6,
                colCount: 4,
                enemyCount: 0,
                propCount: 0,
                blockCount: 0,
                isChest: false,
                biome: {
                    name: 'spawn',
                    path: "assets/biomes/purple/",
                    audio: "",
                    tiles: ["tilegrasspurple001.glb"],
                    props: [],
                    block: [],
                }
            }
        } else if (
            // this.levelId == 1 ||
            // this.level == 2 ||
            State.level == 3 ||
            State.level == 8 ||
            State.level == 13 ||
            State.level == 21 ||
            State.level == 34 ||
            State.level == 55) {

            // battery room
            params = {
                // levelId: this.level,
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
                    path: "assets/biomes/battery-room/",
                    audio: "/assets/audio/fridge.mp3",
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

            // give the key to the player since
            // there are no enemies in the room
            this.board.openDoor();
            State.hasKey = true;
            // this.state.components.set('state', {
            //     hasKey: true
            // });

        } else {
            params = {}
        }

        // params.isDebug = this.isDebug;
        this.board = new Board(this.container, params);
        SoundController.play(this.board.biome.name);

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

                    // const state = this.state.components.get('state');

                    // this.state.components.set('state', {
                    //     projectedCost: this.board.getCostFor(x, y, state),
                    // });
                    State.projectedCost = this.board.getCostFor(x, y);
                    State.needsUpdate = true;
                });

                // Mouse out, reset the projected cost to 0
                tile.el.addEventListener("mouseout", () => {
                    const x = tile.pos.x;
                    const y = tile.pos.y;

                    // TODO: GROSS
                    tile.el.borderContainer.dataset.position = "0 0.2 0";

                    State.projectedCost = 0;
                    State.needsUpdate = true;
                });

                // Tap on a tile.
                // State machine based on what is tapped and what is the state
                tile.el.addEventListener("touchend", () => {
                    const x = tile.pos.x;
                    const y = tile.pos.y;

                    const targetEntity = this.board.getEntityAt(x, y);
                    const cost = this.board.getCostFor(x, y);

                    if (this.isDebug) console.log("Tapped entity", targetEntity);

                    if (State.isPlayerTurn) {
                        if (!targetEntity) {
                            // there is nothing on the tile.
                            if (cost <= State.action) {
                                State.action -= cost;
                                SoundController.play('chessSound');
                                this.board.movePlayer(x, y);
                            } else {
                                SoundController.play('nopeSound');
                            }

                        } else {
                            // there is an entity on the tile
                            if (cost <= State.action &&
                                this.board.distances[x][y] <= State.action &&
                                targetEntity.type == "chest"
                            ) {
                                targetEntity.el.open();
                                setTimeout(() => {
                                    this.board.dropWeaponAt(x, y);
                                }, 500);
                                setTimeout(() => {
                                    this.container.removeChild(targetEntity.el);
                                    this.board.removeEntityAt(x, y);
                                }, 1500);
                            }

                            // enemies
                            if (targetEntity.type == "enemy") {
                                const ppos = this.board.playerPos;
                                const dist = distBetween(x, y, ppos.x, ppos.y);
                                const type = State.selectedWeapon;
                                let range = this.getWeaponRange();

                                console.log('enemy', ppos, dist, type, range)

                                if (dist <= range && cost <= State.action) {
                                    State.action -= cost;
                                    this.attack(targetEntity, x, y);
                                } else {
                                    SoundController.play('nopeSound');
                                }
                            }
                        }

                        // Automatically end the turn when the player
                        // runs out of action points
                        if (this.autoEndTurn && State.action == 0) {
                            setTimeout(() => {
                                this.endTurn();
                            }, 800);
                            // this.endTurn();
                        }

                        // this.needsUpdate = true;
                        State.needsUpdate = true;
                        // this.state.components.set('state', state);
                    }
                });
            })
        })

        // this.state.components.set('state', {
        //     isPlayerTurn: true,
        // });

        State.isPlayerTurn = true;

        State.level++;
        this.gameIsStarted = true;
        // this.needsUpdate = true;
        State.needsUpdate = true;
    }

    getWeaponRange() {
        // const state = this.state.components.get('state');

        if (State.selectedWeapon == 'melee') {
            return State.meleeRange;
        } else if (State.selectedWeapon == 'range') {
            return State.rangeRange;
        } else {
            console.error('its not a valid selected weapon');
        }
    }

    getWeaponDamage() {
        // const state = this.state.components.get('state');

        if (State.selectedWeapon == 'melee') {
            return State.meleeAttack;
        } else if (State.selectedWeapon == 'range') {
            return State.rangeAttack;
        } else {
            console.error('its not a valid selected weapon');
        }
    }

    endTurn() {
        // const state = this.state.components.get('state');

        // let range = state.range;
        if (State.range > 1) {
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
            State.range--;
            this.opponentTurn();
        } else {

            // Dot's battery is depleted
            this.endGame();
        }

        State.action = State.maxAction;
        State.isPlayerTurn = true;
        State.needsUpdate = true;
        SoundController.play('analogSound');

        if (this.isDebug) console.log("Combat queue", this.combatQueue);
    }

    endGame() {
        console.log('you ded');

        // State.level = 0;
        this.cycle++;
        Object.assign(State, this.defaultState);

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
            // this.state.components.set('state', {
            //     isPlayerTurn: true,
            //     // needsUpdate: true
            // })
            State.isPlayerTurn = true;
        }

        // this.needsUpdate = true;
        State.needsUpdate = true;
    }

    attackPlayer(attacker, r, c) {
        // const state = this.state.components.get('state');
        const playerPos = this.board.playerPos;

        // TODO: move the sound where the attacker is
        // this.soundController.moveSound()
        SoundController.play('clashSound');

        this.board.projectileTo({
            x: r,
            y: c
        }, playerPos);

        this.board.startQuakeAt(playerPos.x, playerPos.y, 1, 10, 0.5);

        // const health =
        State.health -= attacker.attack;
        // this.state.components.set('state', {
        //     health: health,
        // });
        State.needsUpdate = true;

        this.board.showDamageAt(playerPos.x, playerPos.y, attacker.attack);

        if (State.health <= 0) {
            this.endGame();
        }
    }

    attack(entity, r, c) {
        // const state = this.state.components.get('state');

        if (this.isDebug) console.log(entity);

        this.board.projectileTo(this.board.playerPos, {
            x: r,
            y: c
        });

        this.board.startQuakeAt(r, c, 1, 10, 0.5);

        // TODO: move the sound where the player is
        // this.soundController.moveSoundPosition('swooshSound', );
        SoundController.play('swooshSound');

        // console.log(state.selectedWeapon)
        let damage;
        if (State.selectedWeapon == "melee") {
            damage = State.meleeAttack;
        } else {
            damage = State.rangeAttack;
        }

        entity.hp -= damage;
        this.board.showDamageAt(r, c, damage);

        if (entity.hp <= 0) {
            this.container.removeChild(entity.el);
            this.board.dropLootAt(r, c);
            this.needsUpdate = true;
            State.needsUpdate = true;
        }
    }

    projectRoom() {
        // const state = this.state.components.get('state');

        this.board.calcDistFromPlayer();
        this.board.updateFloor(this.timer);
        // this.board.setAttackRange(state, this.timer);
        this.board.projectEverything(this.timer);

        if (State.action == 0) {
            this.endTurnButton.style.backgroundColor = Colors.hover;
        } else {
            this.endTurnButton.style.backgroundColor = Colors.health;
        }
    }

    update(deltaTime, frame) {
        if (this.gameIsStarted) {
            this.timer += deltaTime;
            const pos = this.board.playerPos;

            if (State.needsUpdate || this.board.isQuake) {

                if (this.isDebug) {
                    console.log('updated at', this.timer);
                }

                this.interface.update(this.timer);

                this.projectRoom();
                const offX = (this.board.colCount / 2 + 0.5) * this.scale;

                // TODO: put back the UI position
                this.interface.dataset.position = `-${offX} ${this.tableOffset} 0`;

                this.needsUpdate = false;
                State.needsUpdate = false;

                // If the player is at the door with the key
                if (this.board.lootMap[pos.x][pos.y].type == 'door' &&
                    State.hasKey) {

                    State.isPlayerTurn = false;
                    State.action = State.maxAction;
                    State.hasKey = false;

                    // TODO: introduce a pause here when we have the system back
                    this.initialize();
                }

                // Dot is in the battery room
                if (this.board.biome.name == 'battery') {
                    // the gauge that fills at it charges
                    const gaugeEl = this.board.entityMap[4][2].el;

                    // the charging pad on the floor,
                    // that Dot stands on.
                    const padEl = this.board.tileMap[4][1].el;

                    // Dot stands on the pad
                    if (pos.x == 4 && pos.y == 1) {
                        if (State.range < State.maxRange) {
                            // Dot is charging
                            State.range += 0.1;
                            gaugeEl.updateLevel(State.range / State.maxRange);
                            this.needsUpdate = true;
                            State.needsUpdate = true;
                        } else {
                            // Dot is charged
                            State.range = State.maxRange;
                            this.needsUpdate = false;
                            State.needsUpdate = false;
                        }
                    } else {
                        gaugeEl.updateLevel(0);

                    }
                }
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

        this.interface.style.scale = this.scale;
        this.interface.dataset.rotation = `0 0 30`

        this.endTurnButton.className = 'end-turn';
        this.endTurnButton.innerText = "End";
        this.endTurnButton.dataset.position = "0 0.08 2";
        this.endTurnButton.dataset.rotation = "270 0 270";
        this.interface.appendChild(this.endTurnButton);

        this.endTurnButton.addEventListener('click', () => {
            this.endTurn();
        });

        this.initialize();
    }
}

// To be read with Mario's voice
const saGo = new GameSystem();
