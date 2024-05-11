class GameSystem extends MRSystem {
    constructor() {
        super()
        this.gameIsStarted = false;
        this.cycle = localStorage.getItem('maxCycle') ?? 0;;

        // container to store board object references
        this.container = document.createElement("mr-div");
        this.dmgTile = document.querySelector("#damage-tile");

        // UI elements
        this.endTurnButton = document.querySelector("#end-turn-button");
        this.startWall = document.querySelector("#start-wall");
        this.disposedRobotsLabel = document.querySelector("#disposed-robots");
        this.farthestRoomLabel = document.querySelector("#farthest-room");

        this.hpProgress = document.querySelector('#hp-progress');
        this.hpLabel = document.querySelector('#hp-label');

        this.rangeProgress = document.querySelector('#range-progress');
        this.rangeLabel = document.querySelector('#range-label');

        this.uiActions = document.querySelector('#ui-actions');
        this.actionLabel = document.querySelector('#action-label');

        this.uiMelee = document.querySelector('#ui-melee');
        this.uiRange = document.querySelector('#ui-range');

        this.ui = document.querySelector("#ui");

        Object.assign(State, {
            maxHealth: 20,
            maxRange: 30,
            maxAction: 4,
            hoverMelee: false,
            hoverRange: false,
            needsUpdate: false
        })

        // Debug event listeners
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
                State.needsUpdate = true;
                console.log('triggered an update')
            }

            // D for Debug
            if (event.key === "d") {
                event.preventDefault();
                State.isDebug = !State.isDebug;
                State.needsUpdate = true;
                console.log('isDebug is now ', State.isDebug);
            }

            // W for Weapon
            if (event.key === 'w') {
                event.preventDefault();
                this.board.dropWeaponAt(State.ppos.x, State.ppos.y);
                State.needsUpdate = true;
            }

            // L for Loot
            if (event.key === 'l') {
                event.preventDefault();

                const loot = document.createElement("mr-loot");
                this.container.appendChild(loot);

                const pos = this.board.addToLootMap({
                    el: loot,
                    type: 'loot',
                });
                console.log('Weapon dropped at ', pos);
                State.needsUpdate = true;
            }

            // C for Chest
            if (event.key === 'c') {
                event.preventDefault();
                const chest = document.createElement("mr-chest");
                this.container.appendChild(chest);
                this.board.addToMap({
                    el: chest,
                    type: 'chest',
                });
                State.needsUpdate = true;
            }

            // H for Health reset
            if (event.key === 'h') {
                event.preventDefault();
                Object.assign(State, DEFAULT_STATE);
                State.needsUpdate = true;
            }

            // P for projectiles
            if (event.key === 'p') {
                event.preventDefault();
                if(Math.random() < 0.5) {
                    this.board.projectileTo(State.ppos, State.dpos, 'arrow');
                } else {
                    this.board.projectileTo(State.ppos, State.dpos, 'stone');
                }
                State.needsUpdate = true;
            }

            // O for Open door
            if (event.key === 'o') {
                event.preventDefault();
                State.hasKey = true;
                // this.board.openDoor();
                this.board.doorEl.open();
            }

            // Q for Quake
            if (event.key === 'q') {
                event.preventDefault();
                this.board.startQuakeAt(State.ppos.x, State.ppos.y, 4, 15, 2);
            }
            if (event.key === 'a') {
                event.preventDefault();
                this.board.startQuakeAt(State.ppos.x, State.ppos.y, 1.2, 10, 0.5);
            }

            // Z for whatever (to reuse)
            if (event.key === "z") {
                event.preventDefault();
                const player = this.board.entityMap[State.ppos.x][State.ppos.y];
                player.el.playCombatAnimation();
            }

            // N for eNemy
            if (event.key === 'n') {
                event.preventDefault();

                const rand = Math.floor(Math.random() * ENEMY_SUBTYPES.length);
                const enemy = {
                    el: document.createElement("mr-enemy"),
                    type: 'enemy',
                    subtype: ENEMY_SUBTYPES[rand],
                    hp: 1,
                    attack: 0
                };

                enemy.el.dataset.subtype = enemy.subtype;
                this.container.appendChild(enemy.el);
                this.board.addToMap(enemy);
                State.needsUpdate = true;
            }

            // T for Toggle isInteractive
            if (event.key === 't') {
                event.preventDefault();

                if (State.isInteractive) {
                    State.isInteractive = false;
                    State.staticUntil = this.timer + 2;
                } else {
                    State.isInteractive = true;
                    State.staticUntil = 0;
                }

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
            params = generateSpawnRoomParams();

        } else if (
            // TODO: need an infinite, procedural way to interleave
            // battery rooms with increased difficulty
            State.level == 3 ||
            State.level == 8 ||
            State.level == 13 ||
            State.level == 21 ||
            State.level == 34 ||
            State.level == 55) {

            params = generateBatteryRoomParams();
            State.hasKey = true;

        } else {
            params = {};
        }

        this.board = new Board(this.container, params);
        Sounds.background(this.board.biome.name);

        // the tile elements (the floor) own all the events handling
        this.board.tileMap.forEach(row => {
            row.forEach(tile => {

                // Mouse over tiles
                // Used to update the project cost of an action while hovering
                tile.el.addEventListener("mouseover", () => {
                    if (State.isInteractive) {
                        const x = tile.pos.x;
                        const y = tile.pos.y;

                        tile.el.sinkTile();
                        State.projectedCost = this.board.getCostFor(x, y);
                        State.needsUpdate = true;
                    }
                });

                // Mouse out, reset the projected cost to 0
                tile.el.addEventListener("mouseout", () => {
                    if (State.isInteractive) {
                        const x = tile.pos.x;
                        const y = tile.pos.y;

                        tile.el.raiseTile();
                        State.projectedCost = 0;
                        State.needsUpdate = true;
                    }
                });

                // Tap on a tile.
                // State machine based on what is tapped and what is the state
                tile.el.addEventListener("touchend", () => {
                    const x = tile.pos.x;
                    const y = tile.pos.y;

                    const entity = this.board.getEntityAt(x, y);
                    const cost = this.board.getCostFor(x, y);

                    if (State.isDebug) console.log("Tapped entity", entity);

                    if (State.isPlayerTurn && State.isInteractive) {
                        if (!entity) {
                            // there is nothing on the tile.
                            if (cost <= State.action) {
                                State.action -= cost;
                                const steps = this.board.movePlayer(x, y);
                                State.isInteractive = false;
                                State.staticUntil = this.timer + steps * 0.4;
                            } else {
                                Sounds.play('nopeSound');
                            }

                        } else {
                            // there is an entity on the tile
                            if (entity.type == "chest" &&
                                cost <= State.action &&
                                this.board.distances[x][y] <= State.action) {
                                entity.el.open();

                                // TODO: improve the chest opening animation
                                setTimeout(() => {
                                    this.board.dropWeaponAt(x, y);
                                    State.needsUpdate = true;
                                }, 500);

                                setTimeout(() => {
                                    this.container.removeChild(entity.el);
                                    this.board.removeEntityAt(x, y);
                                    State.needsUpdate = true;
                                }, 600);

                                State.isInteractive = false;
                                State.staticUntil = this.timer + 2;
                            }

                            // enemies
                            if (entity.type == "enemy") {
                                const dist = distBetween(x, y, State.ppos.x, State.ppos.y);
                                const weapon = State.weapons[State.selectedWeaponID];
                                const range = weapon.range;

                                if (dist <= range && cost <= State.action) {
                                    console.log(cost);
                                    State.action -= cost;
                                    this.attack(entity, x, y);
                                } else {
                                    Sounds.play('nopeSound');
                                }
                            }
                        }

                        // Automatically end the turn when the player
                        // runs out of action points
                        if (this.autoEndTurn && State.action == 0) {
                            setTimeout(() => {
                                this.endTurn();
                            }, 800);
                        }

                        State.needsUpdate = true;
                    }
                });
            })
        })

        State.level++;
        State.isPlayerTurn = true;
        State.staticUntil = this.timer;
        State.needsUpdate = true;

        this.gameIsStarted = true;

    }

    endTurn() {
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
            this.opponentTurn();

            // Dot still has battery left
            State.range--;
        } else {

            // Dot's battery is depleted
            this.endGame();
        }

        State.action = State.maxAction;
        State.isPlayerTurn = true;
        State.needsUpdate = true;
        Sounds.play('analogSound');

        if (State.isDebug) console.log("Combat queue", this.combatQueue);
    }

    endGame() {
        console.log('you ded');

        this.cycle++;
        Object.assign(State, DEFAULT_STATE);

        // TODO: display level and cycle count in the UI
        // TODO: store max cycle level in the localStorage?
        this.initialize();
    }

    opponentTurn() {
        // the combat is a queue
        // each enemy takes a turn

        if (this.combatQueue.length > 0) {
            State.isInteractive = false;
            State.staticUntil = this.timer + 1;

            const entry = this.combatQueue.pop();

            // console.log('entry',entry);
            const entity = entry.entity;
            const subtype = entity.subtype;
            const r = entry.r;
            const c = entry.c;
            const x = State.ppos.x;
            const y = State.ppos.y;

            let deltaX;
            let deltaY;

            // Movements for different enemy types
            if (subtype == 'aimless') {
                //  this unit wanders randomly
                let Moves = [];
                let PossibleMoves = [
                    [-1, 0],
                    [1, 0],
                    [0, -1],
                    [0, 1]
                ]

                PossibleMoves.forEach((move, i) => {
                    const x = r + move[0];
                    const y = c + move[1];
                    const cell = this.board.getEntityAt(x, y);
                    if (!cell && cell != "offmap") {
                        Moves.push(move);
                    }
                });

                if (Moves.length > 0) {
                    const rand = Math.floor(Math.random() * Moves.length);
                    const next = Moves[rand];

                    deltaX = next[0];
                    deltaY = next[1];

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

                deltaX = r - nextMove[0];
                deltaY = c - nextMove[1];

                this.board.moveEntity(r, c, nextMove[0], nextMove[1]);
            }

            this.board.orientsTowards(entity.el, deltaX, deltaY);

            // after moving, attack if in range
            // TODO: different attacks based on enemy subtype
            if (distBetween(r, c, x, y) <= 2) {
                setTimeout(() => {
                    this.attackPlayer(entity, r, c);
                }, 300);
            }

            if (this.combatQueue.length > 0) {
                setTimeout(() => {
                    this.opponentTurn();
                }, 500)
            }

        } else {

            State.isInteractive = false;
            State.staticUntil = this.timer + 0.3;
            State.isPlayerTurn = true;
        }

        State.needsUpdate = true;
    }

    attackPlayer(attacker, r, c) {
        switch (attacker.subtype) {
            case "aimless":
                attacker.el.playSwoosh();
                break;
            case 'homing':
                attacker.el.playBowRelease();
                break;
            case 'static':
                attacker.el.playBowRelease();
                this.board.projectileTo({
                    x: r,
                    y: c
                }, State.ppos, 'stone');
                break;
            default:
                console.error('this enemy type is not handled')
        }

        // orient the player
        const deltaX = r - State.ppos.x;
        const deltaY = c - State.ppos.y;
        this.board.orientsTowards(attacker.el, deltaX, deltaY);

        this.board.showDamageAt(State.ppos.x, State.ppos.y, attacker.attack, COLORS.hover);
        this.board.startQuakeAt(State.ppos.x, State.ppos.y, 1, 10, 0.5);

        State.health -= attacker.attack;
        State.needsUpdate = true;

        if (State.health <= 0) {
            this.endGame();
        }
    }

    attack(entity, r, c) {
        if (State.isDebug) console.log(entity);

        State.isInteractive = false;
        State.staticUntil = this.timer + 1;

        const player = this.board.entityMap[State.ppos.x][State.ppos.y];
        const weapon = State.weapons[State.selectedWeaponID];

        // orient the player
        const deltaX = State.ppos.x - r;
        const deltaY = State.ppos.y - c;
        this.board.orientsTowards(this.board.playerEl, deltaX, deltaY);

        if (State.selectedWeaponID == 0) { // melee
            player.el.playSwoosh();
            player.el.playCombatAnimation();
        } else { // range
            this.board.projectileTo(State.ppos, {
                x: r,
                y: c
            }, State.weapons[1].ammoType);
            player.el.playBowRelease();
        }

        let damage;
        if (Math.random() < weapon.critChances) {
            damage = weapon.attack * weapon.critMultiplier;
            entity.el.playCrit();
            this.board.startQuakeAt(r, c, 4, 10, 2);
            this.board.showDamageAt(r, c, damage, COLORS.health);
        } else {
            damage = weapon.attack;
            this.board.startQuakeAt(r, c, 1.2, 10, 0.5);
            this.board.showDamageAt(r, c, damage, COLORS.hover);
        }

        entity.hp -= damage;
        entity.el.playPoof();

        if (entity.hp <= 0) {
            setTimeout(() => {
                this.container.removeChild(entity.el);
                this.board.removeEntityAt(r, c);
                this.board.dropLootAt(r, c);
                State.needsUpdate = true;
            }, 500)
        }
    }

    projectRoom() {
        this.board.updateDistances();
        this.board.updateFloor(this.timer);
        this.board.projectEverything(this.timer);

        // End turn button
        if (State.isInteractive) {
            if (State.action == 0) {
                this.endTurnButton.style.backgroundColor = COLORS.health;
            } else {
                this.endTurnButton.style.backgroundColor = COLORS.white;
            }
        } else {
            this.endTurnButton.style.backgroundColor = COLORS.neutral;
        }
    }

    update(deltaTime, frame) {
        if (this.gameIsStarted) {
            this.timer += deltaTime;

            if (State.needsUpdate || this.board.isQuake) {

                if (State.isDebug) console.log('updated at', this.timer);
                this.projectRoom();

                // position the floating damage tile at its position
                const dmgX = (this.dmgTile.pos.y - this.board.colCount / 2 + 0.5) * this.scale;
                const dmgY = 0.2;
                const dmgZ = (this.dmgTile.pos.x - this.board.rowCount / 2 + 0.5) * this.scale;
                this.dmgTile.dataset.position = `${dmgX} ${dmgY} ${dmgZ}`;

                // position the wall and interface alongside the board
                const offX = (this.board.colCount / 2 + 0.5) * this.scale;
                this.ui.dataset.position = `-${offX} ${this.tableOffset} 0`;
                this.startWall.dataset.position = `${offX} ${this.tableOffset} 0`;

                // The spawn wall
                const maxRoom = localStorage.getItem('maxRoom') ?? State.level;

                // Show and update the spawn wall if the first room
                if (State.level == 1) {
                    this.startWall.style.visibility = 'visible';
                    this.disposedRobotsLabel.innerText = `Disposed robots: ${this.cycle}`;
                    this.farthestRoomLabel.innerText = `Farthest room: ${maxRoom}`;
                    if (State.level > parseInt(maxRoom)) {
                        localStorage.setItem('maxRoom', State.level);
                    }
                } else {
                    this.startWall.style.visibility = 'hidden';
                }

                // UI health progress bar
                // TODO: should be a custom element like acton balls
                const healthRatio = State.health / State.maxHealth;
                this.hpProgress.object3D.traverse(object => {
                    if (object.isMesh && object.morphTargetInfluences) {
                        object.morphTargetInfluences[0] = healthRatio;
                    }
                })

                // UI range progress bar
                const rangeRatio = State.range / State.maxRange;
                this.rangeProgress.object3D.traverse(object => {
                    if (object.isMesh && object.morphTargetInfluences) {
                        object.morphTargetInfluences[0] = rangeRatio;
                    }
                })

                // Update all the UI
                this.hpLabel.innerText = "⊕ " + Math.ceil(State.health);
                this.rangeLabel.innerText = "⚡ " + Math.ceil(State.range);
                this.actionLabel.innerText = "● 0" + State.action;
                this.uiMelee.update(this.timer);
                this.uiRange.update(this.timer);
                this.uiActions.update(this.timer);
                State.needsUpdate = false;

                // If the player is at the door with the key
                if (this.board.lootMap[State.ppos.x][State.ppos.y].type == 'door' &&
                    State.hasKey) {

                    State.isPlayerTurn = true;
                    State.action = State.maxAction;
                    State.hasKey = false;

                    // TODO: introduce a pause here when staticUntil is back
                    State.isInteractive = false;
                    State.staticUntil = this.timer + 0.5;
                    setTimeout(() => {
                        this.initialize();
                    }, 500)
                }

                // Dot is in the battery room
                if (this.board.biome.name == 'battery') {
                    // the gauge that fills at it charges
                    const gaugeEl = this.board.entityMap[4][2].el;

                    // the charging pad on the floor,
                    // that Dot stands on.
                    const padEl = this.board.tileMap[4][1].el;

                    // Dot stands on the pad
                    if (State.ppos.x == 4 && State.ppos.y == 1) {
                        if (State.range < State.maxRange) {
                            // Dot is charging
                            State.range += 0.1;
                            gaugeEl.updateLevel(State.range / State.maxRange);
                            State.needsUpdate = true;
                        } else {
                            // Dot is charged
                            State.range = State.maxRange;
                            State.needsUpdate = false;
                        }
                    } else {
                        gaugeEl.updateLevel(0);

                    }
                }

                // Dot is in the spawn room
                if (this.board.biome.name == 'spawn') {

                    // the charging pad on the floor,
                    // that Dot stands on.
                    const padEl = this.board.tileMap[1][1].el;

                    // Dot stands on the pad
                    if (State.ppos.x == 1 && State.ppos.y == 1) {
                        if (State.range < State.maxRange) {
                            // Dot is charging
                            State.range += 0.1;

                        } else {
                            // Dot is charged
                            State.range = State.maxRange;
                            // State.needsUpdate = false;
                        }
                        State.needsUpdate = true;
                    }
                }
            }

            // Flip back isInteractive when the timer reaches staticUntil
            if (!State.isInteractive && State.staticUntil < this.timer) {
                State.needsUpdate = true;
                State.isInteractive = true;
                if (State.isDebug) console.log("isInteractive is true again");
            }

            this.board.projectAnimatedEntities(this.timer);
        }
    }

    attachedComponent(entity) {
        this.root = entity;
        this.root.appendChild(this.container);

        // Game settings
        this.settings = this.root.components.get('game');
        this.autoEndTurn = this.settings.autoEndTurn ?? false;
        this.tableOffset = this.settings.tableOffset ?? 0;

        // Scale from CSS
        this.scale = mrjsUtils.css.getVarFromRoot('--scale') ?? 0.05;

        this.container.style.scale = this.scale;
        this.container.dataset.position = `0 ${this.tableOffset} 0`;

        this.dmgTile.style.scale = this.scale;

        this.endTurnButton.addEventListener('click', () => {
            if (State.isInteractive) {
                this.endTurn();
            }
        });

        this.initialize();
    }
}

// To be read with Mario's voice
let saGo = new GameSystem();
